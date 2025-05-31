import socket

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.connect(('localhost', 5000))
    print("✅ Port 5000 is open and accessible")
except ConnectionRefusedError:
    print("❌ Port 5000 is closed or blocked")
finally:
    s.close()
