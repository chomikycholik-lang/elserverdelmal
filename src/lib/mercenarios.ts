type Operativo = { alias: string; origen: string };

type Grupo = {
  nombre: string;
  ocupacion: string;
  operativos: Operativo[];
};

const GRUPOS: Grupo[] = [
  {
    nombre: "GRUPO ALPHA",
    ocupacion: "Cibertracking",
    operativos: [
      { alias: "NegroCode", origen: "Merlo" },
      { alias: "PibeWifi", origen: "Moreno" },
      { alias: "La Rusa", origen: "La Matanza" },
      { alias: "Rulo", origen: "Quilmes" },
    ],
  },
  {
    nombre: "GRUPO DELTA",
    ocupacion: "Armas de fuego",
    operativos: [
      { alias: "Patova", origen: "Laferrere" },
      { alias: "El Tano", origen: "Avellaneda" },
      { alias: "Colo", origen: "Morón" },
      { alias: "La Tigresa", origen: "Lanús" },
    ],
  },
  {
    nombre: "GRUPO FANTASMA",
    ocupacion: "Rastreo",
    operativos: [
      { alias: "Fantasma", origen: "San Justo" },
      { alias: "El Bicho", origen: "Florencio Varela" },
      { alias: "Mono", origen: "Berazategui" },
      { alias: "Flaco", origen: "Lomas de Zamora" },
    ],
  },
  {
    nombre: "GRUPO TITÁN",
    ocupacion: "Asalto táctico",
    operativos: [
      { alias: "Titán", origen: "José C. Paz" },
      { alias: "Cabezón", origen: "Ciudad Evita" },
      { alias: "El Pelado", origen: "Castelar" },
      { alias: "GordoBit", origen: "Ituzaingó" },
    ],
  },
];

export const ALIAS = GRUPOS.flatMap((g) => g.operativos.map((o) => o.alias));

const ESTADO = ["DISPONIBLE", "EN MISIÓN", "BUSCADO", "DISPONIBLE", "DISPONIBLE"];
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)] as T;

export function generarMercenarios(): string {
  const rows = GRUPOS.map(
    (g) => `| **${g.nombre}** | ${g.ocupacion} | ${g.operativos.length} operativos | ${pick(ESTADO)} |`,
  );
  return [
    "```",
    ">> ACCEDIENDO A /db/mercenarios ... [OK]",
    ">> DESCIFRANDO REGISTROS ......... [OK]",
    `>> ${GRUPOS.length} GRUPOS BAJO SU MANDO, SEÑOR`,
    "```",
    "",
    "| GRUPO | OCUPACIÓN | EFECTIVOS | ESTADO |",
    "|---|---|---|---|",
    ...rows,
    "",
    "_Grupos registrados en memoria. Deme sus órdenes, señor, y las transmito al grupo que indique._",
  ].join("\n");
}

const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const STEMS = ALIAS.map((a) => norm(a.replace(/^(El|La)\s?/, "")).slice(0, 4));
const GRUPO_STEMS = GRUPOS.map((g) => norm(g.nombre.split(" ")[1]!));

/** Devuelve los alias de asociados nombrados en el mensaje. */
export function aliasNombrados(texto: string): string[] {
  const words = norm(texto).split(/[^a-z0-9]+/);
  return ALIAS.filter((_, i) => {
    const st = STEMS[i]!;
    return words.some((w) => w.startsWith(st) || w.startsWith("el" + st) || w.startsWith("la" + st));
  });
}

/** Devuelve los nombres de grupos nombrados en el mensaje (ej. "grupo delta"). */
export function gruposNombrados(texto: string): string[] {
  const words = norm(texto).split(/[^a-z0-9]+/);
  return GRUPOS.filter((g, i) => words.includes(GRUPO_STEMS[i]!)).map((g) => g.nombre);
}

const VERBOS = /\b(manda|mande|mandá|mandar|envia|envie|enviá|enviar|despliega|desplegá|desplegar|ordena|ordená)/i;

/** Detecta si el mensaje es una orden: nombra asociados, grupos o usa un verbo de envío. */
export function esOrdenAMercenarios(texto: string): boolean {
  return aliasNombrados(texto).length > 0 || gruposNombrados(texto).length > 0 || VERBOS.test(texto);
}
