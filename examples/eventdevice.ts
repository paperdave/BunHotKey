import { EventDevice } from "bhk";

const device = new EventDevice({
  vendor: 0x1b1c,
  product: 0x1b3d,
  grab: true,
});
device.on('key', key => {
  console.log(key);
});
