import { describe, expect, it } from "vitest";
import { DEMO_PROFILE, isDemoScan, demoScanProgress } from "@/lib/demo-scan";

describe("Fictional profile scan", () => {
  it("recognizes the fictional keyword with a scan request in N3XUS", () => {
    expect(isDemoScan('escanea esta cuenta de dc "sombra.demo"', "nexus")).toBe(true);
    expect(isDemoScan('escaneá sombra.demo', "nexus")).toBe(true);
    expect(isDemoScan('hola sombra.demo', "nexus")).toBe(false);
  });
  it("does not intercept ZER0 requests", () => {
    expect(isDemoScan('escanea sombra.demo', "cyber")).toBe(false);
  });
  it("does not turn arbitrary accounts into demo scan targets", () => {
    expect(isDemoScan('escanea otra.cuenta', "nexus")).toBe(false);
  });
  it("omits age from the profile data", () => {
    expect(DEMO_PROFILE).not.toHaveProperty("age");
  });
  it("uses a documentation-only address", () => {
    expect(DEMO_PROFILE.ip).toBe("192.0.2.115");
  });
  it("caps scan completion at 100 percent", () => {
    expect(demoScanProgress(150)).toContain("100%");
    expect(demoScanProgress(-10)).toContain("0%");
  });
});