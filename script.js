// ゲーム定数
const GAME_CONFIG = {
    // キャンバス設定
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    
    // パドル設定
    PADDLE_WIDTH: 100,
    PADDLE_HEIGHT: 20,
    PADDLE_SPEED: 7, // 8から7に調整（より精密な操作）
    PADDLE_Y_OFFSET: 50, // 画面下端からの距離
    
    // ボール設定
    BALL_RADIUS: 10,
    BALL_SPEED: 4.5, // 5から4.5に調整（より遊びやすく）
    BALL_SPEED_INCREMENT: 0.2, // ボール速度の段階的増加
    BALL_MAX_SPEED: 8, // 最大速度制限
    BALL_INITIAL_ANGLE: -Math.PI / 4, // 初期角度（45度上向き）
    
    // ブロック設定
    BLOCK_WIDTH: 75,
    BLOCK_HEIGHT: 20,
    BLOCK_ROWS: 5,
    BLOCK_COLS: 10,
    BLOCK_PADDING: 5,
    BLOCK_TOP_MARGIN: 60, // 画面上端からの距離
    BLOCK_SIDE_MARGIN: 35, // 画面左右端からの距離
    
    // スコア設定
    POINTS_PER_BLOCK: 10,
    COMBO_MULTIPLIER: 1.5, // コンボボーナス倍率
    ROW_BONUS_MULTIPLIER: 2, // 上位行ボーナス倍率
    
    // 色設定（改善されたカラーパレット）
    COLORS: {
        BACKGROUND: '#0a0a0a',
        PADDLE: '#ffffff',
        BALL: '#ffffff',
        BALL_TRAIL: '#ffffff80', // ボールの軌跡用
        BLOCKS: [
            '#ff4444', // 赤（より鮮やか）
            '#ff8844', // オレンジ
            '#ffdd44', // 黄色
            '#44ff44', // 緑
            '#4488ff'  // 青
        ],
        BLOCK_BORDERS: '#ffffff40', // ブロック境界線
        TEXT: '#ffffff',
        TEXT_SHADOW: '#000000',
        SCORE_HIGHLIGHT: '#ffff00',
        ERROR: '#ff0000',
        SUCCESS: '#00ff00',
        WARNING: '#ffaa00'
    },
    
    // ゲーム設定
    FPS: 60,
    FRAME_TIME: 1000 / 60, // ミリ秒
    
    // 難易度調整
    DIFFICULTY: {
        EASY: {
            BALL_SPEED: 3.5,
            PADDLE_SPEED: 8,
            BALL_SPEED_INCREMENT: 0.1
        },
        NORMAL: {
            BALL_SPEED: 4.5,
            PADDLE_SPEED: 7,
            BALL_SPEED_INCREMENT: 0.2
        },
        HARD: {
            BALL_SPEED: 6,
            PADDLE_SPEED: 6,
            BALL_SPEED_INCREMENT: 0.3
        }
    },
    
    // エフェクト設定
    EFFECTS: {
        BALL_TRAIL_LENGTH: 5, // ボールの軌跡の長さ
        PARTICLE_COUNT: 8, // パーティクル数
        SHAKE_INTENSITY: 3, // 画面振動の強さ
        FLASH_DURATION: 200 // フラッシュエフェクトの持続時間
    }
};

// ゲーム状態列挙型
const GameState = {
    PLAYING: 'playing',
    GAME_OVER: 'game_over',
    GAME_WIN: 'game_win',
    PAUSED: 'paused'
};

// グローバル変数
let canvas;
let ctx;
let game;
let inputHandler;

// DOM読み込み完了時の初期化
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Game初期化
        game = new Game();
        
        if (!game.init()) {
            console.error('Game initialization failed');
            return;
        }
        
        // グローバル変数に設定（後方互換性のため）
        canvas = game.canvas;
        ctx = game.ctx;
        inputHandler = game.inputHandler;
        
        // ゲーム開始
        game.startGame();
        
        console.log('Game started successfully');
        console.log('Game debug info:', game.getDebugInfo());
        
    } catch (error) {
        CanvasManager.handleError('初期化中にエラーが発生しました', error);
    }
});

// 初期画面の描画
function drawInitialScreen() {
    try {
        CanvasManager.validate();
        
        // 背景をクリア
        CanvasManager.clear();
        
        // Ball クラスのテスト描画
        testBallClass();
        
        // Paddle クラスのテスト描画
        testPaddleClass();
        
        // Block クラスのテスト描画
        testBlockClass();
        
        // 初期化完了メッセージ
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ゲーム初期化完了', canvas.width / 2, canvas.height / 2 - 100);
        ctx.fillText('Ball, Paddle & Block クラステスト中...', canvas.width / 2, canvas.height / 2 - 60);
        
        // 設定情報の表示
        ctx.font = '14px Arial';
        ctx.fillStyle = '#ccc';
        ctx.fillText(`Canvas: ${GAME_CONFIG.CANVAS_WIDTH}x${GAME_CONFIG.CANVAS_HEIGHT}`, canvas.width / 2, canvas.height / 2 + 80);
        
    } catch (error) {
        CanvasManager.handleError('初期画面描画エラー', error);
    }
}

// Ball クラスの視覚的テスト
function testBallClass() {
    try {
        // 複数のボールを作成してテスト
        const balls = [
            new Ball(100, 100),
            new Ball(200, 150),
            new Ball(300, 200),
            new Ball(), // デフォルト位置
        ];
        
        // 各ボールを描画
        balls.forEach((ball, index) => {
            ball.render(ctx);
            
            // ボール情報を表示
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`Ball ${index + 1}: (${Math.round(ball.x)}, ${Math.round(ball.y)})`, 10, 20 + index * 15);
        });
        
        // 速度反転テスト
        const testBall = new Ball(500, 300);
        testBall.reverseX();
        testBall.reverseY();
        testBall.render(ctx);
        
        ctx.fillStyle = '#ff0';
        ctx.fillText('Reversed Ball', 450, 280);
        
        console.log('Ball class visual test completed successfully');
        
    } catch (error) {
        console.error('Ball class test failed:', error);
        CanvasManager.handleError('Ball クラステストエラー', error);
    }
}

// Paddle クラスの視覚的テスト
function testPaddleClass() {
    try {
        // 複数のパドルを作成してテスト
        const paddles = [
            new Paddle(), // デフォルト位置（画面下部中央）
            new Paddle(50, 400), // 左寄り
            new Paddle(600, 450), // 右寄り
            new Paddle(0, 500), // 左端
            new Paddle(GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH, 350), // 右端
        ];
        
        // 各パドルを描画
        paddles.forEach((paddle, index) => {
            paddle.render(ctx);
            
            // パドル情報を表示
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            const info = `Paddle ${index + 1}: (${Math.round(paddle.x)}, ${Math.round(paddle.y)}) ${paddle.width}x${paddle.height}`;
            ctx.fillText(info, 10, 120 + index * 15);
        });
        
        // 境界テスト用パドル
        const boundaryTestPaddle = new Paddle();
        
        // 左境界テスト
        boundaryTestPaddle.setPosition(-50, 250); // 画面外に設定
        boundaryTestPaddle.render(ctx);
        ctx.fillStyle = '#f0f';
        ctx.fillText('Left Boundary Test', boundaryTestPaddle.x + 5, boundaryTestPaddle.y - 5);
        
        // 右境界テスト
        const rightTestPaddle = new Paddle();
        rightTestPaddle.setPosition(GAME_CONFIG.CANVAS_WIDTH + 50, 200); // 画面外に設定
        rightTestPaddle.render(ctx);
        ctx.fillStyle = '#f0f';
        ctx.fillText('Right Boundary Test', rightTestPaddle.x - 100, rightTestPaddle.y - 5);
        
        // 移動テスト
        const moveTestPaddle = new Paddle(300, 150);
        moveTestPaddle.moveLeft();
        moveTestPaddle.moveLeft();
        moveTestPaddle.moveRight();
        moveTestPaddle.render(ctx);
        ctx.fillStyle = '#0f0';
        ctx.fillText('Move Test Paddle', moveTestPaddle.x, moveTestPaddle.y - 5);
        
        console.log('Paddle class visual test completed successfully');
        
    } catch (error) {
        console.error('Paddle class test failed:', error);
        CanvasManager.handleError('Paddle クラステストエラー', error);
    }
}

// Block クラスの視覚的テスト
function testBlockClass() {
    try {
        // 個別ブロックのテスト
        const testBlocks = [
            new Block(50, 50, 0),   // 赤
            new Block(150, 50, 1),  // オレンジ
            new Block(250, 50, 2),  // 黄
            new Block(350, 50, 3),  // 緑
            new Block(450, 50, 4),  // 青
        ];
        
        // 各ブロックを描画
        testBlocks.forEach((block, index) => {
            block.render(ctx);
            
            // ブロック情報を表示
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`B${index + 1}`, block.x + block.width / 2, block.y + block.height + 12);
        });
        
        // 破壊テスト用ブロック
        const destroyTestBlock = new Block(550, 50, 0);
        destroyTestBlock.render(ctx);
        const points = destroyTestBlock.destroy(); // 破壊
        
        ctx.fillStyle = '#f00';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Destroyed (+${points}pts)`, 550, 40);
        
        // 破壊後は描画されないことを確認
        destroyTestBlock.render(ctx); // 何も描画されないはず
        
        // BlockManager のテスト
        const blockManager = new BlockManager();
        blockManager.initializeBlocks();
        
        // 一部のブロックを破壊してテスト
        const blocks = blockManager.getActiveBlocks();
        if (blocks.length > 0) {
            blocks[0].destroy();
            blocks[1].destroy();
            blocks[2].destroy();
        }
        
        // 統計情報を表示
        const stats = blockManager.getStats();
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Block Stats: ${stats.destroyed}/${stats.total} destroyed (${stats.percentage}%)`, 10, 200);
        ctx.fillText(`Active blocks: ${stats.active}`, 10, 215);
        ctx.fillText(`All destroyed: ${blockManager.areAllBlocksDestroyed() ? 'Yes' : 'No'}`, 10, 230);
        
        // ブロック配列の一部を描画（上部に小さく）
        ctx.save();
        ctx.scale(0.3, 0.3); // 縮小して描画
        ctx.translate(0, -150);
        blockManager.renderAll(ctx);
        ctx.restore();
        
        ctx.fillStyle = '#ccc';
        ctx.font = '10px Arial';
        ctx.fillText('Full block array (scaled)', 10, 95);
        
        console.log('Block class visual test completed successfully');
        console.log('Block stats:', stats);
        
    } catch (error) {
        console.error('Block class test failed:', error);
        CanvasManager.handleError('Block クラステストエラー', error);
    }
}

// ユーティリティ関数
const Utils = {
    // 数値を指定範囲内にクランプ
    clamp: function(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    // 2つの矩形の衝突判定
    rectIntersect: function(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    // 距離計算
    distance: function(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    // 角度をラジアンに変換
    toRadians: function(degrees) {
        return degrees * (Math.PI / 180);
    },
    
    // ランダムな整数を生成
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // ランダムな浮動小数点数を生成
    randomFloat: function(min, max) {
        return Math.random() * (max - min) + min;
    }
};

// Canvas初期化とエラーハンドリング
const CanvasManager = {
    canvas: null,
    ctx: null,
    
    // Canvas初期化
    init: function() {
        try {
            this.canvas = document.getElementById('gameCanvas');
            
            if (!this.canvas) {
                throw new Error('Canvas element with id "gameCanvas" not found');
            }
            
            // Canvasサイズを設定
            this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
            this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
            
            this.ctx = this.canvas.getContext('2d');
            
            if (!this.ctx) {
                throw new Error('2D rendering context not supported');
            }
            
            // Canvas設定の最適化
            this.ctx.imageSmoothingEnabled = false; // ピクセルアートに適した設定
            
            console.log('Canvas initialized successfully');
            console.log('Canvas size:', this.canvas.width, 'x', this.canvas.height);
            
            return true;
            
        } catch (error) {
            this.handleError('Canvas初期化エラー', error);
            return false;
        }
    },
    
    // 画面クリア
    clear: function() {
        if (this.ctx) {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },
    
    // エラーハンドリング
    handleError: function(message, error) {
        console.error(message, error);
        
        // エラーメッセージを画面に表示
        if (this.ctx) {
            this.clear();
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('エラーが発生しました', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2 + 10);
            this.ctx.font = '14px Arial';
            this.ctx.fillText('ページを再読み込みしてください', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
        
        // コンソールにも詳細を出力
        if (error) {
            console.error('Error details:', error);
        }
    },
    
    // Canvas状態の検証
    validate: function() {
        if (!this.canvas) {
            throw new Error('Canvas not initialized');
        }
        if (!this.ctx) {
            throw new Error('Canvas context not available');
        }
        
        // Canvas サイズの検証
        if (this.canvas.width <= 0 || this.canvas.height <= 0) {
            throw new Error('Invalid canvas dimensions');
        }
        
        return true;
    },
    
    // 安全な描画実行
    safeRender: function(renderFunction, context, ...args) {
        try {
            this.validate();
            return renderFunction.call(context, this.ctx, ...args);
        } catch (error) {
            console.error('Render error:', error);
            this.handleError('描画エラー', error);
            return false;
        }
    }
};

// Ball クラス
class Ball {
    constructor(x, y) {
        // 位置
        this.x = x || GAME_CONFIG.CANVAS_WIDTH / 2;
        this.y = y || GAME_CONFIG.CANVAS_HEIGHT / 2;
        
        // 速度（初期角度を使用）
        this.speed = GAME_CONFIG.BALL_SPEED;
        this.dx = this.speed * Math.cos(GAME_CONFIG.BALL_INITIAL_ANGLE);
        this.dy = this.speed * Math.sin(GAME_CONFIG.BALL_INITIAL_ANGLE);
        
        // サイズ
        this.radius = GAME_CONFIG.BALL_RADIUS;
        
        // 色
        this.color = GAME_CONFIG.COLORS.BALL;
        
        // エフェクト用の軌跡
        this.trail = [];
        this.maxTrailLength = GAME_CONFIG.EFFECTS.BALL_TRAIL_LENGTH;
        
        // パーティクルエフェクト
        this.particles = [];
    }
    
    // 位置更新
    update() {
        try {
            // 速度の妥当性チェック
            if (!isFinite(this.dx) || !isFinite(this.dy)) {
                console.warn('Invalid ball velocity detected, resetting');
                this.reset();
                return;
            }
            
            // 軌跡を記録
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }
            
            this.x += this.dx;
            this.y += this.dy;
            
            // 位置の妥当性チェック
            if (!isFinite(this.x) || !isFinite(this.y)) {
                console.warn('Invalid ball position detected, resetting');
                this.reset();
                return;
            }
            
            // パーティクルの更新
            this.updateParticles();
        } catch (error) {
            console.error('Ball update error:', error);
            this.reset();
        }
    }
    
    // パーティクルの更新
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            particle.alpha = particle.life;
            return particle.life > 0;
        });
    }
    
    // パーティクルエフェクトを追加
    addParticles() {
        for (let i = 0; i < GAME_CONFIG.EFFECTS.PARTICLE_COUNT; i++) {
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1,
                alpha: 1,
                color: GAME_CONFIG.COLORS.BALL
            });
        }
    }
    
    // 描画
    render(ctx) {
        if (!ctx) {
            throw new Error('Canvas context is required for rendering');
        }
        
        // 軌跡を描画
        this.renderTrail(ctx);
        
        // パーティクルを描画
        this.renderParticles(ctx);
        
        // ボール本体を描画（グラデーション効果）
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.7, '#cccccc');
        gradient.addColorStop(1, '#888888');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // ボールの輪郭
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // 軌跡を描画
    renderTrail(ctx) {
        if (this.trail.length < 2) return;
        
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        for (let i = 0; i < this.trail.length - 1; i++) {
            const alpha = (i + 1) / this.trail.length * 0.3;
            const size = (i + 1) / this.trail.length * this.radius * 0.5;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // パーティクルを描画
    renderParticles(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        this.particles.forEach(particle => {
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    // X方向の速度反転
    reverseX() {
        this.dx = -this.dx;
        this.addParticles(); // エフェクト追加
    }
    
    // Y方向の速度反転
    reverseY() {
        this.dy = -this.dy;
        this.addParticles(); // エフェクト追加
    }
    
    // 初期位置にリセット
    reset() {
        this.x = GAME_CONFIG.CANVAS_WIDTH / 2;
        this.y = GAME_CONFIG.CANVAS_HEIGHT / 2;
        this.dx = this.speed * Math.cos(GAME_CONFIG.BALL_INITIAL_ANGLE);
        this.dy = this.speed * Math.sin(GAME_CONFIG.BALL_INITIAL_ANGLE);
    }
    
    // 境界矩形取得（衝突検出用）
    getBounds() {
        return {
            x: this.x - this.radius,
            y: this.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }
    
    // 中心座標取得
    getCenter() {
        return {
            x: this.x,
            y: this.y
        };
    }
    
    // 速度設定（角度指定）
    setVelocityFromAngle(angle, speed = this.speed) {
        this.speed = speed;
        this.dx = speed * Math.cos(angle);
        this.dy = speed * Math.sin(angle);
    }
    
    // 現在の速度を取得
    getVelocity() {
        return {
            dx: this.dx,
            dy: this.dy,
            speed: Math.sqrt(this.dx * this.dx + this.dy * this.dy)
        };
    }
}

// Paddle クラス
class Paddle {
    constructor(x, y) {
        // 位置（デフォルトは画面下部中央）
        this.x = x !== undefined ? x : (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH) / 2;
        this.y = y !== undefined ? y : GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE_Y_OFFSET;
        
        // サイズ
        this.width = GAME_CONFIG.PADDLE_WIDTH;
        this.height = GAME_CONFIG.PADDLE_HEIGHT;
        
        // 移動速度
        this.speed = GAME_CONFIG.PADDLE_SPEED;
        
        // 色
        this.color = GAME_CONFIG.COLORS.PADDLE;
        
        // 境界制限用の最小・最大X座標
        this.minX = 0;
        this.maxX = GAME_CONFIG.CANVAS_WIDTH - this.width;
    }
    
    // 位置更新
    update() {
        // 境界制限を適用
        this.x = Utils.clamp(this.x, this.minX, this.maxX);
    }
    
    // 描画
    render(ctx) {
        if (!ctx) {
            throw new Error('Canvas context is required for rendering');
        }
        
        // グラデーション効果でパドルを描画
        const gradient = ctx.createLinearGradient(
            this.x, this.y, this.x, this.y + this.height
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#cccccc');
        gradient.addColorStop(1, '#888888');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // ハイライト効果
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x, this.y, this.width, 2);
        
        // 境界線
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // 中央のライン（デザイン要素）
        ctx.strokeStyle = '#aaaaaa';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height - 2);
        ctx.stroke();
    }
    
    // 左移動
    moveLeft() {
        this.x -= this.speed;
        // 境界制限を即座に適用
        if (this.x < this.minX) {
            this.x = this.minX;
        }
    }
    
    // 右移動
    moveRight() {
        this.x += this.speed;
        // 境界制限を即座に適用
        if (this.x > this.maxX) {
            this.x = this.maxX;
        }
    }
    
    // 境界矩形取得（衝突検出用）
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    // 中心座標取得
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
    
    // 初期位置にリセット
    reset() {
        this.x = (GAME_CONFIG.CANVAS_WIDTH - this.width) / 2;
        this.y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE_Y_OFFSET;
    }
    
    // 指定位置に移動（境界制限付き）
    setPosition(x, y) {
        if (x !== undefined) {
            this.x = Utils.clamp(x, this.minX, this.maxX);
        }
        if (y !== undefined) {
            this.y = y;
        }
    }
    
    // パドルが画面左端にいるかチェック
    isAtLeftBoundary() {
        return this.x <= this.minX;
    }
    
    // パドルが画面右端にいるかチェック
    isAtRightBoundary() {
        return this.x >= this.maxX;
    }
}

// Block クラス
class Block {
    constructor(x, y, colorIndex = 0) {
        // 位置
        this.x = x || 0;
        this.y = y || 0;
        
        // サイズ
        this.width = GAME_CONFIG.BLOCK_WIDTH;
        this.height = GAME_CONFIG.BLOCK_HEIGHT;
        
        // 破壊状態
        this.destroyed = false;
        
        // 色（行に応じて異なる色を使用）
        this.colorIndex = colorIndex;
        this.color = GAME_CONFIG.COLORS.BLOCKS[colorIndex % GAME_CONFIG.COLORS.BLOCKS.length];
        
        // スコア値
        this.points = GAME_CONFIG.POINTS_PER_BLOCK;
    }
    
    // 描画
    render(ctx) {
        if (!ctx) {
            throw new Error('Canvas context is required for rendering');
        }
        
        // 破壊されたブロックは描画しない
        if (this.destroyed) {
            return;
        }
        
        // グラデーション効果でブロックを描画
        const gradient = ctx.createLinearGradient(
            this.x, this.y, this.x, this.y + this.height
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 0.3));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // ハイライト効果
        ctx.fillStyle = this.lightenColor(this.color, 0.3);
        ctx.fillRect(this.x, this.y, this.width, 2);
        ctx.fillRect(this.x, this.y, 2, this.height);
        
        // ブロックの境界線を描画（立体感を出すため）
        ctx.strokeStyle = GAME_CONFIG.COLORS.BLOCK_BORDERS;
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    
    // 色を暗くする
    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - factor));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - factor));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - factor));
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
    
    // 色を明るくする
    lightenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + (255 * factor));
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + (255 * factor));
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + (255 * factor));
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
    
    // ブロックを破壊
    destroy() {
        if (!this.destroyed) {
            this.destroyed = true;
            return this.points; // 破壊時にスコアを返す
        }
        return 0; // 既に破壊済みの場合は0を返す
    }
    
    // 境界矩形取得（衝突検出用）
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    // 中心座標取得
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
    
    // ブロックが破壊されているかチェック
    isDestroyed() {
        return this.destroyed;
    }
    
    // ブロックをリセット（破壊状態を元に戻す）
    reset() {
        this.destroyed = false;
    }
}

// BlockManager クラス - ブロック配列の管理
class BlockManager {
    constructor() {
        this.blocks = [];
        this.totalBlocks = 0;
        this.destroyedBlocks = 0;
    }
    
    // ブロック配列の初期化
    initializeBlocks() {
        this.blocks = [];
        this.totalBlocks = 0;
        this.destroyedBlocks = 0;
        
        // ブロック配置の計算
        const startX = GAME_CONFIG.BLOCK_SIDE_MARGIN;
        const startY = GAME_CONFIG.BLOCK_TOP_MARGIN;
        
        // 行と列のループでブロックを配置
        for (let row = 0; row < GAME_CONFIG.BLOCK_ROWS; row++) {
            for (let col = 0; col < GAME_CONFIG.BLOCK_COLS; col++) {
                const x = startX + col * (GAME_CONFIG.BLOCK_WIDTH + GAME_CONFIG.BLOCK_PADDING);
                const y = startY + row * (GAME_CONFIG.BLOCK_HEIGHT + GAME_CONFIG.BLOCK_PADDING);
                
                // 行に応じて色を変える
                const colorIndex = row;
                const block = new Block(x, y, colorIndex);
                
                this.blocks.push(block);
                this.totalBlocks++;
            }
        }
        
        console.log(`Initialized ${this.totalBlocks} blocks in ${GAME_CONFIG.BLOCK_ROWS} rows and ${GAME_CONFIG.BLOCK_COLS} columns`);
        return this.blocks;
    }
    
    // 全ブロックを描画
    renderAll(ctx) {
        if (!ctx) {
            throw new Error('Canvas context is required for rendering');
        }
        
        this.blocks.forEach(block => {
            block.render(ctx);
        });
    }
    
    // 破壊されていないブロックを取得
    getActiveBlocks() {
        return this.blocks.filter(block => !block.isDestroyed());
    }
    
    // 全ブロックが破壊されたかチェック
    areAllBlocksDestroyed() {
        return this.getActiveBlocks().length === 0;
    }
    
    // ブロック数の統計を取得
    getStats() {
        const activeBlocks = this.getActiveBlocks();
        return {
            total: this.totalBlocks,
            active: activeBlocks.length,
            destroyed: this.totalBlocks - activeBlocks.length,
            percentage: this.totalBlocks > 0 ? Math.round(((this.totalBlocks - activeBlocks.length) / this.totalBlocks) * 100) : 0
        };
    }
    
    // 全ブロックをリセット
    resetAll() {
        this.blocks.forEach(block => {
            block.reset();
        });
        this.destroyedBlocks = 0;
    }
    
    // 指定した位置のブロックを取得
    getBlockAt(x, y) {
        return this.blocks.find(block => {
            if (block.isDestroyed()) return false;
            
            const bounds = block.getBounds();
            return x >= bounds.x && x <= bounds.x + bounds.width &&
                   y >= bounds.y && y <= bounds.y + bounds.height;
        });
    }
}

// InputHandler クラス - キーボード入力管理
class InputHandler {
    constructor() {
        // 押下中のキーを管理するSet
        this.keys = new Set();
        
        // イベントリスナーがバインドされているかのフラグ
        this.initialized = false;
        
        // キーマッピング定数
        this.KEY_CODES = {
            LEFT: 'ArrowLeft',
            RIGHT: 'ArrowRight',
            SPACE: ' ',
            ESCAPE: 'Escape',
            ENTER: 'Enter'
        };
    }
    
    // イベントリスナーの設定
    init() {
        if (this.initialized) {
            console.warn('InputHandler already initialized');
            return;
        }
        
        try {
            // キーダウンイベントリスナー
            document.addEventListener('keydown', this.handleKeyDown.bind(this));
            
            // キーアップイベントリスナー
            document.addEventListener('keyup', this.handleKeyUp.bind(this));
            
            // フォーカス喪失時のクリーンアップ
            window.addEventListener('blur', this.handleWindowBlur.bind(this));
            
            this.initialized = true;
            console.log('InputHandler initialized successfully');
            
        } catch (error) {
            console.error('InputHandler initialization failed:', error);
            throw error;
        }
    }
    
    // キー押下処理
    handleKeyDown(event) {
        try {
            // デフォルトの動作を防ぐ（矢印キーでのスクロールなど）
            if (this.isGameKey(event.key)) {
                event.preventDefault();
            }
            
            // キーを押下中セットに追加
            this.keys.add(event.key);
            
            // デバッグ用ログ
            console.log(`Key pressed: ${event.key}`);
            
        } catch (error) {
            console.error('Error in handleKeyDown:', error);
        }
    }
    
    // キー離上処理
    handleKeyUp(event) {
        try {
            // キーを押下中セットから削除
            this.keys.delete(event.key);
            
            // デバッグ用ログ
            console.log(`Key released: ${event.key}`);
            
        } catch (error) {
            console.error('Error in handleKeyUp:', error);
        }
    }
    
    // ウィンドウフォーカス喪失時の処理
    handleWindowBlur() {
        try {
            // 全てのキー状態をクリア
            this.keys.clear();
            console.log('Window lost focus, cleared all key states');
            
        } catch (error) {
            console.error('Error in handleWindowBlur:', error);
        }
    }
    
    // 指定したキーが押下中かチェック
    isKeyPressed(key) {
        return this.keys.has(key);
    }
    
    // 左矢印キーが押下中かチェック
    isLeftPressed() {
        return this.isKeyPressed(this.KEY_CODES.LEFT);
    }
    
    // 右矢印キーが押下中かチェック
    isRightPressed() {
        return this.isKeyPressed(this.KEY_CODES.RIGHT);
    }
    
    // スペースキーが押下中かチェック
    isSpacePressed() {
        return this.isKeyPressed(this.KEY_CODES.SPACE);
    }
    
    // エスケープキーが押下中かチェック
    isEscapePressed() {
        return this.isKeyPressed(this.KEY_CODES.ESCAPE);
    }
    
    // エンターキーが押下中かチェック
    isEnterPressed() {
        return this.isKeyPressed(this.KEY_CODES.ENTER);
    }
    
    // ゲームで使用するキーかどうかをチェック
    isGameKey(key) {
        return Object.values(this.KEY_CODES).includes(key);
    }
    
    // 現在押下中の全キーを取得
    getPressedKeys() {
        return Array.from(this.keys);
    }
    
    // キー状態をクリア
    clearKeys() {
        this.keys.clear();
    }
    
    // イベントリスナーを削除（クリーンアップ用）
    destroy() {
        if (!this.initialized) {
            return;
        }
        
        try {
            document.removeEventListener('keydown', this.handleKeyDown.bind(this));
            document.removeEventListener('keyup', this.handleKeyUp.bind(this));
            window.removeEventListener('blur', this.handleWindowBlur.bind(this));
            
            this.keys.clear();
            this.initialized = false;
            
            console.log('InputHandler destroyed successfully');
            
        } catch (error) {
            console.error('Error destroying InputHandler:', error);
        }
    }
    
    // デバッグ情報を取得
    getDebugInfo() {
        return {
            initialized: this.initialized,
            pressedKeys: this.getPressedKeys(),
            keyCount: this.keys.size,
            leftPressed: this.isLeftPressed(),
            rightPressed: this.isRightPressed(),
            spacePressed: this.isSpacePressed()
        };
    }
}

// InputHandler クラスの視覚的テスト
function testInputHandler() {
    try {
        if (!inputHandler) {
            console.error('InputHandler not initialized');
            return;
        }
        
        // InputHandler情報を画面に表示
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('InputHandler Test:', 10, 280);
        ctx.fillText('Press Arrow Keys or Space to test input', 10, 300);
        
        // リアルタイムでキー状態を表示する関数を設定
        const updateInputDisplay = () => {
            // 前の表示をクリア（部分的に）
            ctx.fillStyle = '#000';
            ctx.fillRect(10, 310, 400, 60);
            
            // 現在のキー状態を表示
            ctx.fillStyle = '#0f0';
            ctx.font = '12px Arial';
            
            const debugInfo = inputHandler.getDebugInfo();
            ctx.fillText(`Left: ${debugInfo.leftPressed ? 'PRESSED' : 'released'}`, 10, 325);
            ctx.fillText(`Right: ${debugInfo.rightPressed ? 'PRESSED' : 'released'}`, 120, 325);
            ctx.fillText(`Space: ${debugInfo.spacePressed ? 'PRESSED' : 'released'}`, 230, 325);
            
            ctx.fillText(`Active Keys: ${debugInfo.pressedKeys.join(', ') || 'none'}`, 10, 345);
            ctx.fillText(`Key Count: ${debugInfo.keyCount}`, 10, 365);
            
            // 継続的に更新
            requestAnimationFrame(updateInputDisplay);
        };
        
        // 初回表示開始
        updateInputDisplay();
        
        console.log('InputHandler visual test started');
        console.log('InputHandler debug info:', inputHandler.getDebugInfo());
        
    } catch (error) {
        console.error('InputHandler test failed:', error);
        CanvasManager.handleError('InputHandler テストエラー', error);
    }
}

// CollisionDetector クラス - 衝突検出管理
class CollisionDetector {
    constructor() {
        // 衝突検出の精度設定
        this.precision = 0.1;
    }
    
    // 矩形同士の衝突判定アルゴリズム
    rectIntersect(rect1, rect2) {
        if (!rect1 || !rect2) {
            return false;
        }
        
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    // ボールとパドルの衝突検出
    checkBallPaddleCollision(ball, paddle) {
        if (!ball || !paddle) {
            return false;
        }
        
        const ballBounds = ball.getBounds();
        const paddleBounds = paddle.getBounds();
        
        // 基本的な矩形衝突判定
        if (!this.rectIntersect(ballBounds, paddleBounds)) {
            return false;
        }
        
        // より詳細な円と矩形の衝突判定
        const ballCenter = ball.getCenter();
        const paddleCenter = paddle.getCenter();
        
        // ボールがパドルの上部に当たった場合のみ跳ね返す
        // ボールの中心がパドルの上半分にある場合、または上から来た場合
        if (ballCenter.y <= paddle.y + paddle.height) {
            // パドルのどの部分に当たったかで跳ね返し角度を調整
            const hitPosition = (ballCenter.x - paddle.x) / paddle.width; // 0-1の範囲
            const angle = this.calculatePaddleBounceAngle(hitPosition);
            
            return {
                collision: true,
                angle: angle,
                hitPosition: hitPosition
            };
        }
        
        return false;
    }
    
    // ボールとブロックの衝突検出
    checkBallBlockCollision(ball, block) {
        if (!ball || !block || block.isDestroyed()) {
            return false;
        }
        
        // 円と矩形の詳細衝突判定を使用
        const ballCenter = ball.getCenter();
        const blockBounds = block.getBounds();
        
        if (!this.circleRectCollision(ballCenter.x, ballCenter.y, ball.radius, blockBounds)) {
            return false;
        }
        
        // 衝突の詳細情報を計算
        const blockCenter = block.getCenter();
        
        // 衝突面を判定（上下左右のどの面に当たったか）
        const collisionSide = this.determineCollisionSide(ballCenter, blockBounds, ball.radius);
        
        return {
            collision: true,
            block: block,
            side: collisionSide,
            ballCenter: ballCenter,
            blockCenter: blockCenter
        };
    }
    
    // ボールと壁の衝突検出
    checkBallWallCollision(ball, canvasWidth, canvasHeight) {
        if (!ball) {
            return {
                left: false,
                right: false,
                top: false,
                bottom: false
            };
        }
        
        const ballCenter = ball.getCenter();
        const radius = ball.radius;
        
        return {
            left: ballCenter.x - radius <= 0,
            right: ballCenter.x + radius >= canvasWidth,
            top: ballCenter.y - radius <= 0,
            bottom: ballCenter.y + radius >= canvasHeight
        };
    }
    
    // パドルでの跳ね返し角度を計算
    calculatePaddleBounceAngle(hitPosition) {
        // hitPosition: 0 = 左端, 0.5 = 中央, 1 = 右端
        // 角度範囲: -60度 から +60度
        const maxAngle = Math.PI / 3; // 60度
        const minAngle = -Math.PI / 3; // -60度
        
        // 中央(0.5)で垂直上向き(-90度)、端で斜め
        const normalizedPosition = (hitPosition - 0.5) * 2; // -1 to 1の範囲に変換
        const angle = normalizedPosition * maxAngle;
        
        // 上向きの角度に調整（-90度を基準）
        return -Math.PI / 2 + angle;
    }
    
    // 衝突面を判定（ブロック衝突用）
    determineCollisionSide(ballCenter, blockBounds, ballRadius) {
        const blockCenterX = blockBounds.x + blockBounds.width / 2;
        const blockCenterY = blockBounds.y + blockBounds.height / 2;
        
        const dx = ballCenter.x - blockCenterX;
        const dy = ballCenter.y - blockCenterY;
        
        // ブロックの半分のサイズ
        const halfWidth = blockBounds.width / 2;
        const halfHeight = blockBounds.height / 2;
        
        // 衝突面を判定
        const overlapX = halfWidth + ballRadius - Math.abs(dx);
        const overlapY = halfHeight + ballRadius - Math.abs(dy);
        
        if (overlapX < overlapY) {
            // 左右の面に衝突
            return dx > 0 ? 'right' : 'left';
        } else {
            // 上下の面に衝突
            return dy > 0 ? 'bottom' : 'top';
        }
    }
    
    // 複数ブロックとの衝突検出
    checkBallBlocksCollision(ball, blocks) {
        if (!ball || !blocks || blocks.length === 0) {
            return null;
        }
        
        // アクティブなブロックのみをチェック
        const activeBlocks = blocks.filter(block => !block.isDestroyed());
        
        for (const block of activeBlocks) {
            const collision = this.checkBallBlockCollision(ball, block);
            if (collision && collision.collision) {
                return collision;
            }
        }
        
        return null;
    }
    
    // 点と矩形の衝突判定
    pointInRect(x, y, rect) {
        return x >= rect.x && 
               x <= rect.x + rect.width && 
               y >= rect.y && 
               y <= rect.y + rect.height;
    }
    
    // 円と矩形の詳細衝突判定
    circleRectCollision(circleX, circleY, radius, rect) {
        // 矩形の最も近い点を見つける
        const closestX = Math.max(rect.x, Math.min(circleX, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circleY, rect.y + rect.height));
        
        // 距離を計算
        const dx = circleX - closestX;
        const dy = circleY - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= radius;
    }
    
    // 衝突後のボール速度を計算
    calculateBounceVelocity(ball, collisionSide, angle = null) {
        const velocity = ball.getVelocity();
        
        if (angle !== null) {
            // パドル衝突の場合、指定された角度で跳ね返す
            ball.setVelocityFromAngle(angle, velocity.speed);
        } else {
            // 壁やブロック衝突の場合、面に応じて反転
            switch (collisionSide) {
                case 'left':
                case 'right':
                    ball.reverseX();
                    break;
                case 'top':
                case 'bottom':
                    ball.reverseY();
                    break;
            }
        }
    }
    
    // デバッグ用：衝突情報を取得
    getCollisionDebugInfo(ball, paddle, blocks, canvasWidth, canvasHeight) {
        const wallCollision = this.checkBallWallCollision(ball, canvasWidth, canvasHeight);
        const paddleCollision = this.checkBallPaddleCollision(ball, paddle);
        const blockCollision = this.checkBallBlocksCollision(ball, blocks);
        
        return {
            wall: wallCollision,
            paddle: paddleCollision,
            block: blockCollision,
            ballPosition: ball.getCenter(),
            ballVelocity: ball.getVelocity()
        };
    }
}

// Game クラス - ゲーム全体を管理するメインクラス
class Game {
    constructor() {
        // Canvas関連
        this.canvas = null;
        this.ctx = null;
        
        // ゲーム状態
        this.gameState = GameState.PLAYING;
        this.score = 0;
        this.combo = 0; // コンボカウンター
        
        // ゲーム要素
        this.ball = null;
        this.paddle = null;
        this.blocks = [];
        this.blockManager = null;
        
        // 入力・衝突検出
        this.inputHandler = null;
        this.collisionDetector = null;
        
        // ゲームループ関連
        this.animationId = null;
        this.lastFrameTime = 0;
        this.targetFPS = GAME_CONFIG.FPS;
        this.frameTime = GAME_CONFIG.FRAME_TIME;
        
        // パフォーマンス最適化
        this.skipFrames = 0;
        this.maxSkipFrames = 5;
        
        // エフェクト関連
        this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
        this.flashEffect = { active: false, color: '#ffffff', alpha: 0, duration: 0 };
        this.particles = [];
        
        // 初期化フラグ
        this.initialized = false;
    }
    
    // ゲームの初期化
    init() {
        try {
            console.log('Initializing game...');
            
            // Canvas初期化
            if (!CanvasManager.init()) {
                throw new Error('Canvas initialization failed');
            }
            
            this.canvas = CanvasManager.canvas;
            this.ctx = CanvasManager.ctx;
            
            // InputHandler初期化
            this.inputHandler = new InputHandler();
            this.inputHandler.init();
            
            // CollisionDetector初期化
            this.collisionDetector = new CollisionDetector();
            
            // ゲーム要素の初期化
            this.initializeGameElements();
            
            // ゲーム状態をリセット
            this.resetGame();
            
            this.initialized = true;
            console.log('Game initialized successfully');
            
            return true;
            
        } catch (error) {
            console.error('Game initialization failed:', error);
            CanvasManager.handleError('ゲーム初期化エラー', error);
            return false;
        }
    }
    
    // ゲーム要素の初期化
    initializeGameElements() {
        // Ball初期化
        this.ball = new Ball();
        
        // Paddle初期化
        this.paddle = new Paddle();
        
        // BlockManager初期化
        this.blockManager = new BlockManager();
        this.blocks = this.blockManager.initializeBlocks();
        
        console.log('Game elements initialized');
    }
    
    // メインゲームループ
    gameLoop(currentTime = 0) {
        try {
            // フレームレート制御
            if (currentTime - this.lastFrameTime < this.frameTime) {
                this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
                return;
            }
            
            this.lastFrameTime = currentTime;
            
            // ゲーム状態に応じた処理
            switch (this.gameState) {
                case GameState.PLAYING:
                    this.update();
                    this.render();
                    break;
                    
                case GameState.GAME_OVER:
                case GameState.GAME_WIN:
                    this.render(); // 終了画面の描画
                    this.handleGameEndInput();
                    break;
                    
                case GameState.PAUSED:
                    this.render(); // 一時停止画面の描画
                    this.handlePauseInput();
                    break;
            }
            
            // 次のフレームをスケジュール
            this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
            
        } catch (error) {
            console.error('Error in game loop:', error);
            this.stopGameLoop();
            CanvasManager.handleError('ゲームループエラー', error);
        }
    }
    
    // ゲーム状態の更新
    update() {
        if (!this.initialized || this.gameState !== GameState.PLAYING) {
            return;
        }
        
        // 入力処理（パドル移動）
        this.handleInput();
        
        // ボール位置更新
        this.ball.update();
        
        // パドル位置更新
        this.paddle.update();
        
        // 衝突検出と処理
        this.handleCollisions();
        
        // ゲーム終了条件チェック
        this.checkGameEndConditions();
    }
    
    // 画面描画
    render() {
        if (!this.ctx) {
            return;
        }
        
        // エフェクトの更新
        this.updateEffects();
        
        // 画面振動エフェクトの適用
        this.ctx.save();
        this.ctx.translate(this.screenShake.x, this.screenShake.y);
        
        // 画面クリアと背景描画
        this.clearScreenAndDrawBackground();
        
        // 全ゲーム要素の描画統合
        this.renderGameElements();
        
        // スコア表示機能
        this.renderUI();
        
        // ゲーム状態メッセージの表示
        this.renderGameStateMessage();
        
        this.ctx.restore();
        
        // フラッシュエフェクトの描画
        this.renderFlashEffect();
    }
    
    // フラッシュエフェクトの描画
    renderFlashEffect() {
        if (this.flashEffect.active) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'lighter';
            this.ctx.fillStyle = `${this.flashEffect.color}${Math.floor(this.flashEffect.alpha * 255).toString(16).padStart(2, '0')}`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
    }
    
    // 画面クリアと背景描画を実装
    clearScreenAndDrawBackground() {
        // 画面全体をクリア
        this.ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 背景パターンやグリッドを描画（オプション）
        this.drawBackgroundPattern();
    }
    
    // 背景パターンの描画（ゲームの視覚的向上のため）
    drawBackgroundPattern() {
        // 微細なドットパターンを描画してレトロな雰囲気を演出
        this.ctx.fillStyle = '#111111';
        for (let x = 0; x < this.canvas.width; x += 20) {
            for (let y = 0; y < this.canvas.height; y += 20) {
                this.ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    
    // 全ゲーム要素の描画統合を実装
    renderGameElements() {
        if (this.gameState === GameState.PLAYING || 
            this.gameState === GameState.GAME_OVER || 
            this.gameState === GameState.GAME_WIN) {
            
            // ゲーム境界線を描画
            this.drawGameBoundaries();
            
            // ブロック描画（最初に描画して背景に）
            if (this.blockManager) {
                this.blockManager.renderAll(this.ctx);
            }
            
            // パドル描画
            if (this.paddle) {
                this.paddle.render(this.ctx);
                // パドルの影効果を追加
                this.drawPaddleShadow();
            }
            
            // ボール描画（最後に描画して前景に）
            if (this.ball) {
                this.ball.render(this.ctx);
                // ボールの軌跡効果を追加
                this.drawBallTrail();
            }
        }
    }
    
    // ゲーム境界線の描画
    drawGameBoundaries() {
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(1, 1, this.canvas.width - 2, this.canvas.height - 2);
    }
    
    // パドルの影効果
    drawPaddleShadow() {
        if (this.paddle) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(
                this.paddle.x + 2, 
                this.paddle.y + 2, 
                this.paddle.width, 
                this.paddle.height
            );
        }
    }
    
    // ボールの軌跡効果
    drawBallTrail() {
        if (this.ball) {
            // 簡単な軌跡効果（前の位置に薄いボールを描画）
            const prevX = this.ball.x - this.ball.dx * 2;
            const prevY = this.ball.y - this.ball.dy * 2;
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(prevX, prevY, this.ball.radius * 0.8, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    // スコア表示機能を実装
    renderUI() {
        // スコア表示の背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(15, 10, 180, 35);
        
        // メインスコア表示（グラデーション効果）
        const gradient = this.ctx.createLinearGradient(20, 20, 20, 35);
        gradient.addColorStop(0, GAME_CONFIG.COLORS.SCORE_HIGHLIGHT);
        gradient.addColorStop(1, GAME_CONFIG.COLORS.TEXT);
        
        this.ctx.fillStyle = gradient;
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`スコア: ${this.score.toLocaleString()}`, 20, 35);
        
        // コンボ表示
        if (this.combo > 1) {
            this.ctx.fillStyle = GAME_CONFIG.COLORS.SCORE_HIGHLIGHT;
            this.ctx.font = 'bold 14px Arial';
            this.ctx.fillText(`コンボ x${this.combo}`, 20, 50);
        }
        
        // 残りブロック数表示の背景
        if (this.blockManager) {
            const stats = this.blockManager.getStats();
            const remainingText = `残り: ${stats.active}`;
            
            // テキスト幅を測定して背景サイズを調整
            this.ctx.font = '16px Arial';
            const textWidth = this.ctx.measureText(remainingText).width;
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(this.canvas.width - textWidth - 25, 10, textWidth + 20, 25);
            
            // 残りブロック数表示
            this.ctx.fillStyle = GAME_CONFIG.COLORS.TEXT;
            this.ctx.textAlign = 'right';
            this.ctx.fillText(remainingText, this.canvas.width - 15, 30);
            
            // 進捗バーの表示
            this.renderProgressBar(stats);
        }
        
        // ゲーム進行状況バー
        this.drawProgressBar();
        
        // FPS表示（デバッグ用）
        if (this.lastFrameTime > 0) {
            const fps = Math.round(1000 / this.frameTime);
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = '#666';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`FPS: ${fps}`, this.canvas.width - 20, this.canvas.height - 10);
        }
    }
    
    // 進捗バーの描画（ブロック破壊進捗）
    renderProgressBar(stats) {
        if (!stats || stats.total === 0) return;
        
        const barWidth = 200;
        const barHeight = 8;
        const barX = (this.canvas.width - barWidth) / 2;
        const barY = 55;
        
        // 進捗バーの背景
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 進捗バーの枠線
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // 進捗の表示
        const progress = stats.destroyed / stats.total;
        const progressWidth = barWidth * progress;
        
        // グラデーション効果
        const gradient = this.ctx.createLinearGradient(barX, barY, barX + progressWidth, barY);
        gradient.addColorStop(0, '#00ff00');
        gradient.addColorStop(0.5, '#ffff00');
        gradient.addColorStop(1, '#ff8800');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(barX, barY, progressWidth, barHeight);
        
        // 進捗パーセンテージの表示
        this.ctx.fillStyle = GAME_CONFIG.COLORS.TEXT;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${stats.percentage}%`, this.canvas.width / 2, barY + barHeight + 15);
    }
    
    // ゲーム進行状況バーの描画
    drawProgressBar() {
        if (this.blockManager) {
            const stats = this.blockManager.getStats();
            const progress = stats.total > 0 ? (stats.destroyed / stats.total) : 0;
            
            // プログレスバーの背景
            const barWidth = 200;
            const barHeight = 8;
            const barX = (this.canvas.width - barWidth) / 2;
            const barY = 15;
            
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // プログレスバーの進行部分
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
            
            // プログレスバーの枠線
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        }
    }
    
    // ゲーム状態メッセージの表示を実装
    renderGameStateMessage() {
        this.ctx.textAlign = 'center';
        
        switch (this.gameState) {
            case GameState.GAME_OVER:
                // 背景オーバーレイ
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // メインメッセージ
                this.ctx.fillStyle = '#ff0000';
                this.ctx.font = 'bold 48px Arial';
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 3;
                this.ctx.strokeText('ゲームオーバー', this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.fillText('ゲームオーバー', this.canvas.width / 2, this.canvas.height / 2);
                
                // サブメッセージ
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '24px Arial';
                this.ctx.fillText(`最終スコア: ${this.score.toLocaleString()}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
                this.ctx.fillText('スペースキーでリスタート', this.canvas.width / 2, this.canvas.height / 2 + 80);
                break;
                
            case GameState.GAME_WIN:
                // 背景オーバーレイ（勝利時は明るく）
                this.ctx.fillStyle = 'rgba(0, 50, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // メインメッセージ
                this.ctx.fillStyle = '#00ff00';
                this.ctx.font = 'bold 48px Arial';
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 3;
                this.ctx.strokeText('ゲームクリア！', this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.fillText('ゲームクリア！', this.canvas.width / 2, this.canvas.height / 2);
                
                // サブメッセージ
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '24px Arial';
                this.ctx.fillText(`最終スコア: ${this.score.toLocaleString()}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
                this.ctx.fillText('おめでとうございます！', this.canvas.width / 2, this.canvas.height / 2 + 80);
                this.ctx.fillText('スペースキーでリスタート', this.canvas.width / 2, this.canvas.height / 2 + 110);
                break;
                
            case GameState.PAUSED:
                // 背景オーバーレイ
                this.ctx.fillStyle = 'rgba(50, 50, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // メインメッセージ
                this.ctx.fillStyle = '#ffff00';
                this.ctx.font = 'bold 48px Arial';
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 3;
                this.ctx.strokeText('一時停止', this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.fillText('一時停止', this.canvas.width / 2, this.canvas.height / 2);
                
                // サブメッセージ
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '24px Arial';
                this.ctx.fillText('スペースキーで再開', this.canvas.width / 2, this.canvas.height / 2 + 50);
                this.ctx.fillText('ESCキーで一時停止', this.canvas.width / 2, this.canvas.height / 2 + 80);
                break;
                
            case GameState.PLAYING:
                // プレイ中は操作説明を軽く表示
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.font = '14px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('← → : パドル移動  ESC : 一時停止', this.canvas.width / 2, this.canvas.height - 20);
                break;
        }
    }
    
    // 衝突検出と処理の統合
    handleCollisions() {
        if (!this.collisionDetector || !this.ball || !this.paddle) {
            return;
        }
        
        // ボールと壁の衝突検出
        const wallCollision = this.collisionDetector.checkBallWallCollision(
            this.ball, 
            this.canvas.width, 
            this.canvas.height
        );
        
        // 左右の壁との衝突
        if (wallCollision.left || wallCollision.right) {
            this.ball.reverseX();
        }
        
        // 上の壁との衝突
        if (wallCollision.top) {
            this.ball.reverseY();
        }
        
        // 下の壁との衝突（ゲームオーバー条件）
        if (wallCollision.bottom) {
            this.handleGameOver();
            return; // ゲームオーバー時は他の衝突処理をスキップ
        }
        
        // ボールとパドルの衝突検出
        const paddleCollision = this.collisionDetector.checkBallPaddleCollision(this.ball, this.paddle);
        if (paddleCollision && paddleCollision.collision) {
            // パドルでの跳ね返し角度を適用
            this.collisionDetector.calculateBounceVelocity(this.ball, null, paddleCollision.angle);
        }
        
        // ボールとブロックの衝突検出
        if (this.blockManager) {
            const activeBlocks = this.blockManager.getActiveBlocks();
            const blockCollision = this.collisionDetector.checkBallBlocksCollision(this.ball, activeBlocks);
            
            if (blockCollision && blockCollision.collision) {
                // ブロックを破壊してスコア加算
                const points = this.calculateBlockScore(blockCollision.block);
                blockCollision.block.destroy();
                this.addScore(points);
                
                // エフェクト追加
                this.addScreenShake(GAME_CONFIG.EFFECTS.SHAKE_INTENSITY, 100);
                this.addFlashEffect('#ffffff', 0.2, 150);
                
                // ボールの速度を少し上げる（難易度調整）
                this.increaseBallSpeed();
                
                // ボールを跳ね返す
                this.collisionDetector.calculateBounceVelocity(this.ball, blockCollision.side);
            }
        }
    }
    
    // ゲーム終了条件のチェック
    checkGameEndConditions() {
        // 全ブロックが破壊されたかチェック（ゲームクリア）
        if (this.blockManager && this.blockManager.areAllBlocksDestroyed()) {
            this.handleGameWin();
            return;
        }
        
        // ボールが画面下端に到達した場合は handleCollisions() で処理済み
        // その他の終了条件があればここに追加
    }
    
    // 入力処理
    handleInput() {
        if (!this.inputHandler) {
            return;
        }
        
        // パドル移動
        if (this.inputHandler.isLeftPressed()) {
            this.paddle.moveLeft();
        }
        
        if (this.inputHandler.isRightPressed()) {
            this.paddle.moveRight();
        }
        
        // 一時停止
        if (this.inputHandler.isEscapePressed()) {
            this.pauseGame();
        }
    }
    
    // ゲーム終了時の入力処理
    handleGameEndInput() {
        if (!this.inputHandler) {
            return;
        }
        
        // スペースキーでリスタート（要件 5.4）
        if (this.inputHandler.isSpacePressed()) {
            console.log('Space key pressed - restarting game');
            this.resetGame();
            
            // キー状態をクリアして連続リセットを防ぐ
            setTimeout(() => {
                if (this.inputHandler) {
                    this.inputHandler.clearKeys();
                }
            }, 100);
        }
    }
    
    // 一時停止時の入力処理
    handlePauseInput() {
        if (!this.inputHandler) {
            return;
        }
        
        // スペースキーで再開
        if (this.inputHandler.isSpacePressed()) {
            this.resumeGame();
        }
    }
    
    // ゲームリセット
    resetGame() {
        try {
            console.log('Resetting game...');
            
            // ゲーム状態をリセット
            this.gameState = GameState.PLAYING;
            this.resetScore();
            this.resetCombo();
            
            // エフェクトをクリア
            this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
            this.flashEffect = { active: false, color: '#ffffff', alpha: 0, duration: 0 };
            this.particles = [];
            
            // 全ゲーム要素の初期化
            if (this.ball) {
                this.ball.reset();
                this.ball.trail = [];
                this.ball.particles = [];
                console.log('Ball reset to initial position');
            }
            
            if (this.paddle) {
                this.paddle.reset();
                console.log('Paddle reset to initial position');
            }
            
            if (this.blockManager) {
                this.blockManager.resetAll();
                this.blocks = this.blockManager.getActiveBlocks();
                console.log('All blocks reset to initial state');
            }
            
            // 入力状態をクリア（キーが押しっぱなしの状態を防ぐ）
            if (this.inputHandler) {
                this.inputHandler.clearKeys();
                console.log('Input state cleared');
            }
            
            console.log('Game reset completed successfully');
            console.log('Game state:', this.gameState);
            console.log('Score:', this.score);
            console.log('Active blocks:', this.blockManager ? this.blockManager.getStats().active : 0);
            
        } catch (error) {
            console.error('Error resetting game:', error);
            CanvasManager.handleError('ゲームリセットエラー', error);
        }
    }
    
    // ゲーム開始
    startGame() {
        if (!this.initialized) {
            console.error('Game not initialized');
            return false;
        }
        
        console.log('Starting game...');
        this.gameState = GameState.PLAYING;
        this.startGameLoop();
        return true;
    }
    
    // ゲームループ開始
    startGameLoop() {
        if (this.animationId) {
            this.stopGameLoop();
        }
        
        this.lastFrameTime = 0;
        this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
        console.log('Game loop started');
    }
    
    // ゲームループ停止
    stopGameLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            console.log('Game loop stopped');
        }
    }
    
    // ゲーム一時停止
    pauseGame() {
        if (this.gameState === GameState.PLAYING) {
            this.gameState = GameState.PAUSED;
            console.log('Game paused');
        }
    }
    
    // ゲーム再開
    resumeGame() {
        if (this.gameState === GameState.PAUSED) {
            this.gameState = GameState.PLAYING;
            console.log('Game resumed');
        }
    }
    
    // ゲームオーバー処理
    handleGameOver() {
        this.gameState = GameState.GAME_OVER;
        this.resetCombo(); // コンボリセット
        this.addScreenShake(GAME_CONFIG.EFFECTS.SHAKE_INTENSITY * 2, 500); // 強い振動
        this.addFlashEffect('#ff0000', 0.5, 800); // 赤いフラッシュ
        console.log('Game Over');
    }
    
    // ゲームクリア処理
    handleGameWin() {
        this.gameState = GameState.GAME_WIN;
        this.addFlashEffect('#00ff00', 0.7, 1000); // 緑のフラッシュ
        console.log('Game Win!');
    }
    
    // スコア加算
    addScore(points) {
        if (typeof points !== 'number' || points < 0) {
            console.warn('Invalid score points:', points);
            return;
        }
        
        const previousScore = this.score;
        this.combo++; // コンボ増加
        
        // コンボボーナス適用
        const comboBonus = Math.floor(points * (this.combo * 0.1));
        const totalPoints = points + comboBonus;
        
        this.score += totalPoints;
        
        console.log(`Score added: +${points} (combo +${comboBonus}), Total: ${this.score}`);
        
        // エフェクト追加
        if (comboBonus > 0) {
            this.addFlashEffect('#ffff00', 0.3, 300); // 黄色フラッシュ
        }
        
        // スコア変更イベントを発火（将来の拡張用）
        this.onScoreChanged(previousScore, this.score, totalPoints);
    }
    
    // 画面振動エフェクト
    addScreenShake(intensity, duration) {
        this.screenShake.intensity = Math.max(this.screenShake.intensity, intensity);
        this.screenShake.duration = Math.max(this.screenShake.duration, duration);
    }
    
    // フラッシュエフェクト
    addFlashEffect(color, alpha, duration) {
        this.flashEffect.active = true;
        this.flashEffect.color = color;
        this.flashEffect.alpha = alpha;
        this.flashEffect.duration = duration;
    }
    
    // エフェクトの更新
    updateEffects() {
        // 画面振動の更新
        if (this.screenShake.duration > 0) {
            this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity;
            this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity;
            this.screenShake.duration -= 16; // 約60FPSで減少
            
            if (this.screenShake.duration <= 0) {
                this.screenShake.x = 0;
                this.screenShake.y = 0;
                this.screenShake.intensity = 0;
            }
        }
        
        // フラッシュエフェクトの更新
        if (this.flashEffect.active) {
            this.flashEffect.duration -= 16;
            this.flashEffect.alpha *= 0.95; // フェードアウト
            
            if (this.flashEffect.duration <= 0 || this.flashEffect.alpha < 0.01) {
                this.flashEffect.active = false;
            }
        }
    }
    
    // スコア変更時のコールバック（拡張可能）
    onScoreChanged(previousScore, newScore, pointsAdded) {
        // 将来的にはハイスコア管理、アチーブメント、エフェクトなどを追加可能
        // 現在は基本的なログ出力のみ
        if (pointsAdded > 0) {
            console.log(`Score increased from ${previousScore} to ${newScore} (+${pointsAdded})`);
        }
    }
    
    // スコアリセット
    resetScore() {
        const previousScore = this.score;
        this.score = 0;
        console.log(`Score reset from ${previousScore} to 0`);
        this.onScoreChanged(previousScore, 0, 0);
    }
    
    // スコア計算ロジック（ブロックタイプ別）
    calculateBlockScore(block) {
        if (!block) {
            return 0;
        }
        
        // 基本スコア
        let baseScore = GAME_CONFIG.POINTS_PER_BLOCK;
        
        // ブロックの色（行）に応じてボーナススコア
        // 上の行ほど高得点（より難しいため）
        const rowBonus = (GAME_CONFIG.BLOCK_ROWS - block.colorIndex) * GAME_CONFIG.ROW_BONUS_MULTIPLIER;
        
        return baseScore + rowBonus;
    }
    
    // ボール速度の段階的増加
    increaseBallSpeed() {
        if (!this.ball) return;
        
        const currentSpeed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
        const newSpeed = Math.min(currentSpeed + GAME_CONFIG.BALL_SPEED_INCREMENT, GAME_CONFIG.BALL_MAX_SPEED);
        
        // 速度の比率を保持しながら増加
        const ratio = newSpeed / currentSpeed;
        this.ball.dx *= ratio;
        this.ball.dy *= ratio;
        
        console.log(`Ball speed increased to: ${newSpeed.toFixed(2)}`);
    }
    
    // コンボリセット
    resetCombo() {
        this.combo = 0;
    }
    
    // 現在のゲーム状態を取得
    getGameState() {
        return this.gameState;
    }
    
    // 現在のスコアを取得
    getScore() {
        return this.score;
    }
    
    // デバッグ情報を取得
    getDebugInfo() {
        return {
            initialized: this.initialized,
            gameState: this.gameState,
            score: this.score,
            combo: this.combo,
            animationId: this.animationId,
            ballPosition: this.ball ? this.ball.getCenter() : null,
            ballSpeed: this.ball ? Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy).toFixed(2) : 0,
            paddlePosition: this.paddle ? this.paddle.getBounds() : null,
            activeBlocks: this.blockManager ? this.blockManager.getStats().active : 0,
            effects: {
                screenShake: this.screenShake.duration > 0,
                flash: this.flashEffect.active,
                particles: this.particles.length
            },
            performance: this.performanceStats
        };
    }
    
    // パフォーマンス統計の更新
    updatePerformanceStats(frameTime, updateTime, renderTime) {
        this.performanceStats.frameTime = frameTime;
        this.performanceStats.updateTime = updateTime;
        this.performanceStats.renderTime = renderTime;
        this.performanceStats.fps = frameTime > 0 ? Math.round(1000 / frameTime) : 0;
    }
    
    // クリーンアップ
    destroy() {
        try {
            console.log('Destroying game...');
            
            // ゲームループ停止
            this.stopGameLoop();
            
            // InputHandler破棄
            if (this.inputHandler) {
                this.inputHandler.destroy();
            }
            
            // 状態リセット
            this.initialized = false;
            this.gameState = GameState.PLAYING;
            
            console.log('Game destroyed');
            
        } catch (error) {
            console.error('Error destroying game:', error);
        }
    }
}

// エラーハンドリング用ユーティリティ（後方互換性のため残す）
function handleError(message, error) {
    CanvasManager.handleError(message, error);
}

// Node.js環境でのモジュールエクスポート（テスト用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Game,
        GameState,
        Ball,
        Paddle,
        Block,
        BlockManager,
        InputHandler,
        CollisionDetector,
        CanvasManager,
        Utils,
        GAME_CONFIG
    };
}