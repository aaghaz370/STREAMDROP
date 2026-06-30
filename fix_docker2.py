import paramiko
import sys

VPS_IP = "168.144.115.165"
VPS_PASS = "A@ghaZ9431A"

def run_cmd(ssh, cmd):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='ignore').strip()
    err = stderr.read().decode('utf-8', errors='ignore').strip()
    print(f"STDOUT: {out}\nSTDERR: {err}")

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username='root', password=VPS_PASS, timeout=10)
    
    # Force start docker daemon
    run_cmd(ssh, "systemctl unmask docker.service")
    run_cmd(ssh, "systemctl start docker.service")
    
    # Remove old container if any
    run_cmd(ssh, "docker rm -f streamdrop_bot")
    
    # Re-run docker compose
    # Note: docker compose might take a long time to build, so no timeout
    print("Building and running docker compose...")
    stdin, stdout, stderr = ssh.exec_command("cd STREAMDROP && docker-compose build && docker-compose up -d")
    print("STDOUT:", stdout.read().decode('utf-8', errors='ignore'))
    print("STDERR:", stderr.read().decode('utf-8', errors='ignore'))
    
    ssh.close()
except Exception as e:
    print(e)
