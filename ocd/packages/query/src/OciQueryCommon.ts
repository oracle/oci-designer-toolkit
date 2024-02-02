/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export class OciCommonQuery {
    getAllResponseData(responseIterator: AsyncIterableIterator<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            const query = async (responseIterator: AsyncIterableIterator<any>) => {
                let done = false
                let resources: any[] = []
                while (!done) {
                    const response = await responseIterator.next()
                    done = response.done !== undefined ? response.done : true
                    if (response.value) resources = [...resources, ...response.value.items]
                }
                return resources
            }
            query(responseIterator).then((results) => {
                console.debug('OciCommonQuery: getAllResponseData: All Settled')
                resolve(results)
            })
        })
    }
}

export default OciCommonQuery
module.exports = { OciQuery: OciCommonQuery }
