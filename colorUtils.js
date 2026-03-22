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

function colorDistance(lab1, lab2) {
    const dl = lab1[0] - lab2[0];
    const da = lab1[1] - lab2[1];
    const db = lab1[2] - lab2[2];
    return Math.sqrt(dl * dl + da * da + db * db);
}

function findClosestColor(rgb, colorSet) {
    const xyz1 = rgbToXyz(rgb[0], rgb[1], rgb[2]);
    const lab1 = xyzToLab(xyz1[0], xyz1[1], xyz1[2]);
    let closest = null;
    let minDistance = Infinity;

    for (const color of colorSet) {
        const xyz2 = rgbToXyz(color.rgb[0], color.rgb[1], color.rgb[2]);
        const lab2 = xyzToLab(xyz2[0], xyz2[1], xyz2[2]);
        const distance = colorDistance(lab1, lab2);

        if (distance < minDistance) {
            minDistance = distance;
            closest = color;
        }
    }

    return closest;
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

function getContrastTextColor(rgb) {
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
}
