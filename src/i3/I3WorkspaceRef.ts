import { I3Workspace, Rect } from "./i3-types";
import { i3 as ee } from "./i3";

let cachedJSON: I3Workspace[];
const map = new Map<number, I3WorkspaceRef>();

export class I3WorkspaceRef {
  id: number;
  num: number;
  name: string;
  visible: boolean;
  focused: boolean;
  rect: Rect;
  output: string;
  urgent: boolean;

  constructor(workspace: I3Workspace) {
    this.id = workspace.id;
    this.num = workspace.num;
    this.name = workspace.name;
    this.visible = workspace.visible;
    this.focused = workspace.focused;
    this.rect = workspace.rect;
    this.output = workspace.output;
    this.urgent = workspace.urgent;
    map.set(this.num, this);
  }

  focus() {
    ee.exec(`workspace ${this.name}`);
  }
}

export function i3GetWorkspaces() {
  if (!cachedJSON) {
    var proc = Bun.spawnSync(["i3-msg", "-t", "get_workspaces"]);
    if (!proc.success) {
      throw new Error("i3-msg failed");
    }
    cachedJSON = JSON.parse(proc.stdout.toString());
    var length = cachedJSON.length;
    var ret = new Array(length);
    for (var i = 0; i < length; i++) {
      var wksp = new I3WorkspaceRef(cachedJSON[i]);
      ret[i] = wksp;
      map.set(wksp.id, wksp);
    }
    ee.on("workspace", ({ change, current, old }) => {
      console.log("workspace", { change, current, old });
    });
    return ret;
  }
  return [...map.values()];
}
