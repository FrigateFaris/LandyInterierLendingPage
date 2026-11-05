"""Rebuild the hero image sequences from AI-upscaled source frames.

usage: python tools/rebuild_frames.py <folder with upscaled fNNNN.png at 24 fps> [frames|frames-m ...]
-> media/apartment/frames/   desktop: 60 fps, 1600x900, WebP q78 (~33 KB a frame)
   media/apartment/frames-m/ phones:  30 fps, 648x1080 crop at full height, WebP q66
     (a portrait screen only shows a third of the wide frame, so phones get that part sharp instead of a whole small frame;
      the crop pans along PAN so the object each room title names stays on screen)
   WebP, not AVIF: AVIF is smaller but slower to decode, and scrubbing decodes a new frame every repaint.
Afterwards run tools/pack_frames.py.
"""
import os, sys, glob, shutil, subprocess, tempfile
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'media', 'apartment')
SETS = {
    'frames': ('scale=1600:900:flags=lanczos', 78),
    'frames-m': (None, 66),
}
# phone crop centre as a share of the frame width, [video time, x]; eased between points
PAN = [(0, .5), (0.9, .5), (1.4, .32), (2.0, .32), (2.45, .72), (2.9, .72), (3.2, .7), (3.5, .66), (3.9, .3), (4.2, .28),
       (4.7, .78), (5.1, .83), (5.4, .6), (5.7, .5), (8.3, .5), (8.9, .62), (9.6, .62)]
MW, MH, CW = 1920, 1080, 648
# the walk ends where the stairs begin (6.59 s): frames kept per set (desktop 60 fps, phone every 2nd)
KEEP = {'frames': 395, 'frames-m': 198}

def pan_x(t):
    for (a, xa), (b, xb) in zip(PAN, PAN[1:]):
        if t <= b:
            k = max(0.0, (t - a) / (b - a)); k = k * k * (3 - 2 * k)
            x = xa + (xb - xa) * k; break
    else: x = PAN[-1][1]
    return min(MW - CW, max(0, round(x * MW - CW / 2)))

def cut_phone(master, out, q):
    # decode every 2nd master frame, crop each at its pan position, encode WebP
    dec = subprocess.Popen([FF, '-v', 'error', '-i', master, '-vf', r'select=not(mod(n\,2))', '-vsync', '0',
                            '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    enc = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{CW}x{MH}', '-r', '30', '-i', '-',
                            '-c:v', 'libwebp', '-quality', str(q), '-compression_level', '6', '-preset', 'photo',
                            os.path.join(out, 'f%04d.webp')], stdin=subprocess.PIPE)
    size, i = MW * MH * 3, 0
    while True:
        buf = dec.stdout.read(size)
        if len(buf) < size or i >= KEEP['frames-m']: break
        x = pan_x(i * 2 / 60) * 3
        enc.stdin.write(b''.join(buf[r * MW * 3 + x: r * MW * 3 + x + CW * 3] for r in range(MH)))
        i += 1
    dec.kill(); enc.stdin.close(); enc.wait(); dec.wait()

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
        if vf is None: cut_phone(master, out, q)
        else: run(['-i', master, '-vf', vf, '-vsync', '0', '-frames:v', str(KEEP[name]), '-c:v', 'libwebp', '-quality', str(q), '-compression_level', '6', '-preset', 'photo',
                 os.path.join(out, 'f%04d.webp')])
        files = glob.glob(os.path.join(out, '*.webp'))
        print(name, len(files), round(sum(map(os.path.getsize, files)) / 1e6, 1), 'MB')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2:] or list(SETS))
