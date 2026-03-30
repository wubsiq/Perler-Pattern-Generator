function rgbToXyz(r, g, b) {
    r = r / 255;
    g = g / 255;
    b = b / 255;
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    r *= 100;
    g *= 100;
    b *= 100;

    const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    return [x, y, z];
}

function xyzToLab(x, y, z) {
    x = x / 95.047;
    y = y / 100.000;
    z = z / 108.883;

    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16/116);
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16/116);
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16/116);

    const l = (116 * y) - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);

    return [l, a, b];
}

function rgbToLab(r, g, b) {
    const xyz = rgbToXyz(r, g, b);
    return xyzToLab(xyz[0], xyz[1], xyz[2]);
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return [h * 360, s * 100, l * 100];
}

function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h, s = max === 0 ? 0 : d / max, v = max;

    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return [h * 360, s * 100, v * 100];
}

function deltaE76(lab1, lab2) {
    const dl = lab1[0] - lab2[0];
    const da = lab1[1] - lab2[1];
    const db = lab1[2] - lab2[2];
    return Math.sqrt(dl * dl + da * da + db * db);
}

function deltaE94(lab1, lab2) {
    const dl = lab1[0] - lab2[0];
    const da = lab1[1] - lab2[1];
    const db = lab1[2] - lab2[2];
    
    const c1 = Math.sqrt(lab1[1] * lab1[1] + lab1[2] * lab1[2]);
    const c2 = Math.sqrt(lab2[1] * lab2[1] + lab2[2] * lab2[2]);
    const dc = c1 - c2;
    
    const dh = Math.sqrt(da * da + db * db - dc * dc);
    
    const kL = 1;
    const kC = 1;
    const kH = 1;
    const K1 = 0.045;
    const K2 = 0.015;
    
    const SL = 1;
    const SC = 1 + K1 * c1;
    const SH = 1 + K2 * c1;
    
    const term1 = dl / (kL * SL);
    const term2 = dc / (kC * SC);
    const term3 = dh / (kH * SH);
    
    return Math.sqrt(term1 * term1 + term2 * term2 + term3 * term3);
}

function deltaE2000(lab1, lab2) {
    const L1 = lab1[0], a1 = lab1[1], b1 = lab1[2];
    const L2 = lab2[0], a2 = lab2[1], b2 = lab2[2];
    
    const kL = 1, kC = 1, kH = 1;
    
    const C1 = Math.sqrt(a1 * a1 + b1 * b1);
    const C2 = Math.sqrt(a2 * a2 + b2 * b2);
    const Cavg = (C1 + C2) / 2;
    
    const G = 0.5 * (1 - Math.sqrt(Math.pow(Cavg, 7) / (Math.pow(Cavg, 7) + Math.pow(25, 7))));
    
    const a1p = a1 * (1 + G);
    const a2p = a2 * (1 + G);
    
    const C1p = Math.sqrt(a1p * a1p + b1 * b1);
    const C2p = Math.sqrt(a2p * a2p + b2 * b2);
    
    let h1p = Math.atan2(b1, a1p) * 180 / Math.PI;
    if (h1p < 0) h1p += 360;
    
    let h2p = Math.atan2(b2, a2p) * 180 / Math.PI;
    if (h2p < 0) h2p += 360;
    
    const dLp = L2 - L1;
    const dCp = C2p - C1p;
    
    let dhp;
    if (C1p * C2p === 0) {
        dhp = 0;
    } else if (Math.abs(h2p - h1p) <= 180) {
        dhp = h2p - h1p;
    } else if (h2p - h1p > 180) {
        dhp = h2p - h1p - 360;
    } else {
        dhp = h2p - h1p + 360;
    }
    
    const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp * Math.PI / 360);
    
    const Lpavg = (L1 + L2) / 2;
    const Cpavg = (C1p + C2p) / 2;
    
    let Hpavg;
    if (C1p * C2p === 0) {
        Hpavg = h1p + h2p;
    } else if (Math.abs(h1p - h2p) <= 180) {
        Hpavg = (h1p + h2p) / 2;
    } else if (h1p + h2p < 360) {
        Hpavg = (h1p + h2p + 360) / 2;
    } else {
        Hpavg = (h1p + h2p - 360) / 2;
    }
    
    const T = 1 - 0.17 * Math.cos((Hpavg - 30) * Math.PI / 180)
              + 0.24 * Math.cos(2 * Hpavg * Math.PI / 180)
              + 0.32 * Math.cos((3 * Hpavg + 6) * Math.PI / 180)
              - 0.20 * Math.cos((4 * Hpavg - 63) * Math.PI / 180);
    
    const SL = 1 + (0.015 * Math.pow(Lpavg - 50, 2)) / Math.sqrt(20 + Math.pow(Lpavg - 50, 2));
    const SC = 1 + 0.045 * Cpavg;
    const SH = 1 + 0.015 * Cpavg * T;
    
    const RT = -2 * Math.sqrt(Math.pow(Cpavg, 7) / (Math.pow(Cpavg, 7) + Math.pow(25, 7)))
               * Math.sin(60 * Math.exp(-Math.pow((Hpavg - 275) / 25, 2)) * Math.PI / 180);
    
    const term1 = dLp / (kL * SL);
    const term2 = dCp / (kC * SC);
    const term3 = dHp / (kH * SH);
    
    return Math.sqrt(term1 * term1 + term2 * term2 + term3 * term3 + RT * term2 * term3);
}

function weightedRgbDistance(rgb1, rgb2) {
    const rmean = (rgb1[0] + rgb2[0]) / 2;
    const r = rgb1[0] - rgb2[0];
    const g = rgb1[1] - rgb2[1];
    const b = rgb1[2] - rgb2[2];
    
    return Math.sqrt(
        (2 + rmean / 256) * r * r +
        4 * g * g +
        (2 + (255 - rmean) / 256) * b * b
    );
}

function hslDistance(hsl1, hsl2) {
    let hDiff = Math.abs(hsl1[0] - hsl2[0]);
    if (hDiff > 180) hDiff = 360 - hDiff;
    
    const sDiff = hsl1[1] - hsl2[1];
    const lDiff = hsl1[2] - hsl2[2];
    
    return Math.sqrt(
        hDiff * hDiff * 0.8 +
        sDiff * sDiff * 0.1 +
        lDiff * lDiff * 0.5
    );
}

function hsvDistance(hsv1, hsv2) {
    let hDiff = Math.abs(hsv1[0] - hsv2[0]);
    if (hDiff > 180) hDiff = 360 - hDiff;
    
    const sDiff = hsv1[1] - hsv2[1];
    const vDiff = hsv1[2] - hsv2[2];
    
    return Math.sqrt(
        hDiff * hDiff * 0.8 +
        sDiff * sDiff * 0.1 +
        vDiff * vDiff * 0.5
    );
}

const colorMappingMethods = {
    'cie2000': {
        name: 'CIEDE2000',
        nameZh: 'CIEDE2000 (最精确)',
        description: '最精确的颜色差异算法，适合专业色彩匹配',
        findClosest: function(rgb, colorSet) {
            const lab1 = rgbToLab(rgb[0], rgb[1], rgb[2]);
            let closest = null;
            let minDistance = Infinity;
            
            for (const color of colorSet) {
                const lab2 = rgbToLab(color.rgb[0], color.rgb[1], color.rgb[2]);
                const distance = deltaE2000(lab1, lab2);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = color;
                }
            }
            
            return closest;
        }
    },
    'cie94': {
        name: 'CIE94',
        nameZh: 'CIE94 (精确)',
        description: '改进的Lab颜色差异算法，精确度较高',
        findClosest: function(rgb, colorSet) {
            const lab1 = rgbToLab(rgb[0], rgb[1], rgb[2]);
            let closest = null;
            let minDistance = Infinity;
            
            for (const color of colorSet) {
                const lab2 = rgbToLab(color.rgb[0], color.rgb[1], color.rgb[2]);
                const distance = deltaE94(lab1, lab2);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = color;
                }
            }
            
            return closest;
        }
    },
    'cie76': {
        name: 'CIE76',
        nameZh: 'CIE76 (Lab)',
        description: '原始的Lab颜色差异算法，速度快',
        findClosest: function(rgb, colorSet) {
            const lab1 = rgbToLab(rgb[0], rgb[1], rgb[2]);
            let closest = null;
            let minDistance = Infinity;
            
            for (const color of colorSet) {
                const lab2 = rgbToLab(color.rgb[0], color.rgb[1], color.rgb[2]);
                const distance = deltaE76(lab1, lab2);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = color;
                }
            }
            
            return closest;
        }
    },
    'weighted-rgb': {
        name: 'Weighted RGB',
        nameZh: '加权RGB',
        description: '考虑人眼对不同颜色敏感度的RGB算法',
        findClosest: function(rgb, colorSet) {
            let closest = null;
            let minDistance = Infinity;
            
            for (const color of colorSet) {
                const distance = weightedRgbDistance(rgb, color.rgb);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = color;
                }
            }
            
            return closest;
        }
    },
    'hsl': {
        name: 'HSL',
        nameZh: 'HSL色彩空间',
        description: '基于色相、饱和度、亮度的颜色匹配',
        findClosest: function(rgb, colorSet) {
            const hsl1 = rgbToHsl(rgb[0], rgb[1], rgb[2]);
            let closest = null;
            let minDistance = Infinity;
            
            for (const color of colorSet) {
                const hsl2 = rgbToHsl(color.rgb[0], color.rgb[1], color.rgb[2]);
                const distance = hslDistance(hsl1, hsl2);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = color;
                }
            }
            
            return closest;
        }
    },
    'hsv': {
        name: 'HSV',
        nameZh: 'HSV色彩空间',
        description: '基于色相、饱和度、明度的颜色匹配',
        findClosest: function(rgb, colorSet) {
            const hsv1 = rgbToHsv(rgb[0], rgb[1], rgb[2]);
            let closest = null;
            let minDistance = Infinity;
            
            for (const color of colorSet) {
                const hsv2 = rgbToHsv(color.rgb[0], color.rgb[1], color.rgb[2]);
                const distance = hsvDistance(hsv1, hsv2);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = color;
                }
            }
            
            return closest;
        }
    }
};

function findClosestColor(rgb, colorSet, method = 'cie2000') {
    const mappingMethod = colorMappingMethods[method] || colorMappingMethods['cie2000'];
    return mappingMethod.findClosest(rgb, colorSet);
}

function calculateColorDistance(rgb1, rgb2, method = 'cie2000') {
    switch (method) {
        case 'cie2000':
            const lab1 = rgbToLab(rgb1[0], rgb1[1], rgb1[2]);
            const lab2 = rgbToLab(rgb2[0], rgb2[1], rgb2[2]);
            return deltaE2000(lab1, lab2);
        case 'cie94':
            const lab94_1 = rgbToLab(rgb1[0], rgb1[1], rgb1[2]);
            const lab94_2 = rgbToLab(rgb2[0], rgb2[1], rgb2[2]);
            return deltaE94(lab94_1, lab94_2);
        case 'cie76':
            const lab76_1 = rgbToLab(rgb1[0], rgb1[1], rgb1[2]);
            const lab76_2 = rgbToLab(rgb2[0], rgb2[1], rgb2[2]);
            return deltaE76(lab76_1, lab76_2);
        case 'weighted-rgb':
            return weightedRgbDistance(rgb1, rgb2);
        case 'hsl':
            const hsl1 = rgbToHsl(rgb1[0], rgb1[1], rgb1[2]);
            const hsl2 = rgbToHsl(rgb2[0], rgb2[1], rgb2[2]);
            return hslDistance(hsl1, hsl2);
        case 'hsv':
            const hsv1 = rgbToHsv(rgb1[0], rgb1[1], rgb1[2]);
            const hsv2 = rgbToHsv(rgb2[0], rgb2[1], rgb2[2]);
            return hsvDistance(hsv1, hsv2);
        default:
            return weightedRgbDistance(rgb1, rgb2);
    }
}

function pixelate(imageData, blockSize) {
    const width = imageData.width;
    const height = imageData.height;
    const newData = new ImageData(width, height);

    for (let y = 0; y < height; y += blockSize) {
        for (let x = 0; x < width; x += blockSize) {
            let r = 0, g = 0, b = 0, a = 0, count = 0;

            for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
                for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
                    const index = ((y + dy) * width + (x + dx)) * 4;
                    r += imageData.data[index];
                    g += imageData.data[index + 1];
                    b += imageData.data[index + 2];
                    a += imageData.data[index + 3];
                    count++;
                }
            }

            r = Math.round(r / count);
            g = Math.round(g / count);
            b = Math.round(b / count);
            a = Math.round(a / count);

            for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
                for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
                    const index = ((y + dy) * width + (x + dx)) * 4;
                    newData.data[index] = r;
                    newData.data[index + 1] = g;
                    newData.data[index + 2] = b;
                    newData.data[index + 3] = a;
                }
            }
        }
    }

    return newData;
}

function pixelArtPixelate(imageData, blockSize) {
    const width = imageData.width;
    const height = imageData.height;
    
    const smallWidth = Math.ceil(width / blockSize);
    const smallHeight = Math.ceil(height / blockSize);
    
    const smallData = new ImageData(smallWidth, smallHeight);
    
    for (let y = 0; y < smallHeight; y++) {
        for (let x = 0; x < smallWidth; x++) {
            let r = 0, g = 0, b = 0, a = 0, count = 0;
            
            for (let dy = 0; dy < blockSize; dy++) {
                for (let dx = 0; dx < blockSize; dx++) {
                    const srcX = x * blockSize + dx;
                    const srcY = y * blockSize + dy;
                    if (srcX < width && srcY < height) {
                        const index = (srcY * width + srcX) * 4;
                        r += imageData.data[index];
                        g += imageData.data[index + 1];
                        b += imageData.data[index + 2];
                        a += imageData.data[index + 3];
                        count++;
                    }
                }
            }
            
            const dstIndex = (y * smallWidth + x) * 4;
            smallData.data[dstIndex] = Math.round(r / count);
            smallData.data[dstIndex + 1] = Math.round(g / count);
            smallData.data[dstIndex + 2] = Math.round(b / count);
            smallData.data[dstIndex + 3] = Math.round(a / count);
        }
    }
    
    const segmentedData = regionSegmentation(smallData);
    
    const resultData = new ImageData(width, height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const smallX = Math.floor(x / blockSize);
            const smallY = Math.floor(y / blockSize);
            const srcIndex = (smallY * smallWidth + smallX) * 4;
            const dstIndex = (y * width + x) * 4;
            resultData.data[dstIndex] = segmentedData.data[srcIndex];
            resultData.data[dstIndex + 1] = segmentedData.data[srcIndex + 1];
            resultData.data[dstIndex + 2] = segmentedData.data[srcIndex + 2];
            resultData.data[dstIndex + 3] = segmentedData.data[srcIndex + 3];
        }
    }
    
    return resultData;
}

function regionSegmentation(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const result = new ImageData(width, height);
    
    const visited = new Uint8Array(width * height);
    const labels = new Int32Array(width * height);
    let labelCount = 0;
    const regionColors = [];
    
    const colorThreshold = 60;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            if (!visited[idx]) {
                const stack = [{x, y}];
                const regionPixels = [];
                const seedIndex = idx * 4;
                const seedR = imageData.data[seedIndex];
                const seedG = imageData.data[seedIndex + 1];
                const seedB = imageData.data[seedIndex + 2];
                
                while (stack.length > 0) {
                    const {x: cx, y: cy} = stack.pop();
                    const cidx = cy * width + cx;
                    
                    if (cx < 0 || cx >= width || cy < 0 || cy >= height || visited[cidx]) {
                        continue;
                    }
                    
                    const cDataIndex = cidx * 4;
                    const cr = imageData.data[cDataIndex];
                    const cg = imageData.data[cDataIndex + 1];
                    const cb = imageData.data[cDataIndex + 2];
                    
                    const dist = Math.sqrt(
                        Math.pow(cr - seedR, 2) +
                        Math.pow(cg - seedG, 2) +
                        Math.pow(cb - seedB, 2)
                    );
                    
                    if (dist > colorThreshold) {
                        continue;
                    }
                    
                    visited[cidx] = 1;
                    labels[cidx] = labelCount;
                    regionPixels.push({r: cr, g: cg, b: cb});
                    
                    stack.push({x: cx + 1, y: cy});
                    stack.push({x: cx - 1, y: cy});
                    stack.push({x: cx, y: cy + 1});
                    stack.push({x: cx, y: cy - 1});
                }
                
                if (regionPixels.length > 0) {
                    let sumR = 0, sumG = 0, sumB = 0;
                    for (const pixel of regionPixels) {
                        sumR += pixel.r;
                        sumG += pixel.g;
                        sumB += pixel.b;
                    }
                    const count = regionPixels.length;
                    regionColors.push({
                        r: Math.round(sumR / count),
                        g: Math.round(sumG / count),
                        b: Math.round(sumB / count)
                    });
                    labelCount++;
                }
            }
        }
    }
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const label = labels[idx];
            const dstIdx = idx * 4;
            if (label >= 0 && label < regionColors.length) {
                const color = regionColors[label];
                result.data[dstIdx] = color.r;
                result.data[dstIdx + 1] = color.g;
                result.data[dstIdx + 2] = color.b;
                result.data[dstIdx + 3] = 255;
            }
        }
    }
    
    return result;
}

function adjustContrast(imageData, factor) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, ((data[i] / 255 - 0.5) * factor + 0.5) * 255));
        data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] / 255 - 0.5) * factor + 0.5) * 255));
        data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] / 255 - 0.5) * factor + 0.5) * 255));
    }
    
    return imageData;
}

function sharpenImage(imageData, strength) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const result = new Uint8ClampedArray(data);
    
    const kernel = [0, -strength, 0, -strength, 1 + 4 * strength, -strength, 0, -strength, 0];
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let r = 0, g = 0, b = 0;
            let ki = 0;
            
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * width + (x + kx)) * 4;
                    r += data[idx] * kernel[ki];
                    g += data[idx + 1] * kernel[ki];
                    b += data[idx + 2] * kernel[ki];
                    ki++;
                }
            }
            
            const idx = (y * width + x) * 4;
            result[idx] = Math.min(255, Math.max(0, r));
            result[idx + 1] = Math.min(255, Math.max(0, g));
            result[idx + 2] = Math.min(255, Math.max(0, b));
        }
    }
    
    for (let i = 0; i < data.length; i++) {
        data[i] = result[i];
    }
    
    return imageData;
}

function quantizeColors(imageData, colorCount, excludedColors = new Set()) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const colors = [];
    const colorMap = new Map();
    
    for (let i = 0; i < data.length; i += 4) {
        const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
        if (!colorMap.has(key)) {
            colorMap.set(key, { r: data[i], g: data[i + 1], b: data[i + 2], count: 0 });
            colors.push(colorMap.get(key));
        }
        colorMap.get(key).count++;
    }
    
    colors.sort((a, b) => b.count - a.count);
    
    let targetColors = colors.filter(color => !excludedColors.has(`${color.r},${color.g},${color.b}`));
    
    if (targetColors.length < colorCount) {
        targetColors = colors.slice(0, colorCount);
    } else {
        targetColors = targetColors.slice(0, colorCount);
    }
    
    for (let i = 0; i < data.length; i += 4) {
        let minDist = Infinity;
        let closestColor = targetColors[0];
        
        for (const color of targetColors) {
            const dist = weightedRgbDistance(
                [data[i], data[i + 1], data[i + 2]],
                [color.r, color.g, color.b]
            );
            if (dist < minDist) {
                minDist = dist;
                closestColor = color;
            }
        }
        
        data[i] = closestColor.r;
        data[i + 1] = closestColor.g;
        data[i + 2] = closestColor.b;
    }
    
    return imageData;
}

function getContrastTextColor(rgb) {
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
}
