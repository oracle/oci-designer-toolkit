import { describe, expect, it } from 'vitest';
import { buildConfig, serializeConfig } from './lzConfig';
import { emptyLzModel, envNetworkDefaults } from '../model/defaults';
import type { Environment, LzModel } from '../model/types';

function model(over: Partial<LzModel> = {}): LzModel {
  return { ...emptyLzModel(), ...over };
}

function env(name: string, securityZone: boolean, index: number): Environment {
  return { name, securityZone, network: envNetworkDefaults(index) };
}

describe('buildConfig', () => {
  it('maps foundation fields and keys environments by name', () => {
    const c = buildConfig(model({
      foundation: { realm: 'oc1', region: 'eu-frankfurt-1', regionShortName: 'fra' },
      environments: [
        env('prod', true, 0),
        env('preprod', false, 1),
        env('dev', false, 2),
      ],
    }));
    expect(c.realm).toBe('oc1');
    expect(c.region).toBe('eu-frankfurt-1');
    expect(c.region_short_name).toBe('fra');
    expect(Object.keys(c.environments)).toEqual(['prod', 'preprod', 'dev']);
    // each env now carries its spoke network + the projects dropped in it
    expect(c.environments.prod).toEqual({
      shared_project_network: { network: { vcn: '10.0.8.0/21', subnets: { web: '10.0.8.0/24', app: '10.0.9.0/24', db: '10.0.10.0/24', infra: '10.0.11.0/24' } } },
      projects: { 'project-1': {} },
    });
    expect(c.security_targets).toEqual(['prod']);
  });

  it('reflects Security Zone toggles in security_targets', () => {
    const c = buildConfig(model({
      environments: [
        env('prod', true, 0),
        env('dev', true, 1),
      ],
    }));
    expect(c.security_targets).toEqual(['prod', 'dev']);
  });

  it('skips half-typed (empty-name) environment rows', () => {
    const c = buildConfig(model({
      environments: [env('prod', false, 0), env('  ', true, 1)],
    }));
    expect(Object.keys(c.environments)).toEqual(['prod']);
    expect(c.security_targets).toEqual([]);
  });

  it('maps the hub network with short subnet keys (sn- prefix stripped)', () => {
    const c = buildConfig(model());
    expect(c.hub.kind).toBe('hub_a');
    expect(c.hub.network.vcn).toBe('10.0.0.0/21');
    expect(c.hub.network.subnets).toEqual({
      'fw-dmz': '10.0.0.0/24',
      lb: '10.0.1.0/24',
      'fw-int': '10.0.2.0/24',
      mgmt: '10.0.3.0/24',
      mon: '10.0.4.0/24',
      dns: '10.0.5.0/24',
    });
  });

  it('keeps a custom subnet name as its own key', () => {
    const base = emptyLzModel();
    const c = buildConfig(model({
      network: { ...base.network, subnets: [...base.network.subnets, { name: 'my-subnet', cidr: '10.0.7.0/24' }] },
    }));
    expect(c.hub.network.subnets['my-subnet']).toBe('10.0.7.0/24');
  });
});

describe('serializeConfig', () => {
  it('serialises the default model in the expected jsonnet shape', () => {
    const out = serializeConfig(model({
      foundation: { realm: 'oc1', region: 'eu-frankfurt-1', regionShortName: 'fra' },
      environments: [
        env('prod', true, 0),
        env('preprod', false, 1),
        env('dev', false, 2),
      ],
    }));
    expect(out).toContain("realm: 'oc1',\n  region: 'eu-frankfurt-1',\n  region_short_name: 'fra',");
    expect(out).not.toContain('// changed');
    expect(out).toContain("kind: 'hub_a',");
    expect(out).toContain("vcn: '10.0.0.0/21',");
    expect(out).toContain("'fw-dmz': '10.0.0.0/24', lb: '10.0.1.0/24',");
    expect(out).toContain("'fw-int': '10.0.2.0/24', mgmt: '10.0.3.0/24',");
    expect(out).toContain("mon: '10.0.4.0/24', dns: '10.0.5.0/24',");
    // step 3 (default) nests each environment's spoke network + projects
    expect(out).toContain('  environments: {');
    expect(out).toContain('    prod: {');
    expect(out).toContain('      shared_project_network: {');
    expect(out).toContain("          vcn: '10.0.8.0/21',");
    expect(out).toContain("            web: '10.0.8.0/24', app: '10.0.9.0/24',");
    expect(out).toContain("      projects: { 'project-1': {} },");
    expect(out).toContain("security_targets: ['prod'],");
  });

  it('keeps environments as empty named compartments before step 3', () => {
    const out = serializeConfig(model(), 2);
    expect(out).toContain('environments: { prod: {}, preprod: {}, dev: {} },');
    expect(out).not.toContain('shared_project_network');
  });

  it('drops a project into only the environments it applies to', () => {
    const base = emptyLzModel();
    const out = serializeConfig(model({
      projects: [{ name: 'alpha', environments: 'all' }, { name: 'beta', environments: ['prod'] }],
    }), 3);
    // prod gets both; dev gets only the 'all' one
    const prodBlock = out.slice(out.indexOf('prod: {'), out.indexOf('preprod: {'));
    expect(prodBlock).toContain('projects: { alpha: {}, beta: {} },');
    const devBlock = out.slice(out.indexOf('dev: {'));
    expect(devBlock).toContain('projects: { alpha: {} },');
    expect(base.version).toBe('0.11.0');
  });

  it('renders the step 1 view in the one-field-per-line shape without the hub block', () => {
    const out = serializeConfig(model(), 1);
    expect(out).toBe([
      '{',
      "  realm: 'oc1',",
      "  region: 'eu-frankfurt-1',",
      "  region_short_name: 'fra',",
      '  environments: { prod: {}, preprod: {}, dev: {} },',
      "  security_targets: ['prod'],",
      '}',
      '',
    ].join('\n'));
    // from step 2 onward the hub block appears
    expect(serializeConfig(model(), 2)).toContain('hub:');
  });

  it('emits empty collections when there are no environments or subnets', () => {
    const base = emptyLzModel();
    const out = serializeConfig(model({
      environments: [],
      network: { ...base.network, subnets: [] },
    }));
    expect(out).toContain('environments: {},');
    expect(out).toContain('security_targets: [],');
    expect(out).toContain('subnets: {},');
  });
});
