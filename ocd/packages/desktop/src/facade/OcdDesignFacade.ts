/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
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
    export const saveDesign = (design: OcdDesign, filename: string): Promise<any> => {
        console.debug('OcdDesignFacade: saveDesign', filename, JSON.stringify(design, null, 2))
        return window.ocdAPI ? window.ocdAPI.saveDesign(JSON.stringify(design, null, 2), filename) : OcdDesignerBrowserActions.saveDesign(design, filename)
    }
    export const discardConfirmation = (): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.discardConfirmation() : OcdDesignerBrowserActions.discardConfirmation()
    }
    export const exportTerraform = (design: OcdDesign, directory: string): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.exportTerraform(design, directory) : new Promise((resolve, reject) => {reject('Currently Not Implemented')})
    }
}

// // @ts-ignore
// if (window.ocdAPI) window.ocdAPI.onOpenFile((event, filePath) => {
//     console.debug('OcdDesignFacade: onOpenFile', filePath)
//     OcdDesignFacade.loadDesign(filePath).then((results) => {
//         if (!results.canceled) {
//             console.debug(results.design)
//         }
//     }).catch((resp) => {console.warn('Load Design Failed with', resp)})
// })
