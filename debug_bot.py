import paramiko

VPS_IP = "139.59.8.158"
VPS_PASS = "A@ghaZ9431A"

def debug_bot():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(VPS_IP, username='root', password=VPS_PASS, timeout=10)
        
        # Stop container
        stdin, stdout, stderr = ssh.exec_command("docker stop streamdrop_bot")
        stdout.read()
        
        # Run it directly to see if it prints errors
        stdin, stdout, stderr = ssh.exec_command("cd STREAMDROP && python3 app.py &> debug.log & sleep 5 && cat debug.log")
        out = stdout.read().decode('utf-8', errors='ignore').strip()
        err = stderr.read().decode('utf-8', errors='ignore').strip()
        print(f"DEBUG LOG:\n{out}")
        
        # Start container back up
        ssh.exec_command("docker start streamdrop_bot")
        
        ssh.close()
    except Exception as e:
        print(e)

if __name__ == "__main__":
    debug_bot()
