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
    print(f"STDOUT: {out}\nSTDERR: {err}")

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_IP, username='root', password=VPS_PASS, timeout=10)
    
    print("Installing docker plugin...")
    run_cmd(ssh, "curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh")
    
    run_cmd(ssh, "systemctl daemon-reload && systemctl restart docker")
    
    print("Removing old containers...")
    run_cmd(ssh, "docker rm -f $(docker ps -a -q)")
    
    print("Starting bot...")
    run_cmd(ssh, "cd STREAMDROP && docker compose build && docker compose up -d")
    
    ssh.close()
except Exception as e:
    print(e)
