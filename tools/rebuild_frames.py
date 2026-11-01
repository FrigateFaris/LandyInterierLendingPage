"""Rebuild the hero image sequences from AI-upscaled source frames.

usage: python tools/rebuild_frames.py <folder with upscaled fNNNN.png at 24 fps>
-> media/apartment/frames-avif/   desktop: 60 fps, 1600x900, AVIF q42 (~19 KB a frame)
   media/apartment/frames-m-avif/ mobile:  30 fps, 960x540,  AVIF q42
   media/apartment/frames/        fallback for browsers without AVIF: 30 fps, 1600x900, WebP q85
   media/apartment/frames-m/      fallback mobile: 30 fps, 960x540, WebP q85
   prints the frame counts to put into HERO.frames / framesMobile / fallback
"""
import os, sys, glob, shutil, subprocess, tempfile
from concurrent.futures import ProcessPoolExecutor
import imageio_ffmpeg
from PIL import Image

FF = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'media', 'apartment')
AVIF_Q = 42

def run(args):
    subprocess.run([FF, '-v', 'error', '-y'] + args, check=True)

def to_avif(job):
    src, dst = job
    Image.open(src).convert('RGB').save(dst, 'AVIF', quality=AVIF_Q)

def main(src):
    # upscaled 24 fps frames -> 1920 wide master, motion-interpolated to 60 fps (near-lossless intermediate)
    master = os.path.join(ROOT, 'walk-up-60.mkv')
    run(['-framerate', '24', '-i', os.path.join(src, 'f%04d.png'),
         '-vf', 'scale=1920:1080:flags=lanczos,minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1',
         '-c:v', 'libx264', '-crf', '8', '-preset', 'medium', '-pix_fmt', 'yuv444p', master])
    every2 = r'select=not(mod(n\,2)),'
    sets = [  # name, filter, format
        ('frames-avif', 'scale=1600:900:flags=lanczos', 'avif'),
        ('frames-m-avif', every2 + 'scale=960:540:flags=lanczos', 'avif'),
        ('frames', every2 + 'scale=1600:900:flags=lanczos', 'webp'),
        ('frames-m', every2 + 'scale=960:540:flags=lanczos', 'webp'),
    ]
    for name, vf, fmt in sets:
        out = os.path.join(ROOT, name)
        shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
        if fmt == 'webp':
            run(['-i', master, '-vf', vf, '-vsync', '0', '-c:v', 'libwebp', '-quality', '85', '-compression_level', '6', '-preset', 'photo',
                 os.path.join(out, 'f%04d.webp')])
        else:
            with tempfile.TemporaryDirectory() as tmp:
                run(['-i', master, '-vf', vf, '-vsync', '0', os.path.join(tmp, 'f%04d.png')])
                jobs = [(p, os.path.join(out, os.path.basename(p)[:-4] + '.avif')) for p in sorted(glob.glob(os.path.join(tmp, '*.png')))]
                with ProcessPoolExecutor() as ex: list(ex.map(to_avif, jobs, chunksize=8))
        files = glob.glob(os.path.join(out, '*.' + fmt))
        print(name, len(files), round(sum(map(os.path.getsize, files)) / 1e6, 1), 'MB')
    os.remove(master)

if __name__ == '__main__':
    main(sys.argv[1])
