"""Rebuild the hero image sequences from AI-upscaled source frames.

usage: python tools/rebuild_frames.py <folder with upscaled fNNNN.png at 24 fps>
-> media/apartment/frames/   (30 fps, 1600x900, desktop)
   media/apartment/frames-m/ (30 fps, 960x540, mobile)
   WebP q85: ~3x smaller than JPEG at SSIM ~0.99 against the master
   prints the frame counts to put into HERO.frames / framesMobile
"""
import os, sys, glob, shutil, subprocess
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
src = sys.argv[1]
root = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'media', 'apartment')

def run(args):
    subprocess.run([FF, '-v', 'error', '-y'] + args, check=True)

# upscaled 24 fps frames -> 1920 wide master, motion-interpolated to 60 fps (lossless intermediate)
master = os.path.join(root, 'walk-up-60.mkv')
run(['-framerate', '24', '-i', os.path.join(src, 'f%04d.png'),
     '-vf', 'scale=1920:1080:flags=lanczos,minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1',
     '-c:v', 'libx264', '-crf', '8', '-preset', 'medium', '-pix_fmt', 'yuv444p', master])

# both sequences at 30 fps: the page blends neighbouring frames while scrubbing, so 60 fps only doubled the download
for name, vf in (('frames', r'select=not(mod(n\,2)),scale=1600:900:flags=lanczos'),
                 ('frames-m', r'select=not(mod(n\,2)),scale=960:540:flags=lanczos')):
    out = os.path.join(root, name)
    shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
    run(['-i', master, '-vf', vf, '-vsync', '0', '-c:v', 'libwebp', '-quality', '85', '-compression_level', '6', '-preset', 'photo',
         os.path.join(out, 'f%04d.webp')])
    print(name, len(glob.glob(os.path.join(out, '*.webp'))))
os.remove(master)
