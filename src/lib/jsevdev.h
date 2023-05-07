#pragma once
#include <fcntl.h>
#include <linux/input.h>
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <stdbool.h>

struct jsevdev {
  const char* dev;
  int fd;
  bool grab;
  
  void (*callback) (__u16 type, __u16 code, __s32 value);
  
  bool running;
  pthread_t thread;
};

struct jsevdev* jsevdev_init(const char* dev, bool grab, void* callback);
void jsevdev_dispose(struct jsevdev* emitter);
