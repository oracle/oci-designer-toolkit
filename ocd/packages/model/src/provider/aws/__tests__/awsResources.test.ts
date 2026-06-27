/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, it, expect } from 'vitest'
import * as AwsModelResources from '../resources.js'

describe('AwsModelResources namespaces', () => {
    it('exposes all 19 self-contained AWS resource namespaces', () => {
        expect(AwsModelResources.AwsVpc).toBeDefined()
        expect(AwsModelResources.AwsSubnet).toBeDefined()
        expect(AwsModelResources.AwsInternetGateway).toBeDefined()
        expect(AwsModelResources.AwsSecurityGroup).toBeDefined()
        expect(AwsModelResources.AwsInstance).toBeDefined()
        expect(AwsModelResources.AwsRouteTable).toBeDefined()
        expect(AwsModelResources.AwsNatGateway).toBeDefined()
        expect(AwsModelResources.AwsS3Bucket).toBeDefined()
        expect(AwsModelResources.AwsEbsVolume).toBeDefined()
        expect(AwsModelResources.AwsRdsInstance).toBeDefined()
        expect(AwsModelResources.AwsLoadBalancer).toBeDefined()
        expect(AwsModelResources.AwsIamRole).toBeDefined()
        expect(AwsModelResources.AwsLambdaFunction).toBeDefined()
        expect(AwsModelResources.AwsCloudfrontDistribution).toBeDefined()
        expect(AwsModelResources.AwsSnsTopic).toBeDefined()
        expect(AwsModelResources.AwsSqsQueue).toBeDefined()
        expect(AwsModelResources.AwsEcsCluster).toBeDefined()
        expect(AwsModelResources.AwsApiGateway).toBeDefined()
        expect(AwsModelResources.AwsDynamodbTable).toBeDefined()
    })
})

describe('cdn, messaging, containers, serverless AWS resources', () => {
    it('AwsCloudfrontDistribution is top-level with an origin', () => {
        const cf = AwsModelResources.AwsCloudfrontDistribution.newResource()
        expect(cf.resourceType).toBe('CloudfrontDistribution')
        expect(cf.originDomain).toBe('')
        expect(AwsModelResources.AwsCloudfrontDistribution.allowedParentTypes()).toEqual([])
    })
    it('AwsSnsTopic and AwsSqsQueue default to standard (non-fifo)', () => {
        expect(AwsModelResources.AwsSnsTopic.newResource().fifo).toBe(false)
        expect(AwsModelResources.AwsSqsQueue.newResource().fifo).toBe(false)
        expect(AwsModelResources.AwsSnsTopic.newResource().resourceType).toBe('SnsTopic')
        expect(AwsModelResources.AwsSqsQueue.newResource().resourceType).toBe('SqsQueue')
    })
    it('AwsEcsCluster parents to a Vpc with a launch type', () => {
        const ecs = AwsModelResources.AwsEcsCluster.newResource()
        expect(ecs.resourceType).toBe('EcsCluster')
        expect(ecs.launchType).toBe('FARGATE')
        expect(AwsModelResources.AwsEcsCluster.allowedParentTypes()).toContain('Vpc')
    })
    it('AwsApiGateway and AwsDynamodbTable have sensible defaults', () => {
        expect(AwsModelResources.AwsApiGateway.newResource().protocolType).toBe('HTTP')
        expect(AwsModelResources.AwsDynamodbTable.newResource().billingMode).toBe('PAY_PER_REQUEST')
        expect(AwsModelResources.AwsApiGateway.newResource().resourceType).toBe('ApiGateway')
        expect(AwsModelResources.AwsDynamodbTable.newResource().resourceType).toBe('DynamodbTable')
    })
})

describe('compute, database, identity AWS resources', () => {
    it('AwsRdsInstance parents to a Subnet with engine defaults', () => {
        const rds = AwsModelResources.AwsRdsInstance.newResource()
        expect(rds.resourceType).toBe('RdsInstance')
        expect(rds.engine).toBe('postgres')
        expect(rds.instanceClass).toBe('db.t3.micro')
        expect(AwsModelResources.AwsRdsInstance.allowedParentTypes()).toContain('Subnet')
    })
    it('AwsLoadBalancer parents to a Vpc with a scheme', () => {
        const lb = AwsModelResources.AwsLoadBalancer.newResource()
        expect(lb.resourceType).toBe('LoadBalancer')
        expect(lb.scheme).toBe('internet-facing')
        expect(AwsModelResources.AwsLoadBalancer.allowedParentTypes()).toContain('Vpc')
    })
    it('AwsIamRole is top-level', () => {
        const role = AwsModelResources.AwsIamRole.newResource()
        expect(role.resourceType).toBe('IamRole')
        expect(AwsModelResources.AwsIamRole.allowedParentTypes()).toEqual([])
    })
    it('AwsLambdaFunction has runtime/handler defaults', () => {
        const fn = AwsModelResources.AwsLambdaFunction.newResource()
        expect(fn.resourceType).toBe('LambdaFunction')
        expect(fn.runtime).toBe('python3.12')
        expect(fn.handler).toBe('index.handler')
    })
})

describe('new AWS resource namespaces', () => {
    it('AwsRouteTable parents to a Vpc', () => {
        const rt = AwsModelResources.AwsRouteTable.newResource()
        expect(rt.provider).toBe('aws')
        expect(rt.resourceType).toBe('RouteTable')
        expect(rt.vpcId).toBe('')
        expect(AwsModelResources.AwsRouteTable.allowedParentTypes()).toContain('Vpc')
    })
    it('AwsNatGateway parents to a Subnet', () => {
        const nat = AwsModelResources.AwsNatGateway.newResource()
        expect(nat.resourceType).toBe('NatGateway')
        expect(nat.subnetId).toBe('')
        expect(AwsModelResources.AwsNatGateway.allowedParentTypes()).toContain('Subnet')
    })
    it('AwsS3Bucket is a top-level resource', () => {
        const bucket = AwsModelResources.AwsS3Bucket.newResource()
        expect(bucket.resourceType).toBe('S3Bucket')
        expect(bucket.bucketName).toBe('')
        expect(AwsModelResources.AwsS3Bucket.allowedParentTypes()).toEqual([])
    })
    it('AwsEbsVolume has a default size', () => {
        const vol = AwsModelResources.AwsEbsVolume.newResource()
        expect(vol.resourceType).toBe('EbsVolume')
        expect(vol.sizeGb).toBe(8)
        expect(vol.availabilityZone).toBe('')
    })
})

describe('AwsVpc.newResource', () => {
    it('returns an aws-provider resource with an id and cidrBlock field', () => {
        const vpc = AwsModelResources.AwsVpc.newResource()
        expect(vpc.provider).toBe('aws')
        expect(vpc.id).not.toBe('')
        expect(vpc.cidrBlock).toBe('')
        expect(vpc.resourceType).toBe('Vpc')
    })
})

describe('AwsSubnet.newResource', () => {
    it('returns an aws-provider resource with vpcId and cidrBlock fields', () => {
        const subnet = AwsModelResources.AwsSubnet.newResource()
        expect(subnet.provider).toBe('aws')
        expect(subnet.id).not.toBe('')
        expect(subnet.vpcId).toBe('')
        expect(subnet.cidrBlock).toBe('')
    })
})

describe('AwsInternetGateway.newResource', () => {
    it('returns an aws-provider resource with a vpcId field', () => {
        const igw = AwsModelResources.AwsInternetGateway.newResource()
        expect(igw.provider).toBe('aws')
        expect(igw.id).not.toBe('')
        expect(igw.vpcId).toBe('')
    })
})

describe('AwsSecurityGroup.newResource', () => {
    it('returns an aws-provider resource with vpcId and description fields', () => {
        const sg = AwsModelResources.AwsSecurityGroup.newResource()
        expect(sg.provider).toBe('aws')
        expect(sg.id).not.toBe('')
        expect(sg.vpcId).toBe('')
        expect(typeof sg.description).toBe('string')
    })
})

describe('AwsInstance.newResource', () => {
    it('returns an aws-provider resource with subnetId, ami and a default instanceType', () => {
        const instance = AwsModelResources.AwsInstance.newResource()
        expect(instance.provider).toBe('aws')
        expect(instance.id).not.toBe('')
        expect(instance.subnetId).toBe('')
        expect(instance.ami).toBe('')
        expect(instance.instanceType).toBe('t3.micro')
    })
})

describe('AwsVpc.newResource uniqueness', () => {
    it('assigns a unique id per resource', () => {
        const a = AwsModelResources.AwsVpc.newResource()
        const b = AwsModelResources.AwsVpc.newResource()
        expect(a.id).not.toBe(b.id)
    })
})
