import paramiko
import sys

VPS_IP = "139.59.8.158"
VPS_PASS = "A@ghaZ9431A"

def run_cmd(ssh, cmd):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='ignore').strip()
    err = stderr.read().decode('utf-8', errors='ignore').strip()
    if out: print(f"STDOUT: {out}")
    if err: print(f"STDERR: {err}")
    return exit_status

def deploy_to_vps():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print(f"Connecting to {VPS_IP}...")
        ssh.connect(VPS_IP, username='root', password=VPS_PASS, timeout=10)
        print("Connected successfully!")
        
        # 1. Install Docker and git if not present
        run_cmd(ssh, "apt-get update -y && apt-get install docker.io docker-compose git -y")
        run_cmd(ssh, "apt-get install docker-compose-plugin -y")
        
        # 2. Clone repository
        print("Cloning repository...")
        run_cmd(ssh, "if [ -d 'STREAMDROP' ]; then rm -rf STREAMDROP; fi")
        run_cmd(ssh, "git clone https://github.com/aaghaz370/STREAMDROP.git")
        
        # 3. Upload .env file
        print("Uploading .env file...")
        sftp = ssh.open_sftp()
        sftp.put(".env", "STREAMDROP/.env")
        # Also upload session if exists
        try:
            sftp.put("SimpleStreamBot.session", "STREAMDROP/SimpleStreamBot.session")
        except:
            pass
        sftp.close()
        
        # 4. Build and start
        print("Building and starting Docker container...")
        run_cmd(ssh, "cd STREAMDROP && docker-compose build && docker-compose up -d")
        
        print("Deployment completed successfully!")
        ssh.close()
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    deploy_to_vps()
