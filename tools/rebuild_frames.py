"""Rebuild the hero image sequences from AI-upscaled source frames.

usage: python tools/rebuild_frames.py <folder with upscaled fNNNN.png at 24 fps> [frames|frames-m ...]
-> media/apartment/frames/   desktop: 60 fps, 1600x900, WebP q78 (~33 KB a frame)
   media/apartment/frames-m/ phones:  30 fps, 648x1080 centre crop at full height, WebP q66
     (a portrait screen only shows the middle of the wide frame, so phones get that part sharp instead of a whole small frame)
   WebP, not AVIF: AVIF is smaller but slower to decode, and scrubbing decodes a new frame every repaint.
Afterwards run tools/pack_frames.py.
"""
import os, sys, glob, shutil, subprocess, tempfile
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'media', 'apartment')
SETS = {
    'frames': ('scale=1600:900:flags=lanczos', 78),
    'frames-m': (r'select=not(mod(n\,2)),crop=648:1080:(in_w-648)/2:0', 66),
}

def run(args):
    subprocess.run([FF, '-v', 'error', '-y'] + args, check=True)

def main(src, names):
    # upscaled 24 fps frames -> 1920 wide master, motion-interpolated to 60 fps (near-lossless intermediate)
    # the master is kept in the temp folder, so re-cutting one set does not redo the slow interpolation
    master = os.path.join(tempfile.gettempdir(), 'landy-walk-up-60.mkv')
    if not os.path.exists(master): run(['-framerate', '24', '-i', os.path.join(src, 'f%04d.png'),
         '-vf', 'scale=1920:1080:flags=lanczos,minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1',
         '-c:v', 'libx264', '-crf', '8', '-preset', 'medium', '-pix_fmt', 'yuv444p', master])
    for name in names:
        vf, q = SETS[name]
        out = os.path.join(ROOT, name)
        shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
        run(['-i', master, '-vf', vf, '-vsync', '0', '-c:v', 'libwebp', '-quality', str(q), '-compression_level', '6', '-preset', 'photo',
             os.path.join(out, 'f%04d.webp')])
        files = glob.glob(os.path.join(out, '*.webp'))
        print(name, len(files), round(sum(map(os.path.getsize, files)) / 1e6, 1), 'MB')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2:] or list(SETS))
