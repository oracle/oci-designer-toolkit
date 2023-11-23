/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
/*
**
** ======================================================================
** === Auto Generated Code All Edits Will Be Lost During Regeneration ===
** ======================================================================
**
*/

import { OcdCache } from "../components/OcdCache";

export const defaultCache: OcdCache = {
    profile: 'DEFAULT',
    region: '',
    dropdownData: {
        shipped: {
            all: {
                "shape": [
                    {
                        "id": "BM.Standard.A1.160",
                        "displayName": "BM.Standard.A1.160",
                        "shape": "BM.Standard.A1.160",
                        "ocpus": 160,
                        "memoryInGBs": 1024,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard3.64",
                        "displayName": "BM.Standard3.64",
                        "shape": "BM.Standard3.64",
                        "ocpus": 64,
                        "memoryInGBs": 1024,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard2.52",
                        "displayName": "BM.Standard2.52",
                        "shape": "BM.Standard2.52",
                        "ocpus": 52,
                        "memoryInGBs": 768,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Optimized3.36",
                        "displayName": "BM.Optimized3.36",
                        "shape": "BM.Optimized3.36",
                        "ocpus": 36,
                        "memoryInGBs": 512,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.DenseIO.E4.128",
                        "displayName": "BM.DenseIO.E4.128",
                        "shape": "BM.DenseIO.E4.128",
                        "ocpus": 128,
                        "memoryInGBs": 2048,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard.E4.128",
                        "displayName": "BM.Standard.E4.128",
                        "shape": "BM.Standard.E4.128",
                        "ocpus": 128,
                        "memoryInGBs": 2048,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard.E3.128",
                        "displayName": "BM.Standard.E3.128",
                        "shape": "BM.Standard.E3.128",
                        "ocpus": 128,
                        "memoryInGBs": 2048,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard.E2.64",
                        "displayName": "BM.Standard.E2.64",
                        "shape": "BM.Standard.E2.64",
                        "ocpus": 64,
                        "memoryInGBs": 512,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.DenseIO2.52",
                        "displayName": "BM.DenseIO2.52",
                        "shape": "BM.DenseIO2.52",
                        "ocpus": 52,
                        "memoryInGBs": 768,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard1.36",
                        "displayName": "BM.Standard1.36",
                        "shape": "BM.Standard1.36",
                        "ocpus": 36,
                        "memoryInGBs": 256,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Optimized3.Flex",
                        "displayName": "VM.Optimized3.Flex",
                        "shape": "VM.Optimized3.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 14,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 18,
                            "maxPerNumaNode": 18
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 256,
                            "defaultPerOcpuInGBs": 14,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 256
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.E4.Flex",
                        "displayName": "VM.Standard.E4.Flex",
                        "shape": "VM.Standard.E4.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 16,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 114,
                            "maxPerNumaNode": 64
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 1760,
                            "defaultPerOcpuInGBs": 16,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 1024
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.E3.Flex",
                        "displayName": "VM.Standard.E3.Flex",
                        "shape": "VM.Standard.E3.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 16,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 114,
                            "maxPerNumaNode": 64
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 1776,
                            "defaultPerOcpuInGBs": 16,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 1024
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.A1.Flex",
                        "displayName": "VM.Standard.A1.Flex",
                        "shape": "VM.Standard.A1.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 6,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 80,
                            "maxPerNumaNode": 80
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 512,
                            "defaultPerOcpuInGBs": 6,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 512
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard2.1",
                        "displayName": "VM.Standard2.1",
                        "shape": "VM.Standard2.1",
                        "ocpus": 1,
                        "memoryInGBs": 15,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard2.2",
                        "displayName": "VM.Standard2.2",
                        "shape": "VM.Standard2.2",
                        "ocpus": 2,
                        "memoryInGBs": 30,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard2.4",
                        "displayName": "VM.Standard2.4",
                        "shape": "VM.Standard2.4",
                        "ocpus": 4,
                        "memoryInGBs": 60,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard2.8",
                        "displayName": "VM.Standard2.8",
                        "shape": "VM.Standard2.8",
                        "ocpus": 8,
                        "memoryInGBs": 120,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard2.16",
                        "displayName": "VM.Standard2.16",
                        "shape": "VM.Standard2.16",
                        "ocpus": 16,
                        "memoryInGBs": 240,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard2.24",
                        "displayName": "VM.Standard2.24",
                        "shape": "VM.Standard2.24",
                        "ocpus": 24,
                        "memoryInGBs": 320,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard.E2.1",
                        "displayName": "VM.Standard.E2.1",
                        "shape": "VM.Standard.E2.1",
                        "ocpus": 1,
                        "memoryInGBs": 8,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard.E2.2",
                        "displayName": "VM.Standard.E2.2",
                        "shape": "VM.Standard.E2.2",
                        "ocpus": 2,
                        "memoryInGBs": 16,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard.E2.4",
                        "displayName": "VM.Standard.E2.4",
                        "shape": "VM.Standard.E2.4",
                        "ocpus": 4,
                        "memoryInGBs": 32,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard.E2.8",
                        "displayName": "VM.Standard.E2.8",
                        "shape": "VM.Standard.E2.8",
                        "ocpus": 8,
                        "memoryInGBs": 64,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard3.Flex",
                        "displayName": "VM.Standard3.Flex",
                        "shape": "VM.Standard3.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 16,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 56,
                            "maxPerNumaNode": 32
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 896,
                            "defaultPerOcpuInGBs": 16,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 512
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.DenseIO2.8",
                        "displayName": "VM.DenseIO2.8",
                        "shape": "VM.DenseIO2.8",
                        "ocpus": 8,
                        "memoryInGBs": 120,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.DenseIO2.16",
                        "displayName": "VM.DenseIO2.16",
                        "shape": "VM.DenseIO2.16",
                        "ocpus": 16,
                        "memoryInGBs": 240,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.DenseIO2.24",
                        "displayName": "VM.DenseIO2.24",
                        "shape": "VM.DenseIO2.24",
                        "ocpus": 24,
                        "memoryInGBs": 320,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard1.1",
                        "displayName": "VM.Standard1.1",
                        "shape": "VM.Standard1.1",
                        "ocpus": 1,
                        "memoryInGBs": 7,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard1.2",
                        "displayName": "VM.Standard1.2",
                        "shape": "VM.Standard1.2",
                        "ocpus": 2,
                        "memoryInGBs": 14,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard1.4",
                        "displayName": "VM.Standard1.4",
                        "shape": "VM.Standard1.4",
                        "ocpus": 4,
                        "memoryInGBs": 28,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard1.8",
                        "displayName": "VM.Standard1.8",
                        "shape": "VM.Standard1.8",
                        "ocpus": 8,
                        "memoryInGBs": 56,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard1.16",
                        "displayName": "VM.Standard1.16",
                        "shape": "VM.Standard1.16",
                        "ocpus": 16,
                        "memoryInGBs": 112,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.DenseIO.E4.Flex",
                        "displayName": "VM.DenseIO.E4.Flex",
                        "shape": "VM.DenseIO.E4.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 16,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 64,
                            "maxPerNumaNode": 64
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 1024,
                            "defaultPerOcpuInGBs": 16,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 1024
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.AMD.Generic",
                        "displayName": "VM.Standard.AMD.Generic",
                        "shape": "VM.Standard.AMD.Generic",
                        "ocpus": 1,
                        "memoryInGBs": 16,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 64,
                            "maxPerNumaNode": 64
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 1024,
                            "defaultPerOcpuInGBs": null,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 1024
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.Ampere.Generic",
                        "displayName": "VM.Standard.Ampere.Generic",
                        "shape": "VM.Standard.Ampere.Generic",
                        "ocpus": 1,
                        "memoryInGBs": 6,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 80,
                            "maxPerNumaNode": 80
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 512,
                            "defaultPerOcpuInGBs": null,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 512
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.Intel.Generic",
                        "displayName": "VM.Standard.Intel.Generic",
                        "shape": "VM.Standard.Intel.Generic",
                        "ocpus": 1,
                        "memoryInGBs": 16,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 32,
                            "maxPerNumaNode": 32
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 512,
                            "defaultPerOcpuInGBs": null,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 512
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.x86.Generic",
                        "displayName": "VM.Standard.x86.Generic",
                        "shape": "VM.Standard.x86.Generic",
                        "ocpus": 1,
                        "memoryInGBs": 16,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 32,
                            "maxPerNumaNode": 32
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 512,
                            "defaultPerOcpuInGBs": null,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 512
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "BM.Standard.E5.192",
                        "displayName": "BM.Standard.E5.192",
                        "shape": "BM.Standard.E5.192",
                        "ocpus": 192,
                        "memoryInGBs": 2304,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard.A1.160",
                        "displayName": "BM.Standard.A1.160",
                        "shape": "BM.Standard.A1.160",
                        "ocpus": 160,
                        "memoryInGBs": 1024,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard3.64",
                        "displayName": "BM.Standard3.64",
                        "shape": "BM.Standard3.64",
                        "ocpus": 64,
                        "memoryInGBs": 1024,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard2.52",
                        "displayName": "BM.Standard2.52",
                        "shape": "BM.Standard2.52",
                        "ocpus": 52,
                        "memoryInGBs": 768,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Optimized3.36",
                        "displayName": "BM.Optimized3.36",
                        "shape": "BM.Optimized3.36",
                        "ocpus": 36,
                        "memoryInGBs": 512,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.DenseIO.E4.128",
                        "displayName": "BM.DenseIO.E4.128",
                        "shape": "BM.DenseIO.E4.128",
                        "ocpus": 128,
                        "memoryInGBs": 2048,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard.E4.128",
                        "displayName": "BM.Standard.E4.128",
                        "shape": "BM.Standard.E4.128",
                        "ocpus": 128,
                        "memoryInGBs": 2048,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard.E3.128",
                        "displayName": "BM.Standard.E3.128",
                        "shape": "BM.Standard.E3.128",
                        "ocpus": 128,
                        "memoryInGBs": 2048,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard.E2.64",
                        "displayName": "BM.Standard.E2.64",
                        "shape": "BM.Standard.E2.64",
                        "ocpus": 64,
                        "memoryInGBs": 512,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.DenseIO2.52",
                        "displayName": "BM.DenseIO2.52",
                        "shape": "BM.DenseIO2.52",
                        "ocpus": 52,
                        "memoryInGBs": 768,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Optimized3.Flex",
                        "displayName": "VM.Optimized3.Flex",
                        "shape": "VM.Optimized3.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 14,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 18,
                            "maxPerNumaNode": 18
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 256,
                            "defaultPerOcpuInGBs": 14,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 256
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.E4.Flex",
                        "displayName": "VM.Standard.E4.Flex",
                        "shape": "VM.Standard.E4.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 16,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 114,
                            "maxPerNumaNode": 64
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 1760,
                            "defaultPerOcpuInGBs": 16,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 1024
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.E3.Flex",
                        "displayName": "VM.Standard.E3.Flex",
                        "shape": "VM.Standard.E3.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 16,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 114,
                            "maxPerNumaNode": 64
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 1776,
                            "defaultPerOcpuInGBs": 16,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 1024
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.A1.Flex",
                        "displayName": "VM.Standard.A1.Flex",
                        "shape": "VM.Standard.A1.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 6,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 80,
                            "maxPerNumaNode": 80
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 512,
                            "defaultPerOcpuInGBs": 6,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 512
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard2.1",
                        "displayName": "VM.Standard2.1",
                        "shape": "VM.Standard2.1",
                        "ocpus": 1,
                        "memoryInGBs": 15,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard2.2",
                        "displayName": "VM.Standard2.2",
                        "shape": "VM.Standard2.2",
                        "ocpus": 2,
                        "memoryInGBs": 30,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard2.4",
                        "displayName": "VM.Standard2.4",
                        "shape": "VM.Standard2.4",
                        "ocpus": 4,
                        "memoryInGBs": 60,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard2.8",
                        "displayName": "VM.Standard2.8",
                        "shape": "VM.Standard2.8",
                        "ocpus": 8,
                        "memoryInGBs": 120,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard2.16",
                        "displayName": "VM.Standard2.16",
                        "shape": "VM.Standard2.16",
                        "ocpus": 16,
                        "memoryInGBs": 240,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard2.24",
                        "displayName": "VM.Standard2.24",
                        "shape": "VM.Standard2.24",
                        "ocpus": 24,
                        "memoryInGBs": 320,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard.E2.1",
                        "displayName": "VM.Standard.E2.1",
                        "shape": "VM.Standard.E2.1",
                        "ocpus": 1,
                        "memoryInGBs": 8,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard.E2.2",
                        "displayName": "VM.Standard.E2.2",
                        "shape": "VM.Standard.E2.2",
                        "ocpus": 2,
                        "memoryInGBs": 16,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard.E2.4",
                        "displayName": "VM.Standard.E2.4",
                        "shape": "VM.Standard.E2.4",
                        "ocpus": 4,
                        "memoryInGBs": 32,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard.E2.8",
                        "displayName": "VM.Standard.E2.8",
                        "shape": "VM.Standard.E2.8",
                        "ocpus": 8,
                        "memoryInGBs": 64,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard3.Flex",
                        "displayName": "VM.Standard3.Flex",
                        "shape": "VM.Standard3.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 16,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 56,
                            "maxPerNumaNode": 32
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 896,
                            "defaultPerOcpuInGBs": 16,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 512
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.DenseIO2.8",
                        "displayName": "VM.DenseIO2.8",
                        "shape": "VM.DenseIO2.8",
                        "ocpus": 8,
                        "memoryInGBs": 120,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.DenseIO2.16",
                        "displayName": "VM.DenseIO2.16",
                        "shape": "VM.DenseIO2.16",
                        "ocpus": 16,
                        "memoryInGBs": 240,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.DenseIO2.24",
                        "displayName": "VM.DenseIO2.24",
                        "shape": "VM.DenseIO2.24",
                        "ocpus": 24,
                        "memoryInGBs": 320,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.DenseIO.E4.Flex",
                        "displayName": "VM.DenseIO.E4.Flex",
                        "shape": "VM.DenseIO.E4.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 16,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 64,
                            "maxPerNumaNode": 64
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 1024,
                            "defaultPerOcpuInGBs": 16,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 1024
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.E5.Flex",
                        "displayName": "VM.Standard.E5.Flex",
                        "shape": "VM.Standard.E5.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 12,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 94,
                            "maxPerNumaNode": 94
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 1049,
                            "defaultPerOcpuInGBs": 12,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 1049
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.AMD.Generic",
                        "displayName": "VM.Standard.AMD.Generic",
                        "shape": "VM.Standard.AMD.Generic",
                        "ocpus": 1,
                        "memoryInGBs": 16,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 64,
                            "maxPerNumaNode": 64
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 1024,
                            "defaultPerOcpuInGBs": null,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 1024
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.Ampere.Generic",
                        "displayName": "VM.Standard.Ampere.Generic",
                        "shape": "VM.Standard.Ampere.Generic",
                        "ocpus": 1,
                        "memoryInGBs": 6,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 80,
                            "maxPerNumaNode": 80
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 512,
                            "defaultPerOcpuInGBs": null,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 512
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.Intel.Generic",
                        "displayName": "VM.Standard.Intel.Generic",
                        "shape": "VM.Standard.Intel.Generic",
                        "ocpus": 1,
                        "memoryInGBs": 16,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 32,
                            "maxPerNumaNode": 32
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 512,
                            "defaultPerOcpuInGBs": null,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 512
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.x86.Generic",
                        "displayName": "VM.Standard.x86.Generic",
                        "shape": "VM.Standard.x86.Generic",
                        "ocpus": 1,
                        "memoryInGBs": 16,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 32,
                            "maxPerNumaNode": 32
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 512,
                            "defaultPerOcpuInGBs": null,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 512
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "BM.Standard.E5.192",
                        "displayName": "BM.Standard.E5.192",
                        "shape": "BM.Standard.E5.192",
                        "ocpus": 192,
                        "memoryInGBs": 2304,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard.A1.160",
                        "displayName": "BM.Standard.A1.160",
                        "shape": "BM.Standard.A1.160",
                        "ocpus": 160,
                        "memoryInGBs": 1024,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard3.64",
                        "displayName": "BM.Standard3.64",
                        "shape": "BM.Standard3.64",
                        "ocpus": 64,
                        "memoryInGBs": 1024,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard2.52",
                        "displayName": "BM.Standard2.52",
                        "shape": "BM.Standard2.52",
                        "ocpus": 52,
                        "memoryInGBs": 768,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Optimized3.36",
                        "displayName": "BM.Optimized3.36",
                        "shape": "BM.Optimized3.36",
                        "ocpus": 36,
                        "memoryInGBs": 512,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard.E4.128",
                        "displayName": "BM.Standard.E4.128",
                        "shape": "BM.Standard.E4.128",
                        "ocpus": 128,
                        "memoryInGBs": 2048,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard.E3.128",
                        "displayName": "BM.Standard.E3.128",
                        "shape": "BM.Standard.E3.128",
                        "ocpus": 128,
                        "memoryInGBs": 2048,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.Standard.E2.64",
                        "displayName": "BM.Standard.E2.64",
                        "shape": "BM.Standard.E2.64",
                        "ocpus": 64,
                        "memoryInGBs": 512,
                        "isFlexible": false
                    },
                    {
                        "id": "BM.DenseIO2.52",
                        "displayName": "BM.DenseIO2.52",
                        "shape": "BM.DenseIO2.52",
                        "ocpus": 52,
                        "memoryInGBs": 768,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Optimized3.Flex",
                        "displayName": "VM.Optimized3.Flex",
                        "shape": "VM.Optimized3.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 14,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 18,
                            "maxPerNumaNode": 18
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 256,
                            "defaultPerOcpuInGBs": 14,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 256
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.E4.Flex",
                        "displayName": "VM.Standard.E4.Flex",
                        "shape": "VM.Standard.E4.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 16,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 114,
                            "maxPerNumaNode": 64
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 1760,
                            "defaultPerOcpuInGBs": 16,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 1024
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.E3.Flex",
                        "displayName": "VM.Standard.E3.Flex",
                        "shape": "VM.Standard.E3.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 16,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 114,
                            "maxPerNumaNode": 64
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 1776,
                            "defaultPerOcpuInGBs": 16,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 1024
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard.A1.Flex",
                        "displayName": "VM.Standard.A1.Flex",
                        "shape": "VM.Standard.A1.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 6,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 80,
                            "maxPerNumaNode": 80
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 512,
                            "defaultPerOcpuInGBs": 6,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 512
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.Standard2.1",
                        "displayName": "VM.Standard2.1",
                        "shape": "VM.Standard2.1",
                        "ocpus": 1,
                        "memoryInGBs": 15,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard2.2",
                        "displayName": "VM.Standard2.2",
                        "shape": "VM.Standard2.2",
                        "ocpus": 2,
                        "memoryInGBs": 30,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard2.4",
                        "displayName": "VM.Standard2.4",
                        "shape": "VM.Standard2.4",
                        "ocpus": 4,
                        "memoryInGBs": 60,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard2.8",
                        "displayName": "VM.Standard2.8",
                        "shape": "VM.Standard2.8",
                        "ocpus": 8,
                        "memoryInGBs": 120,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard2.16",
                        "displayName": "VM.Standard2.16",
                        "shape": "VM.Standard2.16",
                        "ocpus": 16,
                        "memoryInGBs": 240,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard2.24",
                        "displayName": "VM.Standard2.24",
                        "shape": "VM.Standard2.24",
                        "ocpus": 24,
                        "memoryInGBs": 320,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard.E2.1",
                        "displayName": "VM.Standard.E2.1",
                        "shape": "VM.Standard.E2.1",
                        "ocpus": 1,
                        "memoryInGBs": 8,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard.E2.2",
                        "displayName": "VM.Standard.E2.2",
                        "shape": "VM.Standard.E2.2",
                        "ocpus": 2,
                        "memoryInGBs": 16,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard.E2.4",
                        "displayName": "VM.Standard.E2.4",
                        "shape": "VM.Standard.E2.4",
                        "ocpus": 4,
                        "memoryInGBs": 32,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard.E2.8",
                        "displayName": "VM.Standard.E2.8",
                        "shape": "VM.Standard.E2.8",
                        "ocpus": 8,
                        "memoryInGBs": 64,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard3.Flex",
                        "displayName": "VM.Standard3.Flex",
                        "shape": "VM.Standard3.Flex",
                        "ocpus": 1,
                        "memoryInGBs": 16,
                        "ocpuOptions": {
                            "min": 1,
                            "max": 56,
                            "maxPerNumaNode": 32
                        },
                        "memoryOptions": {
                            "minInGBs": 1,
                            "maxInGBs": 896,
                            "defaultPerOcpuInGBs": 16,
                            "minPerOcpuInGBs": 1,
                            "maxPerOcpuInGBs": 64,
                            "maxPerNumaNodeInGBs": 512
                        },
                        "isFlexible": true
                    },
                    {
                        "id": "VM.DenseIO2.8",
                        "displayName": "VM.DenseIO2.8",
                        "shape": "VM.DenseIO2.8",
                        "ocpus": 8,
                        "memoryInGBs": 120,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.DenseIO2.16",
                        "displayName": "VM.DenseIO2.16",
                        "shape": "VM.DenseIO2.16",
                        "ocpus": 16,
                        "memoryInGBs": 240,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.DenseIO2.24",
                        "displayName": "VM.DenseIO2.24",
                        "shape": "VM.DenseIO2.24",
                        "ocpus": 24,
                        "memoryInGBs": 320,
                        "isFlexible": false
                    },
                    {
                        "id": "VM.Standard1.1",
                        "displayName": "VM.Standard1.1",
                        "shape": "VM.Standard1.1",
                        "ocpus": 1,
                        "memoryInGBs": 7,
                        "isFlexible": false
                    }
                ],
                "image": [
                    {
                        "id": "Oracle-Linux-8.8-2023.08.31-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaavjvtr344mtwklu5dirue6ubplrowd2bd7ur4anqbk5u23jbbpta",
                        "displayName": "Oracle-Linux-8.8-2023.08.31-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux",
                        "operatingSystemVersion": "8",
                        "billableSizeInGBs": 5,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-8.8-2023.09.26-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa3ceen6r4koca7ai47yigikvlhxwrshopc4muy4b5mey7hvlvn4ua",
                        "displayName": "Oracle-Linux-8.8-2023.09.26-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux",
                        "operatingSystemVersion": "8",
                        "billableSizeInGBs": 5,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-8.8-aarch64-2023.08.31-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaayz3ii2zcj2xifw5guzwczwm4efmr5psjbq4asquxbkznsa4gpywa",
                        "displayName": "Oracle-Linux-8.8-aarch64-2023.08.31-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux",
                        "operatingSystemVersion": "8",
                        "billableSizeInGBs": 5,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-8.8-aarch64-2023.09.26-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaasdoxaqr6n6frbgtgyo4yskzb3lykam33cuyq6bbbomj4i7rfg7za",
                        "displayName": "Oracle-Linux-8.8-aarch64-2023.09.26-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux",
                        "operatingSystemVersion": "8",
                        "billableSizeInGBs": 5,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-8.8-aarch64-2023.10.24-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa6vfucy3skub4cvzlml37zyj5yfwwxmxxpi4ohqyaipbtywbiqdbq",
                        "displayName": "Oracle-Linux-8.8-aarch64-2023.10.24-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux",
                        "operatingSystemVersion": "8",
                        "billableSizeInGBs": 5,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-8.8-Gen2-GPU-2023.08.16-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaeytd25otcyrtqgm4hbhsneriiug53i6vj5iqxvypr7i5hjbnorma",
                        "displayName": "Oracle-Linux-8.8-Gen2-GPU-2023.08.16-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux",
                        "operatingSystemVersion": "8",
                        "billableSizeInGBs": 16,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-8.8-Gen2-GPU-2023.08.31-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa32dkkiktfbthgydvmwqv4w4ousz27hnjkdgqvr2dewc6pzulblaq",
                        "displayName": "Oracle-Linux-8.8-Gen2-GPU-2023.08.31-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux",
                        "operatingSystemVersion": "8",
                        "billableSizeInGBs": 16,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-8.8-Gen2-GPU-2023.09.26-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaacgftpjalmxuuywg5qpvodqfolbnbq36ao7u3w2vg2uatwswvq7da",
                        "displayName": "Oracle-Linux-8.8-Gen2-GPU-2023.09.26-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux",
                        "operatingSystemVersion": "8",
                        "billableSizeInGBs": 16,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-9.1-Minimal-2023.06.29-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa5jqrcmqjdwm2ws6l33zzq5bd3ryz6zotpws2lttwrmxn32gyqtjq",
                        "displayName": "Oracle-Linux-9.1-Minimal-2023.06.29-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux",
                        "operatingSystemVersion": "9 Minimal",
                        "billableSizeInGBs": 2,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-9.1-Minimal-2023.07.07-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaifhsgj6dwf4wwrxtnqhmxbzx5mnuiuydrc5umgccgnewotfhssya",
                        "displayName": "Oracle-Linux-9.1-Minimal-2023.07.07-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux",
                        "operatingSystemVersion": "9 Minimal",
                        "billableSizeInGBs": 2,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-9.2-2023.08.31-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaawhgkw376cfbnyu5ckmhgfwqmqapfjip4mzigth2dvs6zokhdlbaa",
                        "displayName": "Oracle-Linux-9.2-2023.08.31-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux",
                        "operatingSystemVersion": "9",
                        "billableSizeInGBs": 5,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-9.2-2023.09.26-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaojqrgcwxe5ft3tcoccighpeavtpnv5jcgi7pbvssqgibz7mczjeq",
                        "displayName": "Oracle-Linux-9.2-2023.09.26-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux",
                        "operatingSystemVersion": "9",
                        "billableSizeInGBs": 5,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-9.2-aarch64-2023.08.31-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa3d5w622nufqgh65mz654kedthshqzv2wyrpaxawiln4wmthqddzq",
                        "displayName": "Oracle-Linux-9.2-aarch64-2023.08.31-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux",
                        "operatingSystemVersion": "9",
                        "billableSizeInGBs": 5,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-9.2-aarch64-2023.09.26-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa57kek4gtk6exlfu7yijjsa26bdmm42ibogeqi7ehwah5fxd6ybda",
                        "displayName": "Oracle-Linux-9.2-aarch64-2023.09.26-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux",
                        "operatingSystemVersion": "9",
                        "billableSizeInGBs": 5,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-9.2-aarch64-2023.10.24-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaajqtbf3qbdw4g2hmkesulzczu3xz4pwt3xcu6igetqyzupk2zmhyq",
                        "displayName": "Oracle-Linux-9.2-aarch64-2023.10.24-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux",
                        "operatingSystemVersion": "9",
                        "billableSizeInGBs": 5,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-Cloud-Developer-8.4-2021.08.27-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaqb6vgjln2bsdvlkdk2eqov5hhqbyffodkto2qimvab4mvh4q567q",
                        "displayName": "Oracle-Linux-Cloud-Developer-8.4-2021.08.27-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux Cloud Developer",
                        "operatingSystemVersion": "8",
                        "billableSizeInGBs": 19,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-Cloud-Developer-8.4-aarch64-2021.08.27-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaxklyc53k6bq3kpuwrk5qroa2o7c62el3zlytpzgwel5672rxhslq",
                        "displayName": "Oracle-Linux-Cloud-Developer-8.4-aarch64-2021.08.27-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux Cloud Developer",
                        "operatingSystemVersion": "8",
                        "billableSizeInGBs": 14,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-Cloud-Developer-8.5-2022.05.22-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaetscnayepwj2lto7mpgiwtom4jwkqafr3axumt3pt32cgwczkexq",
                        "displayName": "Oracle-Linux-Cloud-Developer-8.5-2022.05.22-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux Cloud Developer",
                        "operatingSystemVersion": "8",
                        "billableSizeInGBs": 24,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-Cloud-Developer-8.5-aarch64-2022.05.22-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa7eri25ls63d2p7xv5nya3pur7jmqx52b2wimvtm5rqff7tdknfqq",
                        "displayName": "Oracle-Linux-Cloud-Developer-8.5-aarch64-2022.05.22-0",
                        "platform": true,
                        "operatingSystem": "Oracle Linux Cloud Developer",
                        "operatingSystemVersion": "8",
                        "billableSizeInGBs": 18,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-Cloud-Developer-8.7-2023.04.28-1",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa6qwzc4uls73pdpzs62iwn2yrzcwsofgrlmyhwxsidckf3gv2jb3a",
                        "displayName": "Oracle-Linux-Cloud-Developer-8.7-2023.04.28-1",
                        "platform": true,
                        "operatingSystem": "Oracle Linux Cloud Developer",
                        "operatingSystemVersion": "8",
                        "billableSizeInGBs": 25,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Oracle-Linux-Cloud-Developer-8.7-aarch64-2023.04.28-2",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaagurr5xbexgbpxohardzehiaqngfiayltzj23iqr6csi26yxxszyq",
                        "displayName": "Oracle-Linux-Cloud-Developer-8.7-aarch64-2023.04.28-2",
                        "platform": true,
                        "operatingSystem": "Oracle Linux Cloud Developer",
                        "operatingSystemVersion": "8",
                        "billableSizeInGBs": 22,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2012-R2-Datacenter-Edition-BM-2020.11.14-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaana2indon2ulc6lqrp75fltwbsk6fubd4rquzlcfpngazurqyajcq",
                        "displayName": "Windows-Server-2012-R2-Datacenter-Edition-BM-2020.11.14-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2012 R2 Datacenter",
                        "billableSizeInGBs": 0,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2012-R2-Datacenter-Edition-BM-2020.12.15-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaagy5l2buh4xgdxdhfvil6p6jdz7qq4xzp65oljimcxm76bvlp2mta",
                        "displayName": "Windows-Server-2012-R2-Datacenter-Edition-BM-2020.12.15-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2012 R2 Datacenter",
                        "billableSizeInGBs": 0,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2012-R2-Datacenter-Edition-BM-2021.02.19-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaafjps6xxdbso6dglzj5n72smkb5oqm6acxdffyip4jp3ifc3hh4vq",
                        "displayName": "Windows-Server-2012-R2-Datacenter-Edition-BM-2021.02.19-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2012 R2 Datacenter",
                        "billableSizeInGBs": 0,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-2023.08.18-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa3oq3bx2n4svg6htgufwfw5skv65yxlu6pvfmajx2n3xsdss3ieva",
                        "displayName": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-2023.08.18-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2012 R2 Datacenter",
                        "billableSizeInGBs": 16,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-2023.09.13-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaay5iow5zup22qvz7b6ysguu6qvu7r75bnh6nmdmq5pnv463xxzmea",
                        "displayName": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-2023.09.13-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2012 R2 Datacenter",
                        "billableSizeInGBs": 16,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaawkised76l52newl3a6foc5cf5sb6fhn4yms3ofy3nsa3jvrejzua",
                        "displayName": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2012 R2 Datacenter",
                        "billableSizeInGBs": 16,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-DenseIO-2023.08.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaayhfkstcbys73x6sjsu3zkp3ce4jjlu4l3yxpxfq4o6hvkrpd4wva",
                        "displayName": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-DenseIO-2023.08.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2012 R2 Datacenter",
                        "billableSizeInGBs": 16,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-DenseIO-2023.09.12-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa6csd6u6qu2dhig55s7whqg4fkaefe4gw6lnbhfen6gwnu25aurgq",
                        "displayName": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-DenseIO-2023.09.12-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2012 R2 Datacenter",
                        "billableSizeInGBs": 16,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-DenseIO-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaatkqm6rm47hanzwi7gfncczesqdhajcd3jvfiijg7azkrzz3wudpq",
                        "displayName": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-DenseIO-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2012 R2 Datacenter",
                        "billableSizeInGBs": 16,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-E2-2023.08.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaiss6rbotuxyzsjmapyunup6axi4fqozngy6mx6moccbgydknvlra",
                        "displayName": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-E2-2023.08.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2012 R2 Datacenter",
                        "billableSizeInGBs": 16,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-E2-2023.09.13-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaag2mq2wor4hddpd7gyy6efb6dcw2ps6geaey3hjjcja2jasrwtlqq",
                        "displayName": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-E2-2023.09.13-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2012 R2 Datacenter",
                        "billableSizeInGBs": 16,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-E2-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa2rv6dvadz6r4qjbaimbl5k3n3vucingizaqwtc6jffn4yxspjzgq",
                        "displayName": "Windows-Server-2012-R2-Datacenter-Edition-BM-Gen2-E2-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2012 R2 Datacenter",
                        "billableSizeInGBs": 17,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2012-R2-Standard-Edition-VM-2023.08.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaamghvx4lejd2qf65dnrvybod7skz27rvdk7xiuuhvn3txrix7e4ja",
                        "displayName": "Windows-Server-2012-R2-Standard-Edition-VM-2023.08.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2012 R2 Standard",
                        "billableSizeInGBs": 17,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2012-R2-Standard-Edition-VM-2023.09.12-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaapnkyhuaofy6j3pzcqyi5nbcgdh6jyrem5gkwd443tdndaq5uo2tq",
                        "displayName": "Windows-Server-2012-R2-Standard-Edition-VM-2023.09.12-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2012 R2 Standard",
                        "billableSizeInGBs": 17,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2012-R2-Standard-Edition-VM-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa373hvvmkqwe6d4rgjeyw53xbnqjiynxtgtnnguvazouvqdiyhlia",
                        "displayName": "Windows-Server-2012-R2-Standard-Edition-VM-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2012 R2 Standard",
                        "billableSizeInGBs": 16,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-2023.08.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaapp7gclgqa3cejw2l6jzdooz3lm45ye6ndy36axaqqdrenruyenq",
                        "displayName": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-2023.08.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Datacenter",
                        "billableSizeInGBs": 19,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-2023.09.12-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaikf5lqiukt3mz5bfmzpy3eyoke5midsxpyojo45re2vhmtefkz6q",
                        "displayName": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-2023.09.12-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Datacenter",
                        "billableSizeInGBs": 19,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaadx6e77q52o5mueion73ypjhiphs4klwk7skltdmrcimc7nj52pyq",
                        "displayName": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Datacenter",
                        "billableSizeInGBs": 19,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-DenseIO-2023.08.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa5dlweaso4fggxbnpifmxyormfbivm4uekulbpxokrkbabk5tr4ja",
                        "displayName": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-DenseIO-2023.08.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Datacenter",
                        "billableSizeInGBs": 19,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-DenseIO-2023.09.12-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaxrs27hbtykmxxehdugxhdoznbem3xukpjeddh3ys5yhwrcn4xyhq",
                        "displayName": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-DenseIO-2023.09.12-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Datacenter",
                        "billableSizeInGBs": 19,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-DenseIO-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaj3rzotu7wiib2naodew5c3dciwv743iu67byz5kw4s6h4cqmqkqa",
                        "displayName": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-DenseIO-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Datacenter",
                        "billableSizeInGBs": 19,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-E2-2023.08.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaajl5zo6jpqofyulwb646su2kh4y5dndm4y2obohmrexnqci4k5meq",
                        "displayName": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-E2-2023.08.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Datacenter",
                        "billableSizeInGBs": 19,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-E2-2023.09.12-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaajrv23tsimlnyc33h2pn4sz55hbkfqc2yu3urow6ne3tht7x5x3dq",
                        "displayName": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-E2-2023.09.12-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Datacenter",
                        "billableSizeInGBs": 19,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-E2-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaayrvq76ruu2lldygp5x5nlq5twelblqx7izhdhv7c3v6whr5wvxka",
                        "displayName": "Windows-Server-2016-Datacenter-Edition-BM-Gen2-E2-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Datacenter",
                        "billableSizeInGBs": 19,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Datacenter-Edition-BM-X9-2023.08.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa72whec63chjxkxtftpnsx3tcpoimolpfqd76kyxhfmpibjba2pla",
                        "displayName": "Windows-Server-2016-Datacenter-Edition-BM-X9-2023.08.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Datacenter",
                        "billableSizeInGBs": 19,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Datacenter-Edition-BM-X9-2023.09.12-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaacmsvxf4c6w2ryr2br5vwc6gdonspkiyhcs4jhryt3qsp45vjpvqq",
                        "displayName": "Windows-Server-2016-Datacenter-Edition-BM-X9-2023.09.12-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Datacenter",
                        "billableSizeInGBs": 19,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Datacenter-Edition-BM-X9-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaksvihvoouds6azfahngatg6gccqz64yh3llnxi2iw266oxrvfaca",
                        "displayName": "Windows-Server-2016-Datacenter-Edition-BM-X9-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Datacenter",
                        "billableSizeInGBs": 19,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Standard-Core-VM-2023.08.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaw32phe3x2d6vqoiyyfd5cfq7zevly576rpu27wzhj6mdoeah6hya",
                        "displayName": "Windows-Server-2016-Standard-Core-VM-2023.08.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Standard Core",
                        "billableSizeInGBs": 12,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Standard-Core-VM-2023.09.25-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaagbm3mbe5vnf2mj4da23c5hbcc5xzk5sc5yserkoq4b3xymconeaq",
                        "displayName": "Windows-Server-2016-Standard-Core-VM-2023.09.25-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Standard Core",
                        "billableSizeInGBs": 13,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Standard-Core-VM-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa76cuacdnuqr6ypuincxb6kwlgtstcs4y5uyqgbtzqosdkgs4vfxa",
                        "displayName": "Windows-Server-2016-Standard-Core-VM-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Standard Core",
                        "billableSizeInGBs": 13,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Standard-Edition-VM-2023.08.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa66f2u7ol7h5it5xxzwlgix66w5uyhbes74ubfkjitdhx7km64jfq",
                        "displayName": "Windows-Server-2016-Standard-Edition-VM-2023.08.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Standard",
                        "billableSizeInGBs": 19,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Standard-Edition-VM-2023.09.16-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaakk5trd5qnrl3da7sp66lphdgmidzvtaj5srxk7gob6kahzxedhya",
                        "displayName": "Windows-Server-2016-Standard-Edition-VM-2023.09.16-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Standard",
                        "billableSizeInGBs": 19,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Standard-Edition-VM-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaagnkptgdvsm3b2gzdfemewylwjk3eoxr42zo6ajj2cj5ptfckfafa",
                        "displayName": "Windows-Server-2016-Standard-Edition-VM-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Standard",
                        "billableSizeInGBs": 19,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Standard-Edition-VM-B1-2021.02.13-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaamlgwcimkrqeewbf6zirjimv5gjzw3lhnkvikqvclofu653ff3vqq",
                        "displayName": "Windows-Server-2016-Standard-Edition-VM-B1-2021.02.13-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Standard",
                        "billableSizeInGBs": 0,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2016-Standard-Edition-VM-B1-2021.03.18-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaauhus3b5zhaekm4ttw4vdgk3cnhdhmute7aomuyzvylbqrqf7xxiq",
                        "displayName": "Windows-Server-2016-Standard-Edition-VM-B1-2021.03.18-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2016 Standard",
                        "billableSizeInGBs": 0,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Datacenter-Edition-BM-E3-2023.08.18-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaad5qazkyorzsbkyettoxy6ubbjs4sqbzjqtzuvrj4fsr5e3jhshra",
                        "displayName": "Windows-Server-2019-Datacenter-Edition-BM-E3-2023.08.18-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Datacenter-Edition-BM-E3-2023.09.12-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaakoverkakqqnsp3b4ws5hbgelxs5znvpt5p2c6cori7xrevy2a3va",
                        "displayName": "Windows-Server-2019-Datacenter-Edition-BM-E3-2023.09.12-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Datacenter-Edition-BM-E3-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa56u2u2jq22hvjrjij7fdwx72523x3k5bm6ms2ljc7jmsvlfsujua",
                        "displayName": "Windows-Server-2019-Datacenter-Edition-BM-E3-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Datacenter-Edition-BM-E4-2023.07.12-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa7l3s6j4emxt4agexvr6sk7fd7p2tabcvoqj5yuj24yeyrdylss2a",
                        "displayName": "Windows-Server-2019-Datacenter-Edition-BM-E4-2023.07.12-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Datacenter-Edition-BM-E4-2023.09.25-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa6ibo5bnugdszikrtmco32yn33ql5mwamziiay5lredpjdjyjil6a",
                        "displayName": "Windows-Server-2019-Datacenter-Edition-BM-E4-2023.09.25-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Datacenter-Edition-BM-E4-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaay36hxk42bvtmdlcs2lyxj5qb25b362at56h3npmgvsxszd7b5xna",
                        "displayName": "Windows-Server-2019-Datacenter-Edition-BM-E4-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Datacenter-Edition-BM-E4-DenseIO-2023.10.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaoqoq2oaugv77iz5wb2kejibkb4ns3h6crmwyylox34bqcltdgfzq",
                        "displayName": "Windows-Server-2019-Datacenter-Edition-BM-E4-DenseIO-2023.10.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Datacenter-Edition-BM-E5-2023.08.28-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaua7hly6syk56cihmru6dmemq3b6wab6iehz7gj4rie6si6kridpq",
                        "displayName": "Windows-Server-2019-Datacenter-Edition-BM-E5-2023.08.28-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Datacenter-Edition-BM-E5-2023.09.13-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaacwkaholts3dwydhhuipysth5b6fv5yo5nn7mzscxixqyzutmvnna",
                        "displayName": "Windows-Server-2019-Datacenter-Edition-BM-E5-2023.09.13-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Datacenter-Edition-BM-E5-2023.10.12-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaazftxzesdfsmhfcfc3toicrm7ogopk3zxc6klv7wpdtp57gxnq2ya",
                        "displayName": "Windows-Server-2019-Datacenter-Edition-BM-E5-2023.10.12-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Datacenter-Edition-BM-X9-2023.08.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaanm7dlvvoydkdwh6lqopj6eqx7jusyrdi5ivfmshpsqkxe6sruk2a",
                        "displayName": "Windows-Server-2019-Datacenter-Edition-BM-X9-2023.08.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Datacenter-Edition-BM-X9-2023.09.28-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaxwntoayd4nhkkr46lpry2jg6zqvrl32mgfgztiriys5svfvmadlq",
                        "displayName": "Windows-Server-2019-Datacenter-Edition-BM-X9-2023.09.28-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Datacenter-Edition-BM-X9-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaan2psuulx7ve4wvmyzo6g5ac22sxkhv34yhn374ncxn3c2sfzg3dq",
                        "displayName": "Windows-Server-2019-Datacenter-Edition-BM-X9-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Standard-Core-VM-2023.08.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa43ec23obeap2wm5pjtj6t3dijtnyuzloaydipvxeodokm4muuznq",
                        "displayName": "Windows-Server-2019-Standard-Core-VM-2023.08.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Standard Core",
                        "billableSizeInGBs": 11,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Standard-Core-VM-2023.09.28-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa3dehpxyt3re4ehrdzbx7bqbvb5wxikifukopaz6nh5exkcjihkhq",
                        "displayName": "Windows-Server-2019-Standard-Core-VM-2023.09.28-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Standard Core",
                        "billableSizeInGBs": 11,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Standard-Core-VM-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaapfyl3c5wyymoo32z6nhrif4uwlaftksw5ek3jyl5gdcxpal5k3eq",
                        "displayName": "Windows-Server-2019-Standard-Core-VM-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Standard Core",
                        "billableSizeInGBs": 11,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Standard-Edition-VM-2023.08.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaag2tv4l7o6znlgjgenvtq2kbifdwcpsxgasseeztl474xuoqc5jxq",
                        "displayName": "Windows-Server-2019-Standard-Edition-VM-2023.08.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Standard",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Standard-Edition-VM-2023.09.28-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaifvzqwqjsrocgtzxgt2nc7vh7fuhhflnvjvbos3rp5dvqwlbztlq",
                        "displayName": "Windows-Server-2019-Standard-Edition-VM-2023.09.28-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Standard",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Standard-Edition-VM-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa3wxen5x4guhi5bqvmd33ig7vlgyz4vygglkx6syih7mmry2aplha",
                        "displayName": "Windows-Server-2019-Standard-Edition-VM-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Standard",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Standard-Edition-VM-Gen2-2023.08.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaang3lmsqvub2e5fr4l4y6mqgkcxjbo6467kjvljpwf2edrcgwcwyq",
                        "displayName": "Windows-Server-2019-Standard-Edition-VM-Gen2-2023.08.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Standard",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Standard-Edition-VM-Gen2-2023.09.12-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaafmgcmmqvvykwobmzu6mj5utv5qufbi4vajeario4ob25xitdaatq",
                        "displayName": "Windows-Server-2019-Standard-Edition-VM-Gen2-2023.09.12-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Standard",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2019-Standard-Edition-VM-Gen2-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa3wsk76elqe65kj2e6z6ens3qodkp6wv5azkehuvsvx5jmn7bo7ja",
                        "displayName": "Windows-Server-2019-Standard-Edition-VM-Gen2-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2019 Standard",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Datacenter-Edition-BM-E3-2023.08.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaadjqqpicvyqztvdq6alxps7sefpftskdegd4equdwhlia7gfomvka",
                        "displayName": "Windows-Server-2022-Datacenter-Edition-BM-E3-2023.08.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Datacenter",
                        "billableSizeInGBs": 14,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Datacenter-Edition-BM-E3-2023.09.12-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa5bd73ejwflvyysl3h3qme64rhlw2cvoh52sgf62dqcg55u6h7bnq",
                        "displayName": "Windows-Server-2022-Datacenter-Edition-BM-E3-2023.09.12-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Datacenter-Edition-BM-E3-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaautdinv4z7kfvgsqigdzsowqov6ntgjyj4spybrfp4m3etywdabfa",
                        "displayName": "Windows-Server-2022-Datacenter-Edition-BM-E3-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Datacenter-Edition-BM-E4-2023.06.13-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa32bz6fts36j7odvrvlz2ymbxg4eka7vjuxrwjkj277ysetiksjwa",
                        "displayName": "Windows-Server-2022-Datacenter-Edition-BM-E4-2023.06.13-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Datacenter",
                        "billableSizeInGBs": 14,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Datacenter-Edition-BM-E4-2023.09.28-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaaaifvdkueydxv6f544kg2zzvrds76whtmoqedyy76aw4z57vdinbq",
                        "displayName": "Windows-Server-2022-Datacenter-Edition-BM-E4-2023.09.28-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Datacenter-Edition-BM-E4-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa2rqyuc774vgeicynroksjzqp6owejo7u77jgoav4tr2icicthhna",
                        "displayName": "Windows-Server-2022-Datacenter-Edition-BM-E4-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Datacenter-Edition-BM-E4-DenseIO-2023.10.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaahyw5udamvza5pjcexfuqwxi3qyduy5fqqc3fiiud372h4b5mrjla",
                        "displayName": "Windows-Server-2022-Datacenter-Edition-BM-E4-DenseIO-2023.10.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Datacenter-Edition-BM-E5-2023.08.28-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaarhwk7mm2xs2rhjjgl67pszm4gr3rbel6ypuuape53zsnutmhir7q",
                        "displayName": "Windows-Server-2022-Datacenter-Edition-BM-E5-2023.08.28-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Datacenter-Edition-BM-E5-2023.09.12-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa2xqwps52kgu5n6kd6zltm6qggaj3liblwolnkbgpeyicwi6isssa",
                        "displayName": "Windows-Server-2022-Datacenter-Edition-BM-E5-2023.09.12-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Datacenter-Edition-BM-E5-2023.10.18-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaajuz2lfajz4ndghahzhqs7imxfyr5n3q3ysonkp4lmnmbdhlzquka",
                        "displayName": "Windows-Server-2022-Datacenter-Edition-BM-E5-2023.10.18-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Datacenter-Edition-BM-X9-2023.08.21-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa2orwvmoh5lyds7ricl5cglw56dlgwk7org454nsxtfiyaoazbazq",
                        "displayName": "Windows-Server-2022-Datacenter-Edition-BM-X9-2023.08.21-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Datacenter",
                        "billableSizeInGBs": 14,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Datacenter-Edition-BM-X9-2023.09.12-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaavphns4kfejfbpfnouvuynfqquk2quwwmviryea5uxvbzd4se5xla",
                        "displayName": "Windows-Server-2022-Datacenter-Edition-BM-X9-2023.09.12-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Datacenter-Edition-BM-X9-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaacpgecsis4uib6semonh7qs2ihfcvutjudnbrt7vayzbjcg3zpddq",
                        "displayName": "Windows-Server-2022-Datacenter-Edition-BM-X9-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Datacenter",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Standard-Core-VM-2023.08.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa43ca5iw5bkmlt2d3eljpknt2so2d3few5jxbe6f2dogqaaon4ctq",
                        "displayName": "Windows-Server-2022-Standard-Core-VM-2023.08.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Standard Core",
                        "billableSizeInGBs": 10,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Standard-Core-VM-2023.09.28-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa3ve2ksttb77ppinjveuidxxjxj4ihdzblomodfyz2sgeztjx3h5a",
                        "displayName": "Windows-Server-2022-Standard-Core-VM-2023.09.28-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Standard Core",
                        "billableSizeInGBs": 10,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Standard-Core-VM-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaacvcwy5bk734hiqyzrjvms7ul7wltehygkyqrbxtrjy36zyamnqna",
                        "displayName": "Windows-Server-2022-Standard-Core-VM-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Standard Core",
                        "billableSizeInGBs": 10,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Standard-Edition-VM-2023.08.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaasavtuumtttwfvxmcu5xasenqxt33xtrbsgbpbsayjzubm6wnj4xa",
                        "displayName": "Windows-Server-2022-Standard-Edition-VM-2023.08.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Standard",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Standard-Edition-VM-2023.09.28-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaavkxhtuzhixo37ecjl4lv6xihly7g7t755pjj6f3vbgo4ufyvuv6q",
                        "displayName": "Windows-Server-2022-Standard-Edition-VM-2023.09.28-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Standard",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Standard-Edition-VM-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaad7kypautkrn6l5ilxhklodgx3tw5lsmvook6dg3ki2pwd6quvzta",
                        "displayName": "Windows-Server-2022-Standard-Edition-VM-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Standard",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Standard-Edition-VM-PV-2023.08.17-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaay2ufiigku7nn32hvqdfz7v3nuzvvefffyhy2ltmtbqzu5zw2pfuq",
                        "displayName": "Windows-Server-2022-Standard-Edition-VM-PV-2023.08.17-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Standard",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Standard-Edition-VM-PV-2023.09.12-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaa5b5vwziwhqbmygidxdj4u2cw2qcl36emh66yj2fqjuyng7375k6a",
                        "displayName": "Windows-Server-2022-Standard-Edition-VM-PV-2023.09.12-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Standard",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    },
                    {
                        "id": "Windows-Server-2022-Standard-Edition-VM-PV-2023.10.10-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaahvb5iqb6w36h5fndvzugt7ot4mnhj5eyzy47pkyhqrnqwkifctzq",
                        "displayName": "Windows-Server-2022-Standard-Edition-VM-PV-2023.10.10-0",
                        "platform": true,
                        "operatingSystem": "Windows",
                        "operatingSystemVersion": "Server 2022 Standard",
                        "billableSizeInGBs": 15,
                        "lifecycleState": "AVAILABLE"
                    }
                ],
                "loadbalancer_shape": [
                    {
                        "id": "100Mbps",
                        "displayName": "100Mbps"
                    },
                    {
                        "id": "10Mbps",
                        "displayName": "10Mbps"
                    },
                    {
                        "id": "10Mbps-Micro",
                        "displayName": "10Mbps-Micro"
                    },
                    {
                        "id": "400Mbps",
                        "displayName": "400Mbps"
                    },
                    {
                        "id": "8000Mbps",
                        "displayName": "8000Mbps"
                    },
                    {
                        "id": "flexible",
                        "displayName": "flexible"
                    }
                ],
                "mysql_configuration": [
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa26nlo52flargskecrmud73p52wwpy7xzjzzgo5iomgo3goc3akca",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E4.16.256GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.16.256GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E4.16.256GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa2koim2r6pizx6bj7pdy2posfwkq4odpifpvshv5jmtyloy3q5mha",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard2.8.120GB MySQL shape",
                        "displayName": "MySQL.VM.Standard2.8.120GB.HA",
                        "shapeName": "MySQL.VM.Standard2.8.120GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa2tiusjgxkqd344nbiv32rquejgzzo5mgwmvlpg2cay5ixl7sjv3a",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E3.64.1024GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.64.1024GB.HA",
                        "shapeName": "MySQL.VM.Standard.E3.64.1024GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa2yczw2eaowlqiba4uvth766rbotrzw5febndxavguvmtlxpnd7ya",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard2.2.30GB MySQL shape",
                        "displayName": "MySQL.VM.Standard2.2.30GB.Standalone",
                        "shapeName": "MySQL.VM.Standard2.2.30GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa3bq2urdkaelxnax6g5baalvlolycqj7jsej4opeas72bithrdkma",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.HeatWave.BM.Standard.E3 MySQL shape",
                        "displayName": "MySQL.HeatWave.BM.Standard.E3.HA",
                        "shapeName": "MySQL.HeatWave.BM.Standard.E3",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa3f6iv2rkbdp42b2kfva6cehyv7cx7dmdzv6ru6in2ggzol3syrhq",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard3.1.8GB MySQL shape",
                        "displayName": "MySQL.VM.Standard3.1.8GB.Standalone",
                        "shapeName": "MySQL.VM.Standard3.1.8GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa3fdnxjpva46q3pj32cqrt4apuj3qjxhnebvp76mncbgoqzqsqsra",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Optimized3.1.8GB MySQL shape",
                        "displayName": "MySQL.VM.Optimized3.1.8GB.Standalone",
                        "shapeName": "MySQL.VM.Optimized3.1.8GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa3y7j4wbmf2ario7ewje56g57xjwa2txjca23rbmnegjve2lvsmzq",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard2.16.240GB MySQL shape",
                        "displayName": "MySQL.VM.Standard2.16.240GB.Standalone",
                        "shapeName": "MySQL.VM.Standard2.16.240GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa4jspw336zo5vwll4c3lah7ly6qkmfi7pqzi5j3v62hx26uhgh6na",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Optimized3.8.128GB MySQL shape",
                        "displayName": "MySQL.VM.Optimized3.8.128GB.HA",
                        "shapeName": "MySQL.VM.Optimized3.8.128GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa5py6xcq5ck7hbl57zrsaxxfllteaeil3v2mncgh5riykonyzstzq",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E4.64.1024GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.64.1024GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E4.64.1024GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa6ga2du5k3njy4ytmerm2qfjqfgjsyxyphz5zh2lu3hu35qipyida",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard2.16.240GB MySQL shape",
                        "displayName": "MySQL.VM.Standard2.16.240GB.HA",
                        "shapeName": "MySQL.VM.Standard2.16.240GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa6gzccc6tzx2bf3mz2k3gxr2oytja62kwgbopiwol5fk74ymdrqaq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E4.48.768GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.48.768GB.HA",
                        "shapeName": "MySQL.VM.Standard.E4.48.768GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa6nmmddkoufaegfqk2k2wb76ysrdtyrlvdi6jd6l2fuj6ccu65hra",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E4.24.384GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.24.384GB.HA",
                        "shapeName": "MySQL.VM.Standard.E4.24.384GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa6pxyzjrtsldmu34ynebrvf4ev535qqk4foxqrblnmfr6fym5bm2q",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E3.8.128GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.8.128GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E3.8.128GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa6q6vod4vlo5pn7w3blmjxouv4dv3ke24zt4dhat7jqmwhh2bnltq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E3.48.768GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.48.768GB.HA",
                        "shapeName": "MySQL.VM.Standard.E3.48.768GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa6yslaz4xogaug2je4mrs4y7nlwjq7aa6ibxdtsmy2bnkfr6ddisq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.HeatWave.VM.Standard MySQL shape",
                        "displayName": "MySQL.HeatWave.VM.Standard.HA",
                        "shapeName": "MySQL.HeatWave.VM.Standard",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa7egfen5wqdbomuwvs3lbwymkc2icnk6dz5gbxxv3zrqt4ul3iduq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E4.2.32GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.2.32GB.HA",
                        "shapeName": "MySQL.VM.Standard.E4.2.32GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa7ewo34kv6p22ajfugubmag6xw36wg72x2royy6lw7d3ywovx6dba",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard3.16.256GB MySQL shape",
                        "displayName": "MySQL.VM.Standard3.16.256GB.Standalone",
                        "shapeName": "MySQL.VM.Standard3.16.256GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaa7fbylioppx5ngfmkxsily3nufw7lb25p3bchbzhj3phc6rka2faa",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard3.32.512GB MySQL shape",
                        "displayName": "MySQL.VM.Standard3.32.512GB.HA",
                        "shapeName": "MySQL.VM.Standard3.32.512GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaa7jrviyhlb5soiiz7uxbx2xsddejg5jugbdhkywbdwwv4djwjz2a",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard2.4.60GB MySQL shape",
                        "displayName": "MySQL.VM.Standard2.4.60GB.HA",
                        "shapeName": "MySQL.VM.Standard2.4.60GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaajpjse523ql7fifxlt7cwsw6udq2ntu24wjedpyduidpma4lnt3a",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.HeatWave.BM.Standard MySQL shape",
                        "displayName": "MySQL.HeatWave.BM.Standard.Standalone",
                        "shapeName": "MySQL.HeatWave.BM.Standard",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaavhelxgtp66zei5wh7boou7irb7xd4s67tfi7j6g2q3p32uy5qba",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard2.8.120GB MySQL shape",
                        "displayName": "MySQL.VM.Standard2.8.120GB.Standalone",
                        "shapeName": "MySQL.VM.Standard2.8.120GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaabvjgz4wjxhiukpw432trj7usmcczuvmuoehyoikubcpuwvkdqb7a",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard3.2.32GB MySQL shape",
                        "displayName": "MySQL.VM.Standard3.2.32GB.HA",
                        "shapeName": "MySQL.VM.Standard3.2.32GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaac6h7ahgdlhpuwf2uhn3p7pnnvisyb43pvt7ossw6b3suc6ikklxq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.HeatWave.VM.Standard.E3 MySQL shape",
                        "displayName": "MySQL.HeatWave.VM.Standard.E3.HA",
                        "shapeName": "MySQL.HeatWave.VM.Standard.E3",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaac7fn7uj45b2rfqmstmuhjcvmwrn5stzbify34qci2imf5el3b3jq",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Optimized3.16.256GB MySQL shape",
                        "displayName": "MySQL.VM.Optimized3.16.256GB.Standalone",
                        "shapeName": "MySQL.VM.Optimized3.16.256GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaacmprv4xraedqw3zk6ls6jweiold3gsbtfigxf4xujuwq3nxaqava",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E3.32.512GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.32.512GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E3.32.512GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaegi6wwci2buv2duyoklhbulhmiztesp6eynqvruclupmaxo52d5a",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E3.32.512GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.32.512GB.HA",
                        "shapeName": "MySQL.VM.Standard.E3.32.512GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaep75r2j453khbhuq7kfmxnefskx4wdw5he4r7rnr75fvkrtzkf6q",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E3.48.768GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.48.768GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E3.48.768GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaerrqpmk5xjfa2cf2bdmykloy6sgk2yynrvzhwaetcqdoebag5viq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard2.2.30GB MySQL shape",
                        "displayName": "MySQL.VM.Standard2.2.30GB.HA",
                        "shapeName": "MySQL.VM.Standard2.2.30GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaafa5ut52uagjd6fqezslzjqwltldqt6od6fuurjzs7daom7bq5sbq",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E4.1.8GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.1.8GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E4.1.8GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaafbsxowzfzxnnvm5mmmutrfl73hs2cv7ujgs7zqnzzw7v52fvihda",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E3.16.256GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.16.256GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E3.16.256GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaafhmjjf6l5pl2vwcqdmmqs25sq7d2d5rvobnf2h3cpz7p5734wynq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E4.64.1024GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.64.1024GB.HA",
                        "shapeName": "MySQL.VM.Standard.E4.64.1024GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaafj37osg5yctpydj3whzqp2tuhigwhf3457mgdsm7mk6lf2osnsja",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E4.2.32GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.2.32GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E4.2.32GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaafligyw7i6sbgk562m767eh5oqeswuu5hfvml4zfbjeeja7l72hya",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard3.8.128GB MySQL shape",
                        "displayName": "MySQL.VM.Standard3.8.128GB.Standalone",
                        "shapeName": "MySQL.VM.Standard3.8.128GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaafm2qwehni4ruh24kk4afr3zjrgzjtsjzec5cqtg2ezytydcq6jzq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E4.32.512GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.32.512GB.HA",
                        "shapeName": "MySQL.VM.Standard.E4.32.512GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaafnjyqej2hkh7or2rhq2p3nvfrzlgjjeqsjqm7bbzs7svnarb75xa",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E3.16.256GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.16.256GB.HA",
                        "shapeName": "MySQL.VM.Standard.E3.16.256GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaafwud3povxm4xtujtlu3alzqptcjasjqihqygbwsjkq4l2a6sptuq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E4.4.64GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.4.64GB.HA",
                        "shapeName": "MySQL.VM.Standard.E4.4.64GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaafyi2bmxwhe2rqvebtdss4eytkxffor6fkufuiosyg7cymjfycoza",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard3.16.256GB MySQL shape",
                        "displayName": "MySQL.VM.Standard3.16.256GB.HA",
                        "shapeName": "MySQL.VM.Standard3.16.256GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaag26xuefn7clisyk3crjwhzpbehow5nje5tf46ljuxqahobv4c7sq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard3.1.16GB MySQL shape",
                        "displayName": "MySQL.VM.Standard3.1.16GB.HA",
                        "shapeName": "MySQL.VM.Standard3.1.16GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaag5annd2ank2lt6sbrtqetajij4stytcdxdhk5f7jdxruroay45pq",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard3.4.64GB MySQL shape",
                        "displayName": "MySQL.VM.Standard3.4.64GB.Standalone",
                        "shapeName": "MySQL.VM.Standard3.4.64GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaah4ayiyeentcvebzlc5zw3u5otdlpupwkoyj566dukhp4ymz2yseq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E3.2.32GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.2.32GB.HA",
                        "shapeName": "MySQL.VM.Standard.E3.2.32GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaah6o6qu3gdbxnqg6aw56amnosmnaycusttaa7abyq2tdgpgubvsgh",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the BM.Standard.E2.64 MySQL shape",
                        "displayName": "BM.Standard.E2.64.Standalone",
                        "shapeName": "BM.Standard.E2.64",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaah6o6qu3gdbxnqg6aw56amnosmnaycusttaa7abyq2tdgpgubvsgi",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the VM.Standard.E2.1 MySQL shape",
                        "displayName": "VM.Standard.E2.1.Standalone",
                        "shapeName": "VM.Standard.E2.1",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaah6o6qu3gdbxnqg6aw56amnosmnaycusttaa7abyq2tdgpgubvsgj",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the VM.Standard.E2.2 MySQL shape",
                        "displayName": "VM.Standard.E2.2.Standalone",
                        "shapeName": "VM.Standard.E2.2",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaah6o6qu3gdbxnqg6aw56amnosmnaycusttaa7abyq2tdgpgubvsgk",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the VM.Standard.E2.4 MySQL shape",
                        "displayName": "VM.Standard.E2.4.Standalone",
                        "shapeName": "VM.Standard.E2.4",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaah6o6qu3gdbxnqg6aw56amnosmnaycusttaa7abyq2tdgpgubvsgl",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the VM.Standard.E2.8 MySQL shape",
                        "displayName": "VM.Standard.E2.8.Standalone",
                        "shapeName": "VM.Standard.E2.8",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaahgiqob6oo3cwcoq2nbc3u2wz4uwlwblgyes6veogg6rv564aexwq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E3.1.16GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.1.16GB.HA",
                        "shapeName": "MySQL.VM.Standard.E3.1.16GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaajeya2xmvgcwjqsuevsmgsry4frwpnfxyfpggkuff2kbh2hh2ugxq",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E3.24.384GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.24.384GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E3.24.384GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaakcaifahblxubyiwwf3vvxifxwbseewysc2slm5onah4qubewenrq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E4.1.16GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.1.16GB.HA",
                        "shapeName": "MySQL.VM.Standard.E4.1.16GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaakiu3jlycp2g4bwexkqcqhy7iyvoka2wdog647ia2rve4rbysw4ta",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard2.4.60GB MySQL shape",
                        "displayName": "MySQL.VM.Standard2.4.60GB.Standalone",
                        "shapeName": "MySQL.VM.Standard2.4.60GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaakremacvh2fizcznnja5rdxry2q4nyn27afjblyrimzjmrqblhfwa",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E3.2.32GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.2.32GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E3.2.32GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaalfzwdh47obgd6wyvrt6lnvzb2jccsv2vqzlj4zodvo66fkvvqifa",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Optimized3.1.16GB MySQL shape",
                        "displayName": "MySQL.VM.Optimized3.1.16GB.HA",
                        "shapeName": "MySQL.VM.Optimized3.1.16GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaalhjbtt5tffdk64tb477gcpwlgbxse54qga7brjfuwpneleizutva",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E3.8.128GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.8.128GB.HA",
                        "shapeName": "MySQL.VM.Standard.E3.8.128GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaalic45e2gauld2mwdpppzydow2sfkpcvecbfizkvgkhupezoi7oja",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E3.64.1024GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.64.1024GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E3.64.1024GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaltlykje6bwbanwbh6ojeslw4ecxzzcob47ie45c6udw7vyp25lka",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Optimized3.2.32GB MySQL shape",
                        "displayName": "MySQL.VM.Optimized3.2.32GB.Standalone",
                        "shapeName": "MySQL.VM.Optimized3.2.32GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaalwzc2a22xqm56fwjwfymixnulmbq3v77p5v4lcbb6qhkftxf2trq",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E3.1.8GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.1.8GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E3.1.8GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaam2bdlacmi4d2p33wx3aqqx5clnorpokoa6hxezz75rhw46xlj3ka",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E3.4.64GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.4.64GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E3.4.64GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaam56deq4t5ec7ju45gt3ho5szic6xjkuuws3mquoxqf6qxs2q74fq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.HeatWave.BM.Standard MySQL shape",
                        "displayName": "MySQL.HeatWave.BM.Standard.HA",
                        "shapeName": "MySQL.HeatWave.BM.Standard",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaamu6vnuiepzqy6k2tggvrgullz3izkgbsm675jz2toulann4nyxqa",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E4.1.16GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.1.16GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E4.1.16GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaan2a4h6ehgxem7asu3ti5cht42qwgumadfoedwlm2od6og7rs2qaa",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E4.48.768GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.48.768GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E4.48.768GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaanivlpzq2ewropx574nrmoghupa5gy54yfdre26e664q7rwujpyxq",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.HeatWave.VM.Standard.E3 MySQL shape",
                        "displayName": "MySQL.HeatWave.VM.Standard.E3.Standalone",
                        "shapeName": "MySQL.HeatWave.VM.Standard.E3",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaantprksu6phqfgr5xvyut46wdfesdszonbclybfwvahgysfjbrb4q",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E3.1.8GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.1.8GB.HA",
                        "shapeName": "MySQL.VM.Standard.E3.1.8GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaanvbmdcflvrwdduanjanhxrrqgroooinszv7wncievph7fmqhubqa",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E4.32.512GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.32.512GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E4.32.512GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaofsmc7gdxkdisbf4kos34riyldvuxwutdeafuo4rj22e2mrffl3a",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard2.1.15GB MySQL shape",
                        "displayName": "MySQL.VM.Standard2.1.15GB.Standalone",
                        "shapeName": "MySQL.VM.Standard2.1.15GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaoqgcwhegr5jwizxxpjl3jikgjmjwj2l4jaxirshv6hgqzk5lgpva",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard3.2.32GB MySQL shape",
                        "displayName": "MySQL.VM.Standard3.2.32GB.Standalone",
                        "shapeName": "MySQL.VM.Standard3.2.32GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaap7thcvkv3za4bbesmugyhtv7ogns7yvxiaw65c3c2efn22qb3iwa",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.HeatWave.BM.Standard.E3 MySQL shape",
                        "displayName": "MySQL.HeatWave.BM.Standard.E3.Standalone",
                        "shapeName": "MySQL.HeatWave.BM.Standard.E3",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaapcrvukjqberxt4oer6ykpd5bstm7ummprntze3szna46ddaxe5ka",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E4.1.8GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.1.8GB.HA",
                        "shapeName": "MySQL.VM.Standard.E4.1.8GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaapoexs7acdz6dq3jj7eqlmt3papcmvamkf2enguvlqtw5hvmqpgha",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard3.4.64GB MySQL shape",
                        "displayName": "MySQL.VM.Standard3.4.64GB.HA",
                        "shapeName": "MySQL.VM.Standard3.4.64GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaq5dioa6dxw3wm4pfcwygb5fvvzpdzrfexen6syrwu4m3s5grfzpq",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Optimized3.4.64GB MySQL shape",
                        "displayName": "MySQL.VM.Optimized3.4.64GB.Standalone",
                        "shapeName": "MySQL.VM.Optimized3.4.64GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaqbtdd66tjnfaxy3m7opshadwcxyme7q2sbdzdhte3uv5bfwhn7oa",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E4.8.128GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.8.128GB.HA",
                        "shapeName": "MySQL.VM.Standard.E4.8.128GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaroue27ea2a2aahfag3tun26akpicz6agzsdgqfncfh54sd3llcua",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E3.4.64GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.4.64GB.HA",
                        "shapeName": "MySQL.VM.Standard.E3.4.64GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaarp5jw6qbf2ku4gpuuy72obak57kp3q5len6hmhn2am3z6rcgpwma",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Optimized3.1.16GB MySQL shape",
                        "displayName": "MySQL.VM.Optimized3.1.16GB.Standalone",
                        "shapeName": "MySQL.VM.Optimized3.1.16GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaartrvpxengc5av5gwbrpcvsjrc3zr3rlf2umgkvok5lwbw5i43zpq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard3.8.128GB MySQL shape",
                        "displayName": "MySQL.VM.Standard3.8.128GB.HA",
                        "shapeName": "MySQL.VM.Standard3.8.128GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaspr6l3qdjdeiaqiazogs4yczfjyzav2nrutlza6xnkhqzbmtelsa",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E4.16.256GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.16.256GB.HA",
                        "shapeName": "MySQL.VM.Standard.E4.16.256GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaat2d4xaoltefdjlplkpzapgwws2p3hl5yex7zs5hgraotf2xd2jvq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Optimized3.16.256GB MySQL shape",
                        "displayName": "MySQL.VM.Optimized3.16.256GB.HA",
                        "shapeName": "MySQL.VM.Optimized3.16.256GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaau2k7a2zx7fcp7kpkpbegrliabbmctxfuzcukhbtxq5f6e3imdb6a",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard3.24.384GB MySQL shape",
                        "displayName": "MySQL.VM.Standard3.24.384GB.Standalone",
                        "shapeName": "MySQL.VM.Standard3.24.384GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaau2tafs236vycel6xgsk6gusqeovwnpwsvimlmsdxrl5tfygiksza",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Optimized3.2.32GB MySQL shape",
                        "displayName": "MySQL.VM.Optimized3.2.32GB.HA",
                        "shapeName": "MySQL.VM.Optimized3.2.32GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaau3vplwukhl74ojck4cnvg6lztp45e5ig4bcfjr2ddtjerk3npaxa",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Optimized3.1.8GB MySQL shape",
                        "displayName": "MySQL.VM.Optimized3.1.8GB.HA",
                        "shapeName": "MySQL.VM.Optimized3.1.8GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaauez53axdqqx2whwvcqvdhxx7by36rlcxxg5hakdqh2jvh4dh4q2a",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard.E3.24.384GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.24.384GB.HA",
                        "shapeName": "MySQL.VM.Standard.E3.24.384GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaauxn6tddkgan34ikhv4jxi7ygdjucqrj7tpcpnzhxx7ywte33pxya",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E4.4.64GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.4.64GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E4.4.64GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaauzefhlosylm6hpcjw7s4kj2vla53szxkurnjp2pqfvy3iw5sowna",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E4.8.128GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.8.128GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E4.8.128GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaavsq7dcwuuq35q3q7ywccw3wk54pqhuzvrsw5ars6ee2ohj6igzca",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E4.24.384GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E4.24.384GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E4.24.384GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaw2drkhd3cp3fy2jxn455juwnf2g7t76mfxjldv2t5fw6kz6zsb6q",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard3.32.512GB MySQL shape",
                        "displayName": "MySQL.VM.Standard3.32.512GB.Standalone",
                        "shapeName": "MySQL.VM.Standard3.32.512GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaw7umceg7o3sm2otxjo24w3ttiek5ipdaaqv4pnjrbmecigiknnqq",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.HeatWave.VM.Standard MySQL shape",
                        "displayName": "MySQL.HeatWave.VM.Standard.Standalone",
                        "shapeName": "MySQL.HeatWave.VM.Standard",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaweky3hvms4bxw2uyf6pjcoxzf5gkqzxvxmzolgcu6bufd5bjnpyq",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard.E3.1.16GB MySQL shape",
                        "displayName": "MySQL.VM.Standard.E3.1.16GB.Standalone",
                        "shapeName": "MySQL.VM.Standard.E3.1.16GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaawwijmt5didavfa6sscemasjpbtyetbv4m3uctiptrxpogxlvpcka",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Optimized3.8.128GB MySQL shape",
                        "displayName": "MySQL.VM.Optimized3.8.128GB.Standalone",
                        "shapeName": "MySQL.VM.Optimized3.8.128GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaxh34uqs6p7tuacen3nfovvl7mq4svz3jbldk62zwcucfezsgxljq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard2.1.15GB MySQL shape",
                        "displayName": "MySQL.VM.Standard2.1.15GB.HA",
                        "shapeName": "MySQL.VM.Standard2.1.15GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaxwozahx3eakr5l7knt4ltqha5pm3aexbefyxazyyb4rcplh6mrjq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard3.1.8GB MySQL shape",
                        "displayName": "MySQL.VM.Standard3.1.8GB.HA",
                        "shapeName": "MySQL.VM.Standard3.1.8GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaaybf5onrvgin7nt4ljdtgh7tkmsto6w5m2fmdbkmybzaz5u7pc7xa",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Standard3.24.384GB MySQL shape",
                        "displayName": "MySQL.VM.Standard3.24.384GB.HA",
                        "shapeName": "MySQL.VM.Standard3.24.384GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaayirqibmhli5im4u3idgn7znadugelrtyvfusw7nggi3jh2kfjgjq",
                        "compartmentId": null,
                        "description": "Default high availability configuration for the MySQL.VM.Optimized3.4.64GB MySQL shape",
                        "displayName": "MySQL.VM.Optimized3.4.64GB.HA",
                        "shapeName": "MySQL.VM.Optimized3.4.64GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    },
                    {
                        "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaazdvdhdypa4w2wh57biuqa4axlv2hcq4slp2peudhjtrguqgj7egq",
                        "compartmentId": null,
                        "description": "Default standalone configuration for the MySQL.VM.Standard3.1.16GB MySQL shape",
                        "displayName": "MySQL.VM.Standard3.1.16GB.Standalone",
                        "shapeName": "MySQL.VM.Standard3.1.16GB",
                        "type": "DEFAULT",
                        "lifecycleState": "ACTIVE",
                        "applicationProgress": null,
                        "timeCreated": "2018-09-21T10:00:00.000Z",
                        "timeUpdated": null,
                        "freeformTags": null,
                        "definedTags": null
                    }
                ],
                "mysql_version": [
                    {
                        "versionFamily": "8 - Innovation",
                        "versions": [
                            {
                                "version": "8.1.0",
                                "description": "8.1.0"
                            },
                            {
                                "version": "8.2.0",
                                "description": "8.2.0"
                            }
                        ],
                        "id": "8 - Innovation",
                        "displayName": "8 - Innovation"
                    },
                    {
                        "versionFamily": "8.0",
                        "versions": [
                            {
                                "version": "8.0.31",
                                "description": "8.0.31"
                            },
                            {
                                "version": "8.0.32",
                                "description": "8.0.32"
                            },
                            {
                                "version": "8.0.33",
                                "description": "8.0.33"
                            },
                            {
                                "version": "8.0.34",
                                "description": "8.0.34"
                            },
                            {
                                "version": "8.0.35",
                                "description": "8.0.35"
                            }
                        ],
                        "id": "8.0",
                        "displayName": "8.0"
                    }
                ]
            }
        }
    }
}

export default defaultCache

