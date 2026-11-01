"""Real frames for the process table: Nigina on a site and the plans from the «Неоклассика» reel.

-> media/steps/<name>.jpg (vertical video frames, shown cropped in the table)
"""
import os, subprocess
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
SRC = r'C:\Users\Asus\Downloads\Telegram Desktop'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'media', 'steps'); os.makedirs(OUT, exist_ok=True)
FRAMES = {           # name: (file, second)
    'measure': ('0129 (2).mp4', 20.0),       # Nigina on site
    'plan': ('Nigina Reels_3.mp4', 34.0),    # plan with furniture
    'drawings': ('Nigina Reels_3.mp4', 30.0),  # engineering plan
}
for name, (f, t) in FRAMES.items():
    out = os.path.join(OUT, name + '.jpg')
    subprocess.run([FF, '-v', 'error', '-y', '-ss', str(t), '-i', os.path.join(SRC, f), '-frames:v', '1',
                    '-vf', 'scale=900:-2', '-q:v', '3', out], check=True)
    print(name, os.path.getsize(out))
