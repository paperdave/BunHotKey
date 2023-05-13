export type PayloadBuffer =
  | TypedArray
  | DataView
  | ArrayBuffer
  | SharedArrayBuffer;

export enum I3MessageType {
  RUN_COMMAND = 0,
  GET_WORKSPACES = 1,
  SUBSCRIBE = 2,
  GET_OUTPUTS = 3,
  GET_TREE = 4,
  GET_MARKS = 5,
  GET_BAR_CONFIG = 6,
  GET_VERSION = 7,
  GET_BINDING_MODES = 8,
  GET_CONFIG = 9,
  SEND_TICK = 10,
  SYNC = 11,
  GET_BINDING_STATE = 12,
}

export enum I3EventType {
  workspace = 0,
  output = 1,
  mode = 2,
  window = 3,
  barconfig_update = 4,
  binding = 5,
  shutdown = 6,
  tick = 7,
}

export enum I3FullscreenMode {
  NONE = 0,
  SCREEN = 1,
  GLOBAL = 2,
}

export interface I3Version {
  major: number;
  minor: number;
  patch: number;
  human_readable: string;
  loaded_config_file_name: string;
  included_config_file_names: string[];
}

export interface I3Workspace {
  id: number;
  num: number;
  name: string;
  visible: boolean;
  focused: boolean;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  output: string;
  urgent: boolean;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** https://i3wm.org/docs/ipc.html#_tree_reply */
export interface I3TreeNode {
  id: number;
  type: "root" | "output" | "con" | "floating_con" | "workspace" | "dockarea";
  border: "normal" | "none" | "pixel";
  orientation: "horizontal";
  scratchpad_state: "none";
  percent: null | number;
  urgent: boolean;
  marks: string[];
  focused: boolean;
  layout: "splith" | "splitv" | "stacked" | "tabbed" | "dockarea";
  workspace_layout: "default";
  last_split_layout: "splith" | "splitv" | "stacked" | "tabbed" | "dockarea";
  current_border_width: number;
  rect: Rect;
  deco_rect: Rect;
  window_rect: Rect;
  geometry: Rect;
  name: string;
  window_icon_padding: number;
  window: number | null;
  window_type: null;
  window_properties?: {
    title: string;
    instance: string;
    class: string;
    transient_for: string;
    window_role: string;
    machine: string;
  };
  nodes: I3TreeNode[];
  floating_nodes: I3TreeNode[];
  focus: number[];
  fullscreen_mode: I3FullscreenMode;
  sticky: boolean;
  floating: "auto_off" | "auto_on" | "user_off" | "user_on";
  swallows: [];
}

export interface I3Config {
  config: string;
  included_configs: {
    path: string;
    raw_contents: string;
    variable_replaced_contents: string;
  }[];
}

export interface I3Events {
  workspace: [I3WorkspaceEvent];
  output: [I3OutputEvent];
  mode: [I3ModeEvent];
  window: [I3WindowEvent];
  // barconfig_update: [I3BarConfig];
  binding: [I3BindingEvent];
  shutdown: [I3ShutdownEvent];
  tick: [I3TickEvent];
}

export interface I3WorkspaceEvent {
  change: "focus" | "init" | "empty" | "urgent";
  current: I3Workspace;
  old: I3Workspace;
}

export interface I3OutputEvent {
  change: "unspecified";
}

export interface I3ModeEvent {
  change: string;
  pango_markup: string;
}

export interface I3WindowEvent {
  change:
    | "new"
    | "close"
    | "focus"
    | "title"
    | "fullscreen_mode"
    | "move"
    | "floating"
    | "urgent"
    | "mark";
  container: I3TreeNode;
}

export interface I3BindingEvent {
  change: "run";
  binding: {
    command: string;
    event_state_mask: string[];
    input_code: number;
    symbol: string;
    input_type: "keyboard" | "mouse";
  };
}

export interface I3ShutdownEvent {
  change: "restart" | "exit";
}

export interface I3TickEvent {
  first: boolean;
  payload: string;
}
