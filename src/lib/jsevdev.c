#include "jsevdev.h"

void* jsevdev_thread(void* args) {
  struct jsevdev* emitter = (struct jsevdev*)args;
  void (*callback) (__u16 type, __u16 code, __s32 value) = emitter->callback;
  const char* dev = emitter->dev;
  int fd = emitter->fd;

  struct input_event ev;
  ssize_t n;

  while (emitter->running) {
    n = read(fd, &ev, sizeof ev);
    if (n == (ssize_t)-1) {
      if (errno == EINTR)
        continue;
      else
        break;
    } else if (n != sizeof ev) {
      errno = EIO;
      break;
    }

    if (ev.type == EV_KEY && ev.value >= 0 && ev.value <= 2) {
      callback(ev.type, ev.code, ev.value);
    }
  }

  if(emitter->grab) {
    if (ioctl(fd, EVIOCGRAB, 0) == -1) {
      printf("Cannot ungrab %s: %s.\n", dev, strerror(errno));
    }
  }
  close(fd);
  free(emitter);
  return NULL;
}

struct jsevdev* jsevdev_init(const char* dev, bool grab, void* callback) {
  int fd = open(dev, O_RDONLY);
  if (fd == -1) {
    printf("Cannot open %s: %s.\n", dev, strerror(errno));
    return NULL;
  }
  if (grab) {
    if (ioctl(fd, EVIOCGRAB, 1) == -1) {
      printf("Cannot grab %s: %s.\n", dev, strerror(errno));
      return NULL;
    }
  }

  struct jsevdev* emitter = malloc(sizeof(struct jsevdev));
  emitter->dev = dev;
  emitter->fd = fd;
  emitter->grab = grab;
  emitter->callback = callback;
  emitter->running = true;
  pthread_create(&emitter->thread, NULL, jsevdev_thread, emitter);

  return emitter;
}

void jsevdev_dispose(struct jsevdev* emitter) {
  pthread_t thread = emitter->thread;
  emitter->running = false;
  pthread_join(thread, NULL);
}
