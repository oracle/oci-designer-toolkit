/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { IpcMain } from "electron"
import common from 'oci-common'
import { OciQuery, OciReferenceDataQuery } from '@ocd/query'

/*
** Electron IPC Handlers required for the OCD Desktop.
*/

// export function configureOciApihandlers(ipcMain: IpcMain) {
// 	ipcMain.handle('ociConfig:loadProfileNames', handleLoadOciConfigProfileNames)
// 	ipcMain.handle('ociConfig:loadProfile', handleLoadOciConfigProfile)
// 	ipcMain.handle('ociQuery:listRegions', handleListRegions)
// 	ipcMain.handle('ociQuery:listTenancyCompartments', handleListTenancyCompartments)
// 	ipcMain.handle('ociQuery:queryTenancy', handleQueryTenancy)
// 	ipcMain.handle('ociQuery:queryDropdown', handleQueryDropdown)
// }

// export async function handleLoadOciConfigProfileNames() {
// 	console.debug('Electron Main: handleLoadOciConfigProfileNames')
// 	return new Promise((resolve, reject) => {
// 		const parsed = common.ConfigFileReader.parseDefault(null)
// 		console.debug('Electron Main: handleLoadOciConfigProfileNames', parsed)
// 		console.debug('Electron Main: handleLoadOciConfigProfileNames', parsed.accumulator.configurationsByProfile)
// 		console.debug('Electron Main: handleLoadOciConfigProfileNames', Array.from(parsed.accumulator.configurationsByProfile.keys()))
//         const profiles = Array.from(parsed.accumulator.configurationsByProfile.keys())
// 		resolve(profiles)
// 	})
// }

// export async function handleLoadOciConfigProfile(event, profile: string) {
// 	console.debug('Electron Main: handleLoadOciConfigProfile')
// 	return new Promise((resolve, reject) => {
// 		const parsed = common.ConfigFileReader.parseDefault(null)
// 		console.debug('Electron Main: handleLoadOciConfigProfileNames Parsed:', parsed)
// 		console.debug('Electron Main: handleLoadOciConfigProfileNames Config By Profile:', parsed.accumulator.configurationsByProfile)
// 		console.debug('Electron Main: handleLoadOciConfigProfileNames Keys:', Array.from(parsed.accumulator.configurationsByProfile.keys()))
//         const profileData = Array.from(parsed.accumulator.configurationsByProfile.get(profile))
// 		resolve(profileData)
// 	})
// }

// export async function handleListRegions(event, profile: string) {
// 	console.debug('Electron Main: handleListRegions')
// 	const ociQuery = new OciQuery(profile)
// 	return ociQuery.listRegions()
// }

// export async function handleListTenancyCompartments(event, profile: string) {
// 	console.debug('Electron Main: handleListTenancyCompartments')
// 	const ociQuery = new OciQuery(profile)
// 	return ociQuery.listTenancyCompartments()
// }

// export async function handleQueryTenancy(event, profile: string, compartmentIds: string[], region: string) {
// 	console.debug('Electron Main: handleQueryTenancy')
// 	const ociQuery = new OciQuery(profile, region)
// 	return ociQuery.queryTenancy(compartmentIds)
// }

// export async function handleQueryDropdown(event, profile: string, region: string) {
// 	console.debug('Electron Main: handleQueryDropdown')
// 	const ociQuery = new OciReferenceDataQuery(profile, region)
// 	return ociQuery.query()
// }
