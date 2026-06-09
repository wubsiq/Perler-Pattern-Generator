
/**
 * UIController - 核心 UI 控制器，负责协调各模块工作
 */
class UIController {
    constructor() {
        // 状态
        this.originalImage = null;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.perlerColors = null;
        this.perlerWidth = 0;
        this.perlerHeight = 0;
        this.colorCounts = {};
        this.pixelatedData = null;
        
        // 导出计数器
        this.exportCounter = {
            pixelated: 0,
            perler: 0
        };

        // DOM 元素
        this.elements = {};
        
        // 模块引用
        this.modules = {
            imageUploader: null,
            downloadManager: null,
            snapshotManager: null,
            customEditor: null,
            smartOptimizer: null,
            carveSplitter: null
        };

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.initElements();
        this.initModules();
        this.initEventListeners();
    }

    /**
     * 初始化 DOM 元素
     */
    initElements() {
        // 基本元素
        this.elements.uploadArea = document.getElementById('uploadArea');
        this.elements.fileInput = document.getElementById('fileInput');
        this.elements.uploadSection = document.getElementById('uploadSection');
        this.elements.workspace = document.getElementById('workspace');
        
        // Canvas 元素
        this.elements.originalCanvas = document.getElementById('originalCanvas');
        this.elements.originalCtx = this.elements.originalCanvas.getContext('2d', { willReadFrequently: true });
        this.elements.pixelatedCanvas = document.getElementById('pixelatedCanvas');
        this.elements.pixelatedCtx = this.elements.pixelatedCanvas.getContext('2d', { willReadFrequently: true });
        this.elements.perlerCanvas = document.getElementById('perlerCanvas');
        this.elements.perlerCtx = this.elements.perlerCanvas.getContext('2d', { willReadFrequently: true });
        
        // 禁用平滑插值
        [this.elements.originalCtx, this.elements.pixelatedCtx, this.elements.perlerCtx].forEach(ctx => {
            ctx.imageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
        });
        
        // 显示元素
        this.elements.originalSize = document.getElementById('originalSize');
        this.elements.pixelatedSize = document.getElementById('pixelatedSize');
        this.elements.perlerSize = document.getElementById('perlerSize');
        
        // 控制元素
        this.elements.pixelSizeSlider = document.getElementById('pixelSizeSlider');
        this.elements.pixelSizeValue = document.getElementById('pixelSizeValue');
        this.elements.widthInput = document.getElementById('widthInput');
        this.elements.heightInput = document.getElementById('heightInput');
        this.elements.keepRatioCheckbox = document.getElementById('keepRatioCheckbox');
        
        this.elements.colorSetSelect = document.getElementById('colorSetSelect');
        this.elements.colorMappingMethod = document.getElementById('colorMappingMethod');
        this.elements.chartStyle = document.getElementById('chartStyle');
        this.elements.legendPosition = document.getElementById('legendPosition');
        this.elements.beadShape = document.getElementById('beadShape');
        this.elements.beadSizeSlider = document.getElementById('beadSizeSlider');
        this.elements.beadSizeValue = document.getElementById('beadSizeValue');
        
        this.elements.downloadPerlerBtn = document.getElementById('downloadPerlerBtn');
        this.elements.exportFormatSelect = document.getElementById('exportFormatSelect');
    }

    /**
     * 初始化模块
     */
    initModules() {
        // 检查模块是否存在并初始化
        if (typeof imageUploader !== 'undefined') {
            this.modules.imageUploader = imageUploader;
            this.modules.imageUploader.initCanvas(this.elements.originalCanvas);
        }
        
        if (typeof downloadManager !== 'undefined') {
            this.modules.downloadManager = downloadManager;
        }
        
        if (typeof snapshotManager !== 'undefined') {
            this.modules.snapshotManager = snapshotManager;
        }
        
        if (typeof customEditor !== 'undefined') {
            this.modules.customEditor = customEditor;
        }
        
        if (typeof smartOptimizer !== 'undefined') {
            this.modules.smartOptimizer = smartOptimizer;
        }
        
        if (typeof carveSplitter !== 'undefined') {
            this.modules.carveSplitter = carveSplitter;
        }
    }

    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 上传相关
        if (this.elements.uploadArea) {
            this.elements.uploadArea.addEventListener('click', () => {
                this.elements.fileInput.click();
            });
            
            this.elements.fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e);
            });
            
            this.elements.uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.elements.uploadArea.classList.add('dragover');
            });
            
            this.elements.uploadArea.addEventListener('dragleave', () => {
                this.elements.uploadArea.classList.remove('dragover');
            });
            
            this.elements.uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                this.elements.uploadArea.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.loadImageFile(files[0]);
                }
            });
        }
        
        // 下载相关
        if (this.elements.downloadPerlerBtn) {
            this.elements.downloadPerlerBtn.addEventListener('click', () => {
                this.handleDownloadPerlerChart();
            });
        }
    }

    /**
     * 处理文件选择
     * @param {Event} e
     */
    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.loadImageFile(file);
        }
    }

    /**
     * 加载图片文件
     * @param {File} file
     */
    loadImageFile(file) {
        if (this.modules.imageUploader) {
            this.modules.imageUploader.loadImage(file, (data) => {
                this.onImageLoaded(data);
            });
        } else {
            // 回退到原始实现
            this.fallbackLoadImage(file);
        }
    }

    /**
     * 图片加载完成回调
     * @param {Object} data
     */
    onImageLoaded(data) {
        this.originalImage = data.image;
        this.originalWidth = data.width;
        this.originalHeight = data.height;
        
        if (this.modules.imageUploader) {
            this.modules.imageUploader.drawOriginalImage(this.elements.originalSize);
        }
        
        this.showWorkspace();
    }

    /**
     * 回退加载实现（当模块不可用时）
     * @param {File} file
     */
    fallbackLoadImage(file) {
        const img = new Image();
        const objectURL = URL.createObjectURL(file);
        
        img.onload = () => {
            this.originalImage = img;
            this.originalWidth = img.width;
            this.originalHeight = img.height;
            
            this.elements.originalCanvas.width = img.width;
            this.elements.originalCanvas.height = img.height;
            this.elements.originalCtx.drawImage(img, 0, 0);
            
            if (this.elements.originalSize) {
                this.elements.originalSize.textContent = `原始尺寸: ${img.width} × ${img.height} px`;
            }
            
            URL.revokeObjectURL(objectURL);
            this.showWorkspace();
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(objectURL);
            alert('图片加载失败！');
        };
        
        img.src = objectURL;
    }

    /**
     * 显示工作区
     */
    showWorkspace() {
        if (this.elements.uploadSection) {
            this.elements.uploadSection.style.display = 'none';
        }
        if (this.elements.workspace) {
            this.elements.workspace.style.display = 'block';
        }
    }

    /**
     * 处理下载拼豆图表
     */
    handleDownloadPerlerChart() {
        if (!this.perlerColors) {
            alert('请先生成拼豆图！');
            return;
        }

        const format = this.elements.exportFormatSelect ? 
            this.elements.exportFormatSelect.value : 'png';

        if (format === 'svg' && typeof perlerGenerator !== 'undefined') {
            // SVG 导出 - 使用 PerlerGenerator 模块
            this.exportSVG();
        } else if (this.modules.downloadManager) {
            // 使用 DownloadManager 模块
            this.modules.downloadManager.downloadPerlerChart(
                this.perlerColors,
                this.perlerWidth,
                this.perlerHeight,
                this.getExportOptions()
            );
        }
    }

    /**
     * 获取导出选项
     */
    getExportOptions() {
        return {
            chartStyle: this.elements.chartStyle ? this.elements.chartStyle.value : 'flat',
            beadShape: this.elements.beadShape ? this.elements.beadShape.value : 'circle',
            showGrid: this.elements.showGridLines ? this.elements.showGridLines.checked : true,
            showCoords: this.elements.showCoordNumbers ? this.elements.showCoordNumbers.checked : false,
            showLargeGrid: this.elements.showLargeGridLines ? this.elements.showLargeGridLines.checked : false,
            largeGridSize: this.elements.largeGridSize ? parseInt(this.elements.largeGridSize.value) : 10,
            watermarkText: this.elements.watermarkText ? this.elements.watermarkText.value : '',
            colorCounts: this.colorCounts,
            legendPosition: this.elements.legendPosition ? this.elements.legendPosition.value : 'right',
            colorSetName: this.elements.colorSetSelect ? this.elements.colorSetSelect.value : 'artkal-mini-2.6mm-s'
        };
    }

    /**
     * 导出 SVG（使用 PerlerGenerator）
     */
    exportSVG() {
        if (typeof perlerGenerator === 'undefined') {
            alert('PerlerGenerator 模块不可用！');
            return;
        }

        const options = this.getExportOptions();
        const svgString = perlerGenerator.generatePerlerChartSVG(
            this.perlerColors,
            this.perlerWidth,
            this.perlerHeight,
            parseInt(this.elements.exportBeadSizeSlider ? this.elements.exportBeadSizeSlider.value : 20),
            options.colorSetName,
            options
        );

        if (this.modules.downloadManager) {
            this.modules.downloadManager.downloadSVG(svgString, '拼豆图');
        } else {
            // 回退实现
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `拼豆图_${++this.exportCounter.perler}.svg`;
            link.click();
            URL.revokeObjectURL(url);
        }
    }
}

// 请在主应用中手动初始化 UIController
// let uiController = new UIController();
