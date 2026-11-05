const ALIAS = ["ElPatova", "ElTano", "LaRusa", "ElChino", "ElTurco", "ElFlaco", "ElGordoBit", "LaPiba", "ElNegroCode", "ElPibeWifi", "ElRulo", "ElColo", "LaTigresa", "ElCabezón", "ElPelado", "ElBicho", "ElMono", "LaBruja", "ElTitán", "ElFantasma"];
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
    const precio = (50 + Math.floor(Math.random() * 950)) * 10000;
    rows.push(`| ${id} | **${alias}** | ${pick(ESP)} | ${pick(ORIGEN)} | ${nivel} | ARS $${precio.toLocaleString("es-AR")} | ${pick(ESTADO)} |`);
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
