'use strict';

var createWindowsInstaller = require('electron-winstaller').createWindowsInstaller;
var path = require('path');

getInstallerConfig().then(createWindowsInstaller).catch(function (error) {
  console.error(error.message || error);
  process.exit(1);
});

function getInstallerConfig() {
  console.log('creating windows installer');
  var rootPath = path.join('./');
  var outPath = path.join(rootPath, 'release-builds');

  return Promise.resolve({
    appDirectory: path.join(outPath, ' app-win32-ia32/'),
    authors: 'Steven Hawley',
    noMsi: true,
    outputDirectory: path.join(outPath, 'windows-installer'),
    exe: 'Electron tutorial app.exe',
    setupExe: 'ElectronTutorialAppInstaller.exe',
    setupIcon: path.join(rootPath, 'assets', 'icons', 'win', 'icon.ico')
  });
}
//# sourceMappingURL=createInstaller.js.map