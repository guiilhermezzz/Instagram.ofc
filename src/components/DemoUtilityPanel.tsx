import { useState } from "react";
import { X } from "lucide-react";
import type { Post } from "../data";
import PostImage from "./PostImage";

interface Props {
  title: string;
  posts?: Post[];
  onClose: () => void;
}

export default function DemoUtilityPanel({ title, posts = [], onClose }: Props) {
  const [report, setReport] = useState("");
  const [sent, setSent] = useState(false);

  const isSaved = title === "Salvos";
  const isActivity = title === "Sua atividade";
  const isReport = title === "Relatar um problema";

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/70 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-[500px] overflow-hidden rounded-xl border border-ig-border bg-[#1a1a1a]"
      >
        <header className="flex items-center justify-between border-b border-ig-border px-4 py-3">
          <span className="w-5" />
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </header>

        {isReport ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!report.trim()) return;
              setSent(true);
              setReport("");
            }}
            className="space-y-3 p-5"
          >
            <p className="text-sm text-ig-gray">
              Envie uma observação de demonstração. Ela não será transmitida.
            </p>
            <textarea
              value={report}
              onChange={(event) => setReport(event.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Descreva o problema..."
              aria-label="Descrição do problema"
              className="w-full rounded-lg border border-ig-border bg-black p-3 text-sm outline-none"
            />
            {sent && (
              <p role="status" className="text-sm text-green-400">
                Relato salvo apenas nesta demonstração.
              </p>
            )}
            <button
              type="submit"
              disabled={!report.trim()}
              className="rounded-lg bg-ig-blue px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              Enviar relato
            </button>
          </form>
        ) : isSaved || isActivity ? (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto p-5">
            <p className="text-sm text-ig-gray">
              {isSaved
                ? "Publicações salvas nesta sessão."
                : "Atividade de curtidas desta sessão."}
            </p>
            {posts.length === 0 ? (
              <p className="py-8 text-center text-sm text-ig-gray">
                Ainda não há itens para mostrar.
              </p>
            ) : (
              posts.map((post) => (
                <article
                  key={post.id}
                  className="flex items-center gap-3 rounded-lg bg-black/40 p-3"
                >
                  {post.videoUrl ? (
                    <video
                      src={post.videoUrl}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-14 w-14 rounded object-cover"
                    />
                  ) : (
                    <PostImage
                      src={post.image}
                      alt=""
                      className="h-14 w-14 rounded object-cover"
                    />
                  )}
                  <p className="line-clamp-2 text-sm">{post.caption}</p>
                </article>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3 p-5">
            <p className="text-sm text-ig-gray">
              {title === "Alternar aparência"
                ? "O tema escuro está ativo nesta demonstração."
                : "Opção demonstrativa; nenhuma configuração externa será alterada."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
