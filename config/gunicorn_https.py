# Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
bind = '0.0.0.0:443'
# To use HTTPS the certfile & key file must be created
certfile = "/okit/ssl/okit.crt"
keyfile = "/okit/ssl/okit.key"
workers = 4
limit_request_line = 0
timeout = 6000

