# BunHotKey

**Current Status**: Experimenting.

A linux desktop automation tool providing programmable macros using Bun, a fast JavaScript runtime. It exposes an API to define macro keys, as well as many functions to interact with your system and the various applications I use.

> The demo below is not fully implemented yet

```ts
import { kb, ui, Keyboard } from "bhk";

// hotkeys on main keyboard, requires modifier
kb.macro("super + f1", () => {
  // `ui` contains live bindings to the current state of your desktop
  //    .activeWindow is a getter to fetch the active window
  //    .name is a getter to fetch the name of the active window
  console.log(`Macro activated in ${ui.activeWindow.name}`);

  // All getters are cached for one tick, meaning a second access will
  // not cause a second fetch, and is guaranteed to be the same value.
  console.log(`Macro activated in ${ui.activeWindow.proc.exe}`);

  // dispatch actions like typing a string
  ui.type("Hello world!");
});

// hook into external devices, for example adding an exclusive macro keyboard
// (linux version of Taren's 2nd keyboard stuff)
const kb2 = new Keyboard({ vendor: 0x1b1c, product: 0x1b13 });
kb2.macro("q", () => {
  // helper to focus or launch an application
  ui.focusOrLaunch("discord");

  // same as above but manual
  let window = ui.findWindow({ class: "discord" });
  if (window) {
    window.focus();
  } else {
    // launch returns a promise to the first window the process creates
    window = await ui.launch(["discord"]);
  }
});
```

## Development

BunHotKey is developed in Zig and TypeScript

After cloning and running `bun install`, you can use Zig to build the library and bindings.

```sh
zig build && zig-out/bin/bhk-binding-generator
```

This generates `src/lib/index.ts` which is a generated file containing bindings to exported Zig functions. It exports `ffi` which is used throughout the project to call into Zig code.

I have `bhk` aliased to `./src` so examples should just work.

To build the bundled JS package, run `bun release.ts`.
