/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { app, dialog, BrowserWindow, ipcMain, screen, Menu, shell, MessageBoxOptions, MenuItemConstructorOptions } from 'electron'
import Squirrel from 'electron-squirrel-startup'
import path from 'path'
import url from 'url'
import fs from 'fs'
import common from 'oci-common'
import { OciQuery, OciReferenceDataQuery } from '@ocd/query'
import { OcdDesign } from '@ocd/model'
import { OcdCache, OcdConsoleConfiguration } from '@ocd/react'
// import { unescape } from 'querystring'

app.commandLine.appendSwitch('ignore-certificate-errors') // Temporary work around for not being able to add additional certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0' // Temporary work around for not being able to add additional certificates

// Get Environment information
const isDev = process.env.OCD_DEV === 'true';
const isPreview = process.env.OCD_PREVIEW === 'true';
const isMac = process.platform === 'darwin'

// if (require('electron-squirrel-startup')) app.quit()
if (Squirrel) app.quit()
const ocdConfigDirectory = path.join(app.getPath('home'), '.ocd')
const ocdConsoleConfigFilename = path.join(ocdConfigDirectory, 'console_config.json')
const ocdCacheFilename = path.join(ocdConfigDirectory, 'cache.json')
const ocdWindowStateFilename = path.join(ocdConfigDirectory, 'desktop.json')
if (!fs.existsSync(ocdConfigDirectory)) fs.mkdirSync(ocdConfigDirectory)

const loadDesktopState = () => {
  const size = screen.getPrimaryDisplay().workAreaSize
  const initialState = {
    x: undefined,
    y: undefined,
    width: Math.round(size.width / 2),
    height: Math.round((size.height / 3) * 2),
    isMaximised: false,
    isFullScreen: false
  }
  if (!fs.existsSync(ocdWindowStateFilename)) fs.writeFileSync(ocdWindowStateFilename, JSON.stringify(initialState, null, 4))
  const config = fs.readFileSync(ocdWindowStateFilename, 'utf-8')
  return {...initialState, ...JSON.parse(config)} 
}

const saveDesktopState = (config: Record<string, any>) => {
  fs.writeFileSync(ocdWindowStateFilename, JSON.stringify(config, null, 4))
}

let mainWindow: BrowserWindow
let filePath: string | null
let ready = false


// Configure Menus

// Main Menu
export const mainMenu = Menu.buildFromTemplate([
	// { role: 'appMenu' }
	...(isMac
	  ? [{
		  label: app.name,
		  submenu: [
			{ role: 'about' },
			{ type: 'separator' },
			{ role: 'services' },
			{ type: 'separator' },
			{ role: 'hide' },
			{ role: 'hideOthers' },
			{ role: 'unhide' },
			{ type: 'separator' },
			{ role: 'quit' }
		  ]
		}]
	  : []) as MenuItemConstructorOptions[],
	// { role: 'fileMenu' }
	{
	  label: 'File',
	  submenu: [
		  isMac ? { role: 'close' } : { role: 'quit' }
	  ]
	},
	// { role: 'editMenu' }
	// {
	//   label: 'Edit',
	//   submenu: [
	// 	{ role: 'undo' },
	// 	{ role: 'redo' },
	// 	{ type: 'separator' },
	// 	{ role: 'cut' },
	// 	{ role: 'copy' },
	// 	{ role: 'paste' },
	// 	...(isMac
	// 	  ? [
	// 		  { role: 'pasteAndMatchStyle' },
	// 		  { role: 'delete' },
	// 		  { role: 'selectAll' },
	// 		  { type: 'separator' },
	// 		  {
	// 			label: 'Speech',
	// 			submenu: [
	// 			  { role: 'startSpeaking' },
	// 			  { role: 'stopSpeaking' }
	// 			]
	// 		  }
	// 		]
	// 	  : [
	// 		  { role: 'delete' },
	// 		  { type: 'separator' },
	// 		  { role: 'selectAll' }
	// 		])
	//   ]
	// },
	// { role: 'viewMenu' }
	{
	  label: 'View',
	  submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
	  ]
	},
	// { role: 'windowMenu' }
	{
	  label: 'Window',
	  submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ]
        : [
          { role: 'close' }
        ]) as MenuItemConstructorOptions[]
	  ]
	},
	// {
	//   role: 'help',
	//   submenu: [
	// 	{
	// 	  label: 'Learn More',
	// 	  click: async () => {
	// 		const { shell } = require('electron')
	// 		await shell.openExternal('https://github.com/oracle/oci-designer-toolkit/tree/master/ocd')
	// 	  }
	// 	}
	//   ]
	// }
])

// Context Menu

export const selectionMenu = Menu.buildFromTemplate([
    {role: 'copy'},
    {type: 'separator'},
    {role: 'selectAll'},
])

export const inputMenu = Menu.buildFromTemplate([
    {role: 'undo'},
    {role: 'redo'},
    {type: 'separator'},
    {role: 'cut'},
    {role: 'copy'},
    {role: 'paste'},
    {type: 'separator'},
    {role: 'selectAll'},
])






// Create OCD Window
const createWindow = () => {
	let desktopState = loadDesktopState()
	// Create the browser window.
	mainWindow = new BrowserWindow({
		x: desktopState.x,
		y: desktopState.y,
		width: desktopState.width,
		height: desktopState.height,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: true,
			preload: path.join(__dirname, 'preload.js')
		},
	})

	const saveState = () => {
		desktopState.isMaximised = mainWindow.isMaximized()
		desktopState.isFullScreen = mainWindow.isFullScreen()
		const bounds = mainWindow.getBounds()
		if (!mainWindow.isMaximized() && !mainWindow.isFullScreen()) desktopState = {...desktopState, ...bounds}
		saveDesktopState(desktopState)
	}

	// mainWindow.on('move', (e) => console.debug('Move Event'))
	mainWindow.on('moved', (e) => saveState())
	// mainWindow.on('resize', (e) => console.debug('Resize Event'))
	mainWindow.on('enter-full-screen', (e) => saveState())
	mainWindow.on('leave-full-screen', (e) => saveState())
	mainWindow.on('resized', (e) => saveState())
	mainWindow.on('close', (e) => saveState())

	// Remove Menu
	// mainWindow.removeMenu()
	// mainWindow.setMenu(null)
	// and load the index.html of the app.
	const startUrl =
		process.env.WEB_URL || MAIN_WINDOW_VITE_DEV_SERVER_URL ||
		url.format({
			pathname: path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
			protocol: "file",
			slashes: true,
		})
  	mainWindow.loadURL(startUrl)
  
    if (desktopState.isMaximised) mainWindow.maximize()
    mainWindow.setFullScreen(desktopState.isFullScreen)

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
	// Build Information
	ipcMain.handle('ocdBuild:getVersion', handleGetVersion)
	// OCI API Calls / Query
	ipcMain.handle('ociConfig:loadProfileNames', handleLoadOciConfigProfileNames)
	ipcMain.handle('ociConfig:loadProfile', handleLoadOciConfigProfile)
	ipcMain.handle('ociQuery:listRegions', handleListRegions)
	ipcMain.handle('ociQuery:listTenancyCompartments', handleListTenancyCompartments)
	ipcMain.handle('ociQuery:queryTenancy', handleQueryTenancy)
	ipcMain.handle('ociQuery:queryDropdown', handleQueryDropdown)
	// OCD Design 
	ipcMain.handle('ocdDesign:loadDesign', handleLoadDesign)
	ipcMain.handle('ocdDesign:saveDesign', handleSaveDesign)
	ipcMain.handle('ocdDesign:discardConfirmation', handleDiscardConfirmation)
	ipcMain.handle('ocdDesign:exportTerraform', handleExportTerraform)
	ipcMain.handle('ocdDesign:loadLibraryIndex', handleLoadLibraryIndex)
	ipcMain.handle('ocdDesign:loadLibraryDesign', handleLoadLibraryDesign)
	ipcMain.handle('ocdDesign:loadSvgCssFiles', handleLoadSvgCssFiles)
	// OCD Configuration
	ipcMain.handle('ocdConfig:loadConsoleConfig', handleLoadConsoleConfig)
	ipcMain.handle('ocdConfig:saveConsoleConfig', handleSaveConsoleConfig)
	// OCD Cache
	ipcMain.handle('ocdCache:loadCache', handleLoadCache)
	ipcMain.handle('ocdCache:saveCache', handleSaveCache)
	// External URLs
	ipcMain.handle('ocdExternal:openExternalUrl', handleOpenExternalUrl)
	createWindow()
	app.on('activate', function () {
	  if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
    mainWindow.webContents.on('did-finish-load', function() {
        if (filePath) {
            mainWindow.webContents.send('open-file', filePath)
            filePath = null
        }
    });
	Menu.setApplicationMenu(mainMenu)
	// Context Menu
	mainWindow.webContents.on('context-menu', (e, props) => {
		const { selectionText, isEditable } = props;
		if (isEditable) {
		  inputMenu.popup(mainWindow);
		} else if (selectionText && selectionText.trim() !== '') {
		  selectionMenu.popup(mainWindow);
		}
	  })
	
	ready = true
})
  
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit()
	}
})

app.on("open-file", function(event, path) {
    event.preventDefault()
    filePath = path

    if (ready) {
        mainWindow.webContents.send('open-file', filePath)
        filePath = null
    }
})




/*
** Electron IPC Handlers required for the OCD Desktop.
*/

// Build Information
async function handleGetVersion() {
	console.debug('Electron Main: handleGetVersion')
	return new Promise((resolve, reject) => {
		const buildInformation = {
			version: app.getVersion()
		}
		resolve(buildInformation)
	})
}


// OCI API Calls / Query
async function handleLoadOciConfigProfileNames() {
	console.debug('Electron Main: handleLoadOciConfigProfileNames')
	return new Promise((resolve, reject) => {
		const parsed = common.ConfigFileReader.parseDefault(null)
		console.debug('Electron Main: handleLoadOciConfigProfileNames', parsed)
		console.debug('Electron Main: handleLoadOciConfigProfileNames', parsed.accumulator.configurationsByProfile)
		console.debug('Electron Main: handleLoadOciConfigProfileNames', Array.from(parsed.accumulator.configurationsByProfile.keys()))
        const profiles = Array.from(parsed.accumulator.configurationsByProfile.keys())
		resolve(profiles)
	})
}

async function handleLoadOciConfigProfile(event: any, profile: string) {
	console.debug('Electron Main: handleLoadOciConfigProfile')
	return new Promise((resolve, reject) => {
		const parsed = common.ConfigFileReader.parseDefault(null)
		console.debug('Electron Main: handleLoadOciConfigProfileNames Parsed:', parsed)
		console.debug('Electron Main: handleLoadOciConfigProfileNames Config By Profile:', parsed.accumulator.configurationsByProfile)
		console.debug('Electron Main: handleLoadOciConfigProfileNames Keys:', Array.from(parsed.accumulator.configurationsByProfile.keys()))
        const profileData = Array.from(parsed.accumulator.configurationsByProfile[profile])
		resolve(profileData)
	})
}

async function handleListRegions(event: any, profile: string) {
	console.debug('Electron Main: handleListRegions')
	const ociQuery = new OciQuery(profile)
	return ociQuery.listRegions()
}

async function handleListTenancyCompartments(event: any, profile: string) {
	console.debug('Electron Main: handleListTenancyCompartments')
	const ociQuery = new OciQuery(profile)
	return ociQuery.listTenancyCompartments()
}

async function handleQueryTenancy(event: any, profile: string, compartmentIds: string[], region: string) {
	console.debug('Electron Main: handleQueryTenancy')
	const ociQuery = new OciQuery(profile, region)
	return ociQuery.queryTenancy(compartmentIds)
}

async function handleQueryDropdown(event: any, profile: string, region: string) {
	console.debug('Electron Main: handleQueryDropdown')
	const ociQuery = new OciReferenceDataQuery(profile, region)
	return ociQuery.query()
}


// OCD Design
async function handleLoadDesign(event: any, filename: string) {
	console.debug('Electron Main: handleLoadDesign')
	return new Promise((resolve, reject) => {
		try {
			if (!filename || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
				dialog.showOpenDialog(mainWindow, {
					properties: ['openFile'],
					filters: [{name: 'Filetype', extensions: ['okit']}]
				  }).then(result => {
					const design = result.canceled ? '{}' : fs.readFileSync(result.filePaths[0], 'utf-8')
					resolve({canceled: result.canceled, filename: result.filePaths[0], design: JSON.parse(design)})
				}).catch(err => {
					console.error(err)
					reject(err)
				})
			} else {
				const design = fs.readFileSync(filename, 'utf-8')
				resolve({canceled: false, filename: filename, design: JSON.parse(design)})
			}
		} catch (err) {
			reject(err)
		}
	})
}

async function handleSaveDesign(event: any, design: OcdDesign, filename: string, suggestedFilename='') {
	design = typeof design === 'string' ? JSON.parse(design) : design
	console.debug('Electron Main: handleSaveDesign', filename, JSON.stringify(design, null, 2))
	return new Promise((resolve, reject) => {
		try {
			if (!filename || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
				dialog.showSaveDialog(mainWindow, {
					defaultPath: suggestedFilename,
					properties: ['openFile', 'createDirectory'],
					filters: [{name: 'Filetype', extensions: ['okit']}]
				  }).then(result => {
					if (!result.canceled) fs.writeFileSync(result.filePath, JSON.stringify(design, null, 4))
					resolve({canceled: false, filename: result.canceled ? '' : result.filePath, design: design})
				}).catch(err => {
					console.error(err)
					reject(err)
				})
			} else {
				fs.writeFileSync(filename, JSON.stringify(design, null, 4))
				resolve({canceled: false, filename: filename, design: design})
			}
		} catch (err) {
			reject(err)
		}
	})
}

async function handleDiscardConfirmation(event: any) {
	return new Promise((resolve, reject) => {
		const options: MessageBoxOptions = {
			type: 'question',
			message: 'All Changes Will Be Lost',
			detail: 'OCD Design has been modified.',
			buttons: ['Discard Changes', 'Cancel'],
			defaultId: 1
		}
		dialog.showMessageBox(mainWindow, options).then((result) => {
			console.debug('Discard Confirmation', result)
			const discardResponse = [true, false]
			resolve(discardResponse[result.response])
		})
	})
}

async function handleExportTerraform(event: any, design: OcdDesign, directory: string) {
	// design = typeof design === 'string' ? JSON.parse(design) : design
	console.debug('Electron Main: handleExportTerraform')
	// return new Promise((resolve, reject) => {reject('Currently Not Implemented')})
	return Promise.reject(new Error('Currently Not Implemented'))
}

// Library / Reference Architecture Functions
const prodLibraryUrl = 'https://raw.githubusercontent.com/oracle/oci-designer-toolkit/refs/heads/master/ocd/library'
const devLibraryUrl = 'https://raw.githubusercontent.com/oracle/oci-designer-toolkit/refs/heads/toxophilist/sprint-dev/ocd/library'
const libraryUrl = isDev || isPreview ? devLibraryUrl : prodLibraryUrl
const libraryFile = 'referenceArchitectures.json'

async function handleLoadLibraryIndex(event: any) {
	console.debug('Electron Main: handleLoadLibraryIndex')
	return new Promise((resolve, reject) => {
        // Build Library JSON File URL
        const libraryJsonUrl = `${libraryUrl}/${libraryFile}`
        const request = new Request(libraryJsonUrl)
        // console.debug('Electron Main: handleLoadLibraryIndex: URL', libraryJsonUrl, request)
        // Get Library File
        const libraryFetchPromise = fetch(request)
		libraryFetchPromise.then((response) => {
            // console.debug('Electron Main: handleLoadLibraryIndex: Fetch Response', response)
            // console.debug('Electron Main: handleLoadLibraryIndex: Fetch Response', response.headers.get("content-type"))
			return response.text()
		}).then((data) => {
            // console.debug('Electron Main: handleLoadLibraryIndex: Fetch Data', data)
			const libraryIndex = JSON.parse(data)
			// const sectionQueries = [getLibrarySectionSvg(libraryIndex, 'oci')]
			const sectionQueries = Object.keys(libraryIndex).map((k) => getLibrarySectionSvg(libraryIndex, k))
			Promise.allSettled(sectionQueries).then((results) => {
				// console.debug('Electron Main: handleLoadLibraryIndex: Section Query Results', results)
				resolve(libraryIndex)
			})
			// resolve(libraryIndex)
		}).catch((err) => {
            console.debug('Electron Main: handleLoadLibraryIndex: Fetch Error Response', err)
			reject(err)
		})
	})
}

function getLibrarySectionSvg(libraryIndex, section: string) {
	return new Promise((resolve, reject) => {
		const librarySection = libraryIndex[section]
		const svgRequests = librarySection.map((design) => new Request(`${libraryUrl}/${section}/${design.svgFile}`))
		const svgUrls = svgRequests.map((request) => fetch(request))
		Promise.allSettled(svgUrls).then((results) => Promise.allSettled(results.map((r) => r.value.text()))).then((svg) => {
			svg.forEach((r, i) => {
				console.debug('Electron Main: getLibrarySectionSvg: Svg Query Results', section, r.status)
				// console.debug('Electron Main: getLibrarySectionSvg: Svg Query Results', r.value)
				librarySection[i].dataUri = `data:image/svg+xml,${encodeURIComponent(r.value)}`
				// librarySection[i].dataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(r.value)))}`
			})
			resolve(librarySection)
		}).catch((err) => {
            console.debug('Electron Main: getLibrarySectionSvg: Fetch Error Response', err)
			reject(err)
		})
	})
}

async function handleLoadLibraryDesign(event: any, section: string, filename: string) {
	console.debug('Electron Main: handleLoadLibraryDesign')
	return new Promise((resolve, reject) => {
        // Build Design JSON File URL
        const libraryJsonUrl = `${libraryUrl}/${section}/${filename}`
        const request = new Request(libraryJsonUrl)
        // console.debug('Electron Main: handleLoadLibraryDesign: URL', libraryJsonUrl, request)
        // Get Library File
        const libraryFetchPromise = fetch(request)
		libraryFetchPromise.then((response) => {
            // console.debug('Electron Main: handleLoadLibraryDesign: Fetch Response', response)
            // console.debug('Electron Main: handleLoadLibraryDesign: Fetch Response', response.headers.get("content-type"))
			return response.text()
		}).then((design) => {
            // console.debug('Electron Main: handleLoadLibraryDesign: Fetch Data', design)
			resolve({canceled: false, filename: filename, design: JSON.parse(design)})
		}).catch((err) => {
            console.debug('Electron Main: handleLoadLibraryIndex: Fetch Error Response', err)
			reject(err)
		})
	})
}

async function handleLoadSvgCssFiles() {
	return Promise.reject(new Error('Not Implemented'))
}


// OCD Configuration
async function handleLoadConsoleConfig(event: any) {
	console.debug('Electron Main: handleLoadConfig')
	return new Promise((resolve, reject) => {
		// const defaultConfig = {
        //     showPalette: true,
        //     showModelPalette: true,
        //     showProvidersPalette: ['oci'],
        //     verboseProviderPalette: false,
        //     displayPage: 'designer',
        //     detailedResource: true,
        //     showProperties: true,
        //     highlightCompartmentResources: false,
        //     recentDesigns: [],
        //     maxRecent: 10,
        // }
		try {
			// if (!fs.existsSync(ocdConsoleConfigFilename)) fs.writeFileSync(ocdConsoleConfigFilename, JSON.stringify(defaultConfig, null, 4))
			if (!fs.existsSync(ocdConsoleConfigFilename)) reject(new Error('Console Config does not exist'))
			const config = fs.readFileSync(ocdConsoleConfigFilename, 'utf-8')
			resolve(JSON.parse(config))
		} catch (err) {
			reject(err)
		}
	})
}

async function handleSaveConsoleConfig(event: any, config: OcdConsoleConfiguration) {
	console.debug('Electron Main: handleSaveConfig')
	return new Promise((resolve, reject) => {
		try {
			if (!config.showPreviousViewOnStart) config.displayPage = 'designer' // If we do not want to display previous page then default to designer.
			fs.writeFileSync(ocdConsoleConfigFilename, JSON.stringify(config, null, 4))
			resolve(config)
		} catch (err) {
			reject(err)
		}
	})
}


// OCD Cache
async function handleLoadCache(event: any) {
	console.debug('Electron Main: handleLoadCache')
	return new Promise((resolve, reject) => {
		try {
			// if (!fs.existsSync(ocdCacheFilename)) fs.writeFileSync(ocdCacheFilename, JSON.stringify(defaultCache, null, 4))
			if (!fs.existsSync(ocdCacheFilename)) reject('Cache does not exist')
			const config = fs.readFileSync(ocdCacheFilename, 'utf-8')
			resolve(JSON.parse(config))
		} catch (err) {
			reject(err)
		}
	})
}

async function handleSaveCache(event: any, cache: OcdCache) {
	console.debug('Electron Main: handleSaveCache')
	return new Promise((resolve, reject) => {
		try {
			fs.writeFileSync(ocdCacheFilename, JSON.stringify(cache, null, 4))
			resolve(cache)
		} catch (err) {
			reject(err)
		}
	})
}

async function handleLoadCacheProfile(event: any, profile: string) {
	console.debug('Electron Main: handleLoadCacheProfile')
	return new Promise((resolve, reject) => {
		try {
			// if (!fs.existsSync(ocdCacheFilename)) fs.writeFileSync(ocdCacheFilename, JSON.stringify(defaultCache, null, 4))
			if (!fs.existsSync(ocdCacheFilename)) reject('Cache does not exist')
			const config = fs.readFileSync(ocdCacheFilename, 'utf-8')
			resolve(JSON.parse(config))
		} catch (err) {
			reject(err)
		}
	})
}

// External URLs
async function handleOpenExternalUrl(event: any, href: string) {
	console.debug('Electron Main: handleOpenExternalUrl')
	return new Promise((resolve, reject) => {
		try {
			shell.openExternal(href)
			resolve('Opened')
		} catch (err) {
			reject(err)
		}
	})
}
















// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

// const createWindow = () => {
//   // Create the browser window.
//   const mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//     },
//   });

//   // and load the index.html of the app.
//   if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
//     mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
//   } else {
//     mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
//   }

//   // Open the DevTools.
//   // mainWindow.webContents.openDevTools();
// };

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
