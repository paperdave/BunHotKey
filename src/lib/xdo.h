#include "init.h"
#include <xdo.h>
#include <stdio.h>
#include <sys/types.h>
#include <signal.h>
#include <unistd.h>

int get_active_window(void);
void move_mouse(int x, int y, int screen);
void move_mouse_relative_to_window(Window window, int x, int y);
void move_mouse_relative(int x, int y);
void mouse_down(Window window, int button);
void mouse_up(Window window, int button);
void get_mouse_location(int *buffer);
Window get_window_at_mouse(void);
void wait_for_mouse_move_from(int x, int y);
void wait_for_mouse_move_to(int x, int y);
void click_window(Window window, int button);
void click_window_multiple(Window window, int button, int repeat, unsigned int delay);
void enter_text_window(Window window, char *text, unsigned int delay);
void send_keysequence_window(Window window, char *keysequence, unsigned int delay);
void send_keysequence_window_up(Window window, char *keysequence, unsigned int delay);
void send_keysequence_window_down(Window window, char *keysequence, unsigned int delay);
void move_window(Window window, int x, int y);
void set_window_size(Window window, int w, int h, int flags);
void set_window_property(Window window, char *key, char *value);
void set_window_class(Window window, char *name, char *class);
void set_window_urgency(Window window, int urgency);
void focus_window(Window window);
void raise_window(Window window);
void activate_window(Window window);
Window get_focused_window(void);
void wait_for_window_focus(Window window);
int get_window_pid(Window window);
void get_window_location(Window window, int *buffer);
void get_window_size(Window window, unsigned int *buffer);
Window wait_select_window_with_click(void);
unsigned int get_input_state(void);
void close_window(Window window);
void kill_window(Window window);
void quit_window(Window window);
unsigned char *get_window_name(Window window);
