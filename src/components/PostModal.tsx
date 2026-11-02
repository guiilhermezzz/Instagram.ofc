import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Smile,
} from "lucide-react";
import {
  formatNumber,
  type Post,
  type CommentItem,
} from "../data";
import { cn } from "../utils/cn";
import PostImage from "./PostImage";
import { sharePost } from "../utils/share";

interface Props {
  post: Post;
  username: string;
  liked: boolean;
  saved: boolean;
  onToggleLike: (id: string, force?: boolean) => void;
  onToggleSave: (id: string) => void;
  onClose: () => void;
}

export default function PostModal({
  post,
  username,
  liked,
  saved,
  onToggleLike,
  onToggleSave,
  onClose,
}: Props) {
  const [burst, setBurst] = useState(false);
  const [draft, setDraft] = useState("");
  const [added, setAdded] = useState<CommentItem[]>([]);
  const [shareStatus, setShareStatus] = useState("");
  const burstTimer = useRef<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayLikes = post.likes + (liked ? 1 : 0);
  const authorUsername = post.authorUsername ?? username;

  const handleDoubleClick = () => {
    if (!liked) onToggleLike(post.id, true);
    setBurst(true);
    window.clearTimeout(burstTimer.current);
    burstTimer.current = window.setTimeout(() => setBurst(false), 950);
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setAdded((prev) => [
      ...prev,
      {
        id: `me-${Date.now()}`,
        user: username,
        avatar: "https://i.pravatar.cc/96?img=5",
        text,
        likes: 0,
        time: "agora",
      },
    ]);
    setDraft("");
  };

  const handleShare = async () => {
    try {
      const result = await sharePost(post);
      if (result === "shared") setShareStatus("Publicação compartilhada.");
      if (result === "copied") setShareStatus("Link copiado.");
    } catch (error) {
      setShareStatus(
        error instanceof Error
          ? `Não foi possível compartilhar: ${error.message}`
          : "Não foi possível compartilhar o link."
      );
    }
  };

  const allComments = [...post.comments, ...added];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-[2px] md:p-8"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 text-white/80 transition-all hover:text-white active:scale-90"
        aria-label="Fechar"
      >
        <X className="h-7 w-7" />
      </button>

      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
        className="flex h-full w-full flex-col overflow-hidden bg-black md:h-[min(88vh,820px)] md:w-[min(95vw,1080px)] md:flex-row md:rounded-md md:border md:border-ig-border"
      >
        {/* imagem */}
        <div
          onDoubleClick={handleDoubleClick}
          className="relative flex h-[40vh] shrink-0 cursor-pointer select-none items-center justify-center bg-black md:h-full md:flex-1"
        >
          {post.videoUrl ? (
            <video
              src={post.videoUrl}
              controls
              playsInline
              className="h-full w-full object-contain"
            />
          ) : (
            <PostImage
              src={post.image}
              alt={post.caption}
              className="h-full w-full object-contain"
              draggable={false}
            />
          )}
          <AnimatePresence>
            {burst && (
              <motion.div
                initial={{ scale: 0, rotate: -16 }}
                animate={{
                  scale: [0, 1.25, 0.92, 1],
                  rotate: [-16, 4, -2, 0],
                  opacity: [0, 1, 1, 1],
                }}
                exit={{ scale: 1.3, opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <Heart
                  className="h-28 w-28 text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
                  fill="#fff"
                  stroke="none"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* painel lateral */}
        <div className="flex min-h-0 w-full flex-1 flex-col border-t border-ig-border md:w-[380px] md:shrink-0 md:grow-0 md:border-l md:border-t-0">
          {/* cabeçalho */}
          <div className="flex items-center gap-3 border-b border-ig-border px-4 py-3">
            <span className="rounded-full bg-[conic-gradient(from_210deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)] p-[2px]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#262626] text-xs font-semibold ring-2 ring-black">
                {authorUsername.slice(0, 1).toUpperCase()}
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-sm font-semibold">
                {authorUsername}
                <span className="ml-1 font-normal text-ig-gray">•</span>
                <button className="font-semibold text-ig-blue hover:text-white">
                  Seguindo
                </button>
              </p>
              {post.location && (
                <p className="truncate text-xs text-white/90">{post.location}</p>
              )}
            </div>
            <button className="transition-transform active:scale-90">
              <MoreHorizontal className="h-5 w-5 text-ig-gray" />
            </button>
          </div>

          {/* comentários */}
          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto py-2">
            {/* legenda */}
            <div className="flex gap-3 px-4 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#262626] text-xs font-semibold">
                {authorUsername.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1 text-sm leading-snug">
                <span className="mr-1.5 font-semibold">{authorUsername}</span>
                {post.caption}
                <p className="mt-1.5 text-xs text-ig-gray">há {post.time}</p>
              </div>
            </div>

            {allComments.map((c) => (
              <div key={c.id} className="flex gap-3 px-4 py-2.5">
                <img
                  src={c.avatar}
                  alt={c.user}
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1 text-sm leading-snug">
                  <span className="mr-1.5 font-semibold">{c.user}</span>
                  {c.text}
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-ig-gray">
                    <span>{c.time}</span>
                    <span>
                      {c.likes > 0 ? `${c.likes} curtidas` : "Curtir"}
                    </span>
                    <button className="font-semibold hover:text-white">
                      Responder
                    </button>
                  </div>
                </div>
                <button className="self-center transition-transform active:scale-125">
                  <Heart className="h-3.5 w-3.5 text-ig-gray hover:text-white" />
                </button>
              </div>
            ))}
          </div>

          {/* ações */}
          <div className="border-t border-ig-border">
            <div className="flex items-center gap-4 px-4 pt-3">
              <button
                onClick={() => onToggleLike(post.id)}
                className="transition-transform active:scale-90"
                aria-label="Curtir"
              >
                <Heart
                  key={String(liked)}
                  className={cn(
                    "h-[26px] w-[26px] animate-[like-pop_0.45s_ease] transition-colors",
                    liked
                      ? "fill-ig-red text-ig-red"
                      : "text-white hover:text-ig-gray"
                  )}
                />
              </button>
              <button
                onClick={() => inputRef.current?.focus()}
                className="transition-all hover:text-ig-gray active:scale-90"
                aria-label="Comentar"
              >
                <MessageCircle className="h-[26px] w-[26px] -scale-x-100" />
              </button>
              <button
                onClick={() => void handleShare()}
                className="transition-all hover:text-ig-gray active:scale-90"
                aria-label="Compartilhar"
              >
                <Send className="h-[26px] w-[26px]" />
              </button>
              <span className="flex-1" />
              <button
                onClick={() => onToggleSave(post.id)}
                className="transition-transform active:scale-90"
                aria-label="Salvar"
              >
                <Bookmark
                  key={String(saved)}
                  className={cn(
                    "h-[26px] w-[26px] animate-[like-pop_0.45s_ease] transition-colors",
                    saved ? "fill-white text-white" : "hover:text-ig-gray"
                  )}
                />
              </button>
            </div>

            <p className="px-4 pt-2.5 text-sm font-semibold">
              {formatNumber(displayLikes)} curtidas
            </p>
            {shareStatus && (
              <p
                role="status"
                className="px-4 pt-1 text-xs text-ig-gray"
              >
                {shareStatus}
              </p>
            )}
            <p className="px-4 pb-3 pt-1 text-[10px] uppercase tracking-wide text-ig-gray">
              Há {post.time}
            </p>

            <form
              onSubmit={submitComment}
              className="flex items-center gap-3 border-t border-ig-border px-4 py-3"
            >
              <Smile className="h-6 w-6 shrink-0 text-ig-gray" />
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Adicione um comentário..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-ig-gray"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="text-sm font-semibold text-ig-blue transition-opacity enabled:hover:text-white disabled:opacity-40"
              >
                Publicar
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
