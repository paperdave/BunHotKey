import { EventDevice } from "./src/EventDevice";
import { Key } from "./src/input-enum";

const x = new EventDevice({
  vendor: 0x1b1c,
  product: 0x1b3d,
  grab: true,
});

x.on("key", (key) => {
  console.log("key", key.type, Key[key.code]);
});
