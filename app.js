class PixelArtGenerator {
    constructor() {
        this.originalImage = null;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.perlerMode = false;
        this.colorCounts = {};
        
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
        
        const savedLang = localStorage.getItem('beadMasterLang') || 'zh';
        setLanguage(savedLang);
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
            if (Object.keys(this.colorCounts).length > 0) {
                this.updatePerlerChart();
            }
        });
        this.renderPerlerBtn = document.getElementById('renderPerlerBtn');
        this.renderPerlerBtn.addEventListener('click', () => this.updatePerlerChart());
        
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
        
        this.enableColorQuantize.addEventListener('change', () => this.updatePixelatedImage());
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
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
        if (!file.type.startsWith('image/')) {
            alert('请选择有效的图片文件！');
            return;
        }
        
        if (file.size > 20 * 1024 * 1024) {
            alert('文件大小不能超过 20MB！');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.originalWidth = img.width;
                this.originalHeight = img.height;
                this.showWorkspace();
                this.drawOriginalImage();
                this.resetInputs();
                this.updatePixelatedImage();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
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
        let pixelatedData = pixelate(imageData, pixelSize);
        
        if (this.enableContrast.checked) {
            const contrastFactor = parseFloat(this.contrastSlider.value);
            pixelatedData = adjustContrast(pixelatedData, contrastFactor);
        }
        
        if (this.enableSharpen.checked) {
            const sharpenStrength = parseFloat(this.sharpenSlider.value);
            pixelatedData = sharpenImage(pixelatedData, sharpenStrength);
        }
        
        if (this.enableColorQuantize.checked) {
            const colorCount = parseInt(this.colorCountSlider.value);
            pixelatedData = quantizeColors(pixelatedData, colorCount);
        }
        
        this.pixelatedCanvas.width = targetWidth;
        this.pixelatedCanvas.height = targetHeight;
        this.pixelatedCtx.putImageData(pixelatedData, 0, 0);
        
        this.pixelatedSize.textContent = `像素化尺寸: ${targetWidth} × ${targetHeight} px`;
        this.showPerlerPlaceholder();
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
        const perlerColors = [];
        
        for (let y = 0; y < perlerHeight; y++) {
            const row = [];
            for (let x = 0; x < perlerWidth; x++) {
                const index = (y * perlerWidth + x) * 4;
                const r = processedData.data[index];
                const g = processedData.data[index + 1];
                const b = processedData.data[index + 2];
                const closestColor = findClosestColor([r, g, b], colorSet, mappingMethod);
                row.push(closestColor);
                
                if (this.colorCounts[closestColor.name]) {
                    this.colorCounts[closestColor.name]++;
                } else {
                    this.colorCounts[closestColor.name] = 1;
                }
            }
            perlerColors.push(row);
        }
        
        this.drawPerlerChart(perlerColors, perlerWidth, perlerHeight, colorSetName);
        this.perlerSize.textContent = `${getI18nText('perlerSize')}: ${perlerWidth} × ${perlerHeight} ${getI18nText('beans')}`;
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
            ctx.fillText('豆师傅-perler-pattern-generator.pages.dev', this.perlerCanvas.width / 2, footerY);
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

    drawColorLegend() {
        const legendCanvas = document.createElement('canvas');
        const legendCtx = legendCanvas.getContext('2d');
        const colorNames = Object.keys(this.colorCounts).sort();
        
        const totalBeans = Object.values(this.colorCounts).reduce((a, b) => a + b, 0);
        
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
        legendCtx.fillText(`${getI18nText('totalBeans')}: ${totalBeans} ${getI18nText('beans')}`, 8, 36);
        
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
        downloadCtx.fillText(`${getI18nText('totalBeans')}: ${totalBeans} ${getI18nText('beans')}`, legendX + 8, legendY + 36);
        
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
}

document.addEventListener('DOMContentLoaded', () => {
    new PixelArtGenerator();
});
