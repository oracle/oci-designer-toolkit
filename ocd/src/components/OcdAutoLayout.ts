/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { v4 as uuidv4 } from 'uuid'
import { OcdDesign, OcdResources, OcdViewCoords, OciResources } from "../model/OcdDesign";
import { OcdResource } from "../model/OcdResource";
import { OcdUtils } from '../utils/OcdUtils';

export class OcdAutoLayout {
    coords: OcdViewCoords[]
    design: OcdDesign
    containers: string[] = ['vcn', 'subnet']
    ignore: string[] = ['compartment']
    containerResources: OcdResources = {}
    simpleResources: OcdResources = {}
    uuid = () => `gid-${uuidv4()}`

    constructor(design: OcdDesign) {
        this.design = design
        this.coords = []
        this.containerResources = {...this.getOciContainerResources(this.design.model.oci.resources)}
        this.simpleResources = {...this.getOciSimpleResources(this.design.model.oci.resources)} as OcdResources
        this.addContainerCoords()
        console.info('Container Coords',this.coords)
        this.addSimpleCoords()
        console.info('Simple Coords', this.coords)
    }

    getOciResources() {return Object.values(this.design.model.oci.resources).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], [])}
    getOciContainerResources(resources: OciResources): OcdResources {
        return Object.keys(resources).filter(k => this.containers.includes(k) && !this.ignore.includes(k)).reduce((obj, key) => {return {...obj, [key]: resources[key]}}, {})
    }
    getOciSimpleResources(resources: OciResources): OcdResources {
        return Object.keys(resources).filter(k => !this.containers.includes(k) && !this.ignore.includes(k)).reduce((obj, key) => {return {...obj, [key]: resources[key]}}, {})
    }

    addContainerCoords() {
        this.containers.forEach((c) => {
            this.coords = [...this.coords, ...this.containerResources[c].map((r: OcdResource) => {
                const coords: OcdViewCoords = {
                    id: this.uuid(),
                    pgid: '',
                    ocid: r.id,
                    pocid: '',
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
                        pocid: '',
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

    layout(): OcdViewCoords[] {
        return this.coords
    }
}