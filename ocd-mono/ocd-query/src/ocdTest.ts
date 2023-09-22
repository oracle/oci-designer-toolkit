import { OciQueryRequest, OcdOCIQuery } from "./ociQuery.js"

const configFile: string = '~/.oci/config'
const profile: string = 'DEFAULT'
const ocid: string = 'ocid1.compartment.oc1..aaaaaaaahfphdahj2rbwq5v6foe4huvsb7qa4gxzxib5iaq75jez54qeem6q'
const request: OciQueryRequest = {
    configFilePath: configFile,
    profile: profile,
    compartmentId: ocid
}
const ociQuery: OcdOCIQuery = new OcdOCIQuery()

ociQuery.query(request)
