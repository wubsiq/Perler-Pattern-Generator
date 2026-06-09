/**
 * SnapshotManager - 负责快照管理和历史记录
 */
class SnapshotManager {
    constructor() {
        this.snapshots = [];
        this.maxSnapshots = 50;
        this.snapshotsContainer = null;
        this.snapshotsList = null;
    }

    /**
     * 初始化 DOM 元素引用
     * @param {HTMLElement} container - 快照容器
     * @param {HTMLElement} list - 快照列表
     */
    initElements(container, list) {
        this.snapshotsContainer = container;
        this.snapshotsList = list;
    }

    /**
     * 添加快照
     * @param {string} type - 快照类型 (custom|optimize)
     * @param {Array} perlerColors - 拼豆颜色矩阵
     * @param {string} description - 描述
     * @param {Function} onRestore - 恢复时的回调
     * @param {Function} onDelete - 删除时的回调
     */
    addSnapshot(type, perlerColors, description, onRestore, onDelete) {
        const lastSnapshotOfType = this.snapshots
            .slice()
            .reverse()
            .find(s => s.type === type);

        if (lastSnapshotOfType) {
            let isEqual = true;
            for (let y = 0; y < perlerColors.length; y++) {
                for (let x = 0; x < perlerColors[y].length; x++) {
                    const c1 = perlerColors[y][x];
                    const c2 = lastSnapshotOfType.data[y][x];

                    if ((c1.isTransparent !== c2.isTransparent) ||
                        (c1.name !== c2.name) ||
                        (JSON.stringify(c1.rgb) !== JSON.stringify(c2.rgb))) {
                        isEqual = false;
                        break;
                    }
                }
                if (!isEqual) break;
            }

            if (isEqual) {
                return;
            }
        }

        const snapshotId = Date.now();
        const timestamp = new Date().toLocaleString();

        const colorCounts = {};
        let totalBeans = 0;
        perlerColors.forEach(row => {
            row.forEach(color => {
                if (!color.isTransparent) {
                    const name = color.name || 'unknown';
                    colorCounts[name] = (colorCounts[name] || 0) + 1;
                    totalBeans++;
                }
            });
        });
        const colorCount = Object.keys(colorCounts).length;

        let colorChange = null;
        let beansChange = null;
        if (this.snapshots.length > 0) {
            const lastSnapshot = this.snapshots[this.snapshots.length - 1];
            colorChange = colorCount - lastSnapshot.colorCount;
            beansChange = totalBeans - lastSnapshot.totalBeans;
        }

        this.snapshots.push({
            id: snapshotId,
            type,
            timestamp,
            colorCount,
            totalBeans,
            colorChange,
            beansChange,
            description,
            data: perlerColors.map(row => [...row]),
            onRestore,
            onDelete
        });

        if (this.snapshots.length > this.maxSnapshots) {
            this.snapshots.shift();
        }

        this.renderList();
        if (this.snapshotsList) {
            this.snapshotsList.style.display = 'block';
        }
    }

    /**
     * 渲染快照列表
     */
    renderList() {
        if (!this.snapshotsContainer) return;

        this.snapshotsContainer.innerHTML = '';

        if (this.snapshots.length === 0) {
            this.snapshotsContainer.innerHTML = `
                <div style="text-align: center; color: #999; padding: 40px 20px;">
                    暂无操作历史
                </div>
            `;
            return;
        }

        const reversedSnapshots = [...this.snapshots].reverse();

        reversedSnapshots.forEach((snapshot, index) => {
            const realIndex = this.snapshots.length - 1 - index;
            const item = document.createElement('div');
            item.className = 'snapshot-item';

            const typeIcon = snapshot.type === 'custom' ? '🎨' : '🔧';
            const typeText = snapshot.type === 'custom' ? '自定义' : '智能优化';

            const colorChangeClass = snapshot.colorChange > 0 ? 'change-negative' : 'change-positive';
            const beansChangeClass = snapshot.beansChange > 0 ? 'change-negative' : 'change-positive';

            const colorChangeText = snapshot.colorChange !== null 
                ? `<span class="${colorChangeClass}">${snapshot.colorChange > 0 ? `+${snapshot.colorChange}` : snapshot.colorChange}</span>` 
                : '';
            const beansChangeText = snapshot.beansChange !== null 
                ? `<span class="${beansChangeClass}">${snapshot.beansChange > 0 ? `+${snapshot.beansChange}` : snapshot.beansChange}</span>` 
                : '';

            const descText = snapshot.description ? `<div class="snapshot-item-desc">${snapshot.description}</div>` : '';

            item.innerHTML = `
                <div class="snapshot-item-info">
                    <div class="snapshot-item-title">
                        ${typeIcon} ${typeText} ${realIndex + 1}
                    </div>
                    <div class="snapshot-item-meta">
                        ${snapshot.timestamp}
                    </div>
                    <div class="snapshot-item-meta">
                        颜色: ${snapshot.colorCount}${colorChangeText ? ` (${colorChangeText})` : ''} | 
                        拼豆: ${snapshot.totalBeans}${beansChangeText ? ` (${beansChangeText})` : ''}
                    </div>
                    ${descText}
                </div>
                <div class="snapshot-item-actions">
                    <button class="btn btn-primary" data-snapshot-id="${snapshot.id}" data-action="restore">恢复</button>
                    <button class="btn btn-secondary" data-snapshot-id="${snapshot.id}" data-action="delete">删除</button>
                </div>
            `;

            item.querySelector('[data-action="restore"]').addEventListener('click', (e) => {
                e.stopPropagation();
                this.restoreSnapshot(snapshot.id);
            });

            item.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSnapshot(snapshot.id);
            });

            this.snapshotsContainer.appendChild(item);
        });
    }

    /**
     * 恢复快照
     * @param {number} snapshotId - 快照 ID
     */
    restoreSnapshot(snapshotId) {
        const snapshot = this.snapshots.find(s => s.id === snapshotId);
        if (!snapshot) return;

        if (snapshot.onRestore) {
            snapshot.onRestore(snapshot);
        }
    }

    /**
     * 删除快照
     * @param {number} snapshotId - 快照 ID
     */
    deleteSnapshot(snapshotId) {
        const snapshot = this.snapshots.find(s => s.id === snapshotId);
        if (snapshot && snapshot.onDelete) {
            snapshot.onDelete(snapshot);
        }

        this.snapshots = this.snapshots.filter(s => s.id !== snapshotId);

        if (this.snapshots.length === 0 && this.snapshotsList) {
            this.snapshotsList.style.display = 'none';
        }

        this.renderList();
    }

    /**
     * 清空所有快照
     */
    clear() {
        this.snapshots = [];
        if (this.snapshotsContainer) {
            this.snapshotsContainer.innerHTML = '';
        }
        if (this.snapshotsList) {
            this.snapshotsList.style.display = 'none';
        }
    }

    /**
     * 获取快照数量
     * @returns {number}
     */
    getCount() {
        return this.snapshots.length;
    }

    /**
     * 获取所有快照
     * @returns {Array}
     */
    getAll() {
        return [...this.snapshots];
    }
}


