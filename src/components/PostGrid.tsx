import {
  Grid3x3,
  Clapperboard,
  SquareUserRound,
  Heart,
  MessageCircle,
  Play,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatNumber, type Post } from "../data";
import { cn } from "../utils/cn";
import PostImage from "./PostImage";

export type ProfileTab = "posts" | "reels" | "tagged";

const tabs: { id: ProfileTab; icon: typeof Grid3x3; label: string }[] = [
  { id: "posts", icon: Grid3x3, label: "Publicações" },
  { id: "reels", icon: Clapperboard, label: "Reels" },
  { id: "tagged", icon: SquareUserRound, label: "Marcados" },
];

interface Props {
  posts: Post[];
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  onOpenPost: (post: Post) => void;
}

export default function PostGrid({
  posts,
  activeTab,
  onTabChange,
  onOpenPost,
}: Props) {
  const displayed =
    activeTab === "posts"
      ? posts
      : activeTab === "reels"
        ? posts.filter((p) => p.type === "reel")
        : [];

  return (
    <section className="mt-5 md:mt-8">
      {/* abas */}
      <div className="flex justify-center gap-10 border-t border-ig-border md:gap-16">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "-mt-px flex items-center gap-1.5 border-t py-3.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-200 md:py-4",
              activeTab === tab.id
                ? "border-white text-white"
                : "border-transparent text-ig-gray hover:text-white/80"
            )}
          >
            <tab.icon className="h-[18px] w-[18px] md:h-[14px] md:w-[14px]" />
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* grade */}
      <motion.div
        key={activeTab}
        initial="hidden"
        animate="visible"
        className="mt-[3px] grid grid-cols-3 gap-[3px] px-[3px] md:gap-1 md:px-0"
      >
        {displayed.map((post, i) => (
          <motion.button
            key={post.id}
            variants={{
              hidden: { opacity: 0, y: 24, scale: 0.98 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  delay: Math.min(i * 0.045, 0.5),
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            }}
            onClick={() => onOpenPost(post)}
            className="group relative aspect-square overflow-hidden bg-neutral-900"
          >
            {post.videoUrl ? (
              <video
                src={post.videoUrl}
                poster={post.posterUrl}
                muted
                playsInline
                autoPlay
                loop
                preload="auto"
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
              />
            ) : (
              <PostImage
                src={post.image}
                alt={post.caption}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
              />
            )}
            {post.type === "reel" && (
              <Clapperboard className="absolute right-2.5 top-2.5 h-5 w-5 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]" />
            )}
            {activeTab === "reels" && post.views && (
              <span className="absolute bottom-2 left-2 flex items-center gap-1 text-[13px] font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                <Play className="h-4 w-4" fill="#fff" stroke="none" />
                {post.views}
              </span>
            )}
            <div className="absolute inset-0 hidden items-center justify-center gap-7 bg-black/45 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 md:flex">
              <span className="flex items-center gap-1.5 text-[15px] font-bold">
                <Heart className="h-[22px] w-[22px]" fill="#fff" stroke="none" />
                {formatNumber(post.likes)}
              </span>
              <span className="flex items-center gap-1.5 text-[15px] font-bold">
                <MessageCircle
                  className="h-[22px] w-[22px] -scale-x-100"
                  fill="#fff"
                  stroke="none"
                />
                {post.comments.length}
              </span>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}
