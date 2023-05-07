import { EventDevice } from "./src/evdev";
import { Key } from "./src/input-enum";

const x = new EventDevice("/dev/input/event21");
x.addListener("key", (key) => {
  console.log("key", key.type, Key[key.code]);
});
