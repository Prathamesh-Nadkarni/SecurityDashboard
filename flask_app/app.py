from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_cors import CORS,cross_origin
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
import json
import sqlite3
import sqlalchemy.exc
from flask_socketio import SocketIO, emit
import os
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import base64
from rbac import requires_roles
from jwtGenerator import encode_auth_token, decode_auth_token


app = Flask(__name__)

demo_decryption_key = b"mysecretkey12345"

def decrypt(encrypted_password):
    global demo_decryption_key
    encrypted_data = base64.b64decode(encrypted_password)

    if len(encrypted_data) < 16:
        print("Invalid encrypted data length.")
        return None

    iv = encrypted_data[:16]
    encrypted_data = encrypted_data[16:]


    obj = AES.new(demo_decryption_key, AES.MODE_CBC, iv)

    try:
        decrypted_data = unpad(obj.decrypt(encrypted_data), AES.block_size)
        return decrypted_data.decode('utf-8')
    except ValueError as e:
        print("Decryption error:", e)
        return None  # Handle the error as needed


CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.getcwd(), 'users.db')}"
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'static', 'images')

db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")
uploadCount = 0
oldFile = None
dummy_alerts_data = []
dummy_network_data = {}
with open("dummyData.json") as data :
    temp = json.load(data)
    dummy_alerts_data = temp["alerts"]
    dummy_network_data = temp["networkDataByAlertId"]
    data.close()
    
    
class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    machine = db.Column(db.String(100), nullable=False)
    occurred_on = db.Column(db.String, nullable=False)
    severity = db.Column(db.String(50), nullable=False)
    program = db.Column(db.String(100), nullable=False)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    name = db.Column(db.String(80), unique=False, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    picture = db.Column(db.String(100))
    role = db.Column(db.String(50), nullable=False, default='view')


class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    hash = db.Column(db.String(255), nullable=False, unique=True)
    status = db.Column(db.String(50), nullable=False)  # "processing", "completed", etc.


with app.app_context():
    db.create_all()

def add_root_user():
    hashed_password = generate_password_hash('STSL@bs123', method='scrypt')
    new_user = User(
        username='admin',
        password=hashed_password,
        name='Admin',
        email='sts@sts.com',
        role='admin'
    )
    db.session.add(new_user)
    db.session.commit()


# Function to add dummy data
def add_dummy_data():
    # Define a list of dummy alerts
    global uploadCount
    global dummy_alerts_data
    
    # Iterate over the dummy alerts and check if they exist in the database
    for alert_data in dummy_alerts_data:
        alert = Alert.query.get(alert_data['id'])  # Check by ID
        if not alert:
            # If alert with that ID doesn't exist, create and add it to the session
            new_alert = Alert(
                id=alert_data['id'],
                name=alert_data['name'],
                description=alert_data['description'],
                machine=alert_data['machine'],
                occurred_on=alert_data['occurred_on'],
                severity=alert_data['severity'],
                program=alert_data['program']
            )
            db.session.add(new_alert)
            uploadCount += 1

    db.session.commit()  # Commit the changes to the database



@app.route('/api/user/<string:username>', methods=['GET'])
def get_user(username):
    user = User.query.filter_by(username=username).first()  # For simplicity, get the first user
    if user:
        return jsonify({'user': {'username': user.username, 'name': user.name, 'password':user.password, 'email': user.email, 'picture': user.picture, 'role': user.role}})
    return jsonify({'user': None})


@app.route('/api/user/<string:username>', methods=['PUT'])
def update_user(username):
    user = User.query.filter_by(username=username).first()
    if user:
        user.username = request.form['username']
        user.name = request.form['name']
        user.password = request.form['password']
        user.email = request.form['email']
        user.role = request.form['role']
        if 'picture' in request.files:
            picture = request.files['picture']
            filename = secure_filename(picture.filename)
            picture_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            picture.save(picture_path)
            user.picture = picture_path
        db.session.commit()
        return jsonify({'user': {'username': user.username, 'name': user.name, 'password':user.password, 'email': user.email, 'picture': user.picture, 'role': user.role}})
    return jsonify({'error': 'User not found'}), 404


@app.route('/api/user/role/<string:username>', methods=['PUT'])
def update_userrole(username):
    user = User.query.filter_by(username=username).first()
    if user:
        data = request.get_json()
        role = data.get('role')
        user.role = role
        db.session.commit()
        return jsonify({'user': {'username': user.username, 'role': user.role}})
    return jsonify({'error': 'User not found'}), 404


@app.route('/api/login', methods=['POST'])
def login():
    if request.is_json:
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        if request.headers.get('X-Requested-From') == 'React':
            decrypted_password = decrypt(data['password'])
        else:
            decrypted_password = data['password']
        
        if user and check_password_hash(user.password, decrypted_password):
            token = encode_auth_token(user.username, user.role)
            
            response = jsonify({
                'success': True,
                'username': data['username'],
                'token': token 
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        
        response = jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        response[0].headers.add('Access-Control-Allow-Origin', '*')
        return response

    response = jsonify({'success': False, 'error': 'Invalid JSON data'}), 400
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response 

@app.route('/api/create-user', methods=['POST'])
def create_user():
    if request.is_json:
        data = request.get_json()
        hashed_password = generate_password_hash(data['password'], method='scrypt')
        default_picture = os.path.join(app.config['UPLOAD_FOLDER'], 'default_profile_picture.jpg')
        new_user = User(
            username=data['username'],
            password=hashed_password,
            email=data['email'],
            name=data['name'],
            picture=default_picture
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'success': False, 'error': 'Invalid JSON data'}), 400


@app.route('/api/users', methods=['GET'])
@requires_roles('admin')
def get_users():
    users = User.query.all();
    user_list = []
    
    for user in users:
        user_data = {
            'id': user.id,
            'username': user.username,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
        user_list.append(user_data)
    
    return jsonify(user_list)

@app.route('/api/alert', methods=['GET'])
@requires_roles('admin', 'view', 'edit')
def get_alerts():
    global uploadCount
    try:
        if uploadCount > 1:
            alerts = Alert.query.with_entities(Alert.id, Alert.name, Alert.description, Alert.machine, Alert.occurred_on, Alert.severity).all()
            alert_list = [{'id': alert.id, 'name': alert.name, 'description': alert.description, 'machine': alert.machine, 'occurred_on': alert.occurred_on, 'severity': alert.severity} for alert in alerts]
        else:
            alert_list = []

        response = jsonify({'alerts': alert_list}), 200
        return response 
    except SQLAlchemyError as e:
        response = jsonify({'error': str(e)}), 400

        return response  

@app.route('/alert/<int:alert_id>', methods=['GET'])
@requires_roles('admin', 'view', 'edit')
def get_alert(alert_id):
    try:
        alert = Alert.query.get(alert_id)
        if alert:
            alert_data = {
                'id': alert.id,
                'name': alert.name,
                'description': alert.description,
                'machine': alert.machine,
                'occurred_on': alert.occurred_on,
                'severity': alert.severity,
                'program': alert.program
            }
            return jsonify(alert_data), 200
        else:
            return jsonify({'message': 'Alert not found'}), 404
    except SQLAlchemyError as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/add-alert', methods=['POST'])
@requires_roles('admin', 'edit')
def add_alert():
    try:
        data = request.json
        id = data.get('id')
        name = data.get('name')
        description = data.get('description')
        machine = data.get('machine')
        occurred_on = data.get('occurred_on')
        severity = data.get('severity')
        program = data.get('program')
        
        if not all([name, description, machine, occurred_on, severity, program]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        occurred_on = datetime.strptime(occurred_on, '%Y-%m-%d %H:%M:%S')
        
        new_alert = Alert(
            id=id,
            name=name,
            description=description,
            machine=machine,
            occurred_on=occurred_on,
            severity=severity,
            program=program
        )
        db.session.add(new_alert)
        db.session.commit()
        socketio.emit('new_alert', {'id': id,'name': name, 'description': description, 'severity': severity, 'machine': machine, 'occurred_on': occurred_on.strftime('%Y-%m-%d %H:%M:%S')})
        return jsonify({'message': 'Alert added successfully'}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Example function to fetch network data
def get_network_data(alert_id):
    global dummy_network_data
    return dummy_network_data[str(alert_id)]

def delete_alert(alert_id):
    global dummy_network_data
    alert = Alert.query.get(alert_id)
    if alert:
        db.session.delete(alert)
        db.session.commit()
        socketio.emit('delete_alert', {'id': alert_id})
        return jsonify({'message': f'Alert {alert_id} has been successfully deleted.'}), 200
    if str(alert_id) in dummy_network_data:
        del dummy_network_data[str(alert_id)]
        return {"message": f"Alert {alert_id} has been successfully deleted."}
    else:
        return {"error": f"Alert {alert_id} does not exist."}


@app.route('/api/network/<int:alert_id>', methods=['GET'])
@requires_roles('admin', 'view', 'edit')
def network(alert_id):
    try:
        data = get_network_data(alert_id)
        return jsonify(data), 200
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/network/<int:alert_id>', methods=['DELETE'])
@requires_roles('admin', 'edit')
def delete_network(alert_id):
    try:
        data = delete_alert(alert_id)
        return jsonify(data), 200
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 400


# Route for fetching file statuses
@app.route('/api/files', methods=['GET'])
@requires_roles('admin', 'edit')
def get_file_statuses():
    files = File.query.all()
    file_data = [{'filename': file.filename, 'status': file.status} for file in files]
    response = jsonify({'files': file_data})
    return response

if __name__ == '__main__':
    with app.app_context():
        # Drop all tables (if needed)
        db.drop_all()

        # Recreate the tables
        db.create_all()

        # Add dummy data
        add_dummy_data()
        add_root_user()
    app.run(debug=True)    
