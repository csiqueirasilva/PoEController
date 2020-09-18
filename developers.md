# Developer's Guide

This application was made in the past just to allow some players to experience Path of Exile with a gamepad. When it was made, there was no console version of the game and some attempts were made to add a gamepad to it.

Currently (September 2020), this application servers as an accessibility tool to some people to play the game.

The version v2.0 of this project was built using ElectronJS (version of the libraries in package.json), node v12.18.3 and npm v6.14.6.

The following steps are required to get the application running on your end, after installing node, npm and git:

- clone from github

```
git clone https://www.github.com/csiqueirasilva/PoEController
```

- to the usual install command to install dependencies

```
npm install
```

- this replace the old nw-gyp stuff (builds native libraries to work with electron):

```
.\node_modules\.bin\electron-rebuild.cmd
```

- to initialize the application:

```
npm start
```

# configuration file 

The configuration file for the application resides in **%APPDATA%\PoeController\user-settings.json**. It is copied from config_ref.json, on the root of the project, if it doesn't exists.

```
{
	"debug": false, /* sets the debug mode on */
	"steamGame": false, /* sets that the game should run by steam id, opening within steam */
	"gamePath": "C:\\Games\\Path of Exile\\PathOfExile_x64.exe", /* sets the gamepath for standalone */
	"gameConfigPath": "%USERPROFILE%\\Documents\\My Games\\Path of Exile\\production_Config.ini", /* sets the game config path */
	"inputFunctions": { /* old user-settings, with selected input modes; might not be working */
		"input":"xbox",
		"q":"arpg.nothing",
		"w":"arpg.nothing",
		"e":"arpg.nothing",
		"r":"arpg.nothing",
		"right":"arpg.nothing",
		"middle":"arpg.nothing"
	},
	"vid": 0, /* the vid of the gamepad */
	"pid": 0, /* the pid of the gamepad */
	"bluetooth": false /* check if gamepad is bluetooth */
}
```

The input translators should reside in **src/game/inputs/**, in the format of i\<vid\>_\<pid\>.js with the application shipping with i1356_2508.js for PS4 controller (its what I have to test currently).

If your controller is not detected, it opens a new interface where you can select the detected usb devices and check the pid/vid for it (and also it writes the first 16 bytes of data from the buffer, so you can do some quick input tests and check whats been read in binary data).

<img src="screenshots/hardwareconfig1.png" alt="Main menu" width="100%" />

<img src="screenshots/hardwareconfig2.png" alt="Main menu" width="100%" />

Notice that for the printed array might differ if your device is on bluetooth mode or not. I did the following fix on i1356_2508.js to solve it:

```
function handleInput(data) {
	var ret = null;

	if(Settings.bluetooth) {
		data = data.slice(2);
	}
	
	(...)
```

This might differ from each type of input.

# Code Walkthrough

(Some things might seem bloated/unnecessary code, but it was rushed from v1.x releases to v2.x; some things weren't touched just to keep the application not broken)

Electron works with the concepts of a main process and renderer process (for each open window). Communication between them is being done through an embedded IPC channel (ipcMain on the main process and ipcRenderer on the windows). There's no intercommunication between windows, they need to relay a message through the main process.

The entry point of the application is **main.js**, which sets up some electron related options, creates all the windows, sets some listeners for window related things and requires the old **src/game/Main.js** script when done. There are three windows:

- *Overlay*: its where the key mappings are. Its an always on top window that serves just the purpose of showing information while the gamepad events are being parsed (supposed to run on top of the game). Its HTML script is **src/game-overlay.html**.
- *menuWindow*: its the mappings configuration menu, where its possible to start the gamepad. Its HTML script is **src/index.html**.
- *hardwareConfig*: introduced in v2.x, it serves as a well to displaying hardware related information, for easier debugging and gamepad detection/setting. Its HTML script is **src/config.html**.

**src/game/Main.js** used to do many things (now on the electron entry point), but now just requires **src/game/Game.js**.

**src/game/Game.js** holds the listeners for *game-start* and *game-finish* events on the main process. It also starts **node-hid stuff** by requiring **src/game/Controller** and, if successful, includes the detected gamepad input script translator, while **src/game/Controller** opens *menuWindow*. If **src/game/Controller** can't find a gamepad, it opens *hardwareConfig*. 

**src/game/Game.js** also requires **src/game/modes/ARPG**, which defines some functions and in turn requires **src/game/Input**, that handles all the detected inputs using an *eventEmitter*, among other input related configurations/definitions.

The gamepad detection works like this:

- *game-start* event gets called in the main process:

```
ipcMain.on('game-start', (ev, data, inputMethod, arpgHelp) => {
	var behaviorsArr = [];
	for(var k in data) {
		behaviorsArr[parseInt(k)] = data[k];
	} // sets the keys as numbers; were getting them as strings - this is for ENUM relation
	GameModeARPG.setBehavior(behaviorsArr); // sets the behaviors (configured in menuWindow)
	StartControllerListener(); // starts to poll events from the gamepad and opens the game, if not DEBUG_MODE is set
	Window.send('Overlay', 'game-start', inputMethod, arpgHelp); // shows the overlay and trigger some frontend code on Overlay
	Window.send('menuWindow', 'game-start', true); // triggers a listener to run some frontend code on menuWindow
});
```

- the polling mechanism gets *data* array from the gamepad and relays it to Input.handleData(data); Input is the module that was required base on the detected gamepad vid and pid, and such scripts reside at **src/game/inputs/**, with the format **i\<vid\>_\<pid\>.js**. **src/game/Input** receives data from this vid/pid script, and abstracts the input into what they are supposed to do.

- *game-finish* event gets called when the user presses "Stop Gamepad" button on *menuWindow*. This hides *Overlay* and stops reading data from the gamepad.

# IMPORTANT

When adding your own device to the application, some mistakes might be made when correctly identifying each data byte and emitting events to Input.js (that handles inputs in an abstract way). To avoid system wide failures (due to many keyboard presses or mouse clicks being made), I suggest that you attempt to add each button at a time and when safe, move to the next. This method might prevent your computer from crashing while testing the gamepad input in early stages.
