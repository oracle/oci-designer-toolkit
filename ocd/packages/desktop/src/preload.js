/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ocdAPI', {
  loadOCIConfigProfiles: () => ipcRenderer.invoke('ociConfig:loadProfiles'),
  listRegions: (profile) => ipcRenderer.invoke('ociQuery:listRegions', profile),
  listTenancyCompartments: (profile) => ipcRenderer.invoke('ociQuery:listTenancyCompartments', profile),
  queryTenancy: (profile, compartmentIds, region) => ipcRenderer.invoke('ociQuery:queryTenancy', profile, compartmentIds, region),
  queryDropdown: (profile, region) => ipcRenderer.invoke('ociQuery:queryDropdown', profile, region),
  exportTerraform: (design, directory) => ipcRenderer.invoke('ociExport:exportTerraform', design, directory),
})

console.debug('Preload script')
