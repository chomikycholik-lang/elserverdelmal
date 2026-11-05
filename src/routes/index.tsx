import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { generarMercenarios } from "@/lib/mercenarios";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "N3XUS // Terminal SHADOWNET" },
      { name: "description", content: "Conéctate a N3XUS, la IA hacker de rol con memoria total y base de mercenarios." },
      { property: "og:title", content: "N3XUS // Terminal SHADOWNET" },
      { property: "og:description", content: "IA hacker de rol con memoria total. Escribe /mercenarios." },
    ],
  }),
  component: Index,
});

type Msg = { role: "user" | "assistant"; content: string };
const KEY = "n3xus-memoria";

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

function Index() {
  const [booted, setBooted] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setMsgs(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    if (msgs.length) localStorage.setItem(KEY, JSON.stringify(msgs));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);
  useEffect(() => {
    if (booted && !busy) inputRef.current?.focus();
  }, [booted, busy]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");

    if (text.toLowerCase() === "/borrar") {
      localStorage.removeItem(KEY);
      setMsgs([]);
      return;
    }
    if (text.toLowerCase().startsWith("/mercenarios")) {
      setMsgs((m) => [...m, { role: "user", content: text }, { role: "assistant", content: generarMercenarios() }]);
      return;
    }

    const next: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-400) }),
      });
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
    } catch {
      setMsgs([...next, { role: "assistant", content: "[!] Fallo de conexión con SHADOWNET." }]);
    } finally {
      setBusy(false);
    }
  }

  if (!booted)
    return (
      <div className="crt">
        <Boot onDone={() => setBooted(true)} />
      </div>
    );

  return (
    <div className="crt flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="glow">N3XUS@shadownet:~$</span>
        <span className="text-sm text-muted-foreground">
          memoria: {msgs.length} registros · /mercenarios · /borrar
        </span>
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {msgs.length === 0 && (
            <div className="text-muted-foreground">
              {">"} Conexión establecida. Soy N3XUS. Recuerdo todo lo que me digas, operador.
              <br />
              {">"} Escribe <span className="text-accent">/mercenarios</span> para consultar la base de contratistas.
            </div>
          )}
          {msgs.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="text-accent">
                <span className="text-muted-foreground">operador&gt; </span>
                {m.content}
              </div>
            ) : (
              <div key={i} className="term-md glow">
                <span className="text-muted-foreground">N3XUS&gt; </span>
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
            placeholder={busy ? "N3XUS está escribiendo..." : "escribe un comando o mensaje..."}
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
