import paramiko
import sys

VPS_IP = "168.144.115.165"
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
    
    # 1. Ensure docker compose plugin is installed
    run_cmd(ssh, "apt-get update -y && apt-get install docker-compose-plugin -y")
    
    # 2. Cleanup old stuff
    run_cmd(ssh, "docker rm -f streamdrop_bot")
    run_cmd(ssh, "docker rmi -f streamdrop_streamdrop")
    
    # 3. Use 'docker compose' (with space) to build and run
    print("Building and running docker compose...")
    stdin, stdout, stderr = ssh.exec_command("cd STREAMDROP && docker compose build && docker compose up -d")
    exit_status = stdout.channel.recv_exit_status()
    print("STDOUT:", stdout.read().decode('utf-8', errors='ignore'))
    print("STDERR:", stderr.read().decode('utf-8', errors='ignore'))
    
    ssh.close()
except Exception as e:
    print(e)
