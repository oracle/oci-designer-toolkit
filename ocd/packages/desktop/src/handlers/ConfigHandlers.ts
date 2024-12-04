/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { IpcMain } from "electron"


/*
** Electron IPC Handlers required for the OCD Desktop.
*/

// export async function handleLoadConsoleConfig(event) {
// 	console.debug('Electron Main: handleLoadConfig')
// 	return new Promise((resolve, reject) => {
// 		// const defaultConfig = {
//         //     showPalette: true,
//         //     showModelPalette: true,
//         //     showProvidersPalette: ['oci'],
//         //     verboseProviderPalette: false,
//         //     displayPage: 'designer',
//         //     detailedResource: true,
//         //     showProperties: true,
//         //     highlightCompartmentResources: false,
//         //     recentDesigns: [],
//         //     maxRecent: 10,
//         // }
// 		try {
// 			// if (!fs.existsSync(ocdConsoleConfigFilename)) fs.writeFileSync(ocdConsoleConfigFilename, JSON.stringify(defaultConfig, null, 4))
// 			if (!fs.existsSync(ocdConsoleConfigFilename)) reject(new Error('Console Config does not exist'))
// 			const config = fs.readFileSync(ocdConsoleConfigFilename, 'utf-8')
// 			resolve(JSON.parse(config))
// 		} catch (err) {
// 			reject(err)
// 		}
// 	})
// }

// export async function handleSaveConsoleConfig(event, config) {
// 	console.debug('Electron Main: handleSaveConfig')
// 	return new Promise((resolve, reject) => {
// 		try {
// 			if (!config.showPreviousViewOnStart) config.displayPage = 'designer' // If we do not want to display previous page then default to designer.
// 			fs.writeFileSync(ocdConsoleConfigFilename, JSON.stringify(config, null, 4))
// 			resolve(config)
// 		} catch (err) {
// 			reject(err)
// 		}
// 	})
// }

// export async function handleLoadCache(event) {
// 	console.debug('Electron Main: handleLoadCache')
// 	return new Promise((resolve, reject) => {
// 		try {
// 			// if (!fs.existsSync(ocdCacheFilename)) fs.writeFileSync(ocdCacheFilename, JSON.stringify(defaultCache, null, 4))
// 			if (!fs.existsSync(ocdCacheFilename)) reject('Cache does not exist')
// 			const config = fs.readFileSync(ocdCacheFilename, 'utf-8')
// 			resolve(JSON.parse(config))
// 		} catch (err) {
// 			reject(err)
// 		}
// 	})
// }

// export async function handleSaveCache(event, cache) {
// 	console.debug('Electron Main: handleSaveCache')
// 	return new Promise((resolve, reject) => {
// 		try {
// 			fs.writeFileSync(ocdCacheFilename, JSON.stringify(cache, null, 4))
// 			resolve(cache)
// 		} catch (err) {
// 			reject(err)
// 		}
// 	})
// }

// export async function handleLoadCacheProfile(event, profile) {
// 	console.debug('Electron Main: handleLoadCacheProfile')
// 	return new Promise((resolve, reject) => {
// 		try {
// 			// if (!fs.existsSync(ocdCacheFilename)) fs.writeFileSync(ocdCacheFilename, JSON.stringify(defaultCache, null, 4))
// 			if (!fs.existsSync(ocdCacheFilename)) reject('Cache does not exist')
// 			const config = fs.readFileSync(ocdCacheFilename, 'utf-8')
// 			resolve(JSON.parse(config))
// 		} catch (err) {
// 			reject(err)
// 		}
// 	})
// }

