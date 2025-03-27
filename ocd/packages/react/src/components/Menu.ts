/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { OcdOKITImporter } from '@ocd/import'
import { OcdMarkdownExporter, OcdOKITExporter } from '@ocd/export'
import { OcdConsoleConfig } from './OcdConsoleConfiguration'
import { OcdDocument } from './OcdDocument'
import { OcdDesignFacade } from '../facade/OcdDesignFacade'
import { OcdConfigFacade } from '../facade/OcdConfigFacade'
import { OcdViewLayer, OcdViewPage, OciModelResources } from '@ocd/model'
import { autoLayoutOptions } from '../data/OcdAutoLayoutOptions'
import { getSvgCssData } from '../data/OcdSvgCssData'
import { OcdExternalFacade } from '../facade/OcdExternalFacade'
// import { OcdDesign } from '../../../model/lib/cjs'

// const ociSvgThemeCss = svgCssData['oci-theme.css']
// const azureSvgThemeCss = svgCssData['azure-theme.css']
// const generalSvgThemeCss = svgCssData['general-theme.css']
// const googleSvgThemeCss = svgCssData['google-theme.css']
// const svgSvgCss = svgCssData['ocd-svg.css']

export interface MenuItem {
    label: string
    class?: string
    trueClass?: string
    falseClass?: string
    click?: Function
    view?: string
    submenu?: MenuItem[] | Function
}

// export const getSvgCssData = (design: OcdDesign): string[] => {
//     let cssData = [ociSvgThemeCss, svgSvgCss]
//     if (design.model.general && Object.keys(design.model.general).length > 0) cssData = [...cssData, generalSvgThemeCss]
//     if (design.model.azure && Object.keys(design.model.azure).length > 0) cssData = [...cssData, azureSvgThemeCss]
//     if (design.model.google && Object.keys(design.model.google).length > 0) cssData = [...cssData, googleSvgThemeCss]
//     return cssData
// }

export const menuItems: MenuItem[] = [
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
                                ocdConsoleConfig.config.displayPage = 'designer'
                                setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
                                        }
                        }).catch((resp) => {console.warn('Discard Failed with', resp)})
                    } else {
                        const document: OcdDocument = OcdDocument.new()
                        setOcdDocument(document)
                        setActiveFile({name: '', modified: false})
                        ocdConsoleConfig.config.displayPage = 'designer'
                        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
                        }
                }
            },
            {
                label: 'Open',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                    if (activeFile.modified) {
                        OcdDesignFacade.discardConfirmation().then((discard) => {
                            if (discard) loadDesign('', setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig, setActiveFile)
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
                            updateRecentFiles(results.filename, ocdConsoleConfig, setOcdConsoleConfig)
                        }
                    }).catch((resp) => {console.warn('Save Design Failed with', resp)})
                }
            },
            {
                label: 'Save As',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                    const suggestedName = activeFile?.name && activeFile.name !== '' ? `${activeFile.name.split('.')[0]}_Copy.okit` : ''    
                    OcdDesignFacade.saveDesign(ocdDocument.design, '', suggestedName).then((results) => {
                        if (!results.canceled) {
                            setActiveFile({name: results.filename, modified: false})
                            updateRecentFiles(results.filename, ocdConsoleConfig, setOcdConsoleConfig)
                        }
                    }).catch((resp) => {console.warn('Load Design Failed with', resp)})
                }
            },
            // {
            //     label: 'Query',
            //     click: undefined,
            //     submenu: [
            //         {
            //             label: 'OCI',
            //             click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
            //                 if (activeFile.modified) {
            //                     OcdDesignFacade.discardConfirmation().then((discard) => {
            //                         if (discard) {
            //                             const clone = OcdDocument.clone(ocdDocument)
            //                             clone.query = !ocdDocument.query
            //                             console.debug('Menu: Setting Query', ocdDocument, clone)
            //                             setOcdDocument(clone)
            //                         }
            //                     }).catch((resp) => {console.warn('Discard Failed with', resp)})
            //                 } else {
            //                     const clone = OcdDocument.clone(ocdDocument)
            //                     clone.query = !ocdDocument.query
            //                     console.debug('Menu: Setting Query', ocdDocument, clone)
            //                     setOcdDocument(clone)
            //                 }
            //             }
            //         },
            //         {
            //             label: 'Azure',
            //             click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
            //                 alert('Currently not implemented.')
            //             }
            //         },
            //         {
            //             label: 'Google',
            //             click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
            //                 alert('Currently not implemented.')
            //             }
            //         },
            //     ]
            // },
            {
                label: 'Import',
                click: undefined,
                submenu: [
                    {
                        label: 'Query',
                        click: undefined,
                        submenu: [
                            {
                                label: 'OCI',
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
                                label: 'Azure',
                                click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                                    alert('Currently not implemented.')
                                }
                            },
                            {
                                label: 'Google',
                                click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                                    alert('Currently not implemented.')
                                }
                            },
                        ]
                    },
                    {
                        label: 'Terraform',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                            if (activeFile.modified) {
                                OcdDesignFacade.discardConfirmation().then((discard) => {
                                    if (discard) importFromTerraform(setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig, setActiveFile)
                                }).catch((resp) => {console.warn('Discard Failed with', resp)})
                            } else {
                                importFromTerraform(setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig, setActiveFile)
                            }
                        }
                    },
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
                    // {
                    //     label: 'OCI Resources',
                    //     click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                    //         alert('Currently not implemented.')
                    //     }
                    // },
                    // {
                    //     label: 'Terraform State File',
                    //     click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                    //         alert('Currently not implemented.')
                    //     }
                    // }
                ]
            },
            {
                label: 'Export',
                click: undefined,
                submenu: [
                    {
                        label: 'Markdown',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>) => { // Convert to call to Electron API
                            const suggestedFilename = activeFile.name.replaceAll('.okit', '.md')
                            const design = JSON.parse(JSON.stringify(ocdDocument.design)) // Resolve cloning issue when design changed
                            const css = getSvgCssData(design)
                            console.debug('Export Markdown Design:', design)
                            OcdDesignFacade.exportToMarkdown(design, css, suggestedFilename).then((results) => {
                                if (!results.canceled) {
                                    console.debug('Design Exported to Markdown')
                                } else {
                                    console.debug('Design Exported to Markdown Cancelled')
                                }
                            }).catch((resp) => {console.warn('Save Design Failed with', resp)})
                        }
                    },
                    {
                        label: 'Terraform',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                            const suggestedFilename = activeFile.name.replaceAll('.okit', '.tf')
                            const directory = activeFile.name.split('/').slice(0, -1).join('/')
                            const design = JSON.parse(JSON.stringify(ocdDocument.design)) // Resolve cloning issue when design changed
                            console.debug('Export Excel Design:', directory)
                            console.debug('Export Excel Design:', design)
                            OcdDesignFacade.exportToTerraform(design, directory).then((results) => {
                                if (!results.canceled) {
                                    console.debug('Design Exported to OpenTofu')
                                } else {
                                    console.debug('Design Exported to OpenTofu Cancelled')
                                }
                            }).catch((resp) => {console.warn('Save Design Failed with', resp)})
                        }
                    },
                    {
                        label: 'Resource Manager',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                            const clone = OcdDocument.clone(ocdDocument)
                            clone.dialog.resourceManager = true
                            console.debug('Menu: Setting Resource Manager', ocdDocument, clone)
                            setOcdDocument(clone)
                        }
                    },
                    {
                        label: 'Excel',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                            const suggestedFilename = activeFile.name.replaceAll('.okit', '.xlsx')
                            const design = JSON.parse(JSON.stringify(ocdDocument.design)) // Resolve cloning issue when design changed
                            console.debug('Export Excel Design:', design)
                            OcdDesignFacade.exportToExcel(design, suggestedFilename).then((results) => {
                                if (!results.canceled) {
                                    console.debug('Design Exported to Excel')
                                } else {
                                    console.debug('Design Exported to Excel Cancelled')
                                }
                            }).catch((resp) => {console.warn('Save Design Failed with', resp)})
                        }
                    },
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
                            // {
                            //     label: 'SVG Old',
                            //     click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                            //         const writeTerraformFile = async (dirHandle: FileSystemDirectoryHandle, filename: string, contents: string) => {
                            //             const fileHandle: FileSystemFileHandle = await dirHandle.getFileHandle(filename, {create: true})
                            //             // @ts-ignore 
                            //             const writable = await fileHandle.createWritable()
                            //             await writable.write(contents)
                            //             await writable.close()
                            //             return writable
                            //         }
                            //         const saveFile = async (ocdDocument: OcdDocument) => {
                            //             try {
                            //                 // @ts-ignore 
                            //                 const handle = await showDirectoryPicker()
                            //                 const exporter = new OcdSVGExporter([ociSvgThemeCss, svgSvgCss])
                            //                 const svg: OutputDataString = exporter.export(ocdDocument.design)
                            //                 const fileWriters = Object.entries(svg).map(([k, v]) => writeTerraformFile(handle, `${k.replaceAll(' ', '_')}.svg`, v))
                            //                 return Promise.all(fileWriters)
                            //             } catch (err: any) {
                            //                 console.error(err.name, err.message);
                            //             }
                            //         }
                            //         saveFile(ocdDocument).then((resp) => console.info('Saved', resp))             
                            //     }
                            // },
                            {
                                label: 'SVG',
                                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>) => {
                                    const design = JSON.parse(JSON.stringify(ocdDocument.design)) // Resolve cloning issue when design changed
                                    const suggestedFilename = activeFile.name.replaceAll('.okit', '.svg')
                                    const directory = activeFile.name.split('/').slice(0, -1).join('/')
                                    const css = getSvgCssData(design)
                                    console.debug('Export SVG:', design)
                                    OcdDesignFacade.exportToSvg(design, css, directory, suggestedFilename).then((results) => {
                                        if (!results.canceled) {
                                            console.debug('Design Exported to SVG')
                                        } else {
                                            console.debug('Design Exported to SVG Cancelled')
                                        }
                                    }).catch((resp) => {console.warn('Save Design Failed with', resp)})
                                }
                            }
                        ]
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
            },
            {
                label: 'Load Reference Data',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                    const clone = OcdConsoleConfig.clone(ocdConsoleConfig)
                    clone.queryReferenceData = !ocdConsoleConfig.queryReferenceData
                    console.debug('Menu: Setting Reference Data Query', ocdDocument, clone)
                    setOcdConsoleConfig(clone)
                }
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
                label: 'Common Tags',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdConsoleConfig.config.displayPage = 'tags'
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
        view: 'designer',
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
        view: 'designer',
        submenu: [
            {
                label: 'To Front',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    const coords = ocdDocument.getCoords(ocdDocument.selectedResource.coordsId)
                    const page = ocdDocument.getPage(ocdDocument.selectedResource.pageId)
                    if (coords) {ocdDocument.toFront(coords, page.id)}
                    setOcdDocument(OcdDocument.clone(ocdDocument))            
                }
            },
            {
                label: 'To Back',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    const coords = ocdDocument.getCoords(ocdDocument.selectedResource.coordsId)
                    const page = ocdDocument.getPage(ocdDocument.selectedResource.pageId)
                    if (coords) {ocdDocument.toBack(coords, page.id)}
                    setOcdDocument(OcdDocument.clone(ocdDocument))            
                }
            },
            {
                label: 'Bring Forward',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    const coords = ocdDocument.getCoords(ocdDocument.selectedResource.coordsId)
                    const page = ocdDocument.getPage(ocdDocument.selectedResource.pageId)
                    if (coords) {ocdDocument.bringForward(coords, page.id)}
                    setOcdDocument(OcdDocument.clone(ocdDocument))            
                }
            },
            {
                label: 'Send Backward',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    const coords = ocdDocument.getCoords(ocdDocument.selectedResource.coordsId)
                    const page = ocdDocument.getPage(ocdDocument.selectedResource.pageId)
                    if (coords) {ocdDocument.sendBackward(coords, page.id)}
                    setOcdDocument(OcdDocument.clone(ocdDocument))            
                }
            },
            {
                label: 'Auto Arrange',
                click: undefined,
                submenu: () => {
                    return Object.entries(autoLayoutOptions).map(([k, v]) => {return {
                        label: v,
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                            ocdDocument.autoLayout(ocdDocument.getActivePage().id, true, k === 'default' ? ocdConsoleConfig.config.defaultAutoArrangeStyle : k)
                            setOcdDocument(OcdDocument.clone(ocdDocument))            
                        }
                    }})
                }
            }
        ]
    },
    {
        label: 'Library',
        click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
            ocdConsoleConfig.config.displayPage = 'library'
            setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
        }
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
        OcdConfigFacade.loadConsoleConfig().then((results) => {
            console.debug('Menu: Load Console Config', results)
            const consoleConfig = new OcdConsoleConfig(results)
            const recentDesigns: string[] = consoleConfig.config.recentDesigns ? consoleConfig.config.recentDesigns.filter((f) => f !== filename) : []
            consoleConfig.config.recentDesigns = [filename, ...recentDesigns].slice(0, consoleConfig.config.maxRecent)
            console.debug('Menu: Load: Config', consoleConfig)
            OcdConfigFacade.saveConsoleConfig(consoleConfig.config).catch((resp) => {console.warn(resp)})
            setOcdConsoleConfig(consoleConfig)
        }).catch((response) => {
            console.debug('Menu: Load Console Config', response)
            OcdConfigFacade.saveConsoleConfig(ocdConsoleConfig.config).then((results) => {}).catch((response) => console.debug('Menu:', response))
            // OcdConfigFacade.saveConsoleConfig(ocdConsoleConfig.config).then((results) => {console.debug('OcdConsole: Saved Console Config')}).catch((response) => console.debug('OcdConsole:', response))
        })
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
            ocdConsoleConfig.config.displayPage = 'designer'
            setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
        }
    }).catch((resp) => {console.warn('Load Design Failed with', resp)})
}

export const importFromTerraform = (setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, setActiveFile: Function): Promise<any> => {
    return OcdDesignFacade.importFromTerraform().then((results) => {
        console.debug('menu: importFromTerraform:', JSON.stringify(results, null, 2))
        if (!results.canceled) {
            const ocdDocument = OcdDocument.new()
            const design = results.design
            design.metadata.title = `Imported Terraform ${results.filename}`
            design.view.pages[0].title = results.filename
            design.view.pages[0].layers = []
            ocdDocument.design = design
            console.debug('importFromTerraform: Design', JSON.stringify(ocdDocument.design, null, 2))
            // Add Layers
            const resultsOciResources = design.model.oci.resources
            console.debug('importFromTerraform: Oci Resources', JSON.stringify(resultsOciResources, null, 2))
            resultsOciResources.compartment.forEach((c: OciModelResources.OciCompartment, i: number) => ocdDocument.addLayer(c.id, i === 0))
            // Auto Arrange
            ocdDocument.autoLayout(ocdDocument.getActivePage().id, true, ocdConsoleConfig.config.defaultAutoArrangeStyle)
            setOcdDocument(ocdDocument)
            // setActiveFile({name: results.filename.replaceAll('.tf', '.okit'), modified: false})
            // updateRecentFiles(results.filename, ocdConsoleConfig, setOcdConsoleConfig)
            ocdConsoleConfig.config.displayPage = 'designer'
            setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
        }
    }).catch((resp) => {console.warn('Load Design Failed with', resp)})
}



export const saveDesign = () => {
    
}