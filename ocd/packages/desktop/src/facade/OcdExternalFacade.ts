/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export namespace OcdExternalFacade {
    export const openExternalUrl = (href: string): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.openExternalUrl(href) : new Promise((resolve, reject) => {reject('Currently Not Implemented')})
    }
}