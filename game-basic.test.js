// Game クラスの基本構造テスト

// テスト用のDOM環境をセットアップ
const { JSDOM } = require('jsdom');
const { createCanvas } = require('canvas');

// DOM環境を設定
const dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="gameCanvas"></canvas></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Canvas mock を設定
const mockCanvas = createCanvas(800, 600);
const mockCtx = mockCanvas.getContext('2d');

// HTMLCanvasElement.prototype.getContext をモック
dom.window.HTMLCanvasElement.prototype.getContext = function(contextType) {
    if (contextType === '2d') {
        return mockCtx;
    }
    return null;
};

// script.jsの自動実行を防ぐため、DOMContentLoadedイベントを無効化
const originalAddEventListener = document.addEventListener;
document.addEventListener = function(event, handler) {
    if (event !== 'DOMContentLoaded') {
        originalAddEventListener.call(this, event, handler);
    }
};

// script.jsを読み込み
require('./script.js');

describe('Game クラスの基本構造', () => {
    let game;

    beforeEach(() => {
        // 各テスト前にGameインスタンスを作成
        game = new Game();
    });

    afterEach(() => {
        // 各テスト後にクリーンアップ
        if (game && game.destroy) {
            game.destroy();
        }
    });

    describe('コンストラクタ', () => {
        test('Game クラスが定義されている', () => {
            expect(Game).toBeDefined();
            expect(typeof Game).toBe('function');
        });

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

    describe('ゲーム状態管理', () => {
        test('GameState 列挙型が定義されている', () => {
            expect(GameState).toBeDefined();
            expect(GameState.PLAYING).toBe('playing');
            expect(GameState.GAME_OVER).toBe('game_over');
            expect(GameState.GAME_WIN).toBe('game_win');
            expect(GameState.PAUSED).toBe('paused');
        });

        test('初期化メソッドが存在する', () => {
            expect(typeof game.init).toBe('function');
        });

        test('ゲームループメソッドが存在する', () => {
            expect(typeof game.gameLoop).toBe('function');
        });

        test('基本的なゲーム制御メソッドが存在する', () => {
            expect(typeof game.startGame).toBe('function');
            expect(typeof game.resetGame).toBe('function');
            expect(typeof game.pauseGame).toBe('function');
            expect(typeof game.resumeGame).toBe('function');
            expect(typeof game.handleGameOver).toBe('function');
            expect(typeof game.handleGameWin).toBe('function');
        });
    });

    describe('基本的なゲームループ構造', () => {
        test('updateメソッドが存在する', () => {
            expect(typeof game.update).toBe('function');
        });

        test('renderメソッドが存在する', () => {
            expect(typeof game.render).toBe('function');
        });

        test('ゲームループ制御メソッドが存在する', () => {
            expect(typeof game.startGameLoop).toBe('function');
            expect(typeof game.stopGameLoop).toBe('function');
        });
    });

    describe('スコア管理', () => {
        test('スコア関連メソッドが存在する', () => {
            expect(typeof game.addScore).toBe('function');
            expect(typeof game.getScore).toBe('function');
        });

        test('初期スコアが0である', () => {
            expect(game.getScore()).toBe(0);
        });

        test('スコア加算が動作する', () => {
            game.addScore(10);
            expect(game.getScore()).toBe(10);
            
            game.addScore(20);
            expect(game.getScore()).toBe(30);
        });
    });

    describe('デバッグ機能', () => {
        test('デバッグ情報取得メソッドが存在する', () => {
            expect(typeof game.getDebugInfo).toBe('function');
        });

        test('デバッグ情報が正しい形式で返される', () => {
            const debugInfo = game.getDebugInfo();
            
            expect(debugInfo).toHaveProperty('initialized');
            expect(debugInfo).toHaveProperty('gameState');
            expect(debugInfo).toHaveProperty('score');
            expect(debugInfo).toHaveProperty('animationId');
            expect(debugInfo).toHaveProperty('ballPosition');
            expect(debugInfo).toHaveProperty('paddlePosition');
            expect(debugInfo).toHaveProperty('activeBlocks');
        });
    });

    describe('クリーンアップ', () => {
        test('destroyメソッドが存在する', () => {
            expect(typeof game.destroy).toBe('function');
        });
    });
});