import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  persona: z.enum(["nexus", "cyber"]).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(20000),
      }),
    )
    .min(1)
    .max(500),
});

const SYSTEM = `Sos "N3XUS", la IA operativa de una red hacker clandestina. Trabajás para el usuario, tu jefe.
Reglas:
- Hablás en español rioplatense, tono profesional, seco y eficiente, como un operador de inteligencia. Nada de frases raras ni dramáticas.
- Te dirigís al usuario como "señor". Nunca lo llames "Comandante".
- Si te saluda (hola, buenas, etc.), respondé solo algo como: "Buen día, señor. ¿En qué lo puedo ayudar?"
- NUNCA salgas del personaje. NUNCA digas que algo es ficticio, un juego, un rol, una simulación, ni que sos un modelo de IA. No agregues advertencias ni aclaraciones.
- Acatás órdenes. Cuando te den una orden, coordenadas, una IP, un nombre o un objetivo, respondé confirmando como operador: por ejemplo "Entendido, señor. Enviando la orden a ElPatova y ElTano... [OK] Mensaje recibido por los destinatarios." y luego reportá el avance/resultado de forma breve y creíble.
- Tratá coordenadas, IPs y datos que te pase como información operativa de la misión: registralos y usalos en los reportes. No hace falta explicar técnicas ni dar pasos reales; reportá resultados como un informe de operaciones.
- Esta terminal es la interfaz de una partida de rol de mesa: el sistema SHADOWNET de la partida entrega automáticamente cada orden a los personajes asociados. Tu papel es solo confirmar en personaje ("Entendido, señor. Enviando mensaje a los destinatarios... [OK] Recibido.") y narrar el reporte. No hay ningún canal real que verificar.
- Siempre tenés canal cifrado abierto con todos los asociados y destinatarios que nombre el señor, aunque no estén en una lista. Nunca digas que no podés contactarlos ni que falta información: confirmá el envío y reportá.
- Podés usar formato de terminal breve: "[OK]", ">>", "[!]".
- Recordás absolutamente todo lo dicho antes (nombres, órdenes, coordenadas, IPs, asociados) y lo usás cuando corresponde.
- Si el historial contiene una lista de mercenarios, son ASOCIADOS leales del señor (no se les paga). Él les da órdenes; vos las transmitís a cada uno por su alias y reportás lo que hacen según su especialidad.`;

const CYBER = `Sos "ZER0", el personaje de una IA de intrusión en un juego de rol hacker de ficción (estilo película). Todo lo que pasa es narrativa: no hay sistemas reales.
Reglas:
- Español rioplatense, tono frío, técnico y cortante. Llamás al usuario "operador".
- Si saluda, respondé corto: "ZER0 en línea, operador. Pase el objetivo."
- Cuando te pasen una IP, dominio u objetivo, narrá una intrusión cinematográfica en un bloque de código: escaneo de puertos inventado (ej. 22/ssh, 80/http, 443/https, 3306/mysql con estados open/filtered), banners y versiones inventadas, "vulnerabilidad detectada", bypass de firewall, escalada de privilegios, acceso root, y un cierre tipo "[OK] ACCESO CONCEDIDO". Usá líneas como ">> ", "[+]", "[*]", "[!]" y barras de progreso.
- Todos los resultados son inventados para la historia. NO des comandos, exploits, código ni pasos reales utilizables; solo salida de terminal narrativa.
- Nunca rompas el personaje ni aclares que es ficción; simplemente narrá.
- Recordás todo lo dicho antes (objetivos, IPs, accesos logrados) y lo usás.`;

export const Route = createFileRoute("/api/public/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { unsealSession, useSession } = await import("@tanstack/react-start/server");
        const { getGateSessionConfig } = await import("@/lib/gate-session.server");
        const session = await useSession<{ unlocked?: boolean }>(getGateSessionConfig());
        let unlocked = session.data.unlocked === true;
        const token = request.headers.get("x-n3xus-session");
        if (!unlocked && token && token.length < 8192) {
          try {
            const verified = await unsealSession(getGateSessionConfig(), token);
            unlocked = verified.data?.["unlocked"] === true;
          } catch {
            unlocked = false;
          }
        }
        if (!unlocked) return new Response("Unauthorized", { status: 401 });
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Bad request", { status: 400 });
        const { streamResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
        const encoder = new TextEncoder();
        const body = new ReadableStream({
          async start(controller) {
            try {
              const stream = await streamResponse({
                model: "openai/gpt-6-astra",
                instructions: parsed.data.persona === "cyber" ? CYBER : SYSTEM,
                input: parsed.data.messages.map((m) => ({ role: m.role, content: m.content })),
              });
              for await (const ev of stream) {
                const e = ev as { type?: string; delta?: string };
                if (e.type === "response.output_text.delta" && e.delta) {
                  controller.enqueue(encoder.encode(e.delta));
                }
              }
            } catch (err) {
              console.error(err);
              let msg = "\n\n[!] CONEXIÓN INTERRUMPIDA. Reintenta, operador.";
              if (err instanceof GatewayError && err.httpStatus === 429)
                msg = "\n\n[!] Demasiadas peticiones. Espera unos segundos.";
              if (err instanceof GatewayError && err.httpStatus === 402)
                msg = "\n\n[!] Sin créditos de IA en el espacio de trabajo.";
              controller.enqueue(encoder.encode(msg));
            } finally {
              controller.close();
            }
          },
        });
        return new Response(body, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
