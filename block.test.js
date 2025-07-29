// Block クラスの単体テスト

// テスト用のモック設定
const GAME_CONFIG = {
    BLOCK_WIDTH: 75,
    BLOCK_HEIGHT: 20,
    BLOCK_ROWS: 5,
    BLOCK_COLS: 10,
    BLOCK_PADDING: 5,
    BLOCK_TOP_MARGIN: 60,
    BLOCK_SIDE_MARGIN: 35,
    POINTS_PER_BLOCK: 10,
    COLORS: {
        BLOCKS: ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff']
    }
};

// Block クラスの定義（テスト用）
class Block {
    constructor(x, y, colorIndex = 0) {
        this.x = x || 0;
        this.y = y || 0;
        this.width = GAME_CONFIG.BLOCK_WIDTH;
        this.height = GAME_CONFIG.BLOCK_HEIGHT;
        this.destroyed = false;
        this.colorIndex = colorIndex;
        this.color = GAME_CONFIG.COLORS.BLOCKS[colorIndex % GAME_CONFIG.COLORS.BLOCKS.length];
        this.points = GAME_CONFIG.POINTS_PER_BLOCK;
    }
    
    render(ctx) {
        if (!ctx) {
            throw new Error('Canvas context is required for rendering');
        }
        
        if (this.destroyed) {
            return;
        }
        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    
    destroy() {
        if (!this.destroyed) {
            this.destroyed = true;
            return this.points;
        }
        return 0;
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
    
    isDestroyed() {
        return this.destroyed;
    }
    
    reset() {
        this.destroyed = false;
    }
}

// BlockManager クラスの定義（テスト用）
class BlockManager {
    constructor() {
        this.blocks = [];
        this.totalBlocks = 0;
        this.destroyedBlocks = 0;
    }
    
    initializeBlocks() {
        this.blocks = [];
        this.totalBlocks = 0;
        this.destroyedBlocks = 0;
        
        const startX = GAME_CONFIG.BLOCK_SIDE_MARGIN;
        const startY = GAME_CONFIG.BLOCK_TOP_MARGIN;
        
        for (let row = 0; row < GAME_CONFIG.BLOCK_ROWS; row++) {
            for (let col = 0; col < GAME_CONFIG.BLOCK_COLS; col++) {
                const x = startX + col * (GAME_CONFIG.BLOCK_WIDTH + GAME_CONFIG.BLOCK_PADDING);
                const y = startY + row * (GAME_CONFIG.BLOCK_HEIGHT + GAME_CONFIG.BLOCK_PADDING);
                const colorIndex = row;
                const block = new Block(x, y, colorIndex);
                this.blocks.push(block);
                this.totalBlocks++;
            }
        }
        
        return this.blocks;
    }
    
    renderAll(ctx) {
        if (!ctx) {
            throw new Error('Canvas context is required for rendering');
        }
        
        this.blocks.forEach(block => {
            block.render(ctx);
        });
    }
    
    getActiveBlocks() {
        return this.blocks.filter(block => !block.isDestroyed());
    }
    
    areAllBlocksDestroyed() {
        return this.getActiveBlocks().length === 0;
    }
    
    getStats() {
        const activeBlocks = this.getActiveBlocks();
        return {
            total: this.totalBlocks,
            active: activeBlocks.length,
            destroyed: this.totalBlocks - activeBlocks.length,
            percentage: this.totalBlocks > 0 ? Math.round(((this.totalBlocks - activeBlocks.length) / this.totalBlocks) * 100) : 0
        };
    }
    
    resetAll() {
        this.blocks.forEach(block => {
            block.reset();
        });
        this.destroyedBlocks = 0;
    }
    
    getBlockAt(x, y) {
        return this.blocks.find(block => {
            if (block.isDestroyed()) return false;
            
            const bounds = block.getBounds();
            return x >= bounds.x && x <= bounds.x + bounds.width &&
                   y >= bounds.y && y <= bounds.y + bounds.height;
        });
    }
}

describe('Block クラス', () => {
    let block;
    let mockCtx;
    
    beforeEach(() => {
        // モックCanvas contextを作成
        mockCtx = {
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            fillRect: jest.fn(),
            strokeRect: jest.fn()
        };
        
        block = new Block(100, 50, 2);
    });
    
    describe('コンストラクタ', () => {
        test('デフォルト値で正しく初期化される', () => {
            const defaultBlock = new Block();
            expect(defaultBlock.x).toBe(0);
            expect(defaultBlock.y).toBe(0);
            expect(defaultBlock.colorIndex).toBe(0);
            expect(defaultBlock.destroyed).toBe(false);
        });
        
        test('指定した値で正しく初期化される', () => {
            expect(block.x).toBe(100);
            expect(block.y).toBe(50);
            expect(block.colorIndex).toBe(2);
            expect(block.width).toBe(GAME_CONFIG.BLOCK_WIDTH);
            expect(block.height).toBe(GAME_CONFIG.BLOCK_HEIGHT);
            expect(block.points).toBe(GAME_CONFIG.POINTS_PER_BLOCK);
            expect(block.color).toBe(GAME_CONFIG.COLORS.BLOCKS[2]);
        });
        
        test('色インデックスが配列範囲を超えても正しく処理される', () => {
            const blockWithLargeIndex = new Block(0, 0, 10);
            const expectedColorIndex = 10 % GAME_CONFIG.COLORS.BLOCKS.length;
            expect(blockWithLargeIndex.color).toBe(GAME_CONFIG.COLORS.BLOCKS[expectedColorIndex]);
        });
    });
    
    describe('render メソッド', () => {
        test('正常に描画される', () => {
            block.render(mockCtx);
            
            expect(mockCtx.fillRect).toHaveBeenCalledWith(100, 50, GAME_CONFIG.BLOCK_WIDTH, GAME_CONFIG.BLOCK_HEIGHT);
            expect(mockCtx.strokeRect).toHaveBeenCalledWith(100, 50, GAME_CONFIG.BLOCK_WIDTH, GAME_CONFIG.BLOCK_HEIGHT);
            expect(mockCtx.fillStyle).toBe(GAME_CONFIG.COLORS.BLOCKS[2]);
            expect(mockCtx.strokeStyle).toBe('#ffffff');
            expect(mockCtx.lineWidth).toBe(1);
        });
        
        test('破壊されたブロックは描画されない', () => {
            block.destroy();
            block.render(mockCtx);
            
            expect(mockCtx.fillRect).not.toHaveBeenCalled();
            expect(mockCtx.strokeRect).not.toHaveBeenCalled();
        });
        
        test('contextが無い場合はエラーを投げる', () => {
            expect(() => {
                block.render(null);
            }).toThrow('Canvas context is required for rendering');
        });
    });
    
    describe('destroy メソッド', () => {
        test('初回破壊時にポイントを返す', () => {
            expect(block.isDestroyed()).toBe(false);
            const points = block.destroy();
            expect(points).toBe(GAME_CONFIG.POINTS_PER_BLOCK);
            expect(block.isDestroyed()).toBe(true);
        });
        
        test('既に破壊済みの場合は0を返す', () => {
            block.destroy(); // 初回破壊
            const points = block.destroy(); // 2回目
            expect(points).toBe(0);
            expect(block.isDestroyed()).toBe(true);
        });
    });
    
    describe('getBounds メソッド', () => {
        test('正しい境界矩形を返す', () => {
            const bounds = block.getBounds();
            expect(bounds).toEqual({
                x: 100,
                y: 50,
                width: GAME_CONFIG.BLOCK_WIDTH,
                height: GAME_CONFIG.BLOCK_HEIGHT
            });
        });
    });
    
    describe('getCenter メソッド', () => {
        test('正しい中心座標を返す', () => {
            const center = block.getCenter();
            expect(center).toEqual({
                x: 100 + GAME_CONFIG.BLOCK_WIDTH / 2,
                y: 50 + GAME_CONFIG.BLOCK_HEIGHT / 2
            });
        });
    });
    
    describe('reset メソッド', () => {
        test('破壊状態をリセットする', () => {
            block.destroy();
            expect(block.isDestroyed()).toBe(true);
            
            block.reset();
            expect(block.isDestroyed()).toBe(false);
        });
    });
});

describe('BlockManager クラス', () => {
    let blockManager;
    let mockCtx;
    
    beforeEach(() => {
        mockCtx = {
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            fillRect: jest.fn(),
            strokeRect: jest.fn()
        };
        
        blockManager = new BlockManager();
    });
    
    describe('initializeBlocks メソッド', () => {
        test('正しい数のブロックを初期化する', () => {
            const blocks = blockManager.initializeBlocks();
            const expectedTotal = GAME_CONFIG.BLOCK_ROWS * GAME_CONFIG.BLOCK_COLS;
            
            expect(blocks.length).toBe(expectedTotal);
            expect(blockManager.totalBlocks).toBe(expectedTotal);
            expect(blockManager.blocks.length).toBe(expectedTotal);
        });
        
        test('ブロックが正しい位置に配置される', () => {
            blockManager.initializeBlocks();
            
            // 最初のブロック（0行0列）の位置をチェック
            const firstBlock = blockManager.blocks[0];
            expect(firstBlock.x).toBe(GAME_CONFIG.BLOCK_SIDE_MARGIN);
            expect(firstBlock.y).toBe(GAME_CONFIG.BLOCK_TOP_MARGIN);
            
            // 2番目のブロック（0行1列）の位置をチェック
            const secondBlock = blockManager.blocks[1];
            const expectedX = GAME_CONFIG.BLOCK_SIDE_MARGIN + (GAME_CONFIG.BLOCK_WIDTH + GAME_CONFIG.BLOCK_PADDING);
            expect(secondBlock.x).toBe(expectedX);
            expect(secondBlock.y).toBe(GAME_CONFIG.BLOCK_TOP_MARGIN);
        });
        
        test('各行のブロックが異なる色を持つ', () => {
            blockManager.initializeBlocks();
            
            // 各行の最初のブロックの色をチェック
            for (let row = 0; row < GAME_CONFIG.BLOCK_ROWS; row++) {
                const blockIndex = row * GAME_CONFIG.BLOCK_COLS;
                const block = blockManager.blocks[blockIndex];
                expect(block.colorIndex).toBe(row);
                expect(block.color).toBe(GAME_CONFIG.COLORS.BLOCKS[row]);
            }
        });
    });
    
    describe('getActiveBlocks メソッド', () => {
        beforeEach(() => {
            blockManager.initializeBlocks();
        });
        
        test('初期状態では全ブロックがアクティブ', () => {
            const activeBlocks = blockManager.getActiveBlocks();
            expect(activeBlocks.length).toBe(blockManager.totalBlocks);
        });
        
        test('破壊されたブロックは除外される', () => {
            blockManager.blocks[0].destroy();
            blockManager.blocks[1].destroy();
            
            const activeBlocks = blockManager.getActiveBlocks();
            expect(activeBlocks.length).toBe(blockManager.totalBlocks - 2);
        });
    });
    
    describe('areAllBlocksDestroyed メソッド', () => {
        beforeEach(() => {
            blockManager.initializeBlocks();
        });
        
        test('初期状態ではfalseを返す', () => {
            expect(blockManager.areAllBlocksDestroyed()).toBe(false);
        });
        
        test('全ブロック破壊後はtrueを返す', () => {
            blockManager.blocks.forEach(block => block.destroy());
            expect(blockManager.areAllBlocksDestroyed()).toBe(true);
        });
        
        test('一部のブロックが残っている場合はfalseを返す', () => {
            // 最後の1つを除いて全て破壊
            for (let i = 0; i < blockManager.blocks.length - 1; i++) {
                blockManager.blocks[i].destroy();
            }
            expect(blockManager.areAllBlocksDestroyed()).toBe(false);
        });
    });
    
    describe('getStats メソッド', () => {
        beforeEach(() => {
            blockManager.initializeBlocks();
        });
        
        test('初期状態の統計を正しく返す', () => {
            const stats = blockManager.getStats();
            expect(stats.total).toBe(blockManager.totalBlocks);
            expect(stats.active).toBe(blockManager.totalBlocks);
            expect(stats.destroyed).toBe(0);
            expect(stats.percentage).toBe(0);
        });
        
        test('一部破壊後の統計を正しく返す', () => {
            const destroyCount = 5;
            for (let i = 0; i < destroyCount; i++) {
                blockManager.blocks[i].destroy();
            }
            
            const stats = blockManager.getStats();
            expect(stats.total).toBe(blockManager.totalBlocks);
            expect(stats.active).toBe(blockManager.totalBlocks - destroyCount);
            expect(stats.destroyed).toBe(destroyCount);
            expect(stats.percentage).toBe(Math.round((destroyCount / blockManager.totalBlocks) * 100));
        });
    });
    
    describe('resetAll メソッド', () => {
        beforeEach(() => {
            blockManager.initializeBlocks();
        });
        
        test('全ブロックの破壊状態をリセットする', () => {
            // いくつかのブロックを破壊
            blockManager.blocks[0].destroy();
            blockManager.blocks[1].destroy();
            blockManager.blocks[2].destroy();
            
            expect(blockManager.getActiveBlocks().length).toBeLessThan(blockManager.totalBlocks);
            
            // リセット実行
            blockManager.resetAll();
            
            expect(blockManager.getActiveBlocks().length).toBe(blockManager.totalBlocks);
            expect(blockManager.areAllBlocksDestroyed()).toBe(false);
        });
    });
    
    describe('getBlockAt メソッド', () => {
        beforeEach(() => {
            blockManager.initializeBlocks();
        });
        
        test('指定位置のブロックを正しく取得する', () => {
            const firstBlock = blockManager.blocks[0];
            const centerX = firstBlock.x + firstBlock.width / 2;
            const centerY = firstBlock.y + firstBlock.height / 2;
            
            const foundBlock = blockManager.getBlockAt(centerX, centerY);
            expect(foundBlock).toBe(firstBlock);
        });
        
        test('ブロックが無い位置ではundefinedを返す', () => {
            const foundBlock = blockManager.getBlockAt(0, 0);
            expect(foundBlock).toBeUndefined();
        });
        
        test('破壊されたブロックは取得されない', () => {
            const firstBlock = blockManager.blocks[0];
            const centerX = firstBlock.x + firstBlock.width / 2;
            const centerY = firstBlock.y + firstBlock.height / 2;
            
            firstBlock.destroy();
            
            const foundBlock = blockManager.getBlockAt(centerX, centerY);
            expect(foundBlock).toBeUndefined();
        });
    });
    
    describe('renderAll メソッド', () => {
        beforeEach(() => {
            blockManager.initializeBlocks();
        });
        
        test('contextが無い場合はエラーを投げる', () => {
            expect(() => {
                blockManager.renderAll(null);
            }).toThrow('Canvas context is required for rendering');
        });
        
        test('全ブロックの描画メソッドが呼ばれる', () => {
            // ブロックのrenderメソッドをスパイ
            const renderSpies = blockManager.blocks.map(block => 
                jest.spyOn(block, 'render')
            );
            
            blockManager.renderAll(mockCtx);
            
            renderSpies.forEach(spy => {
                expect(spy).toHaveBeenCalledWith(mockCtx);
            });
        });
    });
});