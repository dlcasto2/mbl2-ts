# mbl2-ts

A TypeScript port of the core logic behind the MaterialBinLoader 2 Rust project.

This project is a faithful translation of the repo's architecture, not a warehouse bin-packing application. It includes the Rust-style components that are relevant to the original project:

- memory map scanning for `libminecraftpe.so`
- signature searching using wildcard byte patterns
- resource pack path rewriting
- resource manager + file loading abstraction

## What it contains

- `findMinecraftLibraryManually()` for scanning `/proc/self/maps`-style data
- `findSignatureInRanges()` for searching signatures across memory ranges
- `hexPatternToBytes()` for converting wildcard patterns like `FF ?? 02 D1`
- `ResourcePackManager` and `FileLoader` modeling the Rust pack rewrite flow

## Install

```bash
npm install
npm run build
```

## Usage

```ts
import {
  FileLoader,
  ResourcePackManager,
  findMinecraftLibraryManually,
  hexPatternToBytes,
  findSignatureInRanges,
} from "./src";

const packManager = new ResourcePackManager();
packManager.setResource("hbui/test.json", new TextEncoder().encode("{ \"ok\": true }"));

const loader = new FileLoader(packManager);
const file = loader.getFile("assets/gui/dist/hbui/test.json");

if (file) {
  console.log(new TextDecoder().decode(file.data));
}
```

## Notes

This is a port of the architecture, not a direct native hook implementation. In a real native runtime, the scanning and patching logic would be connected to the platform's memory and PLT patching APIs.
