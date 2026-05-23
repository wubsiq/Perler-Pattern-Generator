class PixelArtGenerator {
    constructor() {
        this.originalImage = null;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.perlerMode = false;
        this.colorCounts = {};
        this.pixelColorStats = [];
        this.currentSort = 'count-desc';
        this.excludedColors = new Set();
        this.pixelatedData = null;
        this.unifiedSnapshots = [];
        
        // 导出计数器
        this.exportCounter = {
            pixelated: 0,
            perler: 0
        };
        
        // 雕刻分裂相关
        this.carveMode = false; // 是否在雕刻分裂模式
        this.carveBlocks = []; // 存储雕刻块
        this.selectedBlocks = new Set(); // 选中的块
        this.initialBlockSize = 200; // 初始块大小
        this.minBlockSize = 40; // 最小块大小
        this.originalImageData = null; // 缓存原图 imageData
        this.carveScale = 0.5; // 雕刻时的缩放比例
        this.showCarveGrid = true; // 是否显示分裂网格
        
        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadSection = document.getElementById('uploadSection');
        this.workspace = document.getElementById('workspace');
        this.perlerSection = document.getElementById('perlerSection');
        
        this.originalCanvas = document.getElementById('originalCanvas');
        this.originalCtx = this.originalCanvas.getContext('2d', { willReadFrequently: true });
        // 禁用所有 Canvas 的平滑插值
        this.originalCtx.imageSmoothingEnabled = false;
        this.originalCtx.mozImageSmoothingEnabled = false;
        this.originalCtx.webkitImageSmoothingEnabled = false;
        this.originalCtx.msImageSmoothingEnabled = false;
        
        this.pixelatedCanvas = document.getElementById('pixelatedCanvas');
        this.pixelatedCtx = this.pixelatedCanvas.getContext('2d', { willReadFrequently: true });
        // 禁用所有 Canvas 的平滑插值
        this.pixelatedCtx.imageSmoothingEnabled = false;
        this.pixelatedCtx.mozImageSmoothingEnabled = false;
        this.pixelatedCtx.webkitImageSmoothingEnabled = false;
        this.pixelatedCtx.msImageSmoothingEnabled = false;
        
        this.perlerCanvas = document.getElementById('perlerCanvas');
        this.perlerCtx = this.perlerCanvas.getContext('2d', { willReadFrequently: true });
        // 禁用所有 Canvas 的平滑插值
        this.perlerCtx.imageSmoothingEnabled = false;
        this.perlerCtx.mozImageSmoothingEnabled = false;
        this.perlerCtx.webkitImageSmoothingEnabled = false;
        this.perlerCtx.msImageSmoothingEnabled = false;
        
        this.originalSize = document.getElementById('originalSize');
        this.pixelatedSize = document.getElementById('pixelatedSize');
        this.pixelatedGridCount = document.getElementById('pixelatedGridCount');
        this.perlerSize = document.getElementById('perlerSize');
        
        this.pixelSizeSlider = document.getElementById('pixelSizeSlider');
        this.pixelSizeValue = document.getElementById('pixelSizeValue');
        
        this.widthInput = document.getElementById('widthInput');
        this.heightInput = document.getElementById('heightInput');
        this.keepRatioCheckbox = document.getElementById('keepRatioCheckbox');
        
        this.perlerContent = document.getElementById('perlerContent');
        this.colorSetSelect = document.getElementById('colorSetSelect');
        this.colorMappingMethod = document.getElementById('colorMappingMethod');
        this.chartStyle = document.getElementById('chartStyle');
        this.legendPosition = document.getElementById('legendPosition');
        this.beadShape = document.getElementById('beadShape');
        this.beadSizeSlider = document.getElementById('beadSizeSlider');
        this.beadSizeValue = document.getElementById('beadSizeValue');
        this.exportBeadSizeSlider = document.getElementById('exportBeadSizeSlider');
        this.exportBeadSizeValue = document.getElementById('exportBeadSizeValue');
        this.showGridLines = document.getElementById('showGridLines');
        this.showCoordNumbers = document.getElementById('showCoordNumbers');
        this.coordLineColor = document.getElementById('coordLineColor');
        this.coordNumberColor = document.getElementById('coordNumberColor');
        this.showLargeGridLines = document.getElementById('showLargeGridLines');
        this.largeGridLineColor = document.getElementById('largeGridLineColor');
        this.largeGridSize = document.getElementById('largeGridSize');
        this.largeGridLineWidth = document.getElementById('largeGridLineWidth');
        this.watermarkText = document.getElementById('watermarkText');
        
        this.simpleModeBtn = document.getElementById('simpleModeBtn');
        this.advancedModeBtn = document.getElementById('advancedModeBtn');
        
        this.clearBtn = document.getElementById('clearBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.downloadPerlerBtn = document.getElementById('downloadPerlerBtn');
        
        this.presetBtns = document.querySelectorAll('.preset-btn');
        
        this.langZh = document.getElementById('langZh');
        this.langEn = document.getElementById('langEn');
        
        this.enableContrast = document.getElementById('enableContrast');
        this.contrastSlider = document.getElementById('contrastSlider');
        this.contrastValue = document.getElementById('contrastValue');
        
        this.enableSharpen = document.getElementById('enableSharpen');
        this.sharpenSlider = document.getElementById('sharpenSlider');
        this.sharpenValue = document.getElementById('sharpenValue');
        
        this.enableColorQuantize = document.getElementById('enableColorQuantize');
        this.colorCountSlider = document.getElementById('colorCountSlider');
        this.colorCountValue = document.getElementById('colorCountValue');
        this.colorCountInput = document.getElementById('colorCountInput');
        this.imageTotalColors = document.getElementById('imageTotalColors');
        this.colorQuantizePanel = document.getElementById('colorQuantizePanel');
        this.colorUsageList = document.getElementById('colorUsageList');
        this.pixelMethod = document.getElementById('pixelMethod');
        this.targetColorCountSlider = document.getElementById('targetColorCountSlider');
        this.targetColorCountValue = document.getElementById('targetColorCountValue');
        this.targetColorCountInput = document.getElementById('targetColorCountInput');
        this.quantizedPixelControls = document.getElementById('quantizedPixelControls');
        this.enableNeighborSmooth = document.getElementById('enableNeighborSmooth');
        this.showPixelGrid = document.getElementById('showPixelGrid');
        this.pixelGridColor = document.getElementById('pixelGridColor');
        this.pixelGridOffsetX = document.getElementById('pixelGridOffsetX');
        this.pixelGridOffsetY = document.getElementById('pixelGridOffsetY');
        this.pixelGridOffsetXValue = document.getElementById('pixelGridOffsetXValue');
        this.pixelGridOffsetYValue = document.getElementById('pixelGridOffsetYValue');
        
        // 雕刻分裂相关元素
        this.pixelModeBtn = document.getElementById('pixelModeBtn');
        this.carveModeBtn = document.getElementById('carveModeBtn');
        this.carveControls = document.getElementById('carveControls');
        this.initialBlockSizeSlider = document.getElementById('initialBlockSizeSlider');
        this.initialBlockSizeValue = document.getElementById('initialBlockSizeValue');
        this.minBlockSizeSlider = document.getElementById('minBlockSizeSlider');
        this.minBlockSizeValue = document.getElementById('minBlockSizeValue');
        this.showCarveGridCheckbox = document.getElementById('showCarveGrid');
        this.resetCarveBtn = document.getElementById('resetCarveBtn');
        this.splitAllBtn = document.getElementById('splitAllBtn');
        this.mergeSelectedBtn = document.getElementById('mergeSelectedBtn');
        
        this.customEditCanvas = document.getElementById('customEditCanvas');
        this.customEditCtx = this.customEditCanvas.getContext('2d', { willReadFrequently: true });
        this.customEditInfo = document.getElementById('customEditInfo');
        this.customEditColor = document.getElementById('customEditColor');
        this.currentColorValue = document.getElementById('currentColorValue');
        this.customEditBrushSize = document.getElementById('customEditBrushSize');
        this.brushSizeValue = document.getElementById('brushSizeValue');
        this.showCustomEditGrid = document.getElementById('showCustomEditGrid');
        this.applyCustomEditBtn = document.getElementById('applyCustomEditBtn');
        this.undoCustomEditBtn = document.getElementById('undoCustomEditBtn');
        this.eraserColor = document.getElementById('eraserColor');
        this.eraserColorValue = document.getElementById('eraserColorValue');
        this.razorBgColor = document.getElementById('razorBgColor');
        this.razorBgColorValue = document.getElementById('razorBgColorValue');
        this.chainRazorMax = document.getElementById('chainRazorMax');
        this.removeColorPicker = document.getElementById('removeColorPicker');
        this.removeColorValue = document.getElementById('removeColorValue');
        this.pickRemoveColorBtn = document.getElementById('pickRemoveColorBtn');
        this.removeColorBtn = document.getElementById('removeColorBtn');
        this.saveSnapshotBtn = document.getElementById('saveSnapshotBtn');
        this.snapshotsList = document.getElementById('snapshotsList');
        this.snapshotsContainer = document.getElementById('snapshotsContainer');
        this.flipHorizontalBtn = document.getElementById('flipHorizontalBtn');
        this.flipVerticalBtn = document.getElementById('flipVerticalBtn');
        this.exportTransparentBackground = document.getElementById('exportTransparentBackground');
        this.exportPixelImageBtn = document.getElementById('exportPixelImageBtn');
        
        // 悬浮快照按钮和面板
        this.snapshotFloatBtn = document.getElementById('snapshotFloatBtn');
        this.snapshotPanel = document.getElementById('snapshotPanel');
        this.closeSnapshotPanel = document.getElementById('closeSnapshotPanel');
        
        this.customEditData = null;
        this.customEditHistory = [];
        this.lastPerlerSignature = null;
        this.currentEditTool = 'brush';
        this.isDrawing = false;
        this.savedBrushSize = 1; // 保存原始的画笔大小
        this.pickRemoveColorMode = false; // 颜色剔除的取色模式
        
        this.smartOptimizeBtn = document.getElementById('smartOptimizeBtn');
        this.smartOptimizeModal = document.getElementById('smartOptimizeModal');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.toggleFullscreenBtn = document.getElementById('toggleFullscreenBtn');
        this.isFullscreen = false;
        this.optimizationSummary = document.getElementById('optimizationSummary');
        this.suggestionsList = document.getElementById('suggestionsList');
        this.rejectAllBtn = document.getElementById('rejectAllBtn');
        this.applyAllBtn = document.getElementById('applyAllBtn');
        this.confirmBtn = document.getElementById('confirmBtn');
        this.optimizationPreviewCanvas = document.getElementById('optimizationPreviewCanvas');
        this.optimizationPreviewCtx = this.optimizationPreviewCanvas.getContext('2d');
        this.enableColorMerge = document.getElementById('enableColorMerge');
        this.colorMergeThresholdSlider = document.getElementById('colorMergeThresholdSlider');
        this.colorMergeThresholdValue = document.getElementById('colorMergeThresholdValue');
        this.enableEdgeColorMerge = document.getElementById('enableEdgeColorMerge');
        this.edgeColorThresholdSlider = document.getElementById('edgeColorThresholdSlider');
        this.edgeColorThresholdValue = document.getElementById('edgeColorThresholdValue');
        this.regenerateDebounceTimer = null;
        
        this.pixelatedZoomSlider = document.getElementById('pixelatedZoomSlider');
        this.pixelatedZoomValue = document.getElementById('pixelatedZoomValue');
        this.perlerZoomSlider = document.getElementById('perlerZoomSlider');
        this.perlerZoomValue = document.getElementById('perlerZoomValue');
        
        this.pixelatedCanvasNaturalWidth = 0;
        this.pixelatedCanvasNaturalHeight = 0;
        this.perlerCanvasNaturalWidth = 0;
        this.perlerCanvasNaturalHeight = 0;
        this.pixelatedCanvasDisplayWidth = 0;
        this.pixelatedCanvasDisplayHeight = 0;
        this.perlerCanvasDisplayWidth = 0;
        this.perlerCanvasDisplayHeight = 0;
        
        this.colorConvertControls = document.getElementById('colorConvertControls');
        this.colorConvertSourceColor = document.getElementById('colorConvertSourceColor');
        this.colorConvertSourceColorValue = document.getElementById('colorConvertSourceColorValue');
        this.colorConvertTargetColor = document.getElementById('colorConvertTargetColor');
        this.colorConvertTargetColorValue = document.getElementById('colorConvertTargetColorValue');
        this.pickSourceColorBtn = document.getElementById('pickSourceColorBtn');
        this.pickTargetColorBtn = document.getElementById('pickTargetColorBtn');
        this.executeColorConvertBtn = document.getElementById('executeColorConvertBtn');
        
        this.colorConvertPickMode = null;
        
        this.exportScaleSlider = document.getElementById('exportScaleSlider');
        this.exportScaleValue = document.getElementById('exportScaleValue');
        this.exportScaleInput = document.getElementById('exportScaleInput');
        
        this.colorSuggestions = [];
        this.acceptedSuggestions = new Set();
        this.rejectedSuggestions = new Set();
        this.originalPerlerColors = null;
        
        // 画笔工具相关
        this.optimizeBrushSizeSlider = document.getElementById('optimizeBrushSizeSlider');
        this.optimizeBrushSizeValue = document.getElementById('optimizeBrushSizeValue');
        this.brushModeErase = document.getElementById('brushModeErase');
        this.brushModeRestore = document.getElementById('brushModeRestore');
        this.clearErasedBlocksBtn = document.getElementById('clearErasedBlocks');
        this.brushMode = 'erase'; // 'erase' 或 'restore'
        this.erasedBlocks = new Set(); // 存储被取消优化的方块，格式 "x,y"
        this.isDrawing = false;
        this.optimizationCellSize = 0; // 预览图中每个格子的大小
        this.optimizationCanvasWidth = 0;
        this.optimizationCanvasHeight = 0;
        this.brushCursor = document.getElementById('brushCursor');
        this.customEditBrushCursor = document.getElementById('customEditBrushCursor');
        this.customEditCellSize = 0;
        
        // 画布边界调整相关
        this.canvasBoundsLeftInput = document.getElementById('canvasBoundsLeft');
        this.canvasBoundsRightInput = document.getElementById('canvasBoundsRight');
        this.canvasBoundsTopInput = document.getElementById('canvasBoundsTop');
        this.canvasBoundsBottomInput = document.getElementById('canvasBoundsBottom');
        this.canvasBoundsCurrentSize = document.getElementById('canvasBoundsCurrentSize');
        this.canvasBoundsControls = document.getElementById('canvasBoundsControls');
        this.canvasBoundsHandles = document.getElementById('canvasBoundsHandles');
        this.resetCanvasBoundsBtn = document.getElementById('resetCanvasBoundsBtn');
        
        this.canvasBounds = null;
        this.isDraggingCanvasBounds = false;
        this.draggingHandle = null;
        this.optimizeHighlightColor = document.getElementById('optimizeHighlightColor');
        this.optimizeErasedColor = document.getElementById('optimizeErasedColor');
        
        const savedLang = localStorage.getItem('beadMasterLang') || 'zh';
        setLanguage(savedLang);
        
        const displaySize = parseInt(this.beadSizeSlider.value);
        let exportSize = displaySize * 2;
        exportSize = Math.max(12, Math.min(96, exportSize));
        this.exportBeadSizeSlider.value = exportSize;
        this.exportBeadSizeValue.textContent = exportSize + 'px';
        
        this.quantizedPixelControls.style.display = this.pixelMethod.value === 'quantized' ? 'block' : 'none';
    }

    initEventListeners() {
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.loadImage(files[0]);
            }
        });
        
        this.langZh.addEventListener('click', () => setLanguage('zh'));
        this.langEn.addEventListener('click', () => setLanguage('en'));
        
        this.pixelSizeSlider.addEventListener('input', () => {
            this.pixelSizeValue.textContent = this.pixelSizeSlider.value + 'px';
            this.updatePixelatedImage();
        });
        
        this.widthInput.addEventListener('input', () => {
            if (this.keepRatioCheckbox.checked && this.originalWidth > 0) {
                const ratio = this.originalHeight / this.originalWidth;
                this.heightInput.value = Math.round(this.widthInput.value * ratio);
            }
            this.updatePixelatedImage();
        });
        
        this.heightInput.addEventListener('input', () => {
            if (this.keepRatioCheckbox.checked && this.originalHeight > 0) {
                const ratio = this.originalWidth / this.originalHeight;
                this.widthInput.value = Math.round(this.heightInput.value * ratio);
            }
            this.updatePixelatedImage();
        });
        
        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const width = parseInt(btn.dataset.width);
                const height = parseInt(btn.dataset.height);
                this.widthInput.value = width;
                if (this.keepRatioCheckbox.checked && this.originalWidth > 0) {
                    const ratio = this.originalHeight / this.originalWidth;
                    this.heightInput.value = Math.round(width * ratio);
                } else {
                    this.heightInput.value = height;
                }
                this.updatePixelatedImage();
            });
        });
        
        this.colorSetSelect.addEventListener('change', () => this.showPerlerPlaceholder());
        this.showGridLines.addEventListener('change', () => {
            if (Object.keys(this.colorCounts).length > 0) {
                this.refreshPerlerChartDisplay();
            }
        });
        this.showCoordNumbers.addEventListener('change', () => {
            if (Object.keys(this.colorCounts).length > 0) {
                this.refreshPerlerChartDisplay();
            }
        });
        // 注意：颜色选择器（coordLineColor 和 coordNumberColor）不实时渲染，只有点击"渲染拼豆图纸"按钮才会生效
        this.chartStyle.addEventListener('change', () => {
            if (Object.keys(this.colorCounts).length > 0) {
                this.refreshPerlerChartDisplay();
            } else {
                this.showPerlerPlaceholder();
            }
        });
        this.legendPosition.addEventListener('change', () => this.refreshLegendPosition());
        this.beadShape.addEventListener('change', () => {
            if (Object.keys(this.colorCounts).length > 0) {
                this.refreshPerlerChartDisplay();
            }
        });
        this.beadSizeSlider.addEventListener('input', () => {
            const displaySize = parseInt(this.beadSizeSlider.value);
            this.beadSizeValue.textContent = displaySize + 'px';
            
            let exportSize = displaySize * 2;
            exportSize = Math.max(12, Math.min(96, exportSize));
            this.exportBeadSizeSlider.value = exportSize;
            this.exportBeadSizeValue.textContent = exportSize + 'px';
        });
        
        this.exportBeadSizeSlider.addEventListener('input', () => {
            this.exportBeadSizeValue.textContent = this.exportBeadSizeSlider.value + 'px';
        });
        this.renderPerlerBtn = document.getElementById('renderPerlerBtn');
        this.renderPerlerBtn.addEventListener('click', () => this.updatePerlerChart());
        
        this.simpleModeBtn = document.getElementById('simpleModeBtn');
        this.advancedModeBtn = document.getElementById('advancedModeBtn');
        
        this.simpleModeBtn.addEventListener('click', () => {
            this.simpleModeBtn.classList.add('active');
            this.advancedModeBtn.classList.remove('active');
            document.querySelector('.workspace').classList.remove('advanced-mode');
        });
        
        this.advancedModeBtn.addEventListener('click', () => {
            this.advancedModeBtn.classList.add('active');
            this.simpleModeBtn.classList.remove('active');
            document.querySelector('.workspace').classList.add('advanced-mode');
        });
        
        this.enableContrast.addEventListener('change', () => this.updatePixelatedImage());
        this.contrastSlider.addEventListener('input', () => {
            this.contrastValue.textContent = this.contrastSlider.value + 'x';
            this.updatePixelatedImage();
        });
        
        this.enableSharpen.addEventListener('change', () => this.updatePixelatedImage());
        this.sharpenSlider.addEventListener('input', () => {
            this.sharpenValue.textContent = this.sharpenSlider.value;
            this.updatePixelatedImage();
        });
        
        this.enableColorQuantize.addEventListener('change', () => {
            this.colorQuantizePanel.style.display = this.enableColorQuantize.checked ? 'block' : 'none';
            this.updatePixelatedImage();
        });
        this.colorCountSlider.addEventListener('input', () => {
            const value = this.colorCountSlider.value;
            this.colorCountValue.textContent = value;
            this.colorCountInput.value = value;
            this.updatePixelatedImage();
        });
        this.colorCountInput.addEventListener('input', () => {
            let value = parseInt(this.colorCountInput.value);
            if (isNaN(value)) value = 2;
            if (value < 2) value = 2;
            if (value > 291) value = 291;
            this.colorCountValue.textContent = value;
            this.colorCountSlider.value = value;
            this.colorCountInput.value = value;
            this.updatePixelatedImage();
        });
        
        // 雕刻分裂相关事件
        this.pixelModeBtn.addEventListener('click', () => this.setPixelMode(false));
        this.carveModeBtn.addEventListener('click', () => this.setPixelMode(true));
        
        this.initialBlockSizeSlider.addEventListener('input', () => {
            this.initialBlockSizeValue.textContent = this.initialBlockSizeSlider.value + 'px';
            this.initialBlockSize = parseInt(this.initialBlockSizeSlider.value);
            if (this.carveMode) {
                this.resetCarving();
            }
        });
        
        this.minBlockSizeSlider.addEventListener('input', () => {
            this.minBlockSizeValue.textContent = this.minBlockSizeSlider.value + 'px';
            this.minBlockSize = parseInt(this.minBlockSizeSlider.value);
        });
        
        this.initialBlockSizeValue.textContent = '200px';
        this.minBlockSizeValue.textContent = '40px';
        
        this.showCarveGridCheckbox.addEventListener('change', () => {
            this.showCarveGrid = this.showCarveGridCheckbox.checked;
            if (this.carveMode) {
                this.drawCarveBlocks();
            }
        });
        
        this.resetCarveBtn.addEventListener('click', () => this.resetCarving());
        this.splitAllBtn.addEventListener('click', () => this.splitAllBlocks());
        this.mergeSelectedBtn.addEventListener('click', () => this.mergeSelectedBlocks());
        
        this.pixelatedCanvas.addEventListener('click', (e) => this.handleCarveCanvasClick(e));
        
        this.clearBtn.addEventListener('click', () => this.clear());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.downloadPerlerBtn.addEventListener('click', () => this.downloadPerlerChart());
        this.exportPixelImageBtn.addEventListener('click', () => this.exportPixelImage());
        
        this.exportScaleSlider.addEventListener('input', () => {
            const value = parseFloat(this.exportScaleSlider.value);
            this.exportScaleValue.textContent = value + '×';
            this.exportScaleInput.value = value;
        });
        
        this.exportScaleInput.addEventListener('input', () => {
            let value = parseFloat(this.exportScaleInput.value);
            if (isNaN(value)) value = 1;
            value = Math.max(1, Math.min(16, value));
            this.exportScaleInput.value = value;
            this.exportScaleSlider.value = value;
            this.exportScaleValue.textContent = value + '×';
        });
        
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSort = btn.dataset.sort;
                this.updateColorUsageList();
            });
        });
        
        this.pixelMethod.addEventListener('change', () => {
            this.quantizedPixelControls.style.display = this.pixelMethod.value === 'quantized' ? 'block' : 'none';
            this.updatePixelatedImage();
        });
        
        this.targetColorCountSlider.addEventListener('input', () => {
            const value = this.targetColorCountSlider.value;
            this.targetColorCountValue.textContent = value;
            this.targetColorCountInput.value = value;
            this.updatePixelatedImage();
        });
        this.targetColorCountInput.addEventListener('input', () => {
            let value = parseInt(this.targetColorCountInput.value);
            if (isNaN(value)) value = 8;
            if (value < 8) value = 8;
            if (value > 96) value = 96;
            this.targetColorCountValue.textContent = value;
            this.targetColorCountSlider.value = value;
            this.targetColorCountInput.value = value;
            this.updatePixelatedImage();
        });
        
        this.enableNeighborSmooth.addEventListener('change', () => {
            if (Object.keys(this.colorCounts).length > 0) {
                this.updatePerlerChart();
            }
        });
        
        this.showPixelGrid.addEventListener('change', () => this.updatePixelatedImage());
        
        // 优化：直接修改网格线颜色，不需要重新计算像素化
        this.pixelGridColor.addEventListener('input', () => this.updatePixelGridColor());
        
        // 像素划分线偏移调整 - 需要重新计算像素化
        this.pixelGridOffsetX.addEventListener('input', () => {
            this.pixelGridOffsetXValue.textContent = this.pixelGridOffsetX.value + 'px';
            this.updatePixelatedImage();
        });
        this.pixelGridOffsetY.addEventListener('input', () => {
            this.pixelGridOffsetYValue.textContent = this.pixelGridOffsetY.value + 'px';
            this.updatePixelatedImage();
        });
        
        // 像素块大小变化时，调整偏移滑块的最大值
        this.pixelSizeSlider.addEventListener('input', () => {
            const pixelSize = parseInt(this.pixelSizeSlider.value);
            this.pixelGridOffsetX.max = pixelSize - 1;
            this.pixelGridOffsetY.max = pixelSize - 1;
            if (parseInt(this.pixelGridOffsetX.value) >= pixelSize) {
                this.pixelGridOffsetX.value = 0;
                this.pixelGridOffsetXValue.textContent = '0px';
            }
            if (parseInt(this.pixelGridOffsetY.value) >= pixelSize) {
                this.pixelGridOffsetY.value = 0;
                this.pixelGridOffsetYValue.textContent = '0px';
            }
        });
        
        document.querySelectorAll('.edit-tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const newTool = btn.dataset.tool;
                
                // 如果之前是取色器，恢复原始的画笔大小
                if (this.currentEditTool === 'picker' && newTool !== 'picker') {
                    this.customEditBrushSize.value = this.savedBrushSize;
                    this.brushSizeValue.textContent = this.savedBrushSize;
                }
                
                // 如果新工具是取色器，保存当前的画笔大小，然后设置为1
                if (newTool === 'picker' && this.currentEditTool !== 'picker') {
                    this.savedBrushSize = this.customEditBrushSize.value;
                    this.customEditBrushSize.value = 1;
                    this.brushSizeValue.textContent = '1';
                }
                
                document.querySelectorAll('.edit-tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentEditTool = newTool;
                this.colorConvertPickMode = null;
                this.pickSourceColorBtn.classList.remove('color-pick-active');
                this.pickTargetColorBtn.classList.remove('color-pick-active');
                
                // 显示/隐藏颜色转换控制
                if (this.currentEditTool === 'colorConvert') {
                    this.colorConvertControls.style.display = 'block';
                } else {
                    this.colorConvertControls.style.display = 'none';
                }
                
                // 显示/隐藏画布边界控制
                if (this.currentEditTool === 'canvasBounds') {
                    this.canvasBoundsControls.style.display = 'block';
                    this.canvasBoundsHandles.style.display = 'block';
                    this.customEditBrushCursor.style.display = 'none';
                    this.updateCanvasBoundsHandlesPosition();
                } else {
                    this.canvasBoundsControls.style.display = 'none';
                    this.canvasBoundsHandles.style.display = 'none';
                }
                
                // 更新画笔光标
                this.updateCustomEditBrushCursorSize();
            });
        });
        
        this.customEditColor.addEventListener('input', () => {
            this.currentColorValue.textContent = this.customEditColor.value;
        });
        
        this.eraserColor.addEventListener('input', () => {
            this.eraserColorValue.textContent = this.eraserColor.value;
        });
        
        this.razorBgColor.addEventListener('input', () => {
            this.razorBgColorValue.textContent = this.razorBgColor.value;
            this.drawCustomEditCanvas();
        });
        
        this.customEditBrushSize.addEventListener('input', () => {
            this.brushSizeValue.textContent = this.customEditBrushSize.value;
            this.updateCustomEditBrushCursorSize();
        });
        
        this.showCustomEditGrid.addEventListener('change', () => this.drawCustomEditCanvas());
        
        this.applyCustomEditBtn.addEventListener('click', () => this.applyCustomEdit());
        this.undoCustomEditBtn.addEventListener('click', () => this.undoCustomEdit());
        this.saveSnapshotBtn.addEventListener('click', () => this.saveUnifiedSnapshot('custom'));
        this.flipHorizontalBtn.addEventListener('click', () => this.flipImageHorizontal());
        this.flipVerticalBtn.addEventListener('click', () => this.flipImageVertical());
        
        // 颜色剔除功能
        this.removeColorPicker.addEventListener('input', () => {
            this.removeColorValue.textContent = this.removeColorPicker.value;
        });
        
        this.pickRemoveColorBtn.addEventListener('click', () => {
            // 切换到取色模式
            this.currentEditTool = 'picker';
            this.pickRemoveColorMode = true;
            document.querySelectorAll('.edit-tool-btn').forEach(btn => btn.classList.remove('active'));
            // 去掉弹窗，改为在控制台显示
            console.log('请在画布上点击要剔除的颜色');
        });
        
        this.removeColorBtn.addEventListener('click', () => {
            this.removeSelectedColor();
        });
        
        // 悬浮快照面板事件
        this.snapshotFloatBtn.addEventListener('click', () => {
            this.toggleSnapshotPanel();
        });
        
        this.closeSnapshotPanel.addEventListener('click', () => {
            this.closePanel();
        });
        
        // 点击面板外部关闭
        document.addEventListener('click', (e) => {
            if (this.snapshotPanel.classList.contains('show') && 
                !this.snapshotPanel.contains(e.target) && 
                e.target !== this.snapshotFloatBtn && 
                !this.snapshotFloatBtn.contains(e.target)) {
                this.closePanel();
            }
        });
        
        this.colorConvertSourceColor.addEventListener('input', () => {
            this.colorConvertSourceColorValue.textContent = this.colorConvertSourceColor.value;
        });
        
        this.colorConvertTargetColor.addEventListener('input', () => {
            this.colorConvertTargetColorValue.textContent = this.colorConvertTargetColor.value;
        });
        
        this.pickSourceColorBtn.addEventListener('click', () => {
            if (this.colorConvertPickMode === 'source') {
                this.colorConvertPickMode = null;
                this.pickSourceColorBtn.classList.remove('color-pick-active');
            } else {
                this.colorConvertPickMode = 'source';
                this.pickSourceColorBtn.classList.add('color-pick-active');
                this.pickTargetColorBtn.classList.remove('color-pick-active');
            }
        });
        
        this.pickTargetColorBtn.addEventListener('click', () => {
            if (this.colorConvertPickMode === 'target') {
                this.colorConvertPickMode = null;
                this.pickTargetColorBtn.classList.remove('color-pick-active');
            } else {
                this.colorConvertPickMode = 'target';
                this.pickTargetColorBtn.classList.add('color-pick-active');
                this.pickSourceColorBtn.classList.remove('color-pick-active');
            }
        });
        
        this.executeColorConvertBtn.addEventListener('click', () => this.executeColorConvert());
        
        this.initCustomEditCanvasEvents();
        
        this.smartOptimizeBtn.addEventListener('click', () => this.openSmartOptimizeModal());
        this.closeModalBtn.addEventListener('click', () => this.closeSmartOptimizeModal());
        this.toggleFullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.rejectAllBtn.addEventListener('click', () => this.rejectAllSuggestions());
        this.applyAllBtn.addEventListener('click', () => this.acceptAllSuggestions());
        this.confirmBtn.addEventListener('click', () => this.confirmOptimization());
        
        this.enableColorMerge.addEventListener('change', () => this.debouncedRegenerateSuggestions());
        this.colorMergeThresholdSlider.addEventListener('input', () => {
            this.colorMergeThresholdValue.textContent = this.colorMergeThresholdSlider.value + '%';
            this.debouncedRegenerateSuggestions();
        });
        this.enableEdgeColorMerge.addEventListener('change', () => this.debouncedRegenerateSuggestions());
        this.edgeColorThresholdSlider.addEventListener('input', () => {
            this.edgeColorThresholdValue.textContent = this.edgeColorThresholdSlider.value + '%';
            this.debouncedRegenerateSuggestions();
        });
        
        // 画笔工具事件
        this.optimizeBrushSizeSlider.addEventListener('input', () => {
            this.optimizeBrushSizeValue.textContent = this.optimizeBrushSizeSlider.value;
            this.updateBrushCursorSize();
        });
        
        this.brushModeErase.addEventListener('click', () => {
            this.brushMode = 'erase';
            this.brushModeErase.classList.add('active');
            this.brushModeRestore.classList.remove('active');
        });
        
        this.brushModeRestore.addEventListener('click', () => {
            this.brushMode = 'restore';
            this.brushModeRestore.classList.add('active');
            this.brushModeErase.classList.remove('active');
        });
        
        this.clearErasedBlocksBtn.addEventListener('click', () => {
            this.erasedBlocks.clear();
            this.drawOptimizationPreview();
        });
        
        // 颜色选择器事件
        this.optimizeHighlightColor.addEventListener('input', () => {
            this.drawOptimizationPreview();
        });
        
        this.optimizeErasedColor.addEventListener('input', () => {
            this.drawOptimizationPreview();
        });
        
        // 优化预览画布的鼠标事件
        this.initOptimizationPreviewCanvasEvents();
        
        this.pixelatedZoomSlider.addEventListener('input', () => {
            const zoom = this.pixelatedZoomSlider.value;
            this.pixelatedZoomValue.textContent = zoom + '%';
            const scale = zoom / 100;
            if (this.pixelatedCanvasDisplayWidth && this.pixelatedCanvasDisplayHeight) {
                this.pixelatedCanvas.style.width = (this.pixelatedCanvasDisplayWidth * scale) + 'px';
                this.pixelatedCanvas.style.height = (this.pixelatedCanvasDisplayHeight * scale) + 'px';
            }
        });
        
        // 画布边界调整事件
        this.canvasBoundsLeftInput.addEventListener('input', () => {
            if (this.canvasBounds) {
                this.canvasBounds.left = parseInt(this.canvasBoundsLeftInput.value);
                this.updateCanvasBoundsDisplay();
                this.drawCustomEditCanvas();
            }
        });
        
        this.canvasBoundsRightInput.addEventListener('input', () => {
            if (this.canvasBounds) {
                this.canvasBounds.right = parseInt(this.canvasBoundsRightInput.value);
                this.updateCanvasBoundsDisplay();
                this.drawCustomEditCanvas();
            }
        });
        
        this.canvasBoundsTopInput.addEventListener('input', () => {
            if (this.canvasBounds) {
                this.canvasBounds.top = parseInt(this.canvasBoundsTopInput.value);
                this.updateCanvasBoundsDisplay();
                this.drawCustomEditCanvas();
            }
        });
        
        this.canvasBoundsBottomInput.addEventListener('input', () => {
            if (this.canvasBounds) {
                this.canvasBounds.bottom = parseInt(this.canvasBoundsBottomInput.value);
                this.updateCanvasBoundsDisplay();
                this.drawCustomEditCanvas();
            }
        });
        
        this.resetCanvasBoundsBtn.addEventListener('click', () => {
            this.resetCanvasBounds();
        });
        
        // 初始化画布边界拖拽事件
        this.initCanvasBoundsDragEvents();
        
        this.perlerZoomSlider.addEventListener('input', () => {
            const zoom = this.perlerZoomSlider.value;
            this.perlerZoomValue.textContent = zoom + '%';
            const scale = zoom / 100;
            if (this.perlerCanvasDisplayWidth && this.perlerCanvasDisplayHeight) {
                this.perlerCanvas.style.width = (this.perlerCanvasDisplayWidth * scale) + 'px';
                this.perlerCanvas.style.height = (this.perlerCanvasDisplayHeight * scale) + 'px';
            }
        });
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
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
            this.showWorkspace();
            this.drawOriginalImage();
            this.resetInputs();
            this.updatePixelatedImage();
            URL.revokeObjectURL(objectURL);
        };
        
        img.onerror = (error) => {
            console.error('图片加载失败:', error);
            URL.revokeObjectURL(objectURL);
            alert('图片加载失败，请尝试其他图片！');
        };
        
        img.src = objectURL;
    }

    showWorkspace() {
        this.uploadSection.style.display = 'none';
        this.workspace.style.display = 'block';
        this.showPerlerPlaceholder();
    }

    drawOriginalImage() {
        // 设置画布的实际像素尺寸为原始尺寸
        this.originalCanvas.width = this.originalWidth;
        this.originalCanvas.height = this.originalHeight;
        this.originalCtx.drawImage(this.originalImage, 0, 0);
        this.originalImageData = this.originalCtx.getImageData(0, 0, this.originalWidth, this.originalHeight);
        this.originalSize.textContent = `原始尺寸: ${this.originalWidth} × ${this.originalHeight} px`;
        
        // 计算画布的显示尺寸，限制高度为400px，保持宽高比
        const maxDisplayHeight = 400;
        let displayWidth, displayHeight;
        
        if (this.originalHeight > maxDisplayHeight) {
            // 如果原始高度大于最大高度，按比例缩小
            const scale = maxDisplayHeight / this.originalHeight;
            displayWidth = this.originalWidth * scale;
            displayHeight = maxDisplayHeight;
        } else {
            // 否则使用原始尺寸
            displayWidth = this.originalWidth;
            displayHeight = this.originalHeight;
        }
        
        // 设置画布的显示尺寸
        this.originalCanvas.style.width = displayWidth + 'px';
        this.originalCanvas.style.height = displayHeight + 'px';
    }

    resetInputs() {
        this.pixelSizeSlider.value = 16;
        this.pixelSizeValue.textContent = '16px';
        this.widthInput.value = Math.min(this.originalWidth, 512);
        this.heightInput.value = Math.round(Math.min(this.originalWidth, 512) * (this.originalHeight / this.originalWidth));
        this.keepRatioCheckbox.checked = true;
        this.showGridLines.checked = true;
        this.showCoordNumbers.checked = true;
        this.coordLineColor.value = '#000000';
        this.coordNumberColor.value = '#000000';
        this.showLargeGridLines.checked = false;
        this.largeGridLineColor.value = '#8B4513';
        this.largeGridSize.value = '5';
        this.largeGridLineWidth.value = '2';
        this.colorCountSlider.value = 8;
        this.colorCountValue.textContent = '8';
        this.colorCountInput.value = 8;
        this.beadSizeSlider.value = 24;
        this.beadSizeValue.textContent = '24px';
        this.showPixelGrid.checked = true;
        this.pixelGridColor.value = '#000000';
        this.pixelGridOffsetX.value = 0;
        this.pixelGridOffsetY.value = 0;
        this.pixelGridOffsetXValue.textContent = '0px';
        this.pixelGridOffsetYValue.textContent = '0px';
        this.pixelGridOffsetX.max = 15; // 16-1
        this.pixelGridOffsetY.max = 15; // 16-1
        
        this.lastPerlerSignature = null;
        this.unifiedSnapshots = [];
        
        // 重置导出计数器
        this.exportCounter = {
            pixelated: 0,
            perler: 0 
        };
        
        if (this.snapshotsContainer) {
            this.snapshotsContainer.innerHTML = '';
        }
        if (this.snapshotsList) {
            this.snapshotsList.style.display = 'none';
        }
    }

    updatePixelatedImage() {
        const targetWidth = parseInt(this.widthInput.value);
        const targetHeight = parseInt(this.heightInput.value);
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;
        
        // 禁用平滑插值，使用最近邻，避免颜色模糊扩散
        tempCtx.imageSmoothingEnabled = false;
        tempCtx.mozImageSmoothingEnabled = false;
        tempCtx.webkitImageSmoothingEnabled = false;
        tempCtx.msImageSmoothingEnabled = false;
        
        tempCtx.drawImage(this.originalImage, 0, 0, targetWidth, targetHeight);
        
        const imageData = tempCtx.getImageData(0, 0, targetWidth, targetHeight);
        const pixelSize = parseInt(this.pixelSizeSlider.value);
        const method = this.pixelMethod.value;
        const offsetX = parseInt(this.pixelGridOffsetX.value);
        const offsetY = parseInt(this.pixelGridOffsetY.value);
        
        let pixelatedData;
        if (method === 'pixel-art') {
            pixelatedData = pixelArtPixelate(imageData, pixelSize, offsetX, offsetY);
        } else if (method === 'quantized') {
            const targetColorCount = parseInt(this.targetColorCountSlider.value);
            pixelatedData = quantizedPixelate(imageData, pixelSize, targetColorCount, offsetX, offsetY);
        } else if (method === 'majority') {
            pixelatedData = pixelateMajority(imageData, pixelSize, offsetX, offsetY);
        } else {
            pixelatedData = pixelate(imageData, pixelSize, offsetX, offsetY);
        }
        
        if (this.enableContrast.checked) {
            const contrastFactor = parseFloat(this.contrastSlider.value);
            pixelatedData = adjustContrast(pixelatedData, contrastFactor);
        }
        
        if (this.enableSharpen.checked) {
            const sharpenStrength = parseFloat(this.sharpenSlider.value);
            pixelatedData = sharpenImage(pixelatedData, sharpenStrength);
        }
        
        this.pixelColorStats = this.calculateColorStats(pixelatedData);
        const totalColors = this.pixelColorStats.length;
        this.imageTotalColors.textContent = totalColors;
        
        this.colorCountSlider.max = Math.max(2, totalColors);
        this.colorCountInput.max = Math.max(2, totalColors);
        if (parseInt(this.colorCountSlider.value) > totalColors) {
            this.colorCountSlider.value = Math.max(2, totalColors);
            this.colorCountInput.value = this.colorCountSlider.value;
            this.colorCountValue.textContent = this.colorCountSlider.value;
        }
        
        if (this.enableColorQuantize.checked) {
            const colorCount = parseInt(this.colorCountSlider.value);
            // 使用层级替换策略
            pixelatedData = quantizeColors(pixelatedData, colorCount, this.excludedColors, 'layered');
        }
        
        this.pixelatedCanvas.width = targetWidth;
        this.pixelatedCanvas.height = targetHeight;
        this.pixelatedCtx.putImageData(pixelatedData, 0, 0);
        
        // 绘制像素划分线
        if (this.showPixelGrid.checked) {
            const pixelSize = parseInt(this.pixelSizeSlider.value);
            const offsetX = parseInt(this.pixelGridOffsetX.value);
            const offsetY = parseInt(this.pixelGridOffsetY.value);
            this.pixelatedCtx.strokeStyle = this.pixelGridColor.value;
            this.pixelatedCtx.lineWidth = 1;
            this.pixelatedCtx.beginPath();
            
            // 绘制垂直线
            for (let x = offsetX; x < targetWidth; x += pixelSize) {
                if (x > 0) { // 不画边界线
                    this.pixelatedCtx.moveTo(x - 0.5, 0);
                    this.pixelatedCtx.lineTo(x - 0.5, targetHeight);
                }
            }
            
            // 绘制水平线
            for (let y = offsetY; y < targetHeight; y += pixelSize) {
                if (y > 0) { // 不画边界线
                    this.pixelatedCtx.moveTo(0, y - 0.5);
                    this.pixelatedCtx.lineTo(targetWidth, y - 0.5);
                }
            }
            
            this.pixelatedCtx.stroke();
        }
        
        // 保存像素化结果，用于拼豆化
        this.pixelatedData = pixelatedData;
        
        this.pixelatedSize.textContent = `像素化尺寸: ${targetWidth} × ${targetHeight} px`;
        // 计算格子数，向上取整
        const gridWidth = Math.ceil(targetWidth / pixelSize);
        const gridHeight = Math.ceil(targetHeight / pixelSize);
        this.pixelatedGridCount.textContent = `长宽格子比: ${gridWidth} × ${gridHeight}`;
        
        if (this.enableColorQuantize.checked) {
            this.updateColorUsageList();
        }
        
        this.pixelatedCanvasNaturalWidth = targetWidth;
        this.pixelatedCanvasNaturalHeight = targetHeight;
        this.pixelatedCanvas.style.width = 'auto';
        this.pixelatedCanvas.style.height = 'auto';
        
        requestAnimationFrame(() => {
            this.pixelatedCanvasDisplayWidth = this.pixelatedCanvas.offsetWidth;
            this.pixelatedCanvasDisplayHeight = this.pixelatedCanvas.offsetHeight;
        });
        
        this.pixelatedZoomSlider.value = 100;
        this.pixelatedZoomValue.textContent = '100%';
        
        this.showPerlerPlaceholder();
    }
    
    updatePixelGridColor() {
        if (!this.pixelatedData) {
            return;
        }
        
        const targetWidth = this.pixelatedCanvasNaturalWidth;
        const targetHeight = this.pixelatedCanvasNaturalHeight;
        const pixelSize = parseInt(this.pixelSizeSlider.value);
        const offsetX = parseInt(this.pixelGridOffsetX.value);
        const offsetY = parseInt(this.pixelGridOffsetY.value);
        
        // 先恢复原始像素化数据
        this.pixelatedCtx.putImageData(this.pixelatedData, 0, 0);
        
        // 如果不显示网格线，直接返回
        if (!this.showPixelGrid.checked) {
            return;
        }
        
        // 再绘制新颜色的网格线
        this.pixelatedCtx.strokeStyle = this.pixelGridColor.value;
        this.pixelatedCtx.lineWidth = 1;
        this.pixelatedCtx.beginPath();
        
        // 绘制垂直线
        for (let x = offsetX; x < targetWidth; x += pixelSize) {
            if (x > 0) { // 不画边界线
                this.pixelatedCtx.moveTo(x - 0.5, 0);
                this.pixelatedCtx.lineTo(x - 0.5, targetHeight);
            }
        }
        
        // 绘制水平线
        for (let y = offsetY; y < targetHeight; y += pixelSize) {
            if (y > 0) { // 不画边界线
                this.pixelatedCtx.moveTo(0, y - 0.5);
                this.pixelatedCtx.lineTo(targetWidth, y - 0.5);
            }
        }
        
        this.pixelatedCtx.stroke();
    }

    resetPerlerZoom() {
        this.perlerZoomSlider.value = 100;
        this.perlerZoomValue.textContent = '100%';
        this.perlerCanvas.style.width = 'auto';
        this.perlerCanvas.style.height = 'auto';
        
        requestAnimationFrame(() => {
            this.perlerCanvasDisplayWidth = this.perlerCanvas.offsetWidth;
            this.perlerCanvasDisplayHeight = this.perlerCanvas.offsetHeight;
        });
    }

    calculateColorStats(imageData) {
        const data = imageData.data;
        const colorMap = new Map();
        const totalPixels = imageData.width * imageData.height;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const key = `${r},${g},${b}`;
            
            if (!colorMap.has(key)) {
                colorMap.set(key, { r, g, b, count: 0 });
            }
            colorMap.get(key).count++;
        }
        
        return Array.from(colorMap.values()).map(color => ({
            ...color,
            percentage: ((color.count / totalPixels) * 100).toFixed(2)
        }));
    }

    updateColorUsageList() {
        if (!this.pixelColorStats.length) {
            this.colorUsageList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无颜色数据</p>';
            return;
        }
        
        let sortedColors = [...this.pixelColorStats];
        
        switch (this.currentSort) {
            case 'count-desc':
                sortedColors.sort((a, b) => b.count - a.count);
                break;
            case 'count-asc':
                sortedColors.sort((a, b) => a.count - b.count);
                break;
            case 'hue':
                sortedColors.sort((a, b) => {
                    const hslA = rgbToHsl(a.r, a.g, a.b);
                    const hslB = rgbToHsl(b.r, b.g, b.b);
                    return hslA[0] - hslB[0];
                });
                break;
        }
        
        const html = sortedColors.map((color, index) => {
            const colorKey = `${color.r},${color.g},${color.b}`;
            const isExcluded = this.excludedColors.has(colorKey);
            return `
                <div class="color-usage-item ${isExcluded ? 'excluded' : ''}" data-color="${colorKey}">
                    <div class="color-swatch" style="background-color: rgb(${color.r}, ${color.g}, ${color.b});"></div>
                    <div class="color-info">
                        <div>
                            <span class="color-count">${color.count}</span>
                            <span class="color-percentage">(${color.percentage}%)</span>
                        </div>
                        <div class="color-rgb">RGB(${color.r}, ${color.g}, ${color.b})</div>
                    </div>
                    <button class="color-action-btn remove" data-color="${colorKey}" data-i18n="remove">
                        ${isExcluded ? '恢复' : '排除'}
                    </button>
                </div>
            `;
        }).join('');
        
        this.colorUsageList.innerHTML = html;
        
        this.colorUsageList.querySelectorAll('.color-action-btn.remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const colorKey = btn.dataset.color;
                if (this.excludedColors.has(colorKey)) {
                    this.excludedColors.delete(colorKey);
                } else {
                    this.excludedColors.add(colorKey);
                }
                this.updatePixelatedImage();
            });
        });
    }

    showPerlerPlaceholder() {
        this.perlerCtx.clearRect(0, 0, this.perlerCanvas.width, this.perlerCanvas.height);
        this.perlerCtx.fillStyle = '#f0f0f0';
        this.perlerCtx.fillRect(0, 0, this.perlerCanvas.width, this.perlerCanvas.height);
        this.perlerCtx.fillStyle = '#666';
        this.perlerCtx.font = '14px sans-serif';
        this.perlerCtx.textAlign = 'center';
        this.perlerCtx.fillText('点击"渲染拼豆图纸"按钮生成图纸', this.perlerCanvas.width / 2, this.perlerCanvas.height / 2);
        this.perlerSize.textContent = '拼豆尺寸: 等待渲染';
    }

    refreshPerlerChartDisplay() {
        if (!this.perlerColors || !this.perlerColors.length) return;
        this.drawPerlerChartSync(this.perlerColors, this.perlerWidth, this.perlerHeight, this.colorSetSelect.value);
    }

    updatePerlerChart() {
        const targetWidth = parseInt(this.widthInput.value);
        const targetHeight = parseInt(this.heightInput.value);
        const pixelSize = parseInt(this.pixelSizeSlider.value);
        
        const perlerWidth = Math.ceil(targetWidth / pixelSize);
        const perlerHeight = Math.ceil(targetHeight / pixelSize);
        
        const colorSetName = this.colorSetSelect.value;
        const colorSet = colorSets[colorSetName];
        const mappingMethod = this.colorMappingMethod.value;
        
        // 直接使用保存的像素化结果，避免Canvas缩放丢失
        let processedData;
        if (!this.pixelatedData) {
            // 回退方案
            const smallCanvas = document.createElement('canvas');
            const smallCtx = smallCanvas.getContext('2d');
            smallCanvas.width = perlerWidth;
            smallCanvas.height = perlerHeight;
            
            // 禁用平滑插值，使用最近邻，避免颜色模糊扩散
            smallCtx.imageSmoothingEnabled = false;
            smallCtx.mozImageSmoothingEnabled = false;
            smallCtx.webkitImageSmoothingEnabled = false;
            smallCtx.msImageSmoothingEnabled = false;
            
            smallCtx.drawImage(this.pixelatedCanvas, 0, 0, perlerWidth, perlerHeight);
            
            processedData = smallCtx.getImageData(0, 0, perlerWidth, perlerHeight);
        } else {
            // 直接从pixelatedData计算，更准确
            processedData = new ImageData(perlerWidth, perlerHeight);
            const pixelSize = parseInt(this.pixelSizeSlider.value);
            
            for (let y = 0; y < perlerHeight; y++) {
                for (let x = 0; x < perlerWidth; x++) {
                    const srcX = Math.min(Math.floor(x * pixelSize), this.pixelatedData.width - 1);
                    const srcY = Math.min(Math.floor(y * pixelSize), this.pixelatedData.height - 1);
                    const srcIndex = (srcY * this.pixelatedData.width + srcX) * 4;
                    const dstIndex = (y * perlerWidth + x) * 4;
                    
                    processedData.data[dstIndex] = this.pixelatedData.data[srcIndex];
                    processedData.data[dstIndex + 1] = this.pixelatedData.data[srcIndex + 1];
                    processedData.data[dstIndex + 2] = this.pixelatedData.data[srcIndex + 2];
                    processedData.data[dstIndex + 3] = this.pixelatedData.data[srcIndex + 3];
                }
            }
        }
        
        this.colorCounts = {};
        this.perlerColors = [];
        
        const transparentColor = {
            name: '',
            rgb: [255, 255, 255],
            isTransparent: true
        };
        
        for (let y = 0; y < perlerHeight; y++) {
            const row = [];
            for (let x = 0; x < perlerWidth; x++) {
                const index = (y * perlerWidth + x) * 4;
                const r = processedData.data[index];
                const g = processedData.data[index + 1];
                const b = processedData.data[index + 2];
                const a = processedData.data[index + 3];
                
                let closestColor;
                if (a < 128) {
                    closestColor = transparentColor;
                } else {
                    closestColor = findClosestColor([r, g, b], colorSet, mappingMethod);
                    if (this.colorCounts[closestColor.name]) {
                        this.colorCounts[closestColor.name]++;
                    } else {
                        this.colorCounts[closestColor.name] = 1;
                    }
                }
                row.push(closestColor);
            }
            this.perlerColors.push(row);
        }
        
        if (this.enableNeighborSmooth.checked) {
            this.perlerColors = mapWithNeighborConsistencyOnMatrix(this.perlerColors, colorSet);
            
            this.colorCounts = {};
            for (let y = 0; y < perlerHeight; y++) {
                for (let x = 0; x < perlerWidth; x++) {
                    const color = this.perlerColors[y][x];
                    if (this.colorCounts[color.name]) {
                        this.colorCounts[color.name]++;
                    } else {
                        this.colorCounts[color.name] = 1;
                    }
                }
            }
        }
        
        this.drawPerlerChart(this.perlerColors, perlerWidth, perlerHeight, colorSetName);
        this.perlerSize.textContent = `${getI18nText('perlerSize')}: ${perlerWidth} × ${perlerHeight} ${getI18nText('beans')}`;
        this.initCustomEditData();
    }

    drawPerlerChart(perlerColors, perlerWidth, perlerHeight, colorSetName) {
        const cellSize = parseInt(this.beadSizeSlider.value);
        const coordSize = Math.max(30, Math.floor(cellSize * 1.4));
        const footerSize = 25;
        
        this.perlerCanvas.width = coordSize * 2 + perlerWidth * cellSize;
        this.perlerCanvas.height = coordSize * 2 + perlerHeight * cellSize + footerSize;
        this.perlerCanvasNaturalWidth = this.perlerCanvas.width;
        this.perlerCanvasNaturalHeight = this.perlerCanvas.height;
        this.perlerCanvas.style.width = 'auto';
        this.perlerCanvas.style.height = 'auto';
        
        requestAnimationFrame(() => {
            this.perlerCanvasDisplayWidth = this.perlerCanvas.offsetWidth;
            this.perlerCanvasDisplayHeight = this.perlerCanvas.offsetHeight;
        });
        
        const ctx = this.perlerCtx;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.perlerCanvas.width, this.perlerCanvas.height);
        
        this.drawPerlerChartAsync(perlerColors, perlerWidth, perlerHeight, colorSetName);
    }
    
    updatePerlerSummary(perlerWidth, perlerHeight, colorSetName) {
        const totalBeads = perlerWidth * perlerHeight;
        const summaryText = `[${perlerWidth}x${perlerHeight}/${totalBeads}颗/${colorSetName}]`;
        const perlerSummaryElement = document.getElementById('perlerSummary');
        if (perlerSummaryElement) {
            perlerSummaryElement.textContent = summaryText;
        }
        
        // 更新水印
        const perlerWatermarkElement = document.getElementById('perlerWatermark');
        if (perlerWatermarkElement) {
            perlerWatermarkElement.textContent = this.watermarkText.value;
        }
    }
    
    drawPerlerChartToCanvas(ctx, perlerColors, perlerWidth, perlerHeight, cellSize, colorSetName) {
        const coordSize = Math.max(30, Math.floor(cellSize * 1.4));
        const footerSize = 25;
        const summaryMargin = cellSize * 2 + 20; // 给摘要留出额外空间
        const chartStyle = this.chartStyle.value;
        const beadShape = this.beadShape.value;
        const showGrid = this.showGridLines.checked;
        const showCoords = this.showCoordNumbers.checked;
        const coordColor = this.coordLineColor.value;
        const coordNumColor = this.coordNumberColor.value;
        
        const canvasWidth = coordSize * 2 + perlerWidth * cellSize;
        const canvasHeight = summaryMargin + coordSize * 2 + perlerHeight * cellSize + footerSize;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        const drawFooter = () => {
            ctx.font = '11px sans-serif';
            ctx.fillStyle = '#999';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const footerY = summaryMargin + coordSize * 2 + perlerHeight * cellSize + footerSize / 2;
            ctx.fillText(this.watermarkText.value, canvasWidth / 2, footerY);
        };
        
        const fontSizeCoord = Math.max(9, Math.floor(cellSize * 0.45));
        ctx.font = `${fontSizeCoord}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (showCoords) {
            ctx.fillStyle = coordNumColor;
            
            // 上面编号
            for (let x = 0; x < perlerWidth; x++) {
                ctx.fillText(x + 1, coordSize + x * cellSize + cellSize / 2, summaryMargin + coordSize / 2);
            }
            
            // 左边编号
            for (let y = 0; y < perlerHeight; y++) {
                ctx.fillText(y + 1, coordSize / 2, summaryMargin + coordSize + y * cellSize + cellSize / 2);
            }
            
            // 右边编号
            const rightCoordX = coordSize + perlerWidth * cellSize + coordSize / 2;
            for (let y = 0; y < perlerHeight; y++) {
                ctx.fillText(y + 1, rightCoordX, summaryMargin + coordSize + y * cellSize + cellSize / 2);
            }
            
            // 下面编号
            const bottomCoordY = summaryMargin + coordSize + perlerHeight * cellSize + coordSize / 2;
            for (let x = 0; x < perlerWidth; x++) {
                ctx.fillText(x + 1, coordSize + x * cellSize + cellSize / 2, bottomCoordY);
            }
        }
        
        if (showGrid) {
            ctx.strokeStyle = coordColor;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            
            for (let x = 0; x <= perlerWidth; x++) {
                ctx.moveTo(coordSize + x * cellSize, summaryMargin + coordSize);
                ctx.lineTo(coordSize + x * cellSize, summaryMargin + coordSize + perlerHeight * cellSize);
            }
            
            for (let y = 0; y <= perlerHeight; y++) {
                ctx.moveTo(coordSize, summaryMargin + coordSize + y * cellSize);
                ctx.lineTo(coordSize + perlerWidth * cellSize, summaryMargin + coordSize + y * cellSize);
            }
            
            ctx.stroke();
        }
        
        // 绘制大格子线
        if (this.showLargeGridLines.checked) {
            const largeGridSize = parseInt(this.largeGridSize.value);
            if (largeGridSize > 0) {
                ctx.strokeStyle = this.largeGridLineColor.value;
                ctx.lineWidth = parseFloat(this.largeGridLineWidth.value); // 自定义粗度
                ctx.beginPath();
                
                // 绘制垂直大格子线
                for (let x = 0; x <= perlerWidth; x += largeGridSize) {
                    ctx.moveTo(coordSize + x * cellSize, summaryMargin + coordSize);
                    ctx.lineTo(coordSize + x * cellSize, summaryMargin + coordSize + perlerHeight * cellSize);
                }
                
                // 绘制水平大格子线
                for (let y = 0; y <= perlerHeight; y += largeGridSize) {
                    ctx.moveTo(coordSize, summaryMargin + coordSize + y * cellSize);
                    ctx.lineTo(coordSize + perlerWidth * cellSize, summaryMargin + coordSize + y * cellSize);
                }
                
                ctx.stroke();
            }
        }
        
        for (let y = 0; y < perlerHeight; y++) {
            for (let x = 0; x < perlerWidth; x++) {
                const color = perlerColors[y][x];
                const px = coordSize + x * cellSize;
                const py = summaryMargin + coordSize + y * cellSize;
                
                if (color.isTransparent) {
                    ctx.fillStyle = '#ffffff';
                    if (beadShape === 'circle') {
                        ctx.beginPath();
                        ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
                    }
                    continue;
                }
                
                const nameLen = color.name.length;
                let fontSizeBase = Math.max(6, Math.floor(cellSize * 0.45));
                let fontSize = fontSizeBase;
                if (nameLen === 1) {
                    fontSize = Math.floor(fontSizeBase * 1.1);
                } else if (nameLen === 2) {
                    fontSize = fontSizeBase;
                } else if (nameLen === 3) {
                    fontSize = Math.floor(fontSizeBase * 0.85);
                } else {
                    fontSize = Math.floor(fontSizeBase * 0.7);
                }
                
                if (beadShape === 'circle') {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                    ctx.clip();
                    
                    if (chartStyle === 'color') {
                        ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                        ctx.fillRect(px, py, cellSize, cellSize);
                    } else if (chartStyle === 'color-with-code') {
                        ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                        ctx.fillRect(px, py, cellSize, cellSize);
                        ctx.fillStyle = getContrastTextColor(color.rgb);
                        ctx.font = `bold ${fontSize}px sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(color.name, px + cellSize / 2, py + cellSize / 2);
                    } else {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(px, py, cellSize, cellSize);
                        ctx.strokeStyle = '#999';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        ctx.fillStyle = '#333';
                        ctx.font = `${fontSize}px sans-serif`;
                        ctx.fillText(color.name, px + cellSize / 2, py + cellSize / 2);
                    }
                    
                    ctx.restore();
                    
                    ctx.beginPath();
                    ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                    ctx.strokeStyle = '#ddd';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                } else {
                    if (chartStyle === 'color') {
                        ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                        ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
                    } else if (chartStyle === 'color-with-code') {
                        ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                        ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
                        ctx.fillStyle = getContrastTextColor(color.rgb);
                        ctx.font = `bold ${fontSize}px sans-serif`;
                        ctx.fillText(color.name, px + cellSize / 2, py + cellSize / 2);
                    } else {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
                        ctx.strokeStyle = '#999';
                        ctx.strokeRect(px, py, cellSize - 1, cellSize - 1);
                        ctx.fillStyle = '#333';
                        ctx.font = `${fontSize}px sans-serif`;
                        ctx.fillText(color.name, px + cellSize / 2, py + cellSize / 2);
                    }
                }
            }
        }
        
        // 在导出的图像上绘制摘要（放在顶部预留空间）
        const totalBeads = perlerWidth * perlerHeight;
        const summaryText = `[${perlerWidth}x${perlerHeight}/${totalBeads}颗/${colorSetName}]`;
        const summaryFontSize = cellSize * 1.3;
        
        // 绘制水印（靠左）
        const watermarkFontSize = cellSize * 0.8;
        ctx.font = `${watermarkFontSize}px sans-serif`;
        ctx.fillStyle = '#666'; // 黑灰色
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        const summaryY = summaryMargin / 2; // 垂直居中放在顶部预留空间
        ctx.fillText(this.watermarkText.value, coordSize + 10, summaryY);
        
        // 绘制摘要（靠右）
        ctx.font = `bold ${summaryFontSize}px sans-serif`;
        ctx.fillStyle = '#333';
        ctx.textAlign = 'right';
        
        const summaryX = coordSize + perlerWidth * cellSize;
        ctx.fillText(summaryText, summaryX - 10, summaryY);
        
        // 不再绘制底部水印
        // drawFooter();
    }
    
    drawPerlerChartAsync(perlerColors, perlerWidth, perlerHeight, colorSetName) {
        this.updatePerlerSummary(perlerWidth, perlerHeight, colorSetName);
        const cellSize = parseInt(this.beadSizeSlider.value);
        const coordSize = Math.max(30, Math.floor(cellSize * 1.4));
        const footerSize = 25;
        const chartStyle = this.chartStyle.value;
        const beadShape = this.beadShape.value;
        const showGrid = this.showGridLines.checked;
        const showCoords = this.showCoordNumbers.checked;
        const coordColor = this.coordLineColor.value;
        const coordNumColor = this.coordNumberColor.value;
        const ctx = this.perlerCtx;
        
        const fontSizeCoord = Math.max(9, Math.floor(cellSize * 0.45));
        ctx.font = `${fontSizeCoord}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (showCoords) {
            ctx.fillStyle = coordNumColor;
            
            // 上面编号
            for (let x = 0; x < perlerWidth; x++) {
                ctx.fillText(x + 1, coordSize + x * cellSize + cellSize / 2, coordSize / 2);
            }
            
            // 左边编号
            for (let y = 0; y < perlerHeight; y++) {
                ctx.fillText(y + 1, coordSize / 2, coordSize + y * cellSize + cellSize / 2);
            }
            
            // 右边编号
            const rightCoordX = coordSize + perlerWidth * cellSize + coordSize / 2;
            for (let y = 0; y < perlerHeight; y++) {
                ctx.fillText(y + 1, rightCoordX, coordSize + y * cellSize + cellSize / 2);
            }
            
            // 下面编号
            const bottomCoordY = coordSize + perlerHeight * cellSize + coordSize / 2;
            for (let x = 0; x < perlerWidth; x++) {
                ctx.fillText(x + 1, coordSize + x * cellSize + cellSize / 2, bottomCoordY);
            }
        }
        
        if (showGrid) {
            ctx.strokeStyle = coordColor;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            
            for (let x = 0; x <= perlerWidth; x++) {
                ctx.moveTo(coordSize + x * cellSize, coordSize);
                ctx.lineTo(coordSize + x * cellSize, coordSize + perlerHeight * cellSize);
            }
            
            for (let y = 0; y <= perlerHeight; y++) {
                ctx.moveTo(coordSize, coordSize + y * cellSize);
                ctx.lineTo(coordSize + perlerWidth * cellSize, coordSize + y * cellSize);
            }
            
            ctx.stroke();
        }
        
        // 绘制大格子线
        if (this.showLargeGridLines.checked) {
            const largeGridSize = parseInt(this.largeGridSize.value);
            if (largeGridSize > 0) {
                ctx.strokeStyle = this.largeGridLineColor.value;
                ctx.lineWidth = parseFloat(this.largeGridLineWidth.value); // 自定义粗度
                ctx.beginPath();
                
                // 绘制垂直大格子线
                for (let x = 0; x <= perlerWidth; x += largeGridSize) {
                    ctx.moveTo(coordSize + x * cellSize, coordSize);
                    ctx.lineTo(coordSize + x * cellSize, coordSize + perlerHeight * cellSize);
                }
                
                // 绘制水平大格子线
                for (let y = 0; y <= perlerHeight; y += largeGridSize) {
                    ctx.moveTo(coordSize, coordSize + y * cellSize);
                    ctx.lineTo(coordSize + perlerWidth * cellSize, coordSize + y * cellSize);
                }
                
                ctx.stroke();
            }
        }
        
        // 绘制大格子线
        if (this.showLargeGridLines.checked) {
            const largeGridSize = parseInt(this.largeGridSize.value);
            if (largeGridSize > 0) {
                ctx.strokeStyle = this.largeGridLineColor.value;
                ctx.lineWidth = parseFloat(this.largeGridLineWidth.value); // 自定义粗度
                ctx.beginPath();
                
                // 绘制垂直大格子线
                for (let x = 0; x <= perlerWidth; x += largeGridSize) {
                    ctx.moveTo(coordSize + x * cellSize, coordSize);
                    ctx.lineTo(coordSize + x * cellSize, coordSize + perlerHeight * cellSize);
                }
                
                // 绘制水平大格子线
                for (let y = 0; y <= perlerHeight; y += largeGridSize) {
                    ctx.moveTo(coordSize, coordSize + y * cellSize);
                    ctx.lineTo(coordSize + perlerWidth * cellSize, coordSize + y * cellSize);
                }
                
                ctx.stroke();
            }
        }
        
        const blockSize = 10;
        const totalBlocksX = Math.ceil(perlerWidth / blockSize);
        const totalBlocksY = Math.ceil(perlerHeight / blockSize);
        let currentBlockX = 0;
        let currentBlockY = 0;
        
        this.drawColorLegend();
        
        const drawFooter = () => {
            ctx.font = '11px sans-serif';
            ctx.fillStyle = '#999';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const footerY = coordSize * 2 + perlerHeight * cellSize + footerSize / 2;
            ctx.fillText(this.watermarkText.value, this.perlerCanvas.width / 2, footerY);
        };
        
        const drawBlock = () => {
            const startX = currentBlockX * blockSize;
            const startY = currentBlockY * blockSize;
            const endX = Math.min(startX + blockSize, perlerWidth);
            const endY = Math.min(startY + blockSize, perlerHeight);
            
            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    const color = perlerColors[y][x];
                    const px = coordSize + x * cellSize;
                    const py = coordSize + y * cellSize;
                    
                    if (color.isTransparent) {
                        ctx.fillStyle = '#ffffff';
                        if (beadShape === 'circle') {
                            ctx.beginPath();
                            ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                            ctx.fill();
                        } else {
                            ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
                        }
                        continue;
                    }
                    
                    const nameLen = color.name.length;
                    let fontSizeBase = Math.max(6, Math.floor(cellSize * 0.45));
                    let fontSize = fontSizeBase;
                    if (nameLen === 1) {
                        fontSize = Math.floor(fontSizeBase * 1.1);
                    } else if (nameLen === 2) {
                        fontSize = fontSizeBase;
                    } else if (nameLen === 3) {
                        fontSize = Math.floor(fontSizeBase * 0.85);
                    } else {
                        fontSize = Math.floor(fontSizeBase * 0.7);
                    }
                    
                    if (beadShape === 'circle') {
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                        ctx.clip();
                        
                        if (chartStyle === 'color') {
                            ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                            ctx.fillRect(px, py, cellSize, cellSize);
                        } else if (chartStyle === 'color-with-code') {
                            ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                            ctx.fillRect(px, py, cellSize, cellSize);
                            ctx.fillStyle = getContrastTextColor(color.rgb);
                            ctx.font = `bold ${fontSize}px sans-serif`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(color.name, px + cellSize / 2, py + cellSize / 2);
                        } else {
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(px, py, cellSize, cellSize);
                            ctx.strokeStyle = '#999';
                            ctx.lineWidth = 1;
                            ctx.stroke();
                            ctx.fillStyle = '#333';
                            ctx.font = `${fontSize}px sans-serif`;
                            ctx.fillText(color.name, px + cellSize / 2, py + cellSize / 2);
                        }
                        
                        ctx.restore();
                        
                        ctx.beginPath();
                        ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                        ctx.strokeStyle = '#ddd';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    } else {
                        if (chartStyle === 'color') {
                            ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                            ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
                        } else if (chartStyle === 'color-with-code') {
                            ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                            ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
                            ctx.fillStyle = getContrastTextColor(color.rgb);
                            ctx.font = `bold ${fontSize}px sans-serif`;
                            ctx.fillText(color.name, px + cellSize / 2, py + cellSize / 2);
                        } else {
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
                            ctx.strokeStyle = '#999';
                            ctx.strokeRect(px, py, cellSize - 1, cellSize - 1);
                            ctx.fillStyle = '#333';
                            ctx.font = `${fontSize}px sans-serif`;
                            ctx.fillText(color.name, px + cellSize / 2, py + cellSize / 2);
                        }
                    }
                }
            }
            
            currentBlockX++;
            if (currentBlockX >= totalBlocksX) {
                currentBlockX = 0;
                currentBlockY++;
            }
            
            if (currentBlockY < totalBlocksY) {
                requestAnimationFrame(drawBlock);
            } else {
                this.drawColorLegend();
                drawFooter();
                this.resetPerlerZoom();
            }
        };
        
        if (totalBlocksX * totalBlocksY > 1) {
            requestAnimationFrame(drawBlock);
        } else {
            for (let y = 0; y < perlerHeight; y++) {
                for (let x = 0; x < perlerWidth; x++) {
                    const color = perlerColors[y][x];
                    const px = coordSize + x * cellSize;
                    const py = coordSize + y * cellSize;
                    
                    const nameLen = color.name.length;
                    let fontSizeBase = Math.max(6, Math.floor(cellSize * 0.45));
                    let fontSize = fontSizeBase;
                    if (nameLen === 1) {
                        fontSize = Math.floor(fontSizeBase * 1.1);
                    } else if (nameLen === 2) {
                        fontSize = fontSizeBase;
                    } else if (nameLen === 3) {
                        fontSize = Math.floor(fontSizeBase * 0.85);
                    } else {
                        fontSize = Math.floor(fontSizeBase * 0.7);
                    }
                    
                    if (beadShape === 'circle') {
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                        ctx.clip();
                        
                        if (chartStyle === 'color') {
                            ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                            ctx.fillRect(px, py, cellSize, cellSize);
                        } else if (chartStyle === 'color-with-code') {
                            ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                            ctx.fillRect(px, py, cellSize, cellSize);
                            ctx.fillStyle = getContrastTextColor(color.rgb);
                            ctx.font = `bold ${fontSize}px sans-serif`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(color.name, px + cellSize / 2, py + cellSize / 2);
                        } else {
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(px, py, cellSize, cellSize);
                            ctx.strokeStyle = '#999';
                            ctx.lineWidth = 1;
                            ctx.stroke();
                            ctx.fillStyle = '#333';
                            ctx.font = `${fontSize}px sans-serif`;
                            ctx.fillText(color.name, px + cellSize / 2, py + cellSize / 2);
                        }
                        
                        ctx.restore();
                        
                        ctx.beginPath();
                        ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                        ctx.strokeStyle = '#ddd';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    } else {
                        if (chartStyle === 'color') {
                            ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                            ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
                        } else if (chartStyle === 'color-with-code') {
                            ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                            ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
                            ctx.fillStyle = getContrastTextColor(color.rgb);
                            ctx.font = `bold ${fontSize}px sans-serif`;
                            ctx.fillText(color.name, px + cellSize / 2, py + cellSize / 2);
                        } else {
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
                            ctx.strokeStyle = '#999';
                            ctx.strokeRect(px, py, cellSize - 1, cellSize - 1);
                            ctx.fillStyle = '#333';
                            ctx.font = `${fontSize}px sans-serif`;
                            ctx.fillText(color.name, px + cellSize / 2, py + cellSize / 2);
                        }
                    }
                }
            }
        }
        this.drawColorLegend();
        // 不再绘制底部水印，改为在顶部显示
        // drawFooter();
        this.resetPerlerZoom();
    }

    drawPerlerChartSync(perlerColors, perlerWidth, perlerHeight, colorSetName) {
        this.updatePerlerSummary(perlerWidth, perlerHeight, colorSetName);
        const cellSize = parseInt(this.beadSizeSlider.value);
        const coordSize = Math.max(30, Math.floor(cellSize * 1.4));
        const footerSize = 25;
        const chartStyle = this.chartStyle.value;
        const beadShape = this.beadShape.value;
        const showGrid = this.showGridLines.checked;
        const showCoords = this.showCoordNumbers.checked;
        const coordColor = this.coordLineColor.value;
        const coordNumColor = this.coordNumberColor.value;
        
        this.perlerCanvas.width = coordSize * 2 + perlerWidth * cellSize;
        this.perlerCanvas.height = coordSize * 2 + perlerHeight * cellSize + footerSize;
        this.perlerCanvasNaturalWidth = this.perlerCanvas.width;
        this.perlerCanvasNaturalHeight = this.perlerCanvas.height;
        this.perlerCanvas.style.width = 'auto';
        this.perlerCanvas.style.height = 'auto';
        
        requestAnimationFrame(() => {
            this.perlerCanvasDisplayWidth = this.perlerCanvas.offsetWidth;
            this.perlerCanvasDisplayHeight = this.perlerCanvas.offsetHeight;
        });
        
        const ctx = this.perlerCtx;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.perlerCanvas.width, this.perlerCanvas.height);
        
        const drawFooter = () => {
            ctx.font = '11px sans-serif';
            ctx.fillStyle = '#999';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const footerY = coordSize * 2 + perlerHeight * cellSize + footerSize / 2;
            ctx.fillText(this.watermarkText.value, this.perlerCanvas.width / 2, footerY);
        };
        
        const fontSizeCoord = Math.max(9, Math.floor(cellSize * 0.45));
        ctx.font = `${fontSizeCoord}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (showCoords) {
            ctx.fillStyle = coordNumColor;
            
            // 上面编号
            for (let x = 0; x < perlerWidth; x++) {
                ctx.fillText(x + 1, coordSize + x * cellSize + cellSize / 2, coordSize / 2);
            }
            
            // 左边编号
            for (let y = 0; y < perlerHeight; y++) {
                ctx.fillText(y + 1, coordSize / 2, coordSize + y * cellSize + cellSize / 2);
            }
            
            // 右边编号
            const rightCoordX = coordSize + perlerWidth * cellSize + coordSize / 2;
            for (let y = 0; y < perlerHeight; y++) {
                ctx.fillText(y + 1, rightCoordX, coordSize + y * cellSize + cellSize / 2);
            }
            
            // 下面编号
            const bottomCoordY = coordSize + perlerHeight * cellSize + coordSize / 2;
            for (let x = 0; x < perlerWidth; x++) {
                ctx.fillText(x + 1, coordSize + x * cellSize + cellSize / 2, bottomCoordY);
            }
        }
        
        if (showGrid) {
            ctx.strokeStyle = coordColor;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            
            for (let x = 0; x <= perlerWidth; x++) {
                ctx.moveTo(coordSize + x * cellSize, coordSize);
                ctx.lineTo(coordSize + x * cellSize, coordSize + perlerHeight * cellSize);
            }
            
            for (let y = 0; y <= perlerHeight; y++) {
                ctx.moveTo(coordSize, coordSize + y * cellSize);
                ctx.lineTo(coordSize + perlerWidth * cellSize, coordSize + y * cellSize);
            }
            
            ctx.stroke();
        }
        
        for (let y = 0; y < perlerHeight; y++) {
            for (let x = 0; x < perlerWidth; x++) {
                const color = perlerColors[y][x];
                const px = coordSize + x * cellSize;
                const py = coordSize + y * cellSize;
                
                if (color.isTransparent) {
                    ctx.fillStyle = '#ffffff';
                    if (beadShape === 'circle') {
                        ctx.beginPath();
                        ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
                    }
                    continue;
                }
                
                const nameLen = color.name.length;
                let fontSizeBase = Math.max(6, Math.floor(cellSize * 0.45));
                let fontSize = fontSizeBase;
                if (nameLen === 1) {
                    fontSize = Math.floor(fontSizeBase * 1.1);
                } else if (nameLen === 2) {
                    fontSize = fontSizeBase;
                } else if (nameLen === 3) {
                    fontSize = Math.floor(fontSizeBase * 0.85);
                } else {
                    fontSize = Math.floor(fontSizeBase * 0.7);
                }
                
                if (beadShape === 'circle') {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                    ctx.clip();
                    
                    if (chartStyle === 'color') {
                        ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                        ctx.fillRect(px, py, cellSize, cellSize);
                    } else if (chartStyle === 'color-with-code') {
                        ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                        ctx.fillRect(px, py, cellSize, cellSize);
                        ctx.fillStyle = getContrastTextColor(color.rgb);
                        ctx.font = `bold ${fontSize}px sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(color.name, px + cellSize / 2, py + cellSize / 2);
                    } else {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(px, py, cellSize, cellSize);
                        ctx.strokeStyle = '#999';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        ctx.fillStyle = '#333';
                        ctx.font = `${fontSize}px sans-serif`;
                        ctx.fillText(color.name, px + cellSize / 2, py + cellSize / 2);
                    }
                    
                    ctx.restore();
                    
                    ctx.beginPath();
                    ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                    ctx.strokeStyle = '#ddd';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                } else {
                    if (chartStyle === 'color') {
                        ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                        ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
                    } else if (chartStyle === 'color-with-code') {
                        ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                        ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
                        ctx.fillStyle = getContrastTextColor(color.rgb);
                        ctx.font = `bold ${fontSize}px sans-serif`;
                        ctx.fillText(color.name, px + cellSize / 2, py + cellSize / 2);
                    } else {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
                        ctx.strokeStyle = '#999';
                        ctx.strokeRect(px, py, cellSize - 1, cellSize - 1);
                        ctx.fillStyle = '#333';
                        ctx.font = `${fontSize}px sans-serif`;
                        ctx.fillText(color.name, px + cellSize / 2, py + cellSize / 2);
                    }
                }
            }
        }
        
        this.drawColorLegend();
        // 不再绘制底部水印，改为在顶部显示
        // drawFooter();
        this.resetPerlerZoom();
    }

    drawColorLegend() {
        const position = this.legendPosition.value;
        
        // 如果选择隐藏，删除现有图例并返回
        const existingLegend = document.getElementById('colorLegend');
        if (existingLegend) {
            existingLegend.remove();
        }
        const colorLegendArea = document.getElementById('colorLegendArea');
        colorLegendArea.innerHTML = '';
        
        if (position === 'hidden') {
            // 确保设置回正常布局
            this.perlerContent.style.flexDirection = 'column';
            this.perlerContent.style.gap = '0px';
            return;
        }
        
        const legendCanvas = document.createElement('canvas');
        const legendCtx = legendCanvas.getContext('2d');
        const colorNames = Object.keys(this.colorCounts).sort();
        
        const totalBeans = Object.values(this.colorCounts).reduce((a, b) => a + b, 0);
        const colorTypes = colorNames.length;
        const perlerWidth = Math.ceil(parseInt(this.widthInput.value) / parseInt(this.pixelSizeSlider.value));
        const perlerHeight = Math.ceil(parseInt(this.heightInput.value) / parseInt(this.pixelSizeSlider.value));
        const cellSize = parseInt(this.beadSizeSlider.value);
        const coordSize = Math.max(30, Math.floor(cellSize * 1.4));
        const chartWidth = coordSize + perlerWidth * cellSize;
        const chartHeight = coordSize + perlerHeight * cellSize;
        
        let columns, itemsPerColumn, columnWidth;
        const rectWidth = 120;
        const rectHeight = 28;
        const rowHeight = rectHeight + 5;
        
        if (position === 'right') {
            columnWidth = rectWidth + 10;
            const availableHeight = chartHeight - 60;
            const maxItemsPerColumn = Math.max(1, Math.floor(availableHeight / rowHeight));
            columns = Math.min(Math.ceil(colorNames.length / maxItemsPerColumn), 4);
            itemsPerColumn = Math.ceil(colorNames.length / columns);
        } else {
            const maxWidth = chartWidth - 20;
            columnWidth = rectWidth + 10;
            columns = Math.max(1, Math.min(Math.floor(maxWidth / columnWidth), Math.ceil(colorNames.length / 1)));
            itemsPerColumn = Math.ceil(colorNames.length / columns);
        }
        
        const legendWidth = columns * columnWidth + 20;
        const legendHeight = 60 + itemsPerColumn * rowHeight;
        
        legendCanvas.width = legendWidth;
        legendCanvas.height = legendHeight;
        
        legendCtx.fillStyle = '#ffffff';
        legendCtx.fillRect(0, 0, legendCanvas.width, legendCanvas.height);
        
        legendCtx.font = 'bold 13px sans-serif';
        legendCtx.fillStyle = '#667eea';
        legendCtx.textAlign = 'left';
        legendCtx.fillText(getI18nText('colorLegend'), 8, 18);
        
        legendCtx.font = 'bold 12px sans-serif';
        legendCtx.fillStyle = '#333';
        legendCtx.fillText(`${getI18nText('totalBeans')}: ${totalBeans} ${getI18nText('beans')} · ${getI18nText('colorTypes')}: ${colorTypes}`, 8, 36);
        
        let col = 0, row = 0;
        
        for (const name of colorNames) {
            const count = this.colorCounts[name];
            const colorSetName = this.colorSetSelect.value;
            const colorSet = colorSets[colorSetName];
            const color = colorSet.find(c => c.name === name);
            
            const x = 8 + col * columnWidth;
            const y = 50 + row * rowHeight;
            
            if (color) {
                legendCtx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                legendCtx.fillRect(x, y, rectWidth, rectHeight);
                legendCtx.strokeStyle = '#999';
                legendCtx.strokeRect(x, y, rectWidth, rectHeight);
                
                legendCtx.fillStyle = getContrastTextColor(color.rgb);
                legendCtx.font = 'bold 11px sans-serif';
                legendCtx.textAlign = 'center';
                legendCtx.textBaseline = 'middle';
                legendCtx.fillText(`${name} x ${count}`, x + rectWidth / 2, y + rectHeight / 2);
                legendCtx.textAlign = 'left';
                legendCtx.textBaseline = 'alphabetic';
            }
            
            row++;
            if (row >= itemsPerColumn) {
                row = 0;
                col++;
            }
        }
        
        const legendDiv = document.createElement('div');
        legendDiv.id = 'colorLegend';
        legendDiv.style.padding = '15px';
        legendDiv.style.background = '#f8f9fa';
        legendDiv.style.borderRadius = '8px';
        legendDiv.style.display = 'inline-block';
        legendDiv.appendChild(legendCanvas);
        
        if (position === 'right') {
            legendDiv.classList.add('horizontal');
            colorLegendArea.classList.add('horizontal');
            this.perlerContent.style.flexDirection = 'row';
            this.perlerContent.style.gap = '20px';
            colorLegendArea.style.flexDirection = 'column';
            colorLegendArea.style.alignItems = 'flex-start';
        } else {
            legendDiv.classList.remove('horizontal');
            colorLegendArea.classList.remove('horizontal');
            this.perlerContent.style.flexDirection = 'column';
            this.perlerContent.style.gap = '0px';
            colorLegendArea.style.flexDirection = 'column';
            colorLegendArea.style.alignItems = 'center';
        }
        
        colorLegendArea.appendChild(legendDiv);
    }

    refreshLegendPosition() {
        if (Object.keys(this.colorCounts).length > 0) {
            this.drawColorLegend();
        }
    }

    clear() {
        this.originalImage = null;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.colorCounts = {};
        this.pixelColorStats = [];
        this.excludedColors.clear();
        this.lastPerlerSignature = null;
        this.unifiedSnapshots = [];
        this.customEditData = null;
        this.customEditHistory = [];
        if (this.snapshotsContainer) {
            this.snapshotsContainer.innerHTML = '';
        }
        if (this.snapshotsList) {
            this.snapshotsList.style.display = 'none';
        }
        
        this.fileInput.value = '';
        
        this.uploadSection.style.display = 'block';
        this.workspace.style.display = 'none';
        
        this.perlerContent.style.flexDirection = 'column';
        this.perlerContent.style.gap = '0px';
        const colorLegendArea = document.getElementById('colorLegendArea');
        if (colorLegendArea) {
            colorLegendArea.innerHTML = '';
            colorLegendArea.classList.remove('horizontal');
        }
    }

    reset() {
        this.resetInputs();
        this.drawOriginalImage();
        this.excludedColors.clear();
        this.updatePixelatedImage();
        this.showPerlerPlaceholder();
        
        this.perlerContent.style.flexDirection = 'column';
        this.perlerContent.style.gap = '0px';
        const colorLegendArea = document.getElementById('colorLegendArea');
        if (colorLegendArea) {
            colorLegendArea.innerHTML = '';
            colorLegendArea.classList.remove('horizontal');
        }
    }

    downloadImage() {
        this.exportCounter.pixelated++;
        
        let fileName = 'pixelated-image';
        if (this.exportCounter.pixelated > 1) {
            fileName += `_(${this.exportCounter.pixelated})`;
        }
        
        // 添加处理信息到文件名
        const pixelSize = this.pixelSizeSlider.value;
        const method = this.pixelMethod.value;
        const methodMap = {
            'average': 'avg',
            'majority': 'major',
            'pixel-art': 'pixel-art',
            'quantized': 'quant'
        };
        const methodName = methodMap[method] || method;
        
        fileName += `_${methodName}_px${pixelSize}`;
        
        if (this.enableContrast.checked) {
            const contrast = parseFloat(this.contrastSlider.value).toFixed(1);
            fileName += `_c${contrast}`;
        }
        if (this.enableSharpen.checked) {
            const sharpen = parseFloat(this.sharpenSlider.value).toFixed(1);
            fileName += `_s${sharpen}`;
        }
        if (this.enableColorQuantize.checked) {
            const colorCount = this.colorCountSlider.value;
            fileName += `_q${colorCount}`;
        }
        
        fileName += '.png';
        
        // 创建一个临时画布来下载不带网格线的图片
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.pixelatedCanvasNaturalWidth;
        tempCanvas.height = this.pixelatedCanvasNaturalHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(this.pixelatedData, 0, 0);
        
        const link = document.createElement('a');
        link.download = fileName;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }

    exportPixelImage() {
        if (!this.customEditData) {
            alert('请先加载可编辑的像素图！');
            return;
        }

        const useTransparent = this.exportTransparentBackground.checked;
        const beadSize = parseInt(this.beadSizeSlider.value);
        
        let displayLeft = 0, displayRight = this.perlerWidth;
        let displayTop = 0, displayBottom = this.perlerHeight;
        if (this.canvasBounds) {
            displayLeft = this.canvasBounds.left;
            displayRight = this.canvasBounds.right;
            displayTop = this.canvasBounds.top;
            displayBottom = this.canvasBounds.bottom;
        }

        const exportWidth = (displayRight - displayLeft) * beadSize;
        const exportHeight = (displayBottom - displayTop) * beadSize;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = exportWidth;
        tempCanvas.height = exportHeight;
        const tempCtx = tempCanvas.getContext('2d');

        if (!useTransparent) {
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, exportWidth, exportHeight);
        }

        // 绘制色块（不带编号）
        for (let y = displayTop; y < displayBottom; y++) {
            for (let x = displayLeft; x < displayRight; x++) {
                const color = this.customEditData[y][x];
                const px = (x - displayLeft) * beadSize;
                const py = (y - displayTop) * beadSize;

                if (!color.isTransparent) {
                    tempCtx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                    tempCtx.fillRect(px, py, beadSize, beadSize);
                }
            }
        }

        let fileName = 'custom-pixel-image';
        if (useTransparent) {
            fileName += '_transparent';
        }
        fileName += '.png';

        const link = document.createElement('a');
        link.download = fileName;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }

    downloadPerlerChart() {
        // 使用当前实际的拼豆图纸尺寸，而不是根据输入重新计算
        const perlerWidth = this.perlerWidth;
        const perlerHeight = this.perlerHeight;
        
        const cellSize = parseInt(this.exportBeadSizeSlider.value);
        const coordSize = Math.max(30, Math.floor(cellSize * 1.4));
        const footerSize = 25;
        const colorNames = Object.keys(this.colorCounts).sort();
        const totalBeans = Object.values(this.colorCounts).reduce((a, b) => a + b, 0);
        const colorTypes = colorNames.length;
        
        const position = this.legendPosition.value;
        const chartWidth = coordSize * 2 + perlerWidth * cellSize;
        const chartHeight = coordSize * 2 + perlerHeight * cellSize + footerSize;
        const colorSetName = this.colorSetSelect.value;
        
        let canvasWidth, canvasHeight;
        
        // 如果选择隐藏，直接导出纯图纸
        if (position === 'hidden') {
            canvasWidth = chartWidth;
            canvasHeight = chartHeight;
        } else {
            let columns, itemsPerColumn, columnWidth;
            const rectWidth = 120;
            const rectHeight = 28;
            const rowHeight = rectHeight + 5;
            
            if (position === 'right') {
                columnWidth = rectWidth + 10;
                const availableHeight = chartHeight - 60;
                const maxItemsPerColumn = Math.max(1, Math.floor(availableHeight / rowHeight));
                columns = Math.min(Math.ceil(colorNames.length / maxItemsPerColumn), 4);
                itemsPerColumn = Math.ceil(colorNames.length / columns);
            } else {
                const maxWidth = chartWidth - 20;
                columnWidth = rectWidth + 10;
                columns = Math.max(1, Math.min(Math.floor(maxWidth / columnWidth), Math.ceil(colorNames.length / 1)));
                itemsPerColumn = Math.ceil(colorNames.length / columns);
            }
            
            const legendWidth = columns * columnWidth + 20;
            const legendHeight = 60 + itemsPerColumn * rowHeight;
            
            const fontSizeScale = cellSize / 30;
            
            const legendTitleSize = Math.max(10, Math.floor(13 * fontSizeScale));
            const totalSize = Math.max(9, Math.floor(12 * fontSizeScale));
            const colorNameSize = Math.max(8, Math.floor(11 * fontSizeScale));
            const legendYOffset1 = Math.max(14, Math.floor(18 * fontSizeScale));
            const legendYOffset2 = Math.max(28, Math.floor(36 * fontSizeScale));
            const legendStartY = Math.max(39, Math.floor(50 * fontSizeScale));
            const rectWidthScaled = Math.max(80, Math.floor(rectWidth * fontSizeScale));
            const rectHeightScaled = Math.max(19, Math.floor(rectHeight * fontSizeScale));
            const legendXGap = Math.max(6, Math.floor(8 * fontSizeScale));
            const columnWidthScaled = Math.max(90, Math.floor(columnWidth * fontSizeScale));
            const rowHeightScaled = Math.max(20, Math.floor(rowHeight * fontSizeScale));
            
            let legendX, legendY;
            
            if (position === 'right') {
                canvasWidth = chartWidth + Math.max(legendWidth * fontSizeScale, 200 * fontSizeScale) + 40 * fontSizeScale;
                canvasHeight = Math.max(chartHeight, legendHeight * fontSizeScale);
                legendX = chartWidth + 20 * fontSizeScale;
                legendY = 0;
            } else {
                canvasWidth = Math.max(chartWidth, legendWidth * fontSizeScale);
                canvasHeight = chartHeight + legendHeight * fontSizeScale + 40 * fontSizeScale;
                legendX = 0;
                legendY = chartHeight + 20 * fontSizeScale;
            }
            
            const scale = parseFloat(this.exportScaleSlider.value);
            
            const finalWidth = canvasWidth * scale;
            const finalHeight = canvasHeight * scale;
            
            const MAX_CANVAS_SIZE = 32767;
            const MAX_CANVAS_AREA = 268435456;
            
            if (finalWidth > MAX_CANVAS_SIZE || finalHeight > MAX_CANVAS_SIZE) {
                alert(`导出尺寸过大！最大支持 ${MAX_CANVAS_SIZE}px 边长。\n当前尺寸：${Math.round(finalWidth)} × ${Math.round(finalHeight)}\n请降低缩放倍数。`);
                return;
            }
            
            if (finalWidth * finalHeight > MAX_CANVAS_AREA) {
                alert(`导出图片像素过多！最大支持 ${(MAX_CANVAS_AREA / 1000000).toFixed(1)} 百万像素。\n当前：${((finalWidth * finalHeight) / 1000000).toFixed(1)} 百万像素\n请降低缩放倍数。`);
                return;
            }
            
            const tempChartCanvas = document.createElement('canvas');
            const tempChartCtx = tempChartCanvas.getContext('2d');
            tempChartCanvas.width = chartWidth;
            tempChartCanvas.height = chartHeight;
            tempChartCtx.fillStyle = '#ffffff';
            tempChartCtx.fillRect(0, 0, chartWidth, chartHeight);
            
            this.drawPerlerChartToCanvas(
                tempChartCtx,
                this.perlerColors,
                perlerWidth,
                perlerHeight,
                cellSize,
                this.colorSetSelect.value
            );
            
            const downloadCanvas = document.createElement('canvas');
            const downloadCtx = downloadCanvas.getContext('2d');
            downloadCanvas.width = finalWidth;
            downloadCanvas.height = finalHeight;
            
            downloadCtx.scale(scale, scale);
            
            downloadCtx.fillStyle = '#ffffff';
            downloadCtx.fillRect(0, 0, canvasWidth, canvasHeight);
            
            downloadCtx.drawImage(tempChartCanvas, 0, 0);
            
            downloadCtx.font = `bold ${legendTitleSize}px sans-serif`;
            downloadCtx.fillStyle = '#667eea';
            downloadCtx.textAlign = 'left';
            downloadCtx.fillText(getI18nText('colorLegend'), legendX + legendXGap, legendY + legendYOffset1);
            
            downloadCtx.font = `bold ${totalSize}px sans-serif`;
            downloadCtx.fillStyle = '#333';
            downloadCtx.fillText(`${getI18nText('totalBeans')}: ${totalBeans} ${getI18nText('beans')} · ${getI18nText('colorTypes')}: ${colorTypes}`, legendX + legendXGap, legendY + legendYOffset2);
            
            const colorSetName = this.colorSetSelect.value;
            const colorSet = colorSets[colorSetName];
            
            let col = 0, row = 0;
            
            for (const name of colorNames) {
                const count = this.colorCounts[name];
                const color = colorSet.find(c => c.name === name);
                
                const x = legendX + legendXGap + col * columnWidthScaled;
                const y = legendY + legendStartY + row * rowHeightScaled;
                
                if (color) {
                    downloadCtx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                    downloadCtx.fillRect(x, y, rectWidthScaled, rectHeightScaled);
                    downloadCtx.strokeStyle = '#999';
                    downloadCtx.strokeRect(x, y, rectWidthScaled, rectHeightScaled);
                    
                    downloadCtx.fillStyle = getContrastTextColor(color.rgb);
                    downloadCtx.font = `bold ${colorNameSize}px sans-serif`;
                    downloadCtx.textAlign = 'center';
                    downloadCtx.textBaseline = 'middle';
                    downloadCtx.fillText(`${name} x ${count}`, x + rectWidthScaled / 2, y + rectHeightScaled / 2);
                    downloadCtx.textAlign = 'left';
                    downloadCtx.textBaseline = 'alphabetic';
                }
                
                row++;
                if (row >= itemsPerColumn) {
                    row = 0;
                    col++;
                }
            }
            
            const link = document.createElement('a');
            
            // 增加导出计数器
            this.exportCounter.perler++;
            
            const chartStyle = this.chartStyle.value;
            const beadShape = this.beadShape.value;
            
            const i18nFileName = i18n[getCurrentLang()].fileName;
            let fileName = `${i18nFileName.perlerChart}_${colorSetName}_${perlerWidth}x${perlerHeight}`;
            
            // 添加导出编号
            if (this.exportCounter.perler > 1) {
                fileName += `_(${this.exportCounter.perler})`;
            }
            
            if (chartStyle === 'bw') fileName += `_${i18nFileName.bw}`;
            if (chartStyle === 'color-with-code') fileName += `_${i18nFileName.withCode}`;
            if (beadShape === 'circle') fileName += `_${i18nFileName.circle}`;
            if (position === 'right') fileName += `_${i18nFileName.legendRight}`;
            if (scale !== 1) fileName += `_${scale}x`;
            
            fileName += '.png';
            
            link.download = fileName;
            link.href = downloadCanvas.toDataURL('image/png');
            link.click();
            return;
        }
        
        // 隐藏模式 - 只导出图纸
        const scale = parseFloat(this.exportScaleSlider.value);
        
        const finalWidth = canvasWidth * scale;
        const finalHeight = canvasHeight * scale;
        
        const MAX_CANVAS_SIZE = 32767;
        const MAX_CANVAS_AREA = 268435456;
        
        if (finalWidth > MAX_CANVAS_SIZE || finalHeight > MAX_CANVAS_SIZE) {
            alert(`导出尺寸过大！最大支持 ${MAX_CANVAS_SIZE}px 边长。\n当前尺寸：${Math.round(finalWidth)} × ${Math.round(finalHeight)}\n请降低缩放倍数。`);
            return;
        }
        
        if (finalWidth * finalHeight > MAX_CANVAS_AREA) {
            alert(`导出图片像素过多！最大支持 ${(MAX_CANVAS_AREA / 1000000).toFixed(1)} 百万像素。\n当前：${((finalWidth * finalHeight) / 1000000).toFixed(1)} 百万像素\n请降低缩放倍数。`);
            return;
        }
        
        const tempChartCanvas = document.createElement('canvas');
        const tempChartCtx = tempChartCanvas.getContext('2d');
        tempChartCanvas.width = chartWidth;
        tempChartCanvas.height = chartHeight;
        tempChartCtx.fillStyle = '#ffffff';
        tempChartCtx.fillRect(0, 0, chartWidth, chartHeight);
        
        this.drawPerlerChartToCanvas(
            tempChartCtx,
            this.perlerColors,
            perlerWidth,
            perlerHeight,
            cellSize,
            this.colorSetSelect.value
        );
        
        const downloadCanvas = document.createElement('canvas');
        const downloadCtx = downloadCanvas.getContext('2d');
        downloadCanvas.width = finalWidth;
        downloadCanvas.height = finalHeight;
        
        downloadCtx.scale(scale, scale);
        
        downloadCtx.fillStyle = '#ffffff';
        downloadCtx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        downloadCtx.drawImage(tempChartCanvas, 0, 0);
        
        const link = document.createElement('a');
        
        // 增加导出计数器
        this.exportCounter.perler++;
        
        const chartStyle = this.chartStyle.value;
        const beadShape = this.beadShape.value;
        
        const i18nFileName = i18n[getCurrentLang()].fileName;
        let fileName = `${i18nFileName.perlerChart}_${colorSetName}_${perlerWidth}x${perlerHeight}`;
        
        // 添加导出编号
        if (this.exportCounter.perler > 1) {
            fileName += `_(${this.exportCounter.perler})`;
        }
        
        if (chartStyle === 'bw') fileName += `_${i18nFileName.bw}`;
        if (chartStyle === 'color-with-code') fileName += `_${i18nFileName.withCode}`;
        if (beadShape === 'circle') fileName += `_${i18nFileName.circle}`;
        if (position === 'right') fileName += `_${i18nFileName.legendRight}`;
        if (scale !== 1) fileName += `_${scale}x`;
        
        fileName += '.png';
        
        link.download = fileName;
        link.href = downloadCanvas.toDataURL('image/png');
        link.click();
    }

    initCustomEditCanvasEvents() {
        const canvas = this.customEditCanvas;
        
        canvas.addEventListener('mouseenter', (e) => {
            this.customEditBrushCursor.style.display = 'block';
            this.updateCustomEditBrushCursorSize();
            this.updateCustomEditBrushCursorPosition(e);
        });
        
        canvas.addEventListener('mouseleave', (e) => {
            this.handleCustomEditMouseUp();
            this.customEditBrushCursor.style.display = 'none';
        });
        
        canvas.addEventListener('mousedown', (e) => this.handleCustomEditMouseDown(e));
        
        canvas.addEventListener('mousemove', (e) => {
            this.updateCustomEditBrushCursorPosition(e);
            this.handleCustomEditMouseMove(e);
        });
        
        canvas.addEventListener('mouseup', () => this.handleCustomEditMouseUp());
    }

    getPerlerSignature() {
        if (!this.perlerColors || !this.perlerColors.length) return '';
        const width = this.perlerColors[0].length;
        const height = this.perlerColors.length;
        const sample = [];
        for (let y = 0; y < Math.min(3, height); y++) {
            for (let x = 0; x < Math.min(3, width); x++) {
                sample.push(this.perlerColors[y][x].name);
            }
        }
        return `${width}x${height}-${sample.join('-')}`;
    }

    initCustomEditData() {
        if (!this.perlerColors || !this.perlerColors.length) return;
        
        const currentSignature = this.getPerlerSignature();
        
        if (currentSignature !== this.lastPerlerSignature) {
            this.lastPerlerSignature = currentSignature;
            this.customEditSnapshots = [];
            this.snapshotsContainer.innerHTML = '';
            this.snapshotsList.style.display = 'none';
        }
        
        this.perlerWidth = this.perlerColors[0].length;
        this.perlerHeight = this.perlerColors.length;
        this.customEditData = this.perlerColors.map(row => [...row]);
        this.customEditHistory = [this.customEditData.map(row => [...row])];
        
        // 初始化画布边界
        this.canvasBounds = {
            originalWidth: this.perlerWidth,
            originalHeight: this.perlerHeight,
            left: 0,
            right: this.perlerWidth,
            top: 0,
            bottom: this.perlerHeight
        };
        this.updateCanvasBoundsInputs();
        this.updateCanvasBoundsDisplay();
        
        this.drawCustomEditCanvas();
    }

    drawCustomEditCanvas() {
        if (!this.customEditData) return;
        
        const cellSize = parseInt(this.beadSizeSlider.value);
        const showGrid = this.showCustomEditGrid.checked;
        const coordSize = Math.max(30, Math.floor(cellSize * 1.4));
        
        this.customEditCanvas.width = coordSize * 2 + this.perlerWidth * cellSize;
        this.customEditCanvas.height = coordSize * 2 + this.perlerHeight * cellSize;
        
        // 保存单元格大小用于画笔光标
        this.customEditCellSize = cellSize;
        
        // 更新画笔光标大小
        this.updateCustomEditBrushCursorSize();
        
        const ctx = this.customEditCtx;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.customEditCanvas.width, this.customEditCanvas.height);
        
        // 确定显示范围
        let displayLeft = 0, displayRight = this.perlerWidth;
        let displayTop = 0, displayBottom = this.perlerHeight;
        if (this.canvasBounds) {
            displayLeft = this.canvasBounds.left;
            displayRight = this.canvasBounds.right;
            displayTop = this.canvasBounds.top;
            displayBottom = this.canvasBounds.bottom;
        }
        
        // 绘制隐藏区域的遮罩（半透明灰色）
        if (this.canvasBounds && this.currentEditTool === 'canvasBounds') {
            ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
            // 左边
            if (displayLeft > 0) {
                ctx.fillRect(coordSize, coordSize, displayLeft * cellSize, this.perlerHeight * cellSize);
            }
            // 右边
            if (displayRight < this.perlerWidth) {
                ctx.fillRect(coordSize + displayRight * cellSize, coordSize, (this.perlerWidth - displayRight) * cellSize, this.perlerHeight * cellSize);
            }
            // 上边
            if (displayTop > 0) {
                ctx.fillRect(coordSize + displayLeft * cellSize, coordSize, (displayRight - displayLeft) * cellSize, displayTop * cellSize);
            }
            // 下边
            if (displayBottom < this.perlerHeight) {
                ctx.fillRect(coordSize + displayLeft * cellSize, coordSize + displayBottom * cellSize, (displayRight - displayLeft) * cellSize, (this.perlerHeight - displayBottom) * cellSize);
            }
        }
        
        // 只绘制显示范围内的色块
        for (let y = displayTop; y < displayBottom; y++) {
            for (let x = displayLeft; x < displayRight; x++) {
                const color = this.customEditData[y][x];
                if (color.isTransparent) {
                    ctx.fillStyle = this.razorBgColor.value;
                } else {
                    ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                }
                ctx.fillRect(coordSize + x * cellSize, coordSize + y * cellSize, cellSize - 1, cellSize - 1);
            }
        }
        
        if (showGrid) {
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1;
            for (let x = displayLeft; x <= displayRight; x++) {
                ctx.beginPath();
                ctx.moveTo(coordSize + x * cellSize, coordSize + displayTop * cellSize);
                ctx.lineTo(coordSize + x * cellSize, coordSize + displayBottom * cellSize);
                ctx.stroke();
            }
            for (let y = displayTop; y <= displayBottom; y++) {
                ctx.beginPath();
                ctx.moveTo(coordSize + displayLeft * cellSize, coordSize + y * cellSize);
                ctx.lineTo(coordSize + displayRight * cellSize, coordSize + y * cellSize);
                ctx.stroke();
            }
        }
        
        // 绘制边界高亮框
        if (this.canvasBounds && this.currentEditTool === 'canvasBounds') {
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 2;
            ctx.strokeRect(coordSize + displayLeft * cellSize + 1, coordSize + displayTop * cellSize + 1, (displayRight - displayLeft) * cellSize - 2, (displayBottom - displayTop) * cellSize - 2);
        }
        
        // 绘制编号
        const fontSizeCoord = Math.max(9, Math.floor(cellSize * 0.45));
        ctx.font = `${fontSizeCoord}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333';
        
        // 上面编号
        for (let x = displayLeft; x < displayRight; x++) {
            ctx.fillText(x + 1, coordSize + x * cellSize + cellSize / 2, coordSize / 2);
        }
        
        // 左边编号
        for (let y = displayTop; y < displayBottom; y++) {
            ctx.fillText(y + 1, coordSize / 2, coordSize + y * cellSize + cellSize / 2);
        }
        
        // 右边编号
        const rightCoordX = coordSize + this.perlerWidth * cellSize + coordSize / 2;
        for (let y = displayTop; y < displayBottom; y++) {
            ctx.fillText(y + 1, rightCoordX, coordSize + y * cellSize + cellSize / 2);
        }
        
        // 下面编号
        const bottomCoordY = coordSize + this.perlerHeight * cellSize + coordSize / 2;
        for (let x = displayLeft; x < displayRight; x++) {
            ctx.fillText(x + 1, coordSize + x * cellSize + cellSize / 2, bottomCoordY);
        }
        
        // 更新显示尺寸信息
        let displayWidth = this.perlerWidth;
        let displayHeight = this.perlerHeight;
        if (this.canvasBounds) {
            displayWidth = this.canvasBounds.right - this.canvasBounds.left;
            displayHeight = this.canvasBounds.bottom - this.canvasBounds.top;
        }
        this.customEditInfo.textContent = `编辑尺寸: ${this.perlerWidth} × ${this.perlerHeight} | 显示: ${displayWidth} × ${displayHeight}`;
        
        // 更新手柄位置
        if (this.currentEditTool === 'canvasBounds') {
            this.updateCanvasBoundsHandlesPosition();
        }
    }

    getCustomEditCell(e) {
        const rect = this.customEditCanvas.getBoundingClientRect();
        const cellSize = parseInt(this.beadSizeSlider.value);
        const coordSize = Math.max(30, Math.floor(cellSize * 1.4));
        const x = Math.floor((e.clientX - rect.left - coordSize) / cellSize);
        const y = Math.floor((e.clientY - rect.top - coordSize) / cellSize);
        return { x, y };
    }

    handleCustomEditMouseDown(e) {
        console.log('[handleCustomEditMouseDown] 鼠标按下！');
        console.log('[handleCustomEditMouseDown] 当前工具:', this.currentEditTool);
        
        if (!this.customEditData) {
            console.log('[handleCustomEditMouseDown] 没有 customEditData，返回');
            return;
        }
        
        const { x, y } = this.getCustomEditCell(e);
        console.log('[handleCustomEditMouseDown] 点击位置:', x, y);
        
        if (this.colorConvertPickMode) {
            const color = this.customEditData[y][x];
            if (!color.isTransparent) {
                const hex = this.rgbToHex(color.rgb[0], color.rgb[1], color.rgb[2]);
                if (this.colorConvertPickMode === 'source') {
                    this.colorConvertSourceColor.value = hex;
                    this.colorConvertSourceColorValue.textContent = hex;
                } else if (this.colorConvertPickMode === 'target') {
                    this.colorConvertTargetColor.value = hex;
                    this.colorConvertTargetColorValue.textContent = hex;
                }
            }
            this.colorConvertPickMode = null;
            this.pickSourceColorBtn.classList.remove('color-pick-active');
            this.pickTargetColorBtn.classList.remove('color-pick-active');
            return;
        }
        
        // 颜色剔除取色模式
        if (this.pickRemoveColorMode) {
            const color = this.customEditData[y][x];
            if (!color.isTransparent) {
                const hex = this.rgbToHex(color.rgb[0], color.rgb[1], color.rgb[2]);
                this.removeColorPicker.value = hex;
                this.removeColorValue.textContent = hex;
                // 去掉弹窗，改为在控制台显示
                console.log(`已选择颜色: ${hex}`);
            }
            this.pickRemoveColorMode = false;
            return;
        }
        
        if (this.currentEditTool === 'chainRazor') {
            console.log('[handleCustomEditMouseDown] 调用 chainRazor');
            this.applyChainRazor(x, y);
            this.isDrawing = true;
            this.saveCustomEditHistory();
        } else if (this.currentEditTool === 'fill') {
            console.log('[handleCustomEditMouseDown] 调用 fill 工具（不设置 isDrawing）');
            this.applyEditToCell(x, y);
        } else {
            console.log('[handleCustomEditMouseDown] 调用 applyEditToCell');
            this.isDrawing = true;
            this.applyEditToCell(x, y);
        }
    }

    handleCustomEditMouseMove(e) {
        if (!this.isDrawing || !this.customEditData) return;
        
        if (this.currentEditTool === 'chainRazor') {
            return;
        }
        
        const { x, y } = this.getCustomEditCell(e);
        this.applyEditToCell(x, y);
    }

    handleCustomEditMouseUp() {
        if (this.isDrawing && this.customEditData && this.currentEditTool !== 'chainRazor') {
            this.saveCustomEditHistory();
        }
        this.isDrawing = false;
    }

    applyChainRazor(startX, startY) {
        const transparentColor = {
            name: '',
            rgb: [255, 255, 255],
            isTransparent: true
        };
        
        const targetColor = this.customEditData[startY][startX];
        if (targetColor.isTransparent) return;
        
        const maxCount = parseInt(this.chainRazorMax.value) || 1000;
        let count = 0;
        
        const visited = new Set();
        const stack = [{x: startX, y: startY}];
        
        while (stack.length > 0 && count < maxCount) {
            const {x, y} = stack.pop();
            const key = `${x},${y}`;
            
            if (visited.has(key)) continue;
            if (x < 0 || x >= this.perlerWidth || y < 0 || y >= this.perlerHeight) continue;
            
            const currentColor = this.customEditData[y][x];
            if (currentColor.isTransparent) continue;
            if (currentColor.name !== targetColor.name) continue;
            
            visited.add(key);
            this.customEditData[y][x] = transparentColor;
            count++;
            
            // 八爪鱼方向：上下左右 + 四个对角线
            stack.push({x: x + 1, y});       // 右
            stack.push({x: x - 1, y});       // 左
            stack.push({x, y: y + 1});       // 下
            stack.push({x, y: y - 1});       // 上
            stack.push({x: x + 1, y: y + 1}); // 右下
            stack.push({x: x + 1, y: y - 1}); // 右上
            stack.push({x: x - 1, y: y + 1}); // 左下
            stack.push({x: x - 1, y: y - 1}); // 左上
        }
        
        this.drawCustomEditCanvas();
    }

    removeSelectedColor() {
        if (!this.customEditData) {
            alert('请先加载可编辑的像素图！');
            return;
        }
        
        const hexColor = this.removeColorPicker.value;
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        // 找到最接近的颜色
        const colorSetName = this.colorSetSelect.value;
        const colorSet = colorSets[colorSetName];
        const mappingMethod = this.colorMappingMethod.value;
        const targetColor = findClosestColor([r, g, b], colorSet, mappingMethod);
        
        if (!targetColor || targetColor.isTransparent) {
            alert('请选择有效的颜色！');
            return;
        }
        
        // 统计要剔除的颜色数量
        let count = 0;
        for (let y = 0; y < this.perlerHeight; y++) {
            for (let x = 0; x < this.perlerWidth; x++) {
                const currentColor = this.customEditData[y][x];
                if (!currentColor.isTransparent && currentColor.name === targetColor.name) {
                    count++;
                }
            }
        }
        
        if (count === 0) {
            alert('没有找到要剔除的颜色！');
            return;
        }
        
        // 去掉确认弹窗，直接执行剔除
        console.log(`正在剔除所有 ${targetColor.name} 颜色，共 ${count} 个色块...`);
        
        // 保存历史记录
        this.saveCustomEditHistory();
        
        // 执行颜色剔除
        const transparentColor = {
            name: '',
            rgb: [255, 255, 255],
            isTransparent: true
        };
        
        for (let y = 0; y < this.perlerHeight; y++) {
            for (let x = 0; x < this.perlerWidth; x++) {
                const currentColor = this.customEditData[y][x];
                if (!currentColor.isTransparent && currentColor.name === targetColor.name) {
                    this.customEditData[y][x] = transparentColor;
                }
            }
        }
        
        this.drawCustomEditCanvas();
        // 去掉弹窗，改为在控制台显示
        console.log(`已成功剔除 ${count} 个 ${targetColor.name} 颜色！`);
    }

    applyEditToCell(x, y) {
        console.log('[applyEditToCell] 开始！');
        console.log('[applyEditToCell] 当前工具:', this.currentEditTool);
        
        if (x < 0 || x >= this.perlerWidth || y < 0 || y >= this.perlerHeight) {
            console.log('[applyEditToCell] 位置无效');
            return;
        }
        
        const brushSize = parseInt(this.customEditBrushSize.value);
        const halfBrush = Math.floor(brushSize / 2);
        
        for (let dy = -halfBrush; dy <= halfBrush; dy++) {
            for (let dx = -halfBrush; dx <= halfBrush; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < this.perlerWidth && ny >= 0 && ny < this.perlerHeight) {
                    this.applySingleEdit(nx, ny);
                }
            }
        }
        
        this.drawCustomEditCanvas();
    }

    applySingleEdit(x, y) {
        const transparentColor = {
            name: '',
            rgb: [255, 255, 255],
            isTransparent: true
        };
        
        switch (this.currentEditTool) {
            case 'brush':
                const hexColor = this.customEditColor.value;
                const r = parseInt(hexColor.slice(1, 3), 16);
                const g = parseInt(hexColor.slice(3, 5), 16);
                const b = parseInt(hexColor.slice(5, 7), 16);
                
                const colorSetName = this.colorSetSelect.value;
                const colorSet = colorSets[colorSetName];
                const mappingMethod = this.colorMappingMethod.value;
                const closestColor = findClosestColor([r, g, b], colorSet, mappingMethod);
                
                this.customEditData[y][x] = closestColor;
                break;
                
            case 'eraser':
                const eraserHex = this.eraserColor.value;
                const er = parseInt(eraserHex.slice(1, 3), 16);
                const eg = parseInt(eraserHex.slice(3, 5), 16);
                const eb = parseInt(eraserHex.slice(5, 7), 16);
                
                const csName = this.colorSetSelect.value;
                const cs = colorSets[csName];
                const mm = this.colorMappingMethod.value;
                const eraserClosestColor = findClosestColor([er, eg, eb], cs, mm);
                
                this.customEditData[y][x] = eraserClosestColor;
                break;
                
            case 'razor':
                this.customEditData[y][x] = transparentColor;
                break;
                
            case 'fill':
                if (!this.isDrawing) {
                    console.log('[applySingleEdit] 填充工具触发');
                    console.log('[applySingleEdit] 点击位置:', x, y);
                    console.log('[applySingleEdit] 选中颜色:', this.customEditColor.value);
                    
                    this.saveCustomEditHistory();
                    const targetColor = this.customEditData[y][x];
                    const hexFill = this.customEditColor.value;
                    const fr = parseInt(hexFill.slice(1, 3), 16);
                    const fg = parseInt(hexFill.slice(3, 5), 16);
                    const fb = parseInt(hexFill.slice(5, 7), 16);
                    
                    const csName = this.colorSetSelect.value;
                    const cs = colorSets[csName];
                    const mm = this.colorMappingMethod.value;
                    const fillColor = findClosestColor([fr, fg, fb], cs, mm);
                    
                    console.log('[applySingleEdit] 准备调用 floodFill');
                    this.floodFill(x, y, targetColor, fillColor);
                }
                break;
                
            case 'picker':
                const pickedColor = this.customEditData[y][x];
                if (pickedColor.isTransparent) break;
                const pickedHex = `#${pickedColor.rgb[0].toString(16).padStart(2, '0')}${pickedColor.rgb[1].toString(16).padStart(2, '0')}${pickedColor.rgb[2].toString(16).padStart(2, '0')}`;
                this.customEditColor.value = pickedHex;
                this.currentColorValue.textContent = pickedHex;
                break;
        }
    }

    floodFill(startX, startY, targetColor, fillColor) {
        console.log('[floodFill] 开始填充');
        console.log('[floodFill] 开始位置:', startX, startY);
        console.log('[floodFill] 目标颜色:', targetColor);
        console.log('[floodFill] 填充颜色:', fillColor);
        
        // 判断是否需要填充
        const targetIsTransparent = targetColor.isTransparent;
        const fillIsTransparent = fillColor.isTransparent;
        if (!targetIsTransparent && !fillIsTransparent && targetColor.name === fillColor.name) {
            console.log('[floodFill] 目标颜色与填充颜色相同，跳过');
            return;
        }
        if (targetIsTransparent && fillIsTransparent) {
            console.log('[floodFill] 都是透明色，跳过');
            return;
        }
        
        const visited = new Set();
        const stack = [{x: startX, y: startY}];
        let fillCount = 0;
        
        while (stack.length > 0) {
            const {x, y} = stack.pop();
            const key = `${x},${y}`;
            
            if (visited.has(key)) continue;
            if (x < 0 || x >= this.perlerWidth || y < 0 || y >= this.perlerHeight) continue;
            
            const currentColor = this.customEditData[y][x];
            const currentIsTransparent = currentColor.isTransparent;
            
            // 检查当前颜色是否等于目标颜色
            let isMatch = false;
            if (targetIsTransparent) {
                isMatch = currentIsTransparent;
            } else {
                isMatch = !currentIsTransparent && currentColor.name === targetColor.name;
            }
            
            if (!isMatch) continue;
            
            visited.add(key);
            this.customEditData[y][x] = fillColor;
            fillCount++;
            
            // 十字方向：只上下左右
            stack.push({x: x + 1, y});
            stack.push({x: x - 1, y});
            stack.push({x, y: y + 1});
            stack.push({x, y: y - 1});
        }
        
        console.log('[floodFill] 填充完成，共填充', fillCount, '个格子');
        
        // 重绘画布
        this.drawCustomEditCanvas();
    }

    saveCustomEditHistory() {
        this.customEditHistory.push(this.customEditData.map(row => [...row]));
        if (this.customEditHistory.length > 50) {
            this.customEditHistory.shift();
        }
    }
    
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }
    
    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }
    
    executeColorConvert() {
        if (!this.customEditData) return;
        
        const sourceHex = this.colorConvertSourceColor.value;
        const targetHex = this.colorConvertTargetColor.value;
        
        if (sourceHex === targetHex) {
            alert('源颜色和目标颜色不能相同！');
            return;
        }
        
        const sourceRgb = this.hexToRgb(sourceHex);
        const targetRgb = this.hexToRgb(targetHex);
        
        const colorSetName = this.colorSetSelect.value;
        const colorSet = colorSets[colorSetName];
        const mappingMethod = this.colorMappingMethod.value;
        
        const sourceColor = findClosestColor(sourceRgb, colorSet, mappingMethod);
        const targetColor = findClosestColor(targetRgb, colorSet, mappingMethod);
        
        if (sourceColor.name === targetColor.name) {
            alert('源颜色和目标颜色在当前色板中是同一个颜色！');
            return;
        }
        
        let convertedCount = 0;
        for (let y = 0; y < this.perlerHeight; y++) {
            for (let x = 0; x < this.perlerWidth; x++) {
                const currentColor = this.customEditData[y][x];
                if (currentColor.name === sourceColor.name) {
                    this.customEditData[y][x] = targetColor;
                    convertedCount++;
                }
            }
        }
        
        if (convertedCount > 0) {
            this.saveCustomEditHistory();
            this.drawCustomEditCanvas();
            alert(`成功转换 ${convertedCount} 个豆粒！`);
        } else {
            alert('没有找到匹配的颜色！');
        }
    }

    undoCustomEdit() {
        if (this.customEditHistory.length > 1) {
            this.customEditHistory.pop();
            this.customEditData = this.customEditHistory[this.customEditHistory.length - 1].map(row => [...row]);
            this.drawCustomEditCanvas();
        }
    }

    flipImageHorizontal() {
        if (!this.customEditData) return;
        
        // 保存历史记录
        this.saveCustomEditHistory();
        
        // 左右翻转：每行反转
        this.customEditData = this.customEditData.map(row => [...row].reverse());
        
        this.drawCustomEditCanvas();
    }

    flipImageVertical() {
        if (!this.customEditData) return;
        
        // 保存历史记录
        this.saveCustomEditHistory();
        
        // 上下翻转：数组反转
        this.customEditData = [...this.customEditData].reverse();
        
        this.drawCustomEditCanvas();
    }

    applyCustomEdit() {
        if (!this.customEditData) return;
        
        // 根据画布边界裁剪内容
        let finalData = this.customEditData;
        let finalWidth = this.perlerWidth;
        let finalHeight = this.perlerHeight;
        
        if (this.canvasBounds) {
            const left = this.canvasBounds.left;
            const right = this.canvasBounds.right;
            const top = this.canvasBounds.top;
            const bottom = this.canvasBounds.bottom;
            
            finalWidth = right - left;
            finalHeight = bottom - top;
            finalData = [];
            
            for (let y = top; y < bottom; y++) {
                const newRow = [];
                for (let x = left; x < right; x++) {
                    newRow.push(this.customEditData[y][x]);
                }
                finalData.push(newRow);
            }
            
            // 更新画布尺寸
            this.perlerWidth = finalWidth;
            this.perlerHeight = finalHeight;
        }
        
        this.perlerColors = finalData.map(row => [...row]);
        
        this.colorCounts = {};
        for (let y = 0; y < this.perlerHeight; y++) {
            for (let x = 0; x < this.perlerWidth; x++) {
                const color = this.perlerColors[y][x];
                if (!color.isTransparent) {
                    if (this.colorCounts[color.name]) {
                        this.colorCounts[color.name]++;
                    } else {
                        this.colorCounts[color.name] = 1;
                    }
                }
            }
        }
        
        // 更新拼豆尺寸显示
        this.perlerSize.textContent = `${getI18nText('perlerSize')}: ${this.perlerWidth} × ${this.perlerHeight} ${getI18nText('beans')}`;
        
        this.saveUnifiedSnapshot('custom', '', finalData);
        
        this.drawPerlerChart(this.perlerColors, this.perlerWidth, this.perlerHeight, this.colorSetSelect.value);
        this.drawColorLegend();
        
        // 重新初始化自定义编辑数据（因为尺寸可能改变了）
        this.initCustomEditData();
    }

    openSmartOptimizeModal() {
        if (!this.perlerColors || !this.perlerColors.length) {
            alert('请先渲染拼豆图纸！');
            return;
        }
        
        this.originalPerlerColors = this.perlerColors.map(row => [...row]);
        this.previewPerlerColors = this.perlerColors.map(row => [...row]); // 预览用的临时颜色矩阵
        this.colorSuggestions = this.generateColorSuggestions();
        this.acceptedSuggestions = new Set();
        this.rejectedSuggestions = new Set();
        this.erasedBlocks = new Set(); // 重置取消优化的方块
        
        for (let i = 0; i < this.colorSuggestions.length; i++) {
            if (this.colorSuggestions[i].isMerge) {
                this.acceptedSuggestions.add(i);
                this.applySuggestion(i);
            }
        }
        
        this.renderOptimizationSummary();
        this.renderSuggestionsList();
        this.drawOptimizationPreview();
        
        // 初始化画笔大小显示
        this.optimizeBrushSizeValue.textContent = this.optimizeBrushSizeSlider.value;
        
        this.smartOptimizeModal.style.display = 'flex';
    }
    
    // 初始化优化预览画布的鼠标事件
    initOptimizationPreviewCanvasEvents() {
        const canvas = this.optimizationPreviewCanvas;
        
        // 鼠标进入画布
        canvas.addEventListener('mouseenter', (e) => {
            this.brushCursor.style.display = 'block';
            this.updateBrushCursorSize();
            this.updateBrushCursorPosition(e);
        });
        
        // 鼠标离开画布
        canvas.addEventListener('mouseleave', (e) => {
            this.isDrawing = false;
            this.brushCursor.style.display = 'none';
        });
        
        // 鼠标按下
        canvas.addEventListener('mousedown', (e) => {
            this.isDrawing = true;
            this.handleOptimizationDraw(e);
        });
        
        // 鼠标移动
        canvas.addEventListener('mousemove', (e) => {
            this.updateBrushCursorPosition(e);
            if (this.isDrawing) {
                this.handleOptimizationDraw(e);
            }
        });
        
        // 鼠标释放
        canvas.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });
        
        // 触摸开始
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isDrawing = true;
            const touch = e.touches[0];
            this.handleOptimizationDraw(touch);
        });
        
        // 触摸移动
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDrawing) {
                const touch = e.touches[0];
                this.handleOptimizationDraw(touch);
            }
        });
        
        // 触摸结束
        canvas.addEventListener('touchend', () => {
            this.isDrawing = false;
        });
    }
    
    // 处理涂抹操作
    handleOptimizationDraw(e) {
        const rect = this.optimizationPreviewCanvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        const gridX = Math.floor(x / this.optimizationCellSize);
        const gridY = Math.floor(y / this.optimizationCellSize);
        
        const brushSize = parseInt(this.optimizeBrushSizeSlider.value);
        
        // 以点击位置为中心，涂抹周围的方块
        for (let dy = -brushSize + 1; dy < brushSize; dy++) {
            for (let dx = -brushSize + 1; dx < brushSize; dx++) {
                const bx = gridX + dx;
                const by = gridY + dy;
                
                if (bx >= 0 && bx < this.perlerWidth && by >= 0 && by < this.perlerHeight) {
                    const key = `${bx},${by}`;
                    
                    if (this.brushMode === 'erase') {
                        this.erasedBlocks.add(key);
                        // 擦除模式：恢复到原始颜色
                        this.previewPerlerColors[by][bx] = this.originalPerlerColors[by][bx];
                    } else {
                        this.erasedBlocks.delete(key);
                        // 恢复模式：重新应用所有已接受的建议
                        this.previewPerlerColors[by][bx] = this.originalPerlerColors[by][bx];
                        for (const idx of this.acceptedSuggestions) {
                            const suggestion = this.colorSuggestions[idx];
                            if (suggestion && this.originalPerlerColors[by][bx].name === suggestion.originalColor.name) {
                                this.previewPerlerColors[by][bx] = suggestion.replacementColor;
                            }
                        }
                    }
                }
            }
        }
        
        this.drawOptimizationPreview();
        this.renderSuggestionsList(); // 同步更新优化列表
    }
    
    regenerateSuggestions() {
        // 先恢复预览颜色到原始
        this.previewPerlerColors = this.originalPerlerColors.map(row => [...row]);
        
        this.colorSuggestions = this.generateColorSuggestions();
        this.acceptedSuggestions = new Set();
        this.rejectedSuggestions = new Set();
        this.erasedBlocks.clear();
        
        for (let i = 0; i < this.colorSuggestions.length; i++) {
            if (this.colorSuggestions[i].isMerge) {
                this.acceptedSuggestions.add(i);
                this.applySuggestion(i);
            }
        }
        
        this.renderOptimizationSummary();
        this.renderSuggestionsList();
        this.drawOptimizationPreview();
    }
    
    debouncedRegenerateSuggestions() {
        if (this.regenerateDebounceTimer) {
            clearTimeout(this.regenerateDebounceTimer);
        }
        this.regenerateDebounceTimer = setTimeout(() => {
            this.regenerateSuggestions();
        }, 300); // 300ms 防抖延迟
    }
    
    drawOptimizationPreview() {
        // 限制最大尺寸，防止图片太大破坏布局
        const MAX_CANVAS_WIDTH = 600;
        const MAX_CANVAS_HEIGHT = 600;
        
        // 计算基础单元格大小
        let cellSize = Math.min(
            Math.floor(600 / Math.max(this.perlerWidth, this.perlerHeight)),
            35
        );
        
        let canvasWidth = this.perlerWidth * cellSize;
        let canvasHeight = this.perlerHeight * cellSize;
        
        // 检查是否超过最大尺寸，如果超过则按比例缩小
        if (canvasWidth > MAX_CANVAS_WIDTH || canvasHeight > MAX_CANVAS_HEIGHT) {
            const scaleX = MAX_CANVAS_WIDTH / canvasWidth;
            const scaleY = MAX_CANVAS_HEIGHT / canvasHeight;
            const scale = Math.min(scaleX, scaleY);
            cellSize = Math.max(1, Math.floor(cellSize * scale));
            canvasWidth = this.perlerWidth * cellSize;
            canvasHeight = this.perlerHeight * cellSize;
        }
        
        this.optimizationPreviewCanvas.width = canvasWidth;
        this.optimizationPreviewCanvas.height = canvasHeight;
        
        this.optimizationCanvasWidth = canvasWidth;
        this.optimizationCanvasHeight = canvasHeight;
        this.optimizationCellSize = cellSize;
        
        // 更新画笔光标大小
        this.updateBrushCursorSize();
        
        const ctx = this.optimizationPreviewCtx;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // 先确定哪些颜色会被替换
        const colorsToReplace = new Set();
        for (const idx of this.acceptedSuggestions) {
            const suggestion = this.colorSuggestions[idx];
            if (suggestion) {
                colorsToReplace.add(suggestion.originalColor.name);
            }
        }
        
        for (let y = 0; y < this.perlerHeight; y++) {
            for (let x = 0; x < this.perlerWidth; x++) {
                const originalColor = this.originalPerlerColors[y][x];
                const key = `${x},${y}`;
                const isErased = this.erasedBlocks.has(key);
                
                let displayColor;
                let willBeReplaced = false;
                
                // 直接使用预览矩阵中的颜色
                displayColor = this.previewPerlerColors[y][x];
                
                // 判断是否会被替换（用于显示边框）
                if (!isErased && colorsToReplace.has(originalColor.name)) {
                    willBeReplaced = true;
                }
                
                if (displayColor.isTransparent) {
                    ctx.fillStyle = '#ffffff';
                } else {
                    ctx.fillStyle = `rgb(${displayColor.rgb[0]}, ${displayColor.rgb[1]}, ${displayColor.rgb[2]})`;
                }
                ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
                
                // 根据状态显示边框
                if (isErased) {
                    // 自定义取消优化颜色
                    ctx.strokeStyle = this.optimizeErasedColor.value;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x * cellSize + 1, y * cellSize + 1, cellSize - 3, cellSize - 3);
                } else if (willBeReplaced) {
                    // 自定义将要优化颜色
                    ctx.strokeStyle = this.optimizeHighlightColor.value;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x * cellSize + 1, y * cellSize + 1, cellSize - 3, cellSize - 3);
                }
            }
        }
    }

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        
        if (this.isFullscreen) {
            this.smartOptimizeModal.classList.add('fullscreen');
            this.toggleFullscreenBtn.textContent = '🗖️';
            this.toggleFullscreenBtn.title = '退出全屏';
            // 全屏模式下，确保头部始终可见
            document.body.style.overflow = 'hidden';
        } else {
            this.smartOptimizeModal.classList.remove('fullscreen');
            this.toggleFullscreenBtn.textContent = '🔍';
            this.toggleFullscreenBtn.title = '全屏切换';
            document.body.style.overflow = '';
        }
        
        // 重新绘制预览图以适应新尺寸
        this.drawOptimizationPreview();
    }
    
    // 更新画笔光标大小
    updateBrushCursorSize() {
        if (!this.brushCursor) return;
        
        const brushSize = parseInt(this.optimizeBrushSizeSlider.value);
        const size = brushSize * this.optimizationCellSize;
        
        this.brushCursor.style.width = size + 'px';
        this.brushCursor.style.height = size + 'px';
    }
    
    // 更新画笔光标位置
    updateBrushCursorPosition(e) {
        if (!this.brushCursor) return;
        
        const rect = this.optimizationPreviewCanvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        const brushSize = parseInt(this.optimizeBrushSizeSlider.value);
        const size = brushSize * this.optimizationCellSize;
        
        const x = clientX - rect.left - size / 2;
        const y = clientY - rect.top - size / 2;
        
        this.brushCursor.style.left = x + 'px';
        this.brushCursor.style.top = y + 'px';
    }
    
    // 更新自定义编辑画笔光标大小
    updateCustomEditBrushCursorSize() {
        if (!this.customEditBrushCursor) return;
        
        // 连锁剃刀固定为1个格子
        let brushSize;
        if (this.currentEditTool === 'chainRazor') {
            brushSize = 1;
        } else {
            brushSize = parseInt(this.customEditBrushSize.value);
        }
        
        const size = brushSize * this.customEditCellSize;
        
        this.customEditBrushCursor.style.width = size + 'px';
        this.customEditBrushCursor.style.height = size + 'px';
    }
    
    // 更新自定义编辑画笔光标位置
    updateCustomEditBrushCursorPosition(e) {
        if (!this.customEditBrushCursor) return;
        
        const rect = this.customEditCanvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        // 连锁剃刀固定为1个格子
        let brushSize;
        if (this.currentEditTool === 'chainRazor') {
            brushSize = 1;
        } else {
            brushSize = parseInt(this.customEditBrushSize.value);
        }
        
        const size = brushSize * this.customEditCellSize;
        
        const x = clientX - rect.left - size / 2;
        const y = clientY - rect.top - size / 2;
        
        this.customEditBrushCursor.style.left = x + 'px';
        this.customEditBrushCursor.style.top = y + 'px';
    }
    
    // ==================== 画布边界调整相关方法 ====================
    
    updateCanvasBoundsInputs() {
        if (!this.canvasBounds) return;
        this.canvasBoundsLeftInput.value = this.canvasBounds.left;
        this.canvasBoundsRightInput.value = this.canvasBounds.right;
        this.canvasBoundsTopInput.value = this.canvasBounds.top;
        this.canvasBoundsBottomInput.value = this.canvasBounds.bottom;
    }
    
    updateCanvasBoundsDisplay() {
        if (!this.canvasBounds) return;
        const displayWidth = this.canvasBounds.right - this.canvasBounds.left;
        const displayHeight = this.canvasBounds.bottom - this.canvasBounds.top;
        this.canvasBoundsCurrentSize.textContent = `${displayWidth} × ${displayHeight}`;
    }
    
    resetCanvasBounds() {
        if (!this.canvasBounds) return;
        this.canvasBounds.left = 0;
        this.canvasBounds.right = this.canvasBounds.originalWidth;
        this.canvasBounds.top = 0;
        this.canvasBounds.bottom = this.canvasBounds.originalHeight;
        this.updateCanvasBoundsInputs();
        this.updateCanvasBoundsDisplay();
        this.drawCustomEditCanvas();
    }
    
    updateCanvasBoundsHandlesPosition() {
        if (!this.canvasBounds || !this.canvasBoundsHandles) return;
        
        const cellSize = parseInt(this.beadSizeSlider.value);
        const coordSize = Math.max(30, Math.floor(cellSize * 1.4));
        const left = coordSize + this.canvasBounds.left * cellSize;
        const right = coordSize + this.canvasBounds.right * cellSize;
        const top = coordSize + this.canvasBounds.top * cellSize;
        const bottom = coordSize + this.canvasBounds.bottom * cellSize;
        
        // 更新手柄大小和位置
        const handles = this.canvasBoundsHandles.querySelectorAll('.canvas-bounds-handle');
        handles.forEach(handle => {
            const handleType = handle.dataset.handle;
            let handleLeft, handleTop;
            
            switch (handleType) {
                case 'tl':
                    handleLeft = left - 6;
                    handleTop = top - 6;
                    break;
                case 'tr':
                    handleLeft = right - 6;
                    handleTop = top - 6;
                    break;
                case 'bl':
                    handleLeft = left - 6;
                    handleTop = bottom - 6;
                    break;
                case 'br':
                    handleLeft = right - 6;
                    handleTop = bottom - 6;
                    break;
                case 't':
                    handleLeft = (left + right) / 2 - 6;
                    handleTop = top - 6;
                    break;
                case 'r':
                    handleLeft = right - 6;
                    handleTop = (top + bottom) / 2 - 6;
                    break;
                case 'b':
                    handleLeft = (left + right) / 2 - 6;
                    handleTop = bottom - 6;
                    break;
                case 'l':
                    handleLeft = left - 6;
                    handleTop = (top + bottom) / 2 - 6;
                    break;
            }
            
            handle.style.left = handleLeft + 'px';
            handle.style.top = handleTop + 'px';
        });
    }
    
    initCanvasBoundsDragEvents() {
        const handles = this.canvasBoundsHandles.querySelectorAll('.canvas-bounds-handle');
        
        handles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.isDraggingCanvasBounds = true;
                this.draggingHandle = handle.dataset.handle;
                
                // 开始拖拽时保存历史记录
                this.saveCustomEditHistory();
            });
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!this.isDraggingCanvasBounds || !this.canvasBounds) return;
            
            const rect = this.customEditCanvas.getBoundingClientRect();
            const cellSize = parseInt(this.beadSizeSlider.value);
            const coordSize = Math.max(30, Math.floor(cellSize * 1.4));
            const clientX = e.clientX - rect.left - coordSize;
            const clientY = e.clientY - rect.top - coordSize;
            
            // 计算网格对齐的位置
            const gridX = Math.max(0, Math.min(this.canvasBounds.originalWidth, Math.round(clientX / cellSize)));
            const gridY = Math.max(0, Math.min(this.canvasBounds.originalHeight, Math.round(clientY / cellSize)));
            
            let newLeft = this.canvasBounds.left;
            let newRight = this.canvasBounds.right;
            let newTop = this.canvasBounds.top;
            let newBottom = this.canvasBounds.bottom;
            
            switch (this.draggingHandle) {
                case 'tl':
                    newLeft = Math.min(gridX, this.canvasBounds.right - 1);
                    newTop = Math.min(gridY, this.canvasBounds.bottom - 1);
                    break;
                case 'tr':
                    newRight = Math.max(gridX, this.canvasBounds.left + 1);
                    newTop = Math.min(gridY, this.canvasBounds.bottom - 1);
                    break;
                case 'bl':
                    newLeft = Math.min(gridX, this.canvasBounds.right - 1);
                    newBottom = Math.max(gridY, this.canvasBounds.top + 1);
                    break;
                case 'br':
                    newRight = Math.max(gridX, this.canvasBounds.left + 1);
                    newBottom = Math.max(gridY, this.canvasBounds.top + 1);
                    break;
                case 't':
                    newTop = Math.min(gridY, this.canvasBounds.bottom - 1);
                    break;
                case 'r':
                    newRight = Math.max(gridX, this.canvasBounds.left + 1);
                    break;
                case 'b':
                    newBottom = Math.max(gridY, this.canvasBounds.top + 1);
                    break;
                case 'l':
                    newLeft = Math.min(gridX, this.canvasBounds.right - 1);
                    break;
            }
            
            this.canvasBounds.left = newLeft;
            this.canvasBounds.right = newRight;
            this.canvasBounds.top = newTop;
            this.canvasBounds.bottom = newBottom;
            
            this.updateCanvasBoundsInputs();
            this.updateCanvasBoundsDisplay();
            this.drawCustomEditCanvas();
        });
        
        document.addEventListener('mouseup', () => {
            if (this.isDraggingCanvasBounds) {
                this.isDraggingCanvasBounds = false;
                this.draggingHandle = null;
            }
        });
    }
    
    // ==================== 画布边界调整相关方法结束 ====================
    
    closeSmartOptimizeModal(restoreOriginal = true) {
        this.smartOptimizeModal.style.display = 'none';
        // 退出全屏模式
        if (this.isFullscreen) {
            this.isFullscreen = false;
            this.smartOptimizeModal.classList.remove('fullscreen');
            this.toggleFullscreenBtn.textContent = '🔍';
            this.toggleFullscreenBtn.title = '全屏切换';
        }
        if (this.originalPerlerColors && restoreOriginal) {
            this.perlerColors = this.originalPerlerColors.map(row => [...row]);
            this.drawPerlerChartSync(this.perlerColors, this.perlerWidth, this.perlerHeight, this.colorSetSelect.value);
            this.drawColorLegend();
        }
        this.initCustomEditData();
    }

    generateColorSuggestions() {
        const suggestions = [];
        const colorSetName = this.colorSetSelect.value;
        const colorSet = colorSets[colorSetName];
        const enableMerge = this.enableColorMerge.checked;
        const mergeThreshold = parseInt(this.colorMergeThresholdSlider.value);
        const enableEdgeColorMerge = this.enableEdgeColorMerge.checked;
        const edgeColorThreshold = parseInt(this.edgeColorThresholdSlider.value);
        
        console.log('[智能优化] 开始生成建议');
        console.log('[智能优化] 颜色集:', colorSetName);
        console.log('[智能优化] 近似色融合:', enableMerge);
        console.log('[智能优化] 近似色融合相似度:', mergeThreshold);
        console.log('[智能优化] 边缘色融合:', enableEdgeColorMerge);
        console.log('[智能优化] 边缘色融合相似度:', edgeColorThreshold);
        
        const colorUsage = new Map();
        for (let y = 0; y < this.perlerHeight; y++) {
            for (let x = 0; x < this.perlerWidth; x++) {
                const color = this.perlerColors[y][x];
                colorUsage.set(color.name, (colorUsage.get(color.name) || 0) + 1);
            }
        }
        
        const totalBeans = this.perlerWidth * this.perlerHeight;
        const usageThreshold = Math.max(2, Math.floor(totalBeans * 0.005));
        
        console.log('[智能优化] 总豆豆数:', totalBeans);
        console.log('[智能优化] 使用阈值:', usageThreshold);
        console.log('[智能优化] 颜色使用情况:', Object.fromEntries(colorUsage));
        
        const colorsByUsage = Array.from(colorUsage.entries())
            .sort((a, b) => a[1] - b[1]);
        
        const highUsageColors = colorsByUsage
            .filter(([_, count]) => count > usageThreshold * 2)
            .map(([name]) => colorSet.find(c => c.name === name))
            .filter(Boolean);
        
        console.log('[智能优化] 高使用颜色数:', highUsageColors.length);
        console.log('[智能优化] 高使用颜色:', highUsageColors.map(c => c.name));
        
        if (enableMerge) {
            const mergeSuggestions = this.generateMergeSuggestions(colorsByUsage, colorSet, mergeThreshold);
            suggestions.push(...mergeSuggestions);
        }
        
        const processedColors = new Set(suggestions.map(s => s.originalColor.name));
        
        // 计算边缘色阈值 - 使用和近似色融合相同的计算方式
        // 范围：0-约441，50% -> 220.5，100% -> 0
        const edgeEffectiveThreshold = ((100 - edgeColorThreshold) / 100) * (255 * 3);
        // 非边缘色使用固定阈值，对应大约 85% 的相似度
        const normalEffectiveThreshold = ((100 - 85) / 100) * (255 * 3);
        
        console.log('[智能优化] 边缘色融合阈值:', edgeEffectiveThreshold, ', 非边缘色阈值:', normalEffectiveThreshold);
        
        for (const [colorName, count] of colorsByUsage) {
            if (processedColors.has(colorName)) continue;
            
            console.log(`[智能优化] 处理颜色 ${colorName}, 数量: ${count}`);
            if (count >= usageThreshold * 2) {
                console.log(`[智能优化] 跳过 ${colorName}: 数量 ${count} >= 高使用阈值 ${usageThreshold * 2}`);
                continue;
            }
            
            const originalColor = colorSet.find(c => c.name === colorName);
            if (!originalColor) {
                console.log(`[智能优化] 跳过 ${colorName}: 未在颜色集中找到`);
                continue;
            }
            
            const isEdgeColor = this.isColorOnEdge(colorName);
            
            // 如果是边缘色但禁用了边缘色融合，则跳过
            if (isEdgeColor && !enableEdgeColorMerge) {
                console.log(`[智能优化] 跳过 ${colorName}: 是边缘色但边缘色融合被禁用`);
                continue;
            }
            
            let bestReplacement = null;
            let minDistance = Infinity;
            
            for (const candidate of highUsageColors) {
                if (candidate.name === colorName) continue;
                
                // 使用和近似色融合一样的距离计算方式
                const distance = this.getRgbDistance(originalColor.rgb, candidate.rgb);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestReplacement = candidate;
                }
            }
            
            const effectiveThreshold = isEdgeColor ? edgeEffectiveThreshold : normalEffectiveThreshold;
            
            console.log(`[智能优化] ${colorName} -> 最佳替换: ${bestReplacement ? bestReplacement.name : '无'}, 距离: ${minDistance}, 阈值: ${effectiveThreshold}, 边缘色: ${isEdgeColor}`);
            
            if (bestReplacement && minDistance <= effectiveThreshold) {
                suggestions.push({
                    id: suggestions.length,
                    originalColor,
                    replacementColor: bestReplacement,
                    beanCount: count,
                    isEdgeColor,
                    accepted: false,
                    isMerge: false
                });
            }
        }
        
        console.log('[智能优化] 最终建议数:', suggestions.length);
        return suggestions.sort((a, b) => {
            if (a.isMerge && !b.isMerge) return -1;
            if (!a.isMerge && b.isMerge) return 1;
            return a.beanCount - b.beanCount;
        });
    }
    
    // ==================== 旧算法（保留纪念）====================
    // 这是原始的贪心算法，按颜色使用量顺序遍历，存在次优配对问题
    // 问题：h1-h2(99%) 但 h1-h3(85%) 先被遍历到，就会配对 h1-h3 而错过最优配对
    // 保留日期：2026-05-18
    /*
    generateMergeSuggestions(colorsByUsage, colorSet, mergeThreshold) {
        const suggestions = [];
        const rgbDistanceThreshold = ((100 - mergeThreshold) / 100) * 255 * 3;
        
        console.log('[近似色融合] 开始生成融合建议');
        console.log('[近似色融合] RGB距离阈值:', rgbDistanceThreshold);
        
        const mergedPairs = new Set();
        
        for (let i = 0; i < colorsByUsage.length; i++) {
            const [nameA, countA] = colorsByUsage[i];
            if (mergedPairs.has(nameA)) continue;
            
            const colorA = colorSet.find(c => c.name === nameA);
            if (!colorA) continue;
            
            let bestMerge = null;
            let minDistance = Infinity;
            let bestCount = 0;
            
            for (let j = i + 1; j < colorsByUsage.length; j++) {
                const [nameB, countB] = colorsByUsage[j];
                if (mergedPairs.has(nameB)) continue;
                
                const colorB = colorSet.find(c => c.name === nameB);
                if (!colorB) continue;
                
                const distance = this.getRgbDistance(colorA.rgb, colorB.rgb);
                
                if (distance <= rgbDistanceThreshold && distance < minDistance) {
                    minDistance = distance;
                    bestMerge = { color: colorB, name: nameB, count: countB };
                    bestCount = countB;
                }
            }
            
            if (bestMerge) {
                const keepColor = countA >= bestCount ? colorA : bestMerge.color;
                const mergeColor = countA >= bestCount ? bestMerge.color : colorA;
                
                suggestions.push({
                    id: suggestions.length,
                    originalColor: mergeColor,
                    replacementColor: keepColor,
                    beanCount: countA >= bestCount ? bestCount : countA,
                    isEdgeColor: false,
                    accepted: true,
                    isMerge: true
                });
                
                mergedPairs.add(nameA);
                mergedPairs.add(bestMerge.name);
                
                console.log(`[近似色融合] ${mergeColor.name} -> ${keepColor.name}, 距离: ${minDistance.toFixed(1)}`);
            }
        }
        
        console.log('[近似色融合] 融合建议数:', suggestions.length);
        return suggestions;
    }
    */

    // ==================== 新算法（全局最优配对）====================
    // 改进思路：
    // 1. 先生成所有满足相似度阈值的候选配对
    // 2. 按相似度从高到低排序（距离越小，相似度越高）
    // 3. 贪心选择最优配对：最相似的颜色对优先被配对
    generateMergeSuggestions(colorsByUsage, colorSet, mergeThreshold) {
        const suggestions = [];
        const rgbDistanceThreshold = ((100 - mergeThreshold) / 100) * 255 * 3;
        
        console.log('[近似色融合][新算法] 开始生成融合建议');
        console.log('[近似色融合][新算法] RGB距离阈值:', rgbDistanceThreshold);
        
        // 1. 生成所有满足阈值的候选配对
        const candidates = [];
        for (let i = 0; i < colorsByUsage.length; i++) {
            const [nameA, countA] = colorsByUsage[i];
            const colorA = colorSet.find(c => c.name === nameA);
            if (!colorA) continue;
            
            for (let j = i + 1; j < colorsByUsage.length; j++) {
                const [nameB, countB] = colorsByUsage[j];
                const colorB = colorSet.find(c => c.name === nameB);
                if (!colorB) continue;
                
                const distance = this.getRgbDistance(colorA.rgb, colorB.rgb);
                
                if (distance <= rgbDistanceThreshold) {
                    candidates.push({
                        colorA: colorA,
                        nameA: nameA,
                        countA: countA,
                        colorB: colorB,
                        nameB: nameB,
                        countB: countB,
                        distance: distance
                    });
                }
            }
        }
        
        console.log('[近似色融合][新算法] 候选配对数:', candidates.length);
        
        // 2. 按相似度从高到低排序（距离越小越靠前）
        candidates.sort((a, b) => a.distance - b.distance);
        
        // 3. 贪心选择最优配对
        const used = new Set();
        for (const candidate of candidates) {
            if (used.has(candidate.nameA) || used.has(candidate.nameB)) continue;
            
            // 选择使用量大的颜色作为保留颜色
            const keepColor = candidate.countA >= candidate.countB ? candidate.colorA : candidate.colorB;
            const mergeColor = candidate.countA >= candidate.countB ? candidate.colorB : candidate.colorA;
            const mergeCount = candidate.countA >= candidate.countB ? candidate.countB : candidate.countA;
            
            suggestions.push({
                id: suggestions.length,
                originalColor: mergeColor,
                replacementColor: keepColor,
                beanCount: mergeCount,
                isEdgeColor: false,
                accepted: true,
                isMerge: true
            });
            
            used.add(candidate.nameA);
            used.add(candidate.nameB);
            
            console.log(`[近似色融合][新算法] ${mergeColor.name} -> ${keepColor.name}, 距离: ${candidate.distance.toFixed(1)}`);
        }
        
        console.log('[近似色融合][新算法] 融合建议数:', suggestions.length);
        return suggestions;
    }
    
    getRgbDistance(rgb1, rgb2) {
        const dr = rgb1[0] - rgb2[0];
        const dg = rgb1[1] - rgb2[1];
        const db = rgb1[2] - rgb2[2];
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }
    
    isColorOnEdge(colorName) {
        let edgeCount = 0;
        let totalCount = 0;
        
        for (let y = 0; y < this.perlerHeight; y++) {
            for (let x = 0; x < this.perlerWidth; x++) {
                if (this.perlerColors[y][x].name === colorName) {
                    totalCount++;
                    
                    let differentNeighbors = 0;
                    const neighbors = [
                        [y - 1, x],
                        [y + 1, x],
                        [y, x - 1],
                        [y, x + 1]
                    ];
                    
                    for (const [ny, nx] of neighbors) {
                        if (ny >= 0 && ny < this.perlerHeight && nx >= 0 && nx < this.perlerWidth) {
                            if (this.perlerColors[ny][nx].name !== colorName) {
                                differentNeighbors++;
                            }
                        }
                    }
                    
                    if (differentNeighbors >= 2) {
                        edgeCount++;
                    }
                }
            }
        }
        
        return totalCount > 0 && edgeCount / totalCount > 0.3;
    }

    renderOptimizationSummary() {
        const originalColors = new Set();
        for (let y = 0; y < this.perlerHeight; y++) {
            for (let x = 0; x < this.perlerWidth; x++) {
                originalColors.add(this.perlerColors[y][x].name);
            }
        }
        
        const acceptedCount = this.acceptedSuggestions.size;
        const replacedColors = new Set();
        for (const idx of this.acceptedSuggestions) {
            replacedColors.add(this.colorSuggestions[idx].originalColor.name);
        }
        
        const suggestedColors = originalColors.size - replacedColors.size;
        
        this.optimizationSummary.innerHTML = `
            <div class="summary-item">
                <span class="summary-label">${getI18nText('originalColors')}:</span>
                <span class="summary-value">${originalColors.size}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">${getI18nText('suggestedColors')}:</span>
                <span class="summary-value">${suggestedColors}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">${getI18nText('colorReduction')}:</span>
                <span class="summary-value">${originalColors.size - suggestedColors}</span>
            </div>
        `;
    }

    // 计算某个颜色被取消优化的方块数量
    getErasedCountForColor(colorName) {
        let count = 0;
        for (const key of this.erasedBlocks) {
            const [x, y] = key.split(',').map(Number);
            if (this.originalPerlerColors[y][x].name === colorName) {
                count++;
            }
        }
        return count;
    }
    
    renderSuggestionsList() {
        if (this.colorSuggestions.length === 0) {
            this.suggestionsList.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">没有可优化的建议</p>';
            return;
        }
        
        const html = this.colorSuggestions.map((suggestion, index) => {
            const statusClass = this.acceptedSuggestions.has(index) ? 'accepted' : 
                             this.rejectedSuggestions.has(index) ? 'rejected' : '';
            const edgeIndicator = suggestion.isEdgeColor ? '🔍 边缘色' : '';
            const mergeIndicator = suggestion.isMerge ? '🔄 近似色融合' : '';
            const erasedCount = this.getErasedCountForColor(suggestion.originalColor.name);
            const erasedIndicator = erasedCount > 0 ? `<span style="margin-left: 10px; font-size: 0.85em; color: #27ae60;">🟢 ${erasedCount}个取消优化</span>` : '';
            
            return `
                <div class="suggestion-item ${statusClass} ${suggestion.isMerge ? 'merge-suggestion' : ''}" data-index="${index}">
                    <div class="color-swatch-small" style="background-color: rgb(${suggestion.originalColor.rgb[0]}, ${suggestion.originalColor.rgb[1]}, ${suggestion.originalColor.rgb[2]});"></div>
                    <div class="suggestion-info">
                        <div class="suggestion-text">
                            <span>${suggestion.originalColor.name}</span>
                            <span class="arrow">→</span>
                            <div class="color-swatch-small" style="background-color: rgb(${suggestion.replacementColor.rgb[0]}, ${suggestion.replacementColor.rgb[1]}, ${suggestion.replacementColor.rgb[2]}); width: 24px; height: 24px;"></div>
                            <span>${suggestion.replacementColor.name}</span>
                            ${mergeIndicator ? `<span style="margin-left: 10px; font-size: 0.85em; color: #667eea;">${mergeIndicator}</span>` : ''}
                            ${edgeIndicator ? `<span style="margin-left: 10px; font-size: 0.85em; color: #ff6b00;">${edgeIndicator}</span>` : ''}
                            ${erasedIndicator}
                        </div>
                        <div class="suggestion-beans">
                            ${getI18nText('beansAffected')}: ${suggestion.beanCount} ${getI18nText('beans')}
                            ${erasedCount > 0 ? ` <span style="color: #27ae60;">(其中${erasedCount}个已取消优化)</span>` : ''}
                        </div>
                    </div>
                    <div class="suggestion-actions">
                        <button class="suggestion-action-btn preview" data-index="${index}">${getI18nText('preview')}</button>
                        <button class="suggestion-action-btn accept" data-index="${index}">${getI18nText('accept')}</button>
                        <button class="suggestion-action-btn reject" data-index="${index}">${getI18nText('reject')}</button>
                    </div>
                </div>
            `;
        }).join('');
        
        this.suggestionsList.innerHTML = html;
        
        this.suggestionsList.querySelectorAll('.suggestion-action-btn.accept').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(btn.dataset.index);
                this.acceptSuggestion(index);
            });
        });
        
        this.suggestionsList.querySelectorAll('.suggestion-action-btn.reject').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(btn.dataset.index);
                this.rejectSuggestion(index);
            });
        });
        
        this.suggestionsList.querySelectorAll('.suggestion-action-btn.preview').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(btn.dataset.index);
                this.previewSuggestion(index);
            });
        });
    }

    acceptSuggestion(index) {
        if (this.rejectedSuggestions.has(index)) {
            this.rejectedSuggestions.delete(index);
        }
        if (!this.acceptedSuggestions.has(index)) {
            this.acceptedSuggestions.add(index);
            this.applySuggestion(index);
        }
        this.renderOptimizationSummary();
        this.renderSuggestionsList();
        this.drawOptimizationPreview();
    }

    rejectSuggestion(index) {
        if (this.acceptedSuggestions.has(index)) {
            this.acceptedSuggestions.delete(index);
            this.restoreSuggestion(index);
        }
        this.rejectedSuggestions.add(index);
        this.renderOptimizationSummary();
        this.renderSuggestionsList();
        this.drawOptimizationPreview();
    }

    acceptAllSuggestions() {
        this.rejectedSuggestions.clear();
        for (let i = 0; i < this.colorSuggestions.length; i++) {
            this.acceptedSuggestions.add(i);
            this.applySuggestion(i);
        }
        this.renderOptimizationSummary();
        this.renderSuggestionsList();
        this.drawOptimizationPreview();
    }

    rejectAllSuggestions() {
        for (const index of this.acceptedSuggestions) {
            this.restoreSuggestion(index);
        }
        this.acceptedSuggestions.clear();
        this.rejectedSuggestions = new Set(this.colorSuggestions.map((_, i) => i));
        this.renderOptimizationSummary();
        this.renderSuggestionsList();
        this.drawOptimizationPreview();
    }

    applySuggestion(index) {
        const suggestion = this.colorSuggestions[index];
        for (let y = 0; y < this.perlerHeight; y++) {
            for (let x = 0; x < this.perlerWidth; x++) {
                const key = `${x},${y}`;
                // 跳过被取消优化的方块
                if (this.erasedBlocks.has(key)) {
                    continue;
                }
                if (this.previewPerlerColors[y][x].name === suggestion.originalColor.name) {
                    this.previewPerlerColors[y][x] = suggestion.replacementColor;
                }
            }
        }
        this.drawOptimizationPreview();
    }

    restoreSuggestion(index) {
        const suggestion = this.colorSuggestions[index];
        for (let y = 0; y < this.perlerHeight; y++) {
            for (let x = 0; x < this.perlerWidth; x++) {
                const key = `${x},${y}`;
                // 跳过被取消优化的方块
                if (this.erasedBlocks.has(key)) {
                    continue;
                }
                if (this.originalPerlerColors[y][x].name === suggestion.originalColor.name) {
                    this.previewPerlerColors[y][x] = this.originalPerlerColors[y][x];
                }
            }
        }
        this.drawOptimizationPreview();
    }

    previewSuggestion(index) {
        const suggestion = this.colorSuggestions[index];
        const tempColors = this.previewPerlerColors.map(row => [...row]);
        
        for (let y = 0; y < this.perlerHeight; y++) {
            for (let x = 0; x < this.perlerWidth; x++) {
                const key = `${x},${y}`;
                // 跳过被取消优化的方块
                if (this.erasedBlocks.has(key)) {
                    continue;
                }
                if (tempColors[y][x].name === suggestion.originalColor.name) {
                    tempColors[y][x] = suggestion.replacementColor;
                }
            }
        }
        
        this.drawPerlerChartSync(tempColors, this.perlerWidth, this.perlerHeight, this.colorSetSelect.value);
    }

    updateColorCounts() {
        this.colorCounts = {};
        for (let y = 0; y < this.perlerHeight; y++) {
            for (let x = 0; x < this.perlerWidth; x++) {
                const color = this.perlerColors[y][x];
                if (this.colorCounts[color.name]) {
                    this.colorCounts[color.name]++;
                } else {
                    this.colorCounts[color.name] = 1;
                }
            }
        }
    }

    confirmOptimization() {
        // 把预览矩阵应用到真实数据
        this.perlerColors = this.previewPerlerColors.map(row => [...row]);
        
        // 更新计数和主画布
        this.updateColorCounts();
        this.drawPerlerChartSync(this.perlerColors, this.perlerWidth, this.perlerHeight, this.colorSetSelect.value);
        this.drawColorLegend();
        
        const acceptedCount = this.acceptedSuggestions.size;
        const description = acceptedCount > 0 
            ? `替换了 ${acceptedCount} 个颜色（${this.erasedBlocks.size} 个方块保留原样）` 
            : '未做任何修改';
        
        this.saveUnifiedSnapshot('smart', description);
        this.closeSmartOptimizeModal(false);
    }
    
    saveUnifiedSnapshot(type, description = '', data = null) {
        let perlerColors;
        if (data) {
            perlerColors = data;
        } else if (type === 'custom' && this.customEditData) {
            perlerColors = this.customEditData;
        } else if (this.perlerColors) {
            perlerColors = this.perlerColors;
        } else {
            return;
        }

        // 检查和上一个同类型快照是否一致，如果一致就不保存
        const lastSnapshotOfType = this.unifiedSnapshots
            .slice()
            .reverse()
            .find(s => s.type === type);
        
        if (lastSnapshotOfType) {
            let isEqual = true;
            // 比较颜色矩阵是否完全一致
            for (let y = 0; y < perlerColors.length; y++) {
                for (let x = 0; x < perlerColors[y].length; x++) {
                    const c1 = perlerColors[y][x];
                    const c2 = lastSnapshotOfType.data[y][x];
                    
                    if ((c1.isTransparent !== c2.isTransparent) ||
                        (c1.name !== c2.name) ||
                        (JSON.stringify(c1.rgb) !== JSON.stringify(c2.rgb))) {
                        isEqual = false;
                        break;
                    }
                }
                if (!isEqual) break;
            }
            
            if (isEqual) {
                // 数据一致，不保存新快照
                return;
            }
        }
        
        const snapshotId = Date.now();
        const timestamp = new Date().toLocaleString();
        
        // 计算颜色数量和总拼豆数
        const colorCounts = {};
        let totalBeans = 0;
        perlerColors.forEach(row => {
            row.forEach(color => {
                if (!color.isTransparent) {
                    const name = color.name || 'unknown';
                    colorCounts[name] = (colorCounts[name] || 0) + 1;
                    totalBeans++;
                }
            });
        });
        const colorCount = Object.keys(colorCounts).length;
        
        // 计算与上一个快照的变化量
        let colorChange = null;
        let beansChange = null;
        if (this.unifiedSnapshots.length > 0) {
            const lastSnapshot = this.unifiedSnapshots[this.unifiedSnapshots.length - 1];
            colorChange = colorCount - lastSnapshot.colorCount;
            beansChange = totalBeans - lastSnapshot.totalBeans;
        }
        
        this.unifiedSnapshots.push({
            id: snapshotId,
            type,
            timestamp,
            colorCount,
            totalBeans,
            colorChange,
            beansChange,
            description,
            data: perlerColors.map(row => [...row])
        });
        
        if (this.unifiedSnapshots.length > 50) {
            this.unifiedSnapshots.shift();
        }
        
        this.renderUnifiedSnapshotsList();
        if (this.snapshotsList) {
            this.snapshotsList.style.display = 'block';
        }
    }
    
    renderUnifiedSnapshotsList() {
        if (!this.snapshotsContainer) return;
        
        this.snapshotsContainer.innerHTML = '';
        
        if (this.unifiedSnapshots.length === 0) {
            this.snapshotsContainer.innerHTML = `
                <div style="text-align: center; color: #999; padding: 40px 20px;">
                    暂无操作历史
                </div>
            `;
            return;
        }
        
        // 按倒序显示（最新的在最上面）
        const reversedSnapshots = [...this.unifiedSnapshots].reverse();
        
        reversedSnapshots.forEach((snapshot, index) => {
            const realIndex = this.unifiedSnapshots.length - 1 - index;
            const item = document.createElement('div');
            item.className = 'snapshot-item';
            
            const typeIcon = snapshot.type === 'custom' ? '🎨' : '🔧';
            const typeText = snapshot.type === 'custom' ? '自定义' : '智能优化';
            
            const colorChangeClass = snapshot.colorChange > 0 ? 'change-negative' : 'change-positive';
            const beansChangeClass = snapshot.beansChange > 0 ? 'change-negative' : 'change-positive';
            
            const colorChangeText = snapshot.colorChange !== null 
                ? `<span class="${colorChangeClass}">${snapshot.colorChange > 0 ? `+${snapshot.colorChange}` : snapshot.colorChange}</span>` 
                : '';
            const beansChangeText = snapshot.beansChange !== null 
                ? `<span class="${beansChangeClass}">${snapshot.beansChange > 0 ? `+${snapshot.beansChange}` : snapshot.beansChange}</span>` 
                : '';
            
            const descText = snapshot.description ? `<div class="snapshot-item-desc">${snapshot.description}</div>` : '';
            
            item.innerHTML = `
                <div class="snapshot-item-info">
                    <div class="snapshot-item-title">
                        ${typeIcon} ${typeText} ${realIndex + 1}
                    </div>
                    <div class="snapshot-item-meta">
                        ${snapshot.timestamp}
                    </div>
                    <div class="snapshot-item-meta">
                        颜色: ${snapshot.colorCount}${colorChangeText ? ` (${colorChangeText})` : ''} | 
                        拼豆: ${snapshot.totalBeans}${beansChangeText ? ` (${beansChangeText})` : ''}
                    </div>
                    ${descText}
                </div>
                <div class="snapshot-item-actions">
                    <button class="btn btn-primary" data-snapshot-id="${snapshot.id}" data-action="restore">恢复</button>
                    <button class="btn btn-secondary" data-snapshot-id="${snapshot.id}" data-action="delete">删除</button>
                </div>
            `;
            
            item.querySelector('[data-action="restore"]').addEventListener('click', (e) => {
                e.stopPropagation();
                this.restoreUnifiedSnapshot(snapshot.id);
            });
            
            item.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteUnifiedSnapshot(snapshot.id);
            });
            
            this.snapshotsContainer.appendChild(item);
        });
    }
    
    toggleSnapshotPanel() {
        if (this.snapshotPanel.classList.contains('show')) {
            this.closePanel();
        } else {
            this.snapshotPanel.classList.add('show');
            this.renderUnifiedSnapshotsList();
        }
    }
    
    closePanel() {
        this.snapshotPanel.classList.remove('show');
    }
    
    restoreUnifiedSnapshot(snapshotId) {
        const snapshot = this.unifiedSnapshots.find(s => s.id === snapshotId);
        if (!snapshot) return;
        
        // 恢复拼豆颜色
        this.perlerColors = snapshot.data.map(row => [...row]);
        
        // 重新计算尺寸
        this.perlerHeight = this.perlerColors.length;
        this.perlerWidth = this.perlerHeight > 0 ? this.perlerColors[0].length : 0;
        
        // 无论是否在拼豆模式，都同步更新 customEditData 和 customEditHistory
        this.customEditData = this.perlerColors.map(row => [...row]);
        this.customEditHistory = [this.customEditData.map(row => [...row])];
        
        // 重新计算 colorCounts
        this.colorCounts = {};
        this.perlerColors.forEach(row => {
            row.forEach(color => {
                if (!color.isTransparent && color.name) {
                    if (this.colorCounts[color.name]) {
                        this.colorCounts[color.name]++;
                    } else {
                        this.colorCounts[color.name] = 1;
                    }
                }
            });
        });
        
        // 更新拼豆尺寸显示
        this.perlerSize.textContent = `${getI18nText('perlerSize')}: ${this.perlerWidth} × ${this.perlerHeight} ${getI18nText('beans')}`;
        
        // 重新绘制
        this.refreshPerlerChartDisplay();
        this.updateColorUsageList();
        
        // 绘制自定义画布
        if (this.customEditCanvas) {
            this.drawCustomEditCanvas();
        }
    }
    
    deleteUnifiedSnapshot(snapshotId) {
        this.unifiedSnapshots = this.unifiedSnapshots.filter(s => s.id !== snapshotId);
        if (this.unifiedSnapshots.length === 0 && this.snapshotsList) {
            this.snapshotsList.style.display = 'none';
        }
        this.renderUnifiedSnapshotsList();
    }
    
    // ==================== 雕刻分裂核心方法 ====================
    
    setPixelMode(carveMode) {
        this.carveMode = carveMode;
        
        if (carveMode) {
            this.pixelModeBtn.classList.remove('active');
            this.carveModeBtn.classList.add('active');
            this.carveControls.style.display = 'block';
            
            const pixelControls = document.querySelectorAll('#perlerOptions');
            if (pixelControls.length > 0) {
                pixelControls[0].style.display = 'none';
            }
            
            this.resetCarving();
        } else {
            this.carveModeBtn.classList.remove('active');
            this.pixelModeBtn.classList.add('active');
            this.carveControls.style.display = 'none';
            
            const pixelControls = document.querySelectorAll('#perlerOptions');
            if (pixelControls.length > 0) {
                pixelControls[0].style.display = 'block';
            }
            
            this.updatePixelatedImage();
        }
    }
    
    resetCarving() {
        if (!this.originalImage) return;
        
        this.carveBlocks = [];
        this.selectedBlocks.clear();
        
        const blockSize = this.initialBlockSize;
        const cols = Math.ceil(this.originalWidth / blockSize);
        const rows = Math.ceil(this.originalHeight / blockSize);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * blockSize;
                const y = row * blockSize;
                const w = Math.min(blockSize, this.originalWidth - x);
                const h = Math.min(blockSize, this.originalHeight - y);
                
                const color = this.getDominantColor(x, y, w, h);
                
                this.carveBlocks.push({
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
        
        this.updatePixelatedFromCarve();
        this.drawCarveBlocks();
    }
    
    getDominantColor(x, y, width, height) {
        if (!this.originalImageData || width <= 0 || height <= 0) {
            return { r: 255, g: 255, b: 255 };
        }
        
        x = Math.max(0, Math.floor(x));
        y = Math.max(0, Math.floor(y));
        width = Math.max(1, Math.min(Math.floor(width), this.originalWidth - x));
        height = Math.max(1, Math.min(Math.floor(height), this.originalHeight - y));
        
        const data = this.originalImageData.data;
        const imgWidth = this.originalWidth;
        
        let r = 0, g = 0, b = 0, count = 0;
        
        const step = Math.max(1, Math.floor(Math.sqrt(width * height) / 10));
        
        for (let py = 0; py < height; py += step) {
            for (let px = 0; px < width; px += step) {
                const idx = ((y + py) * imgWidth + (x + px)) * 4;
                r += data[idx];
                g += data[idx + 1];
                b += data[idx + 2];
                count++;
            }
        }
        
        if (count === 0) {
            return { r: 255, g: 255, b: 255 };
        }
        
        return {
            r: Math.round(r / count),
            g: Math.round(g / count),
            b: Math.round(b / count)
        };
    }
    
    handleCarveCanvasClick(e) {
        if (!this.carveMode) return;
        
        const rect = this.pixelatedCanvas.getBoundingClientRect();
        const scaleX = this.pixelatedCanvas.width / rect.width;
        const scaleY = this.pixelatedCanvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        const clickedBlock = this.carveBlocks.find(block => 
            x >= block.x && x < block.x + block.width && 
            y >= block.y && y < block.y + block.height
        );
        
        if (clickedBlock) {
            if (clickedBlock.width > this.minBlockSize || clickedBlock.height > this.minBlockSize) {
                this.splitBlock(clickedBlock);
            }
        }
    }
    
    splitAllBlocks() {
        let splitHappened = true;
        let iterations = 0;
        const maxIterations = 5;
        
        while (splitHappened && iterations < maxIterations) {
            splitHappened = false;
            const blocksToSplit = [...this.carveBlocks].filter(block => 
                block.width > this.minBlockSize || block.height > this.minBlockSize
            );
            
            if (blocksToSplit.length === 0) break;
            
            for (const block of blocksToSplit) {
                if (this.carveBlocks.includes(block)) {
                    this.splitBlock(block, false);
                    splitHappened = true;
                }
            }
            iterations++;
        }
        
        this.updatePixelatedFromCarve();
        this.drawCarveBlocks();
    }
    
    splitBlock(block, updateAfter = true) {
        if (block.width <= this.minBlockSize && block.height <= this.minBlockSize) return;
        
        const index = this.carveBlocks.indexOf(block);
        if (index === -1) return;
        
        this.carveBlocks.splice(index, 1);
        
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
        
        this.carveBlocks.splice(index, 0, ...newBlocks);
        block.children = newBlocks;
        
        if (updateAfter) {
            this.updatePixelatedFromCarve();
            this.drawCarveBlocks();
        }
    }
    
    mergeSelectedBlocks() {
        console.log('合并功能待实现');
    }
    
    updatePixelatedFromCarve() {
        this.pixelatedCanvas.width = this.originalWidth;
        this.pixelatedCanvas.height = this.originalHeight;
        
        this.pixelatedCtx.clearRect(0, 0, this.pixelatedCanvas.width, this.pixelatedCanvas.height);
        
        this.carveBlocks.forEach(block => {
            this.pixelatedCtx.fillStyle = `rgb(${block.color.r}, ${block.color.g}, ${block.color.b})`;
            this.pixelatedCtx.fillRect(block.x, block.y, block.width, block.height);
        });
        
        this.pixelatedSize.textContent = `${getI18nText('size')}: ${this.originalWidth} × ${this.originalHeight} px`;
        
        this.convertCarveToPixelatedData();
    }
    
    convertCarveToPixelatedData() {
        this.pixelatedData = [];
        
        const sortedBlocks = [...this.carveBlocks].sort((a, b) => {
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
            
            this.pixelatedData.push(row);
        }
    }
    
    drawCarveBlocks() {
        if (!this.carveMode) return;
        
        const scaleX = this.pixelatedCanvas.width / this.originalWidth;
        const scaleY = this.pixelatedCanvas.height / this.originalHeight;
        
        this.pixelatedCtx.clearRect(0, 0, this.pixelatedCanvas.width, this.pixelatedCanvas.height);
        
        this.carveBlocks.forEach(block => {
            const x = block.x * scaleX;
            const y = block.y * scaleY;
            const w = block.width * scaleX;
            const h = block.height * scaleY;
            
            this.pixelatedCtx.fillStyle = `rgb(${block.color.r}, ${block.color.g}, ${block.color.b})`;
            this.pixelatedCtx.fillRect(x, y, w, h);
            
            if (this.showCarveGrid) {
                this.pixelatedCtx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                this.pixelatedCtx.lineWidth = 1;
                this.pixelatedCtx.strokeRect(x, y, w, h);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PixelArtGenerator();
    initMatrixTimer();
});

function initMatrixTimer() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const uploadSection = document.getElementById('uploadSection');
    const workspace = document.getElementById('workspace');
    const timerSection = document.getElementById('timerSection');
    const addTimerBtn = document.getElementById('addTimerBtn');
    const timersGrid = document.getElementById('timersGrid');
    
    let timerCount = 0;
    
    // 导航切换
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (btn.textContent === '图转拼豆') {
                uploadSection.style.display = 'block';
                workspace.style.display = 'none';
                timerSection.style.display = 'none';
            } else if (btn.textContent === '矩阵计时') {
                uploadSection.style.display = 'none';
                workspace.style.display = 'none';
                timerSection.style.display = 'block';
            }
        });
    });
    
    // 添加计时器
    addTimerBtn.addEventListener('click', () => {
        const modal = document.getElementById('timerModal');
        modal.style.display = 'block';
        
        // 重置表单
        document.getElementById('modal-hours').value = '0';
        document.getElementById('modal-minutes').value = '0';
        document.getElementById('modal-title').value = '';
    });
    
    // 关闭弹窗
    document.getElementById('closeTimerModalBtn').addEventListener('click', () => {
        document.getElementById('timerModal').style.display = 'none';
    });
    
    // 取消添加
    document.getElementById('cancelAddTimerBtn').addEventListener('click', () => {
        document.getElementById('timerModal').style.display = 'none';
    });
    
    // 确认添加计时器
    document.getElementById('confirmAddTimerBtn').addEventListener('click', () => {
        const hours = parseInt(document.getElementById('modal-hours').value) || 0;
        const minutes = parseInt(document.getElementById('modal-minutes').value) || 1;
        const title = document.getElementById('modal-title').value || `计时器 ${timerCount + 1}`;
        
        if (hours <= 0 && minutes <= 0) {
            alert('请设置倒计时时间！');
            return;
        }
        
        timerCount++;
        const timerId = `timer-${timerCount}`;
        const timerCard = document.createElement('div');
        timerCard.className = 'timer-card';
        timerCard.innerHTML = `
            <div class="timer-title">${title}</div>
            <div class="timer-display" id="${timerId}-display">${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00</div>
            <div class="timer-controls">
                <button class="timer-btn" id="${timerId}-start">开始</button>
                <button class="timer-btn" id="${timerId}-pause">暂停</button>
                <button class="timer-btn" id="${timerId}-reset">重置</button>
                <button class="timer-btn btn-danger" id="${timerId}-delete">删除</button>
            </div>
        `;
        timersGrid.appendChild(timerCard);
        
        initTimer(timerId, hours, minutes, 0);
        
        document.getElementById('timerModal').style.display = 'none';
    });
    
    // 初始化第一个计时器
    timerCount++;
    const timerId = `timer-${timerCount}`;
    const timerCard = document.createElement('div');
    timerCard.className = 'timer-card';
    timerCard.innerHTML = `
        <div class="timer-title">计时器 1</div>
        <div class="timer-display" id="${timerId}-display">00:00:00</div>
        <div class="timer-controls">
            <button class="timer-btn" id="${timerId}-start">开始</button>
            <button class="timer-btn" id="${timerId}-pause">暂停</button>
            <button class="timer-btn" id="${timerId}-reset">重置</button>
            <button class="timer-btn btn-danger" id="${timerId}-delete">删除</button>
        </div>
    `;
    timersGrid.appendChild(timerCard);
    initTimer(timerId, 0, 0, 0);
}

function initTimer(timerId, initialHours, initialMinutes, initialSeconds) {
    const display = document.getElementById(`${timerId}-display`);
    const startBtn = document.getElementById(`${timerId}-start`);
    const pauseBtn = document.getElementById(`${timerId}-pause`);
    const resetBtn = document.getElementById(`${timerId}-reset`);
    const deleteBtn = document.getElementById(`${timerId}-delete`);
    
    let remainingTime = initialHours * 3600 + initialMinutes * 60 + initialSeconds;
    let originalTime = remainingTime;
    let timerInterval = null;
    let isRunning = false;
    
    function updateDisplay() {
        const hours = Math.floor(remainingTime / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((remainingTime % 3600) / 60).toString().padStart(2, '0');
        const seconds = (remainingTime % 60).toString().padStart(2, '0');
        display.textContent = `${hours}:${minutes}:${seconds}`;
        
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            startBtn.classList.remove('active');
            pauseBtn.classList.remove('active');
            alert('倒计时结束！');
        }
    }
    
    startBtn.addEventListener('click', () => {
        if (!isRunning) {
            if (remainingTime <= 0) {
                remainingTime = originalTime;
            }
            
            if (remainingTime <= 0) {
                alert('请设置倒计时时间！');
                return;
            }
            
            timerInterval = setInterval(() => {
                remainingTime--;
                updateDisplay();
            }, 1000);
            isRunning = true;
            startBtn.classList.add('active');
            pauseBtn.classList.remove('active');
        }
    });
    
    pauseBtn.addEventListener('click', () => {
        if (isRunning) {
            clearInterval(timerInterval);
            isRunning = false;
            pauseBtn.classList.add('active');
            startBtn.classList.remove('active');
        }
    });
    
    resetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        remainingTime = originalTime;
        isRunning = false;
        updateDisplay();
        startBtn.classList.remove('active');
        pauseBtn.classList.remove('active');
    });
    
    deleteBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        const timerCard = document.getElementById(`${timerId}-display`).parentElement;
        timerCard.remove();
    });
}
