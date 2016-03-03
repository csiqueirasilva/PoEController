var Logger = require('./Logger');
var Controller = require('./Controller');
var Window = require('./Window');

Logger.info('using screen resolution: ' + Window.resolution);

var Game = require('./Game');

Game.loadSignatures();

Game.init();