
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

import requests

########################################################################
# Calcuate based on METRICDISPLAYNAME
########################################################################
ociprice_url = "https://guk9elytviiyjhz-devadw.adb.uk-london-1.oraclecloudapps.com/ords/ociprice/okit/ociprice/"

#get price based on SKU
def get_oci_price_ords(sku):
    resource_price = ociprice_url + "/" + sku
    res = requests.get(resource_price)
    prices = res.json()
    for price in prices['items']:
        pay_as_you_go = float(price.get("pay_as_you_go"))
        monthly_commit = float(price.get("monthly_commit"))
    return pay_as_you_go, monthly_commit, sku

def TB_per_month(storage_price, storage_capacity):
    # PAYG
    PAYG_Storage = storage_price[0] * storage_capacity
    # Monthly Flex
    Monthly_Flex_Storage = storage_price[1] * storage_capacity
    return PAYG_Storage, Monthly_Flex_Storage

def Block_volume_GB_per_month(block_storage_price, storage_capacity, vpus_ocpu_price, vpus_per_gb):
    # PAYG
    PAYG_Block_Storage = block_storage_price[0] * storage_capacity
    PAYG_Block_vpus = vpus_ocpu_price[0] * vpus_per_gb * storage_capacity
    # Monthly Flex
    Monthly_Flex_Block_Storage = block_storage_price[1] * storage_capacity
    Monthly_Flex_Block_vpus = vpus_ocpu_price[1] * vpus_per_gb * storage_capacity

    PAYG_Block_Volume_price = round(PAYG_Block_Storage + PAYG_Block_vpus, 2)
    Monthly_Flex_Block_Volume_price = round(Monthly_Flex_Block_Storage + Monthly_Flex_Block_vpus, 2)
    return PAYG_Block_Volume_price, Monthly_Flex_Block_Volume_price

def Storage_GB_per_month(storage_price, storage_capacity):
    # PAYG
    PAYG_Storage_price = round(storage_price[0] * storage_capacity, 2)
    # Monthly Flex
    Monthly_Flex_Storage_price = round(storage_price[1] * storage_capacity, 2)
    return PAYG_Storage_price, Monthly_Flex_Storage_price

def OCPU_per_hr(ocpu_price,numberOfocpu):
    ocpu_per_month = 24 * 31
    # PAYG
    PAYG_OCPU = round(ocpu_price[0] * numberOfocpu * ocpu_per_month,2)
    # Monthly Flex
    Monthly_Flex_OCPU = round(ocpu_price[1] * numberOfocpu * ocpu_per_month,2)

    return PAYG_OCPU, Monthly_Flex_OCPU

def BM_Exa_OCPU_per_hr(license_model,database_edition, dbaas_license_price, dbaas_shape, additional_ocpu):
    ocpu_per_month = 24 * 31
    additional_dense_ocpu_price = (0,0)
    database_edition = str(database_edition).lower()
    sku = ''

    #Up to 50 additional OCPU's (purchased separately). Note: Additional OCPUs must be purchased in increments of 2 OCPUs.
    #Dense IO shape of DBaas uses Hosted_Environment_Per_Hour. 1 Dense IO SKU inlcudes 2 ocpu price.

    if dbaas_shape == "bm":
        # PAYG for 2 ocpu
        PAYG_OCPU = round(dbaas_license_price[0] *ocpu_per_month,2)
        # Monthly Flex for 2 ocpu
        Monthly_Flex_OCPU = round(dbaas_license_price[1] * ocpu_per_month,2)
        #print("BM.DenseIO Hosted Environment Price: {} , {}".format(PAYG_OCPU, Monthly_Flex_OCPU))
        if license_model == "LICENSE_INCLUDED":
            # Additional Capcacity (in increment of 2 OCPUs, max upto 50 OCPUS)
            if database_edition == "standard_edition":
                additional_dense_ocpu_price = get_oci_price_ords("B88331")
                sku = "B88331"
            elif database_edition == "enterprise_edition":
                additional_dense_ocpu_price = get_oci_price_ords("B88328")
                sku = "B88328"
            elif database_edition == "enterprise_edition_high_performance":
                additional_dense_ocpu_price = get_oci_price_ords("B88329")
                sku = "B88329"
            elif database_edition == "enterprise_edition_extreme_performance":
                additional_dense_ocpu_price = get_oci_price_ords("B88330")
                sku = "B88330"

        elif license_model == "BRING_YOUR_OWN_LICENSE":
            additional_dense_ocpu_price = get_oci_price_ords("B88846")
            sku = "B88846"
        #print("BM.DenseIO additional ocpu Price: {} , {}".format(round(additional_dense_ocpu_price[0] * additional_ocpu * ocpu_per_month, 2), round(additional_dense_ocpu_price[1] * additional_ocpu * ocpu_per_month, 2)))
        # PAYG for additonal ocpu
        PAYG_OCPU += round(additional_dense_ocpu_price[0] * additional_ocpu * ocpu_per_month, 2)
        # Monthly Flex for additonal ocpu
        Monthly_Flex_OCPU += round(additional_dense_ocpu_price[1] * additional_ocpu * ocpu_per_month, 2)

    elif dbaas_shape == "ex":
        # PAYG
        PAYG_OCPU = round(dbaas_license_price[0] * ocpu_per_month, 2)
        # Monthly Flex
        Monthly_Flex_OCPU = round(dbaas_license_price[1] * ocpu_per_month, 2)
        #print("ExaCS Hosted Environment Price: {} , {}".format(PAYG_OCPU, Monthly_Flex_OCPU))
        if license_model == "LICENSE_INCLUDED":
            # Additional Capcacity for ExaCS
            additional_exacs_ocpu_price = get_oci_price_ords("B88592")
            sku = "B88592"
        elif license_model == "BRING_YOUR_OWN_LICENSE":
            # Additional Capcacity for ExaCS
            additional_exacs_ocpu_price = get_oci_price_ords("B88847")
            sku = "B88847"
        #print("ExaCS additional ocpu Price: {} , {}".format(round(additional_exacs_ocpu_price[0] * additional_ocpu * ocpu_per_month, 2), round(additional_exacs_ocpu_price[1] * additional_ocpu * ocpu_per_month, 2)))
        # PAYG for additonal ocpu
        PAYG_OCPU += round(additional_exacs_ocpu_price[0] * additional_ocpu * ocpu_per_month, 2)
        # Monthly Flex for additonal ocpu
        Monthly_Flex_OCPU += round(additional_exacs_ocpu_price[1] * additional_ocpu * ocpu_per_month, 2)

    return PAYG_OCPU, Monthly_Flex_OCPU, sku , additional_ocpu

def Request_per_month(request_price,numberOfrequest):
    # PAYG
    PAYG_Object_Request = request_price[0] * numberOfrequest
    # Monthly Flex
    Monthly_Flex_Request = request_price[1] * numberOfrequest
    return PAYG_Object_Request, Monthly_Flex_Request

def get_dbaas_license_price(license_model, database_edition , shape):
    edition = str(database_edition).lower()
    dbaas_shape = str(shape[0:2]).lower()
    PAYG_DBaaS = 0
    Monthly_Flex_DBaaS = 0
    sku = ''
    #print("DBaas License: {} , DBaaS shape: {}".format(edition,dbaas_shape))
    if license_model == "LICENSE_INCLUDED":
        if dbaas_shape == "vm":
            if edition == "standard_edition":
                PAYG_DBaaS, Monthly_Flex_DBaaS, sku = get_oci_price_ords("B90569")
                sku = "B90569"
            elif edition == "enterprise_edition":
                PAYG_DBaaS, Monthly_Flex_DBaaS, sku = get_oci_price_ords("B90570")
                sku = "B90570"
            elif edition == "enterprise_edition_high_performance":
                PAYG_DBaaS, Monthly_Flex_DBaaS, sku = get_oci_price_ords("B90571")
                sku = "B90571"
            elif edition == "enterprise_edition_extreme_performance":
                PAYG_DBaaS, Monthly_Flex_DBaaS, sku = get_oci_price_ords("B90572")
                sku = "B90572"
        elif dbaas_shape == "bm":
            if edition == "standard_edition":
                PAYG_DBaaS, Monthly_Flex_DBaaS, sku = get_oci_price_ords("B89621")
                sku = "B89621"
            elif edition == "enterprise_edition":
                PAYG_DBaaS, Monthly_Flex_DBaaS, sku = get_oci_price_ords("B89622")
                sku = "B89622"
            elif edition == "enterprise_edition_high_performance":
                PAYG_DBaaS, Monthly_Flex_DBaaS, sku = get_oci_price_ords("B89623")
                sku = "B89623"
            elif edition == "enterprise_edition_extreme_performance":
                PAYG_DBaaS, Monthly_Flex_DBaaS, sku = get_oci_price_ords("B89624")
                sku = "B89624"
    elif license_model == "BRING_YOUR_OWN_LICENSE":
        if dbaas_shape == "vm":
            PAYG_DBaaS, Monthly_Flex_DBaaS, sku = get_oci_price_ords("B90573")
        elif dbaas_shape == "bm":
            PAYG_DBaaS, Monthly_Flex_DBaaS, sku = get_oci_price_ords("B89625")

    return PAYG_DBaaS, Monthly_Flex_DBaaS, sku
