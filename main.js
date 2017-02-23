const { BrowserWindow, app } = require('electron');
const SerialPort = require('SerialPort');
const path = require('path');
const url = require('url');
const regex = /(ST|US),GS,\s+([0-9.]+)(lb|kb)/g;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let webContents;

let windowOptions = {
  center: true,
  width: 2000,
  height: 1800,
};

/** Serial Port Stuff **/
let port = new SerialPort('/dev/tty.usbserial', {
  parser: SerialPort.parsers.readline('\n'),
  baudrate: 19200
});

function readLine(line) {
  // console.log(line);
  let parsedLine = '0.000';
  while ((m = regex.exec(line)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    // m.forEach((match, groupIndex) => {
    //   console.log(`Found match, group ${groupIndex}: ${match}`);
    // });
    parsedLine = m[2];
  }
  return parsedLine;
}

/** BrowerWindow setup and such **/
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 2000, height: 1800 });

  // and load the index.html of the app.
  mainWindow.loadURL('http://localhost:3000/weighStation');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.webContents.on('did-finish-load', function () {
    // Stream all data coming in from the serial port.
    port.on('data', function (data) {
      if (data) {
        let currentWeight = readLine(data);
        console.log(currentWeight);
        let code = `document.getElementById("weight").innerHTML = "${currentWeight}";`;
        mainWindow.webContents.executeJavaScript(code);
      }
    });
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
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


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
