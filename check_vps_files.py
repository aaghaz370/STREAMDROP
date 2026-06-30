import paramiko

VPS_IP = "139.59.8.158"
VPS_PASS = "A@ghaZ9431A"

def check_files():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(VPS_IP, username='root', password=VPS_PASS, timeout=10)
        
        stdin, stdout, stderr = ssh.exec_command("ls -la STREAMDROP")
        out = stdout.read().decode('utf-8', errors='ignore').strip()
        print(f"FILES:\n{out}")
        
        ssh.close()
    except Exception as e:
        print(e)

if __name__ == "__main__":
    check_files()
