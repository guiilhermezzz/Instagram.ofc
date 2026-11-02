import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import type { Post } from "../data";
import { supabase } from "../lib/supabase";

const maxFileSize = 50 * 1024 * 1024;
const isMissingPosterColumn = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const details = error as { code?: string; message?: string };
  return (
    details.code === "PGRST204" ||
    (details.message?.includes("poster_url") === true &&
      /column|schema cache|does not exist/i.test(details.message))
  );
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = error.message;
    if (typeof message === "string" && message) return message;
  }
  return typeof error === "string" ? error : "Falha inesperada.";
};

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const createVideoThumbnail = (file: File) =>
  new Promise<Blob>((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(objectUrl);
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Não foi possível ler o vídeo para criar a miniatura."));
    };
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(0.1, video.duration / 2);
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context || canvas.width === 0 || canvas.height === 0) {
        cleanup();
        reject(new Error("Não foi possível criar a miniatura deste vídeo."));
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          cleanup();
          if (blob) resolve(blob);
          else reject(new Error("Não foi possível gerar a miniatura do vídeo."));
        },
        "image/jpeg",
        0.82
      );
    };
    video.src = objectUrl;
  });

interface Props {
  username: string;
  onClose: () => void;
  onCreated: (post: Post, warning?: string) => void;
}

export default function CreatePostModal({
  username,
  onClose,
  onCreated,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const publish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || loading) return;

    if (!allowedTypes.has(file.type)) {
      setMessage("Escolha uma imagem JPG, PNG ou WebP, ou vídeo MP4, WebM ou MOV.");
      return;
    }
    if (file.size > maxFileSize) {
      setMessage("O arquivo deve ter no máximo 50 MB.");
      return;
    }
    if (!supabase) {
      setMessage("Configure o Supabase para publicar.");
      return;
    }

    setLoading(true);
    setMessage("");
    let uploadedPath: string | null = null;
    let posterPath: string | null = null;
    let warning = "";
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;
      const user = userData.user;
      if (!user) {
        setMessage("Entre na sua conta para publicar.");
        return;
      }

      const usernameMetadata = user.user_metadata?.username;
      const fullNameMetadata = user.user_metadata?.full_name;
      const profileUsername =
        typeof usernameMetadata === "string" && usernameMetadata.trim()
          ? usernameMetadata.trim()
          : `user-${user.id.slice(0, 8)}`;
      const profileFullName =
        typeof fullNameMetadata === "string" && fullNameMetadata.trim()
          ? fullNameMetadata.trim()
          : profileUsername;

      const { data: existingProfile, error: profileLookupError } =
        await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();
      if (profileLookupError) {
        throw new Error(
          `Não foi possível verificar seu perfil: ${profileLookupError.message}`
        );
      }

      if (!existingProfile) {
        const { error: profileInsertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            username: profileUsername,
            full_name: profileFullName,
          });
        if (profileInsertError) {
          const { data: profileAfterInsert, error: retryLookupError } =
            await supabase
              .from("profiles")
              .select("id")
              .eq("id", user.id)
              .maybeSingle();
          if (retryLookupError || !profileAfterInsert) {
            throw new Error(
              `Não foi possível preparar seu perfil para publicar: ${profileInsertError.message}`
            );
          }
        }
      }

      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!extension || !/^(jpe?g|png|webp|mp4|webm|mov)$/.test(extension)) {
        setMessage("A extensão do arquivo não é suportada.");
        return;
      }

      uploadedPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const isVideo = file.type.startsWith("video/");
      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(uploadedPath, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const mediaUrl = supabase.storage
        .from("posts")
        .getPublicUrl(uploadedPath).data.publicUrl;
      let posterUrl: string | null = null;
      if (isVideo) {
        try {
          const thumbnail = await createVideoThumbnail(file);
          posterPath = `${user.id}/${crypto.randomUUID()}-poster.jpg`;
          const { error: posterUploadError } = await supabase.storage
            .from("posts")
            .upload(posterPath, thumbnail, {
              contentType: "image/jpeg",
              upsert: false,
            });
          if (posterUploadError) throw posterUploadError;
          posterUrl = supabase.storage.from("posts").getPublicUrl(posterPath)
            .data.publicUrl;
        } catch (thumbnailError) {
          posterPath = null;
          posterUrl = null;
          warning = `A publicação será feita sem miniatura: ${getErrorMessage(thumbnailError)}`;
        }
      }

      const postValues = {
        user_id: user.id,
        media_url: mediaUrl,
        media_type: isVideo ? "video" : "image",
        caption: caption.trim(),
      };
      let { data, error: insertError } = await supabase
        .from("posts")
        .insert({
          ...postValues,
          ...(posterUrl ? { poster_url: posterUrl } : {}),
        })
        .select("id, created_at")
        .single();

      if (insertError && posterUrl && isMissingPosterColumn(insertError)) {
        const retry = await supabase
          .from("posts")
          .insert(postValues)
          .select("id, created_at")
          .single();
        data = retry.data;
        insertError = retry.error;
        if (!insertError) {
          warning =
            "A publicação foi salva, mas para manter a miniatura após recarregar, execute o schema atualizado do Supabase.";
        }
      }

      if (insertError) throw insertError;
      if (!data) throw new Error("O Supabase não retornou os dados da publicação.");

      const createdAt = data.created_at;
      onCreated(
        {
          id: data.id,
          image: mediaUrl,
          ...(isVideo ? { videoUrl: mediaUrl } : {}),
          ...(posterUrl ? { posterUrl } : {}),
          authorUsername: username || profileUsername,
          likes: 0,
          comments: [],
          caption: caption.trim(),
          time: "agora",
          type: isVideo ? "reel" : "photo",
          createdAt,
        },
        warning || undefined
      );
    } catch (error) {
      const uploadedPaths = [uploadedPath, posterPath].filter(
        (path): path is string => path !== null
      );
      let cleanupMessage = "";
      if (uploadedPaths.length > 0) {
        try {
          const { error: cleanupError } = await supabase.storage
            .from("posts")
            .remove(uploadedPaths);
          if (cleanupError) {
            cleanupMessage = ` O arquivo enviado também não pôde ser removido: ${cleanupError.message}`;
          }
        } catch (cleanupError) {
          cleanupMessage = ` O arquivo enviado também não pôde ser removido: ${
            cleanupError instanceof Error
              ? cleanupError.message
              : "falha inesperada."
          }`;
        }
      }
      setMessage(
        `Não foi possível publicar: ${getErrorMessage(error)}.${cleanupMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-black/70 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
        className="w-full max-w-[500px] overflow-hidden rounded-xl border border-ig-border bg-[#1a1a1a]"
      >
        <header className="flex items-center justify-between border-b border-ig-border px-4 py-3">
          <span className="w-6" />
          <h2 id="create-post-title" className="font-semibold">
            Criar publicação
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar"
            className="disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={publish} className="space-y-4 p-5">
          <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[#555] bg-black/30 p-5 text-center hover:bg-black/50">
            <ImagePlus className="h-10 w-10 text-ig-gray" />
            <span className="text-sm text-ig-gray">
              {file
                ? `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`
                : "Selecione uma foto ou vídeo para publicar"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setMessage("");
              }}
              className="sr-only"
            />
          </label>

          {file && (
            <div className="max-h-64 overflow-hidden rounded-lg bg-black">
              {file.type.startsWith("video/") ? (
                <video
                  src={previewUrl}
                  controls
                  className="max-h-64 w-full object-contain"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Prévia da publicação"
                  className="max-h-64 w-full object-contain"
                />
              )}
            </div>
          )}

          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength={2200}
            rows={3}
            placeholder="Escreva uma legenda..."
            aria-label="Legenda da publicação"
            className="w-full resize-y rounded-lg border border-ig-border bg-black p-3 text-sm outline-none placeholder:text-ig-gray focus:border-[#555]"
          />

          {message && (
            <p className="text-sm text-red-400" role="alert">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full rounded-lg bg-ig-blue py-2 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "Publicando..." : "Compartilhar"}
          </button>
        </form>
      </section>
    </div>
  );
}
