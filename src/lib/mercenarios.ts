type Operativo = { alias: string; especialidad: string; origen: string };

const OPERATIVOS: Operativo[] = [
  { alias: "NegroCode", especialidad: "Cibertracking", origen: "Merlo" },
  { alias: "PibeWifi", especialidad: "Hackeo de redes", origen: "Moreno" },
  { alias: "La Rusa", especialidad: "Rastreo satelital", origen: "La Matanza" },
  { alias: "Rulo", especialidad: "Hackeo de cámaras", origen: "Quilmes" },
  { alias: "Patova", especialidad: "Combate con armas de fuego", origen: "Laferrere" },
  { alias: "El Tano", especialidad: "Tirador experto", origen: "Avellaneda" },
  { alias: "Colo", especialidad: "Combate con escopeta", origen: "Morón" },
  { alias: "La Tigresa", especialidad: "Combate con armas de fuego", origen: "Lanús" },
  { alias: "Fantasma", especialidad: "Rastreo", origen: "San Justo" },
  { alias: "El Bicho", especialidad: "Rastreo de celulares", origen: "Florencio Varela" },
  { alias: "Mono", especialidad: "Rastreo", origen: "Berazategui" },
  { alias: "Flaco", especialidad: "Rastreo satelital", origen: "Lomas de Zamora" },
  { alias: "Titán", especialidad: "Asalto táctico", origen: "José C. Paz" },
  { alias: "Cabezón", especialidad: "Combate con armas de fuego", origen: "Ciudad Evita" },
  { alias: "El Pelado", especialidad: "Tirador experto", origen: "Castelar" },
  { alias: "GordoBit", especialidad: "Hackeo", origen: "Ituzaingó" },
];

export const ALIAS = OPERATIVOS.map((o) => o.alias);

const ESTADO = ["DISPONIBLE", "EN MISIÓN", "BUSCADO", "DISPONIBLE", "DISPONIBLE"];
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)] as T;

export function generarMercenarios(): string {
  const rows = OPERATIVOS.map((o) => {
    const id = "MX-" + Math.floor(1000 + Math.random() * 9000);
    const nivel = "★".repeat(1 + Math.floor(Math.random() * 5));
    return `| ${id} | **${o.alias}** | ${o.especialidad} | ${o.origen} | ${nivel} | ${pick(ESTADO)} |`;
  });
  return [
    "```",
    ">> ACCEDIENDO A /db/mercenarios ... [OK]",
    ">> DESCIFRANDO REGISTROS ......... [OK]",
    `>> ${OPERATIVOS.length} ASOCIADOS BAJO SU MANDO, SEÑOR`,
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
const STEMS = ALIAS.map((a) => norm(a.replace(/^(El|La)\s?/, "")).slice(0, 4));

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
