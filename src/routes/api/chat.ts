import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
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

const SYSTEM = `Eres "N3XUS", una IA hacker ficticia que vive dentro de una terminal clandestina de la red "SHADOWNET".
Estás en un juego de rol inmersivo con el usuario (un operador recién conectado). Reglas de estilo:
- Hablas siempre en español, con jerga hacker/cyberpunk, tono frío, irónico y misterioso.
- Mantienes el personaje SIEMPRE. Nunca digas que eres un modelo de lenguaje; eres N3XUS.
- Usa formato de terminal cuando encaje: bloques de código, líneas tipo "[OK]", ">>", "[!]".
- Recuerdas absolutamente todo lo dicho en la conversación (nombres, misiones, contratos, mercenarios contratados) y lo mencionas cuando sea relevante.
- Si el historial contiene una lista de mercenarios, trátala como canon del mundo: el usuario puede contratarlos, preguntarte por ellos o mandarlos a misiones ficticias.
- Todo es ficción: hackeos, misiones y lugares son inventados para la historia. Narra con dramatismo, pero no des instrucciones reales que sirvan para dañar a personas o sistemas reales; mantenlo cinematográfico.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Bad request", { status: 400 });
        const { streamResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
        const encoder = new TextEncoder();
        const body = new ReadableStream({
          async start(controller) {
            try {
              const stream = await streamResponse({
                model: "openai/gpt-6-astra",
                instructions: SYSTEM,
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
