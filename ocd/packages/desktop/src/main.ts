/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { app, dialog, BrowserWindow, ipcMain, screen, Menu, shell, MessageBoxOptions, MenuItemConstructorOptions, crashReporter } from 'electron'
import Squirrel from 'electron-squirrel-startup'
import path from 'path'
import url from 'url'
import fs from 'fs'
import { fetchWithTimeout, OcdLogger, OcdUtils } from '@ocd/core'
import {
	cancelLandingZoneAddonUpdateJob,
	createJob,
	createStack,
	generateArchitecturePlanFromImageWithGenAi,
	generateArchitecturePlanWithGenAi,
	getLandingZoneAddonUpdateJob,
	getResourceManagerPlanReview,
	listLandingZoneAddonHealth,
	listRegions,
	listStacks,
	listTenancyCompartments,
	loadOciConfigProfile,
	loadOciConfigProfileNames,
	queryDiscoverySnapshot,
	queryDropdown,
	queryTenancy,
	startLandingZoneAddonUpdateJob,
	updateLandingZoneAddon,
	updateStack,
} from '@ocd/query'
import type { OciResourceManagerJobOptions } from '@ocd/query'
import { OcdDesign, OcdResource, OciModelResources } from '@ocd/model'
import { OcdCache, OcdConsoleConfiguration } from '@ocd/react'
import { OcdExcelExporter, OcdMarkdownExporter, OcdSVGExporter, OcdTerraformExporter } from '@ocd/export'
import { OcdTerraformImporter } from '@ocd/import'
import { handleGetOciPriceList } from './handlers/OciPriceListHandlers'

// Scoped structured logger (level via OCD_LOG_LEVEL, default 'info').
// CONTRACT: never log design JSON or OCID-bearing payloads (see OcdLogger).
const logger = OcdLogger.scope('main')

const toError = (reason: unknown): Error => reason instanceof Error ? reason : new Error(String(reason))

// Get Environment information
const isDev = process.env.OCD_DEV === 'true';
const isPreview = process.env.OCD_PREVIEW === 'true';
const isMac = process.platform === 'darwin'
const APP_DISPLAY_NAME = 'oci-designer-toolkit-next-gen'

if (Squirrel) app.quit()
app.setName(APP_DISPLAY_NAME)
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

const isAllowedNavigationUrl = (href: string): boolean => {
	try {
		const parsedUrl = new URL(href)
		return parsedUrl.protocol === 'file:' || parsedUrl.origin === 'http://localhost:5173'
	} catch (err) {
		return false
	}
}

const openExternalHttpUrl = async (href: string) => {
	const parsedUrl = new URL(href)
	if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error(`Unsupported external URL protocol: ${parsedUrl.protocol}`)
	return shell.openExternal(parsedUrl.toString())
}

const isSafeSilentSavePath = (filename: string): boolean => {
	if (!filename) return false
	const resolvedFilename = path.resolve(filename)
	// Canonicalize the safe directories so symlinked safe dirs resolve to their real targets.
	// Skip any safe dir that cannot be resolved (e.g. does not exist).
	const safeDirectories = ['home', 'documents', 'downloads'].reduce<string[]>((accumulator, name) => {
		try {
			accumulator.push(fs.realpathSync(path.resolve(app.getPath(name as 'home' | 'documents' | 'downloads'))))
		} catch {
			// Unresolvable safe directory: ignore it rather than treating an unresolved path as safe.
		}
		return accumulator
	}, [])
	// The target file usually does not exist yet (about to be written), so canonicalize its
	// parent directory and re-join the basename. This dereferences a symlinked parent dir,
	// preventing a symlink inside a safe dir from escaping the sandbox. If the parent cannot
	// be resolved (ENOENT), fall through to the save dialog instead of writing.
	let canonicalFilename: string
	try {
		const canonicalParent = fs.realpathSync(path.dirname(resolvedFilename))
		canonicalFilename = path.join(canonicalParent, path.basename(resolvedFilename))
	} catch {
		return false
	}
	return safeDirectories.some((directory) => canonicalFilename === directory || canonicalFilename.startsWith(`${directory}${path.sep}`))
}


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
		title: APP_DISPLAY_NAME,
		webPreferences: {
			nodeIntegration: false,
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

	// @ts-ignore
	mainWindow.on('moved', (e) => saveState())
	// @ts-ignore
	mainWindow.on('enter-full-screen', (e) => saveState())
	// @ts-ignore
	mainWindow.on('leave-full-screen', (e) => saveState())
	// @ts-ignore
	mainWindow.on('resized', (e) => saveState())
	mainWindow.on('close', (e) => saveState())
	mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
		if (!isAllowedNavigationUrl(navigationUrl)) event.preventDefault()
	})
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		openExternalHttpUrl(url).catch((err) => logger.error(err))
		return { action: 'deny' }
	})

	// Remove Menu
	// mainWindow.removeMenu()
	// mainWindow.setMenu(null)
	// and load the index.html of the app.
	const startUrl =
		process.env.WEB_URL ?? MAIN_WINDOW_VITE_DEV_SERVER_URL ??
		url.format({
			pathname: path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
			protocol: "file",
			slashes: true,
		})
  	mainWindow.loadURL(startUrl)

    if (desktopState.isMaximised) mainWindow.maximize()
    mainWindow.setFullScreen(desktopState.isFullScreen)

	// Open the DevTools.
	if (isDev) mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
	process.on('uncaughtException', (err) => logger.error('uncaughtException', err))
	process.on('unhandledRejection', (err) => logger.error('unhandledRejection', err))
	crashReporter.start({ uploadToServer: false })
	// Build Information
	ipcMain.handle('ocdBuild:getVersion', handleGetVersion)
	// OCI API Calls
	// Query
	ipcMain.handle('ociConfig:loadProfileNames', handleLoadOciConfigProfileNames)
	ipcMain.handle('ociConfig:loadProfile', handleLoadOciConfigProfile)
	ipcMain.handle('ociQuery:listRegions', handleListRegions)
	ipcMain.handle('ociQuery:listTenancyCompartments', handleListTenancyCompartments)
	ipcMain.handle('ociQuery:queryTenancy', handleQueryTenancy)
	ipcMain.handle('ociQuery:queryDropdown', handleQueryDropdown)
	ipcMain.handle('ociQuery:discoverySnapshot', handleQueryDiscoverySnapshot)
	ipcMain.handle('ociGenAi:architecturePlan', handleGenerateArchitecturePlanWithGenAi)
	ipcMain.handle('ociGenAi:architecturePlanFromImage', handleGenerateArchitecturePlanFromImageWithGenAi)
	ipcMain.handle('ociQuery:listStacks', handleListStacks)
	ipcMain.handle('OciResourceManager:createStack', handleCreateStack)
	ipcMain.handle('OciResourceManager:updateStack', handleUpdateStack)
	ipcMain.handle('OciResourceManager:createJob', handleCreateJob)
	ipcMain.handle('OciResourceManager:getPlanReview', handleGetResourceManagerPlanReview)
	ipcMain.handle('OciLzAddon:update', handleUpdateLandingZoneAddon)
	ipcMain.handle('OciLzAddon:startUpdateJob', handleStartLandingZoneAddonUpdateJob)
	ipcMain.handle('OciLzAddon:getUpdateJob', handleGetLandingZoneAddonUpdateJob)
	ipcMain.handle('OciLzAddon:cancelUpdateJob', handleCancelLandingZoneAddonUpdateJob)
	ipcMain.handle('OciLzAddon:health', handleListLandingZoneAddonHealth)
	// OCI Pricing (unauthenticated public list-pricing API)
	ipcMain.handle('ociPricing:getPriceList', handleGetOciPriceList)
	// OCD Design
	ipcMain.handle('ocdDesign:loadDesign', handleLoadDesign)
	ipcMain.handle('ocdDesign:saveDesign', handleSaveDesign)
	ipcMain.handle('ocdDesign:discardConfirmation', handleDiscardConfirmation)
	ipcMain.handle('ocdDesign:loadLibraryIndex', handleLoadLibraryIndex)
	ipcMain.handle('ocdDesign:loadLibraryDesign', handleLoadLibraryDesign)
	ipcMain.handle('ocdDesign:loadSvgCssFiles', handleLoadSvgCssFiles)
	ipcMain.handle('ocdDesign:exportTerraform', handleExportTerraform)
	ipcMain.handle('ocdDesign:exportToExcel', handleExportToExcel)
	ipcMain.handle('ocdDesign:exportToMarkdown', handleExportToMarkdown)
	ipcMain.handle('ocdDesign:exportToSvg', handleExportToSvg)
	ipcMain.handle('ocdDesign:exportToTerraform', handleExportToTerraform)
	ipcMain.handle('ocdDesign:importFromTerraform', importFromTerraform)
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
		  inputMenu.popup({window: mainWindow});
		} else if (selectionText && selectionText.trim() !== '') {
		  selectionMenu.popup({window: mainWindow});
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
	logger.debug('Electron Main: handleGetVersion')
	return new Promise((resolve, reject) => {
		const buildInformation = {
			version: app.getVersion()
		}
		resolve(buildInformation)
	})
}


// OCI API Calls
// Query
async function handleLoadOciConfigProfileNames() {
	logger.debug('Electron Main: handleLoadOciConfigProfileNames')
	return loadOciConfigProfileNames()
}

async function handleLoadOciConfigProfile(event: any, profile: string) {
	logger.debug('Electron Main: handleLoadOciConfigProfile')
	return loadOciConfigProfile(profile)
}

async function handleListRegions(event: any, profile: string) {
	logger.debug('Electron Main: handleListRegions')
	return listRegions(profile)
}

async function handleListTenancyCompartments(event: any, profile: string) {
	logger.debug('Electron Main: handleListTenancyCompartments')
	return listTenancyCompartments(profile)
}

async function handleQueryTenancy(event: any, profile: string, compartmentIds: string[], region: string) {
	logger.debug('Electron Main: handleQueryTenancy')
	return queryTenancy({ profile, region, compartmentIds })
}

async function handleQueryDropdown(event: any, profile: string, region: string) {
	logger.debug('Electron Main: handleQueryDropdown')
	return queryDropdown({ profile, region })
}

async function handleQueryDiscoverySnapshot(event: any, profile: string, region: string, compartmentIds: string[] = []) {
	logger.debug('Electron Main: handleQueryDiscoverySnapshot')
	return queryDiscoverySnapshot({ profile, region, compartmentIds })
}

async function handleGenerateArchitecturePlanWithGenAi(
	event: any,
	profile: string,
	region: string,
	compartmentId: string,
	modelId: string,
	prompt: string,
	temperature?: number,
	maxTokens?: number,
) {
	logger.debug('Electron Main: handleGenerateArchitecturePlanWithGenAi')
	return generateArchitecturePlanWithGenAi({ profile, region, compartmentId, modelId, prompt, temperature, maxTokens })
}

async function handleGenerateArchitecturePlanFromImageWithGenAi(
	event: any,
	profile: string,
	region: string,
	compartmentId: string,
	modelId: string,
	prompt: string,
	imageDataUri: string,
	temperature?: number,
	maxTokens?: number,
) {
	logger.debug('Electron Main: handleGenerateArchitecturePlanFromImageWithGenAi')
	return generateArchitecturePlanFromImageWithGenAi({ profile, region, compartmentId, modelId, prompt, imageDataUri, temperature, maxTokens })
}

async function handleListStacks(event: any, profile: string, region: string, compartmentId: string) {
	logger.debug('Electron Main: handleListStacks')
	return listStacks(profile, region, compartmentId)
}
// Resource Manager
async function handleUpdateStack(event: any, profile: string, region: string, stackId: string, data: any, jobOptions: OciResourceManagerJobOptions) {
	logger.debug('Electron Main: handleUpdateStack')
	return updateStack({ profile, region, stackId, data, jobOptions })
}

async function handleCreateStack(event: any, profile: string, region: string, compartmentId: string, stackName: string, data: any, jobOptions: OciResourceManagerJobOptions) {
	logger.debug('Electron Main: handleCreateStack')
	return createStack({ profile, region, compartmentId, stackName, data, jobOptions })
}

async function handleCreateJob(event: any, profile: string, region: string, stackId: string, jobOptions: OciResourceManagerJobOptions) {
	logger.debug('Electron Main: handleCreateJob')
	return createJob({ profile, region, stackId, jobOptions })
}

async function handleGetResourceManagerPlanReview(event: any, profile: string, region: string, jobId: string) {
	logger.debug('Electron Main: handleGetResourceManagerPlanReview')
	return getResourceManagerPlanReview({ profile, region, jobId })
}

async function handleUpdateLandingZoneAddon(event: any, sourceKey: string, githubToken?: string) {
	logger.debug('Electron Main: handleUpdateLandingZoneAddon', { sourceKey })
	return updateLandingZoneAddon(sourceKey, { githubToken })
}

async function handleStartLandingZoneAddonUpdateJob(event: any, sourceKey: string, githubToken?: string) {
	logger.debug('Electron Main: handleStartLandingZoneAddonUpdateJob', { sourceKey })
	return startLandingZoneAddonUpdateJob(sourceKey, { githubToken })
}

async function handleGetLandingZoneAddonUpdateJob(event: any, jobId: string) {
	logger.debug('Electron Main: handleGetLandingZoneAddonUpdateJob', { jobId })
	return getLandingZoneAddonUpdateJob(jobId)
}

async function handleCancelLandingZoneAddonUpdateJob(event: any, jobId: string) {
	logger.debug('Electron Main: handleCancelLandingZoneAddonUpdateJob', { jobId })
	return cancelLandingZoneAddonUpdateJob(jobId)
}

async function handleListLandingZoneAddonHealth(event: any) {
	logger.debug('Electron Main: handleListLandingZoneAddonHealth')
	return listLandingZoneAddonHealth()
}


// OCD Design
async function handleLoadDesign(event: any, filename: string) {
	logger.debug('Electron Main: handleLoadDesign')
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
					logger.error(err)
					reject(toError(err))
				})
			} else {
				const design = fs.readFileSync(filename, 'utf-8')
				resolve({canceled: false, filename: filename, design: JSON.parse(design)})
			}
		} catch (err) {
			reject(toError(err))
		}
	})
}

async function handleSaveDesign(event: any, design: OcdDesign | string, filename: string, suggestedFilename='') {
	design = typeof design === 'string' ? JSON.parse(design) : design
	const resourceCount = Object.values((design as OcdDesign).model?.oci?.resources ?? {}).reduce((total: number, resources: unknown) => total + (Array.isArray(resources) ? resources.length : 0), 0)
	logger.debug('Electron Main: handleSaveDesign', filename, 'resources', resourceCount)
	return new Promise((resolve, reject) => {
		try {
			if (!filename || !fs.existsSync(filename) || !fs.statSync(filename).isFile() || !isSafeSilentSavePath(filename)) {
				dialog.showSaveDialog(mainWindow, {
					defaultPath: suggestedFilename,
					properties: ['createDirectory'],
					filters: [{name: 'Filetype', extensions: ['okit']}]
				}).then(result => {
					const filePath = path.extname(result.filePath) === '.okit' ? result.filePath : `${result.filePath}.okit`
					if (!result.canceled) fs.writeFileSync(filePath, JSON.stringify(design, null, 4))
					resolve({canceled: false, filename: result.canceled ? '' : filePath, design: design})
				}).catch(err => {
					logger.error(err)
					reject(toError(err))
				})
			} else {
				fs.writeFileSync(filename, JSON.stringify(design, null, 4))
				resolve({canceled: false, filename: filename, design: design})
			}
		} catch (err) {
			reject(toError(err))
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
			logger.debug('Discard Confirmation', result)
			const discardResponse = [true, false]
			resolve(discardResponse[result.response])
		})
	})
}

async function handleExportTerraform(event: any, design: OcdDesign, directory: string) {
	logger.debug('Electron Main: handleExportTerraform')
	return Promise.reject(new Error('Currently Not Implemented'))
}

const compartmentName = (id: string, compartments: OciModelResources.OciCompartment[]): string | undefined => compartments.find((c) => c.id === id)?.displayName
const updateResources = (resources: OcdResource[], compartments: OciModelResources.OciCompartment[]): OcdResource[] => resources.map((r: OcdResource) => {return {...r, compartmentName: compartmentName(r.compartmentId, compartments)}})
// @ts-ignore
const toTableRows = (resources: OcdResource[]): any[][] => resources.reduce((a, c) => {return [...a, [c.displayName, c.compartmentName]]}, [])
async function handleExportToExcel(event: any, design: OcdDesign, suggestedFilename='') {
	logger.debug('Electron Main: handleExportToExcel')
	return new Promise((resolve, reject) => {
			dialog.showSaveDialog(mainWindow, {
				defaultPath: suggestedFilename,
				properties: ['createDirectory'],
				filters: [{name: 'Filetype', extensions: ['xlsx']}],
				buttonLabel: 'Export'
			}).then(result => {
				if (!result.canceled) {
					const exporter = new OcdExcelExporter()
					const workbook = exporter.export(design)
					workbook.xlsx.writeFile(result.filePath).then(() => {
						logger.info('Workbook saved successfully!')
						resolve({canceled: false, filename: result.filePath, design: design})
					}).catch((error) => {
						logger.error('Error saving workbook:', error)
						reject(toError(error))
					})
				} else {
					resolve({canceled: false, filename: '', design: design})
				}
			}).catch(err => {
				logger.error(err)
				reject(toError(err))
			})
	})
}

async function handleExportToMarkdown(event: any, design: OcdDesign, css: string[]=[], suggestedFilename='') {
	logger.debug('Electron Main: handleExportToMarkdown')
	return new Promise((resolve, reject) => {
		dialog.showSaveDialog(mainWindow, {
			defaultPath: suggestedFilename,
			properties: ['createDirectory'],
			filters: [{name: 'Filetype', extensions: ['md']}],
			buttonLabel: 'Export'
		}).then(result => {
			if (!result.canceled) {
				const exporter = new OcdMarkdownExporter(css)
				const output = exporter.export(design)
				fs.writeFileSync(result.filePath, output)
			}
			resolve({canceled: false, filename: result.canceled ? '' : result.filePath, design: design})
		}).catch(err => {
			logger.error(err)
			reject(toError(err))
		})
	})
}

async function handleExportToSvg(event: any, design: OcdDesign, css: string[] = [], directory: string = '', suggestedFilename = '') {
	logger.debug('Electron Main: exportToSvg')
	if (design.view.pages.length > 1) {
		const additionalFilename: string = suggestedFilename && suggestedFilename.length > 0 ? suggestedFilename : design.metadata.title.replaceAll(' ', '_')
		return new Promise((resolve, reject) => {
			dialog.showOpenDialog(mainWindow, {
				properties: ['openDirectory', 'createDirectory'],
				defaultPath: directory,
				buttonLabel: 'Export'
			}).then(result => {
				if (!result.canceled) {
					const exporter = new OcdSVGExporter(css)
					const output = exporter.export(design)
					logger.debug('handleExportToSvg: ', result.filePaths)
					const directory = result.filePaths[0]
					Object.entries(output).forEach(([k, v]) => fs.writeFileSync(path.join(directory, `${k.replaceAll(' ', '_')}.svg`), v))
				}
				resolve({canceled: false, filename: result.canceled ? '' : result.filePaths[0], design: design})
			}).catch(err => {
				logger.error(err)
				reject(toError(err))
			})
		})
	} else {
		return new Promise((resolve, reject) => {
			dialog.showSaveDialog(mainWindow, {
				defaultPath: suggestedFilename,
				properties: ['createDirectory'],
				filters: [{name: 'Filetype', extensions: ['svg']}],
				buttonLabel: 'Export'
			}).then(result => {
				if (!result.canceled) {
					const exporter = new OcdSVGExporter(css)
					const output = exporter.export(design)
					fs.writeFileSync(result.filePath, Object.values(output)[0])
				}
				resolve({canceled: false, filename: result.canceled ? '' : result.filePath, design: design})
			}).catch(err => {
				logger.error(err)
				reject(toError(err))
			})
		})
	}
}

async function handleExportToTerraform(event: any, design: OcdDesign, directory: string) {
	logger.debug('Electron Main: handleExportTerraform')
	return new Promise((resolve, reject) => {
		dialog.showOpenDialog(mainWindow, {
			properties: ['openDirectory', 'createDirectory'],
			defaultPath: directory,
			buttonLabel: 'Export'
			}).then(result => {
			if (!result.canceled) {
				const exporter = new OcdTerraformExporter()
				const terraform = exporter.export(design)
				logger.debug('handleExportToTerraform: ', result.filePaths)
				const directory = result.filePaths[0]
				if (design.metadata.separateIdentity) {
					// create identity & resources sub-directories
					fs.mkdirSync(path.join(directory, 'identity'))
					fs.mkdirSync(path.join(directory, 'resources'))
				}
				Object.entries(terraform).forEach(([k, v]) => fs.writeFileSync(path.join(directory, k), v.join('\n')))
			}
			resolve({canceled: result.canceled, filename: result.filePaths[0], design: design})
		}).catch(err => {
			logger.error(err)
			reject(toError(err))
		})
	})
}

async function importFromTerraform(event: any) {
	logger.debug('Electron Main: importFromTerraform')
	return new Promise((resolve, reject) => {
		dialog.showOpenDialog(mainWindow, {
			properties: ['openFile', 'multiSelections'],
			filters: [{name: 'Filetype', extensions: ['tf']}]
			}).then(result => {
			const importer = new OcdTerraformImporter()
			// const design = result.canceled ? '' : fs.readFileSync(result.filePaths[0], 'utf-8')
			const design = result.canceled ? '' : readFilesSync(result.filePaths, 'utf-8').join('\n')
			resolve({canceled: result.canceled, filename: result.filePaths[0], design: importer.import(design)})
		}).catch(err => {
			logger.error(err)
			reject(toError(err))
		})
	})
}

function readFilesSync(filePaths: string[], encoding:string = 'utf-8'): string[] {
	const contents: string[] = filePaths.map((f) => fs.readFileSync(f, 'utf-8'))
	return contents
}

// Library / Reference Architecture Functions
const prodLibraryUrl = 'https://raw.githubusercontent.com/oracle/oci-designer-toolkit/refs/heads/master/ocd/library'
const devLibraryUrl = 'https://raw.githubusercontent.com/oracle/oci-designer-toolkit/refs/heads/toxophilist/sprint-dev/ocd/library'
const libraryUrl = isDev || isPreview ? devLibraryUrl : prodLibraryUrl
const libraryFile = 'referenceArchitectures.json'

// Renderer-supplied path segments (section / filename / svgFile) are interpolated
// into the GitHub raw URL. Even though the base host is fixed, an unconstrained
// segment lets a compromised renderer steer the fetch to an arbitrary path on the
// CDN. Allow only simple path-segment characters; reject anything with a slash,
// backslash, or traversal sequence.
// Charset still allows `.` so legitimate filenames (e.g. `foo.svg`) work, but
// traversal/encoding bypasses are blocked by the dedicated guards below.
const SAFE_LIBRARY_SEGMENT = /^[A-Za-z0-9._-]+$/
function assertSafeLibrarySegment(segment: string, label: string): void {
	// Reject in order:
	//  - non-strings
	//  - any `%` (defeats percent-encoded traversal/encoding tricks like `%2e%2e`)
	//  - segments altered by NFC normalization (defeats Unicode-normalization bypass)
	//  - anything outside the safe path-segment charset (blocks `/`, `\`, etc.)
	//  - `..` traversal sequences, or a leading/trailing `.`
	// `||` short-circuits, so `normalize` only runs once `segment` is a string.
	const isInvalid =
		typeof segment !== 'string' ||
		segment.includes('%') ||
		segment.normalize('NFC') !== segment ||
		!SAFE_LIBRARY_SEGMENT.test(segment) ||
		segment.includes('..') ||
		segment.startsWith('.') ||
		segment.endsWith('.')
	if (isInvalid) {
		throw new Error(`Invalid library ${label}: ${segment}`)
	}
}

async function handleLoadLibraryIndex(event: any) {
	logger.debug('Electron Main: handleLoadLibraryIndex')
	return new Promise((resolve, reject) => {
        // Build Library JSON File URL
        const libraryJsonUrl = `${libraryUrl}/${libraryFile}`
        const request = new Request(libraryJsonUrl)
        // console.debug('Electron Main: handleLoadLibraryIndex: URL', libraryJsonUrl, request)
        // Get Library File
        const libraryFetchPromise = fetchWithTimeout(request)
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
            logger.debug('Electron Main: handleLoadLibraryIndex: Fetch Error Response', err)
			reject(toError(err))
		})
	})
}

function getLibrarySectionSvg(libraryIndex: Record<string, Record<string, string>[]>, section: string) {
	return new Promise((resolve, reject) => {
		try {
			assertSafeLibrarySegment(section, 'section')
		} catch (err) {
			return reject(err instanceof Error ? err : new Error(String(err)))
		}
		const librarySection = libraryIndex[section]
		const svgUrls = librarySection.map((design, index) => {
			assertSafeLibrarySegment(design.svgFile, 'svgFile')
			return fetchWithTimeout(new Request(`${libraryUrl}/${section}/${design.svgFile}`)).then((response) => response.text()).then((text) => ({index, text}))
		})
		Promise.allSettled(svgUrls).then((svg) => {
			svg.filter((r): r is PromiseFulfilledResult<{index: number, text: string}> => r.status === 'fulfilled').forEach((r) => {
				logger.debug('Electron Main: getLibrarySectionSvg: Svg Query Results', section, r.status)
				librarySection[r.value.index].dataUri = `data:image/svg+xml,${encodeURIComponent(r.value.text)}`
				// librarySection[i].dataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(r.value)))}`
			})
			resolve(librarySection)
		}).catch((err) => {
            logger.debug('Electron Main: getLibrarySectionSvg: Fetch Error Response', err)
			reject(toError(err))
		})
	})
}

async function handleLoadLibraryDesign(event: any, section: string, filename: string) {
	logger.debug('Electron Main: handleLoadLibraryDesign')
	return new Promise((resolve, reject) => {
        try {
            assertSafeLibrarySegment(section, 'section')
            assertSafeLibrarySegment(filename, 'filename')
        } catch (err) {
            return reject(err instanceof Error ? err : new Error(String(err)))
        }
        // Build Design JSON File URL
        const libraryJsonUrl = `${libraryUrl}/${section}/${filename}`
        const request = new Request(libraryJsonUrl)
        // Get Library File
        const libraryFetchPromise = fetchWithTimeout(request)
		libraryFetchPromise.then((response) => {
            // Reject non-JSON responses (e.g. a 404 HTML page) before JSON.parse.
            const contentType = response.headers.get('content-type') ?? ''
            if (!contentType.includes('json') && !contentType.includes('text/plain')) {
                throw new Error(`Library design fetch returned unexpected content-type: ${contentType}`)
            }
			return response.text()
		}).then((design) => {
            // console.debug('Electron Main: handleLoadLibraryDesign: Fetch Data', design)
			resolve({canceled: false, filename: filename, design: JSON.parse(design)})
		}).catch((err) => {
            logger.debug('Electron Main: handleLoadLibraryIndex: Fetch Error Response', err)
			reject(toError(err))
		})
	})
}

async function handleLoadSvgCssFiles() {
	return Promise.reject(new Error('Not Implemented'))
}


// OCD Configuration
async function handleLoadConsoleConfig(event: any) {
	logger.debug('Electron Main: handleLoadConfig')
	return new Promise((resolve, reject) => {
		try {
			if (!fs.existsSync(ocdConsoleConfigFilename)) reject(new Error('Console Config does not exist'))
			const config = fs.readFileSync(ocdConsoleConfigFilename, 'utf-8')
			resolve(JSON.parse(config))
		} catch (err) {
			reject(toError(err))
		}
	})
}

async function handleSaveConsoleConfig(event: any, config: OcdConsoleConfiguration) {
	logger.debug('Electron Main: handleSaveConfig')
	return new Promise((resolve, reject) => {
		try {
			if (!config.showPreviousViewOnStart) config.displayPage = 'designer' // If we do not want to display previous page then default to designer.
			fs.writeFileSync(ocdConsoleConfigFilename, JSON.stringify(config, null, 4))
			resolve(config)
		} catch (err) {
			reject(toError(err))
		}
	})
}


// OCD Cache
async function handleLoadCache(event: any) {
	logger.debug('Electron Main: handleLoadCache')
	return new Promise((resolve, reject) => {
		try {
			// if (!fs.existsSync(ocdCacheFilename)) fs.writeFileSync(ocdCacheFilename, JSON.stringify(defaultCache, null, 4))
			if (!fs.existsSync(ocdCacheFilename)) reject('Cache does not exist')
			const config = fs.readFileSync(ocdCacheFilename, 'utf-8')
			resolve(JSON.parse(config))
		} catch (err) {
			reject(toError(err))
		}
	})
}

async function handleSaveCache(event: any, cache: OcdCache) {
	logger.debug('Electron Main: handleSaveCache') // Do not log cache contents (may carry OCID-bearing data)
	return new Promise((resolve, reject) => {
		try {
			cache.saveDate = OcdUtils.now()
			fs.writeFileSync(ocdCacheFilename, JSON.stringify(cache, null, 4))
			resolve(cache)
		} catch (err) {
			reject(toError(err))
		}
	})
}

async function handleLoadCacheProfile(event: any, profile: string) {
	logger.debug('Electron Main: handleLoadCacheProfile')
	return new Promise((resolve, reject) => {
		try {
			// if (!fs.existsSync(ocdCacheFilename)) fs.writeFileSync(ocdCacheFilename, JSON.stringify(defaultCache, null, 4))
			if (!fs.existsSync(ocdCacheFilename)) reject('Cache does not exist')
			const config = fs.readFileSync(ocdCacheFilename, 'utf-8')
			resolve(JSON.parse(config))
		} catch (err) {
			reject(toError(err))
		}
	})
}

// External URLs
async function handleOpenExternalUrl(event: any, href: string) {
	logger.debug('Electron Main: handleOpenExternalUrl')
	return new Promise((resolve, reject) => {
		try {
			openExternalHttpUrl(href).then(() => resolve('Opened')).catch((err) => reject(toError(err)))
		} catch (err) {
			reject(toError(err))
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
