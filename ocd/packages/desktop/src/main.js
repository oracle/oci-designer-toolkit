/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const url = require("url")
// const { handleLoadOciConfigProfiles } = require ("./electron/OcdApi")
// const { ConfigFileReader } = require ('oci-common')
const common = require ('oci-common')
const { OciQuery } = require('@ocd/query')

// if (require('electron-squirrel-startup')) app.quit()

const createWindow = () => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 1600,
		height: 1200,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: true,
			preload: path.join(__dirname, 'preload.js')
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

app.whenReady().then(() => {
	ipcMain.handle('ociConfig:loadProfiles', handleLoadOciConfigProfiles)
	ipcMain.handle('ociQuery:listRegions', handleListRegions)
	ipcMain.handle('ociQuery:listTenancyCompartments', handleListTenancyCompartments)
	ipcMain.handle('ociQuery:queryTenancy', handleQueryTenancy)
	ipcMain.handle('ociQuery:queryDropdown', handleQueryDropdown)
	ipcMain.handle('ociExport:exportTerraform', handleExportTerraform)
	createWindow()
	app.on('activate', function () {
	  if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
  })
  
  
// app.on("ready", createWindow)

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit()
	}
})

// app.on("activate", () => {
// 	// On OS X it's common to re-create a window in the app when the
// 	// dock icon is clicked and there are no other windows open.
// 	if (BrowserWindow.getAllWindows().length === 0) {
// 		createWindow()
// 	}
// })

// TODO: Remove Temp solution to work around permission issues with FileSystemFileHandle.createWritable() in Menu.ts Save As
app.commandLine.appendSwitch("enable-experimental-web-platform-features")
console.debug(app.getPath('home'))
console.debug(app.getPath('userData'))

/*
** Electron IPC Handlers required for the OCD Desktop.
*/

async function handleLoadOciConfigProfiles() {
	console.debug('Electron Main: handleLoadOciConfigProfiles')
	return new Promise((resolve, reject) => {
		const parsed = common.ConfigFileReader.parseDefault(null)
		// console.debug('Electron Main: handleLoadOciConfigProfiles', parsed)
		// console.debug('Electron Main: handleLoadOciConfigProfiles', parsed.accumulator.configurationsByProfile)
		// console.debug('Electron Main: handleLoadOciConfigProfiles', Array.from(parsed.accumulator.configurationsByProfile.keys()))
        const profiles = Array.from(parsed.accumulator.configurationsByProfile.keys())
		resolve(profiles)
	})
}

async function handleListRegions(event, profile) {
	console.debug('Electron Main: handleListRegions')
	const ociQuery = new OciQuery(profile)
	return ociQuery.listRegions()
}

async function handleListTenancyCompartments(event, profile) {
	console.debug('Electron Main: handleListTenancyCompartments')
	const ociQuery = new OciQuery(profile)
	return ociQuery.listTenancyCompartments()
}

async function handleQueryTenancy(event, profile, compartmentIds, region) {
	console.debug('Electron Main: handleQueryTenancy')
	const ociQuery = new OciQuery(profile, region)
	return ociQuery.queryTenancy(compartmentIds)
}

async function handleQueryDropdown(event, profile, region) {
	console.debug('Electron Main: handleQueryDropdown')
	const ociQuery = new OciQuery(profile, region)
	return new Promise((resolve, reject) => {reject('Currently Not Implemented')})
}

async function handleExportTerraform(event, design, directory) {
	console.debug('Electron Main: handleExportTerraform')
	return new Promise((resolve, reject) => {reject('Currently Not Implemented')})
}
