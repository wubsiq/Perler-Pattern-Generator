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
        
        this.pixelatedCanvas = document.getElementById('pixelatedCanvas');
        this.pixelatedCtx = this.pixelatedCanvas.getContext('2d', { willReadFrequently: true });
        
        this.perlerCanvas = document.getElementById('perlerCanvas');
        this.perlerCtx = this.perlerCanvas.getContext('2d', { willReadFrequently: true });
        
        this.originalSize = document.getElementById('originalSize');
        this.pixelatedSize = document.getElementById('pixelatedSize');
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
        this.showGridLines = document.getElementById('showGridLines');
        this.showCoordNumbers = document.getElementById('showCoordNumbers');
        this.coordLineColor = document.getElementById('coordLineColor');
        this.coordNumberColor = document.getElementById('coordNumberColor');
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
        this.saveSnapshotBtn = document.getElementById('saveSnapshotBtn');
        this.snapshotsList = document.getElementById('snapshotsList');
        this.snapshotsContainer = document.getElementById('snapshotsContainer');
        
        this.customEditData = null;
        this.customEditHistory = [];
        this.customEditSnapshots = [];
        this.lastPerlerSignature = null;
        this.currentEditTool = 'brush';
        this.isDrawing = false;
        
        this.smartOptimizeBtn = document.getElementById('smartOptimizeBtn');
        this.smartOptimizeModal = document.getElementById('smartOptimizeModal');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.optimizationSummary = document.getElementById('optimizationSummary');
        this.suggestionsList = document.getElementById('suggestionsList');
        this.rejectAllBtn = document.getElementById('rejectAllBtn');
        this.applyAllBtn = document.getElementById('applyAllBtn');
        this.confirmBtn = document.getElementById('confirmBtn');
        
        this.colorSuggestions = [];
        this.acceptedSuggestions = new Set();
        this.rejectedSuggestions = new Set();
        this.originalPerlerColors = null;
        
        const savedLang = localStorage.getItem('beadMasterLang') || 'zh';
        setLanguage(savedLang);
        
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
                this.updatePerlerChart();
            }
        });
        this.showCoordNumbers.addEventListener('change', () => {
            if (Object.keys(this.colorCounts).length > 0) {
                this.updatePerlerChart();
            }
        });
        // 注意：颜色选择器（coordLineColor 和 coordNumberColor）不实时渲染，只有点击"渲染拼豆图纸"按钮才会生效
        this.chartStyle.addEventListener('change', () => {
            if (Object.keys(this.colorCounts).length > 0) {
                this.updatePerlerChart();
            } else {
                this.showPerlerPlaceholder();
            }
        });
        this.legendPosition.addEventListener('change', () => this.refreshLegendPosition());
        this.beadSizeSlider.addEventListener('input', () => {
            this.beadSizeValue.textContent = this.beadSizeSlider.value + 'px';
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
        
        this.clearBtn.addEventListener('click', () => this.clear());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.downloadPerlerBtn.addEventListener('click', () => this.downloadPerlerChart());
        
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
        
        document.querySelectorAll('.edit-tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.edit-tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentEditTool = btn.dataset.tool;
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
        });
        
        this.showCustomEditGrid.addEventListener('change', () => this.drawCustomEditCanvas());
        
        this.applyCustomEditBtn.addEventListener('click', () => this.applyCustomEdit());
        this.undoCustomEditBtn.addEventListener('click', () => this.undoCustomEdit());
        this.saveSnapshotBtn.addEventListener('click', () => this.saveCustomEditSnapshot());
        
        this.initCustomEditCanvasEvents();
        
        this.smartOptimizeBtn.addEventListener('click', () => this.openSmartOptimizeModal());
        this.closeModalBtn.addEventListener('click', () => this.closeSmartOptimizeModal());
        this.rejectAllBtn.addEventListener('click', () => this.rejectAllSuggestions());
        this.applyAllBtn.addEventListener('click', () => this.acceptAllSuggestions());
        this.confirmBtn.addEventListener('click', () => this.confirmOptimization());
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
        this.originalCanvas.width = this.originalWidth;
        this.originalCanvas.height = this.originalHeight;
        this.originalCtx.drawImage(this.originalImage, 0, 0);
        this.originalSize.textContent = `原始尺寸: ${this.originalWidth} × ${this.originalHeight} px`;
    }

    resetInputs() {
        this.pixelSizeSlider.value = 16;
        this.pixelSizeValue.textContent = '16px';
        this.widthInput.value = Math.min(this.originalWidth, 512);
        this.heightInput.value = Math.round(Math.min(this.originalWidth, 512) * (this.originalHeight / this.originalWidth));
        this.keepRatioCheckbox.checked = true;
        this.showGridLines.checked = true;
        this.showCoordNumbers.checked = true;
        this.coordLineColor.value = '#888888';
        this.coordNumberColor.value = '#666666';
        this.colorCountSlider.value = 8;
        this.colorCountValue.textContent = '8';
        this.colorCountInput.value = 8;
        this.beadSizeSlider.value = 24;
        this.beadSizeValue.textContent = '24px';
        
        this.lastPerlerSignature = null;
        this.customEditSnapshots = [];
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
        tempCtx.drawImage(this.originalImage, 0, 0, targetWidth, targetHeight);
        
        const imageData = tempCtx.getImageData(0, 0, targetWidth, targetHeight);
        const pixelSize = parseInt(this.pixelSizeSlider.value);
        const method = this.pixelMethod.value;
        
        let pixelatedData;
        if (method === 'pixel-art') {
            pixelatedData = pixelArtPixelate(imageData, pixelSize);
        } else if (method === 'quantized') {
            const targetColorCount = parseInt(this.targetColorCountSlider.value);
            pixelatedData = quantizedPixelate(imageData, pixelSize, targetColorCount);
        } else {
            pixelatedData = pixelate(imageData, pixelSize);
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
            pixelatedData = quantizeColors(pixelatedData, colorCount, this.excludedColors);
        }
        
        this.pixelatedCanvas.width = targetWidth;
        this.pixelatedCanvas.height = targetHeight;
        this.pixelatedCtx.putImageData(pixelatedData, 0, 0);
        
        this.pixelatedSize.textContent = `像素化尺寸: ${targetWidth} × ${targetHeight} px`;
        
        if (this.enableColorQuantize.checked) {
            this.updateColorUsageList();
        }
        
        this.showPerlerPlaceholder();
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

    updatePerlerChart() {
        const targetWidth = parseInt(this.widthInput.value);
        const targetHeight = parseInt(this.heightInput.value);
        const pixelSize = parseInt(this.pixelSizeSlider.value);
        
        const perlerWidth = Math.ceil(targetWidth / pixelSize);
        const perlerHeight = Math.ceil(targetHeight / pixelSize);
        
        const colorSetName = this.colorSetSelect.value;
        const colorSet = colorSets[colorSetName];
        const mappingMethod = this.colorMappingMethod.value;
        
        const smallCanvas = document.createElement('canvas');
        const smallCtx = smallCanvas.getContext('2d');
        smallCanvas.width = perlerWidth;
        smallCanvas.height = perlerHeight;
        smallCtx.drawImage(this.pixelatedCanvas, 0, 0, perlerWidth, perlerHeight);
        
        const processedData = smallCtx.getImageData(0, 0, perlerWidth, perlerHeight);
        
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
        const chartStyle = this.chartStyle.value;
        const beadShape = this.beadShape.value;
        const showGrid = this.showGridLines.checked;
        const showCoords = this.showCoordNumbers.checked;
        const coordColor = this.coordLineColor.value;
        const coordNumColor = this.coordNumberColor.value;
        
        this.perlerCanvas.width = coordSize + perlerWidth * cellSize;
        this.perlerCanvas.height = coordSize + perlerHeight * cellSize + footerSize;
        
        const ctx = this.perlerCtx;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.perlerCanvas.width, this.perlerCanvas.height);
        
        const drawFooter = () => {
            ctx.font = '11px sans-serif';
            ctx.fillStyle = '#999';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const footerY = coordSize + perlerHeight * cellSize + footerSize / 2;
            ctx.fillText(this.watermarkText.value, this.perlerCanvas.width / 2, footerY);
        };
        
        const fontSizeCoord = Math.max(9, Math.floor(cellSize * 0.45));
        ctx.font = `${fontSizeCoord}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (showCoords) {
            ctx.fillStyle = coordNumColor;
            
            for (let x = 0; x < perlerWidth; x++) {
                ctx.fillText(x + 1, coordSize + x * cellSize + cellSize / 2, coordSize / 2);
            }
            
            for (let y = 0; y < perlerHeight; y++) {
                ctx.fillText(y + 1, coordSize / 2, coordSize + y * cellSize + cellSize / 2);
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
        
        const blockSize = 10;
        const totalBlocksX = Math.ceil(perlerWidth / blockSize);
        const totalBlocksY = Math.ceil(perlerHeight / blockSize);
        let currentBlockX = 0;
        let currentBlockY = 0;
        
        this.drawColorLegend();
        
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
        drawFooter();
    }

    drawPerlerChartSync(perlerColors, perlerWidth, perlerHeight, colorSetName) {
        const cellSize = parseInt(this.beadSizeSlider.value);
        const coordSize = Math.max(30, Math.floor(cellSize * 1.4));
        const footerSize = 25;
        const chartStyle = this.chartStyle.value;
        const beadShape = this.beadShape.value;
        const showGrid = this.showGridLines.checked;
        const showCoords = this.showCoordNumbers.checked;
        const coordColor = this.coordLineColor.value;
        const coordNumColor = this.coordNumberColor.value;
        
        this.perlerCanvas.width = coordSize + perlerWidth * cellSize;
        this.perlerCanvas.height = coordSize + perlerHeight * cellSize + footerSize;
        
        const ctx = this.perlerCtx;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.perlerCanvas.width, this.perlerCanvas.height);
        
        const drawFooter = () => {
            ctx.font = '11px sans-serif';
            ctx.fillStyle = '#999';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const footerY = coordSize + perlerHeight * cellSize + footerSize / 2;
            ctx.fillText(this.watermarkText.value, this.perlerCanvas.width / 2, footerY);
        };
        
        const fontSizeCoord = Math.max(9, Math.floor(cellSize * 0.45));
        ctx.font = `${fontSizeCoord}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (showCoords) {
            ctx.fillStyle = coordNumColor;
            
            for (let x = 0; x < perlerWidth; x++) {
                ctx.fillText(x + 1, coordSize + x * cellSize + cellSize / 2, coordSize / 2);
            }
            
            for (let y = 0; y < perlerHeight; y++) {
                ctx.fillText(y + 1, coordSize / 2, coordSize + y * cellSize + cellSize / 2);
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
        drawFooter();
    }

    drawColorLegend() {
        const legendCanvas = document.createElement('canvas');
        const legendCtx = legendCanvas.getContext('2d');
        const colorNames = Object.keys(this.colorCounts).sort();
        
        const totalBeans = Object.values(this.colorCounts).reduce((a, b) => a + b, 0);
        const colorTypes = colorNames.length;
        
        const position = this.legendPosition.value;
        const perlerWidth = Math.ceil(parseInt(this.widthInput.value) / parseInt(this.pixelSizeSlider.value));
        const perlerHeight = Math.ceil(parseInt(this.heightInput.value) / parseInt(this.pixelSizeSlider.value));
        const cellSize = parseInt(this.beadSizeSlider.value);
        const coordSize = Math.max(30, Math.floor(cellSize * 1.4));
        const chartWidth = coordSize + perlerWidth * cellSize;
        const chartHeight = coordSize + perlerHeight * cellSize;
        
        let columns, itemsPerColumn, columnWidth;
        const rowHeight = 20;
        
        if (position === 'right') {
            columnWidth = 85;
            const availableHeight = chartHeight - 60;
            const maxItemsPerColumn = Math.max(1, Math.floor(availableHeight / rowHeight));
            columns = Math.min(Math.ceil(colorNames.length / maxItemsPerColumn), 4);
            itemsPerColumn = Math.ceil(colorNames.length / columns);
        } else {
            const maxWidth = chartWidth - 20;
            columnWidth = 80;
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
                legendCtx.fillRect(x, y - 6, 18, 18);
                legendCtx.strokeStyle = '#999';
                legendCtx.strokeRect(x, y - 6, 18, 18);
                
                legendCtx.fillStyle = getContrastTextColor(color.rgb);
                legendCtx.font = 'bold 7px sans-serif';
                legendCtx.textAlign = 'center';
                legendCtx.textBaseline = 'middle';
                legendCtx.fillText(name, x + 9, y + 2);
                legendCtx.textAlign = 'left';
                legendCtx.textBaseline = 'alphabetic';
            }
            
            legendCtx.fillStyle = '#333';
            legendCtx.font = '10px sans-serif';
            legendCtx.fillText(`×${count}`, x + 23, y + 3);
            
            row++;
            if (row >= itemsPerColumn) {
                row = 0;
                col++;
            }
        }
        
        const existingLegend = document.getElementById('colorLegend');
        if (existingLegend) {
            existingLegend.remove();
        }
        
        const legendDiv = document.createElement('div');
        legendDiv.id = 'colorLegend';
        legendDiv.style.padding = '15px';
        legendDiv.style.background = '#f8f9fa';
        legendDiv.style.borderRadius = '8px';
        legendDiv.style.display = 'inline-block';
        legendDiv.appendChild(legendCanvas);
        
        const colorLegendArea = document.getElementById('colorLegendArea');
        colorLegendArea.innerHTML = '';
        
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
        this.customEditSnapshots = [];
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
        const link = document.createElement('a');
        link.download = 'pixelated-image.png';
        link.href = this.pixelatedCanvas.toDataURL('image/png');
        link.click();
    }

    downloadPerlerChart() {
        const perlerWidth = Math.ceil(parseInt(this.widthInput.value) / parseInt(this.pixelSizeSlider.value));
        const perlerHeight = Math.ceil(parseInt(this.heightInput.value) / parseInt(this.pixelSizeSlider.value));
        
        const cellSize = parseInt(this.beadSizeSlider.value);
        const coordSize = Math.max(30, Math.floor(cellSize * 1.4));
        const footerSize = 25;
        const colorNames = Object.keys(this.colorCounts).sort();
        const totalBeans = Object.values(this.colorCounts).reduce((a, b) => a + b, 0);
        const colorTypes = colorNames.length;
        
        const position = this.legendPosition.value;
        const chartWidth = coordSize + perlerWidth * cellSize;
        const chartHeight = coordSize + perlerHeight * cellSize + footerSize;
        
        let columns, itemsPerColumn, columnWidth;
        const rowHeight = 20;
        
        if (position === 'right') {
            columnWidth = 85;
            const availableHeight = chartHeight - 60;
            const maxItemsPerColumn = Math.max(1, Math.floor(availableHeight / rowHeight));
            columns = Math.min(Math.ceil(colorNames.length / maxItemsPerColumn), 4);
            itemsPerColumn = Math.ceil(colorNames.length / columns);
        } else {
            const maxWidth = chartWidth - 20;
            columnWidth = 80;
            columns = Math.max(1, Math.min(Math.floor(maxWidth / columnWidth), Math.ceil(colorNames.length / 1)));
            itemsPerColumn = Math.ceil(colorNames.length / columns);
        }
        
        const legendWidth = columns * columnWidth + 20;
        const legendHeight = 60 + itemsPerColumn * rowHeight;
        
        let canvasWidth, canvasHeight, legendX, legendY;
        
        if (position === 'right') {
            canvasWidth = chartWidth + Math.max(legendWidth, 150) + 40;
            canvasHeight = Math.max(chartHeight, legendHeight);
            legendX = chartWidth + 20;
            legendY = 0;
        } else {
            canvasWidth = Math.max(chartWidth, legendWidth);
            canvasHeight = chartHeight + legendHeight + 40;
            legendX = 0;
            legendY = chartHeight + 20;
        }
        
        const downloadCanvas = document.createElement('canvas');
        const downloadCtx = downloadCanvas.getContext('2d');
        downloadCanvas.width = canvasWidth;
        downloadCanvas.height = canvasHeight;
        
        downloadCtx.fillStyle = '#ffffff';
        downloadCtx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
        
        downloadCtx.drawImage(this.perlerCanvas, 0, 0);
        
        downloadCtx.font = 'bold 13px sans-serif';
        downloadCtx.fillStyle = '#667eea';
        downloadCtx.textAlign = 'left';
        downloadCtx.fillText(getI18nText('colorLegend'), legendX + 8, legendY + 18);
        
        downloadCtx.font = 'bold 12px sans-serif';
        downloadCtx.fillStyle = '#333';
        downloadCtx.fillText(`${getI18nText('totalBeans')}: ${totalBeans} ${getI18nText('beans')} · ${getI18nText('colorTypes')}: ${colorTypes}`, legendX + 8, legendY + 36);
        
        const colorSetName = this.colorSetSelect.value;
        const colorSet = colorSets[colorSetName];
        
        let col = 0, row = 0;
        
        for (const name of colorNames) {
            const count = this.colorCounts[name];
            const color = colorSet.find(c => c.name === name);
            
            const x = legendX + 8 + col * columnWidth;
            const y = legendY + 50 + row * rowHeight;
            
            if (color) {
                downloadCtx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                downloadCtx.fillRect(x, y - 6, 18, 18);
                downloadCtx.strokeStyle = '#999';
                downloadCtx.strokeRect(x, y - 6, 18, 18);
                
                downloadCtx.fillStyle = getContrastTextColor(color.rgb);
                downloadCtx.font = 'bold 7px sans-serif';
                downloadCtx.textAlign = 'center';
                downloadCtx.textBaseline = 'middle';
                downloadCtx.fillText(name, x + 9, y + 2);
                downloadCtx.textAlign = 'left';
                downloadCtx.textBaseline = 'alphabetic';
            }
            
            downloadCtx.fillStyle = '#333';
            downloadCtx.font = '10px sans-serif';
            downloadCtx.fillText(`×${count}`, x + 23, y + 3);
            
            row++;
            if (row >= itemsPerColumn) {
                row = 0;
                col++;
            }
        }
        
        const link = document.createElement('a');
        
        const chartStyle = this.chartStyle.value;
        const beadShape = this.beadShape.value;
        
        const i18nFileName = i18n[getCurrentLang()].fileName;
        let fileName = `${i18nFileName.perlerChart}_${colorSetName}_${perlerWidth}x${perlerHeight}`;
        if (chartStyle === 'bw') fileName += `_${i18nFileName.bw}`;
        if (chartStyle === 'color-with-code') fileName += `_${i18nFileName.withCode}`;
        if (beadShape === 'circle') fileName += `_${i18nFileName.circle}`;
        if (position === 'right') fileName += `_${i18nFileName.legendRight}`;
        fileName += '.png';
        
        link.download = fileName;
        link.href = downloadCanvas.toDataURL('image/png');
        link.click();
    }

    initCustomEditCanvasEvents() {
        this.customEditCanvas.addEventListener('mousedown', (e) => this.handleCustomEditMouseDown(e));
        this.customEditCanvas.addEventListener('mousemove', (e) => this.handleCustomEditMouseMove(e));
        this.customEditCanvas.addEventListener('mouseup', () => this.handleCustomEditMouseUp());
        this.customEditCanvas.addEventListener('mouseleave', () => this.handleCustomEditMouseUp());
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
        
        this.drawCustomEditCanvas();
    }

    drawCustomEditCanvas() {
        if (!this.customEditData) return;
        
        const cellSize = parseInt(this.beadSizeSlider.value);
        const showGrid = this.showCustomEditGrid.checked;
        
        this.customEditCanvas.width = this.perlerWidth * cellSize;
        this.customEditCanvas.height = this.perlerHeight * cellSize;
        
        const ctx = this.customEditCtx;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.customEditCanvas.width, this.customEditCanvas.height);
        
        for (let y = 0; y < this.perlerHeight; y++) {
            for (let x = 0; x < this.perlerWidth; x++) {
                const color = this.customEditData[y][x];
                if (color.isTransparent) {
                    ctx.fillStyle = this.razorBgColor.value;
                } else {
                    ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                }
                ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
            }
        }
        
        if (showGrid) {
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1;
            for (let x = 0; x <= this.perlerWidth; x++) {
                ctx.beginPath();
                ctx.moveTo(x * cellSize, 0);
                ctx.lineTo(x * cellSize, this.perlerHeight * cellSize);
                ctx.stroke();
            }
            for (let y = 0; y <= this.perlerHeight; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y * cellSize);
                ctx.lineTo(this.perlerWidth * cellSize, y * cellSize);
                ctx.stroke();
            }
        }
        
        this.customEditInfo.textContent = `编辑尺寸: ${this.perlerWidth} × ${this.perlerHeight}`;
    }

    getCustomEditCell(e) {
        const rect = this.customEditCanvas.getBoundingClientRect();
        const cellSize = parseInt(this.beadSizeSlider.value);
        const x = Math.floor((e.clientX - rect.left) / cellSize);
        const y = Math.floor((e.clientY - rect.top) / cellSize);
        return { x, y };
    }

    handleCustomEditMouseDown(e) {
        if (!this.customEditData) return;
        
        const { x, y } = this.getCustomEditCell(e);
        
        if (this.currentEditTool === 'chainRazor') {
            this.applyChainRazor(x, y);
            this.isDrawing = true;
            this.saveCustomEditHistory();
        } else {
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
            
            stack.push({x: x + 1, y});
            stack.push({x: x - 1, y});
            stack.push({x, y: y + 1});
            stack.push({x, y: y - 1});
        }
        
        this.drawCustomEditCanvas();
    }

    applyEditToCell(x, y) {
        if (x < 0 || x >= this.perlerWidth || y < 0 || y >= this.perlerHeight) return;
        
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
                    const targetColor = this.customEditData[y][x];
                    const hexFill = this.customEditColor.value;
                    const fr = parseInt(hexFill.slice(1, 3), 16);
                    const fg = parseInt(hexFill.slice(3, 5), 16);
                    const fb = parseInt(hexFill.slice(5, 7), 16);
                    
                    const csName = this.colorSetSelect.value;
                    const cs = colorSets[csName];
                    const mm = this.colorMappingMethod.value;
                    const fillColor = findClosestColor([fr, fg, fb], cs, mm);
                    
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
        const targetIsTransparent = targetColor.isTransparent;
        const fillIsTransparent = fillColor.isTransparent;
        
        if (!targetIsTransparent && !fillIsTransparent && targetColor.name === fillColor.name) return;
        if (targetIsTransparent && fillIsTransparent) return;
        
        const visited = new Set();
        const stack = [{x: startX, y: startY}];
        
        while (stack.length > 0) {
            const {x, y} = stack.pop();
            const key = `${x},${y}`;
            
            if (visited.has(key)) continue;
            if (x < 0 || x >= this.perlerWidth || y < 0 || y >= this.perlerHeight) continue;
            
            const currentColor = this.customEditData[y][x];
            const currentIsTransparent = currentColor.isTransparent;
            
            if (targetIsTransparent && !currentIsTransparent) continue;
            if (!targetIsTransparent && currentIsTransparent) continue;
            if (!targetIsTransparent && !currentIsTransparent && currentColor.name !== targetColor.name) continue;
            
            visited.add(key);
            this.customEditData[y][x] = fillColor;
            
            stack.push({x: x + 1, y});
            stack.push({x: x - 1, y});
            stack.push({x, y: y + 1});
            stack.push({x, y: y - 1});
        }
    }

    saveCustomEditHistory() {
        this.customEditHistory.push(this.customEditData.map(row => [...row]));
        if (this.customEditHistory.length > 50) {
            this.customEditHistory.shift();
        }
    }

    undoCustomEdit() {
        if (this.customEditHistory.length > 1) {
            this.customEditHistory.pop();
            this.customEditData = this.customEditHistory[this.customEditHistory.length - 1].map(row => [...row]);
            this.drawCustomEditCanvas();
        }
    }

    applyCustomEdit() {
        if (!this.customEditData) return;
        
        this.perlerColors = this.customEditData.map(row => [...row]);
        
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
        
        this.saveCustomEditSnapshot();
        
        this.drawPerlerChart(this.perlerColors, this.perlerWidth, this.perlerHeight, this.colorSetSelect.value);
        this.drawColorLegend();
    }

    openSmartOptimizeModal() {
        if (!this.perlerColors || !this.perlerColors.length) {
            alert('请先渲染拼豆图纸！');
            return;
        }
        
        this.originalPerlerColors = this.perlerColors.map(row => [...row]);
        this.colorSuggestions = this.generateColorSuggestions();
        this.acceptedSuggestions = new Set();
        this.rejectedSuggestions = new Set();
        
        this.renderOptimizationSummary();
        this.renderSuggestionsList();
        this.smartOptimizeModal.style.display = 'flex';
    }

    closeSmartOptimizeModal(restoreOriginal = true) {
        this.smartOptimizeModal.style.display = 'none';
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
        const mappingMethod = this.colorMappingMethod.value;
        
        console.log('[智能优化] 开始生成建议');
        console.log('[智能优化] 颜色集:', colorSetName);
        console.log('[智能优化] 映射方法:', mappingMethod);
        
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
        
        for (const [colorName, count] of colorsByUsage) {
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
            
            let bestReplacement = null;
            let minDistance = Infinity;
            
            for (const candidate of highUsageColors) {
                if (candidate.name === colorName) continue;
                
                const distance = calculateColorDistance(originalColor.rgb, candidate.rgb, mappingMethod);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestReplacement = candidate;
                }
            }
            
            const effectiveThreshold = 80;
            
            console.log(`[智能优化] ${colorName} -> 最佳替换: ${bestReplacement ? bestReplacement.name : '无'}, 距离: ${minDistance}, 阈值: ${effectiveThreshold}`);
            
            if (bestReplacement && minDistance < effectiveThreshold) {
                suggestions.push({
                    id: suggestions.length,
                    originalColor,
                    replacementColor: bestReplacement,
                    beanCount: count,
                    isEdgeColor,
                    accepted: false
                });
            }
        }
        
        console.log('[智能优化] 最终建议数:', suggestions.length);
        return suggestions.sort((a, b) => a.beanCount - b.beanCount);
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

    renderSuggestionsList() {
        if (this.colorSuggestions.length === 0) {
            this.suggestionsList.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">没有可优化的建议</p>';
            return;
        }
        
        const html = this.colorSuggestions.map((suggestion, index) => {
            const statusClass = this.acceptedSuggestions.has(index) ? 'accepted' : 
                             this.rejectedSuggestions.has(index) ? 'rejected' : '';
            const edgeIndicator = suggestion.isEdgeColor ? '🔍 边缘色' : '';
            
            return `
                <div class="suggestion-item ${statusClass}" data-index="${index}">
                    <div class="color-swatch-small" style="background-color: rgb(${suggestion.originalColor.rgb[0]}, ${suggestion.originalColor.rgb[1]}, ${suggestion.originalColor.rgb[2]});"></div>
                    <div class="suggestion-info">
                        <div class="suggestion-text">
                            <span>${suggestion.originalColor.name}</span>
                            <span class="arrow">→</span>
                            <div class="color-swatch-small" style="background-color: rgb(${suggestion.replacementColor.rgb[0]}, ${suggestion.replacementColor.rgb[1]}, ${suggestion.replacementColor.rgb[2]}); width: 24px; height: 24px;"></div>
                            <span>${suggestion.replacementColor.name}</span>
                            ${edgeIndicator ? `<span style="margin-left: 10px; font-size: 0.85em; color: #ff6b00;">${edgeIndicator}</span>` : ''}
                        </div>
                        <div class="suggestion-beans">
                            ${getI18nText('beansAffected')}: ${suggestion.beanCount} ${getI18nText('beans')}
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
        this.acceptedSuggestions.add(index);
        this.applySuggestion(index);
        this.renderOptimizationSummary();
        this.renderSuggestionsList();
    }

    rejectSuggestion(index) {
        if (this.acceptedSuggestions.has(index)) {
            this.acceptedSuggestions.delete(index);
            this.restoreSuggestion(index);
        }
        this.rejectedSuggestions.add(index);
        this.renderOptimizationSummary();
        this.renderSuggestionsList();
    }

    acceptAllSuggestions() {
        for (let i = 0; i < this.colorSuggestions.length; i++) {
            if (!this.rejectedSuggestions.has(i)) {
                this.acceptedSuggestions.add(i);
                this.applySuggestion(i);
            }
        }
        this.renderOptimizationSummary();
        this.renderSuggestionsList();
    }

    rejectAllSuggestions() {
        for (const index of this.acceptedSuggestions) {
            this.restoreSuggestion(index);
        }
        this.acceptedSuggestions.clear();
        this.rejectedSuggestions = new Set(this.colorSuggestions.map((_, i) => i));
        this.renderOptimizationSummary();
        this.renderSuggestionsList();
    }

    applySuggestion(index) {
        const suggestion = this.colorSuggestions[index];
        for (let y = 0; y < this.perlerHeight; y++) {
            for (let x = 0; x < this.perlerWidth; x++) {
                if (this.perlerColors[y][x].name === suggestion.originalColor.name) {
                    this.perlerColors[y][x] = suggestion.replacementColor;
                }
            }
        }
        this.updateColorCounts();
        this.drawPerlerChartSync(this.perlerColors, this.perlerWidth, this.perlerHeight, this.colorSetSelect.value);
        this.drawColorLegend();
    }

    restoreSuggestion(index) {
        const suggestion = this.colorSuggestions[index];
        for (let y = 0; y < this.perlerHeight; y++) {
            for (let x = 0; x < this.perlerWidth; x++) {
                if (this.originalPerlerColors[y][x].name === suggestion.originalColor.name) {
                    this.perlerColors[y][x] = this.originalPerlerColors[y][x];
                }
            }
        }
        this.updateColorCounts();
        this.drawPerlerChartSync(this.perlerColors, this.perlerWidth, this.perlerHeight, this.colorSetSelect.value);
        this.drawColorLegend();
    }

    previewSuggestion(index) {
        const suggestion = this.colorSuggestions[index];
        const tempColors = this.perlerColors.map(row => [...row]);
        
        for (let y = 0; y < this.perlerHeight; y++) {
            for (let x = 0; x < this.perlerWidth; x++) {
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
        this.closeSmartOptimizeModal(false);
    }
    
    saveCustomEditSnapshot() {
        if (!this.customEditData) return;
        
        const snapshotId = Date.now();
        const timestamp = new Date().toLocaleTimeString();
        this.customEditSnapshots.push({
            id: snapshotId,
            timestamp,
            data: this.customEditData.map(row => [...row])
        });
        
        if (this.customEditSnapshots.length > 20) {
            this.customEditSnapshots.shift();
        }
        
        this.renderSnapshotsList();
        this.snapshotsList.style.display = 'block';
    }
    
    renderSnapshotsList() {
        this.snapshotsContainer.innerHTML = '';
        
        this.customEditSnapshots.forEach((snapshot, index) => {
            const item = document.createElement('div');
            item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; margin-bottom: 4px; background: white; border-radius: 4px; border: 1px solid #ddd; cursor: pointer;';
            item.innerHTML = `
                <span style="color: #333;">快照 ${index + 1} (${snapshot.timestamp})</span>
                <div>
                    <button class="btn btn-primary" style="padding: 4px 8px; font-size: 12px; margin-right: 5px;" data-snapshot-id="${snapshot.id}" data-action="restore">恢复</button>
                    <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;" data-snapshot-id="${snapshot.id}" data-action="delete">删除</button>
                </div>
            `;
            
            item.querySelector('[data-action="restore"]').addEventListener('click', (e) => {
                e.stopPropagation();
                this.restoreCustomEditSnapshot(snapshot.id);
            });
            
            item.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteCustomEditSnapshot(snapshot.id);
            });
            
            this.snapshotsContainer.appendChild(item);
        });
    }
    
    restoreCustomEditSnapshot(snapshotId) {
        const snapshot = this.customEditSnapshots.find(s => s.id === snapshotId);
        if (snapshot) {
            this.customEditData = snapshot.data.map(row => [...row]);
            this.customEditHistory = [this.customEditData.map(row => [...row])];
            this.drawCustomEditCanvas();
        }
    }
    
    deleteCustomEditSnapshot(snapshotId) {
        this.customEditSnapshots = this.customEditSnapshots.filter(s => s.id !== snapshotId);
        if (this.customEditSnapshots.length === 0) {
            this.snapshotsList.style.display = 'none';
        }
        this.renderSnapshotsList();
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
