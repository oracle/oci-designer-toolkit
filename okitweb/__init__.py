
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "__init__"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import os

from flask import Flask
from flask import send_from_directory

def create_app(test_config=None):
    # Create and Configure OKIT Web Designer App
    app = Flask(__name__, instance_relative_config=True)

    # Load Config
    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    # Ensure if instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Add Upload location
    app.config['UPLOADS_FOLDER'] = '/okit/uploads'

    # a simple page that says hello
    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    @app.route('/favicon.ico')
    def favicon():
        return send_from_directory(os.path.join(app.root_path, 'static'),
                                   'favicon.ico', mimetype='image/vnd.microsoft.icon')
    from . import okitWebDesigner
    app.register_blueprint(okitWebDesigner.bp)
    from . import okitPricing
    app.register_blueprint(okitPricing.bp)
    from . import okitOci
    app.register_blueprint(okitOci.bp)
    from . import okitImport
    app.register_blueprint(okitImport.bp)

    return app
