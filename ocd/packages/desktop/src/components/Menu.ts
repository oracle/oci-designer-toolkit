/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { OcdOKITImporter } from '@ocd/import'
import { OcdMarkdownExporter, OcdOKITExporter, OcdSVGExporter, OcdTerraformExporter, OutputDataString } from '@ocd/export'
import OcdConsoleConfig from './OcdConsoleConfiguration'
import OcdDocument from './OcdDocument'
import { OcdDesignFacade } from '../facade/OcdDesignFacade'
import { OcdConfigFacade } from '../facade/OcdConfigFacade'
import { OcdViewLayer, OcdViewPage } from '@ocd/model'

// Import css as text
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import svgThemeCss from '!!css-loader?{"sourceMap":false,"exportType":"string"}!../css/oci-theme.css'
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import svgSvgCss from '!!css-loader?{"sourceMap":false,"exportType":"string"}!../css/ocd-svg.css'
import { OcdExternalFacade } from '../facade/OcdExternalFacade'

export interface MenuItem {
    label: string
    class?: string
    trueClass?: string
    falseClass?: string
    click?: Function | undefined
    submenu?: MenuItem[] | Function
}

export const menuItems = [
    {
        label: 'File',
        click: undefined,
        submenu: [
            {
                label: 'New',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                    if (activeFile.modified) {
                        OcdDesignFacade.discardConfirmation().then((discard) => {
                            if (discard) {
                                const document: OcdDocument = OcdDocument.new()
                                setOcdDocument(document)
                                setActiveFile({name: '', modified: false})
                            }
                        }).catch((resp) => {console.warn('Discard Failed with', resp)})
                    } else {
                        const document: OcdDocument = OcdDocument.new()
                        setOcdDocument(document)
                        setActiveFile({name: '', modified: false})
                    }
                }
            },
            {
                label: 'Open',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                    if (activeFile.modified) {
                        OcdDesignFacade.discardConfirmation().then((discard) => {
                            if (discard) loadDesign('', setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig, setActiveFile)
                            // if (discard) {
                            //     OcdDesignFacade.loadDesign('').then((results) => {
                            //         if (!results.canceled) {
                            //             const ocdDocument = OcdDocument.new()
                            //             ocdDocument.design = results.design
                            //             setOcdDocument(ocdDocument)
                            //             setActiveFile({name: results.filename, modified: false})
                            //             updateRecentFiles(results.filename, ocdConsoleConfig, setOcdConsoleConfig)
                            //         }
                            //     }).catch((resp) => {console.warn('Load Design Failed with', resp)})
        
                            // }
                        }).catch((resp) => {console.warn('Discard Failed with', resp)})
                    } else {
                        loadDesign('', setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig, setActiveFile)
                    }
                }
            },
            {
                label: 'Open Recent',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                    alert('Currently not implemented.')
                },
                submenu: (ocdConsoleConfig: OcdConsoleConfig) => {
                    const config = ocdConsoleConfig.config
                    return config.recentDesigns.map((r) => {return {
                        label: r,
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                            console.debug('>>>> Opening:', r)
                            if (activeFile.modified) {
                                OcdDesignFacade.discardConfirmation().then((discard) => {
                                    if (discard) loadDesign(r, setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig, setActiveFile)
                                }).catch((resp) => {console.warn('Discard Failed with', resp)})
                            } else {
                                loadDesign(r, setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig, setActiveFile)
                            }
                        }
                    }})
                }
            },
            {
                label: 'Save',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                    OcdDesignFacade.saveDesign(ocdDocument.design, activeFile.name).then((results) => {
                        if (!results.canceled) {
                            setActiveFile({name: results.filename, modified: false})
                        }
                    }).catch((resp) => {console.warn('Save Design Failed with', resp)})
                }
            },
            {
                label: 'Save As',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                    const suggestedName = activeFile && activeFile.name && activeFile.name !== '' ? `${activeFile.name.split('.')[0]}_Copy.okit` : ''    
                    OcdDesignFacade.saveDesign(ocdDocument.design, '').then((results) => {
                        if (!results.canceled) {
                            setActiveFile({name: results.filename, modified: false})
                            updateRecentFiles(results.filename, ocdConsoleConfig, setOcdConsoleConfig)
                            // const clone = OcdConsoleConfig.clone(ocdConsoleConfig)
                            // if (results.filename && results.filename !== '') {
                            //     const recentDesigns: string[] = ocdConsoleConfig.config.recentDesigns ? ocdConsoleConfig.config.recentDesigns.filter((f) => f !== results.filename) : []
                            //     clone.config.recentDesigns = [results.filename, ...recentDesigns].slice(0, ocdConsoleConfig.config.maxRecent)
                            // }
                            // setOcdConsoleConfig(clone)
                            // console.debug('Menu: Load: Config', clone)
                            // OcdConfigFacade.saveConsoleConfig(clone.config).catch((resp) => {console.warn(resp)})
                        }
                    }).catch((resp) => {console.warn('Load Design Failed with', resp)})
                }
            },
            {
                label: 'Query',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                    if (activeFile.modified) {
                        OcdDesignFacade.discardConfirmation().then((discard) => {
                            if (discard) {
                                const clone = OcdDocument.clone(ocdDocument)
                                clone.query = !ocdDocument.query
                                console.debug('Menu: Setting Query', ocdDocument, clone)
                                setOcdDocument(clone)
                            }
                        }).catch((resp) => {console.warn('Discard Failed with', resp)})
                    } else {
                        const clone = OcdDocument.clone(ocdDocument)
                        clone.query = !ocdDocument.query
                        console.debug('Menu: Setting Query', ocdDocument, clone)
                        setOcdDocument(clone)
                    }
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
                            }).catch((reason) => {console.debug(reason)})
                        }
                    },
                    {
                        label: 'OCI Resources',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                            alert('Currently not implemented.')
                        }
                    },
                    {
                        label: 'Terraform State File',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                            alert('Currently not implemented.')
                        }
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
                                click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                                    alert('Currently not implemented.')
                                }
                            },
                            {
                                label: 'JPEG',
                                click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                                    alert('Currently not implemented.')
                                }
                            },
                            {
                                label: 'SVG',
                                click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                                    const writeTerraformFile = async (dirHandle: FileSystemDirectoryHandle, filename: string, contents: string) => {
                                        const fileHandle: FileSystemFileHandle = await dirHandle.getFileHandle(filename, {create: true})
                                        // @ts-ignore 
                                        const writable = await fileHandle.createWritable()
                                        await writable.write(contents)
                                        await writable.close()
                                        return writable
                                    }
                                    const saveFile = async (ocdDocument: OcdDocument) => {
                                        try {
                                            // @ts-ignore 
                                            const handle = await showDirectoryPicker()
                                            const exporter = new OcdSVGExporter([svgThemeCss, svgSvgCss])
                                            const svg: OutputDataString = exporter.export(ocdDocument.design)
                                            const fileWriters = Object.entries(svg).map(([k, v]) => writeTerraformFile(handle, `${k.replaceAll(' ', '_')}.svg`, v))
                                            return Promise.all(fileWriters)
                                        } catch (err: any) {
                                            console.error(err.name, err.message);
                                        }
                                    }
                                    saveFile(ocdDocument).then((resp) => console.info('Saved', resp))             
                                }
                            }
                        ]
                    },
                    {
                        label: 'OpenTofu (Terraform)',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                            const writeTerraformFile = async (dirHandle: FileSystemDirectoryHandle, filename: string, contents: string[]) => {
                                const fileHandle: FileSystemFileHandle = await dirHandle.getFileHandle(filename, {create: true})
                                // @ts-ignore 
                                const writable = await fileHandle.createWritable()
                                await writable.write(contents.join('\n'))
                                await writable.close()
                                return writable
                            }
                            const saveFile = async (ocdDocument: OcdDocument) => {
                                try {
                                    // @ts-ignore 
                                    const handle = await showDirectoryPicker()
                                    // const writable = await handle.createWritable()
                                    const exporter = new OcdTerraformExporter()
                                    const terraform = exporter.export(ocdDocument.design)
                                    const fileWriters = Object.entries(terraform).map(([k, v]) => writeTerraformFile(handle, k, v))
                                    return Promise.all(fileWriters)
                                } catch (err: any) {
                                    console.error(err.name, err.message);
                                }
                            }
                            saveFile(ocdDocument).then((resp) => console.info('Saved', resp))             
                        }
                    },
                    {
                        label: 'Markdown',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                            const saveFile = async (ocdDocument: OcdDocument) => {
                                try {
                                    const options = {
                                        types: [
                                            {
                                                description: 'Markdown Files',
                                                accept: {
                                                    'text/markdown': ['.md'],
                                                },
                                            },
                                        ],
                                    }
                                    // @ts-ignore 
                                    const handle = await window.showSaveFilePicker(options)
                                    const writable = await handle.createWritable()
                                    const exporter = new OcdMarkdownExporter([svgThemeCss, svgSvgCss])
                                    const output = exporter.export(ocdDocument.design)
                                    await writable.write(output)
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
                label: 'Documentation',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdConsoleConfig.config.displayPage = 'documentation'
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
                label: 'OpenTofu (Terraform)',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdConsoleConfig.config.displayPage = 'terraform'
                    setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
                }
            }
            // {
            //     label: 'Validation Results',
            //     click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
            //         ocdConsoleConfig.config.displayPage = 'validation'
            //         setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
            //     }
            // }
        ]
    },
    {
        label: 'Layout',
        click: undefined,
        submenu: [
            {
                label: 'Layers',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                    alert('Currently not implemented.')
                },
                submenu: (ocdConsoleConfig: OcdConsoleConfig, ocdDocument: OcdDocument) => {
                    const page: OcdViewPage = ocdDocument.getActivePage()
                    return page.layers.map((layer: OcdViewLayer) => {return {
                        label: ocdDocument.getLayerName(layer.id),
                        class: layer.visible ? 'eye-show' : 'eye-hide',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                            const page: OcdViewPage = ocdDocument.getActivePage()
                            // @ts-ignore 
                            page.layers.find((l: OcdViewLayer) => l.id === layer.id).visible = !layer.visible
                            console.info(`Change Visibility ${layer.visible} ${ocdDocument}`)
                            // setViewPage(structuredClone(page))
                            setOcdDocument(OcdDocument.clone(ocdDocument))
                        }
                    }})
                }
            },
            {
                label: 'Reset View',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                    const clone = OcdDocument.clone(ocdDocument)
                    clone.resetPanZoom()
                    setOcdDocument(clone)
                }
            },
            {
                label: 'Zoom In',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                    const clone = OcdDocument.clone(ocdDocument)
                    clone.zoomIn()
                    setOcdDocument(clone)
                }
            },
            {
                label: 'Zoom Out',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                    const clone = OcdDocument.clone(ocdDocument)
                    clone.zoomOut()
                    setOcdDocument(clone)
                }
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
                    const coords = ocdDocument.getCoords(ocdDocument.selectedResource.coordsId)
                    const page = ocdDocument.getPage(ocdDocument.selectedResource.pageId)
                    if (coords) {ocdDocument.toFront(coords, page.id)}
                    // ocdDocument.toFront(ocdDocument.selectedResource.pageId, ocdDocument.selectedResource.coordsId)
                    setOcdDocument(OcdDocument.clone(ocdDocument))            
                }
            },
            {
                label: 'To Back',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    const coords = ocdDocument.getCoords(ocdDocument.selectedResource.coordsId)
                    const page = ocdDocument.getPage(ocdDocument.selectedResource.pageId)
                    if (coords) {ocdDocument.toBack(coords, page.id)}
                    // ocdDocument.toBack(ocdDocument.selectedResource.pageId, ocdDocument.selectedResource.coordsId)
                    setOcdDocument(OcdDocument.clone(ocdDocument))            
                }
            },
            {
                label: 'Bring Forward',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    const coords = ocdDocument.getCoords(ocdDocument.selectedResource.coordsId)
                    const page = ocdDocument.getPage(ocdDocument.selectedResource.pageId)
                    if (coords) {ocdDocument.bringForward(coords, page.id)}
                    // ocdDocument.bringForward(ocdDocument.selectedResource.pageId, ocdDocument.selectedResource.coordsId)
                    setOcdDocument(OcdDocument.clone(ocdDocument))            
                }
            },
            {
                label: 'Send Backward',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    const coords = ocdDocument.getCoords(ocdDocument.selectedResource.coordsId)
                    const page = ocdDocument.getPage(ocdDocument.selectedResource.pageId)
                    if (coords) {ocdDocument.sendBackward(coords, page.id)}
                    // ocdDocument.sendBackward(ocdDocument.selectedResource.pageId, ocdDocument.selectedResource.coordsId)
                    setOcdDocument(OcdDocument.clone(ocdDocument))            
                }
            },
            {
                label: 'Auto Arrange',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdDocument.autoLayout(ocdDocument.getActivePage().id)
                    setOcdDocument(OcdDocument.clone(ocdDocument))            
                }
            }
        ]
    },
    {
        label: 'Help',
        click: undefined,
        submenu: [
            {
                label: 'Release Notes',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdConsoleConfig.config.displayPage = 'help'
                    ocdConsoleConfig.config.helpPage = 'releasenotes'
                    setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
                }
            },
            {
                label: 'User Guide',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdConsoleConfig.config.displayPage = 'help'
                    ocdConsoleConfig.config.helpPage = 'userguide'
                    setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
                }
            },
            {
                label: 'Web Site',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    OcdExternalFacade.openExternalUrl('https://github.com/oracle/oci-designer-toolkit').then((resp) => {console.warn('Open Succeeded with', resp)}).catch((resp) => {console.warn('Open Failed with', resp)})
                }
            },
            {
                label: 'Report Issue',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    OcdExternalFacade.openExternalUrl('https://github.com/oracle/oci-designer-toolkit/issues/new').then((resp) => {console.warn('Open Succeeded with', resp)}).catch((resp) => {console.warn('Open Failed with', resp)})
                }
            },
        ]
    }
]

export const updateRecentFiles = (filename: string, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
    if (filename && filename !== '') {
        const clone = OcdConsoleConfig.clone(ocdConsoleConfig)
        const recentDesigns: string[] = ocdConsoleConfig.config.recentDesigns ? ocdConsoleConfig.config.recentDesigns.filter((f) => f !== filename) : []
        clone.config.recentDesigns = [filename, ...recentDesigns].slice(0, ocdConsoleConfig.config.maxRecent)
        setOcdConsoleConfig(clone)
        console.debug('Menu: Load: Config', clone)
        OcdConfigFacade.saveConsoleConfig(clone.config).catch((resp) => {console.warn(resp)})
    }
}

export const loadDesign = (filename: string, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, setActiveFile: Function): Promise<any> => {
    return OcdDesignFacade.loadDesign(filename).then((results) => {
        if (!results.canceled) {
            const ocdDocument = OcdDocument.new()
            ocdDocument.design = results.design
            setOcdDocument(ocdDocument)
            setActiveFile({name: results.filename, modified: false})
            updateRecentFiles(results.filename, ocdConsoleConfig, setOcdConsoleConfig)
        }
    }).catch((resp) => {console.warn('Load Design Failed with', resp)})
}

export const saveDesign = () => {
    
}