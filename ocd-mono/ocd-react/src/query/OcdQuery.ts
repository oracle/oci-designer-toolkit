/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import * as common from 'oci-common'
import * as identity from "oci-identity"

export namespace OcdQuery {
    export function getOciProvider(configFile: any, profile: string = 'DEFAULT'): common.SimpleAuthenticationDetailsProvider {
        console.debug('OcdQuery:', configFile)
        console.debug('OcdQuery:', configFile.accumulator.configurationsByProfile)
        console.debug('OcdQuery:', Array.from(configFile.accumulator.configurationsByProfile.keys()))    
        console.debug('OcdQuery:', configFile.accumulator.configurationsByProfile.get('DEFAULT'))    
        const config = configFile.accumulator.configurationsByProfile.get(profile)
        console.debug('OcdQuery:', config)    
        const privateKey = ``
        return new common.SimpleAuthenticationDetailsProvider(
            config.get('tenancy', ''),
            config.get('user', ''),
            config.get('fingerprint', ''),
            // config.get('key_file', ''),
            privateKey,
            config.get('passphrase', null),
            config.get('region', '')
          )
    }
    export function getRegions(provider: common.SimpleAuthenticationDetailsProvider): Promise<any> {
        const identityClient = new identity.IdentityClient({ authenticationDetailsProvider: provider });
        const listRegionsRequest: identity.requests.ListRegionsRequest = {}
        return identityClient.listRegions(listRegionsRequest)
        // return new Promise((resolve, reject) => {})
    }
}

