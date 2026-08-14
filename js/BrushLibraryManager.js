// 内置默认画笔数据（用于本地测试降级）
const DEFAULT_BRUSHES = {
  version: "1.0",
  brushes: [
    { id: "circle_3x3", name: "圆形(3×3)", w: 3, h: 3, mask: ["010", "111", "010"] },
    { id: "circle_5x5", name: "圆形(5×5)", w: 5, h: 5, mask: ["00100", "01110", "11111", "01110", "00100"] },
    { id: "circle_7x7", name: "圆形(7×7)", w: 7, h: 7, mask: ["0001000", "0011100", "0111110", "1111111", "0111110", "0011100", "0001000"] },
    { id: "square_3x3", name: "方形(3×3)", w: 3, h: 3, mask: ["111", "111", "111"] },
    { id: "square_5x5", name: "方形(5×5)", w: 5, h: 5, mask: ["11111", "11111", "11111", "11111", "11111"] },
    { id: "triangle_5x5", name: "三角形", w: 5, h: 5, mask: ["00100", "00100", "01110", "01110", "11111"] },
    { id: "diamond_5x5", name: "菱形", w: 5, h: 5, mask: ["00100", "01110", "11111", "01110", "00100"] },
    { id: "cross_5x5", name: "十字形", w: 5, h: 5, mask: ["00100", "00100", "11111", "00100", "00100"] },
    { id: "hline_1x5", name: "水平线", w: 5, h: 1, mask: ["11111"] },
    { id: "vline_5x1", name: "垂直线", w: 1, h: 5, mask: ["1", "1", "1", "1", "1"] },
    { id: "diagonal_5x5", name: "斜线(45°)", w: 5, h: 5, mask: ["10000", "11000", "11100", "11110", "11111"] },
    { id: "heart_7x7", name: "心形", w: 7, h: 7, mask: ["0100010", "1110111", "1111111", "1111111", "0111110", "0011100", "0001000"] },
    { id: "star_7x7", name: "星形", w: 7, h: 7, mask: ["0001000", "0011100", "0111110", "1111111", "0011100", "0011100", "0110110"] }
  ]
};

// 画笔库管理器 - 管理预设画笔和用户画笔
class BrushLibraryManager {
  constructor() {
    this.presetBrushes = [];
    this.myBrushes = this.loadMyBrushes();
    this.selectedBrush = null;
    this.onBrushSelect = null;
    this.serverBaseUrl = 'http://localhost:3000';
  }

  // 加载预设画笔（懒加载）- 优先从服务器加载，失败则使用内置数据
  async loadPresetBrushes() {
    if (this.presetBrushes.length === 0) {
      // 先使用内置默认数据（确保本地测试可用）
      this.presetBrushes = [...DEFAULT_BRUSHES.brushes];
      
      // 尝试从服务器加载（如果服务器正在运行会覆盖默认数据）
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${this.serverBaseUrl}/api/brushes`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (res.ok) {
          const data = await res.json();
          if (data.brushes && data.brushes.length > 0) {
            this.presetBrushes = data.brushes;
            console.log('[BrushLibraryManager] 从服务器加载画笔成功:', data.brushes.length, '个');
          }
        }
      } catch (serverError) {
        // 服务器不可用，使用内置默认数据
        // console.warn('从服务器加载画笔失败，使用内置默认数据:', serverError.name);
      }
    }
    return this.presetBrushes;
  }

  // 加载我的画笔
  loadMyBrushes() {
    try {
      const saved = localStorage.getItem('myBrushes');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('加载我的画笔失败:', error);
      return [];
    }
  }

  // 保存我的画笔
  saveMyBrushes() {
    try {
      localStorage.setItem('myBrushes', JSON.stringify(this.myBrushes));
      return true;
    } catch (error) {
      console.error('保存我的画笔失败:', error);
      return false;
    }
  }

  // 添加画笔到我的画笔
  addToMyBrushes(brush) {
    // 检查是否已存在
    const exists = this.myBrushes.some(b => b.id === brush.id);
    if (exists) {
      return false; // 已存在
    }
    this.myBrushes.push({
      ...brush,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: brush.name + ' (副本)'
    });
    this.saveMyBrushes();
    return true;
  }

  // 从我的画笔删除
  removeFromMyBrushes(brushId) {
    this.myBrushes = this.myBrushes.filter(b => b.id !== brushId);
    this.saveMyBrushes();
  }

  // 选择画笔
  selectBrush(brush) {
    this.selectedBrush = brush;
    if (this.onBrushSelect) {
      this.onBrushSelect(brush);
    }
  }

  // 获取选中的画笔
  getSelectedBrush() {
    return this.selectedBrush;
  }

  // 渲染画笔预览到 canvas
  renderPreview(canvas, brush, cellSize = 10, color = '#000000') {
    const ctx = canvas.getContext('2d');
    canvas.width = brush.w * cellSize;
    canvas.height = brush.h * cellSize;
    
    // 清空
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格背景
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制画笔形状
    ctx.fillStyle = color;
    for (let y = 0; y < brush.h; y++) {
      for (let x = 0; x < brush.w; x++) {
        if (brush.mask[y] && brush.mask[y][x] === '1') {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
    
    // 绘制网格线
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= brush.w; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= brush.h; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(canvas.width, y * cellSize);
      ctx.stroke();
    }
  }

  // 验证画笔数据格式
  validateBrush(brush) {
    if (!brush || !brush.id || !brush.mask) {
      return false;
    }
    if (!Array.isArray(brush.mask)) {
      return false;
    }
    return brush.mask.every(row => typeof row === 'string');
  }

  // 导出画笔为 JSON 字符串
  exportBrushes() {
    return JSON.stringify(this.myBrushes, null, 2);
  }

  // 从 JSON 字符串导入画笔
  importBrushes(jsonString) {
    try {
      const brushes = JSON.parse(jsonString);
      if (Array.isArray(brushes)) {
        brushes.forEach(brush => {
          if (this.validateBrush(brush)) {
            this.addToMyBrushes(brush);
          }
        });
        return true;
      }
    } catch (error) {
      console.error('导入画笔失败:', error);
    }
    return false;
  }
}

// 全局导出
if (typeof window !== 'undefined') {
  window.BrushLibraryManager = BrushLibraryManager;
}
