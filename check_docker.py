import paramiko

VPS_IP = "168.144.115.165"
VPS_PASS = "A@ghaZ9431A"

def run_cmd(ssh, cmd):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=30)
    out = stdout.read().decode(errors='ignore').strip()
    err = stderr.read().decode(errors='ignore').strip()
    print(f"STDOUT: {out}\nSTDERR: {err}")

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username='root', password=VPS_PASS, timeout=10)
    
    run_cmd(ssh, "systemctl status docker --no-pager")
    run_cmd(ssh, "systemctl start docker")
    run_cmd(ssh, "docker ps -a")
    
    ssh.close()
except Exception as e:
    print(e)
