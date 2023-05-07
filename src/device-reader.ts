import { capitalize } from "@paperdave/utils";
import { readFileSync } from "fs";

const inputBusFile = "/proc/bus/input/devices";
const inputBusLineRegex = /^([A-Z]): ?(.*?)=(.*)$/; // example: "N: HANDLERS=key event25"

// things that appear as keyboards, but aren't really useful / or actually keyboards
// so we will exclude these in our keyboard search.
const keyboardExclusions = [
  /^PC Speaker$/,
  /Audio Device$/,
  /^Sleep Button$/,
  /^Power Button$/,
  /System Control/,
  /Consumer Control/,
  /Webcam/,
  /^Video Bus$/,
];

function isKeyboardNameExcluded(name: string) {
  return keyboardExclusions.find((regex) => regex.exec(name));
}

function getInputDevices() {
  const string = readFileSync(inputBusFile, "utf8");
  const devices = string
    // each device is a double newline
    .split("\n\n")
    // remove last
    .slice(0, -1)
    .map((entry) => {
      return Object.fromEntries(
        entry
          // split newline
          .split("\n")
          // process each to a key value pair
          .map((line) => {
            if (line.startsWith("I")) {
              // the I (i think info) has many things on one line. why? i have no idea.
              return [
                "info",
                Object.fromEntries(
                  line
                    // remove 'I: '
                    .slice(3)
                    // split by space
                    .split(" ")
                    .map((part) => {
                      const split = part.split("=");
                      return [split[0].toLowerCase(), split[1]];
                    })
                ),
              ];
            }
            const match = inputBusLineRegex.exec(line)!;
            if (match[1] === "B") {
              return ["b" + capitalize(match[2].toLowerCase()), match[3]];
            } else if (match[2] === "Handlers") {
              return ["handlers", match[3].split(" ").slice(0, -1)];
            } else if (match[2] === "Name") {
              return ["name", match[3].slice(1, -1)];
            } else {
              return [match[2].toLowerCase(), match[3]];
            }
          })
      );
    });
  return devices as RawDevice[];
}

interface RawDevice {
  info: {
    bus: string;
    vendor: string;
    product: string;
    version: string;
  };
  name: string;
  handlers: string[];
  phys: string;
  sysfd: string;
  uniq: string;
  bProp?: string;
  bEv?: string;
  bKey?: string;
  bRel?: string;
  bAbs?: string;
  bMsc?: string;
  bLed?: string;
  bSw?: string;
}

function isKeyboardDevice(device: RawDevice) {
  return (
    device.handlers.includes("kbd") && !isKeyboardNameExcluded(device.name)
  );
}

function getKeyboardDevices() {
  return getInputDevices().filter(isKeyboardDevice);
}

export {
  getInputDevices,
  getKeyboardDevices,
  isKeyboardDevice,
  isKeyboardNameExcluded,
};

console.log(getKeyboardDevices());
