import os
DEBUG = True
PROPAGATE_EXCEPTIONS = True
WTF_CSRF_ENABLED = True
SECRET_KEY = 'MyS3Cr3t'
HOST_NAME = os.environ.get('OPENSHIFT_APP_DNS','localhost')
APP_NAME = os.environ.get('OPENSHIFT_APP_NAME','auwebportal')
IP = os.environ.get('OPENSHIFT_PYTHON_IP','127.0.0.1')
PORT = int(os.environ.get('OPENSHIFT_PYTHON_PORT',8080))