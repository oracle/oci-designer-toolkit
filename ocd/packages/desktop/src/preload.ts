/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { contextBridge, ipcRenderer } from 'electron'
import { OcdDesign } from '@ocd/model'
import { OcdCache, OcdConsoleConfiguration } from '@ocd/react'
import { OutputDataStringArray } from "@ocd/export"

contextBridge.exposeInMainWorld('ocdAPI', {
  // Build Information
  getVersion: () => ipcRenderer.invoke('ocdBuild:getVersion'),
  // OCI API Calls 
  // Query
  loadOCIConfigProfileNames: () => ipcRenderer.invoke('ociConfig:loadProfileNames'),
  loadOCIConfigProfile: (profile: string) => ipcRenderer.invoke('ociConfig:loadProfile', profile),
  listRegions: (profile: string) => ipcRenderer.invoke('ociQuery:listRegions', profile),
  listTenancyCompartments: (profile: string) => ipcRenderer.invoke('ociQuery:listTenancyCompartments', profile),
  queryTenancy: (profile: string, compartmentIds: string[], region: string) => ipcRenderer.invoke('ociQuery:queryTenancy', profile, compartmentIds, region),
  queryDropdown: (profile: string, region: string) => ipcRenderer.invoke('ociQuery:queryDropdown', profile, region),
  listStacks: (profile: string, region: string, compartmentId: string) => ipcRenderer.invoke('ociQuery:listStacks', profile, region, compartmentId),
  // Resource Manager
  createStack: (profile: string, region: string, compartmentId: string, data: OutputDataStringArray, apply: boolean) => ipcRenderer.invoke('OciResourceManager:updateStack', profile, region, compartmentId, data, apply),
  updateStack: (profile: string, region: string, stackId: string, data: OutputDataStringArray, apply: boolean) => ipcRenderer.invoke('OciResourceManager:updateStack', profile, region, stackId, data, apply),
  createJob: (profile: string, region: string, stackId: string, apply: boolean) => ipcRenderer.invoke('OciResourceManager:createJob', profile, region, stackId, apply),
  // OCD Design 
  loadDesign: (filename: string) => ipcRenderer.invoke('ocdDesign:loadDesign', filename),
  saveDesign: (design: OcdDesign, filename: string, suggestedFilename = '') => ipcRenderer.invoke('ocdDesign:saveDesign', design, filename, suggestedFilename),
  discardConfirmation: () => ipcRenderer.invoke('ocdDesign:discardConfirmation'),
  loadLibraryIndex: () => ipcRenderer.invoke('ocdDesign:loadLibraryIndex'),
  loadLibraryDesign: (section: string, filename: string) => ipcRenderer.invoke('ocdDesign:loadLibraryDesign', section, filename),
  loadSvgCssFiles: () => ipcRenderer.invoke('ocdDesign:loadSvgCssFiles'),
  exportTerraform: (design: OcdDesign, directory: string) => ipcRenderer.invoke('ocdDesign:exportTerraform', design, directory),
  exportToExcel: (design: OcdDesign, suggestedFilename = '') => ipcRenderer.invoke('ocdDesign:exportToExcel', design, suggestedFilename),
  exportToMarkdown: (design: OcdDesign, css: string[], suggestedFilename = '') => ipcRenderer.invoke('ocdDesign:exportToMarkdown', design, css, suggestedFilename),
  exportToSvg: (design: OcdDesign, css: string[], directory: string, suggestedFilename = '') => ipcRenderer.invoke('ocdDesign:exportToSvg', design, css, directory, suggestedFilename),
  exportToTerraform: (design: OcdDesign, directory: string) => ipcRenderer.invoke('ocdDesign:exportToTerraform', design, directory),
  importFromTerraform: ()=> ipcRenderer.invoke('ocdDesign:importFromTerraform'),
  // OCD Configuration
  loadConsoleConfig: () => ipcRenderer.invoke('ocdConfig:loadConsoleConfig'),
  saveConsoleConfig: (config: OcdConsoleConfiguration) => ipcRenderer.invoke('ocdConfig:saveConsoleConfig', config),
  // OCD Cache
  loadCache: () => ipcRenderer.invoke('ocdCache:loadCache'),
  saveCache: (config: OcdCache) => ipcRenderer.invoke('ocdCache:saveCache', config),
  // External URLs
  openExternalUrl: (href: string) => ipcRenderer.invoke('ocdExternal:openExternalUrl', href),
  // Main -> Renderer One Way
  onOpenFile: (callback: any) => ipcRenderer.on('open-file', callback)
})

console.debug('Preload script')

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
