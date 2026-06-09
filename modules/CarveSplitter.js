
/**
 * CarveSplitter - 负责雕刻分裂功能
 */
class CarveSplitter {
    constructor() {
        this.blocks = [];
        this.minBlockSize = 1;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.originalImageData = null;
    }

    /**
     * 初始化
     * @param {number} width
     * @param {number} height
     * @param {ImageData} imageData
     * @param {number} initialBlockSize
     */
    init(width, height, imageData, initialBlockSize = 10) {
        this.originalWidth = width;
        this.originalHeight = height;
        this.originalImageData = imageData;
        this.minBlockSize = 1;
        this.blocks = [];

        const cols = Math.ceil(width / initialBlockSize);
        const rows = Math.ceil(height / initialBlockSize);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * initialBlockSize;
                const y = row * initialBlockSize;
                const w = Math.min(initialBlockSize, width - x);
                const h = Math.min(initialBlockSize, height - y);

                const color = this.getDominantColor(x, y, w, h);

                this.blocks.push({
                    id: `${row}-${col}`,
                    x: x,
                    y: y,
                    width: w,
                    height: h,
                    color: color,
                    parent: null,
                    children: null
                });
            }
        }
    }

    /**
     * 获取区域的主色
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @returns {Object}
     */
    getDominantColor(x, y, w, h) {
        let r = 0, g = 0, b = 0, count = 0;

        const data = this.originalImageData.data;

        for (let py = y; py < y + h; py++) {
            for (let px = x; px < x + w; px++) {
                const idx = (py * this.originalWidth + px) * 4;
                r += data[idx];
                g += data[idx + 1];
                b += data[idx + 2];
                count++;
            }
        }

        return {
            r: Math.round(r / count),
            g: Math.round(g / count),
            b: Math.round(b / count)
        };
    }

    /**
     * 分裂指定块
     * @param {Object} block
     * @param {boolean} updateAfter
     */
    splitBlock(block, updateAfter = true) {
        if (block.width <= this.minBlockSize && block.height <= this.minBlockSize) return;

        const index = this.blocks.indexOf(block);
        if (index === -1) return;

        this.blocks.splice(index, 1);

        const newSize = Math.max(this.minBlockSize, Math.min(block.width, block.height) / 2);

        const splits = [
            { x: block.x, y: block.y, w: Math.min(newSize, block.width), h: Math.min(newSize, block.height) },
            { x: block.x + newSize, y: block.y, w: block.width - newSize, h: Math.min(newSize, block.height) },
            { x: block.x, y: block.y + newSize, w: Math.min(newSize, block.width), h: block.height - newSize },
            { x: block.x + newSize, y: block.y + newSize, w: block.width - newSize, h: block.height - newSize }
        ];

        const newBlocks = [];
        splits.forEach((split, idx) => {
            if (split.w > 0 && split.h > 0) {
                const color = this.getDominantColor(split.x, split.y, split.w, split.h);
                newBlocks.push({
                    id: `${block.id}-${idx}`,
                    x: split.x,
                    y: split.y,
                    width: split.w,
                    height: split.h,
                    color: color,
                    parent: block,
                    children: null
                });
            }
        });

        this.blocks.splice(index, 0, ...newBlocks);
        block.children = newBlocks;
    }

    /**
     * 递归分裂所有块
     */
    recursiveSplit() {
        let splitHappened = true;
        let iterations = 0;
        const maxIterations = 5;

        while (splitHappened && iterations < maxIterations) {
            splitHappened = false;
            const blocksToSplit = [...this.blocks].filter(block =>
                block.width > this.minBlockSize || block.height > this.minBlockSize
            );

            if (blocksToSplit.length === 0) break;

            for (const block of blocksToSplit) {
                if (this.blocks.includes(block)) {
                    this.splitBlock(block, false);
                    splitHappened = true;
                }
            }
            iterations++;
        }
    }

    /**
     * 转换为像素化数据
     * @returns {Array}
     */
    convertToPixelatedData() {
        const pixelatedData = [];

        const sortedBlocks = [...this.blocks].sort((a, b) => {
            if (a.y !== b.y) return a.y - b.y;
            return a.x - b.x;
        });

        for (let y = 0; y < this.originalHeight; y++) {
            const row = new Array(this.originalWidth);

            let x = 0;
            while (x < this.originalWidth) {
                let found = false;

                for (const block of sortedBlocks) {
                    if (block.y > y + 1) break;

                    if (x >= block.x && x < block.x + block.width &&
                        y >= block.y && y < block.y + block.height) {

                        const colorObj = {
                            r: block.color.r,
                            g: block.color.g,
                            b: block.color.b,
                            isTransparent: false
                        };

                        const fillCount = Math.min(block.x + block.width - x, this.originalWidth - x);

                        for (let i = 0; i < fillCount; i++) {
                            row[x + i] = colorObj;
                        }

                        x += fillCount;
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    row[x] = { r: 255, g: 255, b: 255, isTransparent: false };
                    x++;
                }
            }

            pixelatedData.push(row);
        }

        return pixelatedData;
    }

    /**
     * 获取所有块
     * @returns {Array}
     */
    getBlocks() {
        return this.blocks;
    }

    /**
     * 设置最小块大小
     * @param {number} size
     */
    setMinBlockSize(size) {
        this.minBlockSize = size;
    }
}


