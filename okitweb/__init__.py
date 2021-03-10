
# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
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
# HERE
from flask import Response, session, redirect, url_for, render_template
from authlib.integrations.flask_client import OAuth
import base64, secrets, socket, urllib

from common.okitLogging import getLogger
# Configure logging
logger = getLogger()

def create_local_app(test_config=None):
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

    # Set local
    app.config['LOCAL'] = True

    # Redirect / to designer page
    @app.route('/')
    def base():
        return redirect("/okit/designer")

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

def create_authenticated_app(test_config=None):
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

    # The secret key must be static to be the same for all gunicorn workers
    app.secret_key = '8980ffsd675747jjjh'
    idcs_metadata_url = app.config['IDCS_API_BASE_URL'] + '/.well-known/openid-configuration'
    oauth = OAuth(app)
    idcs = oauth.register(name='idcs', server_metadata_url=idcs_metadata_url, client_kwargs={'scope':'openid email profile'})
    if 'OKIT_SERVER_BASE' not in app.config:
        app.config['OKIT_SERVER_BASE'] = 'http://' + socket.getfqdn()

    @app.route('/favicon.ico')
    def favicon():
        return send_from_directory(os.path.join(app.root_path, 'static'),
                                   'favicon.ico', mimetype='image/vnd.microsoft.icon')
    from . import okitWebDesigner

    # Login Step 1 - Redirect to IDCS
    @okitWebDesigner.bp.route('/login', methods=(['GET', 'POST']))
    def login():
        return idcs.authorize_redirect(app.config['OKIT_SERVER_BASE'] + url_for('okit.postlogin'))

    # Login Step 2 - Local local token handling
    @okitWebDesigner.bp.route('/postlogin', methods=(['GET', 'POST']))
    def postlogin():
        token = idcs.authorize_access_token()
        userinfo = idcs.parse_id_token(token)
        session['username'] = userinfo['user_displayname']
        session['home_region'] = app.config['OCI_HOME_REGION']
        session['tenant'] = app.config['OCI_TENANT']
        logger.info(f"App Config {app.config}")
        end_session_endpoint = idcs.server_metadata['end_session_endpoint']
        logout_redirect_url = {
            'post_logout_redirect_url' : app.config['OKIT_SERVER_BASE'] + url_for('okit.postlogout'),
            'id_token_hint' : token['id_token']
        }
        logout_url = end_session_endpoint + '?post_logout_redirect_url=' + str(logout_redirect_url['post_logout_redirect_url']) + '&id_token_hint=' + str(logout_redirect_url['id_token_hint'])
        session['logout'] = logout_url
        return redirect(url_for('okit.designer'), code=302)

    # Logout Step 1 - Handled by IDCS
    # Logout Step 2 - Local cleanup
    @okitWebDesigner.bp.route('/logout', methods=(['GET', 'POST']))
    def logout():
        session.pop('username', None)
        session.pop('logout', None)
        session.pop('tenant', None)
        session.pop('home_region', None)
        return Response(status=200)

    # Logout Step 3 - Local redirect to home page
    @okitWebDesigner.bp.route('/postlogout', methods=(['GET', 'POST']))
    def postlogout():
        session.pop('username', None)
        session.pop('logout', None)
        session.pop('tenant', None)
        session.pop('home_region', None)
        return redirect(url_for('okit.designer'), code=302)

    app.register_blueprint(okitWebDesigner.bp)
    from . import okitPricing
    app.register_blueprint(okitPricing.bp)
    from . import okitOci
    app.register_blueprint(okitOci.bp)
    from . import okitImport
    app.register_blueprint(okitImport.bp)

    @app.route('/')
    def index():
        return login()

    return app