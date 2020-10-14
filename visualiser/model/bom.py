
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

import requests
import pandas as pd


pd.options.mode.chained_assignment = None  # default='warn'

ocipartnumber_url = "https://guk9elytviiyjhz-devadw.adb.uk-london-1.oraclecloudapps.com/ords/ociprice/okit/partnumber"
#ociprice_url = "https://guk9elytviiyjhz-devadw.adb.uk-london-1.oraclecloudapps.com/ords/ociprice/okit/bom/"
skus = []
displayname = []
metricdisplayname = []
listprice = []
qty = []
unit_used = []
price = []

# calculate pricing for bom


def finalize_bom(df):
    df = df[df.qty != 0]
    df.price_per_month = df.listprice * df.qty * df.unit_used
    print(df)
    #install openpyxl
    #pip install openpyxl
    #change the export path in local directory in okit docker
    #export_path = "C:\\Users\\janhan\\Downloads\\exported_bom_" + job_id + ".xlsx"
    #export_path = "C:\\Users\\janhan\\Downloads\\exported_bom_test.xlsx"
    #df.to_excel(export_path, index=False, header=True)
    return df

# update bom


def update_bom(df, sku, qty, unit_used):
    df.loc[df['skus'] == sku, ['qty']] += qty
    df.loc[df['skus'] == sku, ['unit_used']] = unit_used
    # print(df)


# create empty bom format
def create_bom():
    res = requests.get(ocipartnumber_url+"?offset=0&limit=500")
    partnumbers = res.json()

    for partnumber in partnumbers['items']:
        skus.append(partnumber.get("partnumber"))
        # remove duplicate sku in front of display name
        displayname.append(partnumber.get("displayname")[8::])
        metricdisplayname.append(partnumber.get("metricdisplayname"))
        listprice.append(partnumber.get("pay_as_you_go"))
        #listprice.append(partnumber.get("monthly_commit"))
        qty.append(0)
        unit_used.append(0)
        price.append(0)
    bom_format = {
        'skus': skus,
        'displayname': displayname,
        'metricdisplayname': metricdisplayname,
        'listprice': listprice,
        'qty': qty,
        'unit_used': unit_used,
        'price_per_month': price
    }
    df = pd.DataFrame(bom_format, columns=[
                      'skus', 'displayname', 'metricdisplayname', 'listprice', 'qty', 'unit_used', 'price_per_month'])
    pd.set_option('display.max_columns', None)
    pd.set_option('display.max_rows', 10)

    #df.loc[df['skus'] == 'B88517', ['qty']] += 2
    #df.loc[df['skus'] == 'B88517', ['unit_used']] += 10
    #print(df.loc[df['skus'] == 'B88517'])

    return df

