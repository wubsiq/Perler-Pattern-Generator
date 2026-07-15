class CircularPerlerGenerator {
    constructor() {
    }

    getTotalBeads(maxRing) {
        if (maxRing <= 0) return 1;
        return 1 + 3 * maxRing * (maxRing - 1);
    }

    getBeadIndex(ring, sector, pos) {
        if (ring === 0) return 0;
        let index = 1;
        for (let r = 1; r < ring; r++) {
            index += 6 * r;
        }
        index += sector * ring + pos;
        return index;
    }

    getBeadPosition(index, maxRing) {
        if (index === 0) {
            return { ring: 0, sector: 0, pos: 0 };
        }
        
        let remaining = index - 1;
        let ring = 0;
        let cumulative = 0;
        
        for (ring = 1; ring < maxRing; ring++) {
            const ringCount = 6 * ring;
            if (cumulative + ringCount > remaining) {
                break;
            }
            cumulative += ringCount;
        }
        
        const ringIndex = remaining - cumulative;
        const sector = Math.floor(ringIndex / ring);
        const pos = ringIndex % ring;
        
        return { ring, sector, pos };
    }

    polarToCartesian(ring, sector, pos, beadSpacing) {
        if (ring === 0) {
            return { x: 0, y: 0 };
        }
        
        const sectorAngle = sector * (Math.PI / 3);
        const angleInSector = pos * (Math.PI / (3 * ring));
        const angle = sectorAngle + angleInSector;
        
        const radius = ring * beadSpacing;
        
        return {
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle)
        };
    }

    findNearestBead(x, y, maxRing, beadSpacing) {
        const distFromCenter = Math.sqrt(x * x + y * y);
        const ring = Math.round(distFromCenter / beadSpacing);
        const clampedRing = Math.max(0, Math.min(maxRing - 1, ring));
        
        if (clampedRing === 0) {
            return { index: 0, ring: 0, sector: 0, pos: 0 };
        }
        
        let angle = Math.atan2(y, x);
        if (angle < 0) angle += Math.PI * 2;
        
        const sectorAngle = Math.PI / 3;
        const sector = Math.floor(angle / sectorAngle) % 6;
        const angleInSector = angle - sector * sectorAngle;
        const pos = Math.round(angleInSector / (Math.PI / (3 * clampedRing)));
        const clampedPos = Math.max(0, Math.min(clampedRing - 1, pos));
        
        const index = this.getBeadIndex(clampedRing, sector, clampedPos);
        return { index, ring: clampedRing, sector, pos: clampedPos };
    }

    getNeighborBeads(index, maxRing, beadSpacing) {
        const pos = this.getBeadPosition(index, maxRing);
        const neighbors = [];
        const { ring, sector, pos: beadPos } = pos;
        
        if (ring === 0) {
            for (let s = 0; s < 6; s++) {
                neighbors.push(this.getBeadIndex(1, s, 0));
            }
            return neighbors;
        }
        
        if (beadPos > 0) {
            neighbors.push(this.getBeadIndex(ring, sector, beadPos - 1));
        } else {
            const prevSector = (sector + 5) % 6;
            neighbors.push(this.getBeadIndex(ring, prevSector, ring - 1));
        }
        
        if (beadPos < ring - 1) {
            neighbors.push(this.getBeadIndex(ring, sector, beadPos + 1));
        } else {
            const nextSector = (sector + 1) % 6;
            neighbors.push(this.getBeadIndex(ring, nextSector, 0));
        }
        
        if (ring > 1) {
            neighbors.push(this.getBeadIndex(ring - 1, sector, Math.min(beadPos, ring - 2)));
        }
        
        if (ring < maxRing - 1) {
            neighbors.push(this.getBeadIndex(ring + 1, sector, beadPos));
            if (beadPos < ring) {
                neighbors.push(this.getBeadIndex(ring + 1, sector, beadPos + 1));
            }
        }
        
        const totalBeads = this.getTotalBeads(maxRing);
        return neighbors.filter(n => n >= 0 && n < totalBeads && n !== index);
    }

    generateFromImage(image, maxRing, options = {}) {
        const {
            colorSet = 'mard221',
            mappingMethod = 'CIEDE2000',
            beadSpacing = 24
        } = options;

        const colors = colorSets[colorSet] || [];
        const totalBeads = this.getTotalBeads(maxRing);
        
        const perlerColors = [];
        const colorCounts = {};
        const beadPositions = [];
        
        const transparentColor = {
            name: '',
            rgb: [255, 255, 255],
            isTransparent: true
        };

        const imgWidth = image.width;
        const imgHeight = image.height;
        const centerX = imgWidth / 2;
        const centerY = imgHeight / 2;
        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

        const canvas = document.createElement('canvas');
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        const imgData = ctx.getImageData(0, 0, imgWidth, imgHeight);
        const data = imgData.data;

        for (let i = 0; i < totalBeads; i++) {
            const { ring, sector, pos } = this.getBeadPosition(i, maxRing);
            const cartesian = this.polarToCartesian(ring, sector, pos, beadSpacing);
            
            const normalizedRadius = ring / (maxRing - 0.5);
            const imgRadius = normalizedRadius * maxDist;
            const imgAngle = Math.atan2(cartesian.y, cartesian.x);
            
            const sampleX = centerX + imgRadius * Math.cos(imgAngle);
            const sampleY = centerY + imgRadius * Math.sin(imgAngle);
            
            const clampedX = Math.max(0, Math.min(Math.floor(sampleX), imgWidth - 1));
            const clampedY = Math.max(0, Math.min(Math.floor(sampleY), imgHeight - 1));
            
            const pixelIndex = (clampedY * imgWidth + clampedX) * 4;
            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];
            const a = data[pixelIndex + 3];
            
            let color;
            if (a < 128) {
                color = transparentColor;
            } else {
                color = findClosestColor([r, g, b], colors, mappingMethod);
                if (colorCounts[color.name]) {
                    colorCounts[color.name]++;
                } else {
                    colorCounts[color.name] = 1;
                }
            }
            
            perlerColors.push({
                ...color,
                ring,
                sector,
                pos,
                index: i
            });
            
            beadPositions.push({
                x: cartesian.x,
                y: cartesian.y,
                ring,
                sector,
                pos,
                index: i
            });
        }

        return {
            perlerColors,
            beadPositions,
            maxRing,
            totalBeads,
            colorCounts,
            beadSpacing
        };
    }

    generateFromPerlerColors(perlerColors, perlerWidth, perlerHeight, maxRing, options = {}) {
        const {
            colorSet = 'mard221',
            mappingMethod = 'CIEDE2000',
            beadSpacing = 24
        } = options;

        const colors = colorSets[colorSet] || [];
        const totalBeads = this.getTotalBeads(maxRing);
        
        const circularColors = [];
        const colorCounts = {};
        const beadPositions = [];
        
        const transparentColor = {
            name: '',
            rgb: [255, 255, 255],
            isTransparent: true
        };

        const centerX = perlerWidth / 2;
        const centerY = perlerHeight / 2;
        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

        for (let i = 0; i < totalBeads; i++) {
            const { ring, sector, pos } = this.getBeadPosition(i, maxRing);
            const cartesian = this.polarToCartesian(ring, sector, pos, beadSpacing);
            
            const normalizedRadius = ring / (maxRing - 0.5);
            const gridRadius = normalizedRadius * maxDist;
            const gridAngle = Math.atan2(cartesian.y, cartesian.x);
            
            const gridX = centerX + gridRadius * Math.cos(gridAngle);
            const gridY = centerY + gridRadius * Math.sin(gridAngle);
            
            const clampedX = Math.max(0, Math.min(Math.floor(gridX), perlerWidth - 1));
            const clampedY = Math.max(0, Math.min(Math.floor(gridY), perlerHeight - 1));
            
            const sourceColor = perlerColors[clampedY]?.[clampedX];
            
            let color;
            if (!sourceColor || sourceColor.isTransparent) {
                color = transparentColor;
            } else {
                color = findClosestColor(sourceColor.rgb, colors, mappingMethod);
                if (colorCounts[color.name]) {
                    colorCounts[color.name]++;
                } else {
                    colorCounts[color.name] = 1;
                }
            }
            
            circularColors.push({
                ...color,
                ring,
                sector,
                pos,
                index: i
            });
            
            beadPositions.push({
                x: cartesian.x,
                y: cartesian.y,
                ring,
                sector,
                pos,
                index: i
            });
        }

        return {
            perlerColors: circularColors,
            beadPositions,
            maxRing,
            totalBeads,
            colorCounts,
            beadSpacing
        };
    }
}