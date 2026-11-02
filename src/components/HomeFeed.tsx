import {
  Bookmark,
  Clapperboard,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { useState } from "react";
import { demoProfiles, demoStories, type Post, type StorySet } from "../data";
import { formatNumber } from "../data";
import PostImage from "./PostImage";
import { sharePost } from "../utils/share";

interface Props {
  title: string;
  username: string;
  posts: Post[];
  likedPosts: Set<string>;
  savedPosts: Set<string>;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onOpenPost: (post: Post) => void;
  onCreatePost: () => void;
  onOpenStory: (story: StorySet) => void;
  showStories?: boolean;
}

export default function HomeFeed({
  title,
  username,
  posts,
  likedPosts,
  savedPosts,
  onToggleLike,
  onToggleSave,
  onOpenPost,
  onCreatePost,
  onOpenStory,
  showStories = false,
}: Props) {
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [shareMessage, setShareMessage] = useState("");

  const handleShare = async (post: Post) => {
    setShareMessage("");
    try {
      const result = await sharePost(post);
      if (result === "shared") setShareMessage("Publicação compartilhada.");
      if (result === "copied") setShareMessage("Link da publicação copiado.");
    } catch (error) {
      setShareMessage(
        error instanceof Error
          ? `Não foi possível compartilhar: ${error.message}`
          : "Não foi possível compartilhar esta publicação."
      );
    }
  };

  return (
    <section className="mx-auto max-w-[935px] px-3 py-6 md:px-0">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,470px)_minmax(260px,300px)] xl:gap-16">
        <div className="min-w-0">
          <h1 className="mb-5 text-xl font-semibold">{title}</h1>
          {showStories && (
            <div className="no-scrollbar mb-5 flex gap-4 overflow-x-auto rounded-lg border border-ig-border px-4 py-4">
              {demoStories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => onOpenStory(story)}
                  className="flex w-[66px] shrink-0 flex-col items-center gap-1.5"
                  aria-label={`Ver story de ${story.title}`}
                >
                  <span className="rounded-full bg-[conic-gradient(from_210deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)] p-[2px]">
                    <img
                      src={
                        demoProfiles.find(
                          (profile) => profile.username === story.title
                        )?.avatar
                      }
                      alt=""
                      className="h-14 w-14 rounded-full border-2 border-black object-cover"
                    />
                  </span>
                  <span className="w-full truncate text-center text-xs">
                    {story.title}
                  </span>
                </button>
              ))}
            </div>
          )}

          {title !== "Reels" && (
            <p className="mb-5 rounded-lg bg-[#121212] px-3 py-2 text-xs text-ig-gray">
              Feed de demonstração: publicações, perfis, stories e interações
              fictícios aparecem junto com as publicações reais da sua conta.
            </p>
          )}

          {posts.length === 0 ? (
            <div className="rounded-xl border border-ig-border px-6 py-12 text-center">
              <p className="text-lg font-semibold">
                {title === "Reels"
                  ? "Nenhum Reel por enquanto"
                  : "Seu feed está vazio"}
              </p>
              <p className="mt-2 text-sm text-ig-gray">
                Publique uma foto ou vídeo para começar.
              </p>
              <button
                onClick={onCreatePost}
                className="mt-5 rounded-lg bg-ig-blue px-4 py-2 text-sm font-semibold"
              >
                Criar publicação
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => {
                const liked = likedPosts.has(post.id);
                const saved = savedPosts.has(post.id);
                return (
                  <article
                    key={post.id}
                    className="overflow-hidden border-b border-ig-border pb-5"
                  >
                    <header className="flex items-center gap-3 pb-3">
                      {post.authorAvatar ? (
                        <img
                          src={post.authorAvatar}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#262626] text-sm font-semibold">
                          {(post.authorUsername ?? "u").slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {post.authorUsername ?? "Usuário"}
                          {post.location && (
                            <span className="block pt-0.5 text-xs font-normal text-white/80">
                              {post.location}
                            </span>
                          )}
                        </p>
                      </div>
                      {post.videoUrl && (
                        <Clapperboard className="h-4 w-4 text-ig-gray" />
                      )}
                      <MoreHorizontal className="h-5 w-5" />
                    </header>

                    <div className="overflow-hidden bg-[#111]">
                      {post.videoUrl ? (
                        <video
                          src={post.videoUrl}
                          poster={post.posterUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="max-h-[75vh] w-full object-contain"
                        />
                      ) : (
                        <button
                          onClick={() => onOpenPost(post)}
                          aria-label={`Abrir publicação de ${post.authorUsername ?? "usuário"}`}
                          className="block w-full"
                        >
                          <PostImage
                            src={post.image}
                            alt={post.caption || "Publicação"}
                            loading="lazy"
                            className="aspect-square max-h-[75vh] w-full object-cover"
                          />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-4 pt-3">
                      <button
                        onClick={() => onToggleLike(post.id)}
                        aria-label={liked ? "Descurtir" : "Curtir"}
                      >
                        <Heart
                          className={`h-6 w-6 ${
                            liked ? "fill-ig-red text-ig-red" : ""
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => onOpenPost(post)}
                        aria-label="Ver comentários"
                      >
                        <MessageCircle className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => void handleShare(post)}
                        aria-label="Compartilhar publicação"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onToggleSave(post.id)}
                        aria-label={saved ? "Remover dos salvos" : "Salvar"}
                        className="ml-auto"
                      >
                        <Bookmark
                          className={`h-6 w-6 ${
                            saved ? "fill-white text-white" : ""
                          }`}
                        />
                      </button>
                    </div>
                    {shareMessage && (
                      <p className="pt-2 text-xs text-ig-gray" role="status">
                        {shareMessage}
                      </p>
                    )}
                    <p className="pt-2 text-sm font-semibold">
                      {formatNumber(post.likes + (liked ? 1 : 0))} curtidas
                    </p>
                    {post.caption && (
                      <p className="pt-1 text-sm">
                        <span className="mr-2 font-semibold">
                          {post.authorUsername ?? "Usuário"}
                        </span>
                        {post.caption}
                      </p>
                    )}
                    {post.comments.length > 0 && (
                      <button
                        onClick={() => onOpenPost(post)}
                        className="pt-1 text-left text-sm text-ig-gray"
                      >
                        Ver todos os {post.comments.length} comentários
                      </button>
                    )}
                    <p className="pt-2 text-[10px] uppercase tracking-wide text-ig-gray">
                      {post.time}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="hidden pt-14 xl:block">
          <div className="sticky top-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#262626] text-sm font-semibold">
                {username.slice(0, 1).toUpperCase() || "U"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {username || "Sua conta"}
                </p>
                <p className="text-sm text-ig-gray">Sugestões de demonstração</p>
              </div>
              <button
                onClick={onCreatePost}
                className="ml-auto text-xs font-semibold text-ig-blue"
              >
                Publicar
              </button>
            </div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ig-gray">
                Sugestões para você
              </h2>
              <span className="text-xs font-semibold">Ver tudo</span>
            </div>
            <div className="space-y-3">
              {demoProfiles.map((profile) => {
                const isFollowing = following.has(profile.username);
                return (
                  <div
                    key={profile.username}
                    className="flex items-center gap-3"
                  >
                    <img
                      src={profile.avatar}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">
                        {profile.username}
                      </p>
                      <p className="truncate text-xs text-ig-gray">
                        Sugerido para você
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setFollowing((current) => {
                          const next = new Set(current);
                          if (next.has(profile.username)) {
                            next.delete(profile.username);
                          } else {
                            next.add(profile.username);
                          }
                          return next;
                        })
                      }
                      className="text-xs font-semibold text-ig-blue"
                    >
                      {isFollowing ? "Seguindo" : "Seguir"}
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="mt-6 text-[11px] leading-4 text-[#737373]">
              Perfis e sugestões nesta área são demonstrativos e não representam
              usuários reais.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
