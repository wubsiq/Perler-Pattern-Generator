/**
 * ImageUploader - 负责图片上传、加载和显示
 */
class ImageUploader {
    constructor() {
        this.originalImage = null;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.originalImageData = null;
        this.originalCanvas = null;
        this.originalCtx = null;
    }

    /**
     * 初始化画布引用
     * @param {HTMLCanvasElement} canvas - 原图画布
     */
    initCanvas(canvas) {
        this.originalCanvas = canvas;
        this.originalCtx = canvas.getContext('2d', { willReadFrequently: true });
        this.originalCtx.imageSmoothingEnabled = false;
        this.originalCtx.mozImageSmoothingEnabled = false;
        this.originalCtx.webkitImageSmoothingEnabled = false;
        this.originalCtx.msImageSmoothingEnabled = false;
    }

    /**
     * 处理文件选择事件
     * @param {Event} e - 文件选择事件
     * @param {Function} callback - 加载完成回调
     */
    handleFileSelect(e, callback) {
        const file = e.target.files[0];
        if (file) {
            this.loadImage(file, callback);
        }
    }

    /**
     * 加载图片文件
     * @param {File} file - 图片文件
     * @param {Function} callback - 加载完成回调
     */
    loadImage(file, callback) {
        console.log('开始加载图片:', file.name, '类型:', file.type, '大小:', file.size);

        if (!file.type.startsWith('image/')) {
            console.warn('文件类型不标准，尝试继续加载');
        }

        if (file.size > 20 * 1024 * 1024) {
            alert('文件大小不能超过 20MB！');
            return;
        }

        const img = new Image();
        const objectURL = URL.createObjectURL(file);

        img.onload = () => {
            console.log('图片加载完成，尺寸:', img.width, 'x', img.height);
            this.originalImage = img;
            this.originalWidth = img.width;
            this.originalHeight = img.height;

            if (callback) {
                callback({
                    image: img,
                    width: img.width,
                    height: img.height
                });
            }

            URL.revokeObjectURL(objectURL);
        };

        img.onerror = (error) => {
            console.error('图片加载失败:', error);
            URL.revokeObjectURL(objectURL);
            alert('图片加载失败，请尝试其他图片！');
        };

        img.src = objectURL;
    }

    /**
     * 绘制原始图片到画布
     * @param {HTMLElement} sizeDisplay - 尺寸显示元素
     */
    drawOriginalImage(sizeDisplay) {
        if (!this.originalImage) return;

        this.originalCanvas.width = this.originalWidth;
        this.originalCanvas.height = this.originalHeight;
        this.originalCtx.drawImage(this.originalImage, 0, 0);
        this.originalImageData = this.originalCtx.getImageData(0, 0, this.originalWidth, this.originalHeight);

        if (sizeDisplay) {
            sizeDisplay.textContent = `原始尺寸: ${this.originalWidth} × ${this.originalHeight} px`;
        }

        const maxDisplayHeight = 400;
        let displayWidth, displayHeight;

        if (this.originalHeight > maxDisplayHeight) {
            const scale = maxDisplayHeight / this.originalHeight;
            displayWidth = this.originalWidth * scale;
            displayHeight = maxDisplayHeight;
        } else {
            displayWidth = this.originalWidth;
            displayHeight = this.originalHeight;
        }

        this.originalCanvas.style.width = displayWidth + 'px';
        this.originalCanvas.style.height = displayHeight + 'px';
    }

    /**
     * 获取原始图片
     * @returns {HTMLImageElement|null}
     */
    getOriginalImage() {
        return this.originalImage;
    }

    /**
     * 获取原始图片尺寸
     * @returns {{width: number, height: number}}
     */
    getOriginalSize() {
        return {
            width: this.originalWidth,
            height: this.originalHeight
        };
    }

    /**
     * 获取原始图片数据
     * @returns {ImageData|null}
     */
    getOriginalImageData() {
        return this.originalImageData;
    }

    /**
     * 重置上传器
     */
    reset() {
        this.originalImage = null;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.originalImageData = null;
    }

    /**
     * 检查是否有图片加载
     * @returns {boolean}
     */
    hasImage() {
        return this.originalImage !== null;
    }
}


