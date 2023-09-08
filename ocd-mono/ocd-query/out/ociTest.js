import * as common from 'oci-common';
import { paginatedRecordsWithLimit } from "oci-common";
import { ResourceSearchClient } from "oci-resourcesearch";
import * as resourceSearch from "oci-resourcesearch";
import * as identity from "oci-identity";
import * as nosql from "oci-nosql";
let message = 'Hello World';
console.info(message);
const configurationFilePath = "~/.oci/config";
const profile = "ocicpm";
const provider = new common.ConfigFileAuthenticationDetailsProvider(configurationFilePath, profile);
let searchClient;
const compartmentId = provider.getTenantId();
async function resourceType() {
    console.log(`
     \n
     Resources and their fields
     ==========================
   `);
    const response = await searchClient.listResourceTypes({});
    for (let i = 0; i < response.items.length; i++) {
        console.log(response.items[i].name);
        for (let j = 0; j < response.items[i].fields.length; j++) {
            console.log(`\t ${response.items[i].fields[j].fieldName} ${response.items[i].fields[j].fieldType}`);
        }
    }
}
async function fieldsInInstanceResource() {
    // A more detailed look at the freeformTags field in the Instance resource
    console.log(`
     \n
     Instance resource, freeformTags fields
     ======================================
   `);
    const response = await searchClient.listResourceTypes({});
    // console.log("my response: ", response);
    for (let i = 0; i < response.items.length; i++) {
        if (response.items[i].name === "Instance") {
            for (let j = 0; j < response.items[i].fields.length; j++) {
                console.log(response.items[i].fields[j]);
            }
        }
    }
}
async function fieldNamesInInstanceResource() {
    // The details for a single resource type can be retrieved without
    // retrieving all the resources.
    console.log(`
     \n
     Get a single resource type (Instance) from Search service
     =========================================================
   `);
    const getResourceTypeRequest = {
        name: "Instance"
    };
    const instance = (await searchClient.getResourceType(getResourceTypeRequest)).resourceType;
    const fields = instance.fields.map(field => {
        return field.fieldName;
    });
    console.log(fields);
}
async function activeUsers() {
    console.log(`
     \n
     Get users which are active, using StructuredSearchDetails
     =========================================================
   `);
    const structuredSearch = {
        query: "query user resources where inactiveStatus = 0",
        type: "Structured",
        matchingContextType: resourceSearch.models.SearchDetails.MatchingContextType.None
    };
    const structuredSearchRequest = {
        searchDetails: structuredSearch
    };
    const users = await searchClient.searchResources(structuredSearchRequest);
    if (users.resourceSummaryCollection && users.resourceSummaryCollection.items) {
        users.resourceSummaryCollection.items.forEach(user => {
            console.log(user.displayName);
        });
    }
}
async function searchWithFreeText() {
    // Get all resources whose lifecycleState is AVAILABLE
    console.log("Get resources which are available, using FreeTextSearchDetails");
    console.log("==============================================================");
    const freeTextSearch = {
        text: "lifecycleState as AVAILABLE",
        type: "FreeText",
        matchingContextType: resourceSearch.models.SearchDetails.MatchingContextType.Highlights
    };
    const SearchResourcesRequest = {
        searchDetails: freeTextSearch
    };
    const response = await searchClient.searchResources(SearchResourcesRequest);
    for (let i = 0; i < response.resourceSummaryCollection.items.length; i++) {
        const { resourceType, displayName } = response.resourceSummaryCollection.items[i];
        console.log(`Resource type: ${resourceType}, Resource name: ${displayName}`);
    }
}
async function userByFreeformTag(tag) {
    console.log(`
     Get users based on having a freeformTag
     =======================================
   `);
    const structuredSearch = {
        query: `query user resources where freeformTags.key = '${tag}'`,
        type: "Structured",
        matchingContextType: resourceSearch.models.SearchDetails.MatchingContextType.None
    };
    const structuredSearchRequest = {
        searchDetails: structuredSearch
    };
    const users = await searchClient.searchResources(structuredSearchRequest);
    if (users.resourceSummaryCollection && users.resourceSummaryCollection.items) {
        for (let i = 0; i < users.resourceSummaryCollection.items.length; i++) {
            console.log(users.resourceSummaryCollection.items[i]);
        }
    }
}
async function usersByFreeformTagAndValue(tag, value) {
    console.log(`
     Get users based on having a freeformTag which matches a value
     =============================================================
   `);
    const structuredSearch = {
        query: `query user resources where (freeformTags.key = '${tag}' && freeformTags.value = '${value}')`,
        type: "Structured",
        matchingContextType: resourceSearch.models.SearchDetails.MatchingContextType.None
    };
    const structuredSearchRequest = {
        searchDetails: structuredSearch
    };
    const users = await searchClient.searchResources(structuredSearchRequest);
    if (users.resourceSummaryCollection && users.resourceSummaryCollection.items) {
        for (let i = 0; i < users.resourceSummaryCollection.items.length; i++) {
            console.log(users.resourceSummaryCollection.items[i]);
        }
    }
}
(async () => {
    searchClient = new ResourceSearchClient({
        authenticationDetailsProvider: provider
    });
    await resourceType();
    //  await fieldsInInstanceResource();
    await fieldNamesInInstanceResource();
    //  await activeUsers();
    //  await searchWithFreeText();
    // These next examples need to be customized to your situation.
    // Let's assume you added a freeform tag "role" to some of your users and
    // one of the values is "developer".  Then you could replace the
    // <your_tag_here> with role and <your_value_here> with developer.
    // These examples will then retrieve every user that had the role freeform tag
    // and the role freeform tag where the value is set to developer.
    // userByFreeformTag("<your_tag_here>")
    //    await userByFreeformTag("okit_version");
    //    await usersByFreeformTagAndValue("okit_version", "0.38.0");
    const identityClient = new identity.IdentityClient({ authenticationDetailsProvider: provider });
    let listUserReq;
    listUserReq = {
        compartmentId: compartmentId
    };
    /*
    This demonstrates the eager loading of all possible results.
    This will return an oci response whose data attribute contains
    a list of all results.
    */
    console.log("---testing load all compartments---");
    const listCompartmentsRequest = {
        compartmentId: compartmentId
    };
    let compartmentsList = await identityClient.listAllCompartments(listCompartmentsRequest);
    console.log("comartmentsList: ", compartmentsList);
    const listCompartmentsReq = { compartmentId: compartmentId, compartmentIdInSubtree: true };
    let compartmentEagerLoad = await paginatedRecordsWithLimit(listCompartmentsReq, req => identityClient.listCompartments(listCompartmentsReq));
    compartmentEagerLoad.forEach(r => console.info(`Compartment: ${r.value.name} ${typeof r.value} ${r.value}`));
    console.log("--- Eager load all results ---");
    let eagerLoad = await paginatedRecordsWithLimit(listUserReq, req => identityClient.listUsers(listUserReq));
    eagerLoad.forEach(e => {
        console.log(`User: ${e.value.name} ${e.value.email}`);
    });
    console.log("Total Records: ", eagerLoad.length);
    const nosqlClient = new nosql.NosqlClient({ authenticationDetailsProvider: provider });
    const listTablesRequest = { compartmentId: compartmentId };
    // Send request to the Client.
    const listTablesResponse = await nosqlClient.listTables(listTablesRequest);
    console.log('NoSQL Tables:', listTablesResponse);
})();
