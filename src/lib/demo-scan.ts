export const DEMO_PROFILE = {
  discord: "sombra.demo",
  instagram: ["sombra.demo.uno", "sombra.demo.dos"],
  ip: "192.0.2.115",
  roblox: "sombra_demo_367928",
  age: 24,
} as const;

export function isDemoScan(text: string, persona: "nexus" | "cyber") {
  return persona === "nexus" && /\b(?:escanea|escaneá|escanear|escaneo|analiza|analizá)\b/i.test(text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) && /\bsombra\.demo\b/i.test(text);
}

export function demoScanProgress(percent: number) {
  const progress = Math.max(0, Math.min(100, Math.floor(percent)));
  const blocks = Math.floor(progress / 5);
  return `Sí, señor. Analizando el perfil de prueba.\n\n\`\`\`\n>> Objetivo: ${DEMO_PROFILE.discord}\n>> Entorno: SIMULACIÓN LOCAL\n>> Correlacionando registros ficticios...\n[${"█".repeat(blocks)}${"░".repeat(20 - blocks)}] ${progress}%\n\`\`\``;
}

export function demoScanReport() {
  return `[OK] Análisis completado, señor.\n\n\`\`\`\nINFORME FICTICIO — DATOS DE PRUEBA\nDiscord: ${DEMO_PROFILE.discord}\nInstagram: ${DEMO_PROFILE.instagram.join(" · ")}\nIP de documentación: ${DEMO_PROFILE.ip}\nRoblox: ${DEMO_PROFILE.roblox}\nEdad del personaje: ${DEMO_PROFILE.age} años\n\`\`\``;
}