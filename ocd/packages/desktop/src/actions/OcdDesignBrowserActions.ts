/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign } from "@ocd/model"

export namespace OcdDesignerBrowserActions {
    export const loadDesign = (filename: string): Promise<any> => {
        return new Promise((resolve, reject) => {
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
                    // return contents
                    return {filename: file.name, design: JSON.parse(contents)}
                } catch (err: any) {
                    console.error(err.name, err.message)
                    throw err
                }
            }
            openFile().then((resp) => {
                resolve({canceled: false, filename: resp.filename, design: resp.design})
            }).catch((reason) => {
                console.debug(reason)
                reject(new Error(reason))
            })
        })
    }
    export const saveDesign = (design: OcdDesign, filename: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const saveFile = async (design: OcdDesign) => {
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
                        suggestedName: filename,
                    }
                    // @ts-ignore 
                    const handle = await window.showSaveFilePicker(options)
                    const writable = await handle.createWritable()
                    const okitJson = JSON.stringify(design, null, 2)
                    await writable.write(okitJson)
                    await writable.close()
                    return handle
                } catch (err: any) {
                    console.error(err.name, err.message);
                }
            }
            saveFile(design).then((resp) => {
                resolve({canceled: false, filename: filename, design: design})
            })             
        })
    }

    export const discardConfirmation = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            alert('OCD Design has been modified, changes will be lost.')
            resolve(true)
        })
    }
}
