import paramiko

VPS_IP = "139.59.8.158"
VPS_PASS = "A@ghaZ9431A"

def check_logs():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(VPS_IP, username='root', password=VPS_PASS, timeout=10)
        
        stdin, stdout, stderr = ssh.exec_command("docker ps")
        out = stdout.read().decode('utf-8', errors='ignore').strip()
        print(f"DOCKER PS:\n{out}")
        
        stdin, stdout, stderr = ssh.exec_command("docker logs --tail 100 $(docker ps -q | head -n 1)")
        out = stdout.read().decode('utf-8', errors='ignore').strip()
        print(f"DOCKER LOGS:\n{out}")
        
        ssh.close()
    except Exception as e:
        print(e)

if __name__ == "__main__":
    check_logs()
