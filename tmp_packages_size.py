import os
from pathlib import Path

base = Path(r'C:\Users\AKAM\AppData\Local\Packages')
items = []
for entry in base.iterdir():
    if entry.is_dir():
        size = 0
        for root, dirs, files in os.walk(entry):
            for f in files:
                try:
                    size += os.path.getsize(os.path.join(root, f))
                except OSError:
                    pass
        items.append((entry.name, size))
items.sort(key=lambda x: x[1], reverse=True)
for name, size in items[:20]:
    print(name, round(size/2**30, 2))
