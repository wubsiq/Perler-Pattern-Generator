/**
 * BrushManager - 自定义画笔管理器
 * 支持保存选区为画笔、使用画笔绘制、管理画笔库
 */
class BrushManager {
    constructor() {
        // 画笔存储（从 localStorage 加载）
        this.brushes = this._loadBrushes();
        
        // 当前选中的画笔
        this.currentBrush = null;
        
        // 绘制模式：'manual' | 'auto'
        this.drawMode = 'manual';  // 半自动：手动选择画笔绘制
        
        // 事件回调
        this.onBrushChange = null;
        this.onModeChange = null;
        
        // 存储 key
        this.STORAGE_KEY = 'customBeadBrushes';
    }
    
    /**
     * 从 localStorage 加载画笔
     */
    _loadBrushes() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('加载画笔失败:', e);
            return [];
        }
    }
    
    /**
     * 保存画笔到 localStorage
     */
    _saveBrushes() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.brushes));
        } catch (e) {
            console.error('保存画笔失败:', e);
        }
    }
    
    /**
     * 从选区数据创建新画笔
     */
    createBrushFromSelection(selectionData, name = '自定义画笔') {
        if (!selectionData) return null;
        
        const brush = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
            name: name || `画笔 ${this.brushes.length + 1}`,
            shape: selectionData.shape,
            colors: selectionData.colors,
            width: selectionData.width,
            height: selectionData.height,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.brushes.push(brush);
        this._saveBrushes();
        this._notifyBrushChange();
        
        return brush;
    }
    
    /**
     * 从剪贴板数据创建画笔
     */
    createBrushFromClipboard(jsonString, name = '剪贴板画笔') {
        try {
            const data = JSON.parse(jsonString);
            if (data.type !== 'brush' && !data.shape) {
                throw new Error('无效的画笔数据格式');
            }
            
            return this.createBrushFromSelection(data, name);
        } catch (e) {
            console.error('解析剪贴板数据失败:', e);
            return null;
        }
    }
    
    /**
     * 获取所有画笔
     */
    getAllBrushes() {
        return this.brushes;
    }
    
    /**
     * 根据 ID 获取画笔
     */
    getBrushById(id) {
        return this.brushes.find(b => b.id === id);
    }
    
    /**
     * 选择当前画笔
     */
    selectBrush(id) {
        const brush = this.getBrushById(id);
        if (brush) {
            this.currentBrush = brush;
            this._notifyBrushChange();
            return true;
        }
        return false;
    }
    
    /**
     * 取消选择画笔
     */
    clearCurrentBrush() {
        this.currentBrush = null;
        this._notifyBrushChange();
    }
    
    /**
     * 获取当前画笔
     */
    getCurrentBrush() {
        return this.currentBrush;
    }
    
    /**
     * 删除画笔
     */
    deleteBrush(id) {
        const index = this.brushes.findIndex(b => b.id === id);
        if (index !== -1) {
            this.brushes.splice(index, 1);
            if (this.currentBrush && this.currentBrush.id === id) {
                this.currentBrush = null;
            }
            this._saveBrushes();
            this._notifyBrushChange();
            return true;
        }
        return false;
    }
    
    /**
     * 重命名画笔
     */
    renameBrush(id, newName) {
        const brush = this.getBrushById(id);
        if (brush) {
            brush.name = newName;
            brush.updatedAt = new Date().toISOString();
            this._saveBrushes();
            this._notifyBrushChange();
            return true;
        }
        return false;
    }
    
    /**
     * 更新绘制模式
     */
    setDrawMode(mode) {
        if (['manual', 'auto'].includes(mode)) {
            this.drawMode = mode;
            if (this.onModeChange && typeof this.onModeChange === 'function') {
                this.onModeChange(mode);
            }
        }
    }
    
    /**
     * 获取当前绘制模式
     */
    getDrawMode() {
        return this.drawMode;
    }
    
    /**
     * 使用画笔绘制（返回需要修改的格子数据）
     * @param {number} startX - 起始格子 x 坐标
     * @param {number} startY - 起始格子 y 坐标
     * @returns {Array} 需要修改的格子数据 [{x, y, color}]
     */
    getBrushStrokes(startX, startY) {
        if (!this.currentBrush) return [];
        
        const strokes = [];
        const brush = this.currentBrush;
        
        // 计算画笔的偏移（以中心为基准）
        const offsetX = Math.floor(brush.width / 2);
        const offsetY = Math.floor(brush.height / 2);
        
        for (let y = 0; y < brush.height; y++) {
            for (let x = 0; x < brush.width; x++) {
                if (brush.shape[y] && brush.shape[y][x]) {
                    const targetX = startX + (x - offsetX);
                    const targetY = startY + (y - offsetY);
                    const color = brush.colors[y] ? brush.colors[y][x] : null;
                    
                    strokes.push({
                        x: targetX,
                        y: targetY,
                        color: color
                    });
                }
            }
        }
        
        return strokes;
    }
    
    /**
     * 获取画笔预览数据（用于面板显示）
     */
    getBrushPreview(brush) {
        if (!brush) return null;
        
        const cells = [];
        for (let y = 0; y < brush.height; y++) {
            for (let x = 0; x < brush.width; x++) {
                if (brush.shape[y] && brush.shape[y][x]) {
                    cells.push({
                        x,
                        y,
                        color: brush.colors[y] ? brush.colors[y][x] : null
                    });
                }
            }
        }
        
        return {
            width: brush.width,
            height: brush.height,
            cells: cells
        };
    }
    
    /**
     * 导出画笔为 JSON
     */
    exportBrush(brush) {
        return JSON.stringify({
            version: '1.0',
            type: 'brush',
            name: brush.name,
            shape: brush.shape,
            colors: brush.colors,
            width: brush.width,
            height: brush.height,
            createdAt: brush.createdAt
        }, null, 2);
    }
    
    /**
     * 从 JSON 字符串导入画笔
     */
    importFromJSON(jsonString, name) {
        try {
            const data = JSON.parse(jsonString);
            if (data.type !== 'brush') {
                throw new Error('无效的画笔数据格式');
            }
            
            return this.createBrushFromSelection(data, name || data.name);
        } catch (e) {
            console.error('导入画笔失败:', e);
            return null;
        }
    }
    
    /**
     * 获取画笔数量
     */
    getBrushCount() {
        return this.brushes.length;
    }
    
    /**
     * 通知画笔变更
     */
    _notifyBrushChange() {
        if (this.onBrushChange && typeof this.onBrushChange === 'function') {
            this.onBrushChange(this.brushes, this.currentBrush);
        }
    }
}

// 导出到全局
window.BrushManager = BrushManager;
