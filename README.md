# BunHotKey

**Current Status**: Not usable, available for public experimentation.

A linux desktop automation tool providing programmable macros using Bun, a fast JavaScript runtime. It exposes an API to define macro keys, as well as many functions to interact with your system and the various applications I use.

**Note** - Only available on Linux with X11. It probably isn't possible to support Wayland, but MacOS and Windows could be supported in the future. If you're interested in helping that effort, please reach out.

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
const kb2 = new Device({ vendor: 0x1b1c, product: 0x1b13 });
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

BunHotKey exposes live bindings to your UI and window state. Unchecked things are not implemented.

- `ui`:
  - [X] `activeWindow` -> `WindowRef`
  - [X] `hoveredWindow` -> `WindowRef`
  - [ ] `findWindow(query: FindWindowOptions)` -> `?WindowRef`
  - [ ] `launch(command: string[])` -> `Promise<WindowRef>`
  - [ ] `focusOrLaunch(command: string[])` -> `Promise<WindowRef>`
  - [X] `mouse`
    - [X] `pos` -> `{ x: number, y: number }`
    - [X] `moveTo(x: number, y: number)`
    - [X] `moveBy(x: number, y: number)`
    - [X] `click(button: number)`
    - [X] `down(button: number)`
    - [X] `up(button: number)`
- `i3`:
  - [X] `async exec(command: string)`
  - [X] `workspaces` -> `WorkspaceRef[]`
  - [X] `workspace(name: string)` -> `WorkspaceRef`
  - [X] `on(event, cb)`
    - [ ] `workspace`
    - [ ] `output`
    - [ ] `mode`
    - [ ] `window`
    - [ ] `barconfig_update`
    - [ ] `binding`
    - [ ] `shutdown`
    - [ ] `tick`
- `blender`
  - [ ] `async execString(python: string)`
  - [ ] `async execFile(path: string)`

There are a number of "ref" classes which consist of an `id` and expose live bindings to them.

- `WindowRef` (this is designed to be cross-platform)
  - Properties
    - [X] `id` -> `WindowID`
    - [X] `name` -> `string`
    - [X] `pid` -> `number`
    - [X] `proc` -> `ProcessRef`
  - Bindings
    - [X] `size` -> `{ width: number, height: number }`
    - [X] `pos` -> `{ x: number, y: number }`
    - [X] `x` -> `number`
    - [X] `y` -> `number`
    - [X] `width` -> `number`
    - [X] `height` -> `number`
  - Methods
    - [X] `activate()`
    - [X] `click(button: number)`
    - [X] `clickMultiple(button: number, times: number, delay = 1)`
    - [X] `close()`
    - [X] `focus()`
    - [X] `kill()`
    - [X] `raise()`
    - [X] `type(text: string, delay = 0)`
    - [ ] `moveMouseRelativeTo(x: number, y: number)`
- `ProcessRef`
  - Properties
    - [X] `name` -> `string`
    - [X] `cmdline` -> `string`
    - [X] `cwd` -> `string`
    - [X] `exe` -> `string`
    - [ ] `windows` -> `WindowRef[]`
  - Methods
    - [X] `kill(signal: number)` (defaults to SIGTERM)
- `I3WorkspaceRef` (create with `i3.workspace(name)`)
  - Properties
    - [X] `name` -> `string`
    - [X] `num` -> `number`
    - [X] `rect` -> `{ x: number, y: number, width: number, height: number }`
    - [X] `urgent` -> `boolean`
    - [ ] `windows` -> `WindowRef[]`
  - Bindings
    - [X] `focused` -> `boolean`
    - [X] `visible` -> `boolean`
    - [X] `output` -> `string`
  - Methods
    - [X] `focus()`
    - [ ] `moveToOutput(output: string)`

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

- `Device`
  - [X] `new Device(opts)` public constructor
  - Properties
    - [ ] `type` -> `string`
  - Bindings
    - [ ] `grabbed` -> `boolean`
  - Methods
    - [ ] `macro(combo: string, cb: Function)`
  - Events
    - [X] `key`
    - [ ] `mousemove`
    - [ ] `mousedown`
    - [ ] `mouseup`
    - [ ] `mousewheel`
- `SpeedEditor` (specific extension for Davinci Resolve Speed Editor)
  - [ ] `new SpeedEditor(opts)` public constructor
  - Methods
    - [ ] `macro(combo: string, cb: Function)`
    - [ ] `setLED(led: number, state: boolean)`
  - Events
    - [ ] `key`
    - [ ] `wheel`

### XKeyGrab

WIP, JS binding for X11's `XGrabKey`

## Development

BunHotKey is developed in Zig and TypeScript. Run `bun install` to install dependencies and build the library. Zig is installed through npm.
