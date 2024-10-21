/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

const { app, dialog, BrowserWindow, ipcMain, screen, Menu, shell } = require("electron")
app.commandLine.appendSwitch('ignore-certificate-errors') // Temporary work around for not being able to add additional certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0' // Temporary work around for not being able to add additional certificates
const path = require("path")
const url = require("url")
const fs = require("fs")
// const { handleLoadOciConfigProfiles } = require ("./electron/OcdApi")
// const { ConfigFileReader } = require ('oci-common')
const common = require ('oci-common')
const { OciQuery, OciReferenceDataQuery } = require('@ocd/query')
const { unescape } = require("querystring")

// Get Environment information
const isDev = process.env.OCD_DEV === 'true';
const isPreview = process.env.OCD_PREVIEW === 'true';
const isMac = process.platform === 'darwin'

// if (require('electron-squirrel-startup')) app.quit()
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

const saveDesktopState = (config) => {
	fs.writeFileSync(ocdWindowStateFilename, JSON.stringify(config, null, 4))
}

let mainWindow
let filePath
let ready = false

// Add Menu
const template = [
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
	  : []),
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
			])
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
]
  
const menu = Menu.buildFromTemplate(template)

// Context Menu

const selectionMenu = Menu.buildFromTemplate([
    {role: 'copy'},
    {type: 'separator'},
    {role: 'selectall'},
])

const inputMenu = Menu.buildFromTemplate([
{role: 'undo'},
{role: 'redo'},
{type: 'separator'},
{role: 'cut'},
{role: 'copy'},
{role: 'paste'},
{type: 'separator'},
{role: 'selectall'},
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
		process.env.WEB_URL ||
		url.format({
			pathname: path.join(__dirname, "../build/index.html"),
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
	Menu.setApplicationMenu(menu)
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
  
  
// app.on("ready", createWindow)

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

async function handleGetVersion() {
	console.debug('Electron Main: handleGetVersion')
	return new Promise((resolve, reject) => {
		const buildInformation = {
			version: app.getVersion()
		}
		resolve(buildInformation)
	})
}

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

async function handleLoadOciConfigProfile(event, profile) {
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
	const ociQuery = new OciReferenceDataQuery(profile, region)
	return ociQuery.query()
}

async function handleLoadDesign(event, filename) {
	console.debug('Electron Main: handleLoadDesign')
	return new Promise((resolve, reject) => {
		try {
			if (!filename || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
				dialog.showOpenDialog(mainWindow, {
					properties: ['openFile'],
					filters: [{name: 'Filetype', extensions: ['okit']}]
				  }).then(result => {
					const design = result.canceled ? {} : fs.readFileSync(result.filePaths[0], 'utf-8')
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

async function handleSaveDesign(event, design, filename, suggestedFilename='') {
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

async function handleDiscardConfirmation(event) {
	return new Promise((resolve, reject) => {
		const options = {
			type: 'question',
			message: 'All Changes Will Be Lost',
			details: 'OCD Design has been modified.',
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

async function handleExportTerraform(event, design, directory) {
	// design = typeof design === 'string' ? JSON.parse(design) : design
	console.debug('Electron Main: handleExportTerraform')
	// return new Promise((resolve, reject) => {reject('Currently Not Implemented')})
	return Promise.reject(new Error('Currently Not Implemented'))
}

async function handleLoadConsoleConfig(event) {
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

async function handleSaveConsoleConfig(event, config) {
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

async function handleLoadCache(event) {
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

async function handleSaveCache(event, cache) {
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

async function handleLoadCacheProfile(event, profile) {
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

async function handleOpenExternalUrl(event, href) {
	console.debug('Electron Main: handleOpenExternalUrl')
	return new Promise((resolve, reject) => {
		try {
			shell.openExternal(href)
			resolve()
		} catch (err) {
			reject(err)
		}
	})
}

// Library / Reference Architecture Functions
const prodLibraryUrl = 'https://raw.githubusercontent.com/oracle/oci-designer-toolkit/refs/heads/master/ocd/library'
const devLibraryUrl = 'https://raw.githubusercontent.com/oracle/oci-designer-toolkit/refs/heads/toxophilist/sprint-dev/ocd/library'
const libraryUrl = isDev || isPreview ? devLibraryUrl : prodLibraryUrl
const libraryFile = 'referenceArchitectures.json'

async function handleLoadLibraryIndex(event) {
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

function getLibrarySectionSvg(libraryIndex, section) {
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

async function handleLoadLibraryDesign(event, section, filename) {
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
