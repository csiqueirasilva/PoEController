#include <io.h>
#include <windows.h>
#include <xinput.h>
#include <iostream>
#include <cstdlib>
#include <string>
#include <conio.h>
#include <bitset>
#include <fcntl.h>

#define DEBUG 0

#pragma comment (lib, "xinput.lib")

using namespace std;

#define ESCAPE_KEY 27
#define LEFT_TRIGGER_BIT    0b0000100000000000
#define RIGHT_TRIGGER_BIT   0b0000010000000000

short convertTo8bitRange(SHORT number) {
    return ((number >> 8) + 128);
}

void outputBits(XINPUT_STATE *state) {
    int size = 9;
    char* bits = new char[size];
    int bRightTriggerPressed = 0;
    int bLeftTriggerPressed = 0;

    bits[0] = state->dwPacketNumber;

    bits[1] = convertTo8bitRange(state->Gamepad.sThumbLX);
    bits[2] = convertTo8bitRange(state->Gamepad.sThumbLY);

    bits[3] = convertTo8bitRange(state->Gamepad.sThumbRX);
    bits[4] = convertTo8bitRange(state->Gamepad.sThumbRY);

    bits[5] = state->Gamepad.bLeftTrigger;
    bits[6] = state->Gamepad.bRightTrigger;
    
    if (state->Gamepad.bLeftTrigger) {
        bLeftTriggerPressed = LEFT_TRIGGER_BIT;
    }

    if (state->Gamepad.bRightTrigger) {
        bRightTriggerPressed = RIGHT_TRIGGER_BIT;
    }

    bits[7] = (state->Gamepad.wButtons | bLeftTriggerPressed | bRightTriggerPressed) >> 8;
    bits[8] = state->Gamepad.wButtons & 0b0000000011111111;

    std::ostream& lhs = std::cout;
    _setmode(_fileno(stdout), _O_BINARY);
    lhs.write(bits, size);
    fflush(stdout);
    delete[] bits;
}

int main(void) {

    DWORD dwResult;
    int exit = 0;

    do {
        XINPUT_STATE state;
        ZeroMemory(&state, sizeof(XINPUT_STATE));

        // Simply get the state of the controller from XInput at position 0, first player.
        dwResult = XInputGetState(0, &state);

        if (dwResult == ERROR_SUCCESS) {
            outputBits(&state);
        }

#if DEBUG == 1
        if (_kbhit()) {
            exit = _getch();
        }

        Sleep(20);
#else
        Sleep(5);
#endif


#if DEBUG == 1
    } while (exit != ESCAPE_KEY);
#else
    } while (true);
#endif

    return 0;
}