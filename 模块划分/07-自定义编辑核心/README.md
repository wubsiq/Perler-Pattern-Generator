# 07-自定义编辑核心

## 来源
- 原始文件: `js/app.js`

## 方法清单

| 行号 | 方法名 | 说明 |
|------|--------|------|
| 4094 | `initCustomEditCanvasEvents` |  |
| 4149 | `refreshCustomEditBrushCursor` |  |
| 4156 | `getCurrentEditColor` |  |
| 4160 | `getCurrentEditColorName` |  |
| 4164 | `getPerlerSignature` |  |
| 4177 | `initCustomEditData` |  |
| 4217 | `drawCustomEditCanvas` |  |
| 4354 | `drawBrushPreview` |  |
| 4450 | `getCustomEditCell` |  |
| 4459 | `handleCustomEditMouseDown` |  |
| 4602 | `handleCustomEditMouseMove` |  |
| 4649 | `handleCustomEditMouseUp` |  |
| 4692 | `applyCustomBrushAt` |  |
| 4727 | `getCurrentEditColorData` |  |
| 4741 | `applyChainRazor` |  |
| 4788 | `removeSelectedColor` |  |
| 4855 | `applyNoiseFilter` |  |
| 4877 | `applyEditToCell` |  |
| 4903 | `applySingleEdit` |  |
| 4983 | `floodFill` |  |
| 5044 | `saveCustomEditHistory` |  |
| 5051 | `rgbToHex` |  |
| 5055 | `hexToRgb` |  |
| 5062 | `executeColorConvert` |  |
| 5137 | `applyStroke` |  |
| 5256 | `undoCustomEdit` |  |
| 5264 | `flipImageHorizontal` |  |
| 5276 | `flipImageVertical` |  |
| 5288 | `applyCustomEdit` |  |

## 代码文件

- `customEdit.js` — app.js L4094-L5346（1253 行）
