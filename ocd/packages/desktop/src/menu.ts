/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { Menu, MenuItemConstructorOptions } from "electron"

const isMac = process.platform === 'darwin'

// // Add Menu
// const template: MenuItemConstructorOptions[] = [
// 	// { role: 'appMenu' }
// 	...(isMac
// 	  ? [{
// 		  label: app.name,
// 		  submenu: [
// 			{ role: 'about' },
// 			{ type: 'separator' },
// 			{ role: 'services' },
// 			{ type: 'separator' },
// 			{ role: 'hide' },
// 			{ role: 'hideOthers' },
// 			{ role: 'unhide' },
// 			{ type: 'separator' },
// 			{ role: 'quit' }
// 		  ]
// 		}]
// 	  : []) as MenuItemConstructorOptions[],
// 	// { role: 'fileMenu' }
// 	{
// 	  label: 'File',
// 	  submenu: [
// 		  isMac ? { role: 'close' } : { role: 'quit' }
// 	  ] as MenuItemConstructorOptions[]
// 	},
// 	// { role: 'editMenu' }
// 	// {
// 	//   label: 'Edit',
// 	//   submenu: [
// 	// 	{ role: 'undo' },
// 	// 	{ role: 'redo' },
// 	// 	{ type: 'separator' },
// 	// 	{ role: 'cut' },
// 	// 	{ role: 'copy' },
// 	// 	{ role: 'paste' },
// 	// 	...(isMac
// 	// 	  ? [
// 	// 		  { role: 'pasteAndMatchStyle' },
// 	// 		  { role: 'delete' },
// 	// 		  { role: 'selectAll' },
// 	// 		  { type: 'separator' },
// 	// 		  {
// 	// 			label: 'Speech',
// 	// 			submenu: [
// 	// 			  { role: 'startSpeaking' },
// 	// 			  { role: 'stopSpeaking' }
// 	// 			]
// 	// 		  }
// 	// 		]
// 	// 	  : [
// 	// 		  { role: 'delete' },
// 	// 		  { type: 'separator' },
// 	// 		  { role: 'selectAll' }
// 	// 		])
// 	//   ]
// 	// },
// 	// { role: 'viewMenu' }
// 	{
// 	  label: 'View',
// 	  submenu: [
//         { role: 'reload' },
//         { role: 'forceReload' },
//         { role: 'toggleDevTools' },
//         { type: 'separator' },
//         { role: 'resetZoom' },
//         { role: 'zoomIn' },
//         { role: 'zoomOut' },
//         { type: 'separator' },
//         { role: 'togglefullscreen' }
// 	  ]
// 	},
// 	// { role: 'windowMenu' }
// 	{
// 	  label: 'Window',
// 	  submenu: [
//       { role: 'minimize' },
//       { role: 'zoom' },
//       ...(isMac
//         ? [
//           { type: 'separator' },
//           { role: 'front' },
//           { type: 'separator' },
//           { role: 'window' }
//         ]
//         : [
//           { role: 'close' }
//         ]) as MenuItemConstructorOptions[]
// 	  ]
// 	},
// 	// {
// 	//   role: 'help',
// 	//   submenu: [
// 	// 	{
// 	// 	  label: 'Learn More',
// 	// 	  click: async () => {
// 	// 		const { shell } = require('electron')
// 	// 		await shell.openExternal('https://github.com/oracle/oci-designer-toolkit/tree/master/ocd')
// 	// 	  }
// 	// 	}
// 	//   ]
// 	// }
// ]
  
// export const mainMenu = Menu.buildFromTemplate(template)

// // Context Menu

// export const selectionMenu = Menu.buildFromTemplate([
//     {role: 'copy'},
//     {type: 'separator'},
//     {role: 'selectAll'},
// ])

// export const inputMenu = Menu.buildFromTemplate([
//     {role: 'undo'},
//     {role: 'redo'},
//     {type: 'separator'},
//     {role: 'cut'},
//     {role: 'copy'},
//     {role: 'paste'},
//     {type: 'separator'},
//     {role: 'selectAll'},
// ])
