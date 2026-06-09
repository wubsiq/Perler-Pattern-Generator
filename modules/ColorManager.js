/**
 * ColorManager - 颜色管理模块
 * 负责颜色统计、颜色映射、颜色转换等
 */
class ColorManager {
    constructor() {
        // 颜色计数
        this.colorCounts = {};
        // 排除的颜色
        this.excludedColors = new Set();
        // 当前排序方式
        this.currentSort = 'count-desc';
    }

    /**
     * 统计颜色使用情况
     * @param {Array} perlerColors - 拼豆颜色矩阵
     * @returns {Object} 颜色计数
     */
    calculateColorCounts(perlerColors) {
        this.colorCounts = {};

        for (let y = 0; y < perlerColors.length; y++) {
            for (let x = 0; x < perlerColors[y].length; x++) {
                const color = perlerColors[y][x];
                if (color && !color.isTransparent) {
                    const name = color.name;
                    this.colorCounts[name] = (this.colorCounts[name] || 0) + 1;
                }
            }
        }

        return this.colorCounts;
    }

    /**
     * 获取颜色使用列表（排序后）
     * @param {Array} perlerColors - 拼豆颜色矩阵
     * @param {string} colorSetName - 颜色集名称
     * @param {Object} colorSets - 颜色集数据
     * @returns {Array} 排序后的颜色列表
     */
    getSortedColorList(perlerColors, colorSetName, colorSets) {
        const counts = this.calculateColorCounts(perlerColors);
        const colorSet = colorSets[colorSetName];

        if (!colorSet) return [];

        let list = colorSet
            .filter(color => counts[color.name] > 0)
            .map(color => ({
                color: color,
                count: counts[color.name],
                isExcluded: this.excludedColors.has(color.name)
            }));

        // 排序
        list = this.sortColorList(list, this.currentSort);

        return list;
    }

    /**
     * 排序颜色列表
     * @param {Array} list - 颜色列表
     * @param {string} sortType - 排序类型
     * @returns {Array} 排序后的列表
     */
    sortColorList(list, sortType) {
        this.currentSort = sortType;

        switch (sortType) {
            case 'count-desc':
                return list.sort((a, b) => b.count - a.count);
            case 'count-asc':
                return list.sort((a, b) => a.count - b.count);
            case 'name':
                return list.sort((a, b) => a.color.name.localeCompare(b.color.name));
            case 'brightness':
                return list.sort((a, b) => {
                    const brightnessA = this.calculateBrightness(a.color.rgb);
                    const brightnessB = this.calculateBrightness(b.color.rgb);
                    return brightnessB - brightnessA;
                });
            default:
                return list;
        }
    }

    /**
     * 计算颜色亮度
     * @param {Array} rgb - RGB 颜色
     * @returns {number} 亮度值
     */
    calculateBrightness(rgb) {
        // 使用感知亮度公式
        return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
    }

    /**
     * 获取对比度文本颜色
     * @param {Array} rgb - 背景颜色
     * @returns {string} 文本颜色
     */
    getContrastTextColor(rgb) {
        const brightness = this.calculateBrightness(rgb);
        return brightness > 128 ? '#000000' : '#ffffff';
    }

    /**
     * 添加排除颜色
     * @param {string} colorName - 颜色名称
     */
    addExcludedColor(colorName) {
        this.excludedColors.add(colorName);
    }

    /**
     * 移除排除颜色
     * @param {string} colorName - 颜色名称
     */
    removeExcludedColor(colorName) {
        this.excludedColors.delete(colorName);
    }

    /**
     * 切换排除颜色
     * @param {string} colorName - 颜色名称
     * @returns {boolean} 是否被排除
     */
    toggleExcludedColor(colorName) {
        if (this.excludedColors.has(colorName)) {
            this.excludedColors.delete(colorName);
            return false;
        } else {
            this.excludedColors.add(colorName);
            return true;
        }
    }

    /**
     * 清除所有排除颜色
     */
    clearExcludedColors() {
        this.excludedColors.clear();
    }

    /**
     * RGB 到十六进制
     * @param {Array} rgb - RGB 颜色
     * @returns {string} 十六进制颜色
     */
    rgbToHex(rgb) {
        return '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');
    }

    /**
     * 十六进制到 RGB
     * @param {string} hex - 十六进制颜色
     * @returns {Array} RGB 颜色
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [0, 0, 0];
    }

    /**
     * 计算两个 RGB 颜色的距离
     * @param {Array} rgb1 - 颜色1
     * @param {Array} rgb2 - 颜色2
     * @returns {number} 距离
     */
    calculateRgbDistance(rgb1, rgb2) {
        const dr = rgb1[0] - rgb2[0];
        const dg = rgb1[1] - rgb2[1];
        const db = rgb1[2] - rgb2[2];
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    /**
     * 在颜色集中找到最接近的颜色
     * @param {Array} targetRgb - 目标 RGB
     * @param {Array} colorSet - 颜色集
     * @param {string} method - 映射方法
     * @returns {Object} 最接近的颜色
     */
    findClosestColor(targetRgb, colorSet, method = 'euclidean') {
        let closest = null;
        let minDistance = Infinity;

        for (const color of colorSet) {
            const distance = this.calculateRgbDistance(targetRgb, color.rgb);
            if (distance < minDistance) {
                minDistance = distance;
                closest = color;
            }
        }

        return closest;
    }

    /**
     * 获取颜色计数
     * @returns {Object} 颜色计数
     */
    getColorCounts() {
        return this.colorCounts;
    }

    /**
     * 获取总珠子数
     * @returns {number}
     */
    getTotalBeads() {
        return Object.values(this.colorCounts).reduce((sum, count) => sum + count, 0);
    }

    /**
     * 获取颜色种类数
     * @returns {number}
     */
    getColorTypeCount() {
        return Object.keys(this.colorCounts).length;
    }

    /**
     * 获取排除的颜色列表
     * @returns {Array}
     */
    getExcludedColors() {
        return Array.from(this.excludedColors);
    }
}
