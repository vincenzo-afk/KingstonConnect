#!/usr/bin/env python
"""
WSGI entry point for the AU Web Portal Flask application.
"""
import os
import sys

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from auwebportal import app as application

if __name__ == '__main__':
    port = application.config.get('PORT', 8080)
    ip = application.config.get('IP', '127.0.0.1')
    debug = application.config.get('DEBUG', True)
    
    print(f'Starting Flask server on {ip}:{port}...')
    application.run(host=ip, port=port, debug=debug)