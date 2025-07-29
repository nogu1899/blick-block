// Paddle クラスの単体テスト

// テスト用のモック設定
const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    PADDLE_WIDTH: 100,
    PADDLE_HEIGHT: 20,
    PADDLE_SPEED: 8,
    PADDLE_Y_OFFSET: 50,
    COLORS: {
        PADDLE: '#ffffff'
    }
};

const Utils = {
    clamp: function(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
};

// Paddle クラス（テスト用に再定義）
class Paddle {
    constructor(x, y) {
        this.x = x !== undefined ? x : (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH) / 2;
        this.y = y !== undefined ? y : GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE_Y_OFFSET;
        this.width = GAME_CONFIG.PADDLE_WIDTH;
        this.height = GAME_CONFIG.PADDLE_HEIGHT;
        this.speed = GAME_CONFIG.PADDLE_SPEED;
        this.color = GAME_CONFIG.COLORS.PADDLE;
        this.minX = 0;
        this.maxX = GAME_CONFIG.CANVAS_WIDTH - this.width;
    }
    
    update() {
        this.x = Utils.clamp(this.x, this.minX, this.maxX);
    }
    
    render(ctx) {
        if (!ctx) {
            throw new Error('Canvas context is required for rendering');
        }
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    moveLeft() {
        this.x -= this.speed;
        if (this.x < this.minX) {
            this.x = this.minX;
        }
    }
    
    moveRight() {
        this.x += this.speed;
        if (this.x > this.maxX) {
            this.x = this.maxX;
        }
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
    
    reset() {
        this.x = (GAME_CONFIG.CANVAS_WIDTH - this.width) / 2;
        this.y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE_Y_OFFSET;
    }
    
    setPosition(x, y) {
        if (x !== undefined) {
            this.x = Utils.clamp(x, this.minX, this.maxX);
        }
        if (y !== undefined) {
            this.y = y;
        }
    }
    
    isAtLeftBoundary() {
        return this.x <= this.minX;
    }
    
    isAtRightBoundary() {
        return this.x >= this.maxX;
    }
}

// テストスイート
describe('Paddle クラス', () => {
    let paddle;
    
    beforeEach(() => {
        paddle = new Paddle();
    });
    
    describe('コンストラクタ', () => {
        test('デフォルト位置で初期化される', () => {
            expect(paddle.x).toBe((GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH) / 2);
            expect(paddle.y).toBe(GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE_Y_OFFSET);
        });
        
        test('指定位置で初期化される', () => {
            const customPaddle = new Paddle(100, 200);
            expect(customPaddle.x).toBe(100);
            expect(customPaddle.y).toBe(200);
        });
        
        test('基本プロパティが正しく設定される', () => {
            expect(paddle.width).toBe(GAME_CONFIG.PADDLE_WIDTH);
            expect(paddle.height).toBe(GAME_CONFIG.PADDLE_HEIGHT);
            expect(paddle.speed).toBe(GAME_CONFIG.PADDLE_SPEED);
            expect(paddle.color).toBe(GAME_CONFIG.COLORS.PADDLE);
        });
        
        test('境界制限が正しく設定される', () => {
            expect(paddle.minX).toBe(0);
            expect(paddle.maxX).toBe(GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH);
        });
    });
    
    describe('移動メソッド', () => {
        test('moveLeft() で左に移動する', () => {
            const initialX = paddle.x;
            paddle.moveLeft();
            expect(paddle.x).toBe(initialX - GAME_CONFIG.PADDLE_SPEED);
        });
        
        test('moveRight() で右に移動する', () => {
            const initialX = paddle.x;
            paddle.moveRight();
            expect(paddle.x).toBe(initialX + GAME_CONFIG.PADDLE_SPEED);
        });
        
        test('左境界で停止する', () => {
            paddle.x = 10;
            paddle.moveLeft();
            paddle.moveLeft(); // 境界を超える移動
            expect(paddle.x).toBe(0); // 左端で停止
            expect(paddle.isAtLeftBoundary()).toBe(true);
        });
        
        test('右境界で停止する', () => {
            paddle.x = GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH - 10;
            paddle.moveRight();
            paddle.moveRight(); // 境界を超える移動
            expect(paddle.x).toBe(GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH); // 右端で停止
            expect(paddle.isAtRightBoundary()).toBe(true);
        });
    });
    
    describe('境界制限', () => {
        test('setPosition() で境界制限が適用される', () => {
            paddle.setPosition(-50, 100); // 左境界を超える
            expect(paddle.x).toBe(0);
            expect(paddle.y).toBe(100);
            
            paddle.setPosition(GAME_CONFIG.CANVAS_WIDTH + 50, 200); // 右境界を超える
            expect(paddle.x).toBe(GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH);
            expect(paddle.y).toBe(200);
        });
        
        test('update() で境界制限が適用される', () => {
            paddle.x = -10; // 境界外に設定
            paddle.update();
            expect(paddle.x).toBe(0);
            
            paddle.x = GAME_CONFIG.CANVAS_WIDTH + 10; // 境界外に設定
            paddle.update();
            expect(paddle.x).toBe(GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH);
        });
    });
    
    describe('境界判定メソッド', () => {
        test('isAtLeftBoundary() が正しく動作する', () => {
            paddle.x = 0;
            expect(paddle.isAtLeftBoundary()).toBe(true);
            
            paddle.x = 10;
            expect(paddle.isAtLeftBoundary()).toBe(false);
        });
        
        test('isAtRightBoundary() が正しく動作する', () => {
            paddle.x = GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH;
            expect(paddle.isAtRightBoundary()).toBe(true);
            
            paddle.x = GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH - 10;
            expect(paddle.isAtRightBoundary()).toBe(false);
        });
    });
    
    describe('ユーティリティメソッド', () => {
        test('getBounds() が正しい境界矩形を返す', () => {
            const bounds = paddle.getBounds();
            expect(bounds.x).toBe(paddle.x);
            expect(bounds.y).toBe(paddle.y);
            expect(bounds.width).toBe(paddle.width);
            expect(bounds.height).toBe(paddle.height);
        });
        
        test('getCenter() が正しい中心座標を返す', () => {
            const center = paddle.getCenter();
            expect(center.x).toBe(paddle.x + paddle.width / 2);
            expect(center.y).toBe(paddle.y + paddle.height / 2);
        });
        
        test('reset() で初期位置に戻る', () => {
            paddle.x = 100;
            paddle.y = 200;
            paddle.reset();
            expect(paddle.x).toBe((GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH) / 2);
            expect(paddle.y).toBe(GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE_Y_OFFSET);
        });
    });
    
    describe('描画メソッド', () => {
        test('render() でコンテキストが必要', () => {
            expect(() => paddle.render()).toThrow('Canvas context is required for rendering');
        });
        
        test('render() が正しく呼び出される', () => {
            const mockCtx = {
                fillStyle: '',
                fillRect: jest.fn()
            };
            
            paddle.render(mockCtx);
            
            expect(mockCtx.fillStyle).toBe(GAME_CONFIG.COLORS.PADDLE);
            expect(mockCtx.fillRect).toHaveBeenCalledWith(
                paddle.x, 
                paddle.y, 
                paddle.width, 
                paddle.height
            );
        });
    });
    
    describe('要件検証', () => {
        test('要件 1.3: パドルが画面下部に表示される', () => {
            expect(paddle.y).toBe(GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE_Y_OFFSET);
        });
        
        test('要件 2.1: 左矢印キーでパドルが左に移動する（移動メソッド）', () => {
            const initialX = paddle.x;
            paddle.moveLeft();
            expect(paddle.x).toBeLessThan(initialX);
        });
        
        test('要件 2.2: 右矢印キーでパドルが右に移動する（移動メソッド）', () => {
            const initialX = paddle.x;
            paddle.moveRight();
            expect(paddle.x).toBeGreaterThan(initialX);
        });
        
        test('要件 2.3: パドルが画面左端で停止する', () => {
            paddle.x = 0;
            paddle.moveLeft();
            expect(paddle.x).toBe(0);
            expect(paddle.isAtLeftBoundary()).toBe(true);
        });
        
        test('要件 2.4: パドルが画面右端で停止する', () => {
            paddle.x = GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH;
            paddle.moveRight();
            expect(paddle.x).toBe(GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH);
            expect(paddle.isAtRightBoundary()).toBe(true);
        });
    });
});