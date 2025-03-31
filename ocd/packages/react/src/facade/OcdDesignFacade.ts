/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign } from "@ocd/model"
import { OcdDesignerBrowserActions } from "../actions/OcdDesignBrowserActions"

/*
** Facade exists so we can switch between Electron based and Web based which will require a web server
*/

export namespace OcdDesignFacade {
    export const loadDesign = (filename: string): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.loadDesign(filename) : OcdDesignerBrowserActions.loadDesign(filename)
    }
    export const saveDesign = (design: OcdDesign, filename: string, suggestedFilename: string = ''): Promise<any> => {
        console.debug('OcdDesignFacade: saveDesign', filename, JSON.stringify(design, null, 2))
        return window.ocdAPI ? window.ocdAPI.saveDesign(JSON.stringify(design, null, 2), filename, suggestedFilename) : OcdDesignerBrowserActions.saveDesign(design, filename)
    }
    export const discardConfirmation = (): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.discardConfirmation() : OcdDesignerBrowserActions.discardConfirmation()
    }
    export const loadLibraryIndex = (): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.loadLibraryIndex() : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const loadLibraryDesign = (section: string, filename: string): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.loadLibraryDesign(section, filename) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const loadSvgCssFiles = (): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.loadSvgCssFiles() : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const exportTerraform = (design: OcdDesign, directory: string): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.exportTerraform(design, directory) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const exportToExcel = (design: OcdDesign, suggestedFilename: string = ''): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.exportToExcel(design, suggestedFilename) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const exportToMarkdown = (design: OcdDesign, css: string[], suggestedFilename: string = ''): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.exportToMarkdown(design, css, suggestedFilename) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const exportToSvg = (design: OcdDesign, css: string[], directory: string, suggestedFilename: string = ''): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.exportToSvg(design, css, directory, suggestedFilename) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const exportToTerraform = (design: OcdDesign, directory: string): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.exportToTerraform(design, directory) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const importFromTerraform = (): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.importFromTerraform() : Promise.reject(new Error('Currently Not Implemented'))
    }
}
