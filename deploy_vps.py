import paramiko
import os
import time

VPS_IP = "139.59.8.158"
VPS_PASS = "A@ghaZ9431A" # Change this if your new droplet has a different password
REPO_URL = "https://github.com/aaghaz370/STREAMDROP.git"

def run_command(ssh, cmd):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    # Wait for the command to finish
    exit_status = stdout.channel.recv_exit_status()
    
    out = stdout.read().decode(errors='ignore').strip()
    err = stderr.read().decode(errors='ignore').strip()
    
    if out:
        print(f"STDOUT: {out}")
    if err:
        print(f"STDERR: {err}")
    return exit_status

def deploy():
    try:
        print(f"Connecting to {VPS_IP}...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(VPS_IP, username='root', password=VPS_PASS, timeout=10)
        print("Connected successfully!")
        
        # 1. Update and install dependencies
        run_command(ssh, "apt-get update -y && apt-get install docker.io docker-compose git -y")
        
        # 2. Clone repo
        print("Cloning repository...")
        run_command(ssh, f"if [ -d 'STREAMDROP' ]; then rm -rf STREAMDROP; fi")
        run_command(ssh, f"git clone {REPO_URL}")
        
        # 3. Upload .env file
        print("Uploading .env file...")
        sftp = ssh.open_sftp()
        sftp.put(".env", "/root/STREAMDROP/.env")
        # Ensure session file is also uploaded if it exists to avoid login blocks
        if os.path.exists("SimpleStreamBot.session"):
            sftp.put("SimpleStreamBot.session", "/root/STREAMDROP/SimpleStreamBot.session")
        sftp.close()
        
        # 4. Start Docker Compose
        print("Building and starting Docker container...")
        run_command(ssh, "cd STREAMDROP && docker-compose up -d --build")
        
        print("Deployment completed successfully!")
        ssh.close()
    except Exception as e:
        print(f"Deployment failed: {e}")

if __name__ == "__main__":
    deploy()
