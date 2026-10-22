import type { MemoryRange } from "./types";

export function parseMemoryRange(line: string): [string, string] | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/);
  if (parts.length < 5) return null;

  const range = parts[0];
  const perms = parts[1];
  const pathname = parts[parts.length - 1];

  if (!perms.includes("x")) return null;
  if (!pathname.endsWith("libminecraftpe.so")) return null;

  const separator = range.indexOf("-");
  if (separator === -1) return null;

  return [range.slice(0, separator), range.slice(separator + 1)];
}

export function findMinecraftLibraryManually(memoryMapText: string): MemoryRange[] {
  const ranges: MemoryRange[] = [];

  for (const line of memoryMapText.split(/\r?\n/)) {
    const parsed = parseMemoryRange(line);
    if (!parsed) continue;

    const start = Number.parseInt(parsed[0], 16);
    const end = Number.parseInt(parsed[1], 16);

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      continue;
    }

    ranges.push({
      start,
      size: end - start,
    });
  }

  return ranges;
}

export function hexPatternToBytes(pattern: string): Uint8Array {
  const tokens = pattern
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.toUpperCase());

  const bytes = new Uint8Array(tokens.length);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === "??") {
      bytes[i] = 0xff;
      continue;
    }

    const value = Number.parseInt(token, 16);
    if (!Number.isFinite(value)) {
      throw new Error(`Invalid byte token: ${token}`);
    }

    bytes[i] = value;
  }

  return bytes;
}

export function findPatternInBuffer(buffer: Uint8Array, pattern: Uint8Array): number {
  if (pattern.length === 0) return 0;

  for (let i = 0; i <= buffer.length - pattern.length; i++) {
    let matches = true;

    for (let j = 0; j < pattern.length; j++) {
      if (pattern[j] !== 0xff && buffer[i + j] !== pattern[j]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return i;
    }
  }

  return -1;
}

export function findSignatureInRanges(
  signatures: Uint8Array[],
  ranges: MemoryRange[],
  memory: Uint8Array,
): number | null {
  for (const sig of signatures) {
    for (const range of ranges) {
      const start = range.start;
      const end = range.start + range.size;

      if (end > memory.length) {
        continue;
      }

      const segment = memory.subarray(start, end);
      const offset = findPatternInBuffer(segment, sig);
      if (offset !== -1) {
        return start + offset;
      }
    }
  }

  return null;
}
