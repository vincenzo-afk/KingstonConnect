# COPY THIS ENTIRE SCRIPT INTO A GOOGLE COLAB CELL AND RUN IT
# This script sets up the StudyGPT Backend API.
# 
# MODES:
# 1. GOOGLE COLAB (Recommended): Uses Llama-2-7b-chat (GPU accelerated).
# 2. LOCAL WINDOWS (Fallback): Uses TinyLlama-1.1B-Chat (CPU friendly).

import os
import subprocess
import time
import sys
import threading
import importlib

# Global variable to track activity
last_active_time = time.time()

def install_dependencies():
    print("Checking dependencies...")
    packages = ["flask", "flask-cors", "pyngrok", "transformers", "accelerate", "sentencepiece", "protobuf"]
    
    # Only install bitsandbytes on Linux/Colab
    if os.name != 'nt':
        packages.append("bitsandbytes")

    # Check if packages are installed
    missing = []
    for pkg in packages:
        try:
            importlib.import_module(pkg.replace("-", "_"))
        except ImportError:
            missing.append(pkg)
    
    try:
        import pyngrok
    except ImportError:
        if "pyngrok" not in missing: missing.append("pyngrok")

    if missing:
        print(f"Installing missing dependencies: {', '.join(missing)}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q"] + missing)
        print("Dependencies installed.")
        importlib.invalidate_caches()

def setup_ngrok():
    try:
        from pyngrok import ngrok, conf
    except ImportError:
        print("⚠️ pyngrok not found. Please restart.")
        return None

    # Terminate open tunnels
    try:
        ngrok.kill()
    except:
        pass
    
    # Ask for token if running locally and not set
    if os.name == 'nt':
        print("\n⚠️ ngrok requires an authtoken.")
        print("1. Go to https://dashboard.ngrok.com/get-started/your-authtoken")
        print("2. Copy your token.")
        token = input("👉 Paste your ngrok authtoken here (or press Enter to try without): ").strip()
        if token:
            ngrok.set_auth_token(token)
    
    # Open tunnel
    try:
        public_url = ngrok.connect(8000).public_url
        print(f"\n✅ PUBLIC API URL: {public_url}")
        print("👉 Copy this URL and paste it into the StudyGPT Settings in your web app.\n")
        return public_url
    except Exception as e:
        print(f"❌ Error starting ngrok: {e}")
        return None

def monitor_inactivity():
    global last_active_time
    print("⏳ Inactivity monitor started (10 minute timeout)...")
    while True:
        time.sleep(60)
        elapsed = time.time() - last_active_time
        if elapsed > 600:
            print(f"\n⚠️ No activity for 10 minutes. Shutting down...")
            try:
                from google.colab import runtime
                runtime.unassign()
            except ImportError:
                os._exit(0)

def run_server():
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer

    app = Flask(__name__)
    CORS(app)

    # Model Selection Logic
    if torch.cuda.is_available():
        print("🚀 GPU Detected. Using Llama-2-7b-chat-hf...")
        model_id = "NousResearch/Llama-2-7b-chat-hf"
        load_in_4bit = True
        device_map = "auto"
        torch_dtype = torch.float16
    else:
        print("⚠️ No GPU detected. Using TinyLlama-1.1B-Chat (CPU Friendly)...")
        model_id = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
        load_in_4bit = False
        device_map = "cpu"
        torch_dtype = torch.float32

    print(f"Loading Model ({model_id})... This takes a few minutes...")
    
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
        tokenizer.pad_token = tokenizer.eos_token 
        
        model = AutoModelForCausalLM.from_pretrained(
            model_id,
            device_map=device_map,
            trust_remote_code=True,
            load_in_4bit=load_in_4bit,
            torch_dtype=torch_dtype
        )
        print("✅ Model Loaded Successfully!")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return

    @app.before_request
    def update_activity():
        global last_active_time
        last_active_time = time.time()

    @app.route('/chat', methods=['POST'])
    def chat():
        data = request.json
        messages = data.get('messages', [])
        max_tokens = data.get('max_tokens', 512)
        temperature = data.get('temperature', 0.7)

        if not messages:
            return jsonify({"error": "No messages provided"}), 400

        # Simple prompt construction for TinyLlama/Llama
        full_prompt = ""
        for msg in messages:
            role = msg['role']
            content = msg['content']
            if role == 'system':
                full_prompt += f"<|system|>\n{content}</s>\n"
            elif role == 'user':
                full_prompt += f"<|user|>\n{content}</s>\n"
            elif role == 'assistant':
                full_prompt += f"<|assistant|>\n{content}</s>\n"
        
        full_prompt += "<|assistant|>\n"

        if not torch.cuda.is_available():
             print("Generating response (CPU)...")

        model_inputs = tokenizer(full_prompt, return_tensors="pt").to(model.device)

        with torch.no_grad():
            generated_ids = model.generate(
                model_inputs.input_ids,
                max_new_tokens=max_tokens,
                temperature=temperature,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        response = tokenizer.decode(generated_ids[0][model_inputs.input_ids.shape[1]:], skip_special_tokens=True)
        
        return jsonify({
            "role": "assistant",
            "content": response.replace(full_prompt, "").strip() # Try to remove prompt if present
        })

    @app.route('/', methods=['GET'])
    def health():
        return jsonify({"status": "online", "model": model_id})

    monitor_thread = threading.Thread(target=monitor_inactivity, daemon=True)
    monitor_thread.start()

    app.run(port=8000)

if __name__ == "__main__":
    try:
        install_dependencies()
        setup_ngrok()
        run_server()
    except KeyboardInterrupt:
        print("Server stopped.")
