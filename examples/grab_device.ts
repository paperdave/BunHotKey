import { Device } from "bhk";

const device = new Device({
  vendor: 0x1b1c,
  product: 0x1b3d,
  grab: true,
});
device.on("key", (key) => {
  console.log(key);
});
