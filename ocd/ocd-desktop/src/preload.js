/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ocdAPI', {
  loadOCIConfigProfiles: () => ipcRenderer.invoke('ociConfig:loadProfiles'),
  listRegions: (profile) => ipcRenderer.invoke('ociQuery:listRegions', profile),
  listTenancyCompartments: (profile) => ipcRenderer.invoke('ociQuery:listTenancyCompartments', profile),
  queryTenancy: (profile) => ipcRenderer.invoke('ociQuery:queryTenancy', profile),
})

console.debug('Preload script')
