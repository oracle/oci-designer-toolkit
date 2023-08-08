const path = require('path')
const {app, BrowserWindow} = require('electron')      
function createWindow () {   
    // Create the browser window.     
    let win = new BrowserWindow({width: 1600, height: 1200}) 
    win.loadURL(`file://${path.join(__dirname, '../build/index.html')}`)
    // win.webContents.openDevTools()
}      
app.on('ready', createWindow)
// TODO: Remove Temp solution to work around permission issues with FileSystemFileHandle.createWritable() in Menu.ts Save As
app.commandLine.appendSwitch("enable-experimental-web-platform-features")
console.debug(app.getPath('home'))
console.debug(app.getPath('userData'))