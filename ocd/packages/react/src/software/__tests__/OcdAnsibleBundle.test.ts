/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { ansibleHostName, buildAnsibleBundle } from '../OcdAnsibleBundle'
import { findSoftwarePackage } from '../OcdSoftwareCatalog'

const docker = findSoftwarePackage('docker')! // galaxy role + defaultVars
const vault = findSoftwarePackage('vault')! // github role

const designWith = (resources: Record<string, any[]>) => ({ model: { oci: { resources } } })

describe('ansibleHostName', () => {
    it('sanitises display names to safe identifiers', () => {
        expect(ansibleHostName('Web Server 01', 0)).toBe('web_server_01')
        expect(ansibleHostName('app-vm.prod', 1)).toBe('app_vm_prod')
        expect(ansibleHostName('', 2)).toBe('host_3')
    })
})

describe('buildAnsibleBundle', () => {
    const design = designWith({
        instance: [{ id: 'i-1', displayName: 'web-01' }, { id: 'i-2', displayName: 'db-01' }],
    })

    it('emits the bundle files plus the derived host list', () => {
        const bundle = buildAnsibleBundle(design, [docker])
        expect(Object.keys(bundle.files).sort()).toEqual(['inventory.yml', 'outputs.tf', 'playbook.yml', 'requirements.yml', 'run.sh'])
        expect(bundle.hosts).toEqual(['web_01', 'db_01'])
    })

    it('prefers the exporter terraformResourceName and emits a matching outputs.tf', () => {
        const exported = designWith({
            instance: [{ id: 'i-1', displayName: 'Web 01', terraformResourceName: 'web_server' }],
        })
        const bundle = buildAnsibleBundle(exported, [docker])
        expect(bundle.hosts).toEqual(['web_server'])
        expect(bundle.files['inventory.yml']).toContain('ansible_host: "{{ web_server_public_ip }}"')
        expect(bundle.files['outputs.tf']).toContain('output "web_server_public_ip" {')
        expect(bundle.files['outputs.tf']).toContain('value = oci_core_instance.web_server.public_ip')
    })

    it('flags instances with no exported TF name for manual outputs wiring', () => {
        const outputs = buildAnsibleBundle(design, [docker]).files['outputs.tf']
        expect(outputs).toContain('# TODO: define output "web_01_public_ip"')
    })

    it('lists Galaxy roles by name and GitHub roles by src in requirements.yml', () => {
        const reqs = buildAnsibleBundle(design, [docker, vault]).files['requirements.yml']
        expect(reqs).toContain('- name: geerlingguy.docker')
        // The URL contains ':' so valid YAML must quote it.
        expect(reqs).toContain('src: "https://github.com/ansible-community/ansible-vault"')
    })

    it('threads defaultVars into the playbook role block', () => {
        const playbook = buildAnsibleBundle(design, [docker]).files['playbook.yml']
        expect(playbook).toContain('- role: geerlingguy.docker')
        expect(playbook).toContain('vars:')
        expect(playbook).toContain('docker_install_compose: true')
    })

    it('wires each inventory host to a Terraform IP output variable', () => {
        const inventory = buildAnsibleBundle(design, [docker]).files['inventory.yml']
        expect(inventory).toContain('web_01:')
        expect(inventory).toContain('ansible_host: "{{ web_01_public_ip }}"')
    })

    it('leaves an actionable placeholder when the design has no instances', () => {
        const bundle = buildAnsibleBundle(designWith({}), [docker])
        expect(bundle.hosts).toEqual([])
        expect(bundle.files['inventory.yml']).toContain('# No compute instances')
    })

    it('produces a valid empty-roles bundle when nothing is selected', () => {
        const bundle = buildAnsibleBundle(design, [])
        expect(bundle.files['requirements.yml']).toContain('roles:')
        expect(bundle.files['playbook.yml']).toContain('hosts: all')
        expect(bundle.files['run.sh']).toContain('ansible-playbook -i inventory.yml playbook.yml')
    })
})
