import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Heart,
  Send,
} from "lucide-react";
import type { StorySet } from "../data";

interface Props {
  set: StorySet;
  startIndex: number;
  username: string;
  onClose: () => void;
}

export default function StoryViewer({
  set,
  startIndex,
  username,
  onClose,
}: Props) {
  const [index, setIndex] = useState(startIndex);
  const [reply, setReply] = useState("");
  const [sentReply, setSentReply] = useState("");
  const [liked, setLiked] = useState(false);
  const total = set.images.length;

  const go = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => {
        const next = i + dir;
        if (next >= total) {
          onClose();
          return i;
        }
        return Math.max(0, next);
      });
    },
    [total, onClose]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#101010]/95 backdrop-blur-sm"
    >
      <span className="absolute left-7 top-5 hidden font-logo text-[26px] md:block">
        Instagram
      </span>
      <button
        onClick={onClose}
        className="absolute right-5 top-4 z-20 text-white/80 transition-all hover:text-white active:scale-90"
        aria-label="Fechar stories"
      >
        <X className="h-8 w-8" />
      </button>

      {index > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          className="absolute left-4 z-20 hidden rounded-full bg-white/95 p-1.5 text-black transition-all hover:scale-110 active:scale-95 md:block"
          aria-label="Story anterior"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
        </button>
      )}
      {index < total - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          className="absolute right-4 z-20 hidden rounded-full bg-white/95 p-1.5 text-black transition-all hover:scale-110 active:scale-95 md:block"
          aria-label="Próximo story"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
        </button>
      )}

      {/* cartão do story */}
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        className="relative h-full w-full overflow-hidden bg-neutral-900 md:aspect-[9/16] md:h-[94vh] md:w-auto md:rounded-lg"
      >
        <AnimatePresence mode="popLayout">
          <motion.img
            key={set.images[index]}
            src={set.images[index]}
            alt={`${set.title} ${index + 1}`}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        </AnimatePresence>

        {/* brilho superior/inferior */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/65 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-black/65 to-transparent" />

        {/* barras de progresso */}
        <div className="absolute inset-x-0 top-0 z-20 flex gap-1 px-2.5 pt-2.5">
          {set.images.map((_, i) => (
            <div
              key={i}
              className="h-[2.5px] flex-1 overflow-hidden rounded-full bg-white/30"
            >
              {i < index && <div className="h-full w-full bg-white" />}
              {i === index && (
                <motion.div
                  key={`p-${index}-${set.id}`}
                  className="h-full bg-white"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  onAnimationComplete={() => go(1)}
                />
              )}
            </div>
          ))}
        </div>

        {/* cabeçalho */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center gap-2.5 px-3 pt-6">
          <span className="rounded-full bg-[conic-gradient(from_210deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)] p-[2px]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#262626] text-xs font-semibold ring-2 ring-black/40">
              {username.slice(0, 1).toUpperCase()}
            </span>
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold">
            {set.id === "me" ? username : set.title}
          </span>
          <span className="text-sm text-white/60">{set.times[index]}</span>
          <span className="flex-1" />
          <button
            onClick={() => setSentReply("Opções do story de demonstração")}
            aria-label="Mais opções do story"
          >
            <MoreHorizontal className="h-5 w-5 text-white/80" />
          </button>
        </div>

        {/* zonas de navegação */}
        <button
          onClick={() => go(-1)}
          className="absolute bottom-28 left-0 top-20 z-10 w-1/3 cursor-w-resize"
          aria-label="Anterior"
        />
        <button
          onClick={() => go(1)}
          className="absolute bottom-28 right-0 top-20 z-10 w-2/3 cursor-e-resize"
          aria-label="Próximo"
        />

        {/* rodapé */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const text = reply.trim();
            if (!text) return;
            setSentReply(`Resposta enviada: ${text}`);
            setReply("");
          }}
          className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-3 px-3 pb-4 pt-8"
        >
          <input
            onClick={(e) => e.stopPropagation()}
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder={`Responder a ${username}...`}
            aria-label="Responder ao story"
            className="h-11 min-w-0 flex-1 rounded-full border border-white/50 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-white/60 focus:border-white"
          />
          <button
            type="button"
            onClick={() => setLiked((current) => !current)}
            aria-label={liked ? "Descurtir story" : "Curtir story"}
            className="shrink-0 transition-transform hover:scale-110 active:scale-90"
          >
            <Heart
              className={`h-7 w-7 ${liked ? "fill-ig-red text-ig-red" : ""}`}
            />
          </button>
          <button
            type="submit"
            aria-label="Enviar resposta"
            disabled={!reply.trim()}
            className="shrink-0 transition-transform hover:scale-110 active:scale-90 disabled:opacity-40"
          >
            <Send className="h-[26px] w-[26px]" />
          </button>
          {sentReply && (
            <span className="absolute bottom-20 left-4 rounded-lg bg-black/80 px-3 py-2 text-xs">
              {sentReply}
            </span>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
}
