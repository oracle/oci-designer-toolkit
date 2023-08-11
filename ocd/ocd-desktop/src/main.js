const { app, BrowserWindow } = require("electron")
const path = require("path")
const url = require("url")

// if (require('electron-squirrel-startup')) app.quit()

const createWindow = () => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	})

	// and load the index.html of the app.
	const startUrl =
		process.env.WEB_URL ||
		url.format({
			pathname: path.join(__dirname, "../build/index.html"),
			protocol: "file",
			slashes: true,
		})
	mainWindow.loadURL(startUrl)

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()
}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit()
	}
})

app.on("activate", () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

// TODO: Remove Temp solution to work around permission issues with FileSystemFileHandle.createWritable() in Menu.ts Save As
app.commandLine.appendSwitch("enable-experimental-web-platform-features")
console.debug(app.getPath('home'))
console.debug(app.getPath('userData'))