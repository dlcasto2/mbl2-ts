import type { FileBuffer, ResourceLocation } from "./types";

export const DEFAULT_REPLACEMENTS: Array<[string, string]> = [
  ["gui/dist/hbui/", "hbui/"],
  ["skin_packs/persona/", "persona/"],
  ["renderer/", "renderer/"],
  ["resource_packs/vanilla/cameras/", "vanilla_cameras/"],
];

export class BufferCursor {
  private offset = 0;

  constructor(private readonly buffer: Uint8Array) {}

  read(out: Uint8Array): number {
    const available = Math.min(out.length, this.buffer.length - this.offset);
    out.set(this.buffer.subarray(this.offset, this.offset + available));
    this.offset += available;
    return available;
  }

  seek(position: number): void {
    this.offset = Math.max(0, Math.min(position, this.buffer.length));
  }

  position(): number {
    return this.offset;
  }

  getRef(): Uint8Array {
    return this.buffer;
  }
}

export class Buffer {
  constructor(
    public readonly name: string,
    public readonly object: BufferCursor,
  ) {}
}

export class ResourcePackManager {
  private readonly resources = new Map<string, Uint8Array>();

  setResource(path: string, data: Uint8Array): void {
    this.resources.set(path, data);
  }

  loadResource(loc: ResourceLocation): Uint8Array | null {
    return this.resources.get(loc.path) ?? null;
  }
}

export class FileLoader {
  constructor(private readonly packManager: ResourcePackManager) {}

  getFile(path: string): FileBuffer | null {
    const stripped = path.startsWith("assets/") ? path.slice("assets/".length) : path;

    for (const [apkFolder, packFolder] of DEFAULT_REPLACEMENTS) {
      const filePath = stripPrefix(stripped, apkFolder);
      if (filePath === null) continue;

      const resourcePath = joinResourcePath(packFolder, filePath);
      const loaded = this.packManager.loadResource({ path: resourcePath });
      if (!loaded) continue;

      return {
        name: path,
        data: loaded,
      };
    }

    return null;
  }
}

function stripPrefix(value: string, prefix: string): string | null {
  return value.startsWith(prefix) ? value.slice(prefix.length) : null;
}

function joinResourcePath(base: string, filePath: string): string {
  const combined = `${base}${filePath}`;
  return combined.replace(/\/+/g, "/");
}
