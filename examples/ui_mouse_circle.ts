import { ui } from "bhk";

const center = { x: 2560 / 2, y: 1440 / 2 };
const radius = 500;

setInterval(() => {
  const angle = Date.now() / 1000;

  ui.mouse.pos = {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
}, 10);

setTimeout(() => {
  ui.mouse.pos = center;
  process.exit(0);
}, 10000);
