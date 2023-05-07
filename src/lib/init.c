#include "init.h"

void init() {
  xdo = xdo_new(":0");
  display = xdo->xdpy;
}

void deinit() {
  xdo_free(xdo);
}
