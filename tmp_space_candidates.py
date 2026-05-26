import os
import shutil

def dir_size(path):
    total = 0
    for root, dirs, files in os.walk(path, topdown=True):
        for f in files:
            try:
                total += os.path.getsize(os.path.join(root, f))
            except OSError:
                pass
    return total

candidates = [
    r'C:\Windows\SoftwareDistribution\Download',
    r'C:\Windows\Temp',
    r'C:\ProgramData\Microsoft\Windows\WER',
    r'C:\Users\AKAM\AppData\Local\Temp',
    r'C:\Users\AKAM\AppData\Local\npm-cache',
    r'C:\Users\AKAM\AppData\Local\Microsoft\Windows\INetCache',
    r'C:\Users\AKAM\AppData\Local\Microsoft\Windows\WebCache',
    r'C:\Users\AKAM\AppData\Local\Packages',
    r'C:\Users\AKAM\AppData\Local\Microsoft\Windows\Temporary Internet Files',
]

print('Candidate directories:')
for path in candidates:
    if os.path.exists(path):
        print(path, 'exists, size GB:', round(dir_size(path)/2**30, 2))
    else:
        print(path, 'not found')
