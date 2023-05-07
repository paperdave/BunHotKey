#include "init.h"

Display *display;
xdo_t *xdo;

void init() {
  xdo = xdo_new(":0");
  display = xdo->xdpy;
}

void deinit() {
  xdo_free(xdo);
}
