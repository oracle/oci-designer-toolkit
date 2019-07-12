#!flask/bin/python
from flask import Flask
from flask_restful import Api
from flask_cors import CORS

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
