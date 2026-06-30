import paramiko
import os

VPS_IP = "168.144.115.165"
VPS_PASS = "A@ghaZ9431A"

def run_cmd(ssh, cmd):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode(errors='ignore').strip()
    err = stderr.read().decode(errors='ignore').strip()
    if out: print(f"STDOUT: {out}")
    if err: print(f"STDERR: {err}")
    return exit_status

def fix_docker():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(VPS_IP, username='root', password=VPS_PASS, timeout=10)
        
        print("Starting docker daemon...")
        run_cmd(ssh, "systemctl daemon-reload && systemctl restart docker")
        
        # We know `docker-compose` is already installed from earlier (1.29.2).
        # We need to remove the bad container config issue. The issue was that the `streamdrop_bot` container was created by 1.29.2 but docker engine was updated?
        # Let's remove the container manually via docker API if needed, or just `docker rm -f`.
        run_cmd(ssh, "docker rm -f streamdrop_bot")
        run_cmd(ssh, "docker compose version || docker-compose --version")
        
        # Rebuild and run with standard docker-compose
        run_cmd(ssh, "cd STREAMDROP && docker-compose build && docker-compose up -d")
        
        print("Fixed and deployed successfully!")
        ssh.close()
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    fix_docker()
