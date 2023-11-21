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
                        "id": "Oracle-Linux-8.8-2023.10.24-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaazpudqkzjcddfe5yanyz5kxs77xixy4nlh6jljdjhfpxljmdkv4gq",
                        "displayName": "Oracle-Linux-8.8-2023.10.24-0",
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
                        "id": "Oracle-Linux-9.2-2023.10.24-0",
                        "ocid": "ocid1.image.oc1.uk-london-1.aaaaaaaagpviwgrh7w6neuwvznw6tx4f2ukblfhdh7difog5v7wfdmrg4hxq",
                        "displayName": "Oracle-Linux-9.2-2023.10.24-0",
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
                ]
            }
        }
    }
}

export default defaultCache

