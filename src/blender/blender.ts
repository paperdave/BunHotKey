import { callerSourceOrigin } from "bun:jsc";
import path from "path";

export const blender = {
  async execString(str: string) {
    console.log(str);
  },
  async execFile(file: string) {
    const resolved = path.resolve(path.dirname(callerSourceOrigin()), file);
    console.log(resolved);
  },
};
