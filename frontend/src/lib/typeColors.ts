const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", electric: "#E8B923",
  grass: "#5D9C43", ice: "#5FBFB9", fighting: "#C22E28", poison: "#A33EA1",
  ground: "#C99A3E", flying: "#8F7CD6", psychic: "#F0417A", bug: "#8C9A1C",
  rock: "#A18F30", ghost: "#5F4C87", dragon: "#5A32D6", dark: "#5A4636",
  steel: "#8C8CA3", fairy: "#CB6B99",
};

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function colorForType(type: string): { color: string; background: string } {
  const color = TYPE_COLORS[type] ?? "#8A8A8A";
  return { color, background: hexToRgba(color, 0.14) };
}
