import { Heart } from "lucide-react";

export default function NotificationsPage() {
  return (
    <section
      aria-labelledby="notifications-title"
      className="mx-auto min-h-[calc(100vh-7rem)] max-w-[630px] border-x border-ig-border"
    >
      <header className="border-b border-ig-border px-5 py-5">
        <h1 id="notifications-title" className="text-xl font-semibold">
          Notificações
        </h1>
      </header>

      <div className="px-5 py-6">
        <h2 className="text-base font-semibold">Hoje</h2>
        <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white">
            <Heart className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold">Você está em dia</h3>
          <p className="mt-2 max-w-sm text-sm leading-5 text-ig-gray">
            Quando alguém curtir ou comentar suas publicações, ou começar a
            seguir você, as notificações aparecerão aqui.
          </p>
        </div>
      </div>
    </section>
  );
}
