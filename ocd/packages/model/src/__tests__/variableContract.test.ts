/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, it, expect } from 'vitest'
import {
    OcdNamingContext,
    ENV_SUBNET_ROLES,
    HUB_SUBNET_ROLES,
    DEFAULT_DRG_NAME,
    DEFAULT_LANDING_ZONE_NAME,
    expandTokens,
    landingZoneName,
    hubVcnName,
    spokeVcnName,
    hubSubnetName,
    spokeSubnetName,
    landingZoneCompartmentName,
    networkCompartmentName,
    securityCompartmentName,
    environmentCompartmentName,
    environmentNetworkCompartmentName,
    environmentProjectsCompartmentName,
    drgName,
    hubAttachmentName,
    spokeAttachmentName,
    hubRouteTableRole,
    hubSubnetRouteTableName,
    hubGatewayRouteTableName,
    hubDrgRouteTableName,
    spokeDrgRouteTableName,
    spokeSubnetRouteTableName,
    firewallName,
} from '../OcdVariableContract.js'

// A representative context: realm oc1, eu-frankfurt-1 / fra, env prod, lze landingzone.
function ctx(overrides: Partial<OcdNamingContext> = {}): OcdNamingContext {
    return {
        realm: 'oc1',
        region: 'eu-frankfurt-1',
        regionShortName: 'fra',
        lze: 'landingzone',
        env: 'prod',
        ...overrides,
    }
}

describe('expandTokens', () => {
    it('expands <region> to the regionShortName, not the full region id', () => {
        expect(expandTokens('<region>', ctx())).toBe('fra')
    })

    it('expands <lze>', () => {
        expect(expandTokens('<lze>', ctx())).toBe('landingzone')
    })

    it('expands <env>', () => {
        expect(expandTokens('<env>', ctx())).toBe('prod')
    })

    it('expands all three tokens in one template', () => {
        expect(expandTokens('x-<region>-<lze>-<env>-y', ctx())).toBe('x-fra-landingzone-prod-y')
    })

    it('replaces every occurrence of a token', () => {
        expect(expandTokens('<env>-<env>', ctx({ env: 'dev' }))).toBe('dev-dev')
    })

    it('leaves a token literal when its value is empty (resolveHubName parity)', () => {
        expect(expandTokens('sn-<region>-<env>-web', ctx({ env: '' }))).toBe('sn-fra-<env>-web')
    })

    it('leaves <env> literal when env is undefined', () => {
        expect(expandTokens('sn-<region>-<env>-web', ctx({ env: undefined }))).toBe('sn-fra-<env>-web')
    })

    it('trims whitespace around context values before substituting', () => {
        expect(expandTokens('<region>-<lze>', ctx({ regionShortName: '  fra  ', lze: ' landingzone ' }))).toBe('fra-landingzone')
    })
})

describe('landingZoneName', () => {
    it('returns the bare landing-zone name', () => {
        expect(landingZoneName(ctx())).toBe('landingzone')
    })

    it('strips a leading cmp- prefix (buildGraph parity)', () => {
        expect(landingZoneName(ctx({ lze: 'cmp-foo' }))).toBe('foo')
    })

    it('falls back to the default when empty', () => {
        expect(landingZoneName(ctx({ lze: '' }))).toBe(DEFAULT_LANDING_ZONE_NAME)
        expect(landingZoneName(ctx({ lze: '   ' }))).toBe('landingzone')
    })
})

describe('VCN names', () => {
    it('hubVcnName -> vcn-<region>-<lze>-hub', () => {
        expect(hubVcnName(ctx())).toBe('vcn-fra-landingzone-hub')
    })

    it('spokeVcnName -> vcn-<region>-<env>-projects', () => {
        expect(spokeVcnName(ctx())).toBe('vcn-fra-prod-projects')
    })
})

describe('subnet names', () => {
    it('hubSubnetName -> sn-<region>-<lze>-hub-<role> for each hub role', () => {
        expect(HUB_SUBNET_ROLES.map((role) => hubSubnetName(ctx(), role))).toEqual([
            'sn-fra-landingzone-hub-fw-dmz',
            'sn-fra-landingzone-hub-lb',
            'sn-fra-landingzone-hub-fw-int',
            'sn-fra-landingzone-hub-mgmt',
            'sn-fra-landingzone-hub-mon',
            'sn-fra-landingzone-hub-dns',
        ])
    })

    it('spokeSubnetName -> sn-<region>-<env>-<role> for each env role', () => {
        expect(ENV_SUBNET_ROLES.map((role) => spokeSubnetName(ctx(), role))).toEqual([
            'sn-fra-prod-web',
            'sn-fra-prod-app',
            'sn-fra-prod-db',
            'sn-fra-prod-infra',
        ])
    })
})

describe('compartment names', () => {
    it('landingZoneCompartmentName -> cmp-<lze>', () => {
        expect(landingZoneCompartmentName(ctx())).toBe('cmp-landingzone')
    })

    it('networkCompartmentName -> cmp-<lze>-network', () => {
        expect(networkCompartmentName(ctx())).toBe('cmp-landingzone-network')
    })

    it('securityCompartmentName -> cmp-<lze>-security', () => {
        expect(securityCompartmentName(ctx())).toBe('cmp-landingzone-security')
    })

    it('environmentCompartmentName -> cmp-<lze>-<env>', () => {
        expect(environmentCompartmentName(ctx())).toBe('cmp-landingzone-prod')
    })

    it('environmentNetworkCompartmentName -> cmp-<lze>-<env>-network', () => {
        expect(environmentNetworkCompartmentName(ctx())).toBe('cmp-landingzone-prod-network')
    })

    it('environmentProjectsCompartmentName -> cmp-<lze>-<env>-projects', () => {
        expect(environmentProjectsCompartmentName(ctx())).toBe('cmp-landingzone-prod-projects')
    })

    it('does not strip cmp- twice when the lze already carries it', () => {
        expect(networkCompartmentName(ctx({ lze: 'cmp-foo' }))).toBe('cmp-foo-network')
    })

    it('throws on environment-scoped names when env is missing', () => {
        expect(() => environmentCompartmentName(ctx({ env: undefined }))).toThrow(/env is required/)
        expect(() => environmentNetworkCompartmentName(ctx({ env: '' }))).toThrow(/env is required/)
    })
})

describe('DRG + attachment names', () => {
    it('drgName -> default DRG', () => {
        expect(drgName()).toBe(DEFAULT_DRG_NAME)
        expect(drgName()).toBe('DRG')
    })

    it('hubAttachmentName -> vcn-hub-attach', () => {
        expect(hubAttachmentName()).toBe('vcn-hub-attach')
    })

    it('spokeAttachmentName -> vcn-<env>-attach', () => {
        expect(spokeAttachmentName(ctx())).toBe('vcn-prod-attach')
    })
})

describe('route-table names', () => {
    it('hubRouteTableRole maps fw-int to internal and fw-dmz to dmz (documented irregularity)', () => {
        expect(hubRouteTableRole('fw-int')).toBe('internal')
        expect(hubRouteTableRole('fw-dmz')).toBe('dmz')
        expect(hubRouteTableRole('lb')).toBe('lb')
        expect(hubRouteTableRole('mgmt')).toBe('mgmt')
    })

    it('hubSubnetRouteTableName applies the role mapping', () => {
        expect(hubSubnetRouteTableName(ctx(), 'fw-dmz')).toBe('rt-fra-hub-dmz')
        expect(hubSubnetRouteTableName(ctx(), 'fw-int')).toBe('rt-fra-hub-internal')
        expect(hubSubnetRouteTableName(ctx(), 'lb')).toBe('rt-fra-hub-lb')
        expect(hubSubnetRouteTableName(ctx(), 'mgmt')).toBe('rt-fra-hub-mgmt')
    })

    it('hubGatewayRouteTableName -> rt-<region>-hub-<gateway>', () => {
        expect(hubGatewayRouteTableName(ctx(), 'igw')).toBe('rt-fra-hub-igw')
        expect(hubGatewayRouteTableName(ctx(), 'natgw')).toBe('rt-fra-hub-natgw')
        expect(hubGatewayRouteTableName(ctx(), 'ingress')).toBe('rt-fra-hub-ingress')
    })

    it('hubDrgRouteTableName -> rt-<region>-drg-hub', () => {
        expect(hubDrgRouteTableName(ctx())).toBe('rt-fra-drg-hub')
    })

    it('spokeDrgRouteTableName -> rt-<region>-drg-<env>', () => {
        expect(spokeDrgRouteTableName(ctx())).toBe('rt-fra-drg-prod')
    })

    it('spokeSubnetRouteTableName -> rt-<region>-ssn-<env>-<role>', () => {
        expect(spokeSubnetRouteTableName(ctx(), 'web')).toBe('rt-fra-ssn-prod-web')
    })

    it('throws on env-scoped route tables when env is missing', () => {
        expect(() => spokeDrgRouteTableName(ctx({ env: undefined }))).toThrow(/env is required/)
        expect(() => spokeSubnetRouteTableName(ctx({ env: '' }), 'web')).toThrow(/env is required/)
    })
})

describe('firewall names', () => {
    it('firewallName -> nfw-<region>-hub-<position>', () => {
        expect(firewallName(ctx(), 'dmz')).toBe('nfw-fra-hub-dmz')
        expect(firewallName(ctx(), 'int')).toBe('nfw-fra-hub-int')
    })
})

describe('purity and immutability', () => {
    it('produces identical output when called twice', () => {
        const c = ctx()
        expect(hubSubnetName(c, 'fw-dmz')).toBe(hubSubnetName(c, 'fw-dmz'))
        expect(spokeSubnetRouteTableName(c, 'web')).toBe(spokeSubnetRouteTableName(c, 'web'))
        expect(expandTokens('<region>-<lze>-<env>', c)).toBe(expandTokens('<region>-<lze>-<env>', c))
    })

    it('does not mutate the input context', () => {
        const c = ctx()
        const snapshot = JSON.stringify(c)
        hubVcnName(c)
        spokeVcnName(c)
        environmentProjectsCompartmentName(c)
        spokeSubnetRouteTableName(c, 'app')
        expandTokens('<region>-<env>-<lze>', c)
        expect(JSON.stringify(c)).toBe(snapshot)
    })

    it('handles an empty environment list scenario (no env-scoped calls, hub names still resolve)', () => {
        // When a design has zero environments, callers only invoke hub-scoped
        // generators — these must resolve fully without an env.
        const hubOnly = ctx({ env: undefined })
        expect(hubVcnName(hubOnly)).toBe('vcn-fra-landingzone-hub')
        expect(networkCompartmentName(hubOnly)).toBe('cmp-landingzone-network')
        expect(hubAttachmentName()).toBe('vcn-hub-attach')
    })
})
