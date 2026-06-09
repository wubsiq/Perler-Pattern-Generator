
/**
 * SmartOptimizer - 负责智能优化功能
 */
class SmartOptimizer {
    constructor() {
        this.suggestions = [];
        this.acceptedSuggestions = new Set();
    }

    /**
     * 计算RGB距离
     * @param {Array} rgb1
     * @param {Array} rgb2
     * @returns {number}
     */
    getRgbDistance(rgb1, rgb2) {
        const dr = rgb1[0] - rgb2[0];
        const dg = rgb1[1] - rgb2[1];
        const db = rgb1[2] - rgb2[2];
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    /**
     * 检查颜色是否主要在边缘
     * @param {string} colorName
     * @param {Array} perlerColors
     * @param {number} width
     * @param {number} height
     * @returns {boolean}
     */
    isColorOnEdge(colorName, perlerColors, width, height) {
        let edgeCount = 0;
        let totalCount = 0;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (perlerColors[y][x].name === colorName) {
                    totalCount++;

                    let differentNeighbors = 0;
                    const neighbors = [
                        [y - 1, x],
                        [y + 1, x],
                        [y, x - 1],
                        [y, x + 1]
                    ];

                    for (const [ny, nx] of neighbors) {
                        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                            if (perlerColors[ny][nx].name !== colorName) {
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

    /**
     * 生成近似色融合建议 - 全局最优配对算法
     * @param {Array} colorsByUsage
     * @param {Array} colorSet
     * @param {number} mergeThreshold
     * @returns {Array}
     */
    generateMergeSuggestions(colorsByUsage, colorSet, mergeThreshold) {
        const suggestions = [];
        const rgbDistanceThreshold = ((100 - mergeThreshold) / 100) * 255 * 3;

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

        // 2. 按相似度从高到低排序
        candidates.sort((a, b) => a.distance - b.distance);

        // 3. 贪心选择最优配对
        const used = new Set();
        for (const candidate of candidates) {
            if (used.has(candidate.nameA) || used.has(candidate.nameB)) continue;

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
        }

        return suggestions;
    }

    /**
     * 生成智能优化建议
     * @param {Array} perlerColors
     * @param {number} width
     * @param {number} height
     * @param {Array} colorSet
     * @param {Object} options
     * @returns {Array}
     */
    generateColorSuggestions(perlerColors, width, height, colorSet, options = {}) {
        const suggestions = [];
        const enableMerge = options.enableMerge || false;
        const mergeThreshold = options.mergeThreshold || 85;
        const enableEdgeColorMerge = options.enableEdgeColorMerge || false;
        const edgeColorThreshold = options.edgeColorThreshold || 85;

        // 统计颜色使用情况
        const colorUsage = new Map();
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const color = perlerColors[y][x];
                colorUsage.set(color.name, (colorUsage.get(color.name) || 0) + 1);
            }
        }

        const totalBeans = width * height;
        const usageThreshold = Math.max(2, Math.floor(totalBeans * 0.005));

        const colorsByUsage = Array.from(colorUsage.entries())
            .sort((a, b) => a[1] - b[1]);

        const highUsageColors = colorsByUsage
            .filter(([_, count]) => count > usageThreshold * 2)
            .map(([name]) => colorSet.find(c => c.name === name))
            .filter(Boolean);

        if (enableMerge) {
            const mergeSuggestions = this.generateMergeSuggestions(colorsByUsage, colorSet, mergeThreshold);
            suggestions.push(...mergeSuggestions);
        }

        const processedColors = new Set(suggestions.map(s => s.originalColor.name));

        const edgeEffectiveThreshold = ((100 - edgeColorThreshold) / 100) * (255 * 3);
        const normalEffectiveThreshold = ((100 - 85) / 100) * (255 * 3);

        for (const [colorName, count] of colorsByUsage) {
            if (processedColors.has(colorName)) continue;

            if (count >= usageThreshold * 2) continue;

            const originalColor = colorSet.find(c => c.name === colorName);
            if (!originalColor) continue;

            const isEdgeColor = this.isColorOnEdge(colorName, perlerColors, width, height);

            if (isEdgeColor && !enableEdgeColorMerge) continue;

            let bestReplacement = null;
            let minDistance = Infinity;

            for (const candidate of highUsageColors) {
                if (candidate.name === colorName) continue;

                const distance = this.getRgbDistance(originalColor.rgb, candidate.rgb);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestReplacement = candidate;
                }
            }

            const effectiveThreshold = isEdgeColor ? edgeEffectiveThreshold : normalEffectiveThreshold;

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

        return suggestions.sort((a, b) => {
            if (a.isMerge && !b.isMerge) return -1;
            if (!a.isMerge && b.isMerge) return 1;
            return a.beanCount - b.beanCount;
        });
    }

    /**
     * 应用优化建议
     * @param {Array} perlerColors
     * @param {number} width
     * @param {number} height
     * @param {Array} suggestions
     * @returns {Array}
     */
    applyOptimizations(perlerColors, width, height, suggestions) {
        const newColors = perlerColors.map(row => [...row]);

        for (const suggestion of suggestions) {
            if (!suggestion.accepted) continue;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (newColors[y][x].name === suggestion.originalColor.name) {
                        newColors[y][x] = suggestion.replacementColor;
                    }
                }
            }
        }

        return newColors;
    }

    /**
     * 获取建议
     * @returns {Array}
     */
    getSuggestions() {
        return this.suggestions;
    }

    /**
     * 设置建议
     * @param {Array} suggestions
     */
    setSuggestions(suggestions) {
        this.suggestions = suggestions;
        this.acceptedSuggestions.clear();
    }
}


