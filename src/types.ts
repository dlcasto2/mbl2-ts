export interface MemoryRange {
  start: number;
  size: number;
}

export interface ResourceLocation {
  path: string;
}

export interface FileBuffer {
  name: string;
  data: Uint8Array;
}

export interface HookDescriptor {
  name: string;
  fn: (...args: any[]) => unknown;
}
