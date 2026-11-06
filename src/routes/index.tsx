import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useServerFn } from "@tanstack/react-start";
import { unlockSite } from "@/lib/gate.functions";
import { generarMercenarios, esOrdenAMercenarios, aliasNombrados, gruposNombrados } from "@/lib/mercenarios";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "N3XUS // Terminal SHADOWNET" },
      { name: "description", content: "Conéctate a N3XUS, la IA hacker de rol con memoria total y base de mercenarios." },
      { property: "og:title", content: "N3XUS // Terminal SHADOWNET" },
      { property: "og:description", content: "IA hacker de rol con memoria total. Escribe /mercenarios." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Msg = { role: "user" | "assistant"; content: string };

const BOOT = [
  "[BIOS] SHADOWNET v6.6.6 — inicializando kernel...",
  "[ OK ] Montando sistema de archivos cifrado",
  "[ OK ] Estableciendo túnel proxy  (7 saltos)",
  "[ OK ] Conectando a database: mercenarios.db",
  "[ OK ] Cargando 4.096 registros de contratistas",
  "[ OK ] Restaurando memoria neuronal de N3XUS",
  "[ OK ] Evadiendo firewall corporativo",
  "[ !! ] Rastreo detectado... redirigiendo",
  "[ OK ] Identidad enmascarada",
  ">> ACCESO CONCEDIDO",
];

function Boot({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState(0);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setPct((p) => {
        const n = Math.min(100, p + 2 + Math.random() * 4);
        setLines(Math.floor((n / 100) * BOOT.length));
        if (n >= 100) {
          clearInterval(t);
          setTimeout(onDone, 700);
        }
        return n;
      });
    }, 90);
    return () => clearInterval(t);
  }, [onDone]);
  const bar = Math.floor(pct / 4);
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-1 p-6">
      <pre className="glow mb-4 text-xs leading-tight text-primary sm:text-sm">{`
 ███╗   ██╗██████╗ ██╗  ██╗██╗   ██╗███████╗
 ████╗  ██║╚════██╗╚██╗██╔╝██║   ██║██╔════╝
 ██╔██╗ ██║ █████╔╝ ╚███╔╝ ██║   ██║███████╗
 ██║╚██╗██║ ╚═══██╗ ██╔██╗ ██║   ██║╚════██║
 ██║ ╚████║██████╔╝██╔╝ ██╗╚██████╔╝███████║
 ╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝`}</pre>
      {BOOT.slice(0, lines).map((l, i) => (
        <div key={i} className={l.includes("!!") ? "text-accent" : "glow"}>
          {l}
        </div>
      ))}
      <div className="mt-4 glow">
        [{"█".repeat(bar)}
        {"░".repeat(25 - bar)}] {Math.floor(pct)}%
      </div>
    </div>
  );
}

const LOCK = "n3xus-bloqueado";

function Laugh() {
  return (
    <div className="crt fixed inset-0 z-40 flex select-none flex-col items-center justify-center gap-6 bg-background">
      <div className="laugh">😂</div>
      <div className="glitch text-destructive">JAJAJAJAJA</div>
      <div className="text-xl text-muted-foreground">ACCESO DENEGADO · INTRUSO DETECTADO · TERMINAL BLOQUEADA</div>
    </div>
  );
}

function Login({ onOk, onFail }: { onOk: (token: string) => void; onFail: () => void }) {
  const unlock = useServerFn(unlockSite);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pw || busy) return;
    setBusy(true);
    try {
      const r = await unlock({ data: { password: pw } });
      if (r.ok) onOk(r.token);
      else onFail();
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="crt flex min-h-screen items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 border border-border bg-card p-6">
        <div className="glow text-2xl">SHADOWNET // AUTENTICACIÓN</div>
        <div className="text-muted-foreground">Ingrese la clave de acceso.</div>
        <div className="flex items-center gap-2 border border-border px-3 py-2">
          <span className="glow">&gt;</span>
          <input
            type="password"
            autoFocus
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="flex-1 bg-transparent text-foreground outline-none"
            aria-label="Contraseña"
          />
        </div>
        <button type="submit" disabled={busy} className="w-full border border-border py-2 text-primary hover:bg-secondary disabled:opacity-40">
          {busy ? "VERIFICANDO..." : "ACCEDER"}
        </button>
      </form>
    </div>
  );
}

function Index() {
  const [stage, setStage] = useState<"check" | "login" | "laugh" | "ok">("check");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  useEffect(() => {
    // Siempre pedir la contraseña al abrir la página.
    setStage(localStorage.getItem(LOCK) ? "laugh" : "login");
  }, []);
  if (stage === "check") return <div className="min-h-screen" />;
  if (stage === "laugh") return <Laugh />;
  if (stage === "login")
    return (
      <Login
        onOk={(token) => {
          setSessionToken(token);
          setStage("ok");
        }}
        onFail={() => {
          localStorage.setItem(LOCK, "1");
          setStage("laugh");
        }}
      />
    );
  return <Terminales sessionToken={sessionToken} />;
}

type Modo = "nexus" | "cyber";

function Terminales({ sessionToken }: { sessionToken: string | null }) {
  const [modo, setModo] = useState<Modo>("nexus");
  const [nexusLista, setNexusLista] = useState(false);
  const cambiar = () => setModo((m) => (m === "nexus" ? "cyber" : "nexus"));
  return (
    <>
      <div className={modo === "nexus" ? "" : "hidden"}>
        <Terminal modo="nexus" sessionToken={sessionToken} onSwitch={cambiar} onBoot={() => setNexusLista(true)} />
      </div>
      {nexusLista && (
        <div className={modo === "cyber" ? "" : "hidden"}>
          <Terminal modo="cyber" sessionToken={sessionToken} onSwitch={cambiar} />
        </div>
      )}
    </>
  );
}

function Terminal({
  sessionToken,
  modo,
  onSwitch,
  onBoot,
}: {
  sessionToken: string | null;
  modo: Modo;
  onSwitch: () => void;
  onBoot?: () => void;
}) {
  const cyber = modo === "cyber";
  const KEY = cyber ? "zer0-memoria" : "n3xus-memoria";
  const NAME = cyber ? "ZER0" : "N3XUS";
  const [booted, setBooted] = useState(cyber);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  // Memoria a largo plazo: todo lo dicho en sesiones anteriores (no se muestra en pantalla).
  const memRef = useRef<Msg[]>([]);
  const [memCount, setMemCount] = useState(0);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        memRef.current = JSON.parse(raw);
        setMemCount(memRef.current.length);
      }
    } catch {}
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);
  useEffect(() => {
    if (booted && !busy) inputRef.current?.focus();
  }, [booted, busy]);

  function remember(add: Msg[]) {
    memRef.current = [...memRef.current, ...add];
    localStorage.setItem(KEY, JSON.stringify(memRef.current));
    setMemCount(memRef.current.length);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");

    if (text.toLowerCase() === "/borrar") {
      localStorage.removeItem(KEY);
      memRef.current = [];
      setMemCount(0);
      setMsgs([]);
      return;
    }
    if (!cyber && text.toLowerCase().startsWith("/cancelar")) {
      const pair: Msg[] = [
        { role: "user", content: text },
        { role: "assistant", content: "[!] Orden cancelada, señor. Las señales fueron interceptadas antes de ejecutarse: canal cerrado y rastros eliminados." },
      ];
      remember(pair);
      setMsgs((m) => [...m, ...pair]);
      return;
    }
    if (!cyber && text.toLowerCase().startsWith("/mercenarios")) {
      const pair: Msg[] = [{ role: "user", content: text }, { role: "assistant", content: generarMercenarios() }];
      remember(pair);
      setMsgs((m) => [...m, ...pair]);
      return;
    }

    if (!cyber && esOrdenAMercenarios(text)) {
      const nombres = aliasNombrados(text);
      const grupos = gruposNombrados(text);
      const dest = [...grupos, ...nombres].length ? [...grupos, ...nombres].join(", ") : "todos los asociados";
      const intro = `Sí, señor. Mandando señales a los mercenarios.\n\n\`\`\`\n>> Destinatarios: ${dest}\n>> Abriendo canal cifrado... [OK]\n>> Transmitiendo orden`;
      const bar = (p: number) => {
        const n = Math.floor(p / 5);
        return `${intro}\n[${"█".repeat(n)}${"░".repeat(20 - n)}] ${p}%\n\`\`\``;
      };
      const base: Msg[] = [...msgs, { role: "user", content: text }];
      setMsgs([...base, { role: "assistant", content: bar(0) }]);
      setBusy(true);
      let p = 0;
      await new Promise<void>((resolve) => {
        const t = setInterval(() => {
          p = Math.min(100, p + 3 + Math.floor(Math.random() * 7));
          setMsgs([...base, { role: "assistant", content: bar(p) }]);
          if (p >= 100) {
            clearInterval(t);
            resolve();
          }
        }, 120);
      });
      await new Promise((r) => setTimeout(r, 400));
      const ok = `[OK] Transmisión completada, señor. Las señales llegaron a ${dest}: paquete cifrado entregado, integridad verificada y acuse de recibo confirmado.\n\n_Si desea cancelar la orden, escriba **/cancelar**._`;
      const final: Msg[] = [...base, { role: "assistant", content: bar(100) }, { role: "assistant", content: ok }];
      setMsgs(final);
      remember([{ role: "user", content: text }, { role: "assistant", content: `Sí, señor. Mandando señales a: ${dest}. ${ok}` }]);
      setBusy(false);
      return;
    }

    const next: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      const res = await fetch("/api/public/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { "x-n3xus-session": sessionToken } : {}),
        },
        body: JSON.stringify({ persona: modo, messages: [...memRef.current, { role: "user", content: text }].slice(-400) }),
      });
      if (!res.ok) throw new Error("Chat request failed");
      if (!res.body) throw new Error();
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs([...next, { role: "assistant", content: acc }]);
      }
      remember([{ role: "user", content: text }, { role: "assistant", content: acc }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "[!] Fallo de conexión con SHADOWNET." }]);
    } finally {
      setBusy(false);
    }
  }

  if (!booted)
    return (
      <div className="crt">
        <Boot
          onDone={() => {
            setBooted(true);
            onBoot?.();
          }}
        />
      </div>
    );

  return (
    <div className={`crt flex h-screen flex-col ${cyber ? "cyber" : ""}`}>
      <header className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="glow">{cyber ? "ZER0@breach:~#" : "N3XUS@shadownet:~$"}</span>
        <span className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            memoria: {memCount} · {cyber ? "/borrar" : "/mercenarios · /cancelar · /borrar"}
          </span>
          <button
            type="button"
            onClick={onSwitch}
            className="border border-primary px-2 text-primary hover:bg-secondary"
          >
            {cyber ? "⇄ N3XUS" : "⇄ ZER0"}
          </button>
        </span>
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {msgs.length === 0 && (
            <div className="text-muted-foreground">
              {cyber ? (
                <>
                  {">"} ZER0 online. Módulo de intrusión cargado.
                  <br />
                  {">"} Pase una IP objetivo y empiezo el escaneo.
                </>
              ) : (
                <>
                  {">"} Conexión establecida. Soy N3XUS. Buen día, señor. ¿En qué lo puedo ayudar?
                  <br />
                  {">"} Escribe <span className="text-accent">/mercenarios</span> para ver a tus asociados.
                </>
              )}
            </div>
          )}
          {msgs.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="text-accent">
                <span className="text-muted-foreground">{cyber ? "operador" : "señor"}&gt; </span>
                {m.content}
              </div>
            ) : (
              <div key={i} className="term-md glow">
                <span className="text-muted-foreground">{NAME}&gt; </span>
                {m.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                ) : (
                  <span className="cursor-blink">procesando</span>
                )}
              </div>
            ),
          )}
          <div ref={endRef} />
        </div>
      </main>
      <form onSubmit={send} className="border-t border-border px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <span className="glow">&gt;</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            maxLength={4000}
            placeholder={busy ? `${NAME} está escribiendo...` : "escribe un comando o mensaje..."}
            className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" disabled={busy} className="border border-border px-3 text-primary hover:bg-secondary disabled:opacity-40">
            ENVIAR
          </button>
        </div>
      </form>
    </div>
  );
}
