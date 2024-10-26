from flask import Flask, request, jsonify, send_from_directory
import os
import json
import subprocess
from subprocess import Popen
from flask_cors import CORS
import shutil
import base64
from PIL import Image
import csv
from collections import defaultdict
from dotenv import load_dotenv
load_dotenv()
import os

app = Flask(__name__)
CORS(app, origins='*')
# Mendefinisikan path untuk menyimpan file gambar
UPLOAD_FOLDER = 'upload'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Mendefinisikan path untuk menyimpan data dalam file JSON
JSON_FILE = 'data.json'
PREDICT_FILE = 'detect/exp/predictions.csv'

# Fungsi untuk membaca data dari file JSON

ODONTOGRAM_NUMBER = [11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48]
BASE_URL = f"{os.getenv('BASE_URL')}"
MODEL_YOLO = f"{os.getenv('MODEL_YOLO')}"
CONF_THRES = f"{os.getenv('CONF_THRES')}"
PORT = os.getenv("PORT")
# BASE_URL = 'http://localhost:5006'
URL_CROP = BASE_URL+"/gambar/crops/"
URL_CROP_SQUARE = BASE_URL+"/gambar/crops-square/"

def read_data():
    if not os.path.exists(JSON_FILE):
        return []

    dataPredict = []
    missing_teeth = []
    duplicate_predictions = []
    show_odontogram = []
    result_merge_accuracy =[]
    missing_teeth =[]
    duplicate_predictions=[]
    dataPredict=[]
    if  os.path.exists(PREDICT_FILE):
        with open(PREDICT_FILE, 'r') as file:
            csv_reader = csv.reader(file)
            # next(csv_reader)  # Skip header row
            for row in csv_reader:
                number = int(row[1])  # Get number from the second column
                accuracy = float(row[2])  # Get accuracy from the third column

                dataPredict.append({'number': number, 'accuracy': accuracy})
        
        # Sort the dataPredict array by 'number' in ascending order
        dataPredict = sorted(dataPredict, key=lambda x: x['number'])
        
        # Identify missing teeth
        missing_teeth = [tooth for tooth in ODONTOGRAM_NUMBER if tooth not in {entry['number'] for entry in dataPredict}]

        # Identify duplicate numbers
        number_counts = defaultdict(int)
        for entry in dataPredict:
            number_counts[entry['number']] += 1

        # Select entries with duplicate numbers
        duplicate_predictions = [entry for entry in dataPredict if number_counts[entry['number']] > 1]
        

        # # Create the show_odontogram list
        result_dict = {}

        for item in dataPredict:
            number = item['number']
            accuracy = item['accuracy']
            

            if number in result_dict:
                result_dict[number]['accuracy'].append(accuracy)
                result_dict[number]['isDuplicate'] = True
                result_dict[number]['duplicateCount'] += 1
                img1 = URL_CROP + str(number) + '/img.jpg'
                img2 = URL_CROP + str(number) + '/img2.jpg'
                img3 = URL_CROP + str(number) + '/img3.jpg'
                imgSquare1 = URL_CROP_SQUARE + str(number) + '/img.jpg'
                imgSquare2 = URL_CROP_SQUARE + str(number) + '/img2.jpg'
                imgSquare3 = URL_CROP_SQUARE + str(number) + '/img3.jpg'
                result_dict[number]['urlImage'] =[img1, img2]
                result_dict[number]['urlImageSquare'] =[imgSquare1, imgSquare2]
                if result_dict[number]['duplicateCount'] == 2:
                    result_dict[number]['urlImage'] =[img1, img2, img3]
                    result_dict[number]['urlImageSquare'] =[imgSquare1, imgSquare2,imgSquare3]
                
            else:
                result_dict[number] = {
                    'number': number, 
                    'accuracy': [accuracy],
                    'isDuplicate': False,
                    'duplicateCount': 0,
                    'urlImage': URL_CROP + str(number) + '/img.jpg',
                    'urlImageSquare': URL_CROP_SQUARE + str(number) + '/img.jpg',
                    }

        result_merge_accuracy = [
            {'number': entry['number'], 
             'accuracy': entry['accuracy'][0] if len(entry['accuracy']) == 1 else entry['accuracy'],
             'urlImage': entry['urlImage'] if not entry['isDuplicate'] else entry['urlImage'],
             'urlImageSquare': entry['urlImageSquare'] if not entry['isDuplicate'] else entry['urlImageSquare'],
             'isDuplicate': entry['isDuplicate'],
             'duplicateCount': entry['duplicateCount'],
             'isMissing': False
             }
            for entry in result_dict.values()
        ]
        
        for number in ODONTOGRAM_NUMBER:
            number_exists = any(entry['number'] == number for entry in result_merge_accuracy)
            
            if not number_exists:
                missing_entry = {
                    "accuracy": None,
                    "duplicateCount": 0,
                    "isDuplicate": False,
                    "isMissing": True,
                    "number": number,
                    "urlImage": "",
                    "urlImageSquare": ""
                }
                result_merge_accuracy.append(missing_entry)

        # Sort the result based on the "number" field
        result_merge_accuracy.sort(key=lambda x: x['number'])
    
    with open(JSON_FILE, 'r') as file:
        data = json.load(file)

        data['predictions'] ={ 
                              'show_odontogram': result_merge_accuracy or '',
                              'missing_teeth': missing_teeth or '', 
                              'double_predict': duplicate_predictions or '',
                              'all': dataPredict or ''}
        return data

# Fungsi untuk menulis data ke file JSON


def write_data(data):
    with open(JSON_FILE, 'w') as file:
        json.dump(data, file)

# Mendefinisikan endpoint untuk membuat entri data baru


# Menentukan direktori file gambar
app.config['RESULT_TEST_FOLDER'] = 'detect/exp'
app.config['CROP_FOLDER'] = 'detect/exp/crops'
app.config['CROP_FOLDER_SQUARE'] = 'detect/exp/crops-square'


@app.route('/gambar/<path:filename>')
def get_gambar(filename):
    # Mengirim file gambar dari direktori upload
    return send_from_directory(app.config['RESULT_TEST_FOLDER'], filename)

@app.route('/gambar/crops/<path:dir>')
def get_gambar_crop(dir):
    # Mengirim file gambar dari direktori upload
    return send_from_directory(app.config['CROP_FOLDER'], dir)

@app.route('/gambar/crops-square/<path:dir>')
def get_gambar_crop_square(dir):
    # Mengirim file gambar dari direktori upload
    return send_from_directory(app.config['CROP_FOLDER_SQUARE'], dir)


@app.route('/data', methods=['POST'])
def create_data():

    print('-------------')
    print(request.is_json)
    for field_name, field_value in request.form.items():
        print(f'{field_name}: {field_value}')

    print('-------------')
    # files = request.files.getlist('file_gambar')
    # for file in files:
    #     # Access file properties
    #     filename = file.filename
    #     content_type = file.content_type
    #     file_size = len(file.read())

    #     print(f'File Name: {filename}')
    #     print(f'Content Type: {content_type}')
    #     print(f'File Size: {file_size} bytes')
    # # print(request.get_json())
    # # print(request.files['file_gambar'])
    # # print(request.form.get('file_gambar'))
    # print('-------------')

    # return jsonify({"req": 's'}), 201

    data = read_data()
    # Menerima input dari request body
    # id = request.form.get('id')
    nama = request.form.get('nama')
    rekam_medik = request.form.get('rekam_medik')
    file_gambar = request.files['file_gambar']

    # Menyimpan file gambar dengan penomoran bertambah
    # file_name = str(len(data) + 1) + '.' + file_gambar.filename.split('.')[-1]
    file_name = 'img.' + file_gambar.filename.split('.')[-1]
    # id = str(len(data) + 1)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
    # file_gambar.save(file_path)

    # Buka gambar menggunakan Pillow
    image = Image.open(file_gambar)

    # Resize gambar menjadi lebar 640
    new_width = 1200
    width, height = image.size
    new_height = int(new_width * height / width)
    resized_image = image.resize((new_width, new_height))

    # Simpan gambar yang telah diresize
    resized_image.save(file_path)

    # Menyimpan data baru ke dalam list
    new_data = {
        # 'id': id,
        'nama': nama,
        'rekam_medik': rekam_medik,
        'file_gambar': file_path
    }

    # Specify the path to the "detect/exp" folder
    exp_folder = os.path.join('detect', 'exp')

    # Delete the contents of the "detect/exp" folder if it exists
    if os.path.exists(exp_folder):
        shutil.rmtree(exp_folder)

    
    process = Popen(['python', '../yolo/yolov5/detect.py',
                     '--weights', f'../yolo/model-test/{MODEL_YOLO}',
                    '--img', '608',
                     '--conf-thres', f'{CONF_THRES}',
                     '--source', file_path,
                     '--line-thickness', '1',
                     '--save-crop',
                     '--exist-ok',
                     '--save-txt',
                     '--save-csv',
                     '--project', 'detect',
                     '--save-conf'], shell=True)
    process.wait()
    
    
    print(new_data)
    # data.append(new_data)

    # Menulis data ke file JSON
    # write_data(data)
    write_data(new_data)

    return jsonify(new_data), 201

# Mendefinisikan endpoint untuk mendapatkan semua data


@ app.route('/data', methods=['GET'])
def get_all_data():
    # Define the path to the image file

    data = read_data()
    if not data:
        return jsonify({}), 200

    data['gambar'] = BASE_URL+"/gambar/img.jpg"
    return jsonify(data), 200

# Mendefinisikan endpoint untuk mendapatkan data berdasarkan ID


@ app.route('/data/<id>', methods=['GET'])
def get_data(id):
    data = read_data()
    for item in data:
        if item['id'] == id:
            return jsonify(item), 200

    return jsonify({'message': 'Data not found'}), 404

# Mendefinisikan endpoint untuk mengupdate data berdasarkan ID


@ app.route('/data/<id>', methods=['PUT'])
def update_data(id):
    data = read_data()
    for item in data:
        if item['id'] == id:
            item['nama'] = request.form.get('nama')
            item['rekam_medik'] = request.form.get('rekam_medik')
            write_data(data)
            return jsonify(item), 200

    return jsonify({'message': 'Data not found'}), 404

# Mendefinisikan endpoint untuk menghapus data berdasarkan ID


@ app.route('/data', methods=['DELETE'])
def delete_data_static():

    file_path = 'data.json'
    data = {}
    with open(file_path, 'w') as file:
        json.dump(data, file)
        
    PREDICT_FILE = 'detect/exp/predictions.csv'
    if os.path.exists(PREDICT_FILE):
        with open(PREDICT_FILE, 'w', newline='') as file:
            pass

    # Specify the path to the "detect/exp" folder
    exp_folder = os.path.join('detect', 'exp')
    # Delete the contents of the "detect/exp" folder if it exists
    if os.path.exists(exp_folder):
        shutil.rmtree(exp_folder)

    folder_path = 'upload'
    # Get all file names in the directory
    file_names = os.listdir(folder_path)
    # Iterate over the file names and delete each file
    for file_name in file_names:
        file_path = os.path.join(folder_path, file_name)
        if os.path.isfile(file_path):
            os.remove(file_path)

    return jsonify({'message': 'Data deleted'}), 200


@ app.route('/data/<id>', methods=['DELETE'])
def delete_data(id):
    data = read_data()
    for item in data:
        if item['id'] == id:
            # Menghapus file gambar terkait
            if os.path.exists(item['file_gambar']):
                os.remove(item['file_gambar'])
            data.remove(item)
            write_data(data)
            return jsonify({'message': 'Data deleted'}), 200
    return jsonify({'message': 'Data not found'}), 404


if __name__ == '__main__':
    # Membuat folder 'detect/test' jika belum ada
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    # app.run(debug=True, port=5001)
    app.run(debug=True, port=PORT)
