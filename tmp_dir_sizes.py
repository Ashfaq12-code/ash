import os
import math

root = 'C:\\'

def get_dir_size(path):
    total = 0
    for root_dir, dirs, files in os.walk(path, topdown=True):
        for f in files:
            fp = os.path.join(root_dir, f)
            try:
                total += os.path.getsize(fp)
            except OSError:
                pass
    return total

print('Top C:\\ directories by size:')
items = []
for entry in os.scandir(root):
    if entry.is_dir(follow_symlinks=False):
        try:
            items.append((entry.name, get_dir_size(entry.path)))
        except Exception:
            items.append((entry.name, 0))
items.sort(key=lambda x: x[1], reverse=True)
for name, size in items[:15]:
    print(name, round(size/2**30, 2))

print('---')
user = r'C:\Users\AKAM'
if os.path.exists(user):
    print('Top C:\\Users\\AKAM directories by size:')
    items = []
    for entry in os.scandir(user):
        if entry.is_dir(follow_symlinks=False):
            try:
                items.append((entry.name, get_dir_size(entry.path)))
            except Exception:
                items.append((entry.name, 0))
    items.sort(key=lambda x: x[1], reverse=True)
    for name, size in items[:15]:
        print(name, round(size/2**30, 2))
else:
    print('User folder not found')
