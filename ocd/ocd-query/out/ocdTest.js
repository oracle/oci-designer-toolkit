import { OcdOCIQuery } from "./ociQuery.js";
const configFile = '~/.oci/config';
const profile = 'DEFAULT';
const ocid = 'ocid1.compartment.oc1..aaaaaaaahfphdahj2rbwq5v6foe4huvsb7qa4gxzxib5iaq75jez54qeem6q';
const request = {
    configFilePath: configFile,
    profile: profile,
    compartmentId: ocid
};
const ociQuery = new OcdOCIQuery();
ociQuery.query(request);
