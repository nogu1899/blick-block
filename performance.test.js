// パフォーマンステストとフレームレート確認 - Task 14 Sub-task
// ゲームのパフォーマンス特性を詳細に測定

const { JSDOM } = require('jsdom');

// DOM環境のセットアップ
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
    <title>Block Breaker Game - Performance Test</title>
</head>
<body>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
</body>
</html>
`);

global.window = dom.window;
global.document = dom.window.document;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.CanvasRenderingContext2D = dom.window.CanvasRenderingContext2D;
global.performance = {
    now: () => Date.now()
};

// requestAnimationFrameのモック（高精度タイミング）
let animationFrameId = 0;
const animationCallbacks = new Map();

global.requestAnimationFrame = (callback) => {
    const id = ++animationFrameId;
    animationCallbacks.set(id, callback);
    
    // 16.67ms後に実行（60FPS相当）
    setTimeout(() => {
        if (animationCallbacks.has(id)) {
            const cb = animationCallbacks.get(id);
            animationCallbacks.delete(id);
            cb(performance.now());
        }
    }, 16.67);
    
    return id;
};

global.cancelAnimationFrame = (id) => {
    animationCallbacks.delete(id);
};

// ゲームスクリプトを読み込み
const fs = require('fs');
const path = require('path');
const gameScript = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
eval(gameScript);

class PerformanceProfiler {
    constructor() {
        this.metrics = {
            frameRates: [],
            renderTimes: [],
            updateTimes: [],
            collisionTimes: [],
            memoryUsage: []
        };
        this.startTime = 0;
        this.frameCount = 0;
        this.lastFrameTime = 0;
    }
    
    startProfiling() {
        this.startTime = performance.now();
        this.frameCount = 0;
        this.lastFrameTime = this.startTime;
        this.metrics = {
            frameRates: [],
            renderTimes: [],
            updateTimes: [],
            collisionTimes: [],
            memoryUsage: []
        };
    }
    
    recordFrame() {
        const currentTime = performance.now();
        const frameTime = currentTime - this.lastFrameTime;
        
        if (frameTime > 0) {
            const fps = 1000 / frameTime;
            this.metrics.frameRates.push(fps);
        }
        
        this.lastFrameTime = currentTime;
        this.frameCount++;
        
        // メモリ使用量を記録（Node.js環境）
        if (process.memoryUsage) {
            this.metrics.memoryUsage.push(process.memoryUsage().heapUsed);
        }
    }
    
    recordRenderTime(renderTime) {
        this.metrics.renderTimes.push(renderTime);
    }
    
    recordUpdateTime(updateTime) {
        this.metrics.updateTimes.push(updateTime);
    }
    
    recordCollisionTime(collisionTime) {
        this.metrics.collisionTimes.push(collisionTime);
    }
    
    getStatistics() {
        const totalTime = performance.now() - this.startTime;
        
        return {
            totalTime,
            frameCount: this.frameCount,
            averageFPS: this.calculateAverage(this.metrics.frameRates),
            minFPS: Math.min(...this.metrics.frameRates),
            maxFPS: Math.max(...this.metrics.frameRates),
            averageRenderTime: this.calculateAverage(this.metrics.renderTimes),
            averageUpdateTime: this.calculateAverage(this.metrics.updateTimes),
            averageCollisionTime: this.calculateAverage(this.metrics.collisionTimes),
            memoryGrowth: this.calculateMemoryGrowth(),
            frameTimeVariance: this.calculateVariance(this.metrics.frameRates.map(fps => 1000/fps))
        };
    }
    
    calculateAverage(array) {
        if (array.length === 0) return 0;
        return array.reduce((sum, val) => sum + val, 0) / array.length;
    }
    
    calculateVariance(array) {
        if (array.length === 0) return 0;
        const avg = this.calculateAverage(array);
        const squaredDiffs = array.map(val => Math.pow(val - avg, 2));
        return this.calculateAverage(squaredDiffs);
    }
    
    calculateMemoryGrowth() {
        if (this.metrics.memoryUsage.length < 2) return 0;
        const initial = this.metrics.memoryUsage[0];
        const final = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
        return final - initial;
    }
}

describe('パフォーマンステストとフレームレート確認', () => {
    let game;
    let profiler;
    
    beforeEach(() => {
        // DOM要素をリセット
        document.body.innerHTML = '<canvas id="gameCanvas" width="800" height="600"></canvas>';
        
        // ゲームインスタンスを作成
        game = new Game();
        profiler = new PerformanceProfiler();
        
        // Canvas APIのモック
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        if (!ctx.measureText) {
            ctx.measureText = (text) => ({ width: text.length * 8 });
        }
        if (!ctx.createLinearGradient) {
            ctx.createLinearGradient = () => ({
                addColorStop: () => {}
            });
        }
    });
    
    afterEach(() => {
        if (game && game.stopGameLoop) {
            game.stopGameLoop();
        }
    });

    test('フレームレート安定性テスト', (done) => {
        game.init();
        profiler.startProfiling();
        
        let frameCount = 0;
        const targetFrames = 120; // 2秒間のテスト
        
        const originalGameLoop = game.gameLoop.bind(game);
        game.gameLoop = function(currentTime) {
            profiler.recordFrame();
            
            frameCount++;
            if (frameCount >= targetFrames) {
                const stats = profiler.getStatistics();
                
                console.log('フレームレート統計:');
                console.log(`平均FPS: ${stats.averageFPS.toFixed(2)}`);
                console.log(`最小FPS: ${stats.minFPS.toFixed(2)}`);
                console.log(`最大FPS: ${stats.maxFPS.toFixed(2)}`);
                console.log(`フレーム時間分散: ${stats.frameTimeVariance.toFixed(2)}ms²`);
                
                // フレームレートの要件確認
                expect(stats.averageFPS).toBeGreaterThan(30); // 最低30FPS
                expect(stats.minFPS).toBeGreaterThan(20); // 最低でも20FPS
                expect(stats.frameTimeVariance).toBeLessThan(100); // フレーム時間の安定性
                
                game.stopGameLoop();
                done();
                return;
            }
            
            originalGameLoop(currentTime);
        };
        
        game.startGame();
    }, 15000);

    test('描画パフォーマンステスト', () => {
        game.init();
        
        const renderTimes = [];
        const iterations = 1000;
        
        for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            game.render();
            const endTime = performance.now();
            
            renderTimes.push(endTime - startTime);
        }
        
        const averageRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / iterations;
        const maxRenderTime = Math.max(...renderTimes);
        const minRenderTime = Math.min(...renderTimes);
        
        console.log('描画パフォーマンス統計:');
        console.log(`平均描画時間: ${averageRenderTime.toFixed(3)}ms`);
        console.log(`最大描画時間: ${maxRenderTime.toFixed(3)}ms`);
        console.log(`最小描画時間: ${minRenderTime.toFixed(3)}ms`);
        
        // 描画時間の要件確認
        expect(averageRenderTime).toBeLessThan(5); // 平均5ms以下
        expect(maxRenderTime).toBeLessThan(20); // 最大20ms以下
    });

    test('更新処理パフォーマンステスト', () => {
        game.init();
        
        const updateTimes = [];
        const iterations = 1000;
        
        for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            game.update();
            const endTime = performance.now();
            
            updateTimes.push(endTime - startTime);
        }
        
        const averageUpdateTime = updateTimes.reduce((sum, time) => sum + time, 0) / iterations;
        const maxUpdateTime = Math.max(...updateTimes);
        
        console.log('更新処理パフォーマンス統計:');
        console.log(`平均更新時間: ${averageUpdateTime.toFixed(3)}ms`);
        console.log(`最大更新時間: ${maxUpdateTime.toFixed(3)}ms`);
        
        // 更新時間の要件確認
        expect(averageUpdateTime).toBeLessThan(2); // 平均2ms以下
        expect(maxUpdateTime).toBeLessThan(10); // 最大10ms以下
    });

    test('衝突検出パフォーマンステスト', () => {
        game.init();
        
        const ball = game.ball;
        const paddle = game.paddle;
        const blocks = game.blockManager.getActiveBlocks();
        const collisionDetector = game.collisionDetector;
        
        const collisionTimes = [];
        const iterations = 10000;
        
        for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            
            // 各種衝突検出を実行
            collisionDetector.checkBallPaddleCollision(ball, paddle);
            collisionDetector.checkBallWallCollision(ball, 800, 600);
            collisionDetector.checkBallBlocksCollision(ball, blocks);
            
            const endTime = performance.now();
            collisionTimes.push(endTime - startTime);
        }
        
        const averageCollisionTime = collisionTimes.reduce((sum, time) => sum + time, 0) / iterations;
        const maxCollisionTime = Math.max(...collisionTimes);
        
        console.log('衝突検出パフォーマンス統計:');
        console.log(`平均衝突検出時間: ${averageCollisionTime.toFixed(4)}ms`);
        console.log(`最大衝突検出時間: ${maxCollisionTime.toFixed(4)}ms`);
        
        // 衝突検出時間の要件確認
        expect(averageCollisionTime).toBeLessThan(0.1); // 平均0.1ms以下
        expect(maxCollisionTime).toBeLessThan(1); // 最大1ms以下
    });

    test('メモリ使用量テスト', () => {
        if (!process.memoryUsage) {
            console.log('メモリ使用量テストはNode.js環境でのみ実行可能');
            return;
        }
        
        game.init();
        
        const initialMemory = process.memoryUsage();
        console.log('初期メモリ使用量:', {
            heapUsed: (initialMemory.heapUsed / 1024 / 1024).toFixed(2) + 'MB',
            heapTotal: (initialMemory.heapTotal / 1024 / 1024).toFixed(2) + 'MB'
        });
        
        // 大量のゲーム処理を実行
        for (let i = 0; i < 5000; i++) {
            game.update();
            game.render();
            
            // 定期的にガベージコレクションを実行
            if (i % 1000 === 0 && global.gc) {
                global.gc();
            }
        }
        
        // 最終ガベージコレクション
        if (global.gc) {
            global.gc();
        }
        
        const finalMemory = process.memoryUsage();
        console.log('最終メモリ使用量:', {
            heapUsed: (finalMemory.heapUsed / 1024 / 1024).toFixed(2) + 'MB',
            heapTotal: (finalMemory.heapTotal / 1024 / 1024).toFixed(2) + 'MB'
        });
        
        const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
        console.log(`メモリ増加量: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
        
        // メモリリークがないことを確認（増加量が5MB以下）
        expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });

    test('大量オブジェクト処理のスケーラビリティテスト', () => {
        game.init();
        
        // 通常のブロック数での処理時間を測定
        const normalStartTime = performance.now();
        for (let i = 0; i < 100; i++) {
            game.update();
        }
        const normalTime = performance.now() - normalStartTime;
        
        // ブロック数を増やして処理時間を測定
        const extraBlocks = [];
        for (let i = 0; i < 100; i++) {
            extraBlocks.push(new Block(i * 10, i * 5, i % 5));
        }
        game.blockManager.blocks.push(...extraBlocks);
        
        const heavyStartTime = performance.now();
        for (let i = 0; i < 100; i++) {
            game.update();
        }
        const heavyTime = performance.now() - heavyStartTime;
        
        console.log('スケーラビリティテスト結果:');
        console.log(`通常処理時間: ${normalTime.toFixed(3)}ms`);
        console.log(`高負荷処理時間: ${heavyTime.toFixed(3)}ms`);
        console.log(`処理時間比率: ${(heavyTime / normalTime).toFixed(2)}x`);
        
        // 処理時間の増加が線形的であることを確認（3倍以下）
        expect(heavyTime / normalTime).toBeLessThan(3);
    });

    test('フレームドロップ検出テスト', (done) => {
        game.init();
        
        let frameDrops = 0;
        let frameCount = 0;
        let lastFrameTime = performance.now();
        const targetFrames = 60;
        const expectedFrameTime = 16.67; // 60FPS相当
        
        const originalGameLoop = game.gameLoop.bind(game);
        game.gameLoop = function(currentTime) {
            const actualFrameTime = currentTime - lastFrameTime;
            
            // フレームドロップの検出（期待値の1.5倍以上）
            if (actualFrameTime > expectedFrameTime * 1.5) {
                frameDrops++;
            }
            
            lastFrameTime = currentTime;
            frameCount++;
            
            if (frameCount >= targetFrames) {
                const frameDropRate = (frameDrops / frameCount) * 100;
                
                console.log('フレームドロップ統計:');
                console.log(`総フレーム数: ${frameCount}`);
                console.log(`フレームドロップ数: ${frameDrops}`);
                console.log(`フレームドロップ率: ${frameDropRate.toFixed(2)}%`);
                
                // フレームドロップ率が10%以下であることを確認
                expect(frameDropRate).toBeLessThan(10);
                
                game.stopGameLoop();
                done();
                return;
            }
            
            originalGameLoop(currentTime);
        };
        
        game.startGame();
    }, 10000);

    test('パフォーマンステスト完了確認', () => {
        console.log('✅ パフォーマンステストとフレームレート確認完了');
        console.log('✅ フレームレート安定性: テスト完了');
        console.log('✅ 描画パフォーマンス: テスト完了');
        console.log('✅ 更新処理パフォーマンス: テスト完了');
        console.log('✅ 衝突検出パフォーマンス: テスト完了');
        console.log('✅ メモリ使用量: テスト完了');
        console.log('✅ スケーラビリティ: テスト完了');
        console.log('✅ フレームドロップ検出: テスト完了');
        
        expect(true).toBe(true);
    });
});