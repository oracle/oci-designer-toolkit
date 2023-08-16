/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import * as common from 'oci-common'
import * as identity from "oci-identity"
// const common = require ('oci-common')
// const identity = require ("oci-identity")

class OciQuery {
    profile
    provider
    identityClient: identity.IdentityClient
    constructor(profile: string='DEFAULT') {
        this.profile = profile
        this.provider = new common.ConfigFileAuthenticationDetailsProvider(undefined, profile)
        this.identityClient = new identity.IdentityClient({ authenticationDetailsProvider: this.provider })
    }

    regionNameToDisplayName = (name: string) => {
        const nameParts = name.split('-')
        const region = nameParts[0].toUpperCase()
        const city = `${nameParts[1].charAt(0).toUpperCase()}${nameParts[1].substring(1).toLowerCase()}`
        const displayName = `${region} ${city}`
        return displayName
    }

    listRegions() {
        return new Promise((resolve, reject) => {
            if (!this.identityClient) this.identityClient = new identity.IdentityClient({ authenticationDetailsProvider: this.provider })
            const listRegionsRequest: identity.requests.ListRegionsRequest = {}
            const regionsQuery = this.identityClient.listRegions(listRegionsRequest)
            Promise.allSettled([regionsQuery]).then((results) => {
                // @ts-ignore 
                const sorter = (a, b) => a.displayName.localeCompare(b.displayName)
                if (results[0].status === 'fulfilled') {
                    const resources = results[0].value.items.map((r) => {return {id: r.name, displayName: this.regionNameToDisplayName(r.name as string), ...r}}).sort(sorter).reverse()
                    resolve(resources)
                } else {
                    reject('Regions Query Failed')
                }
            })
        })
    }

    listTenancyCompartments() {
        return new Promise((resolve, reject) => {
            if (!this.identityClient) this.identityClient = new identity.IdentityClient({ authenticationDetailsProvider: this.provider })
            const listCompartmentsReq: identity.requests.ListCompartmentsRequest = {compartmentId: this.provider.getTenantId(), compartmentIdInSubtree: true}
            const compartmentQuery = this.identityClient.listCompartments(listCompartmentsReq)
            Promise.allSettled([compartmentQuery]).then((results) => {
                if (results[0].status === 'fulfilled') {
                    const resources = results[0].value.items.map((c) => {return {...c, root: c.compartmentId.startsWith('ocid1.tenancy')}})
                    console.debug('Main: Tenancy Compartments', resources)
                    resolve(resources)
                } else {
                    reject('All Compartments Query Failed')
                }
            })
        })
    }
}

export default OciQuery
module.exports = { OciQuery }
