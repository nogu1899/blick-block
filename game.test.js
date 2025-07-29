// Game クラスの単体テスト

// テスト用のDOM環境をセットアップ
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="gameCanvas"></canvas></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// script.jsを読み込み
require('./script.js');

describe('Game クラス', () => {
    let game;

    beforeEach(() => {
        // 各テスト前にGameインスタンスを作成
        game = new Game();
    });

    afterEach(() => {
        // 各テスト後にクリーンアップ
        if (game) {
            game.destroy();
        }
    });

    describe('コンストラクタ', () => {
        test('初期状態が正しく設定される', () => {
            expect(game.canvas).toBeNull();
            expect(game.ctx).toBeNull();
            expect(game.gameState).toBe(GameState.PLAYING);
            expect(game.score).toBe(0);
            expect(game.ball).toBeNull();
            expect(game.paddle).toBeNull();
            expect(game.blocks).toEqual([]);
            expect(game.blockManager).toBeNull();
            expect(game.inputHandler).toBeNull();
            expect(game.collisionDetector).toBeNull();
            expect(game.animationId).toBeNull();
            expect(game.initialized).toBe(false);
        });

        test('ゲーム設定が正しく設定される', () => {
            expect(game.targetFPS).toBe(GAME_CONFIG.FPS);
            expect(game.frameTime).toBe(GAME_CONFIG.FRAME_TIME);
        });
    });

    describe('初期化', () => {
        test('init()が成功する', () => {
            const result = game.init();
            expect(result).toBe(true);
            expect(game.initialized).toBe(true);
            expect(game.canvas).not.toBeNull();
            expect(game.ctx).not.toBeNull();
            expect(game.inputHandler).toBeInstanceOf(InputHandler);
            expect(game.collisionDetector).toBeInstanceOf(CollisionDetector);
            expect(game.ball).toBeInstanceOf(Ball);
            expect(game.paddle).toBeInstanceOf(Paddle);
            expect(game.blockManager).toBeInstanceOf(BlockManager);
        });

        test('ゲーム要素が正しく初期化される', () => {
            game.init();
            
            // Ball初期化確認
            expect(game.ball.x).toBe(GAME_CONFIG.CANVAS_WIDTH / 2);
            expect(game.ball.y).toBe(GAME_CONFIG.CANVAS_HEIGHT / 2);
            
            // Paddle初期化確認
            expect(game.paddle.x).toBe((GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH) / 2);
            expect(game.paddle.y).toBe(GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE_Y_OFFSET);
            
            // Blocks初期化確認
            expect(game.blocks.length).toBe(GAME_CONFIG.BLOCK_ROWS * GAME_CONFIG.BLOCK_COLS);
        });
    });

    describe('ゲーム状態管理', () => {
        beforeEach(() => {
            game.init();
        });

        test('ゲーム開始', () => {
            const result = game.startGame();
            expect(result).toBe(true);
            expect(game.gameState).toBe(GameState.PLAYING);
            expect(game.animationId).not.toBeNull();
        });

        test('ゲーム一時停止', () => {
            game.startGame();
            game.pauseGame();
            expect(game.gameState).toBe(GameState.PAUSED);
        });

        test('ゲーム再開', () => {
            game.startGame();
            game.pauseGame();
            game.resumeGame();
            expect(game.gameState).toBe(GameState.PLAYING);
        });

        test('ゲームオーバー', () => {
            game.startGame();
            game.handleGameOver();
            expect(game.gameState).toBe(GameState.GAME_OVER);
        });

        test('ゲームクリア', () => {
            game.startGame();
            game.handleGameWin();
            expect(game.gameState).toBe(GameState.GAME_WIN);
        });
    });

    describe('スコア管理', () => {
        beforeEach(() => {
            game.init();
        });

        test('スコア加算', () => {
            expect(game.getScore()).toBe(0);
            
            game.addScore(10);
            expect(game.getScore()).toBe(10);
            
            game.addScore(20);
            expect(game.getScore()).toBe(30);
        });

        test('ゲームリセット時のスコアリセット', () => {
            game.addScore(100);
            expect(game.getScore()).toBe(100);
            
            game.resetGame();
            expect(game.getScore()).toBe(0);
        });
    });

    describe('ゲームリセット', () => {
        beforeEach(() => {
            game.init();
        });

        test('resetGame()が正しく動作する', () => {
            // ゲーム状態を変更
            game.gameState = GameState.GAME_OVER;
            game.score = 100;
            game.ball.x = 100;
            game.ball.y = 100;
            game.paddle.x = 200;
            
            game.resetGame();
            
            // リセット後の状態確認
            expect(game.gameState).toBe(GameState.PLAYING);
            expect(game.score).toBe(0);
            expect(game.ball.x).toBe(GAME_CONFIG.CANVAS_WIDTH / 2);
            expect(game.ball.y).toBe(GAME_CONFIG.CANVAS_HEIGHT / 2);
            expect(game.paddle.x).toBe((GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH) / 2);
        });
    });

    describe('デバッグ情報', () => {
        test('getDebugInfo()が正しい情報を返す', () => {
            const debugInfo = game.getDebugInfo();
            
            expect(debugInfo).toHaveProperty('initialized');
            expect(debugInfo).toHaveProperty('gameState');
            expect(debugInfo).toHaveProperty('score');
            expect(debugInfo).toHaveProperty('animationId');
            expect(debugInfo).toHaveProperty('ballPosition');
            expect(debugInfo).toHaveProperty('paddlePosition');
            expect(debugInfo).toHaveProperty('activeBlocks');
            
            expect(debugInfo.initialized).toBe(false);
            expect(debugInfo.gameState).toBe(GameState.PLAYING);
            expect(debugInfo.score).toBe(0);
        });

        test('初期化後のデバッグ情報', () => {
            game.init();
            const debugInfo = game.getDebugInfo();
            
            expect(debugInfo.initialized).toBe(true);
            expect(debugInfo.ballPosition).toEqual({
                x: GAME_CONFIG.CANVAS_WIDTH / 2,
                y: GAME_CONFIG.CANVAS_HEIGHT / 2
            });
            expect(debugInfo.activeBlocks).toBe(GAME_CONFIG.BLOCK_ROWS * GAME_CONFIG.BLOCK_COLS);
        });
    });

    describe('クリーンアップ', () => {
        test('destroy()が正しく動作する', () => {
            game.init();
            game.startGame();
            
            const animationId = game.animationId;
            expect(animationId).not.toBeNull();
            
            game.destroy();
            
            expect(game.initialized).toBe(false);
            expect(game.gameState).toBe(GameState.PLAYING);
            expect(game.animationId).toBeNull();
        });
    });
});