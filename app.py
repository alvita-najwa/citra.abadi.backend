from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os # Tambahan: untuk urusan path file
from werkzeug.utils import secure_filename # Tambahan: agar nama file aman

app = Flask(__name__)

# --- KONFIGURASI ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@127.0.0.1/citra_abadi'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Konfigurasi Folder Upload
UPLOAD_FOLDER = 'static/uploads/designs'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Maksimal file 16MB

# Pastikan folder upload ada
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

db = SQLAlchemy(app)

# --- MODEL DATABASE ---

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    whatsapp = db.Column(db.String(20), nullable=False)
    product = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    payment = db.Column(db.String(50), nullable=False)
    note = db.Column(db.Text) # Tambahan: untuk menampung catatan dinamis
    file_path = db.Column(db.String(255)) # Tambahan: untuk menyimpan nama file desain
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

# --- ROUTES ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/product')
def product():
    return render_template('product.html')

@app.route('/contact')
def contact_page():
    return render_template('contact.html')

@app.route('/developer')
def developer_page():
    return render_template('developer.html')

# --- API ENDPOINTS ---

@app.route('/api/contact', methods=['POST'])
def save_contact():
    try:
        data = request.get_json()
        new_message = Message(
            name=data['name'], 
            email=data['email'], 
            content=data['message']
        )
        db.session.add(new_message)
        db.session.commit()
        return jsonify({"status": "success", "message": "Pesan tersimpan!"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# INI BAGIAN YANG PALING BANYAK BERUBAH
@app.route('/api/order', methods=['POST'])
def save_order():
    try:
        # Gunakan request.form (karena FormData mengirim data sebagai form, bukan JSON raw)
        name = request.form.get('name')
        whatsapp = request.form.get('whatsapp')
        product = request.form.get('product')
        amount = request.form.get('amount')
        payment = request.form.get('payment')
        note = request.form.get('note')

        if not name or not whatsapp:
            return jsonify({"status": "error", "message": "Nama dan WhatsApp wajib diisi"}), 400

        # Menangani Upload File
        file_name = None
        if 'design_file' in request.files:
            file = request.files['design_file']
            if file and file.filename != '':
                # Tambahkan timestamp agar nama file tidak bentrok
                original_name = secure_filename(file.filename)
                file_name = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{original_name}"
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], file_name))

        # Simpan ke Database
        new_order = Order(
            name=name,
            whatsapp=whatsapp,
            product=product,
            amount=int(amount) if amount else 1,
            payment=payment,
            note=note,
            file_path=file_name,
            status='pending'
        )
        
        db.session.add(new_order)
        db.session.commit()
        
        return jsonify({"status": "success", "message": "Pesanan berhasil diproses!"}), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error Save Order: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)