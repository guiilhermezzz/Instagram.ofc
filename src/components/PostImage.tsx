import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { ImageOff } from "lucide-react";
import { supabase } from "../lib/supabase";

type Props = ImgHTMLAttributes<HTMLImageElement>;

const getStoragePath = (source: string) => {
  if (!supabase) return null;

  try {
    const publicUrl = new URL(
      supabase.storage.from("posts").getPublicUrl("").data.publicUrl
    );
    const imageUrl = new URL(source);
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

export default function PostImage({
  src,
  alt = "",
  className,
  ...imageProps
}: Props) {
  const [displaySrc, setDisplaySrc] = useState(src ?? "");
  const [fallbackTried, setFallbackTried] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setDisplaySrc(src ?? "");
    setFallbackTried(false);
    setFailed(false);
  }, [src]);

  const handleError = async () => {
    if (fallbackTried) {
      setFailed(true);
      return;
    }

    const path = getStoragePath(displaySrc);
    if (!path || !supabase) {
      setFailed(true);
      return;
    }

    setFallbackTried(true);
    try {
      const { data, error } = await supabase.storage
        .from("posts")
        .createSignedUrl(path, 60 * 60 * 24 * 7);
      if (error) throw error;
      if (!data.signedUrl) {
        throw new Error("O Supabase não retornou um link assinado.");
      }

      setDisplaySrc(data.signedUrl);
    } catch (error) {
      console.error(
        "Não foi possível gerar um link para a imagem da publicação.",
        error
      );
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <div
        role="img"
        aria-label={`${alt || "Imagem da publicação"} indisponível`}
        className={`flex flex-col items-center justify-center gap-2 bg-[#111] text-ig-gray ${className ?? ""}`}
      >
        <ImageOff className="h-7 w-7" aria-hidden="true" />
        <span className="text-xs">Imagem indisponível</span>
      </div>
    );
  }

  return (
    <img
      {...imageProps}
      src={displaySrc}
      alt={alt}
      className={className}
      onError={() => void handleError()}
    />
  );
}
