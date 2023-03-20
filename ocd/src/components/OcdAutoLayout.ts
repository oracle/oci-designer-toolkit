/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { v4 as uuidv4 } from 'uuid'
import { OcdDesign, OcdResources, OcdViewCoords, OciResources } from "../model/OcdDesign";
import { OcdResource } from "../model/OcdResource";
import { OciResource } from '../model/provider/oci/OciResource';
import { OcdUtils } from '../utils/OcdUtils';

export class OcdAutoLayout {
    coords: OcdViewCoords[]
    design: OcdDesign
    // Specify Contains and their hierarchy. i.e. compartment -> vcn -> subnet
    containers: string[] = ['vcn', 'subnet']
    ignore: string[] = ['compartment']
    containerResources: OcdResources = {}
    simpleResources: OcdResources = {}
    uuid = () => `gid-${uuidv4()}`

    constructor(design: OcdDesign) {
        this.design = design
        this.coords = []
        this.containerResources = this.getContainerResources()
        this.simpleResources = this.getSimpleResources()
        this.addContainerCoords()
        console.info('Container Coords',this.coords)
        this.addSimpleCoords()
        console.info('Added Simple Coords', this.coords)
    }

    getResources(): OcdResource[] {return [...this.getOciResources()]}
    getContainerResources(): OcdResources {return {...this.getOciContainerResources(this.design.model.oci.resources)}}
    getSimpleResources(): OcdResources {return {...this.getOciSimpleResources(this.design.model.oci.resources)}}

    getOciResources(): OciResource[] {return Object.values(this.design.model.oci.resources).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], [])}
    getOciContainerResources(resources: OciResources): OciResources {return Object.keys(resources).filter(k => this.containers.includes(k) && !this.ignore.includes(k)).reduce((obj, key) => {return {...obj, [key]: resources[key]}}, {})}
    getOciSimpleResources(resources: OciResources): OciResources {return Object.keys(resources).filter(k => !this.containers.includes(k) && !this.ignore.includes(k)).reduce((obj, key) => {return {...obj, [key]: resources[key]}}, {})}

    addContainerCoords() {
        this.containers.forEach((c) => {
            this.coords = [...this.coords, ...this.containerResources[c].map((r: OcdResource) => {
                const coords: OcdViewCoords = {
                    id: this.uuid(),
                    pgid: '',
                    ocid: r.id,
                    pocid: this.getParentId(r.id),
                    x: 0,
                    y: 0,
                    w: 200,
                    h: 200,
                    title: OcdUtils.toTitle(c),
                    class: OcdUtils.toCssClassName(r.provider, c),
                    container: true
                }
                return coords
            })]
        })
    }

    addSimpleCoords() {
        this.coords = [...this.coords, ...Object.entries(this.simpleResources).reduce((a, [c, v]) => {
            return [...a, ...v.map((r) => {
                    const coords: OcdViewCoords = {
                        id: this.uuid(),
                        pgid: '',
                        ocid: r.id,
                        pocid: this.getParentId(r.id),
                        x: 0,
                        y: 0,
                        w: 32,
                        h: 32,
                        title: OcdUtils.toTitle(c),
                        class: OcdUtils.toCssClassName(r.provider, c),
                        container: false
                    }
                    return coords
            })]
        }, [] as OcdViewCoords[])]
    }

    getParentId(ocid: string): string {
        const resource = this.getResources().find(r => r.id === ocid)
        const id = !resource ? 'Undefined' : this.containers.reduce((a, c) => {return Object.hasOwn(resource, `${c}Id`) ? resource[`${c}Id`] : a}, 'Unknown')
        return id
    }

    layout(): OcdViewCoords[] {
        return this.coords
    }
}