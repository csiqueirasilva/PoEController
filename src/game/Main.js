var Logger = require('./Logger');
var Controller = require('./Controller');
var ENUMS = require('./Enums');
var Window = require('./Window');

Logger.info('using screen resolution: ' + Window.resolution);

var Game = require('./Game');

var GAME_MODE = ENUMS.GAME_MODE;
var KEYS = ENUMS.KEYS;

Game.loadSignatures();

Game.init();