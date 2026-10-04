# 09-智能优化

## 来源
- 原始文件: `js/app.js`

## 方法清单

| 行号 | 方法名 | 说明 |
|------|--------|------|
| 5347 | `openSmartOptimizeModal` |  |
| 5378 | `initOptimizationPreviewCanvasEvents` |  |
| 5437 | `handleOptimizationDraw` |  |
| 5482 | `regenerateSuggestions` |  |
| 5503 | `debouncedRegenerateSuggestions` |  |
| 5512 | `drawOptimizationPreview` |  |
| 5968 | `closeSmartOptimizeModal` |  |
| 5985 | `generateColorSuggestions` |  |
| 6109 | `generateMergeSuggestions (重载1)` |  |
| 6176 | `generateMergeSuggestions (重载2)` |  |
| 6246 | `getRgbDistance` |  |
| 6253 | `isColorOnEdge` |  |
| 6288 | `renderOptimizationSummary` |  |
| 6321 | `getErasedCountForColor` |  |
| 6332 | `renderSuggestionsList` |  |
| 6397 | `acceptSuggestion` |  |
| 6410 | `rejectSuggestion` |  |
| 6421 | `acceptAllSuggestions` |  |
| 6432 | `rejectAllSuggestions` |  |
| 6443 | `applySuggestion` |  |
| 6460 | `restoreSuggestion` |  |
| 6477 | `previewSuggestion` |  |
| 6497 | `updateColorCounts` |  |
| 6511 | `confirmOptimization` |  |

## 代码文件

- `smartOptimize.js` — app.js L5347-L5598（252 行）
- `smartOptimizeCore.js` — app.js L5968-L6510（543 行）
