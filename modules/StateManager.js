/**
 * 全局状态管理器
 * 统一管理所有应用状态
 */
class StateManager {
    constructor() {
        // 状态：当前步骤
        this.currentStep = 'upload'; // 'upload' | 'pixel' | 'perler' | 'custom'

        // 状态：原图
        this.originalImage = null; // Image object
        this.originalImageData = null; // ImageData

        // 状态：像素化数据
        this.pixelatedImageData = null; // ImageData
        this.pixelGrid = null; // 像素格子数据：Array<Array<{r, g, b, a}>>
        this.pixelGridWidth = 0; // 像素格子数 x
        this.pixelGridHeight = 0; // 像素格子数 y

        // 状态：拼豆化数据
        this.perlerColors = null; // Array of {r, g, b, colorId, name}
        this.perlerWidth = 0; // 拼豆格子数 x
        this.perlerHeight = 0; // 拼豆格子数 y

        // 状态：自定义编辑数据
        this.customEditData = null;

        // 回调函数
        this.listeners = [];
    }

    /**
     * 监听状态变化
     * @param {Function} callback - 回调函数
     */
    subscribe(callback) {
        this.listeners.push(callback);
    }

    /**
     * 通知所有监听器
     */
    notify() {
        this.listeners.forEach(cb => cb());
    }

    /**
     * 重置所有状态
     */
    reset() {
        this.currentStep = 'upload';
        this.originalImage = null;
        this.originalImageData = null;
        this.pixelatedImageData = null;
        this.pixelGrid = null;
        this.pixelGridWidth = 0;
        this.pixelGridHeight = 0;
        this.perlerColors = null;
        this.perlerWidth = 0;
        this.perlerHeight = 0;
        this.customEditData = null;
        this.notify();
    }

    /**
     * 设置原图
     * @param {Image} image - 图片对象
     * @param {ImageData} imageData - 图片数据
     */
    setOriginalImage(image, imageData) {
        this.originalImage = image;
        this.originalImageData = imageData;
        this.currentStep = 'pixel';
        this.notify();
    }

    /**
     * 设置像素化结果
     * @param {ImageData} imageData - 像素化后的图片
     * @param {Array} grid - 像素格子二维数组
     * @param {number} width - 格子数 x
     * @param {number} height - 格子数 y
     */
    setPixelatedResult(imageData, grid, width, height) {
        this.pixelatedImageData = imageData;
        this.pixelGrid = grid;
        this.pixelGridWidth = width;
        this.pixelGridHeight = height;
        this.currentStep = 'perler';
        this.notify();
    }
}

// 导出为全局单例
const stateManager = new StateManager();
