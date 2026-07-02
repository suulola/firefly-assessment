export function formatName(name: string): string {
  return name
    .split("-")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

export function numberLabel(id: number): string {
  return `#${String(id).padStart(3, "0")}`;
}
