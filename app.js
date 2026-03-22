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
        this.previewContainer = document.querySelector('.preview-container');
        
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
        
        this.perlerModeCheckbox = document.getElementById('perlerModeCheckbox');
        this.perlerOptions = document.getElementById('perlerOptions');
        this.perlerPanel = document.getElementById('perlerPanel');
        this.perlerContent = document.getElementById('perlerContent');
        this.colorSetSelect = document.getElementById('colorSetSelect');
        this.chartStyle = document.getElementById('chartStyle');
        this.legendPosition = document.getElementById('legendPosition');
        this.beadShape = document.getElementById('beadShape');
        
        this.clearBtn = document.getElementById('clearBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.downloadPerlerBtn = document.getElementById('downloadPerlerBtn');
        
        this.presetBtns = document.querySelectorAll('.preset-btn');
        
        this.langZh = document.getElementById('langZh');
        this.langEn = document.getElementById('langEn');
        
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
        
        this.perlerModeCheckbox.addEventListener('change', () => {
            this.perlerMode = this.perlerModeCheckbox.checked;
            if (this.perlerMode) {
                this.previewContainer.classList.add('has-perler');
                this.perlerOptions.style.display = 'block';
                this.perlerPanel.style.display = 'block';
                this.downloadPerlerBtn.style.display = 'block';
                this.showPerlerPlaceholder();
            } else {
                this.previewContainer.classList.remove('has-perler');
                this.perlerOptions.style.display = 'none';
                this.perlerPanel.style.display = 'none';
                this.downloadPerlerBtn.style.display = 'none';
            }
        });
        
        this.colorSetSelect.addEventListener('change', () => this.showPerlerPlaceholder());
        this.chartStyle.addEventListener('change', () => {
            if (Object.keys(this.colorCounts).length > 0) {
                this.updatePerlerChart();
            } else {
                this.showPerlerPlaceholder();
            }
        });
        this.legendPosition.addEventListener('change', () => this.refreshLegendPosition());
        this.renderPerlerBtn = document.getElementById('renderPerlerBtn');
        this.renderPerlerBtn.addEventListener('click', () => this.updatePerlerChart());
        
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
        this.perlerModeCheckbox.checked = false;
        this.previewContainer.classList.remove('has-perler');
        this.perlerOptions.style.display = 'none';
        this.perlerPanel.style.display = 'none';
        this.downloadPerlerBtn.style.display = 'none';
        this.perlerMode = false;
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
        const pixelatedData = pixelate(imageData, pixelSize);
        
        this.pixelatedCanvas.width = targetWidth;
        this.pixelatedCanvas.height = targetHeight;
        this.pixelatedCtx.putImageData(pixelatedData, 0, 0);
        
        this.pixelatedSize.textContent = `像素化尺寸: ${targetWidth} × ${targetHeight} px`;
        
        if (this.perlerMode) {
            this.showPerlerPlaceholder();
        }
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
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = perlerWidth;
        tempCanvas.height = perlerHeight;
        tempCtx.drawImage(this.originalImage, 0, 0, perlerWidth, perlerHeight);
        const imageData = tempCtx.getImageData(0, 0, perlerWidth, perlerHeight);
        
        this.colorCounts = {};
        const perlerColors = [];
        
        for (let y = 0; y < perlerHeight; y++) {
            const row = [];
            for (let x = 0; x < perlerWidth; x++) {
                const index = (y * perlerWidth + x) * 4;
                const r = imageData.data[index];
                const g = imageData.data[index + 1];
                const b = imageData.data[index + 2];
                const closestColor = findClosestColor([r, g, b], colorSet);
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
        const cellSize = 24;
        const coordSize = 35;
        const chartStyle = this.chartStyle.value;
        const beadShape = this.beadShape.value;
        
        this.perlerCanvas.width = coordSize + perlerWidth * cellSize;
        this.perlerCanvas.height = coordSize + perlerHeight * cellSize;
        
        const ctx = this.perlerCtx;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.perlerCanvas.width, this.perlerCanvas.height);
        
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = '#667eea';
        ctx.textAlign = 'left';
        ctx.fillText('豆师傅', 5, 15);
        
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333';
        
        for (let x = 0; x < perlerWidth; x++) {
            ctx.fillText(x + 1, coordSize + x * cellSize + cellSize / 2, coordSize / 2);
        }
        
        for (let y = 0; y < perlerHeight; y++) {
            ctx.fillText(y + 1, coordSize / 2, coordSize + y * cellSize + cellSize / 2);
        }
        
        for (let y = 0; y < perlerHeight; y++) {
            for (let x = 0; x < perlerWidth; x++) {
                const color = perlerColors[y][x];
                const px = coordSize + x * cellSize;
                const py = coordSize + y * cellSize;
                
                const nameLen = color.name.length;
                let fontSize = 11;
                if (nameLen === 1) {
                    fontSize = 12;
                } else if (nameLen === 2) {
                    fontSize = 11;
                } else if (nameLen === 3) {
                    fontSize = 9;
                } else {
                    fontSize = 8;
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
    }

    drawColorLegend() {
        const legendCanvas = document.createElement('canvas');
        const legendCtx = legendCanvas.getContext('2d');
        const colorNames = Object.keys(this.colorCounts).sort();
        
        const totalBeans = Object.values(this.colorCounts).reduce((a, b) => a + b, 0);
        
        const columns = Math.min(6, Math.ceil(colorNames.length / 10));
        const itemsPerColumn = Math.ceil(colorNames.length / columns);
        const columnWidth = 90;
        
        legendCanvas.width = columns * columnWidth + 20;
        legendCanvas.height = 70 + itemsPerColumn * 24;
        legendCtx.fillStyle = '#ffffff';
        legendCtx.fillRect(0, 0, legendCanvas.width, legendCanvas.height);
        
        legendCtx.font = 'bold 14px sans-serif';
        legendCtx.fillStyle = '#667eea';
        legendCtx.textAlign = 'left';
        legendCtx.fillText(getI18nText('colorLegend'), 10, 20);
        
        legendCtx.font = 'bold 13px sans-serif';
        legendCtx.fillStyle = '#333';
        legendCtx.fillText(`${getI18nText('totalBeans')}: ${totalBeans} ${getI18nText('beans')}`, 10, 42);
        
        let col = 0, row = 0;
        
        for (const name of colorNames) {
            const count = this.colorCounts[name];
            const colorSetName = this.colorSetSelect.value;
            const colorSet = colorSets[colorSetName];
            const color = colorSet.find(c => c.name === name);
            
            const x = 10 + col * columnWidth;
            const y = 60 + row * 24;
            
            if (color) {
                legendCtx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                legendCtx.fillRect(x, y - 8, 22, 22);
                legendCtx.strokeStyle = '#999';
                legendCtx.strokeRect(x, y - 8, 22, 22);
                
                legendCtx.fillStyle = getContrastTextColor(color.rgb);
                legendCtx.font = 'bold 8px sans-serif';
                legendCtx.textAlign = 'center';
                legendCtx.textBaseline = 'middle';
                legendCtx.fillText(name, x + 11, y + 3);
                legendCtx.textAlign = 'left';
                legendCtx.textBaseline = 'alphabetic';
            }
            
            legendCtx.fillStyle = '#333';
            legendCtx.font = '11px sans-serif';
            legendCtx.fillText(`×${count}`, x + 28, y + 5);
            
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
        
        const position = this.legendPosition.value;
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
        } else {
            legendDiv.classList.remove('horizontal');
            colorLegendArea.classList.remove('horizontal');
            this.perlerContent.style.flexDirection = 'column';
            this.perlerContent.style.gap = '0px';
            colorLegendArea.style.flexDirection = 'column';
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
        this.perlerMode = false;
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
        
        const cellSize = 24;
        const coordSize = 35;
        const colorNames = Object.keys(this.colorCounts).sort();
        const totalBeans = Object.values(this.colorCounts).reduce((a, b) => a + b, 0);
        
        const columns = Math.min(6, Math.ceil(colorNames.length / 10));
        const itemsPerColumn = Math.ceil(colorNames.length / columns);
        const columnWidth = 100;
        const legendWidth = columns * columnWidth + 40;
        const legendHeight = 80 + itemsPerColumn * 28;
        
        const position = this.legendPosition.value;
        let canvasWidth, canvasHeight, legendX, legendY;
        
        if (position === 'right') {
            canvasWidth = coordSize + perlerWidth * cellSize + legendWidth + 40;
            canvasHeight = Math.max(coordSize + perlerHeight * cellSize, legendHeight + 40);
            legendX = coordSize + perlerWidth * cellSize + 20;
            legendY = 20;
        } else {
            canvasWidth = Math.max(coordSize + perlerWidth * cellSize, legendWidth);
            canvasHeight = coordSize + perlerHeight * cellSize + legendHeight + 40;
            legendX = 20;
            legendY = coordSize + perlerHeight * cellSize + 20;
        }
        
        const downloadCanvas = document.createElement('canvas');
        const downloadCtx = downloadCanvas.getContext('2d');
        downloadCanvas.width = canvasWidth;
        downloadCanvas.height = canvasHeight;
        
        downloadCtx.fillStyle = '#ffffff';
        downloadCtx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
        
        downloadCtx.drawImage(this.perlerCanvas, 0, 0);
        
        downloadCtx.font = 'bold 16px sans-serif';
        downloadCtx.fillStyle = '#667eea';
        downloadCtx.textAlign = 'left';
        downloadCtx.fillText(getI18nText('colorLegend'), legendX, legendY + 20);
        
        downloadCtx.font = 'bold 14px sans-serif';
        downloadCtx.fillStyle = '#333';
        downloadCtx.fillText(`${getI18nText('totalBeans')}: ${totalBeans} ${getI18nText('beans')}`, legendX, legendY + 45);
        
        const colorSetName = this.colorSetSelect.value;
        const colorSet = colorSets[colorSetName];
        
        let col = 0, row = 0;
        
        for (const name of colorNames) {
            const count = this.colorCounts[name];
            const color = colorSet.find(c => c.name === name);
            
            const x = legendX + col * columnWidth;
            const y = legendY + 70 + row * 28;
            
            if (color) {
                downloadCtx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                downloadCtx.fillRect(x, y - 10, 24, 24);
                downloadCtx.strokeStyle = '#999';
                downloadCtx.strokeRect(x, y - 10, 24, 24);
                
                downloadCtx.fillStyle = getContrastTextColor(color.rgb);
                downloadCtx.font = 'bold 9px sans-serif';
                downloadCtx.textAlign = 'center';
                downloadCtx.textBaseline = 'middle';
                downloadCtx.fillText(name, x + 12, y + 2);
                downloadCtx.textAlign = 'left';
                downloadCtx.textBaseline = 'alphabetic';
            }
            
            downloadCtx.fillStyle = '#333';
            downloadCtx.font = '12px sans-serif';
            downloadCtx.fillText(`×${count}`, x + 32, y + 4);
            
            row++;
            if (row >= itemsPerColumn) {
                row = 0;
                col++;
            }
        }
        
        const link = document.createElement('a');
        
        const chartStyle = this.chartStyle.value;
        const legendPosition = this.legendPosition.value;
        const beadShape = this.beadShape.value;
        
        const i18nFileName = i18n[getCurrentLang()].fileName;
        let fileName = `${i18nFileName.perlerChart}_${colorSetName}_${perlerWidth}x${perlerHeight}`;
        if (chartStyle === 'bw') fileName += `_${i18nFileName.bw}`;
        if (chartStyle === 'color-with-code') fileName += `_${i18nFileName.withCode}`;
        if (beadShape === 'circle') fileName += `_${i18nFileName.circle}`;
        if (legendPosition === 'right') fileName += `_${i18nFileName.legendRight}`;
        fileName += '.png';
        
        link.download = fileName;
        link.href = downloadCanvas.toDataURL('image/png');
        link.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PixelArtGenerator();
});
