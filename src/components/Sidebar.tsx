import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  Compass,
  Clapperboard,
  Send,
  Heart,
  SquarePlus,
  Menu,
  Camera,
  Settings,
  Clock,
  Bookmark,
  Sun,
  Flag,
  LogOut,
} from "lucide-react";
import { cn } from "../utils/cn";

const navItems = [
  { icon: Home, label: "Página inicial", active: true },
  { icon: Search, label: "Pesquisa" },
  { icon: Compass, label: "Explorar" },
  { icon: Clapperboard, label: "Reels" },
  { icon: Send, label: "Mensagens" },
  { icon: Heart, label: "Notificações" },
  { icon: SquarePlus, label: "Criar" },
];

const menuItems = [
  { icon: Settings, label: "Configurações" },
  { icon: Clock, label: "Sua atividade" },
  { icon: Bookmark, label: "Salvos" },
  { icon: Sun, label: "Alternar aparência" },
  { icon: Flag, label: "Relatar um problema" },
];

interface Props {
  username: string;
  avatar?: string;
  onLogout: () => void;
  onHome: () => void;
  onSearch: () => void;
  onReels: () => void;
  onCreatePost: () => void;
  onMessages: () => void;
  onNotifications: () => void;
  onExplore: () => void;
  onUtility: (action: string) => void;
  onProfile: () => void;
}

export default function Sidebar({
  username,
  avatar,
  onLogout,
  onHome,
  onSearch,
  onReels,
  onCreatePost,
  onMessages,
  onNotifications,
  onExplore,
  onUtility,
  onProfile,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[76px] flex-col border-r border-ig-border bg-black px-3 pb-6 pt-2 lg:flex xl:w-[245px]">
      <button
        onClick={onHome}
        aria-label="Página inicial"
        className="mb-7 mt-4 hidden h-10 items-center px-3 xl:flex"
      >
        <span className="font-logo text-[29px] leading-none tracking-wide">
          Instagram
        </span>
      </button>
      <button
        onClick={onHome}
        aria-label="Página inicial"
        className="mx-auto mb-7 mt-4 flex h-10 w-10 items-center justify-center xl:hidden"
      >
        <Camera className="h-7 w-7 transition-transform duration-200 hover:scale-110" />
      </button>

      <nav className="flex flex-1 flex-col">
        {navItems.map((item) => {
          const actions: Record<string, () => void> = {
            "Página inicial": onHome,
            Pesquisa: onSearch,
            Explorar: onExplore,
            Reels: onReels,
            Mensagens: onMessages,
            Notificações: onNotifications,
            Criar: onCreatePost,
          };

          return (
            <button
              key={item.label}
              onClick={actions[item.label]}
              className="group relative my-[3px] flex items-center gap-4 rounded-lg p-3 text-left transition-colors duration-200 hover:bg-ig-hover"
            >
              <span className="relative">
                <item.icon
                  className={cn(
                    "h-[26px] w-[26px] transition-transform duration-200 group-hover:scale-110",
                    item.active && "stroke-[2.5px]"
                  )}
                  strokeWidth={item.active ? 2.5 : 2}
                />
              </span>
              <span
                className={cn(
                  "hidden text-[15px] xl:block",
                  item.active ? "font-bold" : "font-normal"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        <button
          onClick={onProfile}
          className="group my-[3px] flex items-center gap-4 rounded-lg p-3 transition-colors duration-200 hover:bg-ig-hover"
        >
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="h-[26px] w-[26px] rounded-full object-cover"
            />
          ) : (
            <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#262626] text-xs font-semibold">
              {username.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="hidden text-[15px] xl:block">Perfil</span>
        </button>
      </nav>

      {/* menu "Mais" com logout */}
      <div className="relative">
        <AnimatePresence>
          {menuOpen && (
            <>
              <button
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
              />
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute bottom-14 left-0 z-50 w-[250px] rounded-2xl border border-[#262626] bg-[#1a1a1a] p-1.5 shadow-[0_8px_44px_rgba(0,0,0,0.85)]"
              >
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setMenuOpen(false);
                      onUtility(item.label);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#262626]"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
                ))}
                <div className="mx-2 my-1 h-px bg-[#2e2e2e]" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
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

        <button
          onClick={() => setMenuOpen((o) => !o)}
          className={cn(
            "group flex w-full items-center gap-4 rounded-lg p-3 transition-colors duration-200 hover:bg-ig-hover",
            menuOpen && "bg-ig-hover"
          )}
        >
          <Menu className="h-[26px] w-[26px] transition-transform duration-200 group-hover:scale-110" />
          <span
            className={cn(
              "hidden text-[15px] xl:block",
              menuOpen && "font-bold"
            )}
          >
            Mais
          </span>
        </button>
      </div>
    </aside>
  );
}
