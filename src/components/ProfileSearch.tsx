import { useState } from "react";
import { Image, Search, Users, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { demoFeedPosts, demoProfiles, type Post } from "../data";
import PostImage from "./PostImage";

export interface PublicProfile {
  id: string;
  username: string;
  full_name: string;
  avatar?: string;
  bio?: string;
  gender?: string;
  website?: string;
}

interface Props {
  posts: Post[];
  onClose: () => void;
  onSelectProfile: (profile: PublicProfile) => void;
  onSelectPost: (post: Post) => void;
}

const maxSearchResults = 100;

export default function ProfileSearch({
  posts,
  onClose,
  onSelectProfile,
  onSelectPost,
}: Props) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "posts">("users");
  const [userResults, setUserResults] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const term = query.trim().toLocaleLowerCase("pt-BR");
  const postResults = term
    ? [...posts, ...demoFeedPosts]
        .filter(
          (post, index, allPosts) =>
            allPosts.findIndex((candidate) => candidate.id === post.id) ===
              index &&
            [post.caption, post.authorUsername, post.location]
              .filter(Boolean)
              .some((value) =>
                value!.toLocaleLowerCase("pt-BR").includes(term)
              )
        )
        .slice(0, maxSearchResults)
    : [];

  const search = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!term || loading) return;

    setLoading(true);
    setMessage("");
    setUserResults([]);

    const localProfiles: PublicProfile[] = demoProfiles
      .filter(
        (profile) =>
          profile.username.toLocaleLowerCase("pt-BR").includes(term) ||
          profile.fullName.toLocaleLowerCase("pt-BR").includes(term)
      )
      .map((profile) => ({
        id: `demo-${profile.username}`,
        username: profile.username,
        full_name: profile.fullName,
        avatar: profile.avatar,
      }));

    if (!supabase) {
      setUserResults(localProfiles);
      setMessage(
        localProfiles.length === 0
          ? "Nenhum perfil encontrado. Conecte o Supabase para pesquisar usuários cadastrados."
          : ""
      );
      setLoading(false);
      return;
    }

    try {
      const [usernameMatches, nameMatches] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, full_name, avatar:avatar_url")
          .ilike("username", `%${term}%`)
          .limit(maxSearchResults),
        supabase
          .from("profiles")
          .select("id, username, full_name, avatar:avatar_url")
          .ilike("full_name", `%${term}%`)
          .limit(maxSearchResults),
      ]);

      const error = usernameMatches.error ?? nameMatches.error;
      if (error) {
        setUserResults(localProfiles);
        setMessage(`Não foi possível pesquisar perfis: ${error.message}`);
        return;
      }

      const profilesById = new Map<string, PublicProfile>();
      for (const profile of localProfiles) {
        profilesById.set(profile.id, profile);
      }
      for (const profile of [
        ...(usernameMatches.data ?? []),
        ...(nameMatches.data ?? []),
      ]) {
        profilesById.set(profile.id, profile as PublicProfile);
      }

      const profiles = [...profilesById.values()]
        .sort((left, right) => left.username.localeCompare(right.username))
        .slice(0, maxSearchResults);
      setUserResults(profiles);
      if (profiles.length === 0) setMessage("Nenhum perfil encontrado.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Falha ao pesquisar perfis: ${error.message}`
          : "Falha inesperada ao pesquisar perfis."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex bg-black/60"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-search-title"
        className="h-full w-full max-w-[400px] rounded-r-2xl border-r border-ig-border bg-black p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="profile-search-title" className="text-2xl font-semibold">
            Pesquisa
          </h2>
          <button onClick={onClose} aria-label="Fechar pesquisa">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={search} className="mt-7 flex gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#262626] px-3">
            <Search className="h-4 w-4 shrink-0 text-ig-gray" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                activeTab === "users"
                  ? "Pesquisar usuários"
                  : "Pesquisar publicações"
              }
              aria-label="Pesquisar usuários ou publicações"
              className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ig-gray"
            />
          </label>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="rounded-lg bg-ig-blue px-3 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "..." : "Buscar"}
          </button>
        </form>

        <div className="mt-5 grid grid-cols-2 rounded-lg bg-[#121212] p-1">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-semibold ${
              activeTab === "users" ? "bg-[#262626]" : "text-ig-gray"
            }`}
          >
            <Users className="h-4 w-4" />
            Usuários
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-semibold ${
              activeTab === "posts" ? "bg-[#262626]" : "text-ig-gray"
            }`}
          >
            <Image className="h-4 w-4" />
            Publicações
          </button>
        </div>

        <div className="thin-scroll mt-3 max-h-[calc(100vh-180px)] space-y-1 overflow-y-auto">
          {activeTab === "users" &&
            userResults.map((profile) => (
              <button
                key={profile.id}
                onClick={() => onSelectProfile(profile)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-ig-hover"
              >
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#262626] text-sm font-semibold">
                    {profile.username.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {profile.username}
                  </span>
                  <span className="block truncate text-sm text-ig-gray">
                    {profile.full_name}
                  </span>
                </span>
              </button>
            ))}

          {activeTab === "posts" &&
            postResults.map((post) => (
              <button
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-ig-hover"
              >
                <PostImage
                  src={post.image}
                  alt=""
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-md object-cover"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {post.authorUsername ?? "Usuário"}
                  </span>
                  <span className="block text-xs text-ig-gray">
                    {post.caption || post.location || "Publicação"}
                  </span>
                </span>
              </button>
            ))}

          {activeTab === "users" &&
            term.length > 0 &&
            userResults.length === 0 &&
            !loading &&
            !message && (
              <p className="px-2 py-4 text-sm text-ig-gray" role="status">
                Nenhum perfil encontrado.
              </p>
            )}
          {activeTab === "posts" && term.length > 0 && postResults.length === 0 && (
            <p className="px-2 py-4 text-sm text-ig-gray" role="status">
              Nenhuma publicação encontrada.
            </p>
          )}
          {message && (
            <p
              className="px-2 py-4 text-sm text-ig-gray"
              role={message.startsWith("Não foi") ? "alert" : "status"}
            >
              {message}
            </p>
          )}
          {activeTab === "posts" && term.length === 0 && (
            <p className="px-2 py-4 text-sm text-ig-gray">
              Pesquise por legenda, usuário ou localização.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
