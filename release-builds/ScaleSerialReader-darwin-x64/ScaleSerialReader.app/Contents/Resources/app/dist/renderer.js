// // This file is required by the index.html file and will
// // be executed in the renderer process for that window.
// // All of the Node.js APIs are available in this process.
//
// const SerialPort = require('SerialPort');
// const createTable = require('data-table');
// let m;
// let port = new SerialPort('/dev/tty.usbserial', {
//   parser: SerialPort.parsers.readline('\n'),
//   baudrate: 19200
// });
//
// // Stream all data coming in from the serial port.
// port.on('data', function (data) {
//   document.getElementById('weight').textContent = data;
// });
//
// SerialPort.list((err, ports) => {
//   console.log('ports', ports);
//   if (err) {
//     document.getElementById('error').textContent = err.message;
//     return;
//   } else {
//     document.getElementById('error').textContent = '';
//   }
//
//   if (ports.length === 0) {
//     document.getElementById('error').textContent = 'No ports discovered';
//   }
//
//   const headers = Object.keys(ports[0]);
//   const table = createTable(headers);
//   tableHTML = '';
//   table.on('data', data => tableHTML += data);
//   table.on('end', () => document.getElementById('ports').innerHTML = tableHTML);
//   ports.forEach(port => table.write(port));
//   table.end();
// });
//
// let populateStorage = (dataLine) => {
//
// };

// USED ONLY FOR TESTING. ACTUAL RENDERER IS THE WEIGH STATION UI
"use strict";
//# sourceMappingURL=renderer.js.map