import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  SquarePlus,
  Clapperboard,
  Menu,
  SquarePen,
  Send,
  Heart,
  LogOut,
  Bookmark,
  Settings,
} from "lucide-react";
export function MobileTopBar({
  username,
  onLogout,
  onCreatePost,
  onMessages,
  onNotifications,
  onUtility,
}: {
  username: string;
  onLogout: () => void;
  onCreatePost: () => void;
  onMessages: () => void;
  onNotifications: () => void;
  onUtility: (action: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-[52px] items-center justify-between border-b border-ig-border/60 bg-black/90 px-4 backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-1.5">
        <span className="text-[15px] font-bold">{username}</span>
      </div>
      <div className="relative flex items-center gap-5">
        <button
          onClick={onCreatePost}
          aria-label="Criar publicação"
          className="transition-transform active:scale-90"
        >
          <SquarePen className="h-6 w-6" />
        </button>
        <button
          onClick={() => setOpen((o) => !o)}
          className="transition-transform active:scale-90"
          aria-label="Menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <AnimatePresence>
          {open && (
            <>
              <button
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
              />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute right-0 top-11 z-50 w-[220px] rounded-2xl border border-[#262626] bg-[#1a1a1a] p-1.5 shadow-[0_8px_44px_rgba(0,0,0,0.85)]"
              >
                <button
                  onClick={() => {
                    setOpen(false);
                    onMessages();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#262626]"
                >
                  <Send className="h-5 w-5" />
                  Mensagens
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    onNotifications();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#262626]"
                >
                  <Heart className="h-5 w-5" />
                  Notificações
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    onUtility("Configurações");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#262626]"
                >
                  <Settings className="h-5 w-5" />
                  Configurações
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    onUtility("Salvos");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#262626]"
                >
                  <Bookmark className="h-5 w-5" />
                  Salvos
                </button>
                <div className="mx-2 my-1 h-px bg-[#2e2e2e]" />
                <button
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#262626]"
                >
                  <LogOut className="h-5 w-5" />
                  Sair
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export function MobileBottomBar({
  username,
  avatar,
  onHome,
  onSearch,
  onCreatePost,
  onReels,
  onMessages,
  onProfile,
}: {
  username: string;
  avatar?: string;
  onHome: () => void;
  onSearch: () => void;
  onCreatePost: () => void;
  onReels: () => void;
  onMessages: () => void;
  onProfile: () => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-[50px] items-center justify-around border-t border-ig-border bg-black lg:hidden">
      <button
        onClick={onHome}
        aria-label="Página inicial"
        className="p-2 transition-transform active:scale-90"
      >
        <Home className="h-[26px] w-[26px]" fill="#fff" strokeWidth={2} />
      </button>
      <button
        onClick={onSearch}
        aria-label="Pesquisar perfis"
        className="p-2 transition-transform active:scale-90"
      >
        <Search className="h-[26px] w-[26px]" />
      </button>
      <button
        onClick={onCreatePost}
        aria-label="Criar publicação"
        className="p-2 transition-transform active:scale-90"
      >
        <SquarePlus className="h-[26px] w-[26px]" />
      </button>
      <button
        onClick={onReels}
        aria-label="Reels"
        className="p-2 transition-transform active:scale-90"
      >
        <Clapperboard className="h-[26px] w-[26px]" />
      </button>
      <button
        onClick={onMessages}
        aria-label="Mensagens"
        className="p-2 transition-transform active:scale-90"
      >
        <Send className="h-[24px] w-[24px]" />
      </button>
      <button
        onClick={onProfile}
        aria-label="Meu perfil"
        className="p-1.5 transition-transform active:scale-90"
      >
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="h-[26px] w-[26px] rounded-full object-cover ring-1 ring-white"
          />
        ) : (
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#262626] text-xs font-semibold ring-1 ring-white">
            {username.slice(0, 1).toUpperCase()}
          </span>
        )}
      </button>
    </nav>
  );
}
