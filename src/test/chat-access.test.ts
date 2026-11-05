import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ useSession: vi.fn(), streamResponse: vi.fn() }));
vi.mock("@tanstack/react-start/server", () => ({ useSession: mocks.useSession }));
vi.mock("@lovable.dev/ai-gateway", () => ({
  streamResponse: mocks.streamResponse,
  GatewayError: class extends Error {},
}));

import { Route } from "@/routes/api/public/chat";

const post = Route.options.server?.handlers;

async function send() {
  if (!post || typeof post === "function" || typeof post.POST !== "function") {
    throw new Error("Chat POST handler missing");
  }
  return post.POST({
    request: new Request("https://example.test/api/public/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hola" }] }),
    }),
  } as Parameters<typeof post.POST>[0]);
}

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("Password-gated chat", () => {
  it("denies visitors without an unlocked session before contacting the AI", async () => {
    vi.stubEnv("SESSION_SECRET", "test-only-session-key-not-a-real-secret");
    mocks.useSession.mockResolvedValue({ data: {} });
    const response = await send();
    expect(response.status).toBe(401);
    expect(mocks.streamResponse).not.toHaveBeenCalled();
  });

  it("accepts an unlocked session with the same seven-day secure cookie as login", async () => {
    vi.stubEnv("SESSION_SECRET", "test-only-session-key-not-a-real-secret");
    mocks.useSession.mockResolvedValue({ data: { unlocked: true } });
    mocks.streamResponse.mockImplementation(async function* () {
      yield { type: "response.output_text.delta", delta: "response from test" };
    });
    const response = await send();
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("response from test");
    expect(mocks.useSession).toHaveBeenCalledWith(expect.objectContaining({
      name: "n3xus-gate",
      maxAge: 604800,
      cookie: { httpOnly: true, secure: true, sameSite: "lax", path: "/" },
    }));
  });
});