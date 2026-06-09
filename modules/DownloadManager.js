/**
 * DownloadManager - 负责下载和导出功能
 * 管理像素化图片、拼豆图表等的导出
 */
class DownloadManager {
    constructor() {
        this.exportCounter = {
            pixelated: 0,
            perler: 0
        };
    }

    /**
     * 重置导出计数器
     */
    resetCounters() {
        this.exportCounter = {
            pixelated: 0,
            perler: 0
        };
    }

    /**
     * 下载像素化图片
     * @param {Object} options - 下载选项
     * @param {ImageData} options.pixelatedData - 像素化数据
     * @param {number} options.pixelatedCanvasNaturalWidth - 画布自然宽度
     * @param {number} options.pixelatedCanvasNaturalHeight - 画布自然高度
     * @param {string} options.pixelSize - 像素大小
     * @param {string} options.pixelMethod - 像素化方法
     * @param {boolean} options.enableContrast - 是否启用对比度
     * @param {string} options.contrastValue - 对比度值
     * @param {boolean} options.enableSharpen - 是否启用锐化
     * @param {string} options.sharpenValue - 锐化值
     * @param {boolean} options.enableColorQuantize - 是否启用颜色量化
     * @param {string} options.colorCountValue - 颜色数量
     */
    downloadPixelatedImage(options) {
        this.exportCounter.pixelated++;

        let fileName = 'pixelated-image';
        if (this.exportCounter.pixelated > 1) {
            fileName += `_(${this.exportCounter.pixelated})`;
        }

        const methodMap = {
            'average': 'avg',
            'majority': 'major',
            'pixel-art': 'pixel-art',
            'quantized': 'quant'
        };
        const methodName = methodMap[options.pixelMethod] || options.pixelMethod;

        fileName += `_${methodName}_px${options.pixelSize}`;

        if (options.enableContrast) {
            const contrast = parseFloat(options.contrastValue).toFixed(1);
            fileName += `_c${contrast}`;
        }
        if (options.enableSharpen) {
            const sharpen = parseFloat(options.sharpenValue).toFixed(1);
            fileName += `_s${sharpen}`;
        }
        if (options.enableColorQuantize) {
            const colorCount = options.colorCountValue;
            fileName += `_q${colorCount}`;
        }

        fileName += '.png';

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = options.pixelatedCanvasNaturalWidth;
        tempCanvas.height = options.pixelatedCanvasNaturalHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(options.pixelatedData, 0, 0);

        this.downloadFromCanvas(tempCanvas, fileName);
    }

    /**
     * 导出自定义编辑的像素图片
     * @param {Object} options - 导出选项
     * @param {Array} options.customEditData - 自定义编辑数据
     * @param {number} options.perlerWidth - 拼豆宽度
     * @param {number} options.perlerHeight - 拼豆高度
     * @param {boolean} options.useTransparent - 是否使用透明背景
     * @param {number} options.beadSize - 豆子大小
     * @param {Object|null} options.canvasBounds - 画布边界
     */
    exportPixelImage(options) {
        if (!options.customEditData) {
            alert('请先加载可编辑的像素图！');
            return;
        }

        let displayLeft = 0, displayRight = options.perlerWidth;
        let displayTop = 0, displayBottom = options.perlerHeight;
        if (options.canvasBounds) {
            displayLeft = options.canvasBounds.left;
            displayRight = options.canvasBounds.right;
            displayTop = options.canvasBounds.top;
            displayBottom = options.canvasBounds.bottom;
        }

        const exportWidth = (displayRight - displayLeft) * options.beadSize;
        const exportHeight = (displayBottom - displayTop) * options.beadSize;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = exportWidth;
        tempCanvas.height = exportHeight;
        const tempCtx = tempCanvas.getContext('2d');

        if (!options.useTransparent) {
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, exportWidth, exportHeight);
        }

        for (let y = displayTop; y < displayBottom; y++) {
            for (let x = displayLeft; x < displayRight; x++) {
                const color = options.customEditData[y][x];
                const px = (x - displayLeft) * options.beadSize;
                const py = (y - displayTop) * options.beadSize;

                if (!color.isTransparent) {
                    tempCtx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                    tempCtx.fillRect(px, py, options.beadSize, options.beadSize);
                }
            }
        }

        let fileName = 'custom-pixel-image';
        if (options.useTransparent) {
            fileName += '_transparent';
        }
        fileName += '.png';

        this.downloadFromCanvas(tempCanvas, fileName);
    }

    /**
     * 下载拼豆图表
     * @param {Object} options - 下载选项
     * @param {string} options.format - 导出格式 (png/svg)
     * @param {Array} options.perlerColors - 拼豆颜色数据
     * @param {number} options.perlerWidth - 拼豆宽度
     * @param {number} options.perlerHeight - 拼豆高度
     * @param {string} options.colorSetName - 颜色套装名称
     * @param {Object} options.chartOptions - 图表选项
     * @param {Function} options.drawPerlerChartToCanvas - 绘制图表到画布的回调
     */
    downloadPerlerChart(options) {
        if (options.format === 'svg') {
            return this.downloadPerlerChartSVG(options);
        }
        return this.downloadPerlerChartPNG(options);
    }

    /**
     * 下载 SVG 格式的拼豆图表
     * @param {Object} options - 下载选项
     */
    downloadPerlerChartSVG(options) {
        const svgString = perlerGenerator.generatePerlerChartSVG(
            options.perlerColors,
            options.perlerWidth,
            options.perlerHeight,
            options.chartOptions.exportBeadSize,
            options.colorSetName,
            options.chartOptions
        );

        this.exportCounter.perler++;
        const i18nFileName = i18n[getCurrentLang()].fileName;
        let fileName = `${i18nFileName.perlerChart}_${options.colorSetName}_${options.perlerWidth}x${options.perlerHeight}`;

        if (this.exportCounter.perler > 1) fileName += `_(${this.exportCounter.perler})`;

        const chartStyle = options.chartOptions.chartStyle;
        const beadShape = options.chartOptions.beadShape;

        if (chartStyle === 'bw') fileName += `_${i18nFileName.bw}`;
        if (chartStyle === 'color-with-code') fileName += `_${i18nFileName.withCode}`;
        if (beadShape === 'circle') fileName += `_${i18nFileName.circle}`;
        if (beadShape === 'ring') fileName += `_${i18nFileName.ring}`;
        if (beadShape === 'round-square') fileName += `_${i18nFileName['round-square']}`;

        fileName += '.svg';

        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        this.downloadFromURL(url, fileName);
        URL.revokeObjectURL(url);
    }

    /**
     * 下载 PNG 格式的拼豆图表
     * @param {Object} options - 下载选项
     */
    downloadPerlerChartPNG(options) {
        const perlerWidth = options.perlerWidth;
        const perlerHeight = options.perlerHeight;
        const cellSize = options.chartOptions.exportBeadSize;
        const coordSize = Math.max(30, Math.floor(cellSize * 1.4));
        const footerSize = 25;
        const summaryMargin = cellSize * 2 + 20;
        const colorNames = Object.keys(options.chartOptions.colorCounts || {}).sort();
        const totalBeans = Object.values(options.chartOptions.colorCounts || {}).reduce((a, b) => a + b, 0);
        const colorTypes = colorNames.length;
        const position = options.chartOptions.legendPosition;
        const chartWidth = coordSize * 2 + perlerWidth * cellSize;
        const chartHeight = summaryMargin + coordSize * 2 + perlerHeight * cellSize + coordSize / 2 + footerSize;
        const colorSetName = options.colorSetName;

        let canvasWidth, canvasHeight;
        let legendX, legendY;
        let fontSizeScale, rectWidthScaled, rectHeightScaled, rowHeightScaled, columnWidthScaled;
        let legendTitleSize, totalSize, colorNameSize, legendYOffset1, legendYOffset2, legendStartY, legendXGap;
        let columns, itemsPerColumn, legendHeaderHeight;

        if (position !== 'hidden') {
            fontSizeScale = cellSize / 30;
            const rectWidth = 120;
            const rectHeight = 28;
            const rowHeight = rectHeight + 5;

            rectWidthScaled = Math.max(80, Math.floor(rectWidth * fontSizeScale));
            rectHeightScaled = Math.max(19, Math.floor(rectHeight * fontSizeScale));
            rowHeightScaled = Math.max(20, Math.floor(rowHeight * fontSizeScale));
            columnWidthScaled = Math.max(90, Math.floor((rectWidth + 10) * fontSizeScale));
            legendTitleSize = Math.max(10, Math.floor(13 * fontSizeScale));
            totalSize = Math.max(9, Math.floor(12 * fontSizeScale));
            colorNameSize = Math.max(8, Math.floor(11 * fontSizeScale));
            legendYOffset1 = Math.max(14, Math.floor(18 * fontSizeScale));
            legendYOffset2 = Math.max(28, Math.floor(36 * fontSizeScale));
            legendStartY = Math.max(39, Math.floor(50 * fontSizeScale));
            legendXGap = Math.max(6, Math.floor(8 * fontSizeScale));

            legendHeaderHeight = 60 * fontSizeScale;

            if (position === 'right') {
                const availableHeight = chartHeight - legendHeaderHeight;
                const maxItemsPerColumn = Math.max(1, Math.floor(availableHeight / rowHeightScaled));
                columns = Math.min(Math.ceil(colorNames.length / maxItemsPerColumn), 4);
                itemsPerColumn = Math.ceil(colorNames.length / columns);
            } else {
                const maxWidth = chartWidth - 20;
                const maxColumns = Math.max(1, Math.floor(maxWidth / columnWidthScaled));
                columns = Math.min(maxColumns, colorNames.length);
                itemsPerColumn = Math.ceil(colorNames.length / columns);
            }

            const legendWidth = columns * columnWidthScaled + 20 * fontSizeScale;
            const legendHeight = legendHeaderHeight + itemsPerColumn * rowHeightScaled;

            if (position === 'right') {
                canvasWidth = chartWidth + Math.max(legendWidth, 200 * fontSizeScale) + 40 * fontSizeScale;
                canvasHeight = Math.max(chartHeight, legendHeight);
                legendX = chartWidth + 20 * fontSizeScale;
                legendY = 0;
            } else {
                canvasWidth = Math.max(chartWidth, legendWidth);
                canvasHeight = chartHeight + legendHeight + 40 * fontSizeScale;
                legendX = 0;
                legendY = chartHeight + 20 * fontSizeScale;
            }
        } else {
            canvasWidth = chartWidth;
            canvasHeight = chartHeight;
        }

        const scale = parseFloat(options.chartOptions.exportScale);
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

        options.drawPerlerChartToCanvas(
            tempChartCtx,
            options.perlerColors,
            perlerWidth,
            perlerHeight,
            cellSize,
            colorSetName
        );

        const downloadCanvas = document.createElement('canvas');
        const downloadCtx = downloadCanvas.getContext('2d');
        downloadCanvas.width = finalWidth;
        downloadCanvas.height = finalHeight;

        downloadCtx.scale(scale, scale);
        downloadCtx.fillStyle = '#ffffff';
        downloadCtx.fillRect(0, 0, canvasWidth, canvasHeight);
        downloadCtx.drawImage(tempChartCanvas, 0, 0);

        if (position !== 'hidden' && colorNames.length > 0) {
            downloadCtx.font = `bold ${legendTitleSize}px sans-serif`;
            downloadCtx.fillStyle = '#667eea';
            downloadCtx.textAlign = 'left';
            downloadCtx.fillText(getI18nText('colorLegend'), legendX + legendXGap, legendY + legendYOffset1);

            downloadCtx.font = `bold ${totalSize}px sans-serif`;
            downloadCtx.fillStyle = '#333';
            downloadCtx.fillText(`${getI18nText('totalBeans')}: ${totalBeans} ${getI18nText('beans')} · ${getI18nText('colorTypes')}: ${colorTypes}`, legendX + legendXGap, legendY + legendYOffset2);

            const colorSet = colorSets[colorSetName];
            let col = 0, row = 0;

            for (const name of colorNames) {
                const count = options.chartOptions.colorCounts[name];
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
        }

        this.exportCounter.perler++;
        const i18nFileName = i18n[getCurrentLang()].fileName;
        let fileName = `${i18nFileName.perlerChart}_${colorSetName}_${perlerWidth}x${perlerHeight}`;

        if (this.exportCounter.perler > 1) {
            fileName += `_(${this.exportCounter.perler})`;
        }

        const chartStyle = options.chartOptions.chartStyle;
        const beadShape = options.chartOptions.beadShape;

        if (chartStyle === 'bw') fileName += `_${i18nFileName.bw}`;
        if (chartStyle === 'color-with-code') fileName += `_${i18nFileName.withCode}`;
        if (beadShape === 'circle') fileName += `_${i18nFileName.circle}`;
        if (beadShape === 'ring') fileName += `_${i18nFileName.ring}`;
        if (beadShape === 'round-square') fileName += `_${i18nFileName['round-square']}`;
        if (position === 'right') fileName += `_${i18nFileName.legendRight}`;
        if (scale !== 1) fileName += `_${scale}x`;

        fileName += '.png';

        this.downloadFromCanvas(downloadCanvas, fileName);
    }

    /**
     * 从画布下载
     * @param {HTMLCanvasElement} canvas - 画布元素
     * @param {string} fileName - 文件名
     */
    downloadFromCanvas(canvas, fileName) {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    /**
     * 从 URL 下载
     * @param {string} url - 下载 URL
     * @param {string} fileName - 文件名
     */
    downloadFromURL(url, fileName) {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        link.click();
    }
}


