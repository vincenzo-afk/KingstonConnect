from auwebportal import app
from flask import render_template, request, make_response, session, send_file
from auwebportal.forms import InputForm
import datetime
from auwebportal.scrapper import Scrapper
import requests
import json
import uuid
import os
import tempfile
from bs4 import BeautifulSoup

# Store session data temporarily (in production, use Redis or database)
captcha_sessions = {}


@app.route('/')
@app.route('/index')
@app.route('/index/')
def index():
    return render_template('index.html', title='AU Web Portal | A Python API Built Using Flask Microframework.')

@app.route('/test', methods=['GET', 'POST'])
@app.route('/test/', methods=['GET', 'POST'])
def fetch():
    form = InputForm()
    if request.method == 'POST':
        if not form.validate():
            return render_template('test.html', form=form)
        else:
            register_no = form.register_no.data
            dob = datetime.datetime.strptime(str(form.dob.data), '%Y-%m-%d').strftime('%d-%m-%Y')
            return render_template('test.html', form=form, valid=True)
    elif request.method == 'GET':
        return render_template('test.html', form=form)


def check_dob(dob):
    if dob == '':
        return False
    try:
        dob_split = dob.split('-')
        datetime.date(int(dob_split[2]), int(dob_split[1]), int(dob_split[0]))
        return True
    except:
        return False


def check_regno(register_no):
    if register_no != '' and register_no.isdigit() and len(register_no) > 8:
        return True
    else:
        return False


# Step 1: Initialize session and get captcha
@app.route('/api/init-session')
def init_session():
    """
    Initiates a session with the AU Portal and returns the captcha audio URL.
    Returns a session_id to be used in subsequent requests.
    """
    try:
        # Fetch the AU Portal login page
        LOGIN_URL = 'http://coe1.annauniv.edu/home/index.php'
        response = requests.get(LOGIN_URL, timeout=30)
        
        if response.status_code != 200:
            return make_response(json.dumps({
                'error': 'Failed to connect to AU Portal'
            })), 500
        
        # Parse the page to find captcha and form data
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the audio captcha element
        audio_elem = soup.find('audio')
        captcha_audio_url = None
        
        if audio_elem:
            source = audio_elem.find('source')
            if source and source.get('src'):
                captcha_audio_url = source.get('src')
                # Make it absolute URL if relative
                if captcha_audio_url.startswith('/'):
                    captcha_audio_url = 'http://coe1.annauniv.edu' + captcha_audio_url
                elif not captcha_audio_url.startswith('http'):
                    captcha_audio_url = 'http://coe1.annauniv.edu/home/' + captcha_audio_url
        
        # Find the hidden field for form submission
        hidden_fields = soup.findAll('input', attrs={'type': 'hidden'})
        hidden_data = {}
        for field in hidden_fields:
            if field.get('name') and field.get('value'):
                hidden_data[field['name']] = field['value']
        
        # Generate a unique session ID
        session_id = str(uuid.uuid4())
        
        # Store session data
        captcha_sessions[session_id] = {
            'cookies': dict(response.cookies),
            'hidden_data': hidden_data,
            'captcha_audio_url': captcha_audio_url,
            'created_at': datetime.datetime.now()
        }
        
        # Clean up old sessions (older than 10 minutes)
        cleanup_old_sessions()
        
        resp_data = {
            'session_id': session_id,
            'captcha_audio_url': captcha_audio_url,
            'has_audio_captcha': captcha_audio_url is not None
        }
        
        resp = make_response(json.dumps(resp_data))
        resp.mimetype = 'application/json'
        return resp
        
    except requests.exceptions.Timeout:
        return make_response(json.dumps({
            'error': 'Connection to AU Portal timed out'
        })), 504
    except requests.exceptions.ConnectionError:
        return make_response(json.dumps({
            'error': 'Could not connect to AU Portal'
        })), 503
    except Exception as e:
        return make_response(json.dumps({
            'error': f'Error: {str(e)}'
        })), 500


# Proxy endpoint to serve captcha audio (to avoid CORS issues)
@app.route('/api/captcha-audio/<session_id>')
def get_captcha_audio(session_id):
    """
    Proxies the captcha audio to avoid CORS issues.
    """
    if session_id not in captcha_sessions:
        return make_response(json.dumps({'error': 'Invalid session'})), 400
    
    session_data = captcha_sessions[session_id]
    audio_url = session_data.get('captcha_audio_url')
    
    if not audio_url:
        return make_response(json.dumps({'error': 'No audio captcha available'})), 400
    
    try:
        # Fetch the audio file
        cookies = session_data.get('cookies', {})
        response = requests.get(audio_url, cookies=cookies, timeout=30)
        
        if response.status_code == 200:
            # Return the audio content
            resp = make_response(response.content)
            resp.headers['Content-Type'] = 'audio/wav'
            resp.headers['Content-Disposition'] = 'inline; filename=captcha.wav'
            return resp
        else:
            return make_response(json.dumps({'error': 'Failed to fetch audio'})), 500
            
    except Exception as e:
        return make_response(json.dumps({'error': str(e)})), 500


# Step 2: Submit captcha and get student data
@app.route('/api/fetch-data', methods=['POST'])
def fetch_data():
    """
    Submits the captcha solution and fetches student data.
    Requires session_id, register_no, dob, and captcha_solution.
    """
    try:
        data = request.get_json()
        
        if not data:
            return make_response(json.dumps({'error': 'No data provided'})), 400
        
        session_id = data.get('session_id')
        register_no = data.get('register_no')
        dob = data.get('dob')
        captcha_solution = data.get('captcha_solution')
        
        if not all([session_id, register_no, dob, captcha_solution]):
            return make_response(json.dumps({
                'error': 'Missing required fields: session_id, register_no, dob, captcha_solution'
            })), 400
        
        if session_id not in captcha_sessions:
            return make_response(json.dumps({
                'error': 'Session expired. Please refresh and try again.'
            })), 400
        
        if not check_regno(register_no):
            return make_response(json.dumps({'error': 'Invalid Register Number'})), 400
        
        if not check_dob(dob):
            return make_response(json.dumps({'error': 'Invalid Date of Birth format. Use DD-MM-YYYY'})), 400
        
        session_data = captcha_sessions[session_id]
        cookies = session_data.get('cookies', {})
        hidden_data = session_data.get('hidden_data', {})
        
        # Build POST data
        post_data = hidden_data.copy()
        post_data.update({
            'register_no': register_no,
            'dob': dob,
            'security_code_student': captcha_solution,
            'gos': 'Login',
        })
        
        # Submit to AU Portal
        PROFILE_URL = 'http://coe1.annauniv.edu/home/students_corner.php'
        headers = {
            'Content-type': 'application/x-www-form-urlencoded',
            'Origin': 'http://coe1.annauniv.edu'
        }
        
        response = requests.post(
            PROFILE_URL, 
            data=post_data, 
            cookies=cookies, 
            headers=headers,
            timeout=30
        )
        
        # Check if login was successful
        if response.content.find(b"window.location='index.php'") != -1:
            return make_response(json.dumps({
                'error': 'Login failed. Please check your credentials and captcha.'
            })), 401
        
        # Create a scrapper instance to parse the data
        scrapper = Scrapper(register_no, dob)
        scrapper.cookies = cookies
        scrapper.current_page = response
        
        # Parse profile details
        soup = BeautifulSoup(response.content, 'html.parser')
        tables = soup.findAll('table')
        
        if len(tables) == 0:
            return make_response(json.dumps({
                'error': 'Could not parse student data. Login may have failed.'
            })), 400
        
        table = tables[0]
        profile_details = {}
        for row in table.findAll('tr'):
            tds = row.findAll('td')
            if len(tds) >= 2:
                key = tds[0].text.strip().replace(' ', '_').lower()
                value = tds[1].text.strip()
                profile_details[key] = value
        
        # Try to get additional data
        try:
            exam_schedule = scrapper.get_exam_schedule_details(Scrapper.EXAM_SCHEDULE)
        except:
            exam_schedule = []
        
        try:
            assessment = scrapper.get_assessment_details(Scrapper.ASSESSMENT)
        except:
            assessment = []
        
        try:
            exam_result = scrapper.get_exam_result_details(Scrapper.EXAM_RESULTS)
        except:
            exam_result = None
        
        try:
            internals = scrapper.get_internal_mark_details(Scrapper.INTERNAL_MARK)
        except:
            internals = []
        
        # Clean up session
        del captcha_sessions[session_id]
        
        result = {
            'profile': profile_details,
            'exam_schedule': exam_schedule,
            'assessment': assessment,
            'exam_result': exam_result,
            'internals': internals
        }
        
        resp = make_response(json.dumps(result, sort_keys=True))
        resp.mimetype = 'application/json'
        return resp
        
    except requests.exceptions.Timeout:
        return make_response(json.dumps({'error': 'Connection timed out'})), 504
    except Exception as e:
        return make_response(json.dumps({'error': f'Error: {str(e)}'})), 500


def cleanup_old_sessions():
    """Remove sessions older than 10 minutes"""
    now = datetime.datetime.now()
    expired = []
    for sid, data in captcha_sessions.items():
        if (now - data['created_at']).total_seconds() > 600:
            expired.append(sid)
    for sid in expired:
        del captcha_sessions[sid]


# Keep the original endpoint for backward compatibility
@app.route('/get')
@app.route('/get/')
def get():
    register_no = request.args.get('register_no')
    dob = request.args.get('dob')

    if register_no is None or dob is None:
        resp = make_response(json.dumps({'error': 'Request parameters are not in correct format.'}))
    else:
        if not check_regno(register_no) and not check_dob(dob):
            resp = make_response(json.dumps({'error': 'Invalid Register Number and Date of Birth.'}))
        elif not check_regno(register_no):
            resp = make_response(json.dumps({'error': 'Invalid Register Number.'}))
        elif not check_dob(dob):
            resp = make_response(json.dumps({'error': "Date of Birth is invalid."}))
        else:
            s = Scrapper(register_no, dob)
            json_data = s.get_json()
            resp = make_response(json_data)

    resp.mimetype = 'application/json'
    return resp