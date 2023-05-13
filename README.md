# BunHotKey

**Current Status**: Not usable, available for public experimentation.

A linux desktop automation tool providing programmable macros using Bun, a fast JavaScript runtime. It exposes an API to define macro keys, as well as many functions to interact with your system and the various applications I use.

> The demo below is not implemented and is more of a sketch of what I want to achieve

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

## Reference

Any and all of this may be changed at any time.

### Desktop Automation API

BunHotKey exposes live bindings to your UI and window state.

- `ui`:
  - `activeWindow` -> `WindowRef`
  - `hoveredWindow` -> `WindowRef`
  - `mouse`
    - `pos` -> `{ x: number, y: number }`
    - `moveTo(x: number, y: number)`
    - `moveBy(x: number, y: number)`
    - `click(button: number)`
    - `down(button: number)`
    - `up(button: number)`
  - `findWindow(query: FindWindowOptions)` -> `?WindowRef`
- `i3`:
  - `async exec(command: string)`
  - `workspaces` -> `WorkspaceRef[]`
  - `workspace(name: string)` -> `WorkspaceRef`
  - `on(event, cb)`
    - `workspace`
    - `output`
    - `mode`
    - `window`
    - `barconfig_update`
    - `binding`
    - `shutdown`
    - `tick`

### `Device`

WIP, JS binding for reading to event devices (`/dev/input/event*`)

```ts
import { Device } from "bhk";

const device = new Device({
  vendor: 0x1b1c,
  product: 0x1b3d,
  grab: true,
});
device.on("key", (key) => {
  console.log(key);
});
```

### XKeyGrab

WIP, JS binding for X11's `XGrabKey`

## Development

BunHotKey is developed in Zig and TypeScript. Run `bun install` to install dependencies and build the library. Zig is installed through npm.
