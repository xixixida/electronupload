// Modules to control application life and create native browser window
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain 
} = require('electron')
const path = require('path')
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');
let version = autoUpdater.currentVersion
autoUpdater.channel = `http://127.0.0.1:7001/makecode/version?id=${version}`

let template = []
if (process.platform === 'darwin') {
  // OS X
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit(); }
      },
    ]
  })
}
let mainWindow
let htermWindow
function sendStatusToWindow(text) {
  log.info(text);
  mainWindow.webContents.send('message', text);
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});


// app.commandLine.appendSwitch('remote-debugging-port', '8315')
// app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1')
function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 786,
        maximizable: true,
        minHeight:786,
        mixWidth:1024,
        icon: path.join(__dirname, './resources/apple-touch-icon.png')
    })
    //Menu.setApplicationMenu(null)
    // and load the index.html of the app.
    mainWindow.loadFile('index.html')
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        if(htermWindow){
            htermWindow.destroy()
        }
        mainWindow = null
    })
    
}

function openHterm () {
    if(htermWindow){
        htermWindow.show()
    }else {
        htermWindow = new BrowserWindow({
        width: 1024,
        height: 786,
        maximizable: true,
        mixHeight:786,
        mixWidth:1024,
        icon: path.join(__dirname, './resources/apple-touch-icon.png')
    })
     htermWindow.loadFile('hterm/index.html')
     htermWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        htermWindow = null
        
    })
    }
    
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
app.on('ready',async function(){
    let n = await autoUpdater.checkForUpdatesAndNotify()
    console.log(n)
})
// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

ipcMain.on('openHterm-message', function(event, arg) {
    openHterm()
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
