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
    if out: print(f"STDOUT: {out}")
    if err: print(f"STDERR: {err}")
    return exit_status

def fix():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(VPS_IP, username='root', password=VPS_PASS, timeout=10)
        
        # Unmask and start docker properly
        run_cmd(ssh, "systemctl unmask docker.service")
        run_cmd(ssh, "systemctl daemon-reload")
        run_cmd(ssh, "systemctl start docker.service")
        
        # Verify docker is running
        run_cmd(ssh, "docker ps")
        
        # Cleanup
        run_cmd(ssh, "docker rm -f $(docker ps -a -q)")
        
        # Build and run with docker compose (modern)
        print("Starting bot...")
        run_cmd(ssh, "cd STREAMDROP && docker compose build && docker compose up -d")
        
        ssh.close()
    except Exception as e:
        print(e)

if __name__ == "__main__":
    fix()
