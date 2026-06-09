/**
 * 拼豆化模块
 * 负责处理像素格子 → 拼豆颜色映射
 */
class PerlerGenerator {
    constructor() {
        // 这里我们复用 app.js 和 colorUtils.js 中的颜色映射和渲染函数
    }

    /**
     * 从 pixelatedData 提取像素格子
     * @param {ImageData} pixelatedData - 像素化后的图片数据
     * @param {number} targetWidth - 原图宽度
     * @param {number} targetHeight - 原图高度
     * @param {number} pixelSize - 像素块大小
     * @param {number} offsetX - X轴偏移
     * @param {number} offsetY - Y轴偏移
     * @returns {Object} - 包含 processedData、perlerWidth、perlerHeight
     */
    extractFromImageData(pixelatedData, targetWidth, targetHeight, pixelSize, offsetX, offsetY) {
        const perlerWidth = Math.ceil(targetWidth / pixelSize);
        const perlerHeight = Math.ceil(targetHeight / pixelSize);
        
        // 从纯净的 pixelatedData 提取每个格子的颜色
        const processedData = new ImageData(perlerWidth, perlerHeight);
        
        for (let y = 0; y < perlerHeight; y++) {
            for (let x = 0; x < perlerWidth; x++) {
                // 计算当前格子在 pixelatedData 中的位置
                const pixelX = -offsetX + x * pixelSize + Math.floor(pixelSize / 2);
                const pixelY = -offsetY + y * pixelSize + Math.floor(pixelSize / 2);
                
                // 取边界内的像素
                const sampleX = Math.max(0, Math.min(pixelX, targetWidth - 1));
                const sampleY = Math.max(0, Math.min(pixelY, targetHeight - 1));
                
                const srcIdx = (sampleY * targetWidth + sampleX) * 4;
                const dstIdx = (y * perlerWidth + x) * 4;
                
                processedData.data[dstIdx] = pixelatedData.data[srcIdx];
                processedData.data[dstIdx + 1] = pixelatedData.data[srcIdx + 1];
                processedData.data[dstIdx + 2] = pixelatedData.data[srcIdx + 2];
                processedData.data[dstIdx + 3] = pixelatedData.data[srcIdx + 3];
            }
        }

        return {
            processedData,
            perlerWidth,
            perlerHeight
        };
    }

    /**
     * 从 processedData 生成拼豆颜色矩阵
     * @param {ImageData} processedData - 处理后的图片数据
     * @param {number} perlerWidth - 拼豆宽度
     * @param {number} perlerHeight - 拼豆高度
     * @param {Object} options - 拼豆化选项
     * @returns {Object} - 拼豆化结果
     */
    generateFromProcessedData(processedData, perlerWidth, perlerHeight, options) {
        const {
            colorSet,
            mappingMethod,
            enableNeighborSmooth
        } = options;

        // 获取当前颜色套装
        let colors = colorSets[colorSet] || [];

        const colorCounts = {};
        const perlerColors = [];

        const transparentColor = {
            name: '',
            rgb: [255, 255, 255],
            isTransparent: true
        };

        // 颜色映射
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
                    closestColor = findClosestColor([r, g, b], colors, mappingMethod);
                    if (colorCounts[closestColor.name]) {
                        colorCounts[closestColor.name]++;
                    } else {
                        colorCounts[closestColor.name] = 1;
                    }
                }
                row.push(closestColor);
            }
            perlerColors.push(row);
        }

        let finalColors = perlerColors;
        let finalCounts = colorCounts;

        if (enableNeighborSmooth) {
            finalColors = mapWithNeighborConsistencyOnMatrix(perlerColors);
            
            finalCounts = {};
            for (let y = 0; y < perlerHeight; y++) {
                for (let x = 0; x < perlerWidth; x++) {
                    const color = finalColors[y][x];
                    if (finalCounts[color.name]) {
                        finalCounts[color.name]++;
                    } else {
                        finalCounts[color.name] = 1;
                    }
                }
            }
        }

        return {
            perlerColors: finalColors,
            perlerWidth,
            perlerHeight,
            colorCounts: finalCounts
        };
    }

    drawRingBead(ctx, px, py, cellSize, color, chartStyle, fontSize) {
        ctx.save();
        const ringWidth = Math.max(2, Math.floor(cellSize * 0.3));
        const centerX = px + cellSize / 2;
        const centerY = py + cellSize / 2;
        const outerRadius = cellSize / 2 - 1;
        const innerRadius = outerRadius - ringWidth;

        if (chartStyle === 'color') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
            ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
            ctx.fill();
        } else if (chartStyle === 'color-with-code') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
            ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = getContrastTextColor(color.rgb);
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(color.name, centerX, centerY);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#333';
            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillText(color.name, centerX, centerY);
        }

        ctx.restore();
    }

    drawRoundSquareBead(ctx, px, py, cellSize, color, chartStyle, fontSize) {
        ctx.save();
        const cornerRadius = Math.min(8, Math.floor(cellSize * 0.2));
        const actualSize = cellSize - 1;
        const centerX = px + cellSize / 2;
        const centerY = py + cellSize / 2;

        ctx.beginPath();
        ctx.moveTo(px + cornerRadius, py);
        ctx.lineTo(px + actualSize - cornerRadius, py);
        ctx.quadraticCurveTo(px + actualSize, py, px + actualSize, py + cornerRadius);
        ctx.lineTo(px + actualSize, py + actualSize - cornerRadius);
        ctx.quadraticCurveTo(px + actualSize, py + actualSize, px + actualSize - cornerRadius, py + actualSize);
        ctx.lineTo(px + cornerRadius, py + actualSize);
        ctx.quadraticCurveTo(px, py + actualSize, px, py + actualSize - cornerRadius);
        ctx.lineTo(px, py + cornerRadius);
        ctx.quadraticCurveTo(px, py, px + cornerRadius, py);
        ctx.closePath();

        if (chartStyle === 'color') {
            ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
            ctx.fill();
        } else if (chartStyle === 'color-with-code') {
            ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
            ctx.fill();
            ctx.fillStyle = getContrastTextColor(color.rgb);
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(color.name, centerX, centerY);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = '#333';
            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillText(color.name, centerX, centerY);
        }

        ctx.restore();
    }

    /**
     * 生成拼豆图纸 SVG
     * @param {Array} perlerColors - 拼豆颜色矩阵
     * @param {number} perlerWidth - 拼豆宽度
     * @param {number} perlerHeight - 拼豆高度
     * @param {number} cellSize - 单元格大小
     * @param {string} colorSetName - 颜色套装名称
     * @param {Object} options - 选项
     * @returns {string} - SVG 字符串
     */
    generatePerlerChartSVG(perlerColors, perlerWidth, perlerHeight, cellSize, colorSetName, options) {
        const {
            chartStyle,
            beadShape,
            showGrid,
            showCoords,
            coordLineColor,
            coordNumberColor,
            showLargeGrid,
            largeGridColor,
            largeGridSize,
            largeGridLineWidth,
            gridLineWidth,
            watermarkText,
            colorCounts,
            legendPosition
        } = options;

        const coordSize = Math.max(30, Math.floor(cellSize * 1.4));
        const footerSize = 25;
        const summaryMargin = cellSize * 2 + 20;

        const chartWidth = coordSize * 2 + perlerWidth * cellSize;
        const chartHeight = summaryMargin + coordSize * 2 + perlerHeight * cellSize + coordSize / 2 + footerSize;

        let finalWidth = chartWidth;
        let finalHeight = chartHeight;
        let legendX = 0, legendY = 0;
        let fontSizeScale, rectWidthScaled, rectHeightScaled, rowHeightScaled, columnWidthScaled;
        let legendTitleSize, totalSize, colorNameSize, legendYOffset1, legendYOffset2, legendStartY, legendXGap;
        let columns, itemsPerColumn, legendHeaderHeight;

        const colorNames = Object.keys(colorCounts || {}).sort();
        const totalBeans = Object.values(colorCounts || {}).reduce((a, b) => a + b, 0);
        const colorTypes = colorNames.length;

        // 先处理图例尺寸计算
        if (legendPosition !== 'hidden' && colorNames.length > 0) {
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

            if (legendPosition === 'right') {
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

            if (legendPosition === 'right') {
                finalWidth = chartWidth + Math.max(legendWidth, 200 * fontSizeScale) + 40 * fontSizeScale;
                finalHeight = Math.max(chartHeight, legendHeight);
                legendX = chartWidth + 20 * fontSizeScale;
                legendY = 0;
            } else {
                finalWidth = Math.max(chartWidth, legendWidth);
                finalHeight = chartHeight + legendHeight + 40 * fontSizeScale;
                legendX = 0;
                legendY = chartHeight + 20 * fontSizeScale;
            }
        }

        // 开始生成 SVG
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${finalWidth}" height="${finalHeight}" viewBox="0 0 ${finalWidth} ${finalHeight}">`;
        svg += `<rect x="0" y="0" width="${finalWidth}" height="${finalHeight}" fill="#ffffff"/>`;

        // === 1. 先绘制拼豆图纸部分 ===

        // 绘制坐标线和数字
        if (showCoords) {
            const fontSizeCoord = Math.max(9, Math.floor(cellSize * 0.45));

            // 上面编号
            for (let x = 0; x < perlerWidth; x++) {
                svg += `<text x="${coordSize + x * cellSize + cellSize / 2}" y="${summaryMargin + coordSize / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${fontSizeCoord}" fill="${coordNumberColor}">${x + 1}</text>`;
            }

            // 左边编号
            for (let y = 0; y < perlerHeight; y++) {
                svg += `<text x="${coordSize / 2}" y="${summaryMargin + coordSize + y * cellSize + cellSize / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${fontSizeCoord}" fill="${coordNumberColor}">${y + 1}</text>`;
            }

            // 右边编号
            const rightCoordX = coordSize + perlerWidth * cellSize + coordSize / 2;
            for (let y = 0; y < perlerHeight; y++) {
                svg += `<text x="${rightCoordX}" y="${summaryMargin + coordSize + y * cellSize + cellSize / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${fontSizeCoord}" fill="${coordNumberColor}">${y + 1}</text>`;
            }

            // 下面编号
            const bottomCoordY = summaryMargin + coordSize + perlerHeight * cellSize + coordSize / 2;
            for (let x = 0; x < perlerWidth; x++) {
                svg += `<text x="${coordSize + x * cellSize + cellSize / 2}" y="${bottomCoordY}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${fontSizeCoord}" fill="${coordNumberColor}">${x + 1}</text>`;
            }
        }

        // 绘制网格线
        if (showGrid && gridLineWidth > 0) {
            for (let x = 0; x <= perlerWidth; x++) {
                svg += `<line x1="${coordSize + x * cellSize - 0.5}" y1="${summaryMargin + coordSize}" x2="${coordSize + x * cellSize - 0.5}" y2="${summaryMargin + coordSize + perlerHeight * cellSize}" stroke="${coordLineColor}" stroke-width="${gridLineWidth}"/>`;
            }
            for (let y = 0; y <= perlerHeight; y++) {
                svg += `<line x1="${coordSize}" y1="${summaryMargin + coordSize + y * cellSize - 0.5}" x2="${coordSize + perlerWidth * cellSize}" y2="${summaryMargin + coordSize + y * cellSize - 0.5}" stroke="${coordLineColor}" stroke-width="${gridLineWidth}"/>`;
            }
        }

        // 绘制大格子线
        if (showLargeGrid && largeGridSize > 0) {
            for (let x = 0; x <= perlerWidth; x += largeGridSize) {
                svg += `<line x1="${coordSize + x * cellSize}" y1="${summaryMargin + coordSize}" x2="${coordSize + x * cellSize}" y2="${summaryMargin + coordSize + perlerHeight * cellSize}" stroke="${largeGridColor}" stroke-width="${largeGridLineWidth}"/>`;
            }
            for (let y = 0; y <= perlerHeight; y += largeGridSize) {
                svg += `<line x1="${coordSize}" y1="${summaryMargin + coordSize + y * cellSize}" x2="${coordSize + perlerWidth * cellSize}" y2="${summaryMargin + coordSize + y * cellSize}" stroke="${largeGridColor}" stroke-width="${largeGridLineWidth}"/>`;
            }
        }

        // 绘制拼豆
        for (let y = 0; y < perlerHeight; y++) {
            for (let x = 0; x < perlerWidth; x++) {
                const color = perlerColors[y][x];
                const px = coordSize + x * cellSize;
                const py = summaryMargin + coordSize + y * cellSize;

                if (color.isTransparent) {
                    svg += `<rect x="${px}" y="${py}" width="${cellSize - 1}" height="${cellSize - 1}" fill="#ffffff"/>`;
                } else {
                    const nameLen = color.name.length;
                    const fontSizeBase = Math.max(6, Math.floor(cellSize * 0.45));
                    let fontSize = fontSizeBase;
                    if (nameLen === 1) fontSize = Math.floor(fontSizeBase * 1.1);
                    else if (nameLen === 2) fontSize = fontSizeBase;
                    else if (nameLen === 3) fontSize = Math.floor(fontSizeBase * 0.85);
                    else fontSize = Math.floor(fontSizeBase * 0.7);

                    if (beadShape === 'circle') {
                        svg += `<circle cx="${px + cellSize / 2}" cy="${py + cellSize / 2}" r="${cellSize / 2 - 1}" fill="rgb(${color.rgb[0]},${color.rgb[1]},${color.rgb[2]})"/>`;
                        if (chartStyle === 'color-with-code') {
                            const textFill = getContrastTextColor(color.rgb);
                            svg += `<text x="${px + cellSize / 2}" y="${py + cellSize / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${fontSize}" fill="${textFill}" font-weight="bold">${color.name}</text>`;
                        } else if (chartStyle === 'bw') {
                            svg += `<circle cx="${px + cellSize / 2}" cy="${py + cellSize / 2}" r="${cellSize / 2 - 1}" fill="#ffffff" stroke="#999" stroke-width="1"/>`;
                            svg += `<text x="${px + cellSize / 2}" y="${py + cellSize / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${fontSize}" fill="#333">${color.name}</text>`;
                        }
                    } else if (beadShape === 'ring') {
                        const ringWidth = Math.max(2, Math.floor(cellSize * 0.3));
                        const outerRadius = cellSize / 2 - 1;
                        const innerRadius = outerRadius - ringWidth;

                        if (chartStyle === 'color') {
                            svg += `<rect x="${px}" y="${py}" width="${cellSize - 1}" height="${cellSize - 1}" fill="#ffffff"/>`;
                            svg += `<circle cx="${px + cellSize / 2}" cy="${py + cellSize / 2}" r="${outerRadius}" fill="rgb(${color.rgb[0]},${color.rgb[1]},${color.rgb[2]})"/>`;
                            svg += `<circle cx="${px + cellSize / 2}" cy="${py + cellSize / 2}" r="${innerRadius}" fill="#ffffff"/>`;
                        } else if (chartStyle === 'color-with-code') {
                            svg += `<rect x="${px}" y="${py}" width="${cellSize - 1}" height="${cellSize - 1}" fill="#ffffff"/>`;
                            svg += `<circle cx="${px + cellSize / 2}" cy="${py + cellSize / 2}" r="${outerRadius}" fill="rgb(${color.rgb[0]},${color.rgb[1]},${color.rgb[2]})"/>`;
                            svg += `<circle cx="${px + cellSize / 2}" cy="${py + cellSize / 2}" r="${innerRadius}" fill="#ffffff"/>`;
                            const textFill = getContrastTextColor(color.rgb);
                            svg += `<text x="${px + cellSize / 2}" y="${py + cellSize / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${fontSize}" fill="${textFill}" font-weight="bold">${color.name}</text>`;
                        } else {
                            svg += `<rect x="${px}" y="${py}" width="${cellSize - 1}" height="${cellSize - 1}" fill="#ffffff"/>`;
                            svg += `<circle cx="${px + cellSize / 2}" cy="${py + cellSize / 2}" r="${outerRadius}" fill="none" stroke="#999" stroke-width="1"/>`;
                            svg += `<circle cx="${px + cellSize / 2}" cy="${py + cellSize / 2}" r="${innerRadius}" fill="none" stroke="#999" stroke-width="1"/>`;
                            svg += `<text x="${px + cellSize / 2}" y="${py + cellSize / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${fontSize}" fill="#333">${color.name}</text>`;
                        }
                    } else if (beadShape === 'round-square') {
                        const cornerRadius = Math.min(8, Math.floor(cellSize * 0.2));
                        const actualSize = cellSize - 1;
                        let pathD = `M ${px + cornerRadius} ${py} L ${px + actualSize - cornerRadius} ${py} Q ${px + actualSize} ${py} ${px + actualSize} ${py + cornerRadius} L ${px + actualSize} ${py + actualSize - cornerRadius} Q ${px + actualSize} ${py + actualSize} ${px + actualSize - cornerRadius} ${py + actualSize} L ${px + cornerRadius} ${py + actualSize} Q ${px} ${py + actualSize} ${px} ${py + actualSize - cornerRadius} L ${px} ${py + cornerRadius} Q ${px} ${py} ${px + cornerRadius} ${py} Z`;
                        
                        if (chartStyle === 'color') {
                            svg += `<path d="${pathD}" fill="rgb(${color.rgb[0]},${color.rgb[1]},${color.rgb[2]})"/>`;
                        } else if (chartStyle === 'color-with-code') {
                            svg += `<path d="${pathD}" fill="rgb(${color.rgb[0]},${color.rgb[1]},${color.rgb[2]})"/>`;
                            const textFill = getContrastTextColor(color.rgb);
                            svg += `<text x="${px + cellSize / 2}" y="${py + cellSize / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${fontSize}" fill="${textFill}" font-weight="bold">${color.name}</text>`;
                        } else {
                            svg += `<path d="${pathD}" fill="#ffffff" stroke="#999" stroke-width="1"/>`;
                            svg += `<text x="${px + cellSize / 2}" y="${py + cellSize / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${fontSize}" fill="#333">${color.name}</text>`;
                        }
                    } else { // square
                        if (chartStyle === 'color') {
                            svg += `<rect x="${px}" y="${py}" width="${cellSize - 1}" height="${cellSize - 1}" fill="rgb(${color.rgb[0]},${color.rgb[1]},${color.rgb[2]})"/>`;
                        } else if (chartStyle === 'color-with-code') {
                            svg += `<rect x="${px}" y="${py}" width="${cellSize - 1}" height="${cellSize - 1}" fill="rgb(${color.rgb[0]},${color.rgb[1]},${color.rgb[2]})"/>`;
                            const textFill = getContrastTextColor(color.rgb);
                            svg += `<text x="${px + cellSize / 2}" y="${py + cellSize / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${fontSize}" fill="${textFill}" font-weight="bold">${color.name}</text>`;
                        } else {
                            svg += `<rect x="${px}" y="${py}" width="${cellSize - 1}" height="${cellSize - 1}" fill="#ffffff" stroke="#999" stroke-width="1"/>`;
                            svg += `<text x="${px + cellSize / 2}" y="${py + cellSize / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${fontSize}" fill="#333">${color.name}</text>`;
                        }
                    }
                }
            }
        }

        // === 2. 绘制顶部的水印和摘要信息 ===
        const summaryText = `[${perlerWidth}x${perlerHeight}/${perlerWidth * perlerHeight}颗/${colorSetName}]`;
        const summaryFontSize = cellSize * 1.3;
        const watermarkFontSize = cellSize * 0.8;
        const summaryY = summaryMargin / 2;

        // 水印（靠左）
        svg += `<text x="${coordSize + 10}" y="${summaryY}" text-anchor="start" dominant-baseline="middle" font-family="sans-serif" font-size="${watermarkFontSize}" fill="#666">${watermarkText}</text>`;

        // 摘要（靠右）
        svg += `<text x="${coordSize + perlerWidth * cellSize - 10}" y="${summaryY}" text-anchor="end" dominant-baseline="middle" font-family="sans-serif" font-size="${summaryFontSize}" fill="#333" font-weight="bold">${summaryText}</text>`;

        // === 3. 绘制图例和颜色统计 ===
        if (legendPosition !== 'hidden' && colorNames.length > 0) {
            // 绘制图例标题
            svg += `<text x="${legendX + legendXGap}" y="${legendY + legendYOffset1}" text-anchor="start" dominant-baseline="alphabetic" font-family="sans-serif" font-size="${legendTitleSize}" fill="#667eea" font-weight="bold">颜色图例</text>`;

            // 绘制总数量和颜色类型
            svg += `<text x="${legendX + legendXGap}" y="${legendY + legendYOffset2}" text-anchor="start" dominant-baseline="alphabetic" font-family="sans-serif" font-size="${totalSize}" fill="#333" font-weight="bold">总数量: ${totalBeans} 颗 · 颜色: ${colorTypes}</text>`;

            // 绘制颜色卡
            let col = 0, row = 0;
            const colorSet = colorSets[colorSetName];

            for (const name of colorNames) {
                const count = colorCounts[name];
                const color = colorSet.find(c => c.name === name);

                const x = legendX + legendXGap + col * columnWidthScaled;
                const y = legendY + legendStartY + row * rowHeightScaled;

                if (color) {
                    // 绘制色卡
                    svg += `<rect x="${x}" y="${y}" width="${rectWidthScaled}" height="${rectHeightScaled}" fill="rgb(${color.rgb[0]},${color.rgb[1]},${color.rgb[2]})" stroke="#999" stroke-width="1"/>`;

                    // 绘制文字
                    const textFill = getContrastTextColor(color.rgb);
                    svg += `<text x="${x + rectWidthScaled / 2}" y="${y + rectHeightScaled / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${colorNameSize}" fill="${textFill}" font-weight="bold">${name} x ${count}</text>`;
                }

                row++;
                if (row >= itemsPerColumn) {
                    row = 0;
                    col++;
                }
            }
        }

        svg += `</svg>`;
        return svg;
    }
}


