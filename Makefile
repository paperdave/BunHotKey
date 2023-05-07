# C_SOURCES = $(wildcard src/lib/*.c)
C_SOURCES = src/lib/x11bind.c
LINKER_FLAGS = -lxdo -lX11

src/lib/bhk.so src/lib/index.ts: src/lib/codegen.ts $(C_SOURCES)
	clang -fPIC -shared -o src/lib/bhk.so $(C_SOURCES) $(LINKER_FLAGS)
	bun src/lib/codegen.ts $(C_SOURCES)
