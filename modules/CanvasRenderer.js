/**
 * CanvasRenderer - 画布渲染模块
 * 负责各种画布的渲染：原始图片、像素化图片、拼豆图表等
 */
class CanvasRenderer {
    constructor() {
        // 显示配置
        this.maxDisplayHeight = 400;
    }

    /**
     * 渲染原始图片
     * @param {HTMLCanvasElement} canvas - 画布元素
     * @param {Image} image - 图片
     * @param {Object} options - 选项
     * @returns {ImageData} 图像数据
     */
    renderOriginalImage(canvas, image, options = {}) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const width = image.width;
        const height = image.height;

        // 设置画布的实际像素尺寸
        canvas.width = width;
        canvas.height = height;

        // 绘制图片
        ctx.drawImage(image, 0, 0);

        // 获取图像数据
        const imageData = ctx.getImageData(0, 0, width, height);

        // 计算显示尺寸
        const { displayWidth, displayHeight } = this.calculateDisplaySize(width, height, options.maxHeight || this.maxDisplayHeight);

        // 设置显示尺寸
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';

        return imageData;
    }

    /**
     * 计算显示尺寸
     * @param {number} width - 原始宽度
     * @param {number} height - 原始高度
     * @param {number} maxHeight - 最大高度
     * @returns {Object} 显示尺寸
     */
    calculateDisplaySize(width, height, maxHeight) {
        if (height > maxHeight) {
            const scale = maxHeight / height;
            return {
                displayWidth: width * scale,
                displayHeight: maxHeight
            };
        }
        return {
            displayWidth: width,
            displayHeight: height
        };
    }

    /**
     * 渲染拼豆图表
     * @param {HTMLCanvasElement} canvas - 画布元素
     * @param {Array} perlerColors - 拼豆颜色矩阵
     * @param {number} perlerWidth - 宽度
     * @param {number} perlerHeight - 高度
     * @param {Object} options - 选项
     * @param {Function} onProgress - 进度回调
     */
    renderPerlerChart(canvas, perlerColors, perlerWidth, perlerHeight, options = {}, onProgress = null) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const cellSize = options.cellSize || 24;
        const chartStyle = options.chartStyle || 'color';
        const beadShape = options.beadShape || 'circle';
        const showGrid = options.showGrid !== false;
        const showCoords = options.showCoords !== false;
        const coordColor = options.coordColor || '#000000';
        const gridLineWidth = options.gridLineWidth || 1;
        const showLargeGrid = options.showLargeGrid || false;
        const largeGridSize = options.largeGridSize || 10;
        const largeGridColor = options.largeGridColor || '#8B4513';
        const largeGridLineWidth = options.largeGridLineWidth || 2;

        const coordSize = showCoords ? cellSize : 0;
        const footerSize = 30;

        // 计算画布尺寸
        const canvasWidth = coordSize * 2 + perlerWidth * cellSize;
        const canvasHeight = coordSize * 2 + perlerHeight * cellSize + footerSize;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // 白色背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // 绘制坐标
        if (showCoords) {
            this.drawCoordinates(ctx, perlerWidth, perlerHeight, cellSize, coordSize, coordColor);
        }

        // 绘制网格
        if (showGrid && gridLineWidth > 0) {
            this.drawGrid(ctx, perlerWidth, perlerHeight, cellSize, coordSize, coordColor, gridLineWidth);
        }

        // 绘制大网格
        if (showLargeGrid && largeGridSize > 0) {
            this.drawLargeGrid(ctx, perlerWidth, perlerHeight, cellSize, coordSize, largeGridSize, largeGridColor, largeGridLineWidth);
        }

        // 渲染珠子（分块渲染，避免卡顿）
        const blockSize = 10;
        const totalBlocksX = Math.ceil(perlerWidth / blockSize);
        const totalBlocksY = Math.ceil(perlerHeight / blockSize);
        let currentBlockX = 0;
        let currentBlockY = 0;

        const renderBlock = () => {
            const startX = currentBlockX * blockSize;
            const startY = currentBlockY * blockSize;
            const endX = Math.min(startX + blockSize, perlerWidth);
            const endY = Math.min(startY + blockSize, perlerHeight);

            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    const color = perlerColors[y][x];
                    const px = coordSize + x * cellSize;
                    const py = coordSize + y * cellSize;

                    this.drawBead(ctx, color, px, py, cellSize, chartStyle, beadShape);
                }
            }

            // 更新进度
            if (onProgress) {
                const progress = ((currentBlockY * totalBlocksX + currentBlockX + 1) / (totalBlocksX * totalBlocksY)) * 100;
                onProgress(progress);
            }

            currentBlockX++;
            if (currentBlockX >= totalBlocksX) {
                currentBlockX = 0;
                currentBlockY++;
            }

            if (currentBlockY < totalBlocksY) {
                requestAnimationFrame(renderBlock);
            }
        };

        // 开始渲染
        if (totalBlocksX * totalBlocksY > 1) {
            requestAnimationFrame(renderBlock);
        } else {
            // 小图直接渲染
            for (let y = 0; y < perlerHeight; y++) {
                for (let x = 0; x < perlerWidth; x++) {
                    const color = perlerColors[y][x];
                    const px = coordSize + x * cellSize;
                    const py = coordSize + y * cellSize;
                    this.drawBead(ctx, color, px, py, cellSize, chartStyle, beadShape);
                }
            }
            if (onProgress) onProgress(100);
        }
    }

    /**
     * 绘制单个珠子
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {Object} color - 颜色对象
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} cellSize - 单元格大小
     * @param {string} chartStyle - 图表样式
     * @param {string} beadShape - 珠子形状
     */
    drawBead(ctx, color, x, y, cellSize, chartStyle, beadShape) {
        // 透明色
        if (!color || color.isTransparent) {
            ctx.fillStyle = '#ffffff';
            if (beadShape === 'circle' || beadShape === 'ring') {
                ctx.beginPath();
                ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
            }
            return;
        }

        // 计算文字大小
        const nameLen = color.name.length;
        let fontSizeBase = Math.max(6, Math.floor(cellSize * 0.45));
        let fontSize = fontSizeBase;
        if (nameLen === 1) fontSize = Math.floor(fontSizeBase * 1.1);
        else if (nameLen === 2) fontSize = fontSizeBase;
        else if (nameLen === 3) fontSize = Math.floor(fontSizeBase * 0.85);
        else fontSize = Math.floor(fontSizeBase * 0.7);

        // 获取对比度文字颜色
        const textFill = this.getContrastTextColor(color.rgb);

        if (beadShape === 'circle') {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
            ctx.clip();

            if (chartStyle === 'color') {
                ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                ctx.fillRect(x, y, cellSize, cellSize);
            } else if (chartStyle === 'color-with-code') {
                ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                ctx.fillRect(x, y, cellSize, cellSize);
                ctx.fillStyle = textFill;
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(color.name, x + cellSize / 2, y + cellSize / 2);
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x, y, cellSize, cellSize);
                ctx.strokeStyle = '#999';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = '#333';
                ctx.font = `${fontSize}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(color.name, x + cellSize / 2, y + cellSize / 2);
            }

            ctx.restore();
        } else if (beadShape === 'ring') {
            ctx.save();
            const ringWidth = Math.max(2, Math.floor(cellSize * 0.3));

            if (chartStyle === 'color') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
                ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                ctx.beginPath();
                ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - 1 - ringWidth, 0, Math.PI * 2);
                ctx.fill();
            } else if (chartStyle === 'color-with-code') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
                ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                ctx.beginPath();
                ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - 1 - ringWidth, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = textFill;
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(color.name, x + cellSize / 2, y + cellSize / 2);
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
                ctx.strokeStyle = '#999';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - 1 - ringWidth, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = '#333';
                ctx.font = `${fontSize}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(color.name, x + cellSize / 2, y + cellSize / 2);
            }

            ctx.restore();
        } else {
            if (chartStyle === 'color') {
                ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
            } else if (chartStyle === 'color-with-code') {
                ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
                ctx.fillStyle = textFill;
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(color.name, x + cellSize / 2, y + cellSize / 2);
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
                ctx.strokeStyle = '#999';
                ctx.strokeRect(x, y, cellSize - 1, cellSize - 1);
                ctx.fillStyle = '#333';
                ctx.font = `${fontSize}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(color.name, x + cellSize / 2, y + cellSize / 2);
            }
        }
    }

    /**
     * 绘制坐标
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} cellSize - 单元格大小
     * @param {number} coordSize - 坐标区域大小
     * @param {string} color - 颜色
     */
    drawCoordinates(ctx, width, height, cellSize, coordSize, color) {
        ctx.fillStyle = color;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 左侧编号
        for (let y = 0; y < height; y++) {
            ctx.fillText(y + 1, coordSize / 2, coordSize + y * cellSize + cellSize / 2);
        }

        // 顶部编号
        for (let x = 0; x < width; x++) {
            ctx.fillText(x + 1, coordSize + x * cellSize + cellSize / 2, coordSize / 2);
        }

        // 底部编号
        const bottomY = coordSize + height * cellSize + coordSize / 2;
        for (let x = 0; x < width; x++) {
            ctx.fillText(x + 1, coordSize + x * cellSize + cellSize / 2, bottomY);
        }
    }

    /**
     * 绘制网格
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} cellSize - 单元格大小
     * @param {number} coordSize - 坐标区域大小
     * @param {string} color - 颜色
     * @param {number} lineWidth - 线宽
     */
    drawGrid(ctx, width, height, cellSize, coordSize, color, lineWidth) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();

        for (let x = 0; x <= width; x++) {
            ctx.moveTo(coordSize + x * cellSize - 0.5, coordSize);
            ctx.lineTo(coordSize + x * cellSize - 0.5, coordSize + height * cellSize);
        }

        for (let y = 0; y <= height; y++) {
            ctx.moveTo(coordSize, coordSize + y * cellSize - 0.5);
            ctx.lineTo(coordSize + width * cellSize, coordSize + y * cellSize - 0.5);
        }

        ctx.stroke();
    }

    /**
     * 绘制大网格
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} cellSize - 单元格大小
     * @param {number} coordSize - 坐标区域大小
     * @param {number} largeGridSize - 大网格大小
     * @param {string} color - 颜色
     * @param {number} lineWidth - 线宽
     */
    drawLargeGrid(ctx, width, height, cellSize, coordSize, largeGridSize, color, lineWidth) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();

        for (let x = 0; x <= width; x += largeGridSize) {
            ctx.moveTo(coordSize + x * cellSize, coordSize);
            ctx.lineTo(coordSize + x * cellSize, coordSize + height * cellSize);
        }

        for (let y = 0; y <= height; y += largeGridSize) {
            ctx.moveTo(coordSize, coordSize + y * cellSize);
            ctx.lineTo(coordSize + width * cellSize, coordSize + y * cellSize);
        }

        ctx.stroke();
    }

    /**
     * 绘制水印
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {string} text - 水印文字
     * @param {number} y - Y坐标
     */
    drawWatermark(ctx, text, y) {
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, ctx.canvas.width / 2, y);
    }

    /**
     * 获取对比度文本颜色
     * @param {Array} rgb - RGB颜色
     * @returns {string} 文本颜色
     */
    getContrastTextColor(rgb) {
        const brightness = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
        return brightness > 128 ? '#000000' : '#ffffff';
    }

    /**
     * 渲染圆形拼豆图表
     * @param {HTMLCanvasElement} canvas - 画布元素
     * @param {Array} perlerColors - 拼豆颜色数组（一维）
     * @param {Array} beadPositions - 珠子位置数组
     * @param {number} maxRing - 最大环数
     * @param {number} totalBeads - 总珠子数
     * @param {Object} options - 选项
     */
    renderCircularChart(canvas, perlerColors, beadPositions, maxRing, totalBeads, options = {}) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const cellSize = options.cellSize || 24;
        const chartStyle = options.chartStyle || 'color';
        const beadShape = options.beadShape || 'circle';
        const showGrid = options.showGrid !== false;
        const showCoords = options.showCoords !== false;
        const coordColor = options.coordColor || '#000000';
        const gridLineWidth = options.gridLineWidth || 1;
        const showSectorLines = options.showSectorLines !== false;
        const transparentColor = options.transparentColor || '#ffffff';

        const padding = cellSize * 2;
        const maxRadius = (maxRing - 0.5) * cellSize;
        const canvasSize = (maxRadius + cellSize) * 2 + padding * 2;
        const center = canvasSize / 2;

        canvas.width = canvasSize;
        canvas.height = canvasSize;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        if (showSectorLines) {
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let sector = 0; sector < 6; sector++) {
                const angle = sector * (Math.PI / 3);
                ctx.moveTo(center, center);
                ctx.lineTo(
                    center + (maxRadius + cellSize) * Math.cos(angle),
                    center + (maxRadius + cellSize) * Math.sin(angle)
                );
            }
            ctx.stroke();
        }

        if (showGrid) {
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = gridLineWidth;
            ctx.beginPath();
            for (let ring = 1; ring < maxRing; ring++) {
                const radius = ring * cellSize;
                ctx.beginPath();
                ctx.arc(center, center, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.stroke();
        }

        if (showCoords) {
            ctx.fillStyle = coordColor;
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            for (let ring = 1; ring < maxRing; ring++) {
                const radius = ring * cellSize;
                ctx.fillText(`R${ring}`, center + radius + cellSize / 2, center);
            }

            for (let sector = 0; sector < 6; sector++) {
                const angle = sector * (Math.PI / 3);
                const radius = maxRadius + cellSize;
                const labelX = center + radius * Math.cos(angle);
                const labelY = center + radius * Math.sin(angle);
                ctx.fillText(`S${sector + 1}`, labelX, labelY);
            }
        }

        for (let i = 0; i < totalBeads; i++) {
            const color = perlerColors[i];
            const pos = beadPositions[i];
            
            const px = center + pos.x - cellSize / 2;
            const py = center + pos.y - cellSize / 2;

            if (color.isTransparent) {
                ctx.fillStyle = transparentColor;
                if (beadShape === 'circle' || beadShape === 'ring') {
                    ctx.beginPath();
                    ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                    ctx.fill();
                } else if (beadShape === 'round-square') {
                    const cornerRadius = Math.min(8, Math.floor(cellSize * 0.2));
                    const actualSize = cellSize - 1;
                    ctx.beginPath();
                    ctx.moveTo(px + cornerRadius, py);
                    ctx.lineTo(px + actualSize - cornerRadius, py);
                    ctx.quadraticCurveTo(px + actualSize, py, px + actualSize, py + cornerRadius);
                    ctx.lineTo(px + actualSize, py + actualSize - cornerRadius);
                    ctx.quadraticCurveTo(px + actualSize, py + actualSize, px + actualSize - cornerRadius, py + actualSize);
                    ctx.lineTo(px + cornerRadius, py + actualSize);
                    ctx.quadraticCurveTo(px, py + actualSize, px, py + actualSize - cornerRadius);
                    ctx.lineTo(px, py + cornerRadius);
                    ctx.quadraticCurveTo(px, py, px + cornerRadius, py);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
                }
                continue;
            }

            this.drawBead(ctx, color, px, py, cellSize, chartStyle, beadShape);
        }
    }
}
