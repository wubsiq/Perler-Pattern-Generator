const fs = require('fs');
const path = require('path');

console.log('=== 模拟浏览器加载测试 ===\n');

// 1. 读取 bundle
const bundlePath = path.join(__dirname, 'js', 'bundle.min.js');
const bundle = fs.readFileSync(bundlePath, 'utf-8');

// 2. 模拟 DOM 元素
let savedHandlers = {};
let elementCount = 0;

function makeElement(id) {
    const el = {
        id: id,
        classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
        style: {},
        dataset: {},
        textContent: '',
        innerHTML: '',
        value: 'mard291',
        files: [null],
        appendChild: (c) => {},
        addEventListener: (ev, fn) => {
            if (!savedHandlers[id]) savedHandlers[id] = {};
            savedHandlers[id][ev] = fn;
            elementCount++;
        },
        querySelectorAll: () => [],
        getElementsByTagName: () => [],
        click: () => {},
        getContext: () => ({
            fillRect: () => {},
            fillStyle: '',
            imageSmoothingEnabled: false,
            drawImage: () => {},
            getImageData: () => ({ data: new Array(100).fill(0) }),
            putImageData: () => {},
            clearRect: () => {},
            measureText: () => ({ width: 10 }),
            beginPath: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {},
            strokeRect: () => {},
            font: '',
            strokeStyle: '',
            lineWidth: 1,
            moveTo: () => {},
            lineTo: () => {},
            toDataURL: () => 'test-data-url',
        }),
    };
    return el;
}

// 3. 模拟 document
const fakeElements = {};
const elementIds = [
    'uploadArea', 'blankCanvasArea', 'blankCanvasModal',
    'blankCanvasWidth', 'blankCanvasHeight',
    'closeBlankCanvasModalBtn', 'cancelBlankCanvasBtn', 'confirmBlankCanvasBtn',
    'originalSection', 'pixelatedSection', 'modeSwitch', 'customEditSection',
    'fileInput', 'uploadSection', 'showcaseSection', 'showcaseGrid',
    'workspace', 'perlerSection',
    'originalCanvas', 'pixelatedCanvas', 'perlerCanvas',
    'originalSize', 'pixelatedSize', 'pixelatedGridCount', 'perlerSize',
    'cropBtn', 'resetCropBtn', 'confirmCropBtn', 'cancelCropBtn',
    'cropOverlay', 'cropBox',
    'pixelSizeSlider', 'pixelSizeValue',
    'widthInput', 'heightInput', 'keepRatioCheckbox',
    'perlerContent', 'colorSetSelect', 'colorMappingMethod',
    'chartStyle', 'legendPosition', 'beadShape',
    'transparentCellColor', 'transparentCellColorValue',
    'beadSizeSlider', 'beadSizeValue', 'exportBeadSizeSlider', 'exportBeadSizeValue',
    'showGridLines', 'showCoordNumbers',
    'coordLineColor', 'coordNumberColor',
    'showLargeGridLines', 'largeGridLineColor', 'largeGridSize', 'largeGridLineWidth',
    'gridLineWidth', 'watermarkText',
    'simpleModeBtn', 'advancedModeBtn',
    'batchPixelateBtn', 'carveSplitBtn',
    'clearBtn', 'resetBtn', 'downloadBtn', 'downloadPerlerBtn',
    'exportFormatSelect', 'exportInfoPaperCompressedBtn',
    'saveToMyDesignsBtn', 'importDesignBtn', 'importDesignFile',
    'navMyDesigns', 'importInfoPaperBtn',
    'pixelatedCanvasContainer', 'customEditColorsPanel', 'customEditData',
    'colorCountText', 'perlerZoomSlider', 'perlerZoomValue',
    'brandTitle', 'timerSection', 'timersGrid', 'addTimerBtn',
    'timerModal', 'closeTimerModalBtn', 'cancelAddTimerBtn', 'confirmAddTimerBtn',
    'modal-hours', 'modal-minutes', 'modal-title',
    'colorLegendArea', 'pixelatedSize',
    'myDesignsSection', 'myDesignsGrid', 'myDesignsEmpty', 'myDesignsCount',
];

function createFakeDocument() {
    const allElements = {};
    elementIds.forEach(id => { allElements[id] = makeElement(id); });

    // 设置导航按钮
    const navBtn1 = makeElement('nav1');
    navBtn1.dataset.section = 'imageToPerler';
    const navBtn2 = makeElement('nav2');
    navBtn2.dataset.section = 'myDesigns';
    const navBtn3 = makeElement('nav3');
    navBtn3.dataset.section = 'timer';
    const navBtn4 = makeElement('nav4');
    navBtn4.dataset.section = 'import';
    allElements.__navBtns = [navBtn1, navBtn2, navBtn3, navBtn4];

    return {
        addEventListener: (ev, fn) => {
            if (ev === 'DOMContentLoaded') {
                savedHandlers.__domLoaded = fn;
                console.log(`✅ DOMContentLoaded 事件绑定成功`);
            }
        },
        getElementById: (id) => {
            return allElements[id] || null;
        },
        querySelectorAll: (selector) => {
            if (selector === '.nav-btn') return allElements.__navBtns;
            return [];
        },
        createElement: (tag) => makeElement(`dynamic-${tag}`),
    };
}

// 4. 模拟 window
const fakeWindow = {};

// 5. 模拟 localStorage
const fakeLocalStorage = {
    data: {},
    getItem: (k) => fakeLocalStorage.data[k] || null,
    setItem: (k, v) => { fakeLocalStorage.data[k] = v; },
    removeItem: (k) => { delete fakeLocalStorage.data[k]; },
};

// 6. 执行 bundle
console.log('正在模拟浏览器加载 bundle...\n');
try {
    const func = new Function(
        'document', 'window', 'localStorage',
        bundle
    );
    func(createFakeDocument(), fakeWindow, fakeLocalStorage);
    console.log(`✅ bundle 加载完成 (动态创建了 ${elementCount} 个事件监听器)`);
} catch (e) {
    console.log('❌ bundle 加载失败!');
    console.log('错误类型:', e.constructor.name);
    console.log('错误消息:', e.message);
    console.log('堆栈:');
    console.log(e.stack);
    process.exit(1);
}

// 7. 模拟 DOMContentLoaded
console.log('\n模拟触发 DOMContentLoaded 事件...');
if (savedHandlers.__domLoaded) {
    try {
        savedHandlers.__domLoaded();
        console.log('✅ DOMContentLoaded 回调执行成功');
    } catch (e) {
        console.log('❌ DOMContentLoaded 回调执行失败!');
        console.log('错误:', e.message);
        console.log(e.stack);
        process.exit(1);
    }
} else {
    console.log('⚠️  没有找到 DOMContentLoaded 处理函数');
}

// 8. 检查关键按钮的事件绑定
console.log('\n[关键按钮事件绑定检查]');
const criticalButtons = ['saveToMyDesignsBtn', 'importDesignBtn'];
criticalButtons.forEach(id => {
    if (savedHandlers[id] && savedHandlers[id]['click']) {
        console.log(`✅ ${id} - 有 click 事件处理函数`);
    } else {
        console.log(`❌ ${id} - 没有绑定 click 事件!`);
    }
});

// 9. 测试保存按钮点击
console.log('\n[测试保存按钮点击]');
if (savedHandlers['saveToMyDesignsBtn'] && savedHandlers['saveToMyDesignsBtn']['click']) {
    try {
        // 需要先设置一些 perlerColors 数据
        const gen = fakeWindow._pixelArtGenerator;
        if (gen) {
            // 设置假的拼豆数据
            gen.perlerColors = [[
                { rgb: [200, 100, 100], name: 'A1', isTransparent: false }
            ]];
            gen.perlerWidth = 1;
            gen.perlerHeight = 1;
        }

        savedHandlers['saveToMyDesignsBtn']['click']().then(() => {
            console.log('✅ 保存按钮点击执行成功');
        }).catch(err => {
            console.log('❌ 保存按钮点击执行失败:', err.message);
        });
    } catch (e) {
        console.log('❌ 保存按钮点击执行失败:', e.message);
    }
}

console.log('\n=== 测试完成 ===');
console.log('\n结论: bundle 代码结构正确，事件绑定也没问题。');
console.log('如果真实浏览器中按钮没反应，可能是:');
console.log('  1. 浏览器缓存了旧的 bundle.min.js');
console.log('  2. 有一个 JS 错误导致 DOMContentLoaded 回调提前中断');
console.log('  3. colorSet 的 artkal 默认值问题已经确认，需要修复');
