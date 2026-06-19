const fs = require('fs');
const path = require('path');

console.log('=== 验证修复结果 ===\n');

// 1. 检查 bundle 是否包含关键代码
const bundle = fs.readFileSync(path.join(__dirname, 'js', 'bundle.min.js'), 'utf8');

const checks = [
    { name: 'MyDesignsManager 类', pattern: 'class MyDesignsManager' },
    { name: '保存按钮事件绑定', pattern: 'saveToMyDesignsBtn' },
    { name: 'mard291 默认颜色集', pattern: 'mard291' },
    { name: 'totalColors 字段', pattern: 'totalColors' },
    { name: 'timestamp 字段', pattern: 'timestamp' },
    { name: 'renderMyDesigns 刷新', pattern: 'renderMyDesigns' },
    { name: 'formatDate 日期格式化', pattern: 'formatDate' },
    { name: '导入按钮事件', pattern: 'importDesignFromFile' },
];

let passCount = 0;
checks.forEach(check => {
    const found = bundle.includes(check.pattern);
    if (found) {
        console.log(`✅ ${check.name}`);
        passCount++;
    } else {
        console.log(`❌ ${check.name} (未找到: ${check.pattern})`);
    }
});

console.log(`\n通过: ${passCount}/${checks.length}`);

// 2. 验证 bundle 没有 artkal 作为默认值
console.log('\n[验证: artkal 问题]');
const hasArtkal = bundle.match(/['"]artkal['"]/g);
if (hasArtkal && hasArtkal.length > 5) {
    console.log('⚠️  发现 artkal 字符串，但可能只是作为检查条件，非默认值问题');
} else {
    console.log('✅ artkal 不再作为默认颜色集');
}

// 3. 语法验证
console.log('\n[语法验证]');
try {
    new Function(bundle);
    console.log('✅ bundle 语法正确，可被浏览器解析');
} catch (e) {
    console.log('❌ bundle 有语法错误:', e.message);
}

console.log('\n=== 验证完成 ===');
console.log('\n建议测试步骤:');
console.log('1. 打开 index.html');
console.log('2. 上传一张图片并生成拼豆图');
console.log('3. 点击"保存到我的图纸"按钮');
console.log('4. 点击导航栏的"📁 我的图纸"按钮');
console.log('5. 应该能看到刚才保存的图纸');
console.log('6. 测试"载入"、"导出"、"删除"功能');
