import { readdirSync } from "fs";

const headers = Bun.spawnSync({
  cmd: [
    "cproto",
    ...readdirSync(import.meta.dir).filter((x) => x.endsWith(".c")),
  ],
  cwd: import.meta.dir,
});
const text = headers.stdout.toString("utf-8");
const lines = text
  .split("\n")
  .filter((x) => x.trim() !== "" && !x.startsWith("/*"));

const ignoredSymbols = ["external_emitter_init_thread"];

const types: Dict<string> = {
  Window: "FFIType.u64_fast",
  int: "FFIType.i32",
  "unsigned int": "FFIType.u32",
  void: "FFIType.void",
  "char *": "FFIType.cstring",
  "unsigned char *": "FFIType.cstring",
  pthread_t: "FFIType.u64_fast",
  _Bool: "FFIType.bool",
};

function mapType(type: string) {
  if (type in types) {
    return types[type];
  }
  if (type.endsWith("*")) {
    return "FFIType.pointer";
  }
  throw new Error(`Unknown c type: ${type}`);
}

const fns = [];

for (const line of lines) {
  const match = line.match(/^([^\(]+)\b(.+?)\((.*)\);$/)!;
  const ret = match[1].trim();
  const name = match[2];
  const args = match[3]
    .split(",")
    .filter((x) => x !== "void")
    .map((arg) => {
      const m2 = arg.trim().match(/^(.+?)\b([a-zA-Z0-9_]+)$/);
      if (!m2) throw new Error(`Invalid argument: ${arg}`);
      const [type, name] = m2!.slice(1);
      return { type: type.trim(), name };
    });
  if (ignoredSymbols.includes(name)) continue;
  fns.push({ ret, name, args });
}

fns.push({
  name: "kill",
  ret: "void",
  args: [
    { type: "unsigned int", name: "pid" },
    { type: "unsigned int", name: "sig" },
  ],
});

const code = `// generated with codegen.ts, run \`make\` to rebuild
import { FFIType, dlopen, suffix } from "bun:ffi";
import path from "path";

const library = dlopen(path.join(import.meta.dir, \`bhk.\${suffix}\`), {
  ${fns
    .map(
      (fn) => `${fn.name}: {
${[
  fn.args.length &&
    `    args: [${fn.args
      .map((arg) => String(mapType(arg.type)))
      .join(", ")}],`,
  fn.ret !== "void" && `    returns: ${mapType(fn.ret)},`,
]
  .filter(Boolean)
  .join("\n")}
  },`
    )
    .join("\n  ")}
});
if (!library.symbols) {
  throw library;
}

library.symbols.init();

export const ffi = library.symbols;
`;

Bun.write(import.meta.dir + "/index.ts", code);
