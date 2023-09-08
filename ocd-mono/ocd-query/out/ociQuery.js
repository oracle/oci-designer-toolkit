import * as common from 'oci-common';
import { paginatedRecordsWithLimit } from "oci-common";
import * as identity from "oci-identity";
import * as core from "oci-core";
import * as nosql from "oci-nosql";
export class OcdOCIQuery {
    constructor() { }
    query(request) {
        console.info('Querying', request);
        const parsed = common.ConfigFileReader.parseFileFromPath(request.configFilePath, null);
        // console.info(parsed)
        // console.info(parsed.accumulator.configurationsByProfile)
        // console.info(Array.from(parsed.accumulator.configurationsByProfile.keys()))
        const provider = new common.ConfigFileAuthenticationDetailsProvider(request.configFilePath, request.profile);
        const identityClient = new identity.IdentityClient({ authenticationDetailsProvider: provider });
        const computeClient = new core.ComputeClient({ authenticationDetailsProvider: provider });
        const virtualNetworkClient = new core.VirtualNetworkClient({ authenticationDetailsProvider: provider });
        const nosqlClient = new nosql.NosqlClient({ authenticationDetailsProvider: provider });
        const getCompartmentReq = { compartmentId: request.compartmentId };
        const listCompartmentsReq = { compartmentId: request.compartmentId };
        const listInstancesReq = { compartmentId: request.compartmentId };
        const listVnicAttachmentsReq = { compartmentId: request.compartmentId };
        const listVcnsReq = { compartmentId: request.compartmentId };
        const listSubnetsReq = { compartmentId: request.compartmentId };
        const listNoSQLTablesReq = { compartmentId: request.compartmentId };
        const listRegionsRequest = {};
        // const listNoSQLIndexesReq: nosql.requests.ListIndexesRequest = {compartmentId: request.compartmentId, tableNameOrId: 'ocid1.nosqltable.oc1.uk-london-1.amaaaaaaxoesbjia3jg3dqenn3qigkbjy7evusejssavsq3nik6fmjpyy7ra'}
        // let compartmentEagerLoad = await paginatedRecordsWithLimit(listCompartmentsReq, req => identityClient.listCompartments(listCompartmentsReq))
        // compartmentEagerLoad.forEach(r => console.info('Compartment :', r.value.name, typeof r.value, r.value))
        // paginatedRecordsWithLimit(listCompartmentsReq, req => identityClient.listCompartments(listCompartmentsReq)).then(resp => {
        //   console.info('Response', resp)
        // })
        // const compartmentQuery = paginatedRecordsWithLimit(listCompartmentsReq, req => identityClient.listCompartments(listCompartmentsReq))
        const compartmentQuery = identityClient.listCompartments(listCompartmentsReq);
        const instanceQuery = paginatedRecordsWithLimit(listInstancesReq, req => computeClient.listInstances(listInstancesReq));
        const vnicAttachmentsQuery = paginatedRecordsWithLimit(listVnicAttachmentsReq, req => computeClient.listVnicAttachments(listVnicAttachmentsReq));
        const vcnQuery = paginatedRecordsWithLimit(listVcnsReq, req => virtualNetworkClient.listVcns(listVcnsReq));
        // const regionsQuery = paginatedRecordsWithLimit(listRegionsRequest, req => identityClient.listRegions(listRegionsRequest))
        const regionsQuery = identityClient.listRegions(listRegionsRequest);
        // const subnetQuery = paginatedRecordsWithLimit(listSubnetsReq, req => virtualNetworkClient.listSubnets(listSubnetsReq))
        // const nosqlTablesQuery = nosqlClient.listTables(listNoSQLTablesReq)
        // const nosqlTablesQuery = paginatedRecordsWithLimit(listNoSQLTablesReq, req => nosqlClient.listTables(listNoSQLTablesReq))
        // const nosqlIndexesQuery = paginatedRecordsWithLimit(listNoSQLIndexesReq, req => nosqlClient.listIndexes(listNoSQLIndexesReq))
        // Promise.allSettled([compartmentQuery, vcnQuery, instanceQuery, subnetQuery, nosqlTablesQuery]).then((results) => {
        Promise.allSettled([regionsQuery, compartmentQuery, instanceQuery, vnicAttachmentsQuery, vcnQuery]).then((results) => {
            // console.info('Results:', results)
            if (results[0].status === 'fulfilled')
                console.info('Results 0:', JSON.stringify(results[0].value, null, 4));
            if (results[1].status === 'fulfilled')
                console.info('Results 0:', JSON.stringify(results[1].value, null, 4));
            // if (results[1].status === 'fulfilled') console.info('Results 1:', results[1].value)
            // if (results[2].status === 'fulfilled') console.info('Results 2:', results[2].value)
            // if (results[3].status === 'fulfilled') console.info('Results 3:', results[3].value)
            // if (results[3].status === 'fulfilled') results[3].value.forEach((v) => console.info('Json:', typeof v.value))
            // if (results[0].status === 'fulfilled') results[0].value.forEach((v) => console.info('Json:', typeof v.value))
        });
    }
}
