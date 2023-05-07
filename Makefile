C_SOURCES = $(wildcard src/lib/*.c)
OBJECTS = $(patsubst src/lib/%.c,dist/lib/%.o,$(C_SOURCES))
LINKER_FLAGS = -lxdo -lX11

bhk:
	@make -j$(shell nproc) all --no-print-directory

all: src/lib/bhk.so src/lib/index.ts
clean:
	rm -fr src/lib/bhk.so dist/*

dist:
	mkdir -p dist/lib

src/lib/bhk.so: $(OBJECTS)
	clang -shared -o $@ $(OBJECTS) $(LINKER_FLAGS)

dist/lib/%.o: src/lib/%.c dist
	clang -fPIC -c -o $@ $<

src/lib/index.ts: $(C_SOURCES)
	bun src/lib/codegen.ts $(C_SOURCES)
