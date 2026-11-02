import {
  MoreHorizontal,
  ChevronDown,
  UserPlus,
  Share2,
} from "lucide-react";
import type { PublicProfile } from "./ProfileSearch";
import { cn } from "../utils/cn";

interface Props {
  profile: PublicProfile;
  isOwnProfile: boolean;
  postsCount: number;
  following: boolean;
  followersCount: number;
  followingCount: number;
  followLoading: boolean;
  followAvailable: boolean;
  onToggleFollow: () => void;
  onMessage: () => void;
  onEdit: () => void;
  onShare: () => void;
  onMore: () => void;
  onOpenStory: () => void;
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
  postsCount,
  following,
  followersCount,
  followingCount,
  followLoading,
  followAvailable,
  onToggleFollow,
  onMessage,
  onEdit,
  onShare,
  onMore,
  onOpenStory,
}: Props) {
  const stats = (
    <>
      <span>
        <strong className="font-semibold">{postsCount}</strong>{" "}
        publicações
      </span>
      <button className="transition-opacity hover:opacity-70">
        <strong className="font-semibold">{followersCount}</strong>{" "}
        seguidores
      </button>
      <button className="transition-opacity hover:opacity-70">
        <strong className="font-semibold">{followingCount}</strong>{" "}
        seguindo
      </button>
    </>
  );

  const bio = (
    <div className="space-y-[2px] text-sm leading-[1.35]">
      {profile.full_name && profile.full_name !== profile.username && (
        <p className="font-semibold">{profile.username}</p>
      )}
      {profile.bio && <p className="whitespace-pre-wrap">{profile.bio}</p>}
      {profile.website && (
        <a
          href={profile.website}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[#e0f1ff] hover:underline"
        >
          {profile.website}
        </a>
      )}
    </div>
  );
  return (
    <section className="px-4 pt-3 md:px-10 md:pt-7">
      <div className="flex items-center gap-6 md:items-start md:gap-24">
        {/* avatar com anel de story */}
        <button
          onClick={onOpenStory}
          className="group relative shrink-0"
          aria-label="Ver story"
        >
          <span className="absolute inset-0 rounded-full border-2 border-ig-border transition-transform duration-300 group-hover:scale-105" />
          <span className="relative m-[3px] block rounded-full bg-black p-[3px]">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={`Foto de perfil de ${profile.username}`}
                className="h-[86px] w-[86px] rounded-full object-cover md:h-[164px] md:w-[164px]"
              />
            ) : (
              <span className="flex h-[86px] w-[86px] items-center justify-center rounded-full bg-[#262626] text-3xl font-semibold md:h-[164px] md:w-[164px] md:text-5xl">
                {profile.username.slice(0, 1).toUpperCase()}
              </span>
            )}
          </span>
        </button>

        <div className="min-w-0 flex-1 space-y-4 md:space-y-5">
          {/* linha do username */}
          <div className="flex flex-wrap items-center gap-2.5 md:gap-4">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-light md:text-xl">
                {profile.full_name || profile.username} 
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <button
                  onClick={onEdit}
                  className="rounded-lg bg-ig-border px-4 py-[7px] text-sm font-semibold transition-colors hover:bg-[#363636]"
                >
                  Editar perfil
                </button>
              ) : (
                <>
                  <button
                    onClick={onToggleFollow}
                    disabled={!followAvailable || followLoading}
                    title={
                      !followAvailable
                        ? "Seguir está disponível apenas para perfis cadastrados."
                        : undefined
                    }
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-5 py-[7px] text-sm font-semibold transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
                      following
                        ? "bg-ig-border text-white hover:bg-[#363636]"
                        : "bg-ig-blue text-white hover:bg-[#1877f2]"
                    )}
                  >
                    {followLoading ? (
                      "..."
                    ) : following ? (
                      <>
                        Seguindo
                        <ChevronDown className="h-4 w-4" />
                      </>
                    ) : (
                      "Seguir"
                    )}
                  </button>
                  <button
                    onClick={onMessage}
                    className="rounded-lg bg-ig-border px-5 py-[7px] text-sm font-semibold transition-all duration-200 hover:bg-[#363636] active:scale-95"
                  >
                    Mensagem
                  </button>
                  <button
                    onClick={onToggleFollow}
                    aria-label={following ? "Deixar de seguir" : "Seguir também"}
                    disabled={!followAvailable || followLoading}
                    title={
                      !followAvailable
                        ? "Seguir está disponível apenas para perfis cadastrados."
                        : undefined
                    }
                    className="hidden rounded-lg bg-ig-border p-[9px] transition-all duration-200 hover:bg-[#363636] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:block"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                onClick={onShare}
                aria-label="Compartilhar perfil"
                className="flex items-center gap-2 rounded-lg bg-ig-border px-3 py-[7px] text-sm font-semibold transition-colors hover:bg-[#363636]"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Compartilhar perfil</span>
                <span className="sm:hidden">Compartilhar</span>
              </button>
              <button
                onClick={onMore}
                aria-label="Mais opções do perfil"
                className="p-1 transition-transform active:scale-90"
              >
                <MoreHorizontal className="h-6 w-6" />
              </button>
            </div>
          </div>

          {!isOwnProfile && !followAvailable && (
            <p className="text-xs text-ig-gray">
              Perfis de demonstração não podem ser seguidos.
            </p>
          )}

          {/* estatísticas desktop */}
          <div className="hidden items-center gap-9 text-[15px] md:flex">
            {stats}
          </div>

          {/* bio desktop */}
          <div className="hidden md:block">{bio}</div>
        </div>
      </div>

      {/* bio mobile */}
      <div className="mt-5 md:hidden">{bio}</div>

      {/* estatísticas mobile */}
      <div className="mt-5 grid grid-cols-3 border-y border-ig-border py-2.5 text-center md:hidden">
        {[
          { value: String(postsCount), label: "publicações" },
          { value: String(followersCount), label: "seguidores" },
          { value: String(followingCount), label: "seguindo" },
        ].map((s) => (
          <button key={s.label} className="py-0.5">
            <p className="text-[15px] font-semibold leading-tight">{s.value}</p>
            <p className="text-[13px] text-ig-gray">{s.label}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
