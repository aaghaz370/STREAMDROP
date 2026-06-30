import paramiko
import os

VPS_IP = "168.144.115.165"
VPS_PASS = "A@ghaZ9431A"

def check_logs():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(VPS_IP, username='root', password=VPS_PASS, timeout=10)
        
        print("Fetching docker logs...")
        stdin, stdout, stderr = ssh.exec_command("docker logs streamdrop_bot --tail 50")
        
        out = stdout.read().decode(errors='ignore').strip()
        err = stderr.read().decode(errors='ignore').strip()
        
        print("STDOUT:")
        print(out)
        print("STDERR:")
        print(err)
        
        ssh.close()
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    check_logs()
