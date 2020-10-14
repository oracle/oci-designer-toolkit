
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# Oracle OCI - Instance report script - Shaped definition
# Written by: richard.garsthagen@oracle.com
# Updated by: jhan.han@oracle.com
#

def ComputeShape(name):
    # returns OCPU count, Memory in GB, Local Storage in TB, SKU
    if name == "VM.Standard1.1":
        return 1, 7, 0, "B88317"
    elif name == "VM.Standard2.1":
        return 1, 15, 0, "B88514"
    elif name == "VM.Standard1.2":
        return 2, 14, 0, "B88317"
    elif name == "VM.Standard2.2":
        return 2, 30, 0, "B88514"
    elif name == "VM.Standard1.4":
        return 4, 28, 0, "B88317"
    elif name == "VM.Standard2.4":
        return 4, 60, 0, "B88514"
    elif name == "VM.Standard1.8":
        return 8, 56, 0, "B88317"
    elif name == "VM.Standard2.8":
        return 8, 120, 0, "B88514"
    elif name == "VM.Standard1.16":
        return 16, 112, 0, "B88317"
    elif name == "VM.Standard2.16":
        return 16, 240, 0, "B88514"
    elif name == "VM.Standard2.24":
        return 24, 320, 0, "B88514"
    elif name == "VM.DenseIO1.4":
        return 4, 60, 3.2, "B88516"
    elif name == "VM.DenseIO1.8":
        return 8, 120, 6.4, "B88516"
    elif name == "VM.DenseIO2.8":
        return 8, 120, 6.4, "B88516"
    elif name == "VM.DenseIO1.16":
        return 16, 240, 12.8, "B88516"
    elif name == "VM.DenseIO2.16":
        return 16, 240, 12.8, "B88516"
    elif name == "VM.DenseIO2.24":
        return 24, 320, 25.6, "B88516"
    elif name == "BM.Standard1.36":
        return 36, 256, 0, "B88513"
    elif name == "BM.Standard2.52":
        return 52, 768, 0, "B88513"
    elif name == "BM.DenseIO1.36":
        return 36, 512, 28.8, "B88515"
    elif name == "BM.DenseIO2.52":
        return 52, 768, 51.2, "B88515"
    elif name == "BM.Standard.E2.64":
        return 64, 512, 0, "B90425"
    elif name == "BM.Standard.E3.128":
        return 128, 2048, 0, "B90425"
    elif name == "BM.GPU2.2":
        return 28, 192, 0, "B88517"
    elif name == "BM.GPU3.8":
        return 52, 768, 0, "B88517"
    elif name == "BM.HPC2.36":
        return 36, 384, 6.7, "B90398"
    elif name == "VM.Standard.E2.1.Micro":
        return 1, 1, 0, "B91444"
    elif name == "VM.Standard.E2.1":
        return 1, 8, 0, "B90425"
    elif name == "VM.Standard.E2.2":
        return 2, 16, 0, "B90425"
    elif name == "VM.Standard.E2.4":
        return 4, 32, 0, "B90425"
    elif name == "VM.Standard.E2.8":
        return 8, 64, 0, "B90425"
    elif name == "VM.Standard.E3.Flex":
        return 1, 16, 0, "B90425"
    elif name == "VM.GPU2.1":
        return 12, 72, 0, "B88518"
    elif name == "VM.GPU3.1":
        return 6, 90, 0, "B88518"
    elif name == "VM.GPU3.2":
        return 12, 180, 0, "B88518"
    elif name == "VM.GPU3.4":
        return 24, 360, 0, "B88518"
    elif name == "DVH.Standard2.52":
        return 52, 48, 0
    elif name == "Exadata.Quarter1.84":
        return 22, 1440, 38.4, "B88593"
    elif name == "Exadata.Half1.168":
        return 44, 2880, 76.8, "B88594"
    elif name == "Exadata.Full1.336":
        return 88, 5760, 153.6, "B88595"
    elif name == "Exadata.Quarter2.92":
        return 92, 1440, 76.8, "B89999"
    elif name == "Exadata.Half2.184":
        return 184, 2880, 153.6, "B90000"
    elif name == "Exadata.Full2.368":
        return 368, 5760, 307.2, "B90001"
    elif name == "Exadata.Base.48":
        return 48, 1440, 84, "B90777"
    elif name == "Exadata.Quarter3.100":
        return 100, 1440, 76.8, "B91535"
    elif name == "Exadata.Half3.200":
        return 200, 2880, 179.2, "B91536"
    elif name == "Exadata.Full3.400":
        return 400, 5760, 358.4, "B91537"
    else:
        return 0, 0, 0, "NA"


def LoadBalancer(name):
    # returns SKU
    if name == "100Mbps":
        return "B88319"
    elif name == "400Mbps":
        return "B88320"
    elif name == "8000Mbps":
        return "B88321"
    else:
        return "B88319"


def FastConnect(name):
    # returns SKU
    if name == "1Gbps":
        return "B88325"
    elif name == "10Gbps":
        return "B88326"
    else:
        return "B88325"
