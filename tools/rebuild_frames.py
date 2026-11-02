"""Rebuild the hero image sequences from AI-upscaled source frames.

usage: python tools/rebuild_frames.py <folder with upscaled fNNNN.png at 24 fps>
-> media/apartment/frames/   desktop: 60 fps, 1600x900, WebP q78 (~33 KB a frame)
   media/apartment/frames-m/ mobile:  30 fps, 960x540,  WebP q74
   WebP, not AVIF: AVIF is smaller but slower to decode, and scrubbing decodes a new frame every repaint.
"""
import os, sys, glob, shutil, subprocess
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'media', 'apartment')

def run(args):
    subprocess.run([FF, '-v', 'error', '-y'] + args, check=True)

def main(src):
    # upscaled 24 fps frames -> 1920 wide master, motion-interpolated to 60 fps (near-lossless intermediate)
    master = os.path.join(ROOT, 'walk-up-60.mkv')
    run(['-framerate', '24', '-i', os.path.join(src, 'f%04d.png'),
         '-vf', 'scale=1920:1080:flags=lanczos,minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1',
         '-c:v', 'libx264', '-crf', '8', '-preset', 'medium', '-pix_fmt', 'yuv444p', master])
    for name, vf, q in (('frames', 'scale=1600:900:flags=lanczos', 78),
                        ('frames-m', r'select=not(mod(n\,2)),scale=960:540:flags=lanczos', 74)):
        out = os.path.join(ROOT, name)
        shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
        run(['-i', master, '-vf', vf, '-vsync', '0', '-c:v', 'libwebp', '-quality', str(q), '-compression_level', '6', '-preset', 'photo',
             os.path.join(out, 'f%04d.webp')])
        files = glob.glob(os.path.join(out, '*.webp'))
        print(name, len(files), round(sum(map(os.path.getsize, files)) / 1e6, 1), 'MB')
    os.remove(master)

if __name__ == '__main__':
    main(sys.argv[1])
