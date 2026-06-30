import paramiko
import os

VPS_IP = "168.144.115.165"
VPS_PASS = "A@ghaZ9431A"

def update_vps():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(VPS_IP, username='root', password=VPS_PASS, timeout=10)
        
        print("Updating codebase and restarting docker...")
        # Pull latest code and rebuild docker
        cmd = "cd STREAMDROP && git pull origin main && docker-compose build && docker-compose up -d"
        stdin, stdout, stderr = ssh.exec_command(cmd)
        
        exit_status = stdout.channel.recv_exit_status()
        out = stdout.read().decode(errors='ignore').strip()
        err = stderr.read().decode(errors='ignore').strip()
        
        if out:
            print(f"STDOUT: {out}")
        if err:
            print(f"STDERR: {err}")
            
        print("Deployment completed successfully!")
        ssh.close()
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    update_vps()
