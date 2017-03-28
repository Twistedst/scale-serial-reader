# scale-serial-reader
An Electron app that utilizes Serialport to read from a serial-usb scale and then inject the data into a webpage.

Originally cloned from [electron-serialport](https://github.com/johnny-five-io/electron-serialport)

This is a minimal Electron application based on the [Quick Start Guide](http://electron.atom.io/docs/tutorial/quick-start) within the Electron documentation.

A basic Electron application needs just these files:

- `package.json` - Points to the app's main file and lists its details and dependencies.
- `main.js` - Starts the app and creates a browser window to render HTML. This is the app's **main process**.
- `index.html` - A web page to render. This is the app's **renderer process**.

You can learn more about each of these components within the [Quick Start Guide](http://electron.atom.io/docs/tutorial/quick-start).

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/electron/electron-quick-start
# Go into the repository
cd electron-quick-start
# Install dependencies
npm install
# Run the app
npm start
```

## To Package
```bash
# Package for each OS
# MAC / OS X
npm run-script package-mac
# Windows
npm run-script package-windows
# Linux
npm run-script package-linux
```
## To Create Installer
```bash
# MAC / OS X
npm run-script create-installer-mac
```
Learn more about Electron and its API in the [documentation](http://electron.atom.io/docs/).
