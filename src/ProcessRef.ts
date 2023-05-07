import { readFileSync, readlinkSync } from "fs";
import * as ffi from "./ffi";

export class ProcessRef {
  constructor(public pid: number) {}

  get name() {
    return readFileSync(`/proc/${this.pid}/comm`, "utf8");
  }

  get cmdline() {
    return readFileSync(`/proc/${this.pid}/cmdline`, "utf8")
      .slice(0, -1)
      .split(" ");
  }

  get cwd() {
    return readlinkSync(`/proc/${this.pid}/cwd`);
  }

  get exe() {
    return readlinkSync(`/proc/${this.pid}/exe`);
  }

  get state() {
    return readFileSync(`/proc/${this.pid}/status`, "utf8");
  }

  stat() {
    const contents = readFileSync(`/proc/${this.pid}/stat`, "utf8");
    const match = /(\d+) (\(.*?\)) ([A-Z]) (.*)/.exec(contents)!;
    const [pid, comm, state, rest] = match.slice(1);
    return {
      pid: parseInt(pid),
      state,
      comm: comm.slice(1, -1),
    };
  }

  kill() {
    // return ffi.kill(this.pid, 9);
  }
}
