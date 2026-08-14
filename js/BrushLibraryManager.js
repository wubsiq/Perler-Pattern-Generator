// 内置默认画笔数据（用于本地测试降级）
const DEFAULT_BRUSHES = {
  "version": "1.0",
  "brushes": [
    {
      "id": "cross_5x5",
      "name": "十字形",
      "group": "1",
      "w": 5,
      "h": 5,
      "mask": [
        "00100",
        "00100",
        "11111",
        "00100",
        "00100"
      ]
    },
    {
      "id": "hline_1x5",
      "name": "水平线",
      "group": "",
      "w": 5,
      "h": 1,
      "mask": [
        "11111"
      ]
    },
    {
      "id": "vline_5x1",
      "name": "垂直线",
      "group": "",
      "w": 1,
      "h": 5,
      "mask": [
        "1",
        "1",
        "1",
        "1",
        "1"
      ]
    },
    {
      "id": "diagonal_5x5",
      "name": "斜线(45°)",
      "group": "",
      "w": 5,
      "h": 5,
      "mask": [
        "10000",
        "11000",
        "11100",
        "11110",
        "11111"
      ]
    },
    {
      "id": "heart_7x7",
      "name": "心形",
      "group": "",
      "w": 7,
      "h": 7,
      "mask": [
        "0100010",
        "1110111",
        "1111111",
        "1111111",
        "0111110",
        "0011100",
        "0001000"
      ]
    },
    {
      "id": "preset_1786598087155",
      "name": "A",
      "group": "花体字母大写",
      "w": 13,
      "h": 10,
      "mask": [
        "0000000000000",
        "0000000000111",
        "0000000011010",
        "0000000100100",
        "0000001001100",
        "0001111111110",
        "0100010011000",
        "1000100110000",
        "1001000110010",
        "0110000011100"
      ]
    },
    {
      "id": "preset_1786598309636",
      "name": "B",
      "group": "花体字母大写",
      "w": 14,
      "h": 9,
      "mask": [
        "00000001111011",
        "00000110001100",
        "00001000110110",
        "00001101100110",
        "00000011011000",
        "01100010001100",
        "10100110001100",
        "10001101001100",
        "01110000111000"
      ]
    },
    {
      "id": "preset_1786598494147",
      "name": "D",
      "group": "花体字母大写",
      "w": 13,
      "h": 9,
      "mask": [
        "0000001111011",
        "0000010000100",
        "0000100001010",
        "0000100011010",
        "0000000110010",
        "0000000110010",
        "0111001100100",
        "1000110001000",
        "0111001110000"
      ]
    },
    {
      "id": "preset_1786598593847",
      "name": "F",
      "group": "花体字母大写",
      "w": 16,
      "h": 9,
      "mask": [
        "0000001111100001",
        "0000110001111110",
        "0001000010000000",
        "0001010110000000",
        "0000101100000000",
        "0110001111000000",
        "1000011000000000",
        "1000110000000000",
        "0111000000000000"
      ]
    },
    {
      "id": "preset_1786598714026",
      "name": "H",
      "group": "花体字母大写",
      "w": 16,
      "h": 9,
      "mask": [
        "0000110000100110",
        "0001001111001101",
        "0000000010011000",
        "0000000110010000",
        "0000001111100000",
        "0110001100110000",
        "1000011001100000",
        "1000110011001000",
        "0111000001110000"
      ]
    },
    {
      "id": "preset_1786598841922",
      "name": "P",
      "group": "花体字母大写",
      "w": 12,
      "h": 9,
      "mask": [
        "000000111110",
        "000011001011",
        "000100010011",
        "000110110110",
        "000001100000",
        "011001100000",
        "100011000000",
        "100110000000",
        "011000000000"
      ]
    },
    {
      "id": "preset_1786599062367",
      "name": "Y",
      "group": "花体字母大写",
      "w": 9,
      "h": 9,
      "mask": [
        "000110011",
        "001010101",
        "000110101",
        "001101010",
        "000110110",
        "010000100",
        "100001100",
        "100011000",
        "011110000"
      ]
    },
    {
      "id": "preset_1786599179406",
      "name": "M",
      "group": "花体字母大写",
      "w": 18,
      "h": 9,
      "mask": [
        "000000000011100111",
        "000000000101001010",
        "000000001010010100",
        "000000010110101100",
        "000000100101011000",
        "011001001110011000",
        "100010001100110000",
        "100100011000100100",
        "011000010000111000"
      ]
    },
    {
      "id": "preset_1786599262805",
      "name": "W",
      "group": "花体字母大写",
      "w": 17,
      "h": 9,
      "mask": [
        "01101110011100110",
        "10110100101001001",
        "10001001010010000",
        "01011010110100000",
        "00010100101000000",
        "00111001110000000",
        "00110001100000000",
        "01100011000000000",
        "01000010000000000"
      ]
    }
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
  renderPreview(canvas, brush, cellSize = 10, color = '#000000', options = {}) {
    const ctx = canvas.getContext('2d');
    const brushW = brush.w || brush.width || 1;
    const brushH = brush.h || brush.height || 1;
    
    // 只有当 canvas 尺寸未设置时才设置
    const targetW = brushW * cellSize;
    const targetH = brushH * cellSize;
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    
    const bgColor = options.bgColor || '#f5f5f5';
    const gridColor = options.gridColor || '#e0e0e0';
    const showGrid = options.showGrid !== false;
    
    // 清空
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制画笔形状
    ctx.fillStyle = color;
    const mask = brush.mask || brush.shape;
    if (mask) {
      for (let y = 0; y < brushH; y++) {
        for (let x = 0; x < brushW; x++) {
          const isFilled = Array.isArray(mask[y]) 
            ? (mask[y][x] === '1' || mask[y][x] === 1 || mask[y][x] === true)
            : (mask[y] && mask[y][x] === '1');
          if (isFilled) {
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }
    }
    
    // 绘制网格线
    if (showGrid && cellSize >= 3) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= brushW; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize + 0.5, 0);
        ctx.lineTo(x * cellSize + 0.5, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= brushH; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize + 0.5);
        ctx.lineTo(canvas.width, y * cellSize + 0.5);
        ctx.stroke();
      }
    }
  }

  // 获取所有分组（从预设画笔中提取）
  getGroups() {
    const groups = new Set();
    this.presetBrushes.forEach(b => {
      if (b.group && b.group.trim()) {
        groups.add(b.group.trim());
      }
    });
    return Array.from(groups).sort();
  }

  // 按分组筛选预设画笔
  filterPresetByGroup(group) {
    if (!group) {
      return this.presetBrushes; // 返回全部
    }
    if (group === '__ungrouped__') {
      return this.presetBrushes.filter(b => !b.group || !b.group.trim());
    }
    return this.presetBrushes.filter(b => b.group === group);
  }

  // 按分组筛选我的画笔
  filterMyByGroup(group) {
    if (!group) {
      return this.myBrushes; // 返回全部
    }
    if (group === '__ungrouped__') {
      return this.myBrushes.filter(b => !b.group || !b.group.trim());
    }
    return this.myBrushes.filter(b => b.group === group);
  }

  // 获取分组统计
  getGroupStats() {
    const stats = { total: this.presetBrushes.length, groups: {} };
    this.presetBrushes.forEach(b => {
      const g = b.group || '__ungrouped__';
      if (!stats.groups[g]) {
        stats.groups[g] = { name: g === '__ungrouped__' ? '未分组' : g, count: 0 };
      }
      stats.groups[g].count++;
    });
    return stats;
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
