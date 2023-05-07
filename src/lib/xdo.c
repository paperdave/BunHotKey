#include "init.h"
#include <xdo.h>
#include <stdio.h>
#include <sys/types.h>
#include <signal.h>
#include <unistd.h>

Window win;

int get_active_window() {
  xdo_get_active_window(xdo, &win);
  return win;
}

void move_mouse(int x, int y, int screen) {
  xdo_move_mouse(xdo, x, y, screen);
}

void move_mouse_relative_to_window(Window window, int x, int y) {
  xdo_move_mouse_relative_to_window(xdo, window, x, y);
}

void move_mouse_relative(int x, int y) {
  xdo_move_mouse_relative(xdo, x, y);
}

void mouse_down(Window window, int button) {
  xdo_mouse_down(xdo, window, button);
}

void mouse_up(Window window, int button) {
  xdo_mouse_up(xdo, window, button);
}

void get_mouse_location(int* buffer) {
  xdo_get_mouse_location(xdo, &buffer[0], &buffer[1], &buffer[2]);
}

Window get_window_at_mouse() {
  int ret = xdo_get_window_at_mouse(xdo, &win);
  if (ret != 0) {
    return 0;
  }
  return win;
}

void wait_for_mouse_move_from(int x, int y) {
  xdo_wait_for_mouse_move_from(xdo, x, y);
}

void wait_for_mouse_move_to(int x, int y) {
  xdo_wait_for_mouse_move_to(xdo, x, y);
}

void click_window(Window window, int button) {
  xdo_click_window(xdo, window, button);
}

void click_window_multiple(Window window, int button, int repeat, unsigned int delay) {
  xdo_click_window_multiple(xdo, window, button, repeat, delay);
}

void enter_text_window(Window window, char* text, unsigned int delay) {
  xdo_enter_text_window(xdo, window, text, delay);
}

void send_keysequence_window(Window window, char* keysequence, unsigned int delay) {
  xdo_send_keysequence_window(xdo, window, keysequence, delay);
}

void send_keysequence_window_up(Window window, char* keysequence, unsigned int delay) {
  xdo_send_keysequence_window_up(xdo, window, keysequence, delay);
}

void send_keysequence_window_down(Window window, char* keysequence, unsigned int delay) {
  xdo_send_keysequence_window_down(xdo, window, keysequence, delay);
}

void move_window(Window window, int x, int y) {
  xdo_move_window(xdo, window, x, y);
}

void set_window_size(Window window, int w, int h, int flags) {
  xdo_set_window_size(xdo, window, w, h, flags);
}

void set_window_property(Window window, char* key, char* value) {
  xdo_set_window_property(xdo, window, key, value);
}

void set_window_class(Window window, char* name, char* class) {
  xdo_set_window_class(xdo, window, name, class);
}

void set_window_urgency(Window window, int urgency) {
  xdo_set_window_urgency(xdo, window, urgency);
}

void focus_window(Window window) {
  xdo_activate_window(xdo, window);
}

void raise_window(Window window) {
  xdo_raise_window(xdo, window);
}

void activate_window(Window window) {
  xdo_activate_window(xdo, window);
}

Window get_focused_window() {
  xdo_get_focused_window(xdo, &win);
  return win;
}

void wait_for_window_focus(Window window) {
  xdo_wait_for_window_focus(xdo, window, 0);
}

int get_window_pid(Window window) {
  return xdo_get_pid_window(xdo, window);
}

void get_window_location(Window window, int* buffer) {
  xdo_get_window_location(xdo, window, &buffer[0], &buffer[1], NULL);
}

void get_window_size(Window window, unsigned int* buffer) {
  xdo_get_window_size(xdo, window, &buffer[0], &buffer[1]);
}

Window wait_select_window_with_click() {
  xdo_select_window_with_click(xdo, &win);
  return win;
}

unsigned int get_input_state() {
  return xdo_get_input_state(xdo);
}

void close_window(Window window) {
  xdo_close_window(xdo, window);
}

void kill_window(Window window) {
  xdo_kill_window(xdo, window);
}

void quit_window(Window window) {
  xdo_quit_window(xdo, window);
}

unsigned char* get_window_name(Window window) {
  unsigned char* name_ret;
  int name_len_ret;
  int name_type;
  int ret = xdo_get_window_name(xdo, window, &name_ret, &name_len_ret, &name_type);
  return name_ret;
}
