/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { IpcMain } from "electron"

// Get Environment information
const isDev = process.env.OCD_DEV === 'true';
const isPreview = process.env.OCD_PREVIEW === 'true';

/*
** Electron IPC Handlers required for the OCD Desktop.
*/

// export function configureOcdDesignHandlers(ipcMain: IpcMain) {
// 	ipcMain.handle('ocdDesign:loadDesign', handleLoadDesign)
// 	ipcMain.handle('ocdDesign:saveDesign', handleSaveDesign)
// 	ipcMain.handle('ocdDesign:discardConfirmation', handleDiscardConfirmation)
// 	ipcMain.handle('ocdDesign:exportTerraform', handleExportTerraform)
// 	ipcMain.handle('ocdDesign:loadLibraryIndex', handleLoadLibraryIndex)
// 	ipcMain.handle('ocdDesign:loadLibraryDesign', handleLoadLibraryDesign)
// 	ipcMain.handle('ocdDesign:loadSvgCssFiles', handleLoadSvgCssFiles)
// }

// async function handleLoadDesign(event, filename) {
// 	console.debug('Electron Main: handleLoadDesign')
// 	return new Promise((resolve, reject) => {
// 		try {
// 			if (!filename || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
// 				dialog.showOpenDialog(mainWindow, {
// 					properties: ['openFile'],
// 					filters: [{name: 'Filetype', extensions: ['okit']}]
// 				  }).then(result => {
// 					const design = result.canceled ? {} : fs.readFileSync(result.filePaths[0], 'utf-8')
// 					resolve({canceled: result.canceled, filename: result.filePaths[0], design: JSON.parse(design)})
// 				}).catch(err => {
// 					console.error(err)
// 					reject(err)
// 				})
// 			} else {
// 				const design = fs.readFileSync(filename, 'utf-8')
// 				resolve({canceled: false, filename: filename, design: JSON.parse(design)})
// 			}
// 		} catch (err) {
// 			reject(err)
// 		}
// 	})
// }

// async function handleSaveDesign(event, design, filename, suggestedFilename='') {
// 	design = typeof design === 'string' ? JSON.parse(design) : design
// 	console.debug('Electron Main: handleSaveDesign', filename, JSON.stringify(design, null, 2))
// 	return new Promise((resolve, reject) => {
// 		try {
// 			if (!filename || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
// 				dialog.showSaveDialog(mainWindow, {
// 					defaultPath: suggestedFilename,
// 					properties: ['openFile', 'createDirectory'],
// 					filters: [{name: 'Filetype', extensions: ['okit']}]
// 				  }).then(result => {
// 					if (!result.canceled) fs.writeFileSync(result.filePath, JSON.stringify(design, null, 4))
// 					resolve({canceled: false, filename: result.canceled ? '' : result.filePath, design: design})
// 				}).catch(err => {
// 					console.error(err)
// 					reject(err)
// 				})
// 			} else {
// 				fs.writeFileSync(filename, JSON.stringify(design, null, 4))
// 				resolve({canceled: false, filename: filename, design: design})
// 			}
// 		} catch (err) {
// 			reject(err)
// 		}
// 	})
// }

// async function handleDiscardConfirmation(event) {
// 	return new Promise((resolve, reject) => {
// 		const options = {
// 			type: 'question',
// 			message: 'All Changes Will Be Lost',
// 			details: 'OCD Design has been modified.',
// 			buttons: ['Discard Changes', 'Cancel'],
// 			defaultId: 1
// 		}
// 		dialog.showMessageBox(mainWindow, options).then((result) => {
// 			console.debug('Discard Confirmation', result)
// 			const discardResponse = [true, false]
// 			resolve(discardResponse[result.response])
// 		})
// 	})
// }

// async function handleExportTerraform(event, design, directory) {
// 	// design = typeof design === 'string' ? JSON.parse(design) : design
// 	console.debug('Electron Main: handleExportTerraform')
// 	// return new Promise((resolve, reject) => {reject('Currently Not Implemented')})
// 	return Promise.reject(new Error('Currently Not Implemented'))
// }

// // Library / Reference Architecture Functions
// const prodLibraryUrl = 'https://raw.githubusercontent.com/oracle/oci-designer-toolkit/refs/heads/master/ocd/library'
// const devLibraryUrl = 'https://raw.githubusercontent.com/oracle/oci-designer-toolkit/refs/heads/toxophilist/sprint-dev/ocd/library'
// const libraryUrl = isDev || isPreview ? devLibraryUrl : prodLibraryUrl
// const libraryFile = 'referenceArchitectures.json'

// async function handleLoadLibraryIndex(event) {
// 	console.debug('Electron Main: handleLoadLibraryIndex')
// 	return new Promise((resolve, reject) => {
//         // Build Library JSON File URL
//         const libraryJsonUrl = `${libraryUrl}/${libraryFile}`
//         const request = new Request(libraryJsonUrl)
//         // console.debug('Electron Main: handleLoadLibraryIndex: URL', libraryJsonUrl, request)
//         // Get Library File
//         const libraryFetchPromise = fetch(request)
// 		libraryFetchPromise.then((response) => {
//             // console.debug('Electron Main: handleLoadLibraryIndex: Fetch Response', response)
//             // console.debug('Electron Main: handleLoadLibraryIndex: Fetch Response', response.headers.get("content-type"))
// 			return response.text()
// 		}).then((data) => {
//             // console.debug('Electron Main: handleLoadLibraryIndex: Fetch Data', data)
// 			const libraryIndex = JSON.parse(data)
// 			// const sectionQueries = [getLibrarySectionSvg(libraryIndex, 'oci')]
// 			const sectionQueries = Object.keys(libraryIndex).map((k) => getLibrarySectionSvg(libraryIndex, k))
// 			Promise.allSettled(sectionQueries).then((results) => {
// 				// console.debug('Electron Main: handleLoadLibraryIndex: Section Query Results', results)
// 				resolve(libraryIndex)
// 			})
// 			// resolve(libraryIndex)
// 		}).catch((err) => {
//             console.debug('Electron Main: handleLoadLibraryIndex: Fetch Error Response', err)
// 			reject(err)
// 		})
// 	})
// }

// function getLibrarySectionSvg(libraryIndex, section) {
// 	return new Promise((resolve, reject) => {
// 		const librarySection = libraryIndex[section]
// 		const svgRequests = librarySection.map((design) => new Request(`${libraryUrl}/${section}/${design.svgFile}`))
// 		const svgUrls = svgRequests.map((request) => fetch(request))
// 		Promise.allSettled(svgUrls).then((results) => Promise.allSettled(results.map((r) => r.value.text()))).then((svg) => {
// 			svg.forEach((r, i) => {
// 				console.debug('Electron Main: getLibrarySectionSvg: Svg Query Results', section, r.status)
// 				// console.debug('Electron Main: getLibrarySectionSvg: Svg Query Results', r.value)
// 				librarySection[i].dataUri = `data:image/svg+xml,${encodeURIComponent(r.value)}`
// 				// librarySection[i].dataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(r.value)))}`
// 			})
// 			resolve(librarySection)
// 		}).catch((err) => {
//             console.debug('Electron Main: getLibrarySectionSvg: Fetch Error Response', err)
// 			reject(err)
// 		})
// 	})
// }

// async function handleLoadLibraryDesign(event, section, filename) {
// 	console.debug('Electron Main: handleLoadLibraryDesign')
// 	return new Promise((resolve, reject) => {
//         // Build Design JSON File URL
//         const libraryJsonUrl = `${libraryUrl}/${section}/${filename}`
//         const request = new Request(libraryJsonUrl)
//         // console.debug('Electron Main: handleLoadLibraryDesign: URL', libraryJsonUrl, request)
//         // Get Library File
//         const libraryFetchPromise = fetch(request)
// 		libraryFetchPromise.then((response) => {
//             // console.debug('Electron Main: handleLoadLibraryDesign: Fetch Response', response)
//             // console.debug('Electron Main: handleLoadLibraryDesign: Fetch Response', response.headers.get("content-type"))
// 			return response.text()
// 		}).then((design) => {
//             // console.debug('Electron Main: handleLoadLibraryDesign: Fetch Data', design)
// 			resolve({canceled: false, filename: filename, design: JSON.parse(design)})
// 		}).catch((err) => {
//             console.debug('Electron Main: handleLoadLibraryIndex: Fetch Error Response', err)
// 			reject(err)
// 		})
// 	})
// }

// async function handleLoadSvgCssFiles() {
// 	return Promise.reject(new Error('Not Implemented'))
// }
