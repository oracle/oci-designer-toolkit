const path = require('path')
const {app, BrowserWindow} = require('electron')      
function createWindow () {   
    // Create the browser window.     
    let win = new BrowserWindow({width: 1600, height: 1200}) 
    win.loadURL(`file://${path.join(__dirname, '../build/index.html')}`)
}      
app.on('ready', createWindow)