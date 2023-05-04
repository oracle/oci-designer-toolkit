/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import OcdOKITImporter from '../import/okit/OcdOKITImporter'
import OcdOKITExporter from '../export/okit/OcdOKITExporter'
import OcdConsoleConfig from './OcdConsoleConfiguration'
import OcdDocument from './OcdDocument'
import OcdTerraformExporter from '../export/terraform/OcdTerraformExporter'

export interface MenuItem {
    label: string,
    click?: Function | undefined,
    submenu?: MenuItem[]
}

export const menuItems = [
    {
        label: 'File',
        click: undefined,
        submenu: [
            {
                label: 'New',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                    console.info(`menuItems ocdDocument: ${ocdDocument}`)
                    console.info(`menuItems setOcdDocument: ${setOcdDocument}`)
                    const document: OcdDocument = OcdDocument.new()
                    console.info('New Document:', document)
                    setOcdDocument(document)
                }
            },
            {
                label: 'Open',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                    const openFile = async () => {
                        try {
                            const options = {
                                multiple: false,
                                types: [
                                    {
                                        description: 'OKIT Files',
                                        accept: {
                                            'application/json': ['.okit'],
                                            // 'text/plain': ['.md']
                                        },
                                    },
                                ],
                            }
                            // Always returns an array.
                            // @ts-ignore 
                            const [handle] = await window.showOpenFilePicker(options)
                            const file = await handle.getFile()
                            const contents = await file.text()
                            return contents
                        } catch (err: any) {
                            console.error(err.name, err.message)
                            throw err
                        }
                    }
                    openFile().then((resp) => {
                        const ocdDocument = OcdDocument.new()
                        ocdDocument.design = JSON.parse(resp)
                        setOcdDocument(ocdDocument)
                    })
                }
            },
            {
                label: 'Open Recent',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {

                }
            },
            {
                label: 'Save',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {

                }
            },
            {
                label: 'Save As',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                    const saveFile = async (ocdDocument: OcdDocument) => {
                        try {
                            const options = {
                                types: [
                                    {
                                        description: 'OKIT Files',
                                        accept: {
                                            'application/json': ['.okit'],
                                        },
                                    },
                                ],
                            }
                            // @ts-ignore 
                            const handle = await window.showSaveFilePicker(options)
                            const writable = await handle.createWritable()
                            const okitJson = JSON.stringify(ocdDocument.design, null, 2)
                            // console.info('Writing', okitJson, ocdDocument)
                            await writable.write(okitJson)
                            await writable.close()
                            return handle
                        } catch (err: any) {
                            console.error(err.name, err.message);
                        }
                    }
                    saveFile(ocdDocument).then((resp) => console.info('Saved', resp))             
                }
            },
            {
                label: 'Import From',
                click: undefined,
                submenu: [
                    {
                        label: 'OKIT Json',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                            const openFile = async () => {
                                try {
                                    const options = {
                                        multiple: false,
                                        types: [
                                            {
                                                description: 'OKIT Files',
                                                accept: {
                                                    'application/json': ['.json'],
                                                    // 'text/plain': ['.md']
                                                },
                                            },
                                        ],
                                    }
                                    // Always returns an array.
                                    // @ts-ignore 
                                    const [handle] = await window.showOpenFilePicker(options)
                                    const file = await handle.getFile()
                                    const contents = await file.text()
                                    return contents
                                } catch (err: any) {
                                    console.error(err.name, err.message)
                                    throw err
                                }
                            }
                            openFile().then((resp) => {
                                const ocdDocument = OcdDocument.new()
                                const okitImporter = new OcdOKITImporter()
                                ocdDocument.design = okitImporter.parse(resp)
                                ocdDocument.autoLayout(ocdDocument.getActivePage().id)
                                setOcdDocument(ocdDocument)
                            })
                        }
                    },
                    {
                        label: 'OCI Resources',
                        click: undefined
                    },
                    {
                        label: 'Terraform State File',
                        click: undefined
                    }
                ]
            },
            {
                label: 'Export To',
                click: undefined,
                submenu: [
                    {
                        label: 'Image',
                        click: undefined,
                        submenu: [
                            {
                                label: 'PNG',
                                click: undefined
                            },
                            {
                                label: 'JPEG',
                                click: undefined
                            },
                            {
                                label: 'SVG',
                                click: undefined
                            }
                        ]
                    },
                    {
                        label: 'Terraform',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                            const writeTerraformFile = async (dirHandle: FileSystemDirectoryHandle, filename: string, contents: string[]) => {
                                const fileHandle: FileSystemFileHandle = await dirHandle.getFileHandle(filename, {create: true})
                                // @ts-ignore 
                                const writable = await fileHandle.createWritable()
                                await writable.write(contents.join('\n'))
                                await writable.close()
                            }
                            const saveFile = async (ocdDocument: OcdDocument) => {
                                try {
                                    // @ts-ignore 
                                    const handle = await showDirectoryPicker()
                                    // const writable = await handle.createWritable()
                                    const exporter = new OcdTerraformExporter()
                                    const terraform = exporter.export(ocdDocument.design)
                                    const fileWriters = Object.entries(terraform).map(([k, v]) => writeTerraformFile(handle, k, v))
                                    Promise.all(fileWriters).then((results) => {console.info('All files written', results)})
                                    return handle
                                } catch (err: any) {
                                    console.error(err.name, err.message);
                                }
                            }
                            saveFile(ocdDocument).then((resp) => console.info('Saved', resp))             
                        }
                    },
                    {
                        label: 'Markdown',
                        click: undefined
                    },
                    {
                        label: 'OKIT Json',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                            const saveFile = async (ocdDocument: OcdDocument) => {
                                try {
                                    const options = {
                                        types: [
                                            {
                                                description: 'OKIT Files',
                                                accept: {
                                                    'application/json': ['.json'],
                                                },
                                            },
                                        ],
                                    }
                                    // @ts-ignore 
                                    const handle = await window.showSaveFilePicker(options)
                                    const writable = await handle.createWritable()
                                    const okitExporter = new OcdOKITExporter()
                                    const okitJson = okitExporter.export(ocdDocument.design)
                                    // console.info('Writing', okitJson, ocdDocument)
                                    await writable.write(okitJson)
                                    await writable.close()
                                    return handle
                                } catch (err: any) {
                                    console.error(err.name, err.message);
                                }
                            }
                            saveFile(ocdDocument).then((resp) => console.info('Saved', resp))             
                        }
                    }
                ]
            }
                ]
    },
    {
        label: 'View',
        click: undefined,
        submenu: [
            {
                label: 'Designer',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdConsoleConfig.config.displayPage = 'designer'
                    setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
                }
            },
            {
                label: 'Variables',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdConsoleConfig.config.displayPage = 'variables'
                    setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
                }
            },
            {
                label: 'BoM',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdConsoleConfig.config.displayPage = 'bom'
                    setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
                }
            },
            {
                label: 'Markdown',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdConsoleConfig.config.displayPage = 'markdown'
                    setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
                }
            },
            {
                label: 'Tabular',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdConsoleConfig.config.displayPage = 'tabular'
                    setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
                }
            },
            {
                label: 'Terraform',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdConsoleConfig.config.displayPage = 'terraform'
                    setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
                }
            }
        ]
    },
    {
        label: 'Layout',
        click: undefined,
        submenu: [
            {
                label: 'Layers',
                click: undefined
            },
            {
                label: 'Reset View',
                click: undefined
            },
            {
                label: 'Zoom In',
                click: undefined
            },
            {
                label: 'Zoom Out',
                click: undefined
            }
        ]
    },
    {
        label: 'Arrange',
        click: undefined,
        submenu: [
            {
                label: 'To Front',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdDocument.toFront(ocdDocument.selectedResource.pageId, ocdDocument.selectedResource.coordsId)
                    setOcdDocument(OcdDocument.clone(ocdDocument))            
                }
            },
            {
                label: 'To Back',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdDocument.toBack(ocdDocument.selectedResource.pageId, ocdDocument.selectedResource.coordsId)
                    setOcdDocument(OcdDocument.clone(ocdDocument))            
                }
            },
            {
                label: 'Bring Forward',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdDocument.bringForward(ocdDocument.selectedResource.pageId, ocdDocument.selectedResource.coordsId)
                    setOcdDocument(OcdDocument.clone(ocdDocument))            
                }
            },
            {
                label: 'Send Backward',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdDocument.sendBackward(ocdDocument.selectedResource.pageId, ocdDocument.selectedResource.coordsId)
                    setOcdDocument(OcdDocument.clone(ocdDocument))            
                }
            },
            {
                label: 'Auto Arrange',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdDocument.autoLayout(ocdDocument.selectedResource.pageId)
                    setOcdDocument(OcdDocument.clone(ocdDocument))            
                }
            }
        ]
    }
]