import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import type { PublicProfile } from "./ProfileSearch";
import { supabase } from "../lib/supabase";

const maxAvatarSize = 5 * 1024 * 1024;
const avatarExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const getStoredAvatarPath = (avatarUrl: string) => {
  if (!supabase) return null;

  try {
    const publicUrl = new URL(
      supabase.storage.from("avatars").getPublicUrl("").data.publicUrl
    );
    const imageUrl = new URL(avatarUrl);
    const pathPrefix = `${publicUrl.pathname.replace(/\/+$/, "")}/`;
    if (
      imageUrl.origin !== publicUrl.origin ||
      !imageUrl.pathname.startsWith(pathPrefix)
    ) {
      return null;
    }
    return decodeURIComponent(imageUrl.pathname.slice(pathPrefix.length));
  } catch {
    return null;
  }
};

interface Props {
  profile: PublicProfile;
  email: string;
  onClose: () => void;
  onSaved: (profile: PublicProfile, email: string) => void;
}

export default function EditProfileModal({
  profile,
  email,
  onClose,
  onSaved,
}: Props) {
  const [username, setUsername] = useState(profile.username);
  const [fullName, setFullName] = useState(profile.full_name);
  const [nextEmail, setNextEmail] = useState(email);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [gender, setGender] = useState(profile.gender ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || loading) return;

    setLoading(true);
    setMessage("");
    let uploadedPath: string | null = null;
    let profileSaved = false;
    try {
      let avatar = profile.avatar;
      if (avatarFile) {
        const extension = avatarExtensions[avatarFile.type];
        if (!extension) {
          throw new Error("Escolha uma imagem JPG, PNG ou WebP.");
        }
        if (avatarFile.size > maxAvatarSize) {
          throw new Error("A foto de perfil deve ter no máximo 5 MB.");
        }

        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData.user || userData.user.id !== profile.id) {
          throw new Error("Entre na sua conta para alterar a foto de perfil.");
        }

        const path = `${userData.user.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, {
            contentType: avatarFile.type,
            upsert: false,
          });
        if (uploadError) throw uploadError;

        uploadedPath = path;
        avatar = supabase.storage
          .from("avatars")
          .getPublicUrl(path).data.publicUrl;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          username: username.trim(),
          full_name: fullName.trim(),
          bio: bio.trim(),
          gender,
          website: website.trim(),
          avatar_url: avatar ?? null,
        })
        .eq("id", profile.id);

      if (profileError) throw profileError;
      profileSaved = true;

      let updatedEmail = email;
      let emailNotice = "";
      if (nextEmail.trim().toLowerCase() !== email.toLowerCase()) {
        const { data, error: emailError } = await supabase.auth.updateUser({
          email: nextEmail.trim(),
        });
        if (emailError) {
          emailNotice = ` O perfil foi salvo, mas não foi possível atualizar o email: ${emailError.message}`;
        } else {
          updatedEmail = data.user.email ?? email;
          emailNotice =
            " O Supabase pode enviar um email de confirmação antes de aplicar a alteração.";
        }
      }

      onSaved(
        {
          ...profile,
          username: username.trim(),
          full_name: fullName.trim(),
          bio: bio.trim(),
          gender,
          website: website.trim(),
          avatar,
        },
        updatedEmail
      );
      setMessage(`Perfil salvo.${emailNotice}`);

      const oldAvatarPath = profile.avatar
        ? getStoredAvatarPath(profile.avatar)
        : null;
      if (uploadedPath && oldAvatarPath && oldAvatarPath !== uploadedPath) {
        try {
          const { error: removeError } = await supabase.storage
            .from("avatars")
            .remove([oldAvatarPath]);
          if (removeError) throw removeError;
        } catch (removeError) {
          const details =
            removeError instanceof Error
              ? removeError.message
              : "Falha inesperada.";
          setMessage(
            `Perfil salvo, mas não foi possível remover a foto anterior: ${details}`
          );
        }
      }
    } catch (error) {
      let errorMessage =
        error instanceof Error
          ? `Não foi possível salvar o perfil: ${error.message}`
          : "Falha inesperada ao salvar o perfil.";
      if (uploadedPath && !profileSaved && supabase) {
        try {
          const { error: cleanupError } = await supabase.storage
            .from("avatars")
            .remove([uploadedPath]);
          if (cleanupError) throw cleanupError;
        } catch (cleanupError) {
          const details =
            cleanupError instanceof Error
              ? cleanupError.message
              : "Falha inesperada.";
          errorMessage += ` Também não foi possível remover o arquivo enviado: ${details}`;
        }
      }
      setMessage(errorMessage);
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
        aria-labelledby="edit-profile-title"
        className="max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-xl border border-ig-border bg-[#1a1a1a]"
      >
        <header className="sticky top-0 flex items-center justify-between border-b border-ig-border bg-[#1a1a1a] px-4 py-3">
          <span className="w-6" />
          <h2 id="edit-profile-title" className="font-semibold">
            Editar perfil
          </h2>
          <button onClick={onClose} disabled={loading} aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={save} className="space-y-4 p-5">
          <div className="flex items-center gap-4 rounded-lg bg-black/40 p-3">
            {avatarPreview || profile.avatar ? (
              <img
                src={avatarPreview || profile.avatar}
                alt="Prévia da foto de perfil"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#262626] text-xl font-semibold">
                {profile.username.slice(0, 1).toUpperCase()}
              </span>
            )}
            <label className="min-w-0 flex-1 space-y-1.5 text-sm">
              <span className="flex items-center gap-2 font-semibold">
                <ImagePlus className="h-4 w-4" />
                Foto de perfil
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="Escolher foto de perfil"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setAvatarFile(file);
                  setMessage("");
                }}
                className="block w-full text-xs text-ig-gray file:mr-3 file:rounded-md file:border-0 file:bg-ig-border file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
              <span className="block text-xs text-ig-gray">
                JPG, PNG ou WebP; até 5 MB.
              </span>
            </label>
          </div>

          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold">Nome de usuário</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              maxLength={30}
              required
              className="h-10 w-full rounded-lg border border-ig-border bg-black px-3 outline-none focus:border-[#555]"
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold">Nome</span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              maxLength={100}
              required
              className="h-10 w-full rounded-lg border border-ig-border bg-black px-3 outline-none focus:border-[#555]"
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold">Email</span>
            <input
              type="email"
              value={nextEmail}
              onChange={(event) => setNextEmail(event.target.value)}
              required
              className="h-10 w-full rounded-lg border border-ig-border bg-black px-3 outline-none focus:border-[#555]"
            />
            <span className="block text-xs text-ig-gray">
              A alteração pode exigir confirmação por email.
            </span>
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold">Bio</span>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={150}
              rows={3}
              className="w-full resize-y rounded-lg border border-ig-border bg-black p-3 outline-none focus:border-[#555]"
            />
            <span className="block text-right text-xs text-ig-gray">
              {bio.length}/150
            </span>
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold">Gênero</span>
            <select
              value={gender}
              onChange={(event) => setGender(event.target.value)}
              className="h-10 w-full rounded-lg border border-ig-border bg-black px-3 outline-none focus:border-[#555]"
            >
              <option value="">Prefiro não informar</option>
              <option value="Mulher">Mulher</option>
              <option value="Homem">Homem</option>
              <option value="Não binário">Não binário</option>
              <option value="Personalizado">Personalizado</option>
            </select>
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold">Site</span>
            <input
              type="url"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://seusite.com"
              className="h-10 w-full rounded-lg border border-ig-border bg-black px-3 outline-none focus:border-[#555]"
            />
          </label>

          {message && (
            <p
              role={message.startsWith("Não foi") || message.startsWith("Falha") ? "alert" : "status"}
              className={`text-sm ${
                message.startsWith("Não foi") || message.startsWith("Falha")
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={
              loading || !username.trim() || !fullName.trim() || !nextEmail.trim()
            }
            className="w-full rounded-lg bg-ig-blue py-2 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </section>
    </div>
  );
}
