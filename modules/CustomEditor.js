
/**
 * CustomEditor - 负责自定义编辑功能
 */
class CustomEditor {
    constructor() {
        this.editData = null;
        this.editHistory = [];
        this.isDrawing = false;
        this.currentEditTool = 'brush';
        this.cellSize = 20;
    }

    /**
     * 初始化编辑数据
     * @param {Array} perlerColors - 拼豆颜色矩阵
     */
    initData(perlerColors) {
        if (!perlerColors || !perlerColors.length) return;

        this.editData = perlerColors.map(row => [...row]);
        this.editHistory = [this.editData.map(row => [...row])];
    }

    /**
     * 保存历史记录
     */
    saveHistory() {
        this.editHistory.push(this.editData.map(row => [...row]));
        if (this.editHistory.length > 50) {
            this.editHistory.shift();
        }
    }

    /**
     * 撤销
     */
    undo() {
        if (this.editHistory.length <= 1) return;
        this.editHistory.pop();
        this.editData = this.editHistory[this.editHistory.length - 1].map(row => [...row]);
    }

    /**
     * 获取透明颜色
     */
    getTransparentColor() {
        return {
            name: '',
            rgb: [255, 255, 255],
            isTransparent: true
        };
    }

    /**
     * 应用链状擦除
     * @param {number} startX - 起始 X
     * @param {number} startY - 起始 Y
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} maxCount - 最大数量
     */
    applyChainRazor(startX, startY, width, height, maxCount = 1000) {
        const transparentColor = this.getTransparentColor();
        const targetColor = this.editData[startY][startX];
        
        if (targetColor.isTransparent) return;

        let count = 0;
        const visited = new Set();
        const stack = [{x: startX, y: startY}];

        while (stack.length > 0 && count < maxCount) {
            const {x, y} = stack.pop();
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            if (x < 0 || x >= width || y < 0 || y >= height) continue;

            const currentColor = this.editData[y][x];
            if (currentColor.isTransparent) continue;
            if (currentColor.name !== targetColor.name) continue;

            visited.add(key);
            this.editData[y][x] = transparentColor;
            count++;

            // 八方向
            stack.push({x: x + 1, y});
            stack.push({x: x - 1, y});
            stack.push({x, y: y + 1});
            stack.push({x, y: y - 1});
            stack.push({x: x + 1, y: y + 1});
            stack.push({x: x + 1, y: y - 1});
            stack.push({x: x - 1, y: y + 1});
            stack.push({x: x - 1, y: y - 1});
        }
    }

    /**
     * 应用编辑到单元格
     * @param {number} x - X
     * @param {number} y - Y
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {Object} options - 选项
     */
    applyEditToCell(x, y, width, height, options = {}) {
        const brushSize = options.brushSize || 1;
        const halfBrush = Math.floor(brushSize / 2);

        for (let dy = -halfBrush; dy <= halfBrush; dy++) {
            for (let dx = -halfBrush; dx <= halfBrush; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    this.applySingleEdit(nx, ny, width, height, options);
                }
            }
        }
    }

    /**
     * 应用单个编辑
     * @param {number} x - X
     * @param {number} y - Y
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {Object} options - 选项
     */
    applySingleEdit(x, y, width, height, options = {}) {
        const transparentColor = this.getTransparentColor();
        const tool = options.tool || 'brush';
        const targetColor = options.targetColor || null;
        const colorSet = options.colorSet || [];
        const mappingMethod = options.mappingMethod || 'euclidean';

        switch (tool) {
            case 'brush':
            case 'eraser':
                if (targetColor) {
                    this.editData[y][x] = targetColor;
                }
                break;

            case 'razor':
                this.editData[y][x] = transparentColor;
                break;

            case 'picker':
                const pickedColor = this.editData[y][x];
                if (!pickedColor.isTransparent) {
                    const hex = `#${pickedColor.rgb[0].toString(16).padStart(2, '0')}${pickedColor.rgb[1].toString(16).padStart(2, '0')}${pickedColor.rgb[2].toString(16).padStart(2, '0')}`;
                    return { hex, color: pickedColor };
                }
                break;
        }
    }

    /**
     * 泛洪填充
     * @param {number} startX - 起始 X
     * @param {number} startY - 起始 Y
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {Object} targetColor - 目标颜色
     * @param {Object} fillColor - 填充颜色
     */
    floodFill(startX, startY, width, height, targetColor, fillColor) {
        const targetIsTransparent = targetColor.isTransparent;
        const fillIsTransparent = fillColor.isTransparent;

        if (!targetIsTransparent && !fillIsTransparent && targetColor.name === fillColor.name) {
            return;
        }
        if (targetIsTransparent && fillIsTransparent) {
            return;
        }

        const visited = new Set();
        const stack = [{x: startX, y: startY}];

        while (stack.length > 0) {
            const {x, y} = stack.pop();
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            if (x < 0 || x >= width || y < 0 || y >= height) continue;

            const currentColor = this.editData[y][x];
            const currentIsTransparent = currentColor.isTransparent;

            let isMatch = false;
            if (targetIsTransparent) {
                isMatch = currentIsTransparent;
            } else {
                isMatch = !currentIsTransparent && currentColor.name === targetColor.name;
            }

            if (!isMatch) continue;

            visited.add(key);
            this.editData[y][x] = fillColor;

            stack.push({x: x + 1, y});
            stack.push({x: x - 1, y});
            stack.push({x, y: y + 1});
            stack.push({x, y: y - 1});
        }
    }

    /**
     * 移除指定颜色
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {Object} targetColor - 目标颜色
     */
    removeColor(width, height, targetColor) {
        const transparentColor = this.getTransparentColor();
        let count = 0;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const currentColor = this.editData[y][x];
                if (!currentColor.isTransparent && currentColor.name === targetColor.name) {
                    this.editData[y][x] = transparentColor;
                    count++;
                }
            }
        }

        return count;
    }

    /**
     * 获取编辑数据
     * @returns {Array}
     */
    getData() {
        return this.editData;
    }

    /**
     * 设置编辑数据
     * @param {Array} data
     */
    setData(data) {
        this.editData = data;
    }
}


