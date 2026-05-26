import os
import shutil

def get_dir_size(path):
    total = 0
    for root, dirs, files in os.walk(path):
        for f in files:
            fp = os.path.join(root, f)
            try:
                total += os.path.getsize(fp)
            except OSError:
                pass
    return total

paths = [
    r'C:\Users\AKAM\AppData\Local\Temp',
    r'C:\Windows\Temp',
    r'C:\Users\AKAM\AppData\Local\npm-cache',
    r'C:\Users\AKAM\Downloads',
    r'C:\Users\AKAM\Desktop',
]
usage = shutil.disk_usage('C:')
print('C drive total GB:', round(usage.total/2**30, 2))
print('C drive used GB:', round(usage.used/2**30, 2))
print('C drive free GB:', round(usage.free/2**30, 2))
print('---')
for p in paths:
    if os.path.exists(p):
        size = get_dir_size(p)
        print(p, 'size GB:', round(size/2**30, 2))
    else:
        print(p, 'not found')
