const fs = require('fs');
const path = require('path');

const root = __dirname;

console.log('========== Bundle 内容验证 ==========\n');

// 检查 bundle.min.js 是否包含关键字
const bundlePath = path.join(root, 'js', 'bundle.min.js');
const bundle = fs.readFileSync(bundlePath, 'utf8');

const checks = [
    ['MyDesignsManager', 'MyDesignsManager 类'],
    ['myDesignsSection', 'myDesignsSection 元素引用'],
    ['saveToMyDesignsBtn', 'saveToMyDesignsBtn 按钮引用'],
    ['importDesignBtn', 'importDesignBtn 按钮引用'],
    ['myDesignsGrid', 'myDesignsGrid 网格引用'],
    ['data-section.*myDesigns', 'myDesigns 导航切换逻辑'],
    ['navMyDesigns', '我的图纸导航翻译'],
    ['alertSaveSuccess', '保存成功提示'],
    ['loadDesign', '载入图纸翻译'],
    ['deleteDesign', '删除图纸翻译'],
    ['perler_my_designs_v1', '图纸存储 key'],
];

console.log('[1/3] 检查 bundle.min.js 关键字：');
checks.forEach(([pattern, desc]) => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*?'));
    const found = regex.test(bundle);
    const icon = found ? '✅' : '❌';
    console.log(`  ${icon} ${desc} -> ${found ? '找到' : '缺失!'}`);
});

console.log('\n[2/3] 检查 style.min.css 是否包含我的图纸样式：');
const cssPath = path.join(root, 'css', 'style.min.css');
const css = fs.readFileSync(cssPath, 'utf8');
const cssChecks = [
    ['my-designs-section', '我的图纸 section 样式'],
    ['my-design-card', '图纸卡片样式'],
    ['my-design-thumb', '缩略图样式'],
    ['my-design-actions', '操作按钮样式'],
    ['btn-danger', '危险按钮样式'],
];
cssChecks.forEach(([pattern, desc]) => {
    const found = css.includes(pattern);
    const icon = found ? '✅' : '❌';
    console.log(`  ${icon} ${desc} -> ${found ? '找到' : '缺失!'}`);
});

console.log('\n[3/3] 检查 index.html 元素 ID：');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const htmlChecks = [
    ['id="saveToMyDesignsBtn"', 'saveToMyDesignsBtn 按钮'],
    ['id="myDesignsSection"', 'myDesignsSection section'],
    ['id="myDesignsGrid"', 'myDesignsGrid 网格'],
    ['id="myDesignsEmpty"', 'myDesignsEmpty 空状态'],
    ['id="importDesignBtn"', 'importDesignBtn 导入按钮'],
    ['id="importDesignFile"', 'importDesignFile 文件输入'],
    ['data-section="myDesigns"', '我的图纸导航按钮'],
];
htmlChecks.forEach(([pattern, desc]) => {
    const found = html.includes(pattern);
    const icon = found ? '✅' : '❌';
    console.log(`  ${icon} ${desc} -> ${found ? '找到' : '缺失!'}`);
});

// 模拟 HTML 解析，确认 ID 唯一
console.log('\n[4/3] 检查元素 ID 唯一性：');
const idPattern = /id="([^"]+)"/g;
let match;
const ids = {};
while ((match = idPattern.exec(html)) !== null) {
    ids[match[1]] = (ids[match[1]] || 0) + 1;
}
const duplicates = Object.entries(ids).filter(([, count]) => count > 1);
if (duplicates.length === 0) {
    console.log('  ✅ 所有 ID 唯一');
} else {
    console.log('  ❌ 重复 ID:');
    duplicates.forEach(([id, count]) => {
        console.log(`     - ${id}: ${count} 次`);
    });
}

console.log('\n========== 验证完成 ==========');
console.log('如果上面所有项都是 ✅，代码是正确的。');
console.log('如果有 ❌，可能是构建没有包含所有修改，或 HTML 有误。');
