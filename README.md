# BunHotKey

A linux desktop automation tool providing programmable macros using Bun, a fast JavaScript runtime. It exposes an API to define macro keys, as well as many functions to interact with your system and the various applications I use.

```ts
import { macro, ui } from "bhk";

macro.on("super + f1", () => {
  console.log("Macro activated in", ui.activeWindow.name);

  ui.type("Hello world!");
});
```
