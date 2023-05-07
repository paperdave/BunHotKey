#include "jskeygrab.h"

jskeygrab_cb_t* cb = NULL;
pthread_t thread = 0;
size_t jskeygrab_count = 0;

void* jskeygrab_thread(void* args) {
  XEvent event;
  while (jskeygrab_count > 0) {
    XNextEvent(display, &event);
    if (event.type == KeyPress) {
      if (cb != NULL) {
        cb(event.xkey.type, event.xkey.window == event.xkey.root ? 0 : event.xkey.window, event.xkey.subwindow, event.xkey.x, event.xkey.y, event.xkey.time, event.xkey.keycode, event.xkey.state);
      }
    }
  }
  return NULL;
}

void jskeygrab_set_cb(jskeygrab_cb_t* callback) {
  cb = callback;
}

struct jskeygrab* jskeygrab_add(int keycode, unsigned int modifiers, Window window) {
  if (window == 0) {
    window = DefaultRootWindow(display);
  }

  struct jskeygrab* keygrab = malloc(sizeof(struct jskeygrab));
  int result = XGrabKey(display, keycode, modifiers, window, false, GrabModeAsync, GrabModeAsync);

  if (result != 1) {
    fprintf(stderr, "XGrabKey failed: %d\n", result);
    free(keygrab);
    return NULL;
  }
  if ((modifiers & Mod2Mask) == 0) {
    result = XGrabKey(display, keycode, modifiers | Mod2Mask, window, false, true, true);
    keygrab->hasMod2 = result == 1;
  } else {
    keygrab->hasMod2 = false;
  }
  keygrab->keycode = keycode;
  keygrab->modifiers = modifiers;
  keygrab->window = window;
  if(jskeygrab_count == 0) {
    int r = pthread_create(&thread, NULL, jskeygrab_thread, NULL);
    if (r != 0) {
      fprintf(stderr, "pthread_create failed: %d\n", r);
      free(keygrab);
      return NULL;
    }
  }
  jskeygrab_count++;
  return keygrab;
}

void jskeygrab_dispose(struct jskeygrab* keygrab) {
  if (keygrab->hasMod2) {
    XUngrabKey(display, keygrab->keycode, keygrab->modifiers | Mod2Mask, keygrab->window);
  }
  XUngrabKey(display, keygrab->keycode, keygrab->modifiers, keygrab->window);
  free(keygrab);
  jskeygrab_count--;
  if (jskeygrab_count == 0) {
    pthread_cancel(thread);
  }
}
