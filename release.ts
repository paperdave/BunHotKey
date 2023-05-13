import fs from "fs";
import pkg from "./package.json";

console.log("\x1b[36m%s\x1b[0m", "Building BunHotKey...");

fs.rmSync("dist", { recursive: true, force: true });
fs.mkdirSync("dist");

console.log("\x1b[36m%s\x1b[0m", "[1/4] Checking Types");
const dtsgen = Bun.spawnSync({
  cmd: ["bun", "dts-bundle-generator", "src/index.ts", "-o", "dist/index.d.ts"],
  stdio: ["inherit", "inherit", "inherit"],
});
if (!dtsgen.success) {
  process.exit(1);
}

console.log("\x1b[36m%s\x1b[0m", "[2/4] Building Zig");
const zigBuild = Bun.spawnSync({
  cmd: ["bun", "zig", "build", "-Doptimize=ReleaseFast"],
  stdio: ["inherit", "inherit", "inherit"],
});
if (!zigBuild.success) {
  process.exit(1);
}
fs.copyFileSync("zig-out/lib/libbhk.so", "dist/bhk.linux-x86_64.so");
fs.copyFileSync("README.md", "dist/README.md");
fs.copyFileSync("LICENSE", "dist/LICENSE");

console.log("\x1b[36m%s\x1b[0m", "[3/4] Bundling JavaScript");
const build = await Bun.build({
  entrypoints: ["./src/index.ts"],
  target: "bun",
  external: Object.keys(pkg.dependencies),
  define: {
    "process.env.BHK_PRODUCTION": "true",
  },
  minify: {
    syntax: true,
  },
  outdir: "dist",
  naming: "index.js",
});
if (!build.success) {
  throw new AggregateError(build.logs);
}

Bun.write(
  "dist/package.json",
  JSON.stringify(
    {
      name: pkg.name,
      description: pkg.description,
      version: pkg.version,
      author: pkg.author,
      license: pkg.license,
      type: pkg.type,
      exports: {
        ".": {
          bun: "./index.js",
          types: "./index.d.ts",
        },
      },
      dependencies: pkg.dependencies,
    },
    null,
    2
  )
);

console.log("\x1b[36m%s\x1b[0m", "[4/4] Verifying");
try {
  await import("./verify-release");
} catch (e) {
  console.error("Failed to verify built library is functional.");
  console.error(e);
  process.exit(1);
}

console.log("\x1b[32m%s\x1b[0m", "Build successful!");
