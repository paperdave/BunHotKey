// Recompile the binary before it gets loaded
// This is aliased to "bhk"
const proc = Bun.spawnSync({
  cmd: [import.meta.dir + "/node_modules/.bin/zig", "build"],
  cwd: import.meta.dir,
  stdio: ["inherit", "inherit", "inherit"],
});
if (!proc.success) {
  process.exit(proc.exitCode);
}
module.exports = require("./src");
