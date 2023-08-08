/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import * as common from 'oci-common'

export namespace OcdQuery {
    export function getOciConfigProfiles(): Promise<any> {
        // const profiles: string[] = []
        // return profiles
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            const configFile = '~/.oci/config'
            reader.onload = config => {
                let profiles: string[] = []
                if (config.target && config.target.result) {
                    const contents = config.target.result
                    console.info('OcdQuery: Config File', contents)
                    const parsed = common.ConfigFileReader.parse(contents as string, null)
                    console.info(parsed)
                    console.info(parsed.accumulator.configurationsByProfile)
                    console.info(Array.from(parsed.accumulator.configurationsByProfile.keys()))
                }
                resolve(profiles)
            }
            reader.onerror = error => reject(error)
            // reader.readAsText(configFile, 'utf-8')
        })
    }
}
// function readFile(file) {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
  
//       reader.onload = res => {
//         resolve(res.target.result);
//       };
//       reader.onerror = err => reject(err);
  
//       reader.readAsText(file);
//     });
//   }