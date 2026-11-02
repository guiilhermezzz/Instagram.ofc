import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AuthFlow from "./components/AuthFlow";
import Sidebar from "./components/Sidebar";
import { MobileTopBar, MobileBottomBar } from "./components/MobileNav";
import ProfileHeader from "./components/ProfileHeader";
import Highlights from "./components/Highlights";
import PostGrid, { type ProfileTab } from "./components/PostGrid";
import PostModal from "./components/PostModal";
import CreatePostModal from "./components/CreatePostModal";
import EditProfileModal from "./components/EditProfileModal";
import HomeFeed from "./components/HomeFeed";
import MessagesPanel from "./components/MessagesPanel";
import DemoUtilityPanel from "./components/DemoUtilityPanel";
import NotificationsPage from "./components/NotificationsPage";
import StoryViewer from "./components/StoryViewer";
import ProfileSearch, {
  type PublicProfile,
} from "./components/ProfileSearch";
import { supabase } from "./lib/supabase";
import {
  demoFeedPosts,
  demoProfiles,
  highlights,
  myStory,
  type Post,
  type StorySet,
} from "./data";
import type { User } from "@supabase/supabase-js";
import { getProfileUrl, shareUrl } from "./utils/share";

const footerLinks = [
  "Sobre",
  "Ajuda",
  "Imprensa",
  "API",
  "Carreiras",
  "Privacidade",
  "Termos",
  "Localizações",
  "Idioma",
  "Meta Verified",
];

const isMissingPosterColumn = (error: { code?: string; message?: string }) =>
  error.code === "PGRST204" ||
  (error.message?.includes("poster_url") === true &&
    /column|schema cache|does not exist/i.test(error.message));

export default function App() {
  type Page = "home" | "profile" | "reels" | "explore" | "notifications";
  const [authed, setAuthed] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [currentProfile, setCurrentProfile] = useState<PublicProfile | null>(
    null
  );
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined>();
  const [currentEmail, setCurrentEmail] = useState("");
  const [viewedProfile, setViewedProfile] = useState<PublicProfile | null>(
    null
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileShareStatus, setProfileShareStatus] = useState("");
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<string | undefined>();
  const [utilityPanel, setUtilityPanel] = useState<string | null>(null);
  const [page, setPage] = useState<Page>("home");
  const [dbPosts, setDbPosts] = useState<Post[]>([]);
  const [profileHighlights, setProfileHighlights] = useState(highlights);
  const [tab, setTab] = useState<ProfileTab>("posts");
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [story, setStory] = useState<{ set: StorySet; start: number } | null>(
    null
  );
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const activeProfile = viewedProfile ?? currentProfile;
  const activeProfilePosts = [
    ...dbPosts,
    ...(viewedProfile?.id.startsWith("demo-") ? demoFeedPosts : []),
  ].filter((post) => post.authorUsername === activeProfile?.username);

  const syncProfile = useCallback(async (user: User | null) => {
    setAuthed(Boolean(user));
    setViewedProfile(null);
    setAuthError("");

    if (!user) {
      setCurrentProfile(null);
      setCurrentAvatar(undefined);
      setCurrentEmail("");
      setAuthReady(true);
      return;
    }
    setCurrentEmail(user.email ?? "");
    const metadataAvatar =
      typeof user.user_metadata?.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : undefined;
    setCurrentAvatar(metadataAvatar);

    const metadataUsername =
      typeof user.user_metadata?.username === "string"
        ? user.user_metadata.username
        : "";
    const fallbackProfile: PublicProfile = {
      id: user.id,
      username:
        metadataUsername || user.email?.split("@")[0] || "meu perfil",
      full_name:
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : "",
      avatar: metadataAvatar,
    };
    setCurrentProfile(fallbackProfile);

    if (!supabase) {
      setAuthReady(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, bio, gender, website, avatar:avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setAuthError(`Não foi possível carregar seu perfil: ${error.message}`);
      } else if (data) {
        const profile = {
          ...(data as PublicProfile),
          avatar: data.avatar ?? metadataAvatar,
        };
        setCurrentProfile(profile);
        setCurrentAvatar(profile.avatar);
      }
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? `Falha ao carregar seu perfil: ${error.message}`
          : "Falha inesperada ao carregar seu perfil."
      );
    } finally {
      setAuthReady(true);
    }
  }, []);

  const refreshPosts = useCallback(async () => {
    if (!supabase) return;

    try {
      let { data, error } = await supabase
        .from("posts")
        .select("id, user_id, media_url, media_type, poster_url, caption, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error && isMissingPosterColumn(error)) {
        const fallback = await supabase
          .from("posts")
          .select("id, user_id, media_url, media_type, caption, created_at")
          .order("created_at", { ascending: false })
          .limit(100);
        data = fallback.data?.map((row) => ({ ...row, poster_url: null })) ?? null;
        error = fallback.error;
      }

      if (error) {
        setAuthError(`Não foi possível carregar as publicações: ${error.message}`);
        return;
      }

      const rows = (data ?? []) as {
        id: string;
        user_id: string;
        media_url: string;
        media_type: "image" | "video";
        poster_url: string | null;
        caption: string;
        created_at: string;
      }[];
      const userIds = [...new Set(rows.map((post) => post.user_id))];
      const authors = new Map<
        string,
        { username: string; avatar?: string }
      >();

      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, avatar:avatar_url")
          .in("id", userIds);

        if (profilesError) {
          setAuthError(
            `Não foi possível carregar os autores das publicações: ${profilesError.message}`
          );
          return;
        }
        for (const profile of profiles ?? []) {
          authors.set(profile.id, {
            username: profile.username,
            avatar: profile.avatar ?? undefined,
          });
        }
      }

      setDbPosts(
        rows.map((row) => ({
          id: row.id,
          image: row.media_url,
          ...(row.media_type === "video" ? { videoUrl: row.media_url } : {}),
          ...(row.poster_url ? { posterUrl: row.poster_url } : {}),
          authorUsername: authors.get(row.user_id)?.username ?? "Usuário",
          ...(authors.get(row.user_id)?.avatar
            ? { authorAvatar: authors.get(row.user_id)?.avatar }
            : {}),
          likes: 0,
          comments: [],
          caption: row.caption,
          time: "recente",
          createdAt: row.created_at,
          type: row.media_type === "video" ? "reel" : "photo",
        }))
      );
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? `Falha ao carregar publicações: ${error.message}`
          : "Falha inesperada ao carregar publicações."
      );
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncProfile(session?.user ?? null);
    });

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          setAuthError(
            `Não foi possível restaurar a sessão: ${error.message}`
          );
          setAuthReady(true);
          return;
        }
        void syncProfile(data.session?.user ?? null);
      })
      .catch((error: unknown) => {
        setAuthError(
          error instanceof Error
            ? `Falha ao restaurar a sessão: ${error.message}`
            : "Falha inesperada ao restaurar a sessão."
        );
        setAuthReady(true);
      });

    return () => subscription.unsubscribe();
  }, [syncProfile]);

  useEffect(() => {
    if (!authed) {
      setDbPosts([]);
      return;
    }
    void refreshPosts();
  }, [authed, refreshPosts]);

  useEffect(() => {
    const profile = activeProfile;
    const viewerId = currentProfile?.id;
    const client = supabase;
    if (
      !authed ||
      !client ||
      !profile ||
      profile.id.startsWith("demo-")
    ) {
      setFollowing(false);
      setFollowersCount(0);
      setFollowingCount(0);
      setFollowLoading(false);
      return;
    }

    let active = true;
    setFollowing(false);
    setFollowersCount(0);
    setFollowingCount(0);
    setFollowLoading(true);

    const loadFollowData = async () => {
      try {
        const [followers, follows, relationship] = await Promise.all([
          client
            .from("follows")
            .select("follower_id", { count: "exact", head: true })
            .eq("followed_id", profile.id),
          client
            .from("follows")
            .select("followed_id", { count: "exact", head: true })
            .eq("follower_id", profile.id),
          viewerId && viewerId !== profile.id
            ? client
                .from("follows")
                .select("follower_id")
                .eq("follower_id", viewerId)
                .eq("followed_id", profile.id)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ]);

        const error = followers.error ?? follows.error ?? relationship.error;
        if (error) throw error;

        if (active) {
          setFollowersCount(followers.count ?? 0);
          setFollowingCount(follows.count ?? 0);
          setFollowing(Boolean(relationship.data));
        }
      } catch (error) {
        if (active) {
          setAuthError(
            error instanceof Error
              ? `Não foi possível carregar seguidores: ${error.message}`
              : "Falha inesperada ao carregar seguidores."
          );
        }
      } finally {
        if (active) setFollowLoading(false);
      }
    };

    void loadFollowData();
    return () => {
      active = false;
    };
  }, [activeProfile?.id, authed, currentProfile?.id]);

  useEffect(() => {
    const postId = new URLSearchParams(window.location.search).get("post");
    if (!postId) return;

    const post = [...dbPosts, ...demoFeedPosts].find(
      (candidate) => candidate.id === postId
    );
    if (post) setActivePost(post);
  }, [dbPosts]);

  useEffect(() => {
    if (!authed) return;
    const username = new URLSearchParams(window.location.search).get("profile");
    if (!username) return;

    const demoProfile = demoProfiles.find(
      (profile) => profile.username.toLowerCase() === username.toLowerCase()
    );
    if (demoProfile) {
      setViewedProfile({
        id: `demo-${demoProfile.username}`,
        username: demoProfile.username,
        full_name: demoProfile.fullName,
      });
      setPage("profile");
      return;
    }

    if (!supabase) return;
    let active = true;
    void supabase
      .from("profiles")
      .select("id, username, full_name, bio, gender, website, avatar:avatar_url")
      .ilike("username", username)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setAuthError(`Não foi possível abrir o perfil compartilhado: ${error.message}`);
          return;
        }
        if (!data) {
          setAuthError("O perfil compartilhado não foi encontrado.");
          return;
        }
        setViewedProfile(data as PublicProfile);
        setPage("profile");
      });
    return () => {
      active = false;
    };
  }, [authed]);

  useEffect(() => {
    document.body.style.overflow = activePost || story ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activePost, story]);

  const handleAuth = useCallback(() => {
    setAuthed(true);
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = useCallback(async () => {
    if (!supabase) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        window.alert(`Não foi possível sair: ${error.message}`);
        return;
      }

      setAuthed(false);
      setCurrentProfile(null);
      setViewedProfile(null);
      setDbPosts([]);
      setPage("home");
      setActivePost(null);
      setStory(null);
      window.scrollTo(0, 0);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? `Falha de conexão ao sair: ${error.message}`
          : "Falha inesperada ao sair."
      );
    }
  }, []);

  const toggleLike = useCallback((id: string, force?: boolean) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id) && !force) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSave = useCallback((id: string) => {
    setSavedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleFollow = useCallback(async () => {
    const target = activeProfile;
    const viewerId = currentProfile?.id;
    if (!supabase || !target || !viewerId || followLoading) return;
    if (target.id.startsWith("demo-")) {
      setAuthError("Perfis de demonstração não podem ser seguidos.");
      return;
    }
    if (target.id === viewerId) return;

    setFollowLoading(true);
    setAuthError("");
    try {
      const request = following
        ? supabase
            .from("follows")
            .delete()
            .eq("follower_id", viewerId)
            .eq("followed_id", target.id)
        : supabase.from("follows").insert({
            follower_id: viewerId,
            followed_id: target.id,
          });
      const { error } = await request;
      if (error) throw error;

      setFollowing(!following);
      setFollowersCount((count) =>
        Math.max(0, count + (following ? -1 : 1))
      );
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? `Não foi possível atualizar o follow: ${error.message}`
          : "Falha inesperada ao atualizar o follow."
      );
    } finally {
      setFollowLoading(false);
    }
  }, [activeProfile, currentProfile?.id, followLoading, following]);

  const openOwnProfile = useCallback(() => {
    setViewedProfile(null);
    setPage("profile");
    setSearchOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const openHome = useCallback(() => {
    setViewedProfile(null);
    setPage("home");
    window.scrollTo(0, 0);
  }, []);

  const openReels = useCallback(() => {
    setViewedProfile(null);
    setPage("reels");
    window.scrollTo(0, 0);
  }, []);

  const openExplore = useCallback(() => {
    setViewedProfile(null);
    setPage("explore");
    window.scrollTo(0, 0);
  }, []);

  const openNotifications = useCallback(() => {
    setViewedProfile(null);
    setPage("notifications");
    setSearchOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const handleShareProfile = useCallback(async () => {
    const profile = viewedProfile ?? currentProfile;
    if (!profile) return;
    setProfileShareStatus("");
    try {
      const result = await shareUrl(
        getProfileUrl(profile.username),
        `Perfil de ${profile.username}`
      );
      if (result === "shared") setProfileShareStatus("Perfil compartilhado.");
      if (result === "copied") setProfileShareStatus("Link do perfil copiado.");
    } catch (error) {
      setProfileShareStatus(
        error instanceof Error
          ? `Não foi possível compartilhar: ${error.message}`
          : "Falha inesperada ao compartilhar o perfil."
      );
    }
  }, [currentProfile, viewedProfile]);

  const addHighlight = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      window.alert("Destaques demonstrativos aceitam apenas imagens.");
      return;
    }

    const url = URL.createObjectURL(file);
    const title =
      file.name.replace(/\.[^.]+$/, "").trim().slice(0, 18) || "Novo";
    const id = `highlight-${crypto.randomUUID()}`;
    setProfileHighlights((current) => [
      ...current,
      {
        id,
        title,
        cover: url,
        stories: {
          id,
          title,
          images: [url],
          times: ["agora"],
        },
      },
    ]);
  }, []);

  const openMessages = useCallback((recipient?: string) => {
    setMessageRecipient(recipient);
    setMessagesOpen(true);
  }, []);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-sm text-[#a8a8a8]">
        Carregando sessão...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AnimatePresence mode="wait">
        {!authed ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div>
              {authError && (
                <p
                  role="alert"
                  className="mx-auto max-w-[350px] px-4 pt-4 text-center text-sm text-red-400"
                >
                  {authError}
                </p>
              )}
              <AuthFlow onSuccess={handleAuth} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Sidebar
              username={currentProfile?.username ?? ""}
              avatar={currentProfile?.avatar}
              onLogout={handleLogout}
              onHome={openHome}
              onSearch={() => setSearchOpen(true)}
              onReels={openReels}
              onCreatePost={() => setCreatePostOpen(true)}
              onMessages={() => openMessages()}
              onNotifications={openNotifications}
              onExplore={openExplore}
              onUtility={setUtilityPanel}
              onProfile={openOwnProfile}
            />
            <MobileTopBar
              username={(viewedProfile ?? currentProfile)?.username ?? ""}
              onLogout={handleLogout}
              onCreatePost={() => setCreatePostOpen(true)}
              onMessages={() => openMessages()}
              onNotifications={openNotifications}
              onUtility={setUtilityPanel}
            />

            {authError && (
              <p
                role="alert"
                className="mx-auto max-w-[600px] px-4 pt-4 text-center text-sm text-red-400 lg:pl-[76px] xl:pl-[245px]"
              >
                {authError}
              </p>
            )}

            <main className="lg:pl-[76px] xl:pl-[245px]">
              <div className="mx-auto max-w-[975px] pb-24 md:pb-16">
                {page === "notifications" ? (
                  <NotificationsPage />
                ) : page === "home" || page === "explore" ? (
                  <HomeFeed
                    title={page === "home" ? "Página inicial" : "Explorar"}
                    username={currentProfile?.username ?? ""}
                    posts={[...dbPosts, ...demoFeedPosts]}
                    likedPosts={likedPosts}
                    savedPosts={savedPosts}
                    onToggleLike={toggleLike}
                    onToggleSave={toggleSave}
                    onOpenPost={setActivePost}
                    onCreatePost={() => setCreatePostOpen(true)}
                    onOpenStory={(storySet) =>
                      setStory({ set: storySet, start: 0 })
                    }
                    showStories={page === "home"}
                  />
                ) : page === "reels" ? (
                  <HomeFeed
                    title="Reels"
                    username={currentProfile?.username ?? ""}
                    posts={dbPosts.filter((post) => post.videoUrl)}
                    likedPosts={likedPosts}
                    savedPosts={savedPosts}
                    onToggleLike={toggleLike}
                    onToggleSave={toggleSave}
                    onOpenPost={setActivePost}
                    onCreatePost={() => setCreatePostOpen(true)}
                    onOpenStory={(storySet) =>
                      setStory({ set: storySet, start: 0 })
                    }
                  />
                ) : (
                  <>
                    {(viewedProfile ?? currentProfile) && (
                      <ProfileHeader
                        profile={activeProfile!}
                        postsCount={activeProfilePosts.length}
                        isOwnProfile={
                          (viewedProfile ?? currentProfile)?.id ===
                          currentProfile?.id
                        }
                        following={following}
                        followersCount={followersCount}
                        followingCount={followingCount}
                        followLoading={followLoading}
                        followAvailable={
                          Boolean(supabase) &&
                          !activeProfile!.id.startsWith("demo-") &&
                          activeProfile!.id !== currentProfile?.id
                        }
                        onToggleFollow={() => void toggleFollow()}
                        onMessage={() =>
                          openMessages((viewedProfile ?? currentProfile)!.username)
                        }
                        onEdit={() => setEditProfileOpen(true)}
                        onShare={() => void handleShareProfile()}
                        onMore={() => setUtilityPanel("Opções do perfil")}
                        onOpenStory={() =>
                          setStory({ set: myStory, start: 0 })
                        }
                      />
                    )}

                    {profileShareStatus && (
                      <p
                        role="status"
                        className="mx-4 mt-3 text-center text-sm text-ig-gray"
                      >
                        {profileShareStatus}
                      </p>
                    )}

                    <Highlights
                      highlights={profileHighlights}
                      onOpen={(i) =>
                        setStory({ set: profileHighlights[i].stories, start: 0 })
                      }
                      onAdd={addHighlight}
                    />

                    <PostGrid
                      posts={activeProfilePosts}
                      activeTab={tab}
                      onTabChange={setTab}
                      onOpenPost={setActivePost}
                    />
                  </>
                )}

                {/* rodapé */}
                <footer className="mt-14 hidden px-10 lg:block">
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-[#737373]">
                    {footerLinks.map((link) => (
                      <a
                        key={link}
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="transition-colors hover:text-ig-gray"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs uppercase text-[#737373]">
                    <span>Português (Brasil)</span>
                    <span>© 2026 Instagram do Meta</span>
                  </div>
                </footer>
              </div>
            </main>

            <MobileBottomBar
              username={currentProfile?.username ?? ""}
              avatar={currentProfile?.avatar}
              onHome={openHome}
              onSearch={() => setSearchOpen(true)}
              onCreatePost={() => setCreatePostOpen(true)}
              onReels={openReels}
              onMessages={() => openMessages()}
              onProfile={openOwnProfile}
            />

            {searchOpen && (
              <ProfileSearch
                posts={dbPosts}
                onClose={() => setSearchOpen(false)}
                onSelectProfile={(profile) => {
                  setViewedProfile(profile);
                  setPage("profile");
                  setSearchOpen(false);
                  window.scrollTo(0, 0);
                }}
                onSelectPost={(post) => {
                  setActivePost(post);
                  setSearchOpen(false);
                }}
              />
            )}

            {createPostOpen && (
              <CreatePostModal
                username={currentProfile?.username ?? ""}
                onClose={() => setCreatePostOpen(false)}
                onCreated={(post, warning) => {
                  setDbPosts((current) => [post, ...current]);
                  setCreatePostOpen(false);
                  setViewedProfile(null);
                  setPage("profile");
                  setTab(post.videoUrl ? "reels" : "posts");
                  if (warning) window.alert(warning);
                }}
              />
            )}

            {editProfileOpen && currentProfile && (
              <EditProfileModal
                profile={currentProfile}
                email={currentEmail}
                onClose={() => setEditProfileOpen(false)}
                onSaved={(profile, email) => {
                  setCurrentProfile(profile);
                  setCurrentAvatar(profile.avatar);
                  setCurrentEmail(email);
                }}
              />
            )}

            {messagesOpen && (
              <MessagesPanel
                userId={currentProfile?.id ?? ""}
                currentUsername={currentProfile?.username ?? ""}
                currentAvatar={currentAvatar}
                initialRecipient={messageRecipient}
                onClose={() => {
                  setMessagesOpen(false);
                  setMessageRecipient(undefined);
                }}
              />
            )}

            {utilityPanel && (
              <DemoUtilityPanel
                title={utilityPanel}
                posts={dbPosts.filter((post) =>
                  utilityPanel === "Salvos"
                    ? savedPosts.has(post.id)
                    : utilityPanel === "Sua atividade"
                      ? likedPosts.has(post.id)
                      : false
                )}
                onClose={() => setUtilityPanel(null)}
              />
            )}

            {/* modal de publicação */}
            <AnimatePresence>
              {activePost && (
                <PostModal
                  key="post-modal"
                  post={activePost}
                  username={(viewedProfile ?? currentProfile)?.username ?? ""}
                  liked={likedPosts.has(activePost.id)}
                  saved={savedPosts.has(activePost.id)}
                  onToggleLike={toggleLike}
                  onToggleSave={toggleSave}
                  onClose={() => setActivePost(null)}
                />
              )}
            </AnimatePresence>

            {/* visualizador de stories */}
            <AnimatePresence>
              {story && (
                <StoryViewer
                  key={story.set.id}
                  set={story.set}
                  startIndex={story.start}
                  username={(viewedProfile ?? currentProfile)?.username ?? ""}
                  onClose={() => setStory(null)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
