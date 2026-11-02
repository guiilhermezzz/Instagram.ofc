import type { Post } from "../data";

export type ShareResult = "shared" | "copied" | "cancelled";

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Try the legacy copy method for browsers that block the Clipboard API.
    }
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();

  if (!copied) {
    throw new Error(`Não foi possível copiar o link. Link da publicação: ${text}`);
  }
}

export async function shareUrl(
  url: string,
  title: string,
  text?: string
): Promise<ShareResult> {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        ...(text ? { text } : {}),
        url,
      });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  await copyText(url);
  return "copied";
}

export function getPostUrl(post: Post) {
  const url = new URL(window.location.href);
  url.searchParams.set("post", post.id);
  return url.toString();
}

export function getProfileUrl(username: string) {
  const url = new URL(window.location.href);
  url.searchParams.delete("post");
  url.searchParams.set("profile", username);
  return url.toString();
}

export function sharePost(post: Post): Promise<ShareResult> {
  return shareUrl(
    getPostUrl(post),
    `Publicação de ${post.authorUsername ?? "usuário"}`,
    post.caption
  );
}
