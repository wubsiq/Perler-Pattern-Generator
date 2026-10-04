/**
 * ==============================================================
 * 模块域: 02-全局事件绑定
 * 原文件: js/app.js
 * 行号范围: 434 - 1296 (共 863 行)
 * 截取方式: 直接复制，未修改（用于模块化规划参考）
 * 
 * 本文件为【代码快照】，原始代码仍在 js/app.js 中。
 * 未来真正重构时需：从 App 类中提取方法，处理 this 依赖。
 * ==============================================================
 */

    initEventListeners() {
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.loadImage(files[0]);
            }
        });

        if (this.blankCanvasArea) {
            this.blankCanvasArea.addEventListener('click', () => this.openBlankCanvasModal());
        }
        if (this.closeBlankCanvasModalBtn) {
            this.closeBlankCanvasModalBtn.addEventListener('click', () => this.closeBlankCanvasModal());
        }
        if (this.cancelBlankCanvasBtn) {
            this.cancelBlankCanvasBtn.addEventListener('click', () => this.closeBlankCanvasModal());
        }
        if (this.confirmBlankCanvasBtn) {
            this.confirmBlankCanvasBtn.addEventListener('click', () => {
                const width = parseInt(this.blankCanvasWidth.value);
                const height = parseInt(this.blankCanvasHeight.value);
                this.createBlankCanvas(width, height);
            });
        }
        document.querySelectorAll('.blank-size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.blank-size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const w = parseInt(btn.dataset.width);
                const h = parseInt(btn.dataset.height);
                this.blankCanvasWidth.value = w;
                this.blankCanvasHeight.value = h;
                this.createBlankCanvas(w, h);
            });
        });
        if (this.blankCanvasModal) {
            this.blankCanvasModal.addEventListener('click', (e) => {
                if (e.target === this.blankCanvasModal) {
                    this.closeBlankCanvasModal();
                }
            });
        }

        // 裁切功能按钮
        this.cropBtn.addEventListener('click', () => this.toggleCropMode());
        this.confirmCropBtn.addEventListener('click', () => this.confirmCrop());
        this.cancelCropBtn.addEventListener('click', () => this.cancelCrop());
        this.resetCropBtn.addEventListener('click', () => this.resetToFullImage());

        // 旋转功能事件绑定
        if (this.rotateSlider) {
            this.rotateSlider.addEventListener('input', () => {
                this.setRotationAngle(parseInt(this.rotateSlider.value));
            });
        }
        if (this.rotate90Btn) {
            this.rotate90Btn.addEventListener('click', () => {
                this.setRotationAngle((this.rotationAngle + 90) % 360);
            });
        }
        if (this.rotate180Btn) {
            this.rotate180Btn.addEventListener('click', () => {
                this.setRotationAngle((this.rotationAngle + 180) % 360);
            });
        }
        if (this.rotate270Btn) {
            this.rotate270Btn.addEventListener('click', () => {
                this.setRotationAngle((this.rotationAngle + 270) % 360);
            });
        }

        // 裁切选框交互
        this.cropOverlay.addEventListener('mousedown', (e) => this.cropMouseDown(e));
        this.cropOverlay.addEventListener('touchstart', (e) => this.cropTouchStart(e), { passive: false });
        document.addEventListener('mousemove', (e) => this.cropMouseMove(e));
        document.addEventListener('touchmove', (e) => this.cropTouchMove(e), { passive: false });
        document.addEventListener('mouseup', (e) => this.cropMouseUp(e));
        document.addEventListener('touchend', (e) => this.cropTouchEnd(e));
        
        this.langZh.addEventListener('click', () => setLanguage('zh'));
        this.langEn.addEventListener('click', () => setLanguage('en'));
        
        this.pixelSizeSlider.addEventListener('input', () => {
            this.pixelSizeValue.textContent = this.pixelSizeSlider.value + 'px';
            this.updatePixelatedImage();
        });
        
        this.widthInput.addEventListener('input', () => {
            if (this.keepRatioCheckbox.checked && this.originalWidth > 0) {
                const ratio = this.originalHeight / this.originalWidth;
                this.heightInput.value = Math.round(this.widthInput.value * ratio);
            }
            this.updatePixelatedImage();
        });
        
        this.heightInput.addEventListener('input', () => {
            if (this.keepRatioCheckbox.checked && this.originalHeight > 0) {
                const ratio = this.originalWidth / this.originalHeight;
                this.widthInput.value = Math.round(this.heightInput.value * ratio);
            }
            this.updatePixelatedImage();
        });
        
        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const width = parseInt(btn.dataset.width);
                const height = parseInt(btn.dataset.height);
                this.widthInput.value = width;
                if (this.keepRatioCheckbox.checked && this.originalWidth > 0) {
                    const ratio = this.originalHeight / this.originalWidth;
                    this.heightInput.value = Math.round(width * ratio);
                } else {
                    this.heightInput.value = height;
                }
                this.updatePixelatedImage();
            });
        });
        
        this.colorSetSelect.addEventListener('change', () => this.showPerlerPlaceholder());
        
        // CIEDE2000 优化参数面板交互
        this.cie2000SettingsBtn = document.getElementById('cie2000SettingsBtn');
        this.cie2000ParamsPanel = document.getElementById('cie2000ParamsPanel');
        this.cie2000Radius = document.getElementById('cie2000Radius');
        this.cie2000RadiusValue = document.getElementById('cie2000RadiusValue');
        this.cie2000Threshold = document.getElementById('cie2000Threshold');
        this.cie2000ThresholdValue = document.getElementById('cie2000ThresholdValue');
        this.cie2000Ratio = document.getElementById('cie2000Ratio');
        this.cie2000RatioValue = document.getElementById('cie2000RatioValue');
        this.cie2000Iteration = document.getElementById('cie2000Iteration');
        this.cie2000IterationValue = document.getElementById('cie2000IterationValue');
        this.cie2000ApplyBtn = document.getElementById('cie2000ApplyBtn');
        this.cie2000ResetBtn = document.getElementById('cie2000ResetBtn');

        if (this.colorMappingMethod) {
            this.colorMappingMethod.addEventListener('change', () => {
                if (this.cie2000SettingsBtn && this.cie2000ParamsPanel) {
                    if (this.colorMappingMethod.value === 'cie2000-smoothed') {
                        this.cie2000SettingsBtn.style.display = 'inline-block';
                    } else {
                        this.cie2000SettingsBtn.style.display = 'none';
                        this.cie2000ParamsPanel.style.display = 'none';
                    }
                }
            });
        }

        if (this.cie2000SettingsBtn && this.cie2000ParamsPanel) {
            this.cie2000SettingsBtn.addEventListener('click', () => {
                const isVisible = this.cie2000ParamsPanel.style.display !== 'none';
                this.cie2000ParamsPanel.style.display = isVisible ? 'none' : 'block';
            });
        }

        if (this.cie2000Radius && this.cie2000RadiusValue) {
            this.cie2000Radius.addEventListener('input', () => {
                const radius = parseInt(this.cie2000Radius.value);
                const size = radius * 2 + 1;
                this.cie2000RadiusValue.textContent = `${radius} (${size}×${size}区域)`;
            });
        }

        if (this.cie2000Threshold && this.cie2000ThresholdValue) {
            this.cie2000Threshold.addEventListener('input', () => {
                this.cie2000ThresholdValue.textContent = this.cie2000Threshold.value;
            });
        }

        if (this.cie2000Ratio && this.cie2000RatioValue) {
            this.cie2000Ratio.addEventListener('input', () => {
                this.cie2000RatioValue.textContent = this.cie2000Ratio.value + '%';
            });
        }

        if (this.cie2000Iteration && this.cie2000IterationValue) {
            this.cie2000Iteration.addEventListener('input', () => {
                this.cie2000IterationValue.textContent = this.cie2000Iteration.value;
            });
        }

        if (this.cie2000ApplyBtn) {
            this.cie2000ApplyBtn.addEventListener('click', () => {
                this.cie2000OptimizedParams = {
                    neighborhoodRadius: parseInt(this.cie2000Radius.value),
                    colorDiffThreshold: parseInt(this.cie2000Threshold.value),
                    minRatio: parseInt(this.cie2000Ratio.value) / 100,
                    iterationCount: parseInt(this.cie2000Iteration.value)
                };
                if (this.cie2000ParamsPanel) {
                    this.cie2000ParamsPanel.style.display = 'none';
                }
            });
        }

        if (this.cie2000ResetBtn) {
            this.cie2000ResetBtn.addEventListener('click', () => {
                if (this.cie2000Radius) this.cie2000Radius.value = 1;
                if (this.cie2000RadiusValue) this.cie2000RadiusValue.textContent = '1';
                if (this.cie2000Threshold) this.cie2000Threshold.value = 5;
                if (this.cie2000ThresholdValue) this.cie2000ThresholdValue.textContent = '5';
                if (this.cie2000Ratio) this.cie2000Ratio.value = 50;
                if (this.cie2000RatioValue) this.cie2000RatioValue.textContent = '50%';
                if (this.cie2000Iteration) this.cie2000Iteration.value = 1;
                if (this.cie2000IterationValue) this.cie2000IterationValue.textContent = '1';
                
                this.cie2000OptimizedParams = {
                    neighborhoodRadius: 1,
                    colorDiffThreshold: 5,
                    minRatio: 0.5,
                    iterationCount: 1
                };
            });
        }
        this.showGridLines.addEventListener('change', () => {
            if (Object.keys(this.colorCounts).length > 0) {
                this.refreshPerlerChartDisplay();
            }
        });
        this.showCoordNumbers.addEventListener('change', () => {
            if (Object.keys(this.colorCounts).length > 0) {
                this.refreshPerlerChartDisplay();
            }
        });
        // 注意：颜色选择器（coordLineColor 和 coordNumberColor）不实时渲染，只有点击"渲染拼豆图纸"按钮才会生效
        this.chartStyle.addEventListener('change', () => {
            if (Object.keys(this.colorCounts).length > 0) {
                this.refreshPerlerChartDisplay();
            } else {
                this.showPerlerPlaceholder();
            }
        });
        this.legendPosition.addEventListener('change', () => this.refreshLegendPosition());
        this.beadShape.addEventListener('change', () => {
            if (Object.keys(this.colorCounts).length > 0) {
                this.refreshPerlerChartDisplay();
            }
        });
        if (this.transparentCellColor) {
            const transparentColorHandler = () => {
                if (this.transparentCellColorValue) {
                    this.transparentCellColorValue.textContent = this.transparentCellColor.value;
                }
                if (Object.keys(this.colorCounts).length > 0) {
                    this.debouncedRefreshPerlerChart();
                }
            };
            this.transparentCellColor.addEventListener('input', transparentColorHandler);
            this.transparentCellColor.addEventListener('change', transparentColorHandler);
        }
        this.gridLineWidth.addEventListener('input', () => {
            if (Object.keys(this.colorCounts).length > 0) {
                this.refreshPerlerChartDisplay();
            }
        });
        this.beadSizeSlider.addEventListener('input', () => {
            const displaySize = parseInt(this.beadSizeSlider.value);
            this.beadSizeValue.textContent = displaySize + 'px';
            
            let exportSize = displaySize * 2;
            exportSize = Math.max(3, Math.min(96, exportSize));
            this.exportBeadSizeSlider.value = exportSize;
            this.exportBeadSizeValue.textContent = exportSize + 'px';
        });
        
        this.exportBeadSizeSlider.addEventListener('input', () => {
            this.exportBeadSizeValue.textContent = this.exportBeadSizeSlider.value + 'px';
        });
        this.renderPerlerBtn = document.getElementById('renderPerlerBtn');
        this.renderPerlerBtn.addEventListener('click', () => this.updatePerlerChart());
        
        this.simpleModeBtn = document.getElementById('simpleModeBtn');
        this.advancedModeBtn = document.getElementById('advancedModeBtn');
        
        this.simpleModeBtn.addEventListener('click', () => {
            this.simpleModeBtn.classList.add('active');
            this.advancedModeBtn.classList.remove('active');
            document.querySelector('.workspace').classList.remove('advanced-mode');
        });
        
        this.advancedModeBtn.addEventListener('click', () => {
            this.advancedModeBtn.classList.add('active');
            this.simpleModeBtn.classList.remove('active');
            document.querySelector('.workspace').classList.add('advanced-mode');
        });
        
        this.enableContrast.addEventListener('change', () => this.updatePixelatedImage());
        this.contrastSlider.addEventListener('input', () => {
            this.contrastValue.textContent = this.contrastSlider.value + 'x';
            this.updatePixelatedImage();
        });
        
        this.enableSharpen.addEventListener('change', () => this.updatePixelatedImage());
        this.sharpenSlider.addEventListener('input', () => {
            this.sharpenValue.textContent = this.sharpenSlider.value;
            this.updatePixelatedImage();
        });
        
        this.enableColorQuantize.addEventListener('change', () => {
            this.colorQuantizePanel.style.display = this.enableColorQuantize.checked ? 'block' : 'none';
            this.updatePixelatedImage();
        });
        this.colorCountSlider.addEventListener('input', () => {
            const value = this.colorCountSlider.value;
            this.colorCountValue.textContent = value;
            this.colorCountInput.value = value;
            this.updatePixelatedImage();
        });
        this.colorCountInput.addEventListener('input', () => {
            let value = parseInt(this.colorCountInput.value);
            if (isNaN(value)) value = 2;
            if (value < 2) value = 2;
            if (value > 291) value = 291;
            this.colorCountValue.textContent = value;
            this.colorCountSlider.value = value;
            this.colorCountInput.value = value;
            this.updatePixelatedImage();
        });
        
        // 雕刻分裂相关事件
        this.pixelModeBtn.addEventListener('click', () => this.setPixelMode(false));
        this.carveModeBtn.addEventListener('click', () => this.setPixelMode(true));
        
        this.initialBlockSizeSlider.addEventListener('input', () => {
            this.initialBlockSizeValue.textContent = this.initialBlockSizeSlider.value + 'px';
            this.initialBlockSize = parseInt(this.initialBlockSizeSlider.value);
            if (this.carveMode) {
                this.resetCarving();
            }
        });
        
        this.minBlockSizeSlider.addEventListener('input', () => {
            this.minBlockSizeValue.textContent = this.minBlockSizeSlider.value + 'px';
            this.minBlockSize = parseInt(this.minBlockSizeSlider.value);
        });
        
        this.initialBlockSizeValue.textContent = '200px';
        this.minBlockSizeValue.textContent = '40px';
        
        this.showCarveGridCheckbox.addEventListener('change', () => {
            this.showCarveGrid = this.showCarveGridCheckbox.checked;
            if (this.carveMode) {
                this.drawCarveBlocks();
            }
        });
        
        this.resetCarveBtn.addEventListener('click', () => this.resetCarving());
        this.splitAllBtn.addEventListener('click', () => this.splitAllBlocks());
        this.mergeSelectedBtn.addEventListener('click', () => this.mergeSelectedBlocks());
        
        this.pixelatedCanvas.addEventListener('click', (e) => this.handleCarveCanvasClick(e));
        
        this.clearBtn.addEventListener('click', () => this.clear());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.downloadPerlerBtn.addEventListener('click', () => this.downloadPerlerChart());
        this.exportPixelImageBtn.addEventListener('click', () => this.exportPixelImage());
        
        this.exportInfoPaperCompressedBtn.addEventListener('click', () => this.exportInfoPaperCompressed());
        this.exportInfoPaperCompressedFileBtn.addEventListener('click', () => this.exportInfoPaperCompressedFile());
        this.importInfoPaperBtn.addEventListener('click', () => this.importInfoPaper());
        
        this.exportScaleSlider.addEventListener('input', () => {
            const value = parseFloat(this.exportScaleSlider.value);
            this.exportScaleValue.textContent = value + '×';
            this.exportScaleInput.value = value;
        });
        
        this.exportScaleInput.addEventListener('input', () => {
            let value = parseFloat(this.exportScaleInput.value);
            if (isNaN(value)) value = 1;
            value = Math.max(1, Math.min(16, value));
            this.exportScaleInput.value = value;
            this.exportScaleSlider.value = value;
            this.exportScaleValue.textContent = value + '×';
        });
        
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSort = btn.dataset.sort;
                this.updateColorUsageList();
            });
        });
        
        this.pixelMethod.addEventListener('change', () => {
            this.quantizedPixelControls.style.display = this.pixelMethod.value === 'quantized' ? 'block' : 'none';
            this.updatePixelatedImage();
        });
        
        this.targetColorCountSlider.addEventListener('input', () => {
            const value = this.targetColorCountSlider.value;
            this.targetColorCountValue.textContent = value;
            this.targetColorCountInput.value = value;
            this.updatePixelatedImage();
        });
        this.targetColorCountInput.addEventListener('input', () => {
            let value = parseInt(this.targetColorCountInput.value);
            if (isNaN(value)) value = 8;
            if (value < 8) value = 8;
            if (value > 96) value = 96;
            this.targetColorCountValue.textContent = value;
            this.targetColorCountSlider.value = value;
            this.targetColorCountInput.value = value;
            this.updatePixelatedImage();
        });
        
        this.enableNeighborSmooth.addEventListener('change', () => {
            if (Object.keys(this.colorCounts).length > 0) {
                this.updatePerlerChart();
            }
        });
        
        this.showPixelGrid.addEventListener('change', () => this.updatePixelatedImage());
        
        // 优化：直接修改网格线颜色，不需要重新计算像素化
        this.pixelGridColor.addEventListener('input', () => this.updatePixelGridColor());
        
        // 像素划分线偏移调整 - 需要重新计算像素化
        this.pixelGridOffsetX.addEventListener('input', () => {
            this.pixelGridOffsetXValue.textContent = this.pixelGridOffsetX.value + 'px';
            this.updatePixelatedImage();
        });
        this.pixelGridOffsetY.addEventListener('input', () => {
            this.pixelGridOffsetYValue.textContent = this.pixelGridOffsetY.value + 'px';
            this.updatePixelatedImage();
        });

        // 像素划分线粗度调整
        this.pixelGridLineWidth.addEventListener('input', () => {
            this.pixelGridLineWidthValue.textContent = this.pixelGridLineWidth.value + 'px';
            this.updatePixelGridColor();
        });
        
        // 像素块大小变化时，调整偏移滑块的最大值
        this.pixelSizeSlider.addEventListener('input', () => {
            const pixelSize = parseInt(this.pixelSizeSlider.value);
            this.pixelGridOffsetX.max = pixelSize - 1;
            this.pixelGridOffsetY.max = pixelSize - 1;
            if (parseInt(this.pixelGridOffsetX.value) >= pixelSize) {
                this.pixelGridOffsetX.value = 0;
                this.pixelGridOffsetXValue.textContent = '0px';
            }
            if (parseInt(this.pixelGridOffsetY.value) >= pixelSize) {
                this.pixelGridOffsetY.value = 0;
                this.pixelGridOffsetYValue.textContent = '0px';
            }
        });
        
        document.querySelectorAll('.edit-tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const newTool = btn.dataset.tool;

                // 描边工具：打开浮动面板，不切换工具状态
                if (newTool === 'stroke') {
                    this.openStrokePanel();
                    return;
                }

                // 颜色转换工具：打开浮动面板，不切换工具状态
                if (newTool === 'colorConvert') {
                    this.openColorConvertPanel();
                    return;
                }

                // 颜色剔除工具：打开浮动面板，不切换工具状态
                if (newTool === 'colorRemove') {
                    this.openColorRemovePanel();
                    return;
                }

                // 杂色过滤工具：打开浮动面板，不切换工具状态
                if (newTool === 'noiseFilter') {
                    this.openNoiseFilterPanel();
                    return;
                }

                // 颜色量化工具：打开浮动面板，不切换工具状态
                if (newTool === 'colorQuantize') {
                    this.openColorQuantizePanel();
                    return;
                }

                // 如果之前是取色器，恢复原始的画笔大小
                if (this.currentEditTool === 'picker' && newTool !== 'picker') {
                    this.customEditBrushSize.value = this.savedBrushSize;
                    this.brushSizeValue.textContent = this.savedBrushSize;
                }

                // 如果新工具是取色器，保存当前的画笔大小，然后设置为1
                if (newTool === 'picker' && this.currentEditTool !== 'picker') {
                    this.savedBrushSize = this.customEditBrushSize.value;
                    this.customEditBrushSize.value = 1;
                    this.brushSizeValue.textContent = '1';
                }

                

                if (newTool === 'selection') {
                    if (this.currentEditTool === 'selection' && this.customEditor && this.customEditor.selection) {
                        this.customEditor.clearSelection();
                        this.drawCustomEditCanvas();
                    }
                    // 显示选区设置面板（不隐藏画笔面板，支持多窗口共存）
                    if (this.selectionPanel) {
                        this.selectionPanel.show();
                    } else {
                        this.initSelectionPanel();
                    }
                } else if (newTool === 'customBrush') {
                    // 显示画笔管理面板（不隐藏选区面板，支持多窗口共存）
                    if (this.brushPanel) {
                        this.brushPanel.show();
                    } else {
                        this.initBrushManager();
                    }
                } else {
                    // 切换到其他工具时，不隐藏面板（让用户自己管理窗口）
                    // 面板作为自由窗口，保持显示状态
                }

                document.querySelectorAll('.edit-tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentEditTool = newTool;

                // 显示/隐藏画布边界控制
                if (this.currentEditTool === 'canvasBounds') {
                    this.canvasBoundsControls.style.display = 'block';
                    this.canvasBoundsHandles.style.display = 'block';
                    this.customEditBrushCursor.style.display = 'none';
                    this.updateCanvasBoundsHandlesPosition();
                } else {
                    this.canvasBoundsControls.style.display = 'none';
                    this.canvasBoundsHandles.style.display = 'none';
                }
                
                // 更新画笔光标
                this.updateCustomEditBrushCursorSize();
            });
        });
        
        // 色板组件已在 initElements 中初始化，回调已处理颜色变化
        
        this.eraserColor.addEventListener('input', () => {
            this.eraserColorValue.textContent = this.eraserColor.value;
            this.refreshCustomEditBrushCursor();
        });
        
        this.razorBgColor.addEventListener('input', () => {
            this.razorBgColorValue.textContent = this.razorBgColor.value;
            this.drawCustomEditCanvas();
            this.refreshCustomEditBrushCursor();
        });
        
        this.customEditBrushSize.addEventListener('input', () => {
            this.brushSizeValue.textContent = this.customEditBrushSize.value;
            this.refreshCustomEditBrushCursor();
        });
        
        this.applyCustomEditBtn.addEventListener('click', () => this.applyCustomEdit());
        this.undoCustomEditBtn.addEventListener('click', () => this.undoCustomEdit());
        this.saveSnapshotBtn.addEventListener('click', () => this.saveUnifiedSnapshot('custom'));
        this.flipHorizontalBtn.addEventListener('click', () => this.flipImageHorizontal());
        this.flipVerticalBtn.addEventListener('click', () => this.flipImageVertical());
        
        // 颜色剔除功能
        this.removeColorPicker.addEventListener('input', () => {
            this.removeColorValue.textContent = this.removeColorPicker.value;
        });
        
        this.pickRemoveColorBtn.addEventListener('click', () => {
            // 不切换工具，仅设置取色模式
            this.pickRemoveColorMode = true;
            this.pickRemoveColorBtn.classList.add('color-pick-active');
        });

        this.removeColorBtn.addEventListener('click', () => {
            this.removeSelectedColor();
        });

        // 颜色剔除面板关闭按钮
        this.closeColorRemoveBtn.addEventListener('click', () => {
            this.closeColorRemovePanel();
        });

        // 杂色过滤面板事件
        this.closeNoiseFilterBtn.addEventListener('click', () => {
            this.closeNoiseFilterPanel();
        });

        this.noiseFilterThresholdSlider.addEventListener('input', () => {
            this.noiseFilterThresholdValue.textContent = this.noiseFilterThresholdSlider.value;
        });

        this.applyNoiseFilterBtn.addEventListener('click', () => {
            this.applyNoiseFilter();
        });

        // 颜色量化面板事件
        this.closeColorQuantizeBtn.addEventListener('click', () => {
            this.closeColorQuantizePanel();
        });

        this.quantizeSelectAllBtn.addEventListener('click', () => {
            this.quantizeColorList.querySelectorAll('.quantize-color-checkbox').forEach(cb => {
                cb.checked = true;
            });
        });

        this.quantizeSelectNoneBtn.addEventListener('click', () => {
            this.quantizeColorList.querySelectorAll('.quantize-color-checkbox').forEach(cb => {
                cb.checked = false;
            });
        });

        this.applyColorQuantizeBtn.addEventListener('click', () => {
            this.applyColorQuantize();
        });

        this.quantizePickColorBtn.addEventListener('click', () => {
            if (this.quantizePickMode) {
                this.quantizePickMode = false;
                this.quantizePickColorBtn.classList.remove('color-pick-active');
                console.log('[颜色量化取色] 退出取色模式');
            } else {
                this.quantizePickMode = true;
                this.quantizePickColorBtn.classList.add('color-pick-active');
                console.log('[颜色量化取色] 进入取色模式');
            }
        });

        // 悬浮快照面板事件
        this.snapshotFloatBtn.addEventListener('click', () => {
            this.toggleSnapshotPanel();
        });
        
        this.closeSnapshotPanel.addEventListener('click', () => {
            this.closePanel();
        });
        
        // 点击面板外部关闭
        document.addEventListener('click', (e) => {
            if (this.snapshotPanel.classList.contains('show') && 
                !this.snapshotPanel.contains(e.target) && 
                e.target !== this.snapshotFloatBtn && 
                !this.snapshotFloatBtn.contains(e.target)) {
                this.closePanel();
            }
        });
        
        this.closeColorConvertBtn.addEventListener('click', () => {
            this.closeColorConvertPanel();
        });

        this.initColorConvertPanelDrag();
        this.initStrokePanelDrag();
        this.initColorRemovePanelDrag();
        this.initNoiseFilterPanelDrag();
        this.initColorQuantizePanelDrag();

        this.colorConvertSourceColor.addEventListener('input', () => {
            this.colorConvertSourceColorValue.textContent = this.colorConvertSourceColor.value;
            this.colorConvertSourceIsTransparent = false;
            this.colorConvertSourceColor.style.opacity = '1';
        });

        this.colorConvertTargetColor.addEventListener('input', () => {
            this.colorConvertTargetColorValue.textContent = this.colorConvertTargetColor.value;
            this.colorConvertTargetIsTransparent = false;
            this.colorConvertTargetColor.style.opacity = '1';
        });

        this.pickSourceColorBtn.addEventListener('click', () => {
            if (this.colorConvertPickMode === 'source') {
                this.colorConvertPickMode = null;
                this.pickSourceColorBtn.classList.remove('color-pick-active');
            } else {
                this.colorConvertPickMode = 'source';
                this.pickSourceColorBtn.classList.add('color-pick-active');
                this.pickTargetColorBtn.classList.remove('color-pick-active');
            }
        });
        
        this.pickTargetColorBtn.addEventListener('click', () => {
            if (this.colorConvertPickMode === 'target') {
                this.colorConvertPickMode = null;
                this.pickTargetColorBtn.classList.remove('color-pick-active');
            } else {
                this.colorConvertPickMode = 'target';
                this.pickTargetColorBtn.classList.add('color-pick-active');
                this.pickSourceColorBtn.classList.remove('color-pick-active');
            }
        });
        
        this.executeColorConvertBtn.addEventListener('click', () => this.executeColorConvert());
        
        this.initCustomEditCanvasEvents();
        
        this.smartOptimizeBtn.addEventListener('click', () => this.openSmartOptimizeModal());
        this.closeModalBtn.addEventListener('click', () => this.closeSmartOptimizeModal());
        this.toggleFullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.rejectAllBtn.addEventListener('click', () => this.rejectAllSuggestions());
        this.applyAllBtn.addEventListener('click', () => this.acceptAllSuggestions());
        this.confirmBtn.addEventListener('click', () => this.confirmOptimization());
        
        this.enableColorMerge.addEventListener('change', () => this.debouncedRegenerateSuggestions());
        this.colorMergeThresholdSlider.addEventListener('input', () => {
            this.colorMergeThresholdValue.textContent = this.colorMergeThresholdSlider.value + '%';
            this.debouncedRegenerateSuggestions();
        });
        this.enableEdgeColorMerge.addEventListener('change', () => this.debouncedRegenerateSuggestions());
        this.edgeColorThresholdSlider.addEventListener('input', () => {
            this.edgeColorThresholdValue.textContent = this.edgeColorThresholdSlider.value + '%';
            this.debouncedRegenerateSuggestions();
        });
        
        // 画笔工具事件
        this.optimizeBrushSizeSlider.addEventListener('input', () => {
            this.optimizeBrushSizeValue.textContent = this.optimizeBrushSizeSlider.value;
            this.updateBrushCursorSize();
        });
        
        this.brushModeErase.addEventListener('click', () => {
            this.brushMode = 'erase';
            this.brushModeErase.classList.add('active');
            this.brushModeRestore.classList.remove('active');
        });
        
        this.brushModeRestore.addEventListener('click', () => {
            this.brushMode = 'restore';
            this.brushModeRestore.classList.add('active');
            this.brushModeErase.classList.remove('active');
        });
        
        this.clearErasedBlocksBtn.addEventListener('click', () => {
            this.erasedBlocks.clear();
            this.drawOptimizationPreview();
        });
        
        // 颜色选择器事件
        this.optimizeHighlightColor.addEventListener('input', () => {
            this.drawOptimizationPreview();
        });
        
        this.optimizeErasedColor.addEventListener('input', () => {
            this.drawOptimizationPreview();
        });
        
        // 优化预览画布的鼠标事件
        this.initOptimizationPreviewCanvasEvents();
        
        this.pixelatedZoomSlider.addEventListener('input', () => {
            const zoom = this.pixelatedZoomSlider.value;
            this.pixelatedZoomValue.textContent = zoom + '%';
            const scale = zoom / 100;
            if (this.pixelatedCanvasDisplayWidth && this.pixelatedCanvasDisplayHeight) {
                this.pixelatedCanvas.style.width = (this.pixelatedCanvasDisplayWidth * scale) + 'px';
                this.pixelatedCanvas.style.height = (this.pixelatedCanvasDisplayHeight * scale) + 'px';
            }
        });
        
        // 画布边界调整事件
        this.canvasBoundsLeftInput.addEventListener('input', () => {
            if (!this.canvasBounds) return;
            let val = parseInt(this.canvasBoundsLeftInput.value);
            if (isNaN(val)) return;
            val = Math.min(val, this.canvasBounds.right - 1);
            this.applyCanvasBounds(val, this.canvasBounds.right, this.canvasBounds.top, this.canvasBounds.bottom);
            this.updateCanvasBoundsInputs();
            this.updateCanvasBoundsDisplay();
            this.drawCustomEditCanvas();
            this.updateCanvasBoundsHandlesPosition();
        });

        this.canvasBoundsRightInput.addEventListener('input', () => {
            if (!this.canvasBounds) return;
            let val = parseInt(this.canvasBoundsRightInput.value);
            if (isNaN(val)) return;
            val = Math.max(val, this.canvasBounds.left + 1);
            this.applyCanvasBounds(this.canvasBounds.left, val, this.canvasBounds.top, this.canvasBounds.bottom);
            this.updateCanvasBoundsInputs();
            this.updateCanvasBoundsDisplay();
            this.drawCustomEditCanvas();
            this.updateCanvasBoundsHandlesPosition();
        });

        this.canvasBoundsTopInput.addEventListener('input', () => {
            if (!this.canvasBounds) return;
            let val = parseInt(this.canvasBoundsTopInput.value);
            if (isNaN(val)) return;
            val = Math.min(val, this.canvasBounds.bottom - 1);
            this.applyCanvasBounds(this.canvasBounds.left, this.canvasBounds.right, val, this.canvasBounds.bottom);
            this.updateCanvasBoundsInputs();
            this.updateCanvasBoundsDisplay();
            this.drawCustomEditCanvas();
            this.updateCanvasBoundsHandlesPosition();
        });

        this.canvasBoundsBottomInput.addEventListener('input', () => {
            if (!this.canvasBounds) return;
            let val = parseInt(this.canvasBoundsBottomInput.value);
            if (isNaN(val)) return;
            val = Math.max(val, this.canvasBounds.top + 1);
            this.applyCanvasBounds(this.canvasBounds.left, this.canvasBounds.right, this.canvasBounds.top, val);
            this.updateCanvasBoundsInputs();
            this.updateCanvasBoundsDisplay();
            this.drawCustomEditCanvas();
            this.updateCanvasBoundsHandlesPosition();
        });
        
        this.resetCanvasBoundsBtn.addEventListener('click', () => {
            this.resetCanvasBounds();
        });
        
        // 描边工具（浮动面板版）：颜色和厚度更新
        this.strokeColor.addEventListener('input', () => {
            this.strokeColorValue.textContent = this.strokeColor.value;
        });
        this.strokeThickness.addEventListener('input', () => {
            this.strokeThicknessValue.textContent = this.strokeThickness.value;
        });

        // 描边工具（浮动面板版）：关闭按钮
        this.closeStrokePanelBtn.addEventListener('click', () => {
            this.closeStrokePanel();
        });

        // 描边工具（浮动面板版）：执行描边
        this.executeStrokeBtn.addEventListener('click', () => {
            const type = document.querySelector('input[name="strokeType"]:checked').value;
            const thickness = parseInt(this.strokeThickness.value);
            const colorHex = this.strokeColor.value;
            this.applyStroke(type, thickness, colorHex);
        });
        
        // 初始化画布边界拖拽事件
        this.initCanvasBoundsDragEvents();
        
        this.perlerZoomSlider.addEventListener('input', () => {
            const zoom = this.perlerZoomSlider.value;
            this.perlerZoomValue.textContent = zoom + '%';
            const scale = zoom / 100;
            if (this.perlerCanvasDisplayWidth && this.perlerCanvasDisplayHeight) {
                this.perlerCanvas.style.width = (this.perlerCanvasDisplayWidth * scale) + 'px';
                this.perlerCanvas.style.height = (this.perlerCanvasDisplayHeight * scale) + 'px';
            }
        });
    }
