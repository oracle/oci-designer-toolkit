/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

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
                    return contents
                } catch (err: any) {
                    console.error(err.name, err.message)
                    throw err
                }
            }
            openFile().then((resp) => {
                resolve({canceled: false, filename: '', design: JSON.parse(resp)})
            }).catch((reason) => {
                console.debug(reason)
                reject(reason)
            })
        })
    }
}
