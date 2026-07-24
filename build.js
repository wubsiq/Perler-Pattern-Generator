const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const esbuild = require('esbuild');

const projectRoot = __dirname;

console.log('========== 豆师傅网站构建脚本 ==========\n');

console.log('[0/3] 清理旧的构建文件');
const cleanupDirs = ['js', 'css'];
cleanupDirs.forEach(dir => {
    const dirPath = path.join(projectRoot, dir);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        const oldBundles = files.filter(f => f.match(/^(bundle|style)\..*\.min\.(js|css)$/));
        oldBundles.forEach(file => {
            fs.unlinkSync(path.join(dirPath, file));
            console.log(`  删除: ${dir}/${file}`);
        });
        if (oldBundles.length > 0) {
            console.log(`  共清理 ${oldBundles.length} 个旧文件`);
        } else {
            console.log(`  无旧文件需要清理`);
        }
    }
});
console.log('');

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
    'modules/MyDesignsManager.js',
    'modules/CustomEditor.js',
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

const jsHash = crypto.createHash('md5').update(combined).digest('hex').substring(0, 8);
const jsOutputName = `bundle.${jsHash}.min.js`;
const jsOutputPath = path.join(projectRoot, 'js', jsOutputName);

esbuild.buildSync({
    stdin: {
        contents: combined,
        loader: 'js',
        resolveDir: projectRoot,
    },
    outfile: jsOutputPath,
    minify: true,
    target: ['es2018'],
    charset: 'utf8',
    logLevel: 'error',
});

const jsOutputSize = fs.statSync(jsOutputPath).size;
const jsRatio = ((jsOutputSize / totalInputSize) * 100).toFixed(1);
console.log(`  输出文件: js/${jsOutputName} (${(jsOutputSize / 1024).toFixed(1)} KB)`);
console.log(`  压缩比: ${jsRatio}% (节省 ${(100 - parseFloat(jsRatio)).toFixed(1)}%)`);
console.log(`  HTTP 请求数: ${jsFiles.length} → 1\n`);

console.log('[2/2] 构建 CSS bundle');
const cssFiles = ['css/style.css', 'css/style-new.css'];
let totalCssSize = 0;
let cssCombined = '';
for (const file of cssFiles) {
    const fullPath = path.join(projectRoot, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    totalCssSize += content.length;
    cssCombined += content + '\n';
}
console.log(`  输入文件: ${cssFiles.length} 个 (${(totalCssSize / 1024).toFixed(1)} KB)`);

const cssHash = crypto.createHash('md5').update(cssCombined).digest('hex').substring(0, 8);
const cssOutputName = `style.${cssHash}.min.css`;
const cssOutputPath = path.join(projectRoot, 'css', cssOutputName);

fs.writeFileSync(path.join(projectRoot, 'css', '_combined.css'), cssCombined, 'utf8');
esbuild.buildSync({
    entryPoints: [path.join(projectRoot, 'css', '_combined.css')],
    outfile: cssOutputPath,
    minify: true,
    charset: 'utf8',
    logLevel: 'error',
});
fs.unlinkSync(path.join(projectRoot, 'css', '_combined.css'));

const cssOutputSize = fs.statSync(cssOutputPath).size;
const cssRatio = ((cssOutputSize / totalCssSize) * 100).toFixed(1);
console.log(`  输出文件: css/${cssOutputName} (${(cssOutputSize / 1024).toFixed(1)} KB)`);
console.log(`  压缩比: ${cssRatio}% (节省 ${(100 - parseFloat(cssRatio)).toFixed(1)}%)\n`);

const totalInput = (totalInputSize + totalCssSize) / 1024;
const totalOutput = (jsOutputSize + cssOutputSize) / 1024;
const totalRatio = ((totalOutput / totalInput) * 100).toFixed(1);

console.log('[3/3] 更新 HTML 文件引用');
const htmlFiles = ['index.html', 'circular.html', 'workbench.html'];
for (const htmlFile of htmlFiles) {
    const htmlPath = path.join(projectRoot, htmlFile);
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    htmlContent = htmlContent.replace(
        /css\/style\.[a-f0-9]{8}\.min\.css/g,
        `css/${cssOutputName}`
    );
    htmlContent = htmlContent.replace(
        /css\/style\.min\.css/g,
        `css/${cssOutputName}`
    );
    
    htmlContent = htmlContent.replace(
        /js\/bundle\.[a-f0-9]{8}\.min\.js/g,
        `js/${jsOutputName}`
    );
    htmlContent = htmlContent.replace(
        /js\/bundle\.min\.js/g,
        `js/${jsOutputName}`
    );
    
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log(`    + ${htmlFile}`);
}

console.log('\n========== 构建完成 ==========');
console.log(`总原始大小: ${totalInput.toFixed(1)} KB`);
console.log(`总压缩后大小: ${totalOutput.toFixed(1)} KB`);
console.log(`总压缩比: ${totalRatio}% (节省 ${(100 - parseFloat(totalRatio)).toFixed(1)}%)`);
console.log(`HTTP 请求数: ${jsFiles.length + cssFiles.length} → 2`);
console.log('===============================');
