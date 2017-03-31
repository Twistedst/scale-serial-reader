// //handle setupevents as quickly as possible
// const setupEvents = require('./installers/setupEvents');
// if (setupEvents.handleSquirrelEvent()) {
//   // squirrel event handled and app will exit in 1000ms, so don't do anything else
//   return;
// }

const {BrowserWindow, app} = require('electron');
const SerialPort           = require('SerialPort');
const path                 = require('path');
const url                  = require('url');
const regex                = /(ST|US),GS,\s+([0-9.]+)(lb|kb)/g;
const currentEnvironment   = process.env.NODE_ENV;
const possibleComNames     = [
  "/dev/cu.usbserial",
  'COM3'
]; //dev/tty.usbserial = MAC ; COM3 = Windows

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, units, status;


let windowOptions = {
  center: true,
  width : 2200,
  height: 1800,
};
function readLine(line) {
  // console.log(line);
  let parsedLine = '0.000';
  let stableString;
  while ((m = regex.exec(line)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    units        = m[3];
    parsedLine   = m[2];
    stableString = m[1];
  }
  if (stableString !== undefined) {
    status = stableString;
  }
  console.log("Status ", status);
  return parsedLine;
}
/** Serial Port Stuff **/
function initSerialPort() {
  let comName = '';
  let port;

  try {
    SerialPort.list((err, ports) => {
      ports.forEach((tempPort) => {
        if (possibleComNames.includes(tempPort.comName)) {
          comName  = tempPort.comName;
          port = new SerialPort(comName, {
            parser  : SerialPort.parsers.readline('\n'),
            baudrate: 19200
          }, (err) => {
            if (err) {
              return console.log('Error: ', err.message);
            }
          });
          // Only inject code when they are on the correct web page
          // Stream all data coming in from the serial port.
          port.on('data', function (data) {
            let currentWeight = readLine(data);
            console.log("Current Weight: ", currentWeight);

            let code = `if(document.getElementById("weight") !== null){
                    document.getElementById("weight").value = "${currentWeight}";
                    document.getElementById("status").innerHTML = "${status}";
                    document.getElementById("units").innerHTML = "${units}";
                    };`;

            if (mainWindow.webContents.getURL().includes('tools/weighStation')) {
              console.log("Execute");
              mainWindow.webContents.executeJavaScript(code);
            }
          });
        }
      });
    });
  }
  catch(err){
    console.log('Closing the connection to the scale.');
    port.close();
  }
}


/** BrowserWindow setup and such **/
function createWindow() {

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 2200, height: 1800});


  // When in development environment, open the Redux DevTools Extension and the Chrome DevTools.
  // Need to have the Chrome Extension at the location below.
  // If on MAC and have Redux DevTools installed, then it should be at this location.
  if (currentEnvironment === 'DEV') {
    BrowserWindow.addDevToolsExtension("../../Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.14.2_0/");
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL('http://localhost:3000');
  }
  else if (currentEnvironment === 'WINDEV') {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL('http://localhost:3000');
  }
  else {
    // and load the index.html of the app.
    mainWindow.loadURL('https://rhea.fulfillment.com/');
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
