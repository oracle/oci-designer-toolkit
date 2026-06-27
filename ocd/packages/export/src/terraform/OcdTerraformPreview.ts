/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/**
 * Per-resource Terraform HCL preview utilities.
 *
 * This module provides a pure helper function that generates the Terraform HCL
 * for a single design resource (identified by its model ID), reusing the same
 * per-resource generators that the full OcdTerraformExporter uses.  The result
 * is consumed by the Designer properties-panel "Terraform" tab (OcdProperties.tsx).
 */

import { OcdUtils } from '@ocd/core'
import { OcdDesign, OcdResource } from '@ocd/model'
import * as OciTerraformResources from './provider/oci/resources.js'
import * as AzureTerraformResources from './provider/azure/resources.js'
import * as GoogleTerraformResources from './provider/google/resources.js'

/** Subset of OcdResource shape needed to drive the preview. */
interface PreviewableResource extends OcdResource {
    terraformResourceName: string
}

/**
 * Build the id → terraformResourceName map for all resources in the design,
 * covering all three providers.  This map is required by the per-resource
 * generators so they can resolve cross-resource references.
 */
function buildIdTFResourceMap(design: OcdDesign): Record<string, string> {
    return OcdDesign.getResources(design).reduce(
        (acc, r) => {
            const res = r as PreviewableResource
            if (res.id && res.terraformResourceName) {
                acc[res.id] = res.terraformResourceName
            }
            return acc
        },
        {} as Record<string, string>
    )
}

/**
 * Generate the Terraform HCL block for a single resource identified by
 * `resourceId`.  The `design` is required to resolve cross-resource
 * references used by the generator (e.g. compartment_id lookups).
 *
 * Returns the HCL string on success, or throws with a descriptive message on
 * failure (unknown provider, unsupported resource type, generator error).
 *
 * @pure — does not mutate `design` or the resource objects.
 */
export function getResourceTerraformHcl(design: OcdDesign, resourceId: string): string {
    // Find the resource across all providers.
    const allResources = OcdDesign.getResources(design)
    const resource = allResources.find((r) => r.id === resourceId)
    if (!resource) {
        throw new Error(`Resource with id "${resourceId}" not found in design.`)
    }

    const idTFResourceMap = buildIdTFResourceMap(design)
    const provider: string = resource.provider ?? ''
    const resourceType: string = resource.resourceType ?? ''
    const className = OcdUtils.toClassName(
        provider.charAt(0).toUpperCase() + provider.slice(1),
        resourceType
    )

    let tfResource: { generate: (r: OcdResource, d: OcdDesign) => string }

    switch (provider) {
        case 'oci': {
            // @ts-ignore — dynamic resource registry lookup
            const Ctor = OciTerraformResources[className]
            if (!Ctor) {
                throw new Error(
                    `No OCI Terraform generator registered for resource type "${resourceType}" (class "${className}").`
                )
            }
            tfResource = new Ctor(resource, idTFResourceMap)
            break
        }
        case 'azure': {
            // @ts-ignore
            const Ctor = AzureTerraformResources[className]
            if (!Ctor) {
                throw new Error(
                    `No Azure Terraform generator registered for resource type "${resourceType}" (class "${className}").`
                )
            }
            tfResource = new Ctor(resource, idTFResourceMap)
            break
        }
        case 'google': {
            // @ts-ignore
            const Ctor = GoogleTerraformResources[className]
            if (!Ctor) {
                throw new Error(
                    `No Google Terraform generator registered for resource type "${resourceType}" (class "${className}").`
                )
            }
            tfResource = new Ctor(resource, idTFResourceMap)
            break
        }
        default:
            throw new Error(
                `Unsupported provider "${provider}" for Terraform HCL preview.`
            )
    }

    return tfResource.generate(resource, design)
}
