const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller;
const path                   = require('path');

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.log("error");
    console.error(error.message || error);
    process.exit(1);
  });

function getInstallerConfig() {
  console.log('creating windows installer');
  const rootPath = path.join('./');
  const outPath  = path.join(rootPath, 'release-builds');

  return Promise.resolve({
    appDirectory   : path.join(outPath, 'ScaleSerialReader-win32-ia32/'),
    authors        : 'Steven Hawley',
    noMsi          : true,
    outputDirectory: path.join(outPath, 'windows-installer'),
    exe            : 'ScaleSerialReader.exe',
    setupExe       : 'ScaleSerialReaderInstaller.exe',
    setupIcon      : path.join(rootPath, 'assets', 'icons', 'windows', 'scale.ico')
  })
}