import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";
import { getGateSessionConfig, type GateSession } from "./gate-session.server";

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
    for (const [i, byte] of a.entries()) diff |= byte ^ (b[i] ?? 0);
    if (diff !== 0) return { ok: false as const };
    const session = await useSession<GateSession>(getGateSessionConfig());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const isUnlocked = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<GateSession>(getGateSessionConfig());
  return { unlocked: !!session.data.unlocked };
});
