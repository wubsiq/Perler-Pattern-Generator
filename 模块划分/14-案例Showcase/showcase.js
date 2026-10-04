/**
 * ==============================================================
 * 模块域: 14-案例Showcase
 * 原文件: js/app.js
 * 行号范围: 7750 - 8432 (共 683 行)
 * 截取方式: 直接复制，未修改（用于模块化规划参考）
 * 
 * 本文件为【代码快照】，原始代码仍在 js/app.js 中。
 * 未来真正重构时需：从 App 类中提取方法，处理 this 依赖。
 * ==============================================================
 */

    initShowcase() {
        if (!this.showcaseGrid || !this.showcaseSection) return;

        this.showcaseLoaded = false;
        this.showcaseSkeleton = this.createShowcaseSkeleton(6);
        this.showcaseGrid.appendChild(this.showcaseSkeleton);
        this.loadAndRenderShowcase();
    }

    createShowcaseSkeleton(count) {
        const container = document.createElement('div');
        container.style.cssText = 'display: contents;';

        const skeletonCount = count || 6;
        for (let i = 0; i < skeletonCount; i++) {
            const card = document.createElement('div');
            card.className = 'showcase-card showcase-skeleton-card';

            const preview = document.createElement('div');
            preview.className = 'showcase-preview showcase-skeleton-preview';

            const name = document.createElement('div');
            name.className = 'showcase-name showcase-skeleton-info';
            name.style.height = '20px';
            name.style.lineHeight = '20px';
            name.style.width = '60%';
            name.style.margin = '4px auto 4px';
            name.style.borderRadius = '4px';

            const info = document.createElement('div');
            info.className = 'showcase-info showcase-skeleton-info';
            info.style.height = '18px';
            info.style.lineHeight = '18px';
            info.style.width = '70%';
            info.style.margin = '0 auto';
            info.style.borderRadius = '4px';

            card.appendChild(preview);
            card.appendChild(name);
            card.appendChild(info);
            container.appendChild(card);
        }

        return container;
    }

    async loadAndRenderShowcase() {
        try {
            this.allPackedItems = await this.loadSamplePatternsRaw();
            this.currentShowcasePage = 0;
            this.showcasePageSize = 10;
            if (this.showcaseSkeleton) this.showcaseSkeleton.remove();
            await this.renderShowcasePage();
            this.setupShowcaseScrollListener();
        } catch (err) {
            console.warn('加载示例图纸失败:', err);
            if (this.showcaseSkeleton) this.showcaseSkeleton.remove();
            this.showcaseError();
        }
    }

    async renderShowcasePage() {
        const start = this.currentShowcasePage * this.showcasePageSize;
        const end = start + this.showcasePageSize;
        const items = this.allPackedItems.slice(start, end);

        if (items.length === 0) {
            this.removeShowcaseScrollListener();
            return;
        }

        const cards = await this.createSampleCards(items);
        cards.forEach((card) => this.showcaseGrid.appendChild(card));
        this.currentShowcasePage++;

        if (end >= this.allPackedItems.length) {
            this.removeShowcaseScrollListener();
        }
    }

    async createSampleCards(items) {
        const cards = [];
        for (const item of items) {
            if (!item.packedData) continue;
            try {
                const infoPaper = await this.infoPaperManager.compressor.unpack(item.packedData);
                const sample = this.infoPaperManager.converter.fromInfoPaper(infoPaper);
                if (sample) {
                    const card = this.createSampleCard(sample);
                    cards.push(card);
                }
            } catch (e) {
                console.warn('解码示例图纸失败:', e);
            }
        }
        return cards;
    }

    setupShowcaseScrollListener() {
        this.showcaseScrollHandler = () => {
            const showcase = this.showcaseSection;
            if (!showcase) return;

            const rect = showcase.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            if (rect.bottom <= windowHeight + 200) {
                this.renderShowcasePage();
            }
        };

        window.addEventListener('scroll', this.showcaseScrollHandler, { passive: true });
    }

    removeShowcaseScrollListener() {
        if (this.showcaseScrollHandler) {
            window.removeEventListener('scroll', this.showcaseScrollHandler);
            this.showcaseScrollHandler = null;
        }
    }

    createSampleCard(sample) {
        const card = document.createElement('div');
        card.className = 'showcase-card';

        const preview = document.createElement('div');
        preview.className = 'showcase-preview';

        const canvas = document.createElement('canvas');
        this.renderPreviewCanvas(canvas, sample.perlerColors, sample.width, sample.height);
        preview.appendChild(canvas);

        const info = document.createElement('div');
        info.className = 'showcase-info';
        const colorCount = Object.keys(sample.colorCounts).length;
        info.textContent = `${sample.width} × ${sample.height} · ${colorCount} ${getI18nText('colorCountText')}`;

        card.appendChild(preview);
        card.appendChild(info);

        card.addEventListener('click', () => {
            this.launchSampleFocusMode(sample.perlerColors, sample.width, sample.height, sample.colorSet);
        });

        return card;
    }

    async loadSamplePatternsRaw() {
        const url = new URL(`sample-patterns.json?v=${this.APP_VERSION}`, location.href).href;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }

    showcaseError() {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 20px;';

        const msg = document.createElement('div');
        msg.style.cssText = 'color: #d9534f; margin-bottom: 12px; font-size: 14px;';
        msg.textContent = getI18nText('sampleLoadFailed');

        const retryBtn = document.createElement('button');
        retryBtn.className = 'btn';
        retryBtn.textContent = getI18nText('reloadSample');
        retryBtn.style.cssText = 'background: #667eea; color: #fff; border-color: #667eea; padding: 8px 20px; cursor: pointer;';
        retryBtn.addEventListener('click', () => {
            wrapper.remove();
            this.showcaseLoaded = false;
            this.initShowcase();
        });

        wrapper.appendChild(msg);
        wrapper.appendChild(retryBtn);
        this.showcaseGrid.appendChild(wrapper);
    }

    renderPreviewCanvas(canvas, perlerColors, width, height) {
        const cellSize = Math.max(4, Math.min(16, Math.floor(160 / Math.max(width, height))));
        canvas.width = width * cellSize;
        canvas.height = height * cellSize;
        const ctx = canvas.getContext('2d');

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const color = perlerColors[y][x];
                if (color.isTransparent) continue;
                ctx.fillStyle = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    launchSampleFocusMode(perlerColors, width, height, colorSet) {
        this.hideShowcase();
        const container = document.createElement('div');
        container.id = 'focus-mode-container';
        document.body.appendChild(container);

        this.focusModeRenderer.init(
            '#focus-mode-container',
            perlerColors,
            width,
            height,
            colorSet,
            () => {
                this.showShowcase();
                document.body.removeChild(container);
            }
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window._pixelArtGenerator = new PixelArtGenerator();
    initMatrixTimer();
});

function initMatrixTimer() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const uploadSection = document.getElementById('uploadSection');
    const workspace = document.getElementById('workspace');
    const showcaseSection = document.getElementById('showcaseSection');
    const timerSection = document.getElementById('timerSection');
    const myDesignsSection = document.getElementById('myDesignsSection');
    const addTimerBtn = document.getElementById('addTimerBtn');
    const timersGrid = document.getElementById('timersGrid');
    const brandTitle = document.getElementById('brandTitle');

    let myDesignsManager = new MyDesignsManager();
    let timerCount = 0;

    // 我的图纸 - 保存按钮
    const saveToMyDesignsBtn = document.getElementById('saveToMyDesignsBtn');
    if (saveToMyDesignsBtn) {
        const originalText = saveToMyDesignsBtn.innerHTML;
        saveToMyDesignsBtn.addEventListener('click', async () => {
            const gen = window._pixelArtGenerator;
            if (!gen || !gen.perlerColors || !gen.perlerColors.length) {
                alert(getI18nText('alertNoPerlerRendered'));
                return;
            }
            if (!myDesignsManager) myDesignsManager = new MyDesignsManager();
            
            // 显示 loading 状态
            saveToMyDesignsBtn.disabled = true;
            saveToMyDesignsBtn.innerHTML = '⏳ 保存中...';
            
            try {
                let colorSet = gen.colorSetSelect ? gen.colorSetSelect.value : 'mard291';
                if (!colorSets[colorSet]) {
                    colorSet = 'mard291';
                }
                await myDesignsManager.saveDesign(gen.perlerColors, gen.perlerWidth, gen.perlerHeight, colorSet);
                
                // 显示成功状态
                saveToMyDesignsBtn.innerHTML = '✅ 保存成功！';
                setTimeout(() => {
                    const goToMyDesigns = confirm(
                        `${getI18nText('alertSaveSuccess')}\n\n是否立即前往"我的图纸"查看？`
                    );
                    if (goToMyDesigns) {
                        const myDesignsNavBtn = Array.from(navBtns).find(b => b.dataset.section === 'myDesigns');
                        if (myDesignsNavBtn) myDesignsNavBtn.click();
                    }
                }, 300);
            } catch (err) {
                alert(err.message);
            } finally {
                // 恢复按钮状态
                setTimeout(() => {
                    saveToMyDesignsBtn.disabled = false;
                    saveToMyDesignsBtn.innerHTML = originalText;
                }, 1500);
            }
        });
    }

    // 我的图纸 - 导入按钮
    const importDesignBtn = document.getElementById('importDesignBtn');
    const importDesignFile = document.getElementById('importDesignFile');
    if (importDesignBtn && importDesignFile) {
        const originalImportText = importDesignBtn.innerHTML;
        importDesignBtn.addEventListener('click', () => importDesignFile.click());
        importDesignFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!myDesignsManager) myDesignsManager = new MyDesignsManager();
            
            importDesignBtn.disabled = true;
            importDesignBtn.innerHTML = '⏳ 导入中...';
            
            try {
                await myDesignsManager.importDesignFromFile(file);
                importDesignBtn.innerHTML = '✅ 导入成功';
                renderMyDesigns();
                alert(getI18nText('alertImportSuccess'));
                setTimeout(() => {
                    importDesignBtn.innerHTML = originalImportText;
                    importDesignBtn.disabled = false;
                }, 1200);
            } catch (err) {
                importDesignBtn.innerHTML = originalImportText;
                importDesignBtn.disabled = false;
                alert(err.message);
            }
            importDesignFile.value = '';
        });
    }

    function formatDate(ts) {
        const d = new Date(ts);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    function renderMyDesigns() {
        if (!myDesignsManager) myDesignsManager = new MyDesignsManager();
        const grid = document.getElementById('myDesignsGrid');
        const empty = document.getElementById('myDesignsEmpty');
        const count = document.getElementById('myDesignsCount');
        if (!grid || !empty || !count) return;

        const designs = myDesignsManager.getAllDesigns();
        count.textContent = `(${designs.length}/${myDesignsManager.maxDesigns})`;

        if (designs.length === 0) {
            grid.innerHTML = '';
            grid.appendChild(empty);
            empty.style.display = 'block';
            return;
        }

        grid.innerHTML = '';
        for (const design of designs) {
            const card = document.createElement('div');
            card.className = 'my-design-card';
            card.dataset.id = design.id;

            const thumbHtml = design.thumbnail
                ? `<img src="${design.thumbnail}" class="my-design-thumb" alt="">`
                : `<div class="my-design-thumb-placeholder">🎨</div>`;

            card.innerHTML = `
                ${thumbHtml}
                <div class="my-design-info">
                    <div class="my-design-size">${design.width} × ${design.height}</div>
                    <div class="my-design-meta">${design.totalColors} ${getI18nText('colors')} · ${formatDate(design.timestamp)}</div>
                </div>
                <div class="my-design-actions">
                    <button class="btn btn-primary my-design-load" data-id="${design.id}" data-i18n="loadDesign">载入</button>
                    <button class="btn btn-secondary my-design-copy" data-id="${design.id}" data-i18n="copyDesign">复制</button>
                    <button class="btn btn-secondary my-design-export" data-id="${design.id}" data-i18n="exportDesign">导出</button>
                    <button class="btn btn-danger my-design-delete" data-id="${design.id}" data-i18n="deleteDesign">删除</button>
                </div>
            `;
            grid.appendChild(card);
        }

        grid.querySelectorAll('.my-design-load').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const originalText = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = '⏳ 载入中...';
                
                try {
                    const result = await myDesignsManager.loadDesign(id);
                    const generator = window._pixelArtGenerator;
                    if (generator) {
                        generator.perlerColors = result.perlerColors;
                        generator.perlerWidth = result.width;
                        generator.perlerHeight = result.height;
                        generator.colorCounts = result.colorCounts;
                        if (generator.colorSetSelect) {
                            if (colorSets[result.colorSet]) {
                                generator.colorSetSelect.value = result.colorSet;
                            } else {
                                console.warn(`颜色集 ${result.colorSet} 不存在，使用 mard291`);
                                generator.colorSetSelect.value = 'mard291';
                            }
                        }
                        
                        // 先切换到工作区，再渲染
                        if (generator.workspace) generator.workspace.style.display = 'block';
                        if (generator.uploadSection) generator.uploadSection.style.display = 'none';
                        if (generator.showcaseSection) generator.showcaseSection.style.display = 'none';
                        if (myDesignsSection) myDesignsSection.style.display = 'none';
                        
                        navBtns.forEach(b => b.classList.remove('active'));
                        const homeBtn = Array.from(navBtns).find(b => b.dataset.section === 'imageToPerler');
                        if (homeBtn) homeBtn.classList.add('active');
                        
                        // 更新摘要信息
                        generator.updatePerlerSummary(result.width, result.height, result.colorSet || 'mard291');
                        
                        // 最后渲染图表
                        setTimeout(() => {
                            generator.drawPerlerChart(result.perlerColors, result.width, result.height, result.colorSet || 'mard291');
                        }, 50);
                    }
                    btn.innerHTML = '✅ 载入成功';
                    alert(getI18nText('alertLoadSuccess'));
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }, 1000);
                } catch (err) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    alert(getI18nText('alertLoadFailed') + ': ' + err.message);
                }
            });
        });

        grid.querySelectorAll('.my-design-export').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const originalText = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = '⏳ 导出中...';
                
                try {
                    const json = await myDesignsManager.exportDesignToJSON(id);
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `perler-design-${id}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    btn.innerHTML = '✅ 已导出';
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }, 1000);
                    alert(getI18nText('alertExportSuccess'));
                } catch (err) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    alert(err.message);
                }
            });
        });

        grid.querySelectorAll('.my-design-copy').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const originalText = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = '⏳ 复制中...';
                
                try {
                    await myDesignsManager.copyCompressedDataToClipboard(id);
                    btn.innerHTML = '✅ 已复制';
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }, 1500);
                } catch (err) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    alert(getI18nText('alertCopyFailed') + ': ' + err.message);
                }
            });
        });

        grid.querySelectorAll('.my-design-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                if (!confirm(getI18nText('confirmDeleteDesign'))) return;
                const originalText = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = '🗑️';
                try {
                    myDesignsManager.deleteDesign(id);
                    renderMyDesigns();
                } catch (err) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    alert(err.message);
                }
            });
        });
    }

    function goToHomePage() {
        navBtns.forEach(b => b.classList.remove('active'));
        const homeBtn = Array.from(navBtns).find(b => b.dataset.section === 'imageToPerler');
        if (homeBtn) homeBtn.classList.add('active');
        uploadSection.style.display = 'block';
        if (showcaseSection) showcaseSection.style.display = 'none';
        if (workspace) workspace.style.display = 'none';
        if (timerSection) timerSection.style.display = 'none';
        if (myDesignsSection) myDesignsSection.style.display = 'none';
    }

    // 导航切换
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.dataset.section === 'imageToPerler') {
                uploadSection.style.display = 'block';
                if (showcaseSection) showcaseSection.style.display = 'none';
                if (workspace) workspace.style.display = 'none';
                if (timerSection) timerSection.style.display = 'none';
                if (myDesignsSection) myDesignsSection.style.display = 'none';
            } else if (btn.dataset.section === 'circular') {
                window.location.href = 'circular.html';
            } else if (btn.dataset.section === 'myDesigns') {
                uploadSection.style.display = 'none';
                if (showcaseSection) showcaseSection.style.display = 'none';
                workspace.style.display = 'none';
                timerSection.style.display = 'none';
                if (myDesignsSection) {
                    myDesignsSection.style.display = 'block';
                    renderMyDesigns();
                }
            } else if (btn.dataset.section === 'timer') {
                uploadSection.style.display = 'none';
                if (showcaseSection) showcaseSection.style.display = 'none';
                workspace.style.display = 'none';
                timerSection.style.display = 'block';
                if (myDesignsSection) myDesignsSection.style.display = 'none';
            } else if (btn.dataset.section === 'workbench') {
                window.location.href = 'workbench.html';
            }
        });
    });

    if (brandTitle) {
        brandTitle.style.cursor = 'pointer';
        brandTitle.addEventListener('click', goToHomePage);
    }
    
    // 添加计时器
    addTimerBtn.addEventListener('click', () => {
        const modal = document.getElementById('timerModal');
        modal.style.display = 'flex';
        
        // 重置表单
        document.getElementById('modal-hours').value = '0';
        document.getElementById('modal-minutes').value = '0';
        document.getElementById('modal-title').value = '';
    });
    
    // 关闭弹窗
    document.getElementById('closeTimerModalBtn').addEventListener('click', () => {
        document.getElementById('timerModal').style.display = 'none';
    });
    
    // 取消添加
    document.getElementById('cancelAddTimerBtn').addEventListener('click', () => {
        document.getElementById('timerModal').style.display = 'none';
    });
    
    // 确认添加计时器
    document.getElementById('confirmAddTimerBtn').addEventListener('click', () => {
        const hours = parseInt(document.getElementById('modal-hours').value) || 0;
        const minutes = parseInt(document.getElementById('modal-minutes').value) || 1;
        const title = document.getElementById('modal-title').value || `${getI18nText('timerTitlePlaceholder')} ${timerCount + 1}`;
        
        if (hours <= 0 && minutes <= 0) {
            alert(getI18nText('alertTimerNotSet'));
            return;
        }
        
        timerCount++;
        const timerId = `timer-${timerCount}`;
        const timerCard = document.createElement('div');
        timerCard.className = 'timer-card';
        timerCard.innerHTML = `
            <div class="timer-title">${title}</div>
            <div class="timer-display" id="${timerId}-display">${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00</div>
            <div class="timer-controls">
                <button class="timer-btn" id="${timerId}-start">开始</button>
                <button class="timer-btn" id="${timerId}-pause">暂停</button>
                <button class="timer-btn" id="${timerId}-reset">重置</button>
                <button class="timer-btn btn-danger" id="${timerId}-delete">删除</button>
            </div>
        `;
        timersGrid.appendChild(timerCard);
        
        initTimer(timerId, hours, minutes, 0);
        
        document.getElementById('timerModal').style.display = 'none';
    });
    
    // 初始化第一个计时器
    timerCount++;
    const timerId = `timer-${timerCount}`;
    const timerCard = document.createElement('div');
    timerCard.className = 'timer-card';
    timerCard.innerHTML = `
        <div class="timer-title">计时器 1</div>
        <div class="timer-display" id="${timerId}-display">00:00:00</div>
        <div class="timer-controls">
            <button class="timer-btn" id="${timerId}-start">开始</button>
            <button class="timer-btn" id="${timerId}-pause">暂停</button>
            <button class="timer-btn" id="${timerId}-reset">重置</button>
            <button class="timer-btn btn-danger" id="${timerId}-delete">删除</button>
        </div>
    `;
    timersGrid.appendChild(timerCard);
    initTimer(timerId, 0, 0, 0);
}

function initTimer(timerId, initialHours, initialMinutes, initialSeconds) {
    const display = document.getElementById(`${timerId}-display`);
    const startBtn = document.getElementById(`${timerId}-start`);
    const pauseBtn = document.getElementById(`${timerId}-pause`);
    const resetBtn = document.getElementById(`${timerId}-reset`);
    const deleteBtn = document.getElementById(`${timerId}-delete`);
    
    let remainingTime = initialHours * 3600 + initialMinutes * 60 + initialSeconds;
    let originalTime = remainingTime;
    let timerInterval = null;
    let isRunning = false;
    
    function updateDisplay() {
        const hours = Math.floor(remainingTime / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((remainingTime % 3600) / 60).toString().padStart(2, '0');
        const seconds = (remainingTime % 60).toString().padStart(2, '0');
        display.textContent = `${hours}:${minutes}:${seconds}`;
        
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            startBtn.classList.remove('active');
            pauseBtn.classList.remove('active');
            alert(getI18nText('alertTimerFinished'));
        }
    }
    
    startBtn.addEventListener('click', () => {
        if (!isRunning) {
            if (remainingTime <= 0) {
                remainingTime = originalTime;
            }
            
            if (remainingTime <= 0) {
                alert(getI18nText('alertTimerNotSet'));
                return;
            }
            
            timerInterval = setInterval(() => {
                remainingTime--;
                updateDisplay();
            }, 1000);
            isRunning = true;
            startBtn.classList.add('active');
            pauseBtn.classList.remove('active');
        }
    });
    
    pauseBtn.addEventListener('click', () => {
        if (isRunning) {
            clearInterval(timerInterval);
            isRunning = false;
            pauseBtn.classList.add('active');
            startBtn.classList.remove('active');
        }
    });
    
    resetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        remainingTime = originalTime;
        isRunning = false;
        updateDisplay();
        startBtn.classList.remove('active');
        pauseBtn.classList.remove('active');
    });
    
    deleteBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        const timerCard = document.getElementById(`${timerId}-display`).parentElement;
        timerCard.remove();
    });
}
