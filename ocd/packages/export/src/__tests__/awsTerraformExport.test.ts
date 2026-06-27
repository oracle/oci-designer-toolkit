/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, it, expect } from 'vitest'
import { OcdDesign, AwsModelResources } from '@ocd/model'
import { OcdTerraformExporter } from '../terraform/OcdTerraformExporter.js'

// Build a minimal in-memory AWS design: VPC -> Subnet -> Instance plus an
// Internet Gateway and a Security Group attached to the VPC. Subnet.vpcId and
// Instance.subnetId point at the OCD-internal ids so the exporter emits direct
// aws_<type>.<name>.id references. All values are synthetic (public fork).
const buildAwsDesign = (): OcdDesign => {
    const design = OcdDesign.newDesign()
    design.metadata.separateIdentity = false

    const vpc = AwsModelResources.AwsVpc.newResource()
    vpc.displayName = 'Test Vpc'
    vpc.cidrBlock = '10.0.0.0/16'

    const subnet = AwsModelResources.AwsSubnet.newResource()
    subnet.displayName = 'Test Subnet'
    subnet.cidrBlock = '10.0.1.0/24'
    subnet.vpcId = vpc.id

    const internetGateway = AwsModelResources.AwsInternetGateway.newResource()
    internetGateway.displayName = 'Test IGW'
    internetGateway.vpcId = vpc.id

    const securityGroup = AwsModelResources.AwsSecurityGroup.newResource()
    securityGroup.displayName = 'Test SG'
    securityGroup.vpcId = vpc.id
    securityGroup.description = 'Test security group'

    const instance = AwsModelResources.AwsInstance.newResource()
    instance.displayName = 'Test Instance'
    instance.ami = '<ami-id>'
    instance.instanceType = 't3.micro'
    instance.subnetId = subnet.id

    design.model.aws = {
        vars: [],
        resources: {
            vpc: [vpc],
            subnet: [subnet],
            internet_gateway: [internetGateway],
            security_group: [securityGroup],
            instance: [instance]
        }
    }

    return design
}

describe('OcdTerraformExporter (AWS OcdDesign -> HCL)', () => {
    it('emits an aws_vpc resource block', () => {
        const exporter = new OcdTerraformExporter()
        exporter.export(buildAwsDesign())
        expect(exporter.terraform).toContain('resource "aws_vpc"')
    })

    it('emits an aws_subnet resource block', () => {
        const exporter = new OcdTerraformExporter()
        exporter.export(buildAwsDesign())
        expect(exporter.terraform).toContain('resource "aws_subnet"')
    })

    it('emits an aws_internet_gateway resource block', () => {
        const exporter = new OcdTerraformExporter()
        exporter.export(buildAwsDesign())
        expect(exporter.terraform).toContain('resource "aws_internet_gateway"')
    })

    it('emits an aws_security_group resource block', () => {
        const exporter = new OcdTerraformExporter()
        exporter.export(buildAwsDesign())
        expect(exporter.terraform).toContain('resource "aws_security_group"')
    })

    it('emits an aws_instance resource block', () => {
        const exporter = new OcdTerraformExporter()
        exporter.export(buildAwsDesign())
        expect(exporter.terraform).toContain('resource "aws_instance"')
    })

    it('emits a vpc_id reference from the subnet to the VPC', () => {
        const design = buildAwsDesign()
        const vpc = design.model.aws!.resources.vpc[0]
        const exporter = new OcdTerraformExporter()
        exporter.export(design)
        expect(exporter.terraform).toContain(`vpc_id = aws_vpc.${vpc.terraformResourceName}.id`)
    })

    it('emits a subnet_id reference from the instance to the subnet', () => {
        const design = buildAwsDesign()
        const subnet = design.model.aws!.resources.subnet[0]
        const exporter = new OcdTerraformExporter()
        exporter.export(design)
        expect(exporter.terraform).toContain(`subnet_id = aws_subnet.${subnet.terraformResourceName}.id`)
    })

    it('returns an OutputDataStringArray keyed by aws terraform filename', () => {
        const exporter = new OcdTerraformExporter()
        const outputData = exporter.export(buildAwsDesign())
        expect(Object.keys(outputData)).toContain('aws_networking.tf')
        expect(Object.keys(outputData)).toContain('aws_compute.tf')
        const networking = outputData['aws_networking.tf'].join('\n')
        expect(networking).toContain('resource "aws_vpc"')
        expect(networking).toContain('resource "aws_subnet"')
        const compute = outputData['aws_compute.tf'].join('\n')
        expect(compute).toContain('resource "aws_instance"')
    })
})
