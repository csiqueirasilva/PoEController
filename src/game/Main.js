var ENUMS = require('./game/Enums.js');
var Logger = require('./game/Logger.js');
var Window = require('./game/Window.js');
var Controller = require('./game/Controller');
var Game = require('./game/Game');

var GAME_MODE = ENUMS.GAME_MODE;
var KEYS = ENUMS.KEYS;

Window.quitIf(!Logger, "Could not create log file.");
Window.quitIf(!Controller.found, "Error while connecting to xbox 360/one controller driver. Please ensure it is correctly connected and configured.");

Game.loadSignatures();

Game.init();