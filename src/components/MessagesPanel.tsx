import { useEffect, useState } from "react";
import { ArrowLeft, MessageCircle, Send, X } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Message {
  id: string;
  text: string;
  sent: boolean;
}

interface Conversation {
  username: string;
  preview: string;
  messages: Message[];
}

interface Props {
  userId: string;
  currentUsername: string;
  currentAvatar?: string;
  initialRecipient?: string;
  onClose: () => void;
}

interface StoredMessage {
  id: string;
  recipient_username: string;
  body: string;
  created_at: string;
}

const demoConversations: Conversation[] = [
  {
    username: "bia.destinos",
    preview: "Amei suas fotos!",
    messages: [
      { id: "demo-1", text: "Oi! Como foi a viagem?", sent: false },
      {
        id: "demo-2",
        text: "Foi incrível, vou postar mais fotos em breve.",
        sent: true,
      },
      { id: "demo-3", text: "Amei suas fotos!", sent: false },
    ],
  },
  {
    username: "carlos.aventura",
    preview: "Vamos marcar um café?",
    messages: [
      { id: "demo-4", text: "Você conhece aquele café novo?", sent: false },
      { id: "demo-5", text: "Vamos marcar um café?", sent: false },
    ],
  },
  {
    username: "lulu.viaja",
    preview: "Obrigada pelas dicas ✨",
    messages: [
      { id: "demo-6", text: "As dicas de Lisboa foram ótimas!", sent: false },
      { id: "demo-7", text: "Obrigada pelas dicas ✨", sent: false },
    ],
  },
];

const demoAvatars: Record<string, string> = {
  "bia.destinos": "https://i.pravatar.cc/96?img=47",
  "carlos.aventura": "https://i.pravatar.cc/96?img=15",
  "lulu.viaja": "https://i.pravatar.cc/96?img=44",
};

function Avatar({
  username,
  src,
  size,
}: {
  username: string;
  src?: string;
  size: "small" | "medium" | "large";
}) {
  const dimensions = {
    small: "h-8 w-8 text-xs",
    medium: "h-9 w-9 text-sm",
    large: "h-11 w-11 text-sm",
  }[size];
  const avatar = src ?? demoAvatars[username];

  return avatar ? (
    <img
      src={avatar}
      alt={`Foto de perfil de ${username}`}
      className={`${dimensions} shrink-0 rounded-full object-cover`}
    />
  ) : (
    <span
      aria-label={`Foto de perfil de ${username}`}
      className={`${dimensions} flex shrink-0 items-center justify-center rounded-full bg-[#262626] font-semibold`}
    >
      {username.slice(0, 1).toUpperCase()}
    </span>
  );
}

export default function MessagesPanel({
  userId,
  currentUsername,
  currentAvatar,
  initialRecipient,
  onClose,
}: Props) {
  const [conversations, setConversations] = useState(() => {
    if (
      initialRecipient &&
      !demoConversations.some((conversation) => conversation.username === initialRecipient)
    ) {
      return [
        {
          username: initialRecipient,
          preview: "Inicie uma conversa",
          messages: [],
        },
        ...demoConversations,
      ];
    }
    return demoConversations;
  });
  const [selected, setSelected] = useState(
    initialRecipient ?? demoConversations[0].username
  );
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadMessages = async () => {
      if (!supabase) {
        setError("Configure o Supabase para salvar e carregar suas mensagens.");
        setLoading(false);
        return;
      }

      try {
        const { data, error: loadError } = await supabase
          .from("user_messages")
          .select("id, recipient_username, body, created_at")
          .eq("owner_id", userId)
          .order("created_at", { ascending: true });

        if (!active) return;
        if (loadError) {
          setError(
            `Não foi possível carregar suas mensagens: ${loadError.message}`
          );
          setLoading(false);
          return;
        }

        const messages = (data ?? []) as StoredMessage[];
        setConversations((current) => {
          const next = new Map(
            current.map((conversation) => [
              conversation.username,
              conversation,
            ])
          );

          for (const stored of messages) {
            const conversation = next.get(stored.recipient_username) ?? {
              username: stored.recipient_username,
              preview: "",
              messages: [],
            };
            if (
              !conversation.messages.some(
                (message) => message.id === stored.id
              )
            ) {
              conversation.messages.push({
                id: stored.id,
                text: stored.body,
                sent: true,
              });
            }
            conversation.preview = stored.body;
            next.set(stored.recipient_username, conversation);
          }

          return [...next.values()];
        });
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? `Falha ao carregar mensagens: ${loadError.message}`
              : "Falha inesperada ao carregar mensagens."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadMessages();
    return () => {
      active = false;
    };
  }, [userId]);

  const selectedConversation = conversations.find(
    (conversation) => conversation.username === selected
  );

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    if (!supabase) {
      setError("Configure o Supabase para salvar suas mensagens.");
      return;
    }

    setSending(true);
    setError("");
    try {
      const { data, error: saveError } = await supabase
        .from("user_messages")
        .insert({
          owner_id: userId,
          recipient_username: selected,
          body: text,
        })
        .select("id, recipient_username, body, created_at")
        .single();

      if (saveError) throw saveError;

      const savedMessage = data as StoredMessage;
      setConversations((current) => {
        const found = current.some(
          (conversation) => conversation.username === selected
        );
        if (!found) {
          return [
            {
              username: selected,
              preview: savedMessage.body,
              messages: [
                { id: savedMessage.id, text: savedMessage.body, sent: true },
              ],
            },
            ...current,
          ];
        }
        return current.map((conversation) =>
          conversation.username === selected
            ? {
                ...conversation,
                preview: savedMessage.body,
                messages: [
                  ...conversation.messages,
                  {
                    id: savedMessage.id,
                    text: savedMessage.body,
                    sent: true,
                  },
                ],
              }
            : conversation
        );
      });
      setDraft("");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `Não foi possível salvar a mensagem: ${saveError.message}`
          : "Falha inesperada ao salvar a mensagem."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/70 p-3 md:p-8">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Mensagens"
        className="flex h-[min(760px,92vh)] w-full max-w-[900px] overflow-hidden rounded-xl border border-ig-border bg-black"
      >
        <aside
          className={`w-full border-r border-ig-border md:w-[320px] ${
            selectedConversation ? "hidden md:block" : ""
          }`}
        >
          <header className="flex h-14 items-center justify-between border-b border-ig-border px-4">
            <h2 className="font-semibold">{currentUsername}</h2>
            <button onClick={onClose} aria-label="Fechar mensagens">
              <X className="h-5 w-5" />
            </button>
          </header>
          <p className="px-4 pb-2 pt-4 text-sm font-semibold">Mensagens</p>
          {conversations.map((conversation) => (
            <button
              key={conversation.username}
              onClick={() => setSelected(conversation.username)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-ig-hover ${
                selected === conversation.username ? "bg-[#121212]" : ""
              }`}
            >
              <Avatar
                username={conversation.username}
                size="large"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm">
                  {conversation.username}
                </span>
                <span className="block truncate text-xs text-ig-gray">
                  {conversation.preview}
                </span>
              </span>
            </button>
          ))}
          <p className="px-4 py-3 text-xs text-ig-gray">
            Mensagens enviadas ficam salvas na sua conta. Elas não são entregues
            a outras pessoas.
          </p>
        </aside>

        {selectedConversation && (
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-14 items-center gap-3 border-b border-ig-border px-4">
              <button
                onClick={() => setSelected("")}
                className="md:hidden"
                aria-label="Voltar às conversas"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar
                username={selectedConversation.username}
                size="medium"
              />
              <span className="flex-1 text-sm font-semibold">
                {selectedConversation.username}
              </span>
              <button onClick={onClose} aria-label="Fechar mensagens">
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="flex flex-1 flex-col justify-end gap-2 overflow-y-auto p-4">
              {loading && (
                <p className="m-auto text-sm text-ig-gray">
                  Carregando mensagens...
                </p>
              )}
              {selectedConversation.messages.length === 0 && (
                <div className="m-auto text-center text-sm text-ig-gray">
                  <MessageCircle className="mx-auto mb-2 h-8 w-8" />
                  Envie uma mensagem para iniciar a conversa.
                </div>
              )}
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex max-w-[85%] items-end gap-2 ${
                    message.sent ? "ml-auto" : "mr-auto"
                  }`}
                >
                  {!message.sent && (
                    <Avatar
                      username={selectedConversation.username}
                      size="small"
                    />
                  )}
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm ${
                      message.sent
                        ? "bg-[#3797f0] text-white"
                        : "bg-[#262626]"
                    }`}
                  >
                    {message.text}
                  </div>
                  {message.sent && currentAvatar && (
                    <Avatar
                      username={currentUsername}
                      src={currentAvatar}
                      size="small"
                    />
                  )}
                </div>
              ))}
              {error && (
                <p className="text-center text-xs text-red-400" role="alert">
                  {error}
                </p>
              )}
            </div>
            <form
              onSubmit={sendMessage}
              className="m-4 flex items-center gap-2 rounded-full border border-ig-border px-4"
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={2000}
                placeholder="Enviar mensagem..."
                aria-label="Mensagem"
                className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim() || sending || loading}
                aria-label="Enviar mensagem"
                className="text-ig-blue disabled:opacity-40"
              >
                {sending ? (
                  <span className="text-xs font-semibold">Salvando...</span>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
