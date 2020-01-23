#!flask/bin/python

# Copyright (c) 2019  Oracle and/or its affiliates. All rights reserved.
# The Universal Permissive License (UPL), Version 1.0 [https://oss.oracle.com/licenses/upl/]

from flask import Flask
from flask_cors import CORS
from flask_restful import Api

app = Flask(__name__)
api = Api(app)
CORS(app)

from resources.restGenerator import TerraformAPI
from resources.restGenerator import AnsibleAPI

# Terraform Endpoint
api.add_resource(TerraformAPI,
                 '/okit/rest/v1/terraform',
                 '/okit/rest/v1/terraform/<string:zipname>',
                 endpoint='terraform')

# Ansible Endpoint
api.add_resource(AnsibleAPI,
                 '/okit/rest/v1/ansible',
                 '/okit/rest/v1/ansible/<string:zipname>',
                 endpoint='ansible')

if __name__ == '__main__':
    app.run(debug=False)
