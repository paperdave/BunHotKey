# BunHotKey

**Current Status**: Experimenting. Right now everything besides `src/xkeygrab.ts` breaks due to broken c build.

A linux desktop automation tool providing programmable macros using Bun, a fast JavaScript runtime. It exposes an API to define macro keys, as well as many functions to interact with your system and the various applications I use.

```ts
import { kb, ui, Keyboard } from "bhk";

// hotkeys on main keyboard, requires modifier
kb.on("super + f1", () => {
  // `ui` contains live bindings to the current state of your desktop
  console.log(`Macro activated in ${ui.activeWindow.name}`);
  ui.type("Hello world!");
});

// hook into external devices
const kb2 = new Keyboard({ vendor: "1b1c", product: "1b13" });
kb2.on("q", () => {
  ui.focusOrLaunch("discord");
});
```
