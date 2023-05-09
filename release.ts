import fs from "fs";

fs.rmSync("dist", { recursive: true, force: true });
fs.mkdirSync("dist");

await Bun.spawnSync(["zig", "build", "-Doptimize=ReleaseFast"]);
console.log("Release build done");

fs.copyFileSync("zig-out/lib/libbhk.so", "dist/bhk.linux-x86_64.so");

const build = await Bun.build({
  entrypoints: ["./src/index.ts"],
  target: "bun",
  external: ["@paperdave/utils"],
  // @ts-ignore
  define: {
    "process.env.BHK_PRODUCTION": "true",
  },
  minify: {
    syntax: true,
  },
  outdir: "dist",
  naming: "index.js",
});
// @ts-ignore
if (build.logs) {
  // @ts-ignore
  throw build.logs;
}
