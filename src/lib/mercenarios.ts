const ALIAS = ["Viper", "Ghost", "Raven", "Kraken", "Nyx", "Byte", "Hex", "Jackal", "Cipher", "Onyx", "Specter", "Wraith", "Glitch", "Mamba", "Zero", "Talon", "Phantom", "Cobalt", "Rogue", "Static"];
const ESP = ["Infiltración", "Criptografía", "Explosivos", "Francotirador", "Ingeniería social", "Drones", "Hackeo de redes", "Combate cuerpo a cuerpo", "Logística", "Pilotaje", "Falsificación", "Contrainteligencia"];
const ORIGEN = ["Neo-Tokio", "Berlín Sector 9", "Buenos Aires Underground", "Lagos Free Zone", "Ciudad Kowloon II", "Estación Orbital Kepler", "Ruinas de Detroit", "Montevideo Grid"];
const ESTADO = ["DISPONIBLE", "EN MISIÓN", "BUSCADO", "DISPONIBLE", "DISPONIBLE"];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export function generarMercenarios(n = 8): string {
  const used = new Set<string>();
  const rows: string[] = [];
  while (rows.length < n) {
    const alias = pick(ALIAS);
    if (used.has(alias)) continue;
    used.add(alias);
    const id = "MX-" + Math.floor(1000 + Math.random() * 9000);
    const nivel = "★".repeat(1 + Math.floor(Math.random() * 5));
    const precio = (5 + Math.floor(Math.random() * 95)) * 1000;
    rows.push(`| ${id} | **${alias}** | ${pick(ESP)} | ${pick(ORIGEN)} | ${nivel} | ${precio.toLocaleString("es-AR")} ₡ | ${pick(ESTADO)} |`);
  }
  return [
    "```",
    ">> ACCEDIENDO A /db/mercenarios ... [OK]",
    ">> DESCIFRANDO REGISTROS ......... [OK]",
    `>> ${n} CONTRATISTAS ENCONTRADOS`,
    "```",
    "",
    "| ID | ALIAS | ESPECIALIDAD | ORIGEN | NIVEL | TARIFA | ESTADO |",
    "|---|---|---|---|---|---|---|",
    ...rows,
    "",
    "_Lista guardada en memoria. Pregúntale a N3XUS por cualquiera de ellos o contrátalos._",
  ].join("\n");
}
