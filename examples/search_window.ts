import { ui } from "bhk";

// this is too buggy to be useful
const windows = ui.filterWindows({
  name: "spotify",
});
console.log("n=", windows.length);
console.log(
  "ids",
  windows.map((x) => x.id)
);
console.log(
  "names",
  windows.map((x) => x.name)
);
