"""Web versions of the studio videos (720x1280 H.264 + poster) and stills of the Greek house from its b-roll.

-> media/v/<id>.mp4, media/v/<id>.jpg
-> media/greek-stills/NN.jpg (input for build_gallery.py)
"""
import os, subprocess, re
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
SRC = r'C:\Users\Asus\Downloads\Telegram Desktop'
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'media', 'v'); os.makedirs(OUT, exist_ok=True)
ENC = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '26', '-maxrate', '2200k', '-bufsize', '4400k', '-pix_fmt', 'yuv420p',
       '-profile:v', 'high', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
       '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart']
SCALE = 'scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,fps=30'

VIDEOS = {
    'greek-tour': 'uy obzor.mp4',
    'greek-broll': 'uy.mp4',
    'neo-plan': 'Nigina Reels_3.mp4',
    'neo-tour': 'Nigina Premiera Reels_5.mp4',
}

def run(args): subprocess.run([FF, '-v', 'error', '-y'] + args, check=True)
def dur(p):
    o = subprocess.run([FF, '-i', p], capture_output=True, text=True, encoding='utf-8', errors='ignore').stderr
    h, m, s = re.search(r'Duration: ([\d:.]+)', o).group(1).split(':'); return int(h) * 3600 + int(m) * 60 + float(s)

for vid, f in VIDEOS.items():
    p = os.path.join(SRC, f)
    run(['-i', p, '-vf', SCALE] + ENC + [os.path.join(OUT, vid + '.mp4')])
    run(['-ss', '1.5', '-i', os.path.join(OUT, vid + '.mp4'), '-frames:v', '1', '-q:v', '3', os.path.join(OUT, vid + '.jpg')])
    print(vid, round(os.path.getsize(os.path.join(OUT, vid + '.mp4')) / 1e6, 1), 'MB')

# Greek house stills: evenly spaced full-res frames of the b-roll
st = os.path.join(ROOT, 'media', 'greek-stills'); os.makedirs(st, exist_ok=True)
p = os.path.join(SRC, 'uy.mp4'); d = dur(p)
for i in range(12):
    t = 0.8 + i * (d - 1.6) / 11
    run(['-ss', f'{t:.2f}', '-i', p, '-frames:v', '1', '-q:v', '2', os.path.join(st, f'{i + 1:02d}.jpg')])
print('stills', len(os.listdir(st)))
