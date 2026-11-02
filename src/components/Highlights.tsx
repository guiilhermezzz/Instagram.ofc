import { Plus } from "lucide-react";
import type { Highlight } from "../data";

interface Props {
  highlights: Highlight[];
  onOpen: (index: number) => void;
  onAdd: (file: File) => void;
}

export default function Highlights({ highlights, onOpen, onAdd }: Props) {
  return (
    <section className="mt-6 md:mt-11 md:px-10">
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-1 md:gap-7 md:px-0">
        {highlights.length === 0 && (
          <p className="self-center text-xs text-ig-gray">
            Adicione imagens para criar destaques demonstrativos.
          </p>
        )}
        {highlights.map((h, i) => (
          <button
            key={h.id}
            onClick={() => onOpen(i)}
            className="group flex w-[74px] shrink-0 flex-col items-center gap-1.5 md:w-[86px]"
          >
            <span className="rounded-full border-2 border-ig-border p-[3px] transition-all duration-300 group-hover:border-[#4d4d4d] group-hover:scale-[1.04]">
              <img
                src={h.cover}
                alt={h.title}
                className="h-[60px] w-[60px] rounded-full object-cover md:h-[74px] md:w-[74px]"
                loading="lazy"
              />
            </span>
            <span className="w-full truncate text-center text-xs font-medium">
              {h.title}
            </span>
          </button>
        ))}

        <label className="group flex w-[74px] shrink-0 cursor-pointer flex-col items-center gap-1.5 md:w-[86px]">
          <span className="flex h-[66px] w-[66px] items-center justify-center rounded-full border-2 border-ig-border transition-all duration-300 group-hover:border-[#4d4d4d] group-hover:scale-[1.04] md:h-[80px] md:w-[80px]">
            <Plus className="h-8 w-8 text-ig-gray transition-colors group-hover:text-white md:h-9 md:w-9" strokeWidth={1.5} />
          </span>
          <span className="w-full truncate text-center text-xs font-medium">
            Novo
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Adicionar destaque"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onAdd(file);
              event.target.value = "";
            }}
          />
        </label>
      </div>
    </section>
  );
}
