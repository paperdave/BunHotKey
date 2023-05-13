import fs from "fs";
import pkg from "./package.json";

fs.rmSync("dist", { recursive: true, force: true });
fs.mkdirSync("dist");

Bun.spawnSync(["zig", "build", "-Doptimize=ReleaseFast"]);
console.log("Release build done");
fs.copyFileSync("zig-out/lib/libbhk.so", "dist/bhk.linux-x86_64.so");
fs.copyFileSync("README.md", "dist/README.md");

const build = await Bun.build({
  entrypoints: ["./src/index.ts"],
  target: "bun",
  external: ["@paperdave/utils"],
  define: {
    "process.env.BHK_PRODUCTION": "true",
  },
  minify: {
    syntax: true,
    whitespace: true,
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
      keywords: pkg.keywords,
      author: pkg.author,
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

Bun.spawnSync([
  "bun",
  "dts-bundle-generator",
  "src/index.ts",
  "-o",
  "dist/index.d.ts",
]);
