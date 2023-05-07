src/lib/bhk.so src/lib/index.ts: $(shell find src/lib/*.c -type f) src/lib/codegen.ts
	clang -fPIC -lxdo -shared -o src/lib/bhk.so src/lib/*.c
	bun src/lib/codegen.ts
