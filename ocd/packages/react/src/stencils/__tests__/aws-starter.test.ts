/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, it, expect } from 'vitest'
import { validateStencilManifest, manifestToPaletteProvider } from '../OcdStencilRegistry'
import awsStarter from '../packs/aws-starter.json'

describe('AWS starter stencil pack', () => {
    it('validates as importable custom stencils', () => {
        const manifests = validateStencilManifest(awsStarter)
        expect(manifests).toHaveLength(19)
        for (const manifest of manifests) {
            expect(manifest.provider).toBe('custom')
            expect(manifest.class.startsWith('custom-aws-')).toBe(true)
            expect(manifest.svgIcon.length).toBeGreaterThan(0)
        }
    })

    it('covers the nineteen AWS model resources', () => {
        const classes = validateStencilManifest(awsStarter).map((m) => m.class)
        for (const expected of [
            'custom-aws-vpc',
            'custom-aws-subnet',
            'custom-aws-internet-gateway',
            'custom-aws-security-group',
            'custom-aws-instance',
            'custom-aws-route-table',
            'custom-aws-nat-gateway',
            'custom-aws-s3-bucket',
            'custom-aws-ebs-volume',
            'custom-aws-rds-instance',
            'custom-aws-load-balancer',
            'custom-aws-iam-role',
            'custom-aws-lambda-function',
            'custom-aws-cloudfront-distribution',
            'custom-aws-sns-topic',
            'custom-aws-sqs-queue',
            'custom-aws-ecs-cluster',
            'custom-aws-api-gateway',
            'custom-aws-dynamodb-table',
        ]) {
            expect(classes).toContain(expected)
        }
    })

    it('builds a palette provider block from the pack', () => {
        const provider = manifestToPaletteProvider(validateStencilManifest(awsStarter))
        expect(provider.provider).toBe('custom')
        expect(provider.groups[0].resources).toHaveLength(19)
    })
})
