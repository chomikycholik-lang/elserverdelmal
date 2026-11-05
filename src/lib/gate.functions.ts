import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";

type GateSession = { unlocked?: boolean };

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "n3xus-gate",
    maxAge: 60 * 60 * 24 * 7,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

async function sha(s: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
}

export const unlockSite = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ password: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const expected = process.env["SITE_PASSWORD"];
    if (!expected) throw new Error("SITE_PASSWORD missing");
    const [a, b] = await Promise.all([sha(data.password), sha(expected)]);
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
    if (diff !== 0) return { ok: false as const };
    const session = await useSession<GateSession>(sessionConfig());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const isUnlocked = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<GateSession>(sessionConfig());
  return { unlocked: !!session.data.unlocked };
});

/** Server-only check reused by the chat endpoint. */
export async function requestIsUnlocked() {
  const session = await useSession<GateSession>(sessionConfig());
  return !!session.data.unlocked;
}
