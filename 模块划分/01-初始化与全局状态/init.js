/**
 * ==============================================================
 * 模块域: 01-初始化与全局状态
 * 原文件: js/app.js
 * 行号范围: 1 - 433 (共 433 行)
 * 截取方式: 直接复制，未修改（用于模块化规划参考）
 * 
 * 本文件为【代码快照】，原始代码仍在 js/app.js 中。
 * 未来真正重构时需：从 App 类中提取方法，处理 this 依赖。
 * ==============================================================
 */

class PixelArtGenerator {
    constructor() {
        this.originalImage = null;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.fullOriginalImage = null; // 保存完整的原始图片（用于重置裁切）
        this.fullOriginalWidth = 0;
        this.fullOriginalHeight = 0;
        this.isCropped = false; // 是否已裁切过
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
        this.isBlankCanvasMode = false; // 是否在空白画布模式
        
        // CIEDE2000 优化参数
        this.cie2000OptimizedParams = {
            neighborhoodRadius: 1,
            colorDiffThreshold: 5,
            minRatio: 0.5,
            iterationCount: 1
        };
        
        // 版本号
        this.APP_VERSION = '1.2.11';
        
        // 初始化模块
        this.pixelator = new Pixelator();
        this.perlerGenerator = new PerlerGenerator();
        this.downloadManager = new DownloadManager();
        this.colorManager = new ColorManager();
        this.infoPaperManager = new InfoPaperManager();
        this.focusModeRenderer = new FocusModeRenderer();
        this.customEditor = new CustomEditor();
        this.selectionPanel = null;
        this.brushManager = null;
        this.brushPanel = null;
        this.customBrushes = []; // 存储导入的自定义画笔
        
        this.initElements();
        this.initEventListeners();
        // 延迟初始化示例区域，避免阻塞首屏渲染影响 LCP
        if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(() => this.initShowcase(), { timeout: 1000 });
        } else {
            setTimeout(() => this.initShowcase(), 100);
        }
    }

    initElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.blankCanvasArea = document.getElementById('blankCanvasArea');
        this.blankCanvasModal = document.getElementById('blankCanvasModal');
        this.blankCanvasWidth = document.getElementById('blankCanvasWidth');
        this.blankCanvasHeight = document.getElementById('blankCanvasHeight');
        this.closeBlankCanvasModalBtn = document.getElementById('closeBlankCanvasModalBtn');
        this.cancelBlankCanvasBtn = document.getElementById('cancelBlankCanvasBtn');
        this.confirmBlankCanvasBtn = document.getElementById('confirmBlankCanvasBtn');

        this.originalSection = document.getElementById('originalSection');
        this.pixelatedSection = document.getElementById('pixelatedSection');
        this.modeSwitch = document.getElementById('modeSwitch');
        this.customEditSection = document.getElementById('customEditSection');

        this.fileInput = document.getElementById('fileInput');
        this.uploadSection = document.getElementById('uploadSection');
        this.showcaseSection = document.getElementById('showcaseSection');
        this.showcaseGrid = document.getElementById('showcaseGrid');
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

        // 裁切功能相关元素
        this.cropBtn = document.getElementById('cropBtn');
        this.resetCropBtn = document.getElementById('resetCropBtn');
        this.confirmCropBtn = document.getElementById('confirmCropBtn');
        this.cancelCropBtn = document.getElementById('cancelCropBtn');
        this.cropOverlay = document.getElementById('cropOverlay');
        this.cropBox = document.getElementById('cropBox');
        this.isCropMode = false;
        this.isCreatingCrop = false;
        this.isDraggingCrop = false;
        this.isResizingCrop = false;
        this.activeHandle = null;
        this.cropStartX = 0;
        this.cropStartY = 0;
        this.initialCropBox = null;
        
        // 旋转功能相关元素
        this.rotateControls = document.getElementById('rotateControls');
        this.rotateSlider = document.getElementById('rotateSlider');
        this.rotateValue = document.getElementById('rotateValue');
        this.rotate90Btn = document.getElementById('rotate90Btn');
        this.rotate180Btn = document.getElementById('rotate180Btn');
        this.rotate270Btn = document.getElementById('rotate270Btn');
        this.rotationAngle = 0; // 当前旋转角度
        
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
        this.transparentCellColor = document.getElementById('transparentCellColor');
        this.transparentCellColorValue = document.getElementById('transparentCellColorValue');
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
        this.gridLineWidth = document.getElementById('gridLineWidth');
        this.watermarkText = document.getElementById('watermarkText');
        
        this.simpleModeBtn = document.getElementById('simpleModeBtn');
        this.advancedModeBtn = document.getElementById('advancedModeBtn');
        
        this.clearBtn = document.getElementById('clearBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.downloadPerlerBtn = document.getElementById('downloadPerlerBtn');
        this.exportFormatSelect = document.getElementById('exportFormatSelect');
        this.exportInfoPaperCompressedBtn = document.getElementById('exportInfoPaperCompressedBtn');
        this.exportInfoPaperCompressedFileBtn = document.getElementById('exportInfoPaperCompressedFileBtn');
        this.importInfoPaperBtn = document.getElementById('importInfoPaperBtn');
        
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
        this.pixelGridLineWidth = document.getElementById('pixelGridLineWidth');
        this.pixelGridLineWidthValue = document.getElementById('pixelGridLineWidthValue');
        
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
        
        // 初始化拼豆色板组件
        this.currentBeadColor = '#FAF4C8'; // 默认 A1 颜色
        this.currentBeadColorName = 'A1';
        this.beadPalette = null;
        
        const beadPaletteContainer = document.getElementById('beadPaletteContainer');
        if (beadPaletteContainer && typeof BeadPalette !== 'undefined') {
            this.beadPalette = new BeadPalette({
                container: '#beadPaletteContainer',
                colorSet: 'mard221',
                columns: 8,
                initialColor: 'A1',
                onSelect: (color) => {
                    this.currentBeadColor = color.hex;
                    this.currentBeadColorName = color.name;
                    this.refreshCustomEditBrushCursor();
                }
            });
        }
        
        this.customEditBrushSize = document.getElementById('customEditBrushSize');
        this.brushSizeValue = document.getElementById('brushSizeValue');
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
        this.colorQuantizePanel = document.getElementById('colorQuantizePanel');
        this.colorQuantizePanelHeader = document.getElementById('colorQuantizePanelHeader');
        this.closeColorQuantizeBtn = document.getElementById('closeColorQuantizeBtn');
        this.quantizeColorList = document.getElementById('quantizeColorList');
        this.quantizeSelectAllBtn = document.getElementById('quantizeSelectAllBtn');
        this.quantizeSelectNoneBtn = document.getElementById('quantizeSelectNoneBtn');
        this.applyColorQuantizeBtn = document.getElementById('applyColorQuantizeBtn');
        this.quantizePickColorBtn = document.getElementById('quantizePickColorBtn');
        this.quantizePickMode = false;
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
        this.transparentColorDebounceTimer = null;
        
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
        
        this.colorConvertPanel = document.getElementById('colorConvertPanel');
        this.colorConvertPanelHeader = document.getElementById('colorConvertPanelHeader');
        this.closeColorConvertBtn = document.getElementById('closeColorConvertBtn');
        this.colorConvertSourceColor = document.getElementById('colorConvertSourceColor');
        this.colorConvertSourceColorValue = document.getElementById('colorConvertSourceColorValue');
        this.colorConvertTargetColor = document.getElementById('colorConvertTargetColor');
        this.colorConvertTargetColorValue = document.getElementById('colorConvertTargetColorValue');
        this.pickSourceColorBtn = document.getElementById('pickSourceColorBtn');
        this.pickTargetColorBtn = document.getElementById('pickTargetColorBtn');
        this.executeColorConvertBtn = document.getElementById('executeColorConvertBtn');

        this.colorConvertPickMode = null;
        this.colorConvertSourceIsTransparent = false;
        this.colorConvertTargetIsTransparent = false;
        this.colorConvertPanelDragState = null;
        
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
        
        // 描边工具（浮动面板版）
        this.strokePanel = document.getElementById('strokePanel');
        this.strokePanelHeader = document.getElementById('strokePanelHeader');
        this.closeStrokePanelBtn = document.getElementById('closeStrokePanelBtn');
        this.strokeColor = document.getElementById('strokeColor');
        this.strokeColorValue = document.getElementById('strokeColorValue');
        this.strokeThickness = document.getElementById('strokeThickness');
        this.strokeThicknessValue = document.getElementById('strokeThicknessValue');
        this.executeStrokeBtn = document.getElementById('executeStrokeBtn');

        // 颜色剔除工具（浮动面板版）
        this.colorRemovePanel = document.getElementById('colorRemovePanel');
        this.colorRemovePanelHeader = document.getElementById('colorRemovePanelHeader');
        this.closeColorRemoveBtn = document.getElementById('closeColorRemoveBtn');
        
        // 杂色过滤工具（浮动面板版）
        this.noiseFilterPanel = document.getElementById('noiseFilterPanel');
        this.noiseFilterPanelHeader = document.getElementById('noiseFilterPanelHeader');
        this.closeNoiseFilterBtn = document.getElementById('closeNoiseFilterBtn');
        this.noiseFilterThresholdSlider = document.getElementById('noiseFilterThresholdSlider');
        this.noiseFilterThresholdValue = document.getElementById('noiseFilterThresholdValue');
        this.applyNoiseFilterBtn = document.getElementById('applyNoiseFilterBtn');
        
        this.canvasBounds = null;
        this.isDraggingCanvasBounds = false;
        this.draggingHandle = null;
        this.optimizeHighlightColor = document.getElementById('optimizeHighlightColor');
        this.optimizeErasedColor = document.getElementById('optimizeErasedColor');
        
        const savedLang = localStorage.getItem('beadMasterLang') || 'zh';
        setLanguage(savedLang);
        
        const displaySize = parseInt(this.beadSizeSlider.value);
        let exportSize = displaySize * 2;
        exportSize = Math.max(3, Math.min(96, exportSize));
        this.exportBeadSizeSlider.value = exportSize;
        this.exportBeadSizeValue.textContent = exportSize + 'px';
        
        this.quantizedPixelControls.style.display = this.pixelMethod.value === 'quantized' ? 'block' : 'none';
        
        const versionBadge = document.getElementById('versionBadge');
        if (versionBadge) {
            versionBadge.textContent = `v${this.APP_VERSION}`;
        }
    }
