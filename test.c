#include <stdio.h>
#include "src/lib/init.h"
#include "src/lib/xdo.h"

int main() {
    // Initialize the library
    init();

    // Get the mouse location
    int buffer[3];
    get_mouse_location(buffer);

    // Print the mouse coordinates
    printf("Mouse Location: x = %d, y = %d, screen = %d\n", buffer[0], buffer[1], buffer[2]);

    return 0;
}
