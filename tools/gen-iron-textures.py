"""
澡巾织纹 tile 生成器（离线脚本，不参与打包）
=================================================
把真实澡巾照片处理成熨烫预览用的无缝光影 tile，内联进 bundle。

用法：
    python tools/gen-iron-textures.py

为什么需要这个脚本：
    1. 素材照片 → 零均值光影 tile（高通去色偏 + 四象限镜像 + 环形对齐去接缝）
    2. 16 级量化 → PNG → base64 内联
    3. **必须内联**，不能用外部 PNG —— 熨烫预览的像素级浮雕要 getImageData 读像素，
       而 file:// 协议下加载任何外部图片都会污染画布 → SecurityError

加新素材：把照片放进 SRC 字典，跑一次脚本，重新 build.js。
"""

import numpy as np
import os
import base64
import io
from PIL import Image

# 素材照片（hh 提供的真实澡巾照片）
BASE = r"C:\Users\supreme\.workbuddy\clipboard-images"
SRC = {
    'zaoJin1': os.path.join(BASE, 'clipboard-2026-10-15T07-32-02-941Z-e9f2e34f.png'),
    'zaoJin2': os.path.join(BASE, 'clipboard-2026-10-15T07-32-02-943Z-a4f2705a.png'),
    'zaoJin3': os.path.join(BASE, 'clipboard-2026-10-15T07-32-02-945Z-60b15a85.png'),
    'zaoJin4': os.path.join(BASE, 'clipboard-2026-10-15T07-32-02-949Z-16450c7a.png'),
}

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   'data', 'iron-textures')

SIZE = 256
LEVELS = 16
LSTEP = 256 // LEVELS   # 16


def box_blur(a, r):
    """积分图盒式模糊（反射边界），O(1) 像素"""
    k = r * 2 + 1
    ap = np.pad(a, r, mode='reflect')
    ii = np.cumsum(np.cumsum(ap, axis=0), axis=1)
    ii2 = np.pad(ii, ((1, 0), (1, 0)))
    H, W = a.shape
    return (ii2[k:k+H, k:k+W] - ii2[0:H, k:k+W] - ii2[k:k+H, 0:W] + ii2[0:H, 0:W]) / (k * k)


def to_seamless_light(src, size=SIZE):
    """
    素材照片 → 无缝、零均值、128 中性的光影 tile（0~255）

    步骤：
      缩放 → 四象限镜像（相邻象限翻转，接缝处天然连续）
      → 高通（减 15px 盒式模糊，去掉整体色偏和低频基底，只留织纹）
      → 环形对齐（x/y 各搜一个 shift 最小化接缝差）
      → 减均值（严格零均值，否则成品整体偏亮/偏暗）
      → 对称归一化到 1..255（128 是中性点）
    """
    g = np.asarray(src.convert('L').resize((size, size), Image.LANCZOS)).astype(np.float64)
    c = size // 2
    full = np.vstack([
        np.hstack([g[:c, :c][::-1, ::-1], g[:c, c:][::-1, :]]),
        np.hstack([g[c:, :c][:, ::-1], g[c:, c:]])
    ])
    hp = full - box_blur(full, 15)

    def align(arr, axis):
        """滚动到接缝差最小的位置"""
        best = (0, 1e18)
        for sh in range(arr.shape[axis] // 2):
            r = np.roll(arr, sh, axis=axis)
            seam = (np.abs(r[:, 0] - r[:, -1]).mean() if axis == 1
                    else np.abs(r[0, :] - r[-1, :]).mean())
            if seam < best[1]:
                best = (sh, seam)
        return np.roll(arr, best[0], axis=axis)

    out = align(align(hp, 1), 0)
    out = out - out.mean()
    amp = np.percentile(np.abs(out), 99) or 1.0
    return np.clip(out / amp, -1, 1) * 127.0 + 128.0


def quantize_16(light):
    """
    16 级量化，灰阶空间对齐中性点。

    ★ 教训（踩了两次）：不要在"级数"空间（0~15）减均值 —— 级数均值约 7.5，
      减完 clip 到 [0,15] 会整体塌到低端。必须在最终灰阶（8..248）空间里平移。
    ★ 也不要用 Floyd–Steinberg 误差扩散：它会破坏零均值，还得再拉回来。
      16 级 + 对称归一化的噪声 std 只有 4.6 灰阶（摆幅 145 的 3%），肉眼看不出。
    """
    gray = np.clip(np.round(light / LSTEP), 0, LEVELS - 1) * LSTEP + LSTEP // 2
    shift = 128.0 - gray.mean()
    gray = np.clip(gray + round(shift / LSTEP) * LSTEP, 8, 248)
    return gray.astype(np.uint8)


def main():
    os.makedirs(OUT, exist_ok=True)
    print("=" * 74)
    print("素材 → 无缝零均值光影 → 16 级量化 → PNG → base64")
    print("=" * 74)

    lines = [
        "/* 澡巾织纹 tile —— 内联为 dataURL（由 tools/gen-iron-textures.py 生成）",
        " *",
        " * 为什么不用外部 PNG：熨烫预览的像素级浮雕必须 getImageData 读像素，",
        " * 而 file:// 协议下加载任何外部图片都会把画布标记为 tainted → SecurityError。",
        " * dataURL 是纯字符串、不带来源信息，任何协议下都同源。",
        " */",
        "window.IRON_ZAOJIN_TILES = {"
    ]

    total = 0.0
    for name, path in SRC.items():
        if not os.path.exists(path):
            print(f"  跳过 {name}: 素材不存在 {path}")
            continue
        light = to_seamless_light(Image.open(path))
        png_arr = quantize_16(light)

        err = np.abs(light - png_arr.astype(np.float64))
        ilr = max(np.abs(np.diff(png_arr.astype(int), axis=1)).mean(), 1)
        iud = max(np.abs(np.diff(png_arr.astype(int), axis=0)).mean(), 1)
        seam_lr = np.abs(png_arr[:, 0].astype(int) - png_arr[:, -1]).mean() / ilr
        seam_ud = np.abs(png_arr[0, :].astype(int) - png_arr[-1, :]).mean() / iud

        buf = io.BytesIO()
        Image.fromarray(png_arr, 'L').save(buf, 'PNG', optimize=True)
        b64 = base64.b64encode(buf.getvalue()).decode()
        kb = len(b64) / 1024
        total += kb

        print(f"{name}: 灰阶 {png_arr.min():3d}~{png_arr.max():3d} 均值 {png_arr.mean():6.1f}  "
              f"误差 std={err.std():.1f}  接缝 {seam_lr:.2f}/{seam_ud:.2f}  {kb:.1f}KB")
        lines.append('  "%s": "data:image/png;base64,%s",' % (name, b64))

    lines.append("};")
    out_path = os.path.join(OUT, 'tiles.js')
    with open(out_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(lines))

    print()
    print(f"总计 {total:.1f}KB → {out_path} ({os.path.getsize(out_path)/1024:.0f}KB)")
    print("接下来跑 node build.js")


if __name__ == '__main__':
    main()
