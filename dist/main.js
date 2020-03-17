'use strict';

var _require = require('electron-updater'),
    autoUpdater = _require.autoUpdater;

autoUpdater.checkForUpdatesAndNotify();

var _require2 = require('electron'),
    BrowserWindow = _require2.BrowserWindow,
    app = _require2.app;

var SerialPort = require('serialport');
var Readline = SerialPort.parsers.Readline;
var path = require('path');
var url = require('url');
var regex = /(ST|US),GS,\s+([0-9.]+)(lb|kb)/g;
var currentEnvironment = process.env.NODE_ENV;
var isOnline = require('is-online');
var possibleComNames = ["/dev/cu.usbserial", 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9']; //dev/tty.usbserial = MAC ; COM3 = Windows

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = void 0,
    units = void 0,
    status = void 0;

var windowOptions = {
  center: true,
  minWidth: 1000,
  minHeight: 768,
  width: 1366,
  height: 768
};

function readLine(line) {
  var parsedLine = '0.000';
  var stableString = void 0;
  while ((m = regex.exec(line)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    units = m[3];
    parsedLine = m[2];
    stableString = m[1];
  }
  if (stableString !== undefined) {
    status = stableString;
  }
  console.log("Status ", status);
  return parsedLine;
}

function closeWindow() {
  var closeMessage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'you did something wrong.';

  mainWindow.close();
  console.log('Window closed because ' + closeMessage);
}

// Check that the PC has internet once the window is open every couple seconds
setInterval(function () {
  return isOnline().then(function (online) {
    if (online !== true) {
      closeWindow('you have lost internet.');
    }
  });
}, 1000);

/** Serial Port Stuff **/
function initSerialPort() {
  var comName = '';
  var port = void 0;
  var parser = new Readline();

  try {
    SerialPort.list(function (err, ports) {
      ports.forEach(function (tempPort) {
        if (possibleComNames.includes(tempPort.comName)) {
          comName = tempPort.comName;
          port = new SerialPort(comName);
          port.pipe(parser);

          port.on('close', function () {
            console.log('Port has been closed.');
            closeWindow('Port has been closed.');
          });

          // Only inject code when they are on the correct web page
          // Stream all data coming in from the serial port.
          parser.on('data', function (data) {
            var currentWeight = readLine(data);
            console.log("Current Weight: ", currentWeight);

            var code = 'if(document.getElementById("weight") !== null){\n                    document.getElementById("weight").value = "' + currentWeight + '";\n                    document.getElementById("status").innerHTML = "' + status + '";\n                    document.getElementById("units").innerHTML = "' + units + '";\n                    };';

            if (mainWindow.webContents.getURL().includes('tools/weighStation')) {
              console.log("Execute");
              mainWindow.webContents.executeJavaScript(code);
            }
          });
        }
      });
    });
  } catch (err) {
    closeWindow('You have lost internet.');
    console.log('I caught a thing. '.err);
  }
}

/** BrowserWindow setup and such **/
function createWindow() {

  // Create the browser window.
  mainWindow = new BrowserWindow(windowOptions);

  // When in development environment, open the Redux DevTools Extension and the Chrome DevTools.
  // Need to have the Chrome Extension at the location below.
  // If on MAC and have Redux DevTools installed, then it should be at this location.
  if (currentEnvironment === 'DEV') {
    BrowserWindow.addDevToolsExtension("../../Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.15.1_0/");
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL('http://localhost:3000');
  } else if (currentEnvironment === 'WINDEV') {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // and load the index.html of the app.
    mainWindow.loadURL('https://oms.fulfillment.com/');
  }
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
  mainWindow.webContents.on('did-finish-load', function () {
    initSerialPort();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  app.quit();
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
//# sourceMappingURL=main.js.map