export const ALIAS = ["ElPatova", "ElTano", "LaRusa", "ElChino", "ElTurco", "ElFlaco", "ElGordoBit", "LaPiba", "ElNegroCode", "ElPibeWifi", "ElRulo", "ElColo", "LaTigresa", "ElCabezón", "ElPelado", "ElBicho", "ElMono", "LaBruja", "ElTitán", "ElFantasma"];
const ESP = ["Hackeo", "Hackeo de redes", "Hackeo de cámaras", "Combate con armas de fuego", "Tirador experto", "Combate con escopeta", "Rastreo", "Rastreo satelital", "Rastreo de celulares"];
const ORIGEN = ["Merlo", "Moreno", "Laferrere", "La Matanza", "Quilmes", "Lanús", "Avellaneda", "Morón", "Ituzaingó", "San Justo", "Florencio Varela", "Berazategui", "José C. Paz", "Ciudad Evita", "Lomas de Zamora", "Castelar"];
const ESTADO = ["DISPONIBLE", "EN MISIÓN", "BUSCADO", "DISPONIBLE", "DISPONIBLE"];

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)] as T;

export function generarMercenarios(n = 8): string {
  const used = new Set<string>();
  const rows: string[] = [];
  while (rows.length < n) {
    const alias = pick(ALIAS);
    if (used.has(alias)) continue;
    used.add(alias);
    const id = "MX-" + Math.floor(1000 + Math.random() * 9000);
    const nivel = "★".repeat(1 + Math.floor(Math.random() * 5));
    rows.push(`| ${id} | **${alias}** | ${pick(ESP)} | ${pick(ORIGEN)} | ${nivel} | ${pick(ESTADO)} |`);
  }
  return [
    "```",
    ">> ACCEDIENDO A /db/mercenarios ... [OK]",
    ">> DESCIFRANDO REGISTROS ......... [OK]",
    `>> ${n} ASOCIADOS DISPONIBLES, SEÑOR`,
    "```",
    "",
    "| ID | ALIAS | ESPECIALIDAD | ORIGEN | NIVEL | ESTADO |",
    "|---|---|---|---|---|---|",
    ...rows,
    "",
    "_Asociados registrados en memoria. Deme sus órdenes, señor, y las transmito._",
  ].join("\n");
}

const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const STEMS = ALIAS.map((a) => norm(a.replace(/^(El|La)/, "")).slice(0, 4));

/** Devuelve los alias de asociados nombrados en el mensaje. */
export function aliasNombrados(texto: string): string[] {
  const words = norm(texto).split(/[^a-z0-9]+/);
  return ALIAS.filter((_, i) => {
    const st = STEMS[i]!;
    return words.some((w) => w.startsWith(st) || w.startsWith("el" + st) || w.startsWith("la" + st));
  });
}

const VERBOS = /\b(manda|mande|mandá|mandar|envia|envie|enviá|enviar|despliega|desplegá|desplegar|ordena|ordená)/i;

/** Detecta si el mensaje es una orden: nombra asociados o usa un verbo de envío. */
export function esOrdenAMercenarios(texto: string): boolean {
  return aliasNombrados(texto).length > 0 || VERBOS.test(texto);
}
