import * as common from 'oci-common'
import { paginatedRecordsWithLimit, paginatedResponsesWithLimit } from "oci-common"
import { ResourceSearchClient } from "oci-resourcesearch"
import * as resourceSearch from "oci-resourcesearch"
import * as identity from "oci-identity"
import * as core from "oci-core"
import * as nosql from "oci-nosql"

export interface OciQueryRequest {
  configFilePath: string
  profile: string
  compartmentId: string
}

export class OcdOCIQuery {
  constructor() {}

  query(request: OciQueryRequest) {
    console.info('Querying', request)
    const provider: common.ConfigFileAuthenticationDetailsProvider = new common.ConfigFileAuthenticationDetailsProvider(request.configFilePath, request.profile)
    const identityClient = new identity.IdentityClient({ authenticationDetailsProvider: provider });
    const computeClient = new core.ComputeClient({ authenticationDetailsProvider: provider });
    const virtualNetworkClient = new core.VirtualNetworkClient({ authenticationDetailsProvider: provider });
    const nosqlClient = new nosql.NosqlClient({ authenticationDetailsProvider: provider });
    const getCompartmentReq: identity.requests.GetCompartmentRequest = {compartmentId: request.compartmentId}
    const listCompartmentsReq: identity.requests.ListCompartmentsRequest = {compartmentId: request.compartmentId}
    const listInstancesReq: core.requests.ListInstancesRequest = {compartmentId: request.compartmentId}
    const listVcnsReq: core.requests.ListVcnsRequest = {compartmentId: request.compartmentId}
    const listSubnetsReq: core.requests.ListSubnetsRequest = {compartmentId: request.compartmentId}
    const listNoSQLTablesReq: nosql.requests.ListTablesRequest = {compartmentId: request.compartmentId}
    // const listNoSQLIndexesReq: nosql.requests.ListIndexesRequest = {compartmentId: request.compartmentId, tableNameOrId: 'ocid1.nosqltable.oc1.uk-london-1.amaaaaaaxoesbjia3jg3dqenn3qigkbjy7evusejssavsq3nik6fmjpyy7ra'}
    // let compartmentEagerLoad = await paginatedRecordsWithLimit(listCompartmentsReq, req => identityClient.listCompartments(listCompartmentsReq))
    // compartmentEagerLoad.forEach(r => console.info('Compartment :', r.value.name, typeof r.value, r.value))
    // paginatedRecordsWithLimit(listCompartmentsReq, req => identityClient.listCompartments(listCompartmentsReq)).then(resp => {
    //   console.info('Response', resp)
    // })

    const compartmentQuery = paginatedRecordsWithLimit(listCompartmentsReq, req => identityClient.listCompartments(listCompartmentsReq))
    const instanceQuery = paginatedRecordsWithLimit(listInstancesReq, req => computeClient.listInstances(listInstancesReq))
    const vcnQuery = paginatedRecordsWithLimit(listVcnsReq, req => virtualNetworkClient.listVcns(listVcnsReq))
    const subnetQuery = paginatedRecordsWithLimit(listSubnetsReq, req => virtualNetworkClient.listSubnets(listSubnetsReq))
    // const nosqlTablesQuery = nosqlClient.listTables(listNoSQLTablesReq)
    const nosqlTablesQuery = paginatedRecordsWithLimit(listNoSQLTablesReq, req => nosqlClient.listTables(listNoSQLTablesReq))
    // const nosqlIndexesQuery = paginatedRecordsWithLimit(listNoSQLIndexesReq, req => nosqlClient.listIndexes(listNoSQLIndexesReq))
    Promise.allSettled([compartmentQuery, vcnQuery, instanceQuery, subnetQuery, nosqlTablesQuery]).then((results) => {
      console.info('Results:', results)
      if (results[0].status === 'fulfilled') console.info('Results 0:', results[0].value)
      if (results[1].status === 'fulfilled') console.info('Results 1:', results[1].value)
      if (results[2].status === 'fulfilled') console.info('Results 2:', results[2].value)
      if (results[3].status === 'fulfilled') console.info('Results 3:', results[3].value)
      if (results[3].status === 'fulfilled') results[3].value.forEach((v) => console.info('Json:', typeof v.value))
    })
  }
}
