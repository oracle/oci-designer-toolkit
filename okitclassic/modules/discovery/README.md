# OCI Optimized Cross Region Resource Discovery

Experimental optimated method of extracting resources from an OCI tenancy.

The OCI resource APIs are compartment centric, to query for resources within a
tenancy requires interating through each compartment of the compoartment
hierarchy to query for each specific resource type within the compartment. With
with a growing number of OCI resource across multiple compartment in multiple
regions, a manual (resource_type * compartment * region) search approach is
very inefficient.

This implementation uses a method to query all resource in parallel
across all regions using an optimized set of compartment and resource queries.

## Discovery method

### Phase 1: Bulk query

Use the search API to rapidly fetch all resources supported by search in the
region

1. Construct a search query for all "searchable" resources types that can be
   queried through the search api.  
2. Run the search query in parallel across multiple tenacies and gather all the
   results by region. 

### Phase 2: List resource per compartment

The search results provide a summary of eash resource found, we could use this
list to query each resource individualy for it's specific attributes, but its
more efficient to list all resources of a specific resource type within a
compartment, so we build up a list of compartments in each region that contain
specific resource types and then execute each list resources method per
compartment.

1. Create a map of `resource_type` -> `compartment_id` in each region
2. For each compartment with resources, run the appropriate list resources
   method to fetch the resource details 

### Phase 3: Add missing resources

Not all resources types are available from the search query results. For
resources not supported by search we need to find them by listing the resource
in either the compartment, or by their parent resource type.  

1. Create a `resource_type` -> `compartment_id` map for each resource type that
   could be expected to be in a compartment based on the presense of the parent
   or associated resource.

## Phase 4: Get child resources

