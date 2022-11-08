const { autoUpdater } = require( 'electron-updater' );
const log             = require( 'electron-log' );

const { BrowserWindow, app } = require( 'electron' );
const { SerialPort }         = require( 'serialport' );
const { ReadlineParser }     = require( '@serialport/parser-readline' );
const path                   = require( 'path' );
const url                    = require( 'url' );
const regex                  = /(ST|US),GS,\s+([0-9.]+)(lb|kb)/g;
const currentEnvironment     = process.env.NODE_ENV;
const isOnline               = require( 'is-online' );

autoUpdater.logger                       = log;
autoUpdater.logger.transports.file.level = 'info';
log.info( 'App starting...' );

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, units, status, port, currentWeight, prevWeight, countdown;

let windowOptions = {
  center: true,
  minWidth: 1000,
  minHeight: 768,
  width: 1366,
  height: 768,
};

let stableTimer = process.env.stableTimer | 1000;

function readLine( line ){
  // log.info( 'Line ' + line );
  
  let parsedLine = '0.000';
  let stableString;
  
  while((m = regex.exec( line )) !== null) {
	// This is necessary to avoid infinite loops with zero-width matches
	if(m.index === regex.lastIndex) {
	  regex.lastIndex++;
	}
	units        = m[ 3 ];
	parsedLine   = m[ 2 ];
	stableString = m[ 1 ];
  }
  
  // if(stableString !== undefined) {
  // status = stableString;
  // }
  // log.info( "Status ", status );
  
  return parsedLine;
}

function closeWindow( closeMessage = 'you did something wrong.' ){
  mainWindow.close();
  log.info( 'Window closed because ' + closeMessage );
}

// Check that the PC has internet once the window is open every couple seconds
setInterval( () => isOnline().then( online => {
	  if(online !== true) {
		closeWindow( 'you have lost internet.' );
	  }
	} ), 1000
);

let stableCountdown = setInterval( () => {
	  if(currentWeight && currentWeight !== "0.000") {
		// Weight is still the same so deduct countdown timer to check for stable
		if(currentWeight === prevWeight) {
		  if(countdown <= 0) {
			// Stable
			if(status !== 'ST')
			{
			  status = 'ST';
			  log.info( 'STABLE');
			}
		  }
		  else {
		 
			countdown = countdown - 25;
			log.info( countdown );
		  }
		}
		else {
		  log.info( "Current Weight: ", currentWeight );
		  countdown = stableTimer;
		  prevWeight  = currentWeight;
		  status = 'US';
		}
	  }
	}, 10
);


/** Serial Port Stuff **/
async function initSerialPort(){
  log.info( "Init" );
  status = 'US';
  
  await SerialPort.list().then( ( ports, err ) => {
	if(err) {
	  log.error( err.message );
	  return;
	}
	if(ports.length === 0) {
	  log.info( 'NO PORTS' )
	}
	
	const scalePort = ports.find( function( port ){
	  return port[ 'manufacturer' ] === 'Prolific';
	} )
	
	if(!scalePort) {
	  log.error( "Couldn't find scale port" );
	  return;
	}
	
	log.info( 'Found ' + scalePort.path );
	
	port = new SerialPort( { path: scalePort.path, baudRate: 19200 } );
	
	if(port.isOpen) {
	  log.info( 'port is open.' );
	}
	
	port.on( 'open', function(){
	  parser = port.pipe( new ReadlineParser() );
	  parser.on( 'data', function( data ){
		currentWeight = readLine( data );

		let code = `if(document.getElementById("weight") !== null){
                    document.getElementById("weight").value = "${currentWeight}";
                    document.getElementById("status").innerHTML = "${status}";
                    document.getElementById("units").innerHTML = "${units}";
                    };`;
		
		if(mainWindow.webContents.getURL().includes( 'tools/weighStation' )) {
		  mainWindow.webContents.executeJavaScript( code );
		}
	  } );
	} );
	
	port.on( 'close', function(){
	  log.info( 'Port has been closed.' );
	  closeWindow( 'Port has been closed.' );
	} );
	
	port.on( 'error', function( e ){
	  log.error( e );
	} );
  } );
}


/** BrowserWindow setup and such **/
function createWindow(){
  // Create the browser window.
  mainWindow = new BrowserWindow( windowOptions );
  
  // When in development environment, open the Redux DevTools Extension and the Chrome DevTools.
  // Need to have the Chrome Extension at the location below.
  // If on MAC and have Redux DevTools installed, then it should be at this location.
  if(currentEnvironment === 'DEV') {
	BrowserWindow.addDevToolsExtension( "../../Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.15.1_0/" );
	// Open the DevTools.
	mainWindow.webContents.openDevTools();
	mainWindow.loadURL( 'http://localhost:3000' );
  }
  else if(currentEnvironment === 'WINDEV') {
	// Open the DevTools.
	mainWindow.webContents.openDevTools();
	mainWindow.loadURL( 'http://localhost:3000' );
  }
  else {
	// and load the index.html of the app.
	mainWindow.loadURL( 'https://oms.fulfillment.com/' );
  }
  // Emitted when the window is closed.
  mainWindow.on( 'closed', function(){
	// Dereference the window object, usually you would store windows
	// in an array if your app supports multi windows, this is the time
	// when you should delete the corresponding element.
	mainWindow = null;
  } );
  mainWindow.webContents.on( 'did-finish-load', function(){
	initSerialPort();
  } );
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on( 'ready', function(){
  autoUpdater.checkForUpdatesAndNotify();
  createWindow();
} );

// Quit when all windows are closed.
app.on( 'window-all-closed', function(){
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  app.quit();
} );

app.on( 'activate', function(){
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if(mainWindow === null) {
	createWindow();
  }
} );

app.on( 'will-quit', function(){
  if(port.isOpen)
	port.close();
} );

app.on( 'quit', function(){
  if(port.isOpen)
	port.close();
} );
