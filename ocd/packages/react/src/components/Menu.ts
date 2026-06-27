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
// OcdSvgCssData (a very large generated CSS table) is loaded via dynamic
// `import()` inside the export click handlers below so it is code-split out of
// the entry bundle and only fetched when an SVG/Markdown export is requested.
import { OcdExternalFacade } from '../facade/OcdExternalFacade'
import { buildDesignFromLzUpload } from '../landingzone/OcdLzFileImport'
import { buildDesignFromDrawio } from '../import/OcdDrawioImport'
import { injectStencilCss, validateStencilManifest } from '../stencils/OcdStencilRegistry'
import { lzConfigToWizardSeed, stageWizardSeed } from '../landingzone/OcdLzWizardContext'
import { OcdLogger } from '@ocd/core'
// import { OcdDesign } from '../../../model/lib/cjs'

// Structured, payload-free logger (mirrors OcdConsole). OcdLogger contract: never
// pass design JSON / OCID-bearing payloads — log operation names and error objects
// only, since this is a public fork whose console output may surface in bug reports.
const logger = OcdLogger.scope('Menu')

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
                        }).catch((resp) => {logger.warn('Discard Failed with', resp)})
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
                label: 'New from Template…',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                    const openGallery = () => {
                        const document: OcdDocument = OcdDocument.clone(ocdDocument)
                        document.dialog.templateGallery = true
                        setOcdDocument(document)
                    }
                    if (activeFile.modified) {
                        OcdDesignFacade.discardConfirmation().then((discard) => {
                            if (discard) openGallery()
                        }).catch((resp) => {logger.warn('Discard Failed with', resp)})
                    } else {
                        openGallery()
                    }
                }
            },
            {
                label: 'Open',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                    if (activeFile.modified) {
                        OcdDesignFacade.discardConfirmation().then((discard) => {
                            if (discard) loadDesign('', setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig, setActiveFile)
                        }).catch((resp) => {logger.warn('Discard Failed with', resp)})
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
                            logger.debug('Opening recent design')
                            if (activeFile.modified) {
                                OcdDesignFacade.discardConfirmation().then((discard) => {
                                    if (discard) loadDesign(r, setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig, setActiveFile)
                                }).catch((resp) => {logger.warn('Discard Failed with', resp)})
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
                    }).catch((resp) => {logger.warn('Save Design Failed with', resp)})
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
                    }).catch((resp) => {logger.warn('Load Design Failed with', resp)})
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
                                logger.debug('Setting Query')
                                setOcdDocument(clone)
                            }
                        }).catch((resp) => {logger.warn('Discard Failed with', resp)})
                    } else {
                        const clone = OcdDocument.clone(ocdDocument)
                        clone.query = !ocdDocument.query
                        logger.debug('Setting Query')
                        setOcdDocument(clone)
                    }
                }
            },
            {
                label: 'Import',
                click: undefined,
                submenu: [
                    {
                        label: 'Terraform',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                            if (activeFile.modified) {
                                OcdDesignFacade.discardConfirmation().then((discard) => {
                                    if (discard) importFromTerraform(setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig, setActiveFile)
                                }).catch((resp) => {logger.warn('Discard Failed with', resp)})
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
                                    logger.error(err.name, err.message)
                                    throw err
                                }
                            }
                            openFile().then((resp) => {
                                const ocdDocument = OcdDocument.new()
                                const okitImporter = new OcdOKITImporter()
                                ocdDocument.design = okitImporter.parse(resp)
                                ocdDocument.autoLayout(ocdDocument.getActivePage().id)
                                setOcdDocument(ocdDocument)
                            }).catch((reason) => {logger.debug('OKIT JSON import failed', reason)})
                        }
                    },
                    {
                        label: 'OCI Landing Zone (LZNG)',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                            importFromLandingZoneFiles(setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig)
                        }
                    },
                    {
                        label: 'draw.io Diagram',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                            importFromDrawio(setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig)
                        }
                    },
                    {
                        label: 'Custom Stencil (.json)',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function) => {
                            importStencilManifest(ocdDocument, setOcdDocument)
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
                label: 'Edit Landing Zone in Wizard',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    editLandingZoneInWizard(ocdDocument, ocdConsoleConfig, setOcdConsoleConfig)
                }
            },
            {
                label: 'Software & Ansible Provisioning',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    openSoftwareProvisioning(ocdConsoleConfig, setOcdConsoleConfig)
                }
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
                            import('../data/OcdSvgCssData').then(({ getSvgCssData }) => {
                                const css = getSvgCssData(design)
                                logger.debug('Export Markdown')
                                return OcdDesignFacade.exportToMarkdown(design, css, suggestedFilename).then((results) => {
                                    if (!results.canceled) {
                                        logger.debug('Design Exported to Markdown')
                                    } else {
                                        logger.debug('Design Exported to Markdown Cancelled')
                                    }
                                })
                            }).catch((resp) => {logger.warn('Save Design Failed with', resp)})
                        }
                    },
                    {
                        label: 'Terraform',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                            const suggestedFilename = activeFile.name.replaceAll('.okit', '.tf')
                            const directory = activeFile.name.split('/').slice(0, -1).join('/')
                            const design = JSON.parse(JSON.stringify(ocdDocument.design)) // Resolve cloning issue when design changed
                            logger.debug('Export Terraform')
                            OcdDesignFacade.exportToTerraform(design, directory).then((results) => {
                                if (!results.canceled) {
                                    logger.debug('Design Exported to OpenTofu')
                                } else {
                                    logger.debug('Design Exported to OpenTofu Cancelled')
                                }
                            }).catch((resp) => {logger.warn('Save Design Failed with', resp)})
                        }
                    },
                    {
                        label: 'Excel',
                        click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                            const suggestedFilename = activeFile.name.replaceAll('.okit', '.xlsx')
                            const design = JSON.parse(JSON.stringify(ocdDocument.design)) // Resolve cloning issue when design changed
                            logger.debug('Export Excel')
                            OcdDesignFacade.exportToExcel(design, suggestedFilename).then((results) => {
                                if (!results.canceled) {
                                    logger.debug('Design Exported to Excel')
                                } else {
                                    logger.debug('Design Exported to Excel Cancelled')
                                }
                            }).catch((resp) => {logger.warn('Save Design Failed with', resp)})
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
                            {
                                label: 'SVG',
                                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>) => {
                                    const design = JSON.parse(JSON.stringify(ocdDocument.design)) // Resolve cloning issue when design changed
                                    const suggestedFilename = activeFile.name.replaceAll('.okit', '.svg')
                                    const directory = activeFile.name.split('/').slice(0, -1).join('/')
                                    import('../data/OcdSvgCssData').then(({ getSvgCssData }) => {
                                        const css = getSvgCssData(design)
                                        logger.debug('Export SVG')
                                        return OcdDesignFacade.exportToSvg(design, css, directory, suggestedFilename).then((results) => {
                                            if (!results.canceled) {
                                                logger.debug('Design Exported to SVG')
                                            } else {
                                                logger.debug('Design Exported to SVG Cancelled')
                                            }
                                        })
                                    }).catch((resp) => {logger.warn('Save Design Failed with', resp)})
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
                                    logger.error(err.name, err.message);
                                }
                            }
                            saveFile(ocdDocument).then(() => logger.info('Saved'))
                        }
                    }
                ]
            },
            {
                label: 'Load Reference Data',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, activeFile: Record<string, any>, setActiveFile: Function) => {
                    const clone = OcdConsoleConfig.clone(ocdConsoleConfig)
                    clone.queryReferenceData = !ocdConsoleConfig.queryReferenceData
                    logger.debug('Setting Reference Data Query')
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
                label: 'Discovery',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdConsoleConfig.config.displayPage = 'discovery'
                    setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
                }
            },
            {
                label: 'OKIT Classic 0.70 Parity',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdConsoleConfig.config.displayPage = 'classic'
                    setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
                }
            },
            {
                label: 'Architecture Agent',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdConsoleConfig.config.displayPage = 'agent'
                    setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
                }
            },
            {
                label: 'Integration Hub',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    ocdConsoleConfig.config.displayPage = 'integrations'
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
                            logger.info(`Change layer visibility to ${layer.visible}`)
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
                    OcdExternalFacade.openExternalUrl('https://github.com/oracle/oci-designer-toolkit').then((resp) => {logger.warn('Open Succeeded with', resp)}).catch((resp) => {logger.warn('Open Failed with', resp)})
                }
            },
            {
                label: 'Report Issue',
                click: (ocdDocument: OcdDocument, setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
                    OcdExternalFacade.openExternalUrl('https://github.com/oracle/oci-designer-toolkit/issues/new').then((resp) => {logger.warn('Open Succeeded with', resp)}).catch((resp) => {logger.warn('Open Failed with', resp)})
                }
            },
        ]
    }
]

export const updateRecentFiles = (filename: string, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function) => {
    if (filename && filename !== '') {
        OcdConfigFacade.loadConsoleConfig().then((results) => {
            logger.debug('Load Console Config')
            const consoleConfig = new OcdConsoleConfig(results)
            const recentDesigns: string[] = consoleConfig.config.recentDesigns ? consoleConfig.config.recentDesigns.filter((f) => f !== filename) : []
            consoleConfig.config.recentDesigns = [filename, ...recentDesigns].slice(0, consoleConfig.config.maxRecent)
            logger.debug('Load Console Config: updated recent designs')
            OcdConfigFacade.saveConsoleConfig(consoleConfig.config).catch((resp) => {logger.warn('Save Console Config failed', resp)})
            setOcdConsoleConfig(consoleConfig)
        }).catch((response) => {
            logger.debug('Load Console Config failed', response)
            OcdConfigFacade.saveConsoleConfig(ocdConsoleConfig.config).then((results) => {}).catch((response) => logger.debug('Save Console Config failed', response))
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
    }).catch((resp) => {logger.warn('Load Design Failed with', resp)})
}

export const importFromTerraform = (setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function, setActiveFile: Function): Promise<any> => {
    return OcdDesignFacade.importFromTerraform().then((results) => {
        logger.debug('importFromTerraform: results received')
        if (!results.canceled) {
            const ocdDocument = OcdDocument.new()
            const design = results.design
            design.metadata.title = `Imported Terraform ${results.filename}`
            design.view.pages[0].title = results.filename
            design.view.pages[0].layers = []
            ocdDocument.design = design
            logger.debug('importFromTerraform: design built')
            // Add Layers
            const resultsOciResources = design.model.oci.resources
            logger.debug('importFromTerraform: oci resources mapped')
            resultsOciResources.compartment.forEach((c: OciModelResources.OciCompartment, i: number) => ocdDocument.addLayer(c.id, i === 0))
            // Auto Arrange
            ocdDocument.autoLayout(ocdDocument.getActivePage().id, true, ocdConsoleConfig.config.defaultAutoArrangeStyle)
            setOcdDocument(ocdDocument)
            // setActiveFile({name: results.filename.replaceAll('.tf', '.okit'), modified: false})
            // updateRecentFiles(results.filename, ocdConsoleConfig, setOcdConsoleConfig)
            ocdConsoleConfig.config.displayPage = 'designer'
            setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
        }
    }).catch((resp) => {logger.warn('Load Design Failed with', resp)})
}

/**
 * Import pre-generated OCI Landing Zone Next Gen (LZNG) JSON files (iam.json,
 * network.json, …) from a multi-file picker and open them in the Designer.
 *
 * Mirrors importFromTerraform: build an OcdDocument, add one layer per top-level
 * compartment, auto-arrange, then switch to the Designer page. The resulting
 * design is flagged lzOrigin=true (by buildOcdDesignFromLz), so further non-LZ
 * stencils dropped onto it route through the LZ placement resolver.
 */
export const importFromLandingZoneFiles = (setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function): Promise<any> => {
    const pickFiles = async (): Promise<{ name: string; content: string }[]> => {
        const options = {
            multiple: true,
            types: [
                {
                    description: 'Landing Zone JSON (iam.json, network.json, …)',
                    accept: { 'application/json': ['.json'] },
                },
            ],
        }
        // @ts-ignore - File System Access API
        const handles = await window.showOpenFilePicker(options)
        return Promise.all(
            handles.map(async (handle: any) => {
                const file = await handle.getFile()
                return { name: file.name, content: await file.text() }
            }),
        )
    }
    return pickFiles().then((uploads) => {
        const { design, topCompartmentIds } = buildDesignFromLzUpload(uploads)
        const ocdDocument = OcdDocument.new()
        ocdDocument.design = design
        const layerIds: string[] = topCompartmentIds.length > 0
            ? topCompartmentIds
            : [design.model.oci.resources.compartment?.[0]?.id].filter(Boolean)
        layerIds.forEach((id: string, i: number) => ocdDocument.addLayer(id, i === 0))
        ocdDocument.autoLayout(ocdDocument.getActivePage().id, true, ocdConsoleConfig.config.defaultAutoArrangeStyle)
        setOcdDocument(ocdDocument)
        ocdConsoleConfig.config.displayPage = 'designer'
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }).catch((reason: any) => {
        // AbortError = user dismissed the picker; only surface real failures.
        if (reason?.name === 'AbortError') return
        logger.warn('LZ import failed', reason?.message ?? reason)
        if (reason?.message) alert(reason.message)
    })
}

/**
 * Reopen a saved Landing Zone (LZNG) design back in the wizard so it can be
 * edited and re-generated. Only meaningful when the active design originated
 * from the wizard (carries a persisted `lzConfig`); otherwise this is a no-op
 * with a friendly notice (the menu item is effectively disabled).
 *
 * Stages a one-shot wizard seed (config + title + add-on toggles) and switches
 * the console to the Landing Zone page, which consumes the seed on mount.
 */
export const editLandingZoneInWizard = (ocdDocument: OcdDocument, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function): void => {
    const seed = lzConfigToWizardSeed(ocdDocument?.design)
    if (!seed) {
        alert('This design was not created by the Landing Zone wizard, so there is no Landing Zone configuration to edit. Create or import a Landing Zone design first.')
        return
    }
    stageWizardSeed(seed)
    ocdConsoleConfig.config.displayPage = 'landingzone'
    setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
}

/** Switch to the Software & Ansible Provisioning page for the current design. */
export const openSoftwareProvisioning = (ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function): void => {
    ocdConsoleConfig.config.displayPage = 'software'
    setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
}

/**
 * Import a draw.io (diagrams.net) diagram and recreate it in the Designer.
 *
 * Reads a single uncompressed .drawio / .xml file, maps each shape to an OCI
 * resource, wires edges + container nesting into FK associations, then
 * auto-arranges and switches to the Designer. Compressed .drawio files raise a
 * clear "re-export uncompressed" error.
 */
export const importFromDrawio = (setOcdDocument: Function, ocdConsoleConfig: OcdConsoleConfig, setOcdConsoleConfig: Function): Promise<any> => {
    const pickFile = async (): Promise<{ name: string; content: string }> => {
        const options = {
            multiple: false,
            types: [
                {
                    description: 'draw.io diagram (uncompressed XML)',
                    accept: { 'application/xml': ['.drawio', '.xml'] },
                },
            ],
        }
        // @ts-ignore - File System Access API
        const [handle] = await window.showOpenFilePicker(options)
        const file = await handle.getFile()
        return { name: file.name, content: await file.text() }
    }
    return pickFile().then(({ name, content }) => {
        const title = name.replace(/\.(drawio|xml)$/i, '')
        const { design, topCompartmentIds } = buildDesignFromDrawio(content, `Imported ${title}`)
        const ocdDocument = OcdDocument.new()
        ocdDocument.design = design
        const layerIds: string[] = topCompartmentIds.length > 0
            ? topCompartmentIds
            : [design.model.oci.resources.compartment?.[0]?.id].filter(Boolean)
        layerIds.forEach((id: string, i: number) => ocdDocument.addLayer(id, i === 0))
        ocdDocument.autoLayout(ocdDocument.getActivePage().id, true, ocdConsoleConfig.config.defaultAutoArrangeStyle)
        setOcdDocument(ocdDocument)
        ocdConsoleConfig.config.displayPage = 'designer'
        setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
    }).catch((reason: any) => {
        if (reason?.name === 'AbortError') return
        logger.warn('draw.io import failed', reason?.message ?? reason)
        if (reason?.message) alert(reason.message)
    })
}


/**
 * Import a custom-stencil JSON manifest (single object or array) into the CURRENT
 * design without a rebuild. Reuses the same File System Access `showOpenFilePicker`
 * flow as the OKIT Json import. Each validated manifest is persisted to
 * design.userDefined.customStencils[class] (so it travels with save/load) and its
 * icon CSS is injected immediately; the imported stencils then appear in the
 * palette and can be dropped onto the canvas.
 */
export const importStencilManifest = (ocdDocument: OcdDocument, setOcdDocument: Function): Promise<any> => {
    const pickFile = async (): Promise<string> => {
        const options = {
            multiple: false,
            types: [
                {
                    description: 'Custom Stencil Manifest (.json)',
                    accept: { 'application/json': ['.json'] },
                },
            ],
        }
        // @ts-ignore - File System Access API
        const [handle] = await window.showOpenFilePicker(options)
        const file = await handle.getFile()
        return file.text()
    }
    return pickFile().then((contents) => {
        const manifests = validateStencilManifest(JSON.parse(contents))
        const clone = OcdDocument.clone(ocdDocument)
        if (!clone.design.userDefined.customStencils) clone.design.userDefined.customStencils = {}
        manifests.forEach((manifest) => {
            clone.design.userDefined.customStencils[manifest.class] = manifest
            injectStencilCss(manifest)
        })
        logger.info(`Imported ${manifests.length} custom stencil(s)`)
        setOcdDocument(clone)
    }).catch((reason: any) => {
        // AbortError = user dismissed the picker; only surface real failures.
        if (reason?.name === 'AbortError') return
        logger.warn('Custom stencil import failed', reason?.message ?? reason)
        if (reason?.message) alert(reason.message)
    })
}

export const saveDesign = () => {

}
