
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

import oci
from base64 import b64encode, b64decode
import time
import os

##########################################################################
# Create signer
##########################################################################


def create_signer():
    # assign default values
    #config_file = oci.config.DEFAULT_LOCATION
    config_file = os.getcwd() + "\\config"
    config_section = oci.config.DEFAULT_PROFILE
    #print(config_file, config_section)
    signer = None
    config = None
    config = oci.config.from_file(config_file, config_section)
    signer = oci.signer.Signer(
        tenancy=config["tenancy"],
        user=config["user"],
        fingerprint=config["fingerprint"],
        private_key_file_location=config.get("key_file")
    )

    # return config and signer
    return config

# Get Streaming OCID


def get_streaming_ocid(config, stream_name):
    stream_name = str(stream_name).lower()
    compartment_id = "ocid1.compartment.oc1..aaaaaaaa3ewbgksrzpknid3yasysuz6xe3bgjx2hcchczz5jatgd643mif6q"
    # Create StreamAdminClient
    stream_admin_client = oci.streaming.StreamAdminClient(config)
    # print(stream_admin_client)
    list_streams = stream_admin_client.list_streams(
        compartment_id=compartment_id, name=stream_name, lifecycle_state=oci.streaming.models.StreamSummary.LIFECYCLE_STATE_ACTIVE)
    # print(list_streams.data)
    if list_streams.data:
        streaming_ocid = list_streams.data[0].id
        stream_service_endpoint = list_streams.data[0].messages_endpoint
        return streaming_ocid, stream_service_endpoint

    else:
        print("{} does not exist".format(stream_name))

# Build schema details and payload as a JSON format for Kafka Sink Connector


def kafka_structure(source_data, table_name):
    data = []
    try:
        if table_name == "ARR":
            schema_structure = "{\"schema\":{\"type\":\"struct\",\"fields\":[{\"type\":\"string\",\"optional\":false,\"field\":\"FILENAME\"},{\"type\":\"int64\",\"optional\":false,\"field\":\"PAYG_MONTHLY\"},{\"type\":\"int64\",\"optional\":false,\"field\":\"MONTHLY_FLEX_MONTHLY\"},{\"type\":\"int64\",\"optional\":true,\"field\":\"PAYG_YEARLY\"},{\"type\":\"int64\",\"optional\":false,\"field\":\"MONTHLY_FLEX_YEARLY\"},{\"type\":\"string\",\"optional\":false,\"field\":\"CREATED_AT\"}],\"optional\":false,\"name\":\"OCIPRICE.ARR\"},\"payload\": "
            kafka_format = schema_structure + \
                str(source_data).replace("\'", "\"") + "}"
            #kafka_format.replace("\'", "\"")
            data.append(kafka_format)
            #print("ARR kafka list: {}".format(data))
            put_messages_streaming(data, table_name)
        elif table_name == "RESULTS":
            schema_structure = "{\"schema\":{\"type\":\"struct\",\"fields\":[{\"type\":\"string\",\"optional\":false,\"field\":\"FILENAME\"},{\"type\":\"string\",\"optional\":false,\"field\":\"RESOURCENAME\"},{\"type\":\"int64\",\"optional\":false,\"field\":\"PAYG\"},{\"type\":\"int64\",\"optional\":true,\"field\":\"MONTHLY_FLEX\"},{\"type\":\"string\",\"optional\":false,\"field\":\"CREATED_AT\"}],\"optional\":false,\"name\":\"OCIPRICE.RESULTS\"},\"payload\":"
            for row in range(len(source_data)):
                kafka_format = schema_structure + \
                    str(source_data[row]).replace("\'", "\"") + "}"
                data.append(kafka_format)
            #print("RESULTS kafka list: {}".format(data))
            put_messages_streaming(data, table_name)
    except Exception as e:
        print(
            "----------------- Error while converting Kafka structure -------------------")
        print(e)
        print(
            "--------------------------------------End------------------------------------")

# Start Streaming


def put_messages_streaming(data, stream_name):
    config = create_signer()
    # get stream ocid and endpoint
    streaming_ocid, stream_service_endpoint = get_streaming_ocid(
        config, stream_name)
    # StreamClient
    stream_client = oci.streaming.StreamClient(
        config, service_endpoint=stream_service_endpoint)
    # Record start time
    print("Streaming Starts at {}".format(time.strftime("%Y-%m-%d %H:%M:%S")))

    # Stream the content of the object into my code
    put_messages_details = []
    for row in range(len(data)):
        try:
            # Encode key and value, Append into list
            encoded_value = b64encode(data[row].encode()).decode()
            # Append into list
            put_messages_details.append(
                oci.streaming.models.PutMessagesDetailsEntry(value=encoded_value))
            # Create Message Details with list
            messages = oci.streaming.models.PutMessagesDetails(
                messages=put_messages_details)

        except Exception as e:
            print("----------Failed to push the following message -------------------")
            print(row)
            print(e)
            print("--------------------------End----------------------------")
    try:
        #print("Current Message: {}".format(messages))
        # PUT messages
        stream_client.put_messages(streaming_ocid, messages)
        # Clear List
        put_messages_details.clear()
    except Exception as e:
        print("----------Failed to put the stream_client message -------------------")
        print(e)
        print("--------------------------End----------------------------")
    print("All messages have been pushed at {}".format(
        time.strftime("%Y-%m-%d %H:%M:%S")))
