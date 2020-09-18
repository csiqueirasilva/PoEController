const electron = require('electron');
const app = electron.app;
const screen = electron.screen;
const child_process = require('child_process');
const PoESettings = require('./src/menu/PoESettings');
const ipcMain = electron.ipcMain;
const Controller = require('./src/game/Controller');

const menuWidth = 1173;
const menuHeight = 660;

function createWindow () {
	
	const hardwareConfig = new electron.BrowserWindow({
		fullscreen: false,
		frame: false,
		alwaysOnTop: false,
		resizable: false,
		title: "hardwareConfig",
		focusable: true,
		skipTaskbar: false,
		width: menuWidth,
		height: menuHeight,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			webSecurity: false
		}
	});
	
	hardwareConfig.hide();
	
	hardwareConfig.loadFile('./src/config.html');

	hardwareConfig.webContents.once('did-finish-load', () => {
		
		const menuWindow = new electron.BrowserWindow({
			fullscreen: false,
			frame: false,
			alwaysOnTop: false,
			title: "menuWindow",
			resizable: false,
			focusable: true,
			skipTaskbar: false,
			width: menuWidth,
			height: menuHeight,
			webPreferences: {
				nodeIntegration: true,
				enableRemoteModule: true,
				webSecurity: false
			}
		});
		
		menuWindow.hide();
		
		menuWindow.loadFile('./src/index.html');
		
		menuWindow.webContents.once('did-finish-load', () => {
			
			const win = new electron.BrowserWindow({
				fullscreen: true,
				transparent: true, 
				resizable: false,
				frame: false,
				alwaysOnTop: true,
				title: "Overlay",
				icon: "src/imgs/app-icon.png",
				focusable: false,
				skipTaskbar: true,
				webPreferences: {
					nodeIntegration: true,
					enableRemoteModule: true,
					webSecurity: false
				}
			});

			const display = screen.getPrimaryDisplay();

			const Height = parseInt(display.bounds.height * display.scaleFactor);
			const Width = parseInt(display.bounds.width * display.scaleFactor);

			win.setIgnoreMouseEvents(true, { forward: true });
			
			win.setAlwaysOnTop(true, 'pop-up-menu');
			
			ipcMain.on('window-request-screensize', () => {
				let windows = electron.BrowserWindow.getAllWindows();
				windows.forEach((wind) => {
					wind.webContents.send('window-screen-size', {width: Width, height: Height});
				});
			});
			
			ipcMain.on('app_quit', () => {
				let windows = electron.BrowserWindow.getAllWindows();
				windows.forEach((wind) => {
					wind.hide();
				});
				Controller.unload();
				PoESettings.restoreConfigFile();
				setTimeout(() => app.quit(), 300);
			});
			
			ipcMain.on('window-open-readme', () => {
				electron.shell.openExternal('https://github.com/csiqueirasilva/PoEController/blob/master/README.md');
			});
			
			win.loadFile('./src/game-overlay.html');
			
			win.webContents.once('did-finish-load', () => {
				PoESettings.rewriteConfigFile();
				require('./src/game/Main');
			});
			
		});
		
	});
}

app.whenReady().then(createWindow);