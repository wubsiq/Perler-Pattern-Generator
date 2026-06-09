const fs = require('fs');
const path = require('path');

const modulesPath = path.join(__dirname, 'modules');

console.log('开始修复模块文件...\n');

fs.readdirSync(modulesPath).forEach(file => {
    if (file.endsWith('.js')) {
        const filePath = path.join(modulesPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 替换 HTML 实体
        const original = content;
        content = content
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&nbsp;/g, ' ');
        
        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ 已修复: ${file}`);
        } else {
            console.log(`- 无需修复: ${file}`);
        }
    }
});

console.log('\n✅ 所有模块修复完成！');
