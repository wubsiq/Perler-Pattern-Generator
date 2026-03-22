const i18n = {
    zh: {
        title: '豆师傅 - 拼豆图纸生成器',
        subtitle: '上传图片，一键生成像素艺术与拼豆图纸',
        uploadTitle: '点击或拖拽图片到此处上传',
        uploadHint: '支持 JPG、PNG、GIF 格式',
        controls: '调整参数',
        pixelSize: '像素块大小：',
        keepRatio: '保持宽高比',
        perlerMode: '拼豆模式',
        perlerOptions: '拼豆选项',
        pixelProcessing: '像素化后处理：',
        enableContrast: '增强对比度',
        contrastLevel: '对比度强度：',
        enableSharpen: '图片锐化',
        sharpenLevel: '锐化强度：',
        enableColorQuantize: '颜色量化',
        colorCount: '颜色数量：',
        colorSet: '颜色套装：',
        colorMapping: '颜色映射方法：',
        mappingCie2000: 'CIEDE2000 (最精确)',
        mappingCie94: 'CIE94 (精确)',
        mappingCie76: 'CIE76 (Lab)',
        mappingWeightedRgb: '加权RGB',
        mappingHsl: 'HSL色彩空间',
        mappingHsv: 'HSV色彩空间',
        chartStyle: '图纸样式：',
        chartStyleColor: '彩色图纸',
        chartStyleColorWithCode: '彩色图纸（带编号）',
        chartStyleBw: '黑白图纸(带编号)',
        legendPosition: '颜色统计位置：',
        legendPositionBottom: '图纸下方',
        legendPositionRight: '图纸右侧',
        beadShape: '拼豆形状：',
        beadShapeSquare: '正方形',
        beadShapeCircle: '圆形',
        beadSize: '拼豆大小：',
        showGridLines: '显示网格线',
        showCoordNumbers: '显示坐标数字',
        coordLineColor: '网格线颜色：',
        coordNumberColor: '坐标数字颜色：',
        renderPerler: '渲染拼豆图纸',
        originalPreview: '原图预览',
        pixelatedPreview: '像素化预览',
        perlerChart: '拼豆图纸',
        perlerSize: '拼豆尺寸',
        colorLegend: '颜色统计',
        totalBeans: '总计',
        beans: '颗',
        clear: '清空',
        reset: '重置',
        downloadPixel: '下载像素图',
        downloadPerler: '下载拼豆图纸',
        width: '宽度：',
        height: '高度：',
        fileName: {
            perlerChart: '豆师傅',
            withCode: '带编号',
            circle: '圆形',
            legendRight: '图例右侧',
            bw: 'bw'
        }
    },
    en: {
        title: 'Bead Master - Perler Pattern Generator',
        subtitle: 'Upload image to create pixel art and perler patterns',
        uploadTitle: 'Click or drag image here to upload',
        uploadHint: 'Supports JPG, PNG, GIF formats',
        controls: 'Adjust Parameters',
        pixelSize: 'Pixel Size: ',
        keepRatio: 'Keep Aspect Ratio',
        perlerMode: 'Perler Mode',
        perlerOptions: 'Perler Options',
        pixelProcessing: 'Pixel Post Processing: ',
        enableContrast: 'Enhance Contrast',
        contrastLevel: 'Contrast Level: ',
        enableSharpen: 'Sharpen Image',
        sharpenLevel: 'Sharpen Level: ',
        enableColorQuantize: 'Color Quantization',
        colorCount: 'Color Count: ',
        colorSet: 'Color Set: ',
        colorMapping: 'Color Mapping: ',
        mappingCie2000: 'CIEDE2000 (Most Accurate)',
        mappingCie94: 'CIE94 (Accurate)',
        mappingCie76: 'CIE76 (Lab)',
        mappingWeightedRgb: 'Weighted RGB',
        mappingHsl: 'HSL Color Space',
        mappingHsv: 'HSV Color Space',
        chartStyle: 'Chart Style: ',
        chartStyleColor: 'Color Chart',
        chartStyleColorWithCode: 'Color Chart (with Code)',
        chartStyleBw: 'B&W Chart (with Code)',
        legendPosition: 'Legend Position: ',
        legendPositionBottom: 'Below Chart',
        legendPositionRight: 'Right of Chart',
        beadShape: 'Bead Shape: ',
        beadShapeSquare: 'Square',
        beadShapeCircle: 'Circle',
        beadSize: 'Bead Size: ',
        showGridLines: 'Show Grid Lines',
        showCoordNumbers: 'Show Coordinate Numbers',
        coordLineColor: 'Grid Line Color: ',
        coordNumberColor: 'Coordinate Number Color: ',
        renderPerler: '🎨 Render Perler Chart',
        originalPreview: 'Original Preview',
        pixelatedPreview: 'Pixelated Preview',
        perlerChart: 'Perler Chart',
        perlerSize: 'Perler Size',
        colorLegend: 'Bead Master - Color Legend',
        totalBeans: 'Total',
        beans: 'beads',
        clear: 'Clear',
        reset: 'Reset',
        downloadPixel: 'Download Pixel Art',
        downloadPerler: 'Download Perler Chart',
        width: 'Width: ',
        height: 'Height: ',
        fileName: {
            perlerChart: 'BeadMaster',
            withCode: 'with-code',
            circle: 'circle',
            legendRight: 'legend-right',
            bw: 'bw'
        }
    }
};

let currentLang = 'zh';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('beadMasterLang', lang);
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) {
            el.textContent = i18n[lang][key];
        }
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (i18n[lang][key]) {
            el.placeholder = i18n[lang][key];
        }
    });
    
    document.querySelectorAll('option[data-i18n-value]').forEach(el => {
        const key = el.getAttribute('data-i18n-value');
        if (i18n[lang][key]) {
            el.textContent = i18n[lang][key];
        }
    });
    
    document.title = i18n[lang].title;
    
    document.getElementById('langZh').classList.toggle('active', lang === 'zh');
    document.getElementById('langEn').classList.toggle('active', lang === 'en');
    
    if (typeof pixelArtGenerator !== 'undefined' && pixelArtGenerator.perlerSize) {
        const perlerWidth = Math.ceil(parseInt(pixelArtGenerator.widthInput.value) / parseInt(pixelArtGenerator.pixelSizeSlider.value));
        const perlerHeight = Math.ceil(parseInt(pixelArtGenerator.heightInput.value) / parseInt(pixelArtGenerator.pixelSizeSlider.value));
        pixelArtGenerator.perlerSize.textContent = `${i18n[lang].perlerSize}: ${perlerWidth} × ${perlerHeight} ${i18n[lang].beans}`;
    }
}

function getI18nText(key) {
    return i18n[currentLang][key] || key;
}

function getCurrentLang() {
    return currentLang;
}
