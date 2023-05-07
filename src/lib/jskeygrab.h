#include "init.h"
#include <fcntl.h>
#include <linux/input.h>
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <stdbool.h>
#include <X11/Xlib.h>
#include <X11/Xutil.h>

typedef void jskeygrab_cb_t(int type, Window window, Window subwindow, int x, int y, Time time, unsigned int keycode, unsigned int modifiers);
struct jskeygrab {
  int keycode;
  unsigned int modifiers;
  Window window;
  bool hasMod2;
};

void jskeygrab_set_cb(jskeygrab_cb_t* callback);
struct jskeygrab* jskeygrab_add(int keycode, unsigned int modifiers, Window window);
void jskeygrab_dispose(struct jskeygrab* keygrab);
