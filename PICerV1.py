from PIL import Image
import os
import base64
import requests
from tqdm import tqdm
import time

# Define the endpoint URL
url = "http://localhost:8080/api/files/upload"
# url = "https://picer-production.up.railway.app/api/files/upload"

# Function to compress images
def compress_images(source_folder, target_folder, quality=10):
    if not os.path.exists(target_folder):
        os.makedirs(target_folder)

    files = [file for file in os.listdir(source_folder) if file.endswith('.jpg') or file.endswith('.jpeg')]
    original_size = 0
    compressed_size = 0
    
    with tqdm(total=len(files), desc="Compressing images", unit="file") as pbar:
        for filename in files:
            original_path = os.path.join(source_folder, filename)
            target_path = os.path.join(target_folder, filename)
            
            original_size += os.path.getsize(original_path)
            
            img = Image.open(original_path)
            img.save(target_path, "JPEG", quality=quality)
            
            compressed_size += os.path.getsize(target_path)
            
            pbar.set_postfix(file=filename)  # Optional: shows the current file being processed
            pbar.update(1)
    
    original_size_mb = original_size / (1024 * 1024)
    compressed_size_mb = compressed_size / (1024 * 1024)
    saved_mb = original_size_mb - compressed_size_mb
    pbar.set_postfix(file='', status='')  # Clear postfix
    print(f"Image compression complete. Original size: {original_size_mb:.2f} MB, Compressed size: {compressed_size_mb:.2f} MB, Saved: {saved_mb:.2f} MB")

# Function to convert image to base64 string
def image_to_base64(file_path):
    with open(file_path, "rb") as image_file:
        base64_string = base64.b64encode(image_file.read()).decode('utf-8')
    return base64_string

# Function to send POST request with payload
def send_post_request(file_name, base64_string):
    payload = {
        "fileName": file_name,
        "fileContent": base64_string
    }
    response = requests.post(url, json=payload)
    return response

# Function to upload images
def upload_images(folder_path):
    files = [file for file in os.listdir(folder_path) if file.endswith(".jpg")]
    
    with tqdm(total=len(files), desc="Uploading files", unit="file") as pbar:
        for file_name in files:
            start_time = time.time()
            file_path = os.path.join(folder_path, file_name)
            base64_string = image_to_base64(file_path)
            response = send_post_request(file_name, base64_string)
            elapsed_time = time.time() - start_time
            
            if response.status_code == 200:
                pbar.set_postfix(status="Success", file=file_name, elapsed=f"{elapsed_time:.2f}s")
            else:
                pbar.set_postfix(status="Failed", file=file_name, elapsed=f"{elapsed_time:.2f}s")
                
            pbar.update(1)
    
    pbar.set_postfix(file='', status='', elapsed='')  # Clear postfix
    print("Upload complete.")

# Source and target folders for compression
source_folder = 'C:\\Users\\zaina\\htmlMocks\\imagesQuality'
target_folder = 'C:\\Users\\zaina\\htmlMocks\\images'

# Ensure target folder is clean before compression
if os.path.exists(target_folder):
    for file in os.listdir(target_folder):
        os.remove(os.path.join(target_folder, file))

# Compress images
compress_images(source_folder, target_folder)

# Upload compressed images
upload_images(target_folder)
