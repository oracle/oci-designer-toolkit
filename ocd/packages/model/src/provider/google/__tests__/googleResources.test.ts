/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, it, expect } from 'vitest'
import * as GoogleModelResources from '../resources.js'

describe('GoogleModelResources namespaces', () => {
    it('exposes the 5 new self-contained Google resource namespaces', () => {
        expect(GoogleModelResources.GoogleComputeSubnetwork).toBeDefined()
        expect(GoogleModelResources.GoogleComputeInstance).toBeDefined()
        expect(GoogleModelResources.GoogleComputeFirewall).toBeDefined()
        expect(GoogleModelResources.GoogleStorageBucket).toBeDefined()
        expect(GoogleModelResources.GoogleComputeRouter).toBeDefined()
    })
})

describe('GoogleComputeSubnetwork.newResource', () => {
    it('returns a google-provider resource with network/ipCidrRange/region and parents to a ComputeNetwork', () => {
        const subnet = GoogleModelResources.GoogleComputeSubnetwork.newResource()
        expect(subnet.provider).toBe('google')
        expect(subnet.id).not.toBe('')
        expect(subnet.resourceType).toBe('ComputeSubnetwork')
        expect(subnet.network).toBe('')
        expect(subnet.ipCidrRange).toBe('')
        expect(subnet.region).toBe('')
        expect(GoogleModelResources.GoogleComputeSubnetwork.allowedParentTypes()).toContain('ComputeNetwork')
    })
    it('setParentId writes the network reference and getParentId reads it back', () => {
        const subnet = GoogleModelResources.GoogleComputeSubnetwork.newResource()
        GoogleModelResources.GoogleComputeSubnetwork.setParentId(subnet, 'vpc-ref')
        expect(subnet.network).toBe('vpc-ref')
        expect(GoogleModelResources.GoogleComputeSubnetwork.getParentId(subnet)).toBe('vpc-ref')
    })
})

describe('GoogleComputeInstance.newResource', () => {
    it('returns a google-provider resource with subnetwork/zone/bootImage and a default machineType', () => {
        const instance = GoogleModelResources.GoogleComputeInstance.newResource()
        expect(instance.provider).toBe('google')
        expect(instance.id).not.toBe('')
        expect(instance.resourceType).toBe('ComputeInstance')
        expect(instance.subnetwork).toBe('')
        expect(instance.zone).toBe('')
        expect(instance.bootImage).toBe('')
        expect(instance.machineType).toBe('e2-medium')
        expect(GoogleModelResources.GoogleComputeInstance.allowedParentTypes()).toContain('ComputeSubnetwork')
    })
})

describe('GoogleComputeFirewall.newResource', () => {
    it('returns a google-provider resource with network/description and a default direction', () => {
        const firewall = GoogleModelResources.GoogleComputeFirewall.newResource()
        expect(firewall.provider).toBe('google')
        expect(firewall.id).not.toBe('')
        expect(firewall.resourceType).toBe('ComputeFirewall')
        expect(firewall.network).toBe('')
        expect(firewall.direction).toBe('INGRESS')
        expect(typeof firewall.description).toBe('string')
        expect(GoogleModelResources.GoogleComputeFirewall.allowedParentTypes()).toContain('ComputeNetwork')
    })
})

describe('GoogleStorageBucket.newResource', () => {
    it('returns a top-level google-provider resource with location/storageClass defaults', () => {
        const bucket = GoogleModelResources.GoogleStorageBucket.newResource()
        expect(bucket.provider).toBe('google')
        expect(bucket.id).not.toBe('')
        expect(bucket.resourceType).toBe('StorageBucket')
        expect(bucket.location).toBe('US')
        expect(bucket.storageClass).toBe('STANDARD')
        expect(GoogleModelResources.GoogleStorageBucket.allowedParentTypes()).toEqual([])
    })
})

describe('GoogleComputeRouter.newResource', () => {
    it('returns a google-provider resource with network/region/description and parents to a ComputeNetwork', () => {
        const router = GoogleModelResources.GoogleComputeRouter.newResource()
        expect(router.provider).toBe('google')
        expect(router.id).not.toBe('')
        expect(router.resourceType).toBe('ComputeRouter')
        expect(router.network).toBe('')
        expect(router.region).toBe('')
        expect(typeof router.description).toBe('string')
        expect(GoogleModelResources.GoogleComputeRouter.allowedParentTypes()).toContain('ComputeNetwork')
    })
})

describe('Google resource id uniqueness', () => {
    it('assigns a unique id per resource', () => {
        const a = GoogleModelResources.GoogleComputeSubnetwork.newResource()
        const b = GoogleModelResources.GoogleComputeSubnetwork.newResource()
        expect(a.id).not.toBe(b.id)
    })
})
