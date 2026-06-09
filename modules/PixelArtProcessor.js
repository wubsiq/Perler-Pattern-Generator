
/**
 * PixelArtProcessor - 像素艺术处理模块
 * 负责像素化、像素网格绘制、颜色量化等
 */
class PixelArtProcessor {
    constructor() {
        // 配置
        this.pixelSize = 16;
        this.offsetX = 0;
        this.offsetY = 0;
        this.showPixelGrid = true;
        this.pixelGridColor = '#000000';
        this.pixelGridLineWidth = 1;
        
        // 数据
        this.pixelatedData = null;
        this.targetWidth = 0;
        this.targetHeight = 0;
        this.pixelColorStats = [];
    }

    /**
     * 处理像素化图像
     * @param {Image} image - 原始图片
     * @param {Object} options - 选项
     * @returns {Object} 处理结果
     */
    processImage(image, options) {
        const targetWidth = options.width;
        const targetHeight = options.height;
        this.targetWidth = targetWidth;
        this.targetHeight = targetHeight;
        this.pixelSize = options.pixelSize || 16;
        this.offsetX = options.offsetX || 0;
        this.offsetY = options.offsetY || 0;
        
        // 创建临时画布
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;
        
        // 禁用平滑插值
        this.disableSmoothing(tempCtx);
        tempCtx.drawImage(image, 0, 0, targetWidth, targetHeight);
        
        const imageData = tempCtx.getImageData(0, 0, targetWidth, targetHeight);
        
        // 使用 Pixelator 模块处理
        let pixelatorResult;
        if (typeof pixelator !== 'undefined') {
            pixelatorResult = pixelator.process(imageData, {
                blockSize: this.pixelSize,
                offsetX: this.offsetX,
                offsetY: this.offsetY,
                method: options.method || 'standard',
                targetColorCount: options.targetColorCount || 8,
                enableContrast: options.enableContrast || false,
                contrastFactor: options.contrastFactor || 1,
                enableSharpen: options.enableSharpen || false,
                sharpenStrength: options.sharpenStrength || 0
            });
        } else {
            // 回退实现
            pixelatorResult = {
                imageData: imageData,
                colorStats: this.calculateColorStats(imageData)
            };
        }
        
        this.pixelatedData = pixelatorResult.imageData;
        this.pixelColorStats = pixelatorResult.colorStats;
        
        return {
            imageData: this.pixelatedData,
            colorStats: this.pixelColorStats,
            width: targetWidth,
            height: targetHeight
        };
    }

    /**
     * 绘制像素化图像到画布
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {Object} options - 选项
     */
    drawPixelatedImage(ctx, options) {
        if (!this.pixelatedData) return;
        
        const targetWidth = this.targetWidth;
        const targetHeight = this.targetHeight;
        
        // 设置画布尺寸
        ctx.canvas.width = targetWidth;
        ctx.canvas.height = targetHeight;
        
        // 绘制像素数据
        ctx.putImageData(this.pixelatedData, 0, 0);
        
        // 绘制像素网格
        if (this.showPixelGrid) {
            this.drawPixelGrid(ctx, {
                pixelSize: this.pixelSize,
                offsetX: this.offsetX,
                offsetY: this.offsetY,
                color: this.pixelGridColor,
                lineWidth: this.pixelGridLineWidth
            });
        }
    }

    /**
     * 绘制像素网格
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {Object} options - 选项
     */
    drawPixelGrid(ctx, options) {
        const pixelSize = options.pixelSize || 16;
        const offsetX = options.offsetX || 0;
        const offsetY = options.offsetY || 0;
        const color = options.color || '#000000';
        const lineWidth = options.lineWidth || 1;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        if (lineWidth <= 0) return;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        
        // 绘制垂直线
        for (let x = offsetX; x < width; x += pixelSize) {
            if (x > 0) {
                ctx.moveTo(x - 0.5, 0);
                ctx.lineTo(x - 0.5, height);
            }
        }
        
        // 绘制水平线
        for (let y = offsetY; y < height; y += pixelSize) {
            if (y > 0) {
                ctx.moveTo(0, y - 0.5);
                ctx.lineTo(width, y - 0.5);
            }
        }
        
        ctx.stroke();
    }

    /**
     * 禁用平滑插值
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    disableSmoothing(ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
    }

    /**
     * 计算颜色统计
     * @param {ImageData} imageData - 图像数据
     * @returns {Array} 颜色统计数组
     */
    calculateColorStats(imageData) {
        const colorMap = new Map();
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            if (a < 128) continue;
            
            const key = `${r},${g},${b}`;
            colorMap.set(key, (colorMap.get(key) || 0) + 1);
        }
        
        const stats = Array.from(colorMap.entries()).map(([color, count]) => {
            const [r, g, b] = color.split(',').map(Number);
            return { rgb: [r, g, b], count };
        }).sort((a, b) => b.count - a.count);
        
        return stats;
    }

    /**
     * 计算格子尺寸
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} pixelSize - 像素大小
     * @returns {Object} 格子尺寸
     */
    calculateGridSize(width, height, pixelSize) {
        return {
            gridWidth: Math.ceil(width / pixelSize),
            gridHeight: Math.ceil(height / pixelSize)
        };
    }

    /**
     * 设置像素大小
     * @param {number} size - 像素大小
     */
    setPixelSize(size) {
        this.pixelSize = size;
    }

    /**
     * 设置网格偏移
     * @param {number} x - X 偏移
     * @param {number} y - Y 偏移
     */
    setOffset(x, y) {
        this.offsetX = x;
        this.offsetY = y;
    }

    /**
     * 设置网格显示选项
     * @param {Object} options - 选项
     */
    setGridOptions(options) {
        if (options.show !== undefined) this.showPixelGrid = options.show;
        if (options.color !== undefined) this.pixelGridColor = options.color;
        if (options.lineWidth !== undefined) this.pixelGridLineWidth = options.lineWidth;
    }

    /**
     * 获取像素化数据
     * @returns {ImageData}
     */
    getPixelatedData() {
        return this.pixelatedData;
    }

    /**
     * 获取颜色统计
     * @returns {Array}
     */
    getColorStats() {
        return this.pixelColorStats;
    }
}


