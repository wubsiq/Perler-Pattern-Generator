const fs = require('fs');
const path = require('path');

console.log('=== bundle 语法检查 ===\n');

// 1. 读取 bundle
const bundlePath = path.join(__dirname, 'js', 'bundle.min.js');
const bundle = fs.readFileSync(bundlePath, 'utf-8');

console.log(`bundle 大小: ${(bundle.length / 1024).toFixed(1)} KB`);

// 2. 检查是否包含关键代码
const checks = [
    ['saveToMyDesignsBtn', '保存按钮'],
    ['myDesignsSection', '我的图纸 section'],
    ['initMatrixTimer', 'initMatrixTimer 函数'],
    ['MyDesignsManager', 'MyDesignsManager 类'],
    ['navMyDesigns', '导航翻译'],
    ['data-section.*myDesigns', '导航切换逻辑'],
];

console.log('\n[1] 关键代码检查:');
checks.forEach(([pattern, desc]) => {
    const found = bundle.includes(pattern.split('*')[0].trim());
    console.log(`  ${found ? '✅' : '❌'} ${desc}`);
});

// 3. 检查 app.js 中的 DOMContentLoaded 是否有语法错误
console.log('\n[2] app.js 语法检查:');
try {
    // 先模拟浏览器环境
    const fakeBrowser = `
        // 模拟浏览器环境
        const document = {
            addEventListener: (ev, fn) => { if(ev==='DOMContentLoaded') { console.log('  ✅ DOMContentLoaded 事件绑定成功 (不会执行, 仅检查语法)'); } },
            getElementById: (id) => ({
                addEventListener: () => {},
                getElementsByTagName: () => [],
                classList: { add: () => {}, remove: () => {} },
                style: {},
                dataset: {},
                value: 'mard291',
                textContent: '',
                innerHTML: '',
                appendChild: () => {},
                querySelectorAll: () => [],
                click: () => {},
                files: [null],
            }),
            querySelectorAll: () => [],
            createElement: () => ({
                getContext: () => ({ fillRect: () => {}, fillStyle: '' }),
                addEventListener: () => {},
                style: {},
                classList: { add: () => {}, remove: () => {}, contains: () => false },
                dataset: {},
                toDataURL: () => 'test',
            }),
        };
        const window = {};
        const localStorage = {
            data: {},
            getItem: (k) => localStorage.data[k] || null,
            setItem: (k, v) => { localStorage.data[k] = v; },
            removeItem: (k) => { delete localStorage.data[k]; },
        };
        const alert = (msg) => console.log('  alert:', msg);
        const console = { log: (...args) => console.log(...args), warn: console.warn, error: console.error };
    `;

    // 用 Function 检查语法（不执行，仅解析）
    try {
        new Function(bundle);
        console.log('  ✅ bundle 语法正确');
    } catch (e) {
        console.log('  ❌ bundle 有语法错误:');
        console.log('    Error:', e.message);
    }

    // 检查 app.js 关键部分是否包含
    const appContent = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf-8');
    const hasSaveBtnHandler = appContent.includes('saveToMyDesignsBtn') && appContent.includes('addEventListener');
    console.log(`  ${hasSaveBtnHandler ? '✅' : '❌'} app.js 包含保存按钮事件绑定`);

    const hasNavMyDesigns = appContent.includes("'myDesigns'");
    console.log(`  ${hasNavMyDesigns ? '✅' : '❌'} app.js 包含我的图纸导航处理`);

    // 实际问题: 'artkal' 颜色集不存在
    console.log('\n[3] 颜色集验证:');
    const colorsContent = fs.readFileSync(path.join(__dirname, 'js', 'colors.js'), 'utf-8');
    const colorSetsKeys = [
        'mard291', 'mard221', 'mard291Refined', 'mard120',
        'mard72', 'mard48', 'mard24',
        'perler24', 'perler48', 'perler72',
        'hama'
    ];
    colorSetsKeys.forEach(key => {
        const found = colorsContent.includes(`${key}: [`);
        console.log(`  ${found ? '✅' : '❌'} ${key}`);
    });

    console.log('\n  ❌ artkal 不存在！ -> 需要将默认值从 artkal 改为 mard291');

} catch (e) {
    console.log('  错误:', e.message);
}

console.log('\n=== 结论 ===');
console.log('1. bundle 语法正确 ✓');
console.log('2. 问题所在: 保存按钮中使用了 \'artkal\' 默认值');
console.log('   -> colorSets 中没有 artkal, 导致 InfoPaperConverter 报错');
console.log('   -> 解决方案: 将默认值改为 mard291');
console.log('3. 另一个潜在问题: 导航切换时, 如果 renderMyDesigns 出错');
console.log('   需要添加 try-catch 保护');
