import paramiko
import sys

VPS_IP = "168.144.115.165"
VPS_PASS = "A@ghaZ9431A"

def check_logs():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(VPS_IP, username='root', password=VPS_PASS, timeout=10)
        
        stdin, stdout, stderr = ssh.exec_command("docker logs --tail 50 streamdrop-streamdrop-1")
        out = stdout.read().decode('utf-8', errors='ignore').strip()
        print(f"STDOUT: {out}")
        
        # If it was named differently:
        stdin, stdout, stderr = ssh.exec_command("docker ps")
        out = stdout.read().decode('utf-8', errors='ignore').strip()
        print(f"DOCKER PS: {out}")
        
        ssh.close()
    except Exception as e:
        print(e)

if __name__ == "__main__":
    check_logs()
