const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const projectRoot = __dirname;

console.log('========== 豆师傅网站构建脚本 ==========\n');

const jsFiles = [
    'js/colors.js',
    'js/colorUtils.js',
    'js/i18n.js',
    'modules/Pixelator.js',
    'modules/ColorManager.js',
    'modules/PerlerGenerator.js',
    'modules/DownloadManager.js',
    'modules/InfoPaperConverter.js',
    'modules/InfoPaperCompressor.js',
    'modules/InfoPaperManager.js',
    'modules/FocusModeRenderer.js',
    'js/app.js'
];

console.log('[1/2] 构建 JS bundle');
console.log(`  输入文件: ${jsFiles.length} 个`);

let totalInputSize = 0;
let combined = '';
for (const file of jsFiles) {
    const fullPath = path.join(projectRoot, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    totalInputSize += content.length;
    console.log(`    + ${file} (${(content.length / 1024).toFixed(1)} KB)`);
    combined += content + '\n';
}

console.log(`  原始大小: ${(totalInputSize / 1024).toFixed(1)} KB`);

const outputPath = path.join(projectRoot, 'js', 'bundle.min.js');
esbuild.buildSync({
    stdin: {
        contents: combined,
        loader: 'js',
        resolveDir: projectRoot,
    },
    outfile: outputPath,
    minify: true,
    target: ['es2018'],
    charset: 'utf8',
    logLevel: 'error',
});

const outputSize = fs.statSync(outputPath).size;
const ratio = ((outputSize / totalInputSize) * 100).toFixed(1);
console.log(`  输出文件: js/bundle.min.js (${(outputSize / 1024).toFixed(1)} KB)`);
console.log(`  压缩比: ${ratio}% (节省 ${(100 - parseFloat(ratio)).toFixed(1)}%)`);
console.log(`  HTTP 请求数: ${jsFiles.length} → 1\n`);

console.log('[2/2] 构建 CSS bundle');
const cssInputSize = fs.statSync(path.join(projectRoot, 'css', 'style.css')).size;
console.log(`  输入文件: css/style.css (${(cssInputSize / 1024).toFixed(1)} KB)`);

esbuild.buildSync({
    entryPoints: [path.join(projectRoot, 'css', 'style.css')],
    outfile: path.join(projectRoot, 'css', 'style.min.css'),
    minify: true,
    charset: 'utf8',
    logLevel: 'error',
});

const cssOutputSize = fs.statSync(path.join(projectRoot, 'css', 'style.min.css')).size;
const cssRatio = ((cssOutputSize / cssInputSize) * 100).toFixed(1);
console.log(`  输出文件: css/style.min.css (${(cssOutputSize / 1024).toFixed(1)} KB)`);
console.log(`  压缩比: ${cssRatio}% (节省 ${(100 - parseFloat(cssRatio)).toFixed(1)}%)\n`);

const totalInput = (totalInputSize + cssInputSize) / 1024;
const totalOutput = (outputSize + cssOutputSize) / 1024;
const totalRatio = ((totalOutput / totalInput) * 100).toFixed(1);

console.log('========== 构建完成 ==========');
console.log(`总原始大小: ${totalInput.toFixed(1)} KB`);
console.log(`总压缩后大小: ${totalOutput.toFixed(1)} KB`);
console.log(`总压缩比: ${totalRatio}% (节省 ${(100 - parseFloat(totalRatio)).toFixed(1)}%)`);
console.log(`HTTP 请求数: ${jsFiles.length + 1} → 2`);
console.log('===============================');
