from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
app.config.from_object('config')

# Enable CORS for all routes (needed for frontend integration)
CORS(app, resources={r"/*": {"origins": "*"}})

from auwebportal.views import *