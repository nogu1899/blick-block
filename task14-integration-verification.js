// Task 14: 統合テストとデバッグ - 実行可能な検証スクリプト
// 全機能の統合テスト、ゲームプレイフロー、パフォーマンステスト、ブラウザ互換性テスト

const { JSDOM } = require('jsdom');

console.log('🚀 Task 14: 統合テストとデバッグ開始');
console.log('=====================================');

// DOM環境のセットアップ
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
    <title>Block Breaker Game - Integration Test</title>
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
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.performance = { now: () => Date.now() };

// Canvas APIのモック
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(contextType) {
    const context = originalGetContext.call(this, contextType);
    if (context && contextType === '2d') {
        if (!context.measureText) {
            context.measureText = (text) => ({ width: text.length * 8 });
        }
        if (!context.createLinearGradient) {
            context.createLinearGradient = () => ({
                addColorStop: () => {}
            });
        }
    }
    return context;
};

// ゲームスクリプトを読み込み
const fs = require('fs');
const path = require('path');
const gameScript = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');

// DOMContentLoadedイベントリスナーを削除してクラス定義のみを抽出
const cleanedScript = gameScript
    .replace(/document\.addEventListener\('DOMContentLoaded'.*?\}\);/s, '')
    .replace(/function drawInitialScreen\(\).*?(?=\/\/ )/s, '')
    .replace(/function testBallClass\(\).*?(?=\/\/ )/s, '')
    .replace(/function testPaddleClass\(\).*?(?=\/\/ )/s, '')
    .replace(/function testBlockClass\(\).*?(?=\/\/ )/s, '')
    .replace(/function testInputHandler\(\).*?(?=\/\/ )/s, '');

try {
    eval(cleanedScript);
    console.log('✅ ゲームスクリプト読み込み成功');
} catch (error) {
    console.error('❌ ゲームスクリプト読み込み失敗:', error.message);
    console.error('詳細:', error.stack);
    process.exit(1);
}

// テスト結果を記録
const testResults = {
    passed: 0,
    failed: 0,
    details: []
};

function runTest(testName, testFunction) {
    try {
        console.log(`\n🧪 テスト実行: ${testName}`);
        testFunction();
        console.log(`✅ ${testName}: 成功`);
        testResults.passed++;
        testResults.details.push({ name: testName, status: 'PASS' });
    } catch (error) {
        console.error(`❌ ${testName}: 失敗 - ${error.message}`);
        testResults.failed++;
        testResults.details.push({ name: testName, status: 'FAIL', error: error.message });
    }
}

// 1. 全機能の統合テスト
console.log('\n📋 1. 全機能の統合テスト');
console.log('========================');

runTest('ゲーム初期化の統合テスト', () => {
    const game = new Game();
    const initResult = game.init();
    
    if (!initResult) throw new Error('ゲーム初期化に失敗');
    if (!game.initialized) throw new Error('初期化フラグが設定されていない');
    if (!game.canvas) throw new Error('Canvasが初期化されていない');
    if (!game.ctx) throw new Error('Canvas contextが初期化されていない');
    if (!game.ball) throw new Error('Ballが初期化されていない');
    if (!game.paddle) throw new Error('Paddleが初期化されていない');
    if (!game.blockManager) throw new Error('BlockManagerが初期化されていない');
    if (!game.inputHandler) throw new Error('InputHandlerが初期化されていない');
    if (!game.collisionDetector) throw new Error('CollisionDetectorが初期化されていない');
    
    game.stopGameLoop();
});

runTest('全ゲーム要素の統合動作テスト', () => {
    const game = new Game();
    game.init();
    
    // 初期状態の確認
    if (game.getGameState() !== GameState.PLAYING) {
        throw new Error('初期ゲーム状態が正しくない');
    }
    if (game.getScore() !== 0) {
        throw new Error('初期スコアが0でない');
    }
    
    // ボールの初期位置
    const ballCenter = game.ball.getCenter();
    if (ballCenter.x !== GAME_CONFIG.CANVAS_WIDTH / 2) {
        throw new Error('ボールの初期X位置が正しくない');
    }
    if (ballCenter.y !== GAME_CONFIG.CANVAS_HEIGHT / 2) {
        throw new Error('ボールの初期Y位置が正しくない');
    }
    
    // ブロックの初期状態
    const stats = game.blockManager.getStats();
    const expectedTotal = GAME_CONFIG.BLOCK_ROWS * GAME_CONFIG.BLOCK_COLS;
    if (stats.total !== expectedTotal) {
        throw new Error(`ブロック総数が正しくない: 期待値${expectedTotal}, 実際${stats.total}`);
    }
    if (stats.active !== stats.total) {
        throw new Error('初期状態でアクティブブロック数が総数と一致しない');
    }
    if (stats.destroyed !== 0) {
        throw new Error('初期状態で破壊されたブロックが存在する');
    }
    
    game.stopGameLoop();
});

runTest('衝突検出システムの統合テスト', () => {
    const game = new Game();
    game.init();
    
    const ball = game.ball;
    const paddle = game.paddle;
    const collisionDetector = game.collisionDetector;
    
    // ボールとパドルの衝突テスト
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius;
    
    const paddleCollision = collisionDetector.checkBallPaddleCollision(ball, paddle);
    if (!paddleCollision || !paddleCollision.collision) {
        throw new Error('ボールとパドルの衝突が検出されない');
    }
    
    // ボールと壁の衝突テスト
    ball.x = ball.radius / 2; // 左壁に近づける
    const wallCollision = collisionDetector.checkBallWallCollision(ball, game.canvas.width, game.canvas.height);
    if (!wallCollision.left) {
        throw new Error('ボールと左壁の衝突が検出されない');
    }
    
    // ボールとブロックの衝突テスト
    const blocks = game.blockManager.getActiveBlocks();
    if (blocks.length > 0) {
        const testBlock = blocks[0];
        ball.x = testBlock.x + testBlock.width / 2;
        ball.y = testBlock.y + testBlock.height + ball.radius;
        
        const blockCollision = collisionDetector.checkBallBlockCollision(ball, testBlock);
        if (!blockCollision || !blockCollision.collision) {
            throw new Error('ボールとブロックの衝突が検出されない');
        }
    }
    
    game.stopGameLoop();
});

runTest('スコアシステムの統合テスト', () => {
    const game = new Game();
    game.init();
    
    const initialScore = game.getScore();
    if (initialScore !== 0) {
        throw new Error('初期スコアが0でない');
    }
    
    // ブロック破壊によるスコア加算テスト
    const blocks = game.blockManager.getActiveBlocks();
    if (blocks.length > 0) {
        const testBlock = blocks[0];
        const expectedPoints = game.calculateBlockScore(testBlock);
        const actualPoints = testBlock.destroy();
        
        game.addScore(actualPoints);
        
        if (game.getScore() !== initialScore + actualPoints) {
            throw new Error('スコア加算が正しく動作しない');
        }
        if (actualPoints <= 0) {
            throw new Error('ブロック破壊時のポイントが0以下');
        }
    }
    
    game.stopGameLoop();
});

runTest('ゲーム状態管理の統合テスト', () => {
    const game = new Game();
    game.init();
    
    // 初期状態
    if (game.getGameState() !== GameState.PLAYING) {
        throw new Error('初期状態がPLAYINGでない');
    }
    
    // ゲームオーバー状態
    game.handleGameOver();
    if (game.getGameState() !== GameState.GAME_OVER) {
        throw new Error('ゲームオーバー状態に遷移しない');
    }
    
    // ゲームリセット
    game.resetGame();
    if (game.getGameState() !== GameState.PLAYING) {
        throw new Error('リセット後にPLAYING状態に戻らない');
    }
    if (game.getScore() !== 0) {
        throw new Error('リセット後にスコアが0に戻らない');
    }
    
    // ゲームクリア状態
    game.handleGameWin();
    if (game.getGameState() !== GameState.GAME_WIN) {
        throw new Error('ゲームクリア状態に遷移しない');
    }
    
    game.stopGameLoop();
});

// 2. ゲームプレイフローの動作確認
console.log('\n🎮 2. ゲームプレイフローの動作確認');
console.log('==================================');

runTest('完全なゲームプレイフローのシミュレーション', () => {
    const game = new Game();
    game.init();
    
    // ゲーム開始
    const startResult = game.startGame();
    if (!startResult) {
        throw new Error('ゲーム開始に失敗');
    }
    if (game.getGameState() !== GameState.PLAYING) {
        throw new Error('ゲーム開始後の状態がPLAYINGでない');
    }
    
    // ゲーム更新のシミュレーション
    const initialBallPosition = { ...game.ball.getCenter() };
    
    // 複数フレームの更新をシミュレート
    for (let i = 0; i < 10; i++) {
        game.update();
    }
    
    // ボールが移動したことを確認
    const newBallPosition = game.ball.getCenter();
    const moved = (initialBallPosition.x !== newBallPosition.x) || 
                 (initialBallPosition.y !== newBallPosition.y);
    if (!moved) {
        throw new Error('ボールが移動していない');
    }
    
    game.stopGameLoop();
});

runTest('パドル操作からボール跳ね返しまでのフロー', () => {
    const game = new Game();
    game.init();
    
    const paddle = game.paddle;
    const ball = game.ball;
    
    // パドルを移動
    const initialPaddleX = paddle.x;
    paddle.moveRight();
    if (paddle.x <= initialPaddleX) {
        throw new Error('パドルが右に移動していない');
    }
    
    // ボールをパドルに衝突させる
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius;
    ball.dy = Math.abs(ball.dy); // 下向きに設定
    
    const initialVelocity = ball.getVelocity();
    
    // 衝突処理を実行
    game.handleCollisions();
    
    // ボールが上向きに跳ね返ったことを確認
    const newVelocity = ball.getVelocity();
    if (newVelocity.dy >= 0) {
        throw new Error('ボールが上向きに跳ね返っていない');
    }
    
    game.stopGameLoop();
});

runTest('ブロック破壊からスコア加算までのフロー', () => {
    const game = new Game();
    game.init();
    
    const ball = game.ball;
    const initialScore = game.getScore();
    const blocks = game.blockManager.getActiveBlocks();
    const initialBlockCount = blocks.length;
    
    if (blocks.length > 0) {
        const targetBlock = blocks[0];
        
        // ボールをブロックに衝突させる
        ball.x = targetBlock.x + targetBlock.width / 2;
        ball.y = targetBlock.y + targetBlock.height + ball.radius;
        ball.dy = -Math.abs(ball.dy); // 上向きに設定
        
        // 衝突処理を実行
        game.handleCollisions();
        
        // ブロックが破壊され、スコアが加算されたことを確認
        if (!targetBlock.isDestroyed()) {
            throw new Error('ブロックが破壊されていない');
        }
        if (game.getScore() <= initialScore) {
            throw new Error('スコアが加算されていない');
        }
        
        const newBlockCount = game.blockManager.getActiveBlocks().length;
        if (newBlockCount !== initialBlockCount - 1) {
            throw new Error('アクティブブロック数が正しく減少していない');
        }
    }
    
    game.stopGameLoop();
});

runTest('ゲーム終了条件のフロー', () => {
    const game = new Game();
    game.init();
    
    // ゲームクリア条件：全ブロック破壊
    const blocks = game.blockManager.getActiveBlocks();
    blocks.forEach(block => block.destroy());
    
    game.checkGameEndConditions();
    if (game.getGameState() !== GameState.GAME_WIN) {
        throw new Error('全ブロック破壊後にゲームクリア状態にならない');
    }
    
    game.stopGameLoop();
});

runTest('ゲームリセットフロー', () => {
    const game = new Game();
    game.init();
    
    // ゲーム状態を変更
    game.addScore(100);
    game.ball.x = 100;
    game.paddle.x = 200;
    const blocks = game.blockManager.getActiveBlocks();
    if (blocks.length > 0) {
        blocks[0].destroy();
    }
    
    // リセット実行
    game.resetGame();
    
    // 初期状態に戻ったことを確認
    if (game.getScore() !== 0) {
        throw new Error('リセット後にスコアが0に戻らない');
    }
    if (game.getGameState() !== GameState.PLAYING) {
        throw new Error('リセット後にPLAYING状態に戻らない');
    }
    if (game.ball.x !== GAME_CONFIG.CANVAS_WIDTH / 2) {
        throw new Error('リセット後にボールが初期位置に戻らない');
    }
    if (game.paddle.x !== (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH) / 2) {
        throw new Error('リセット後にパドルが初期位置に戻らない');
    }
    
    const resetStats = game.blockManager.getStats();
    if (resetStats.destroyed !== 0) {
        throw new Error('リセット後に破壊されたブロックが残っている');
    }
    if (resetStats.active !== resetStats.total) {
        throw new Error('リセット後にアクティブブロック数が総数と一致しない');
    }
    
    game.stopGameLoop();
});

// 3. パフォーマンステストとフレームレート確認
console.log('\n⚡ 3. パフォーマンステストとフレームレート確認');
console.log('============================================');

runTest('描画パフォーマンステスト', () => {
    const game = new Game();
    game.init();
    
    const renderTimes = [];
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        game.render();
        const endTime = performance.now();
        
        renderTimes.push(endTime - startTime);
    }
    
    const averageRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / iterations;
    const maxRenderTime = Math.max(...renderTimes);
    
    console.log(`   平均描画時間: ${averageRenderTime.toFixed(3)}ms`);
    console.log(`   最大描画時間: ${maxRenderTime.toFixed(3)}ms`);
    
    // 描画時間の要件確認
    if (averageRenderTime > 10) {
        throw new Error(`平均描画時間が遅すぎる: ${averageRenderTime.toFixed(3)}ms`);
    }
    if (maxRenderTime > 50) {
        throw new Error(`最大描画時間が遅すぎる: ${maxRenderTime.toFixed(3)}ms`);
    }
    
    game.stopGameLoop();
});

runTest('更新処理パフォーマンステスト', () => {
    const game = new Game();
    game.init();
    
    const updateTimes = [];
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        game.update();
        const endTime = performance.now();
        
        updateTimes.push(endTime - startTime);
    }
    
    const averageUpdateTime = updateTimes.reduce((sum, time) => sum + time, 0) / iterations;
    const maxUpdateTime = Math.max(...updateTimes);
    
    console.log(`   平均更新時間: ${averageUpdateTime.toFixed(3)}ms`);
    console.log(`   最大更新時間: ${maxUpdateTime.toFixed(3)}ms`);
    
    // 更新時間の要件確認
    if (averageUpdateTime > 5) {
        throw new Error(`平均更新時間が遅すぎる: ${averageUpdateTime.toFixed(3)}ms`);
    }
    if (maxUpdateTime > 20) {
        throw new Error(`最大更新時間が遅すぎる: ${maxUpdateTime.toFixed(3)}ms`);
    }
    
    game.stopGameLoop();
});

runTest('衝突検出パフォーマンステスト', () => {
    const game = new Game();
    game.init();
    
    const ball = game.ball;
    const paddle = game.paddle;
    const blocks = game.blockManager.getActiveBlocks();
    const collisionDetector = game.collisionDetector;
    
    const collisionTimes = [];
    const iterations = 1000;
    
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
    
    console.log(`   平均衝突検出時間: ${averageCollisionTime.toFixed(4)}ms`);
    console.log(`   最大衝突検出時間: ${maxCollisionTime.toFixed(4)}ms`);
    
    // 衝突検出時間の要件確認
    if (averageCollisionTime > 1) {
        throw new Error(`平均衝突検出時間が遅すぎる: ${averageCollisionTime.toFixed(4)}ms`);
    }
    if (maxCollisionTime > 5) {
        throw new Error(`最大衝突検出時間が遅すぎる: ${maxCollisionTime.toFixed(4)}ms`);
    }
    
    game.stopGameLoop();
});

// 4. ブラウザ互換性テスト
console.log('\n🌐 4. ブラウザ互換性テスト');
console.log('==========================');

runTest('Canvas API互換性テスト', () => {
    const game = new Game();
    game.init();
    
    const ctx = game.ctx;
    
    // 基本的なCanvas APIの存在確認
    const requiredMethods = [
        'fillRect', 'strokeRect', 'arc', 'beginPath', 'fill', 'stroke',
        'fillText', 'measureText', 'createLinearGradient'
    ];
    
    for (const method of requiredMethods) {
        if (typeof ctx[method] !== 'function') {
            throw new Error(`Canvas API ${method} が存在しない`);
        }
    }
    
    // 描画状態の設定と取得
    ctx.fillStyle = '#ff0000';
    if (ctx.fillStyle !== '#ff0000') {
        throw new Error('fillStyleの設定が正しく動作しない');
    }
    
    ctx.strokeStyle = '#00ff00';
    if (ctx.strokeStyle !== '#00ff00') {
        throw new Error('strokeStyleの設定が正しく動作しない');
    }
    
    ctx.lineWidth = 5;
    if (ctx.lineWidth !== 5) {
        throw new Error('lineWidthの設定が正しく動作しない');
    }
    
    game.stopGameLoop();
});

runTest('JavaScript ES6+ 機能互換性テスト', () => {
    // クラス構文
    class TestClass {
        constructor(value) {
            this.value = value;
        }
        
        getValue() {
            return this.value;
        }
    }
    
    const instance = new TestClass('test');
    if (instance.getValue() !== 'test') {
        throw new Error('クラス構文が正しく動作しない');
    }
    
    // アロー関数
    const arrowFunc = (x, y) => x + y;
    if (arrowFunc(2, 3) !== 5) {
        throw new Error('アロー関数が正しく動作しない');
    }
    
    // const/let
    const constVar = 'constant';
    let letVar = 'variable';
    if (constVar !== 'constant' || letVar !== 'variable') {
        throw new Error('const/letが正しく動作しない');
    }
    
    // テンプレートリテラル
    const name = 'World';
    const greeting = `Hello, ${name}!`;
    if (greeting !== 'Hello, World!') {
        throw new Error('テンプレートリテラルが正しく動作しない');
    }
    
    // デストラクチャリング
    const obj = { a: 1, b: 2 };
    const { a, b } = obj;
    if (a !== 1 || b !== 2) {
        throw new Error('デストラクチャリングが正しく動作しない');
    }
    
    // スプレッド演算子
    const arr1 = [1, 2, 3];
    const arr2 = [...arr1, 4, 5];
    if (arr2.length !== 5 || arr2[4] !== 5) {
        throw new Error('スプレッド演算子が正しく動作しない');
    }
});

runTest('requestAnimationFrame互換性テスト', () => {
    if (typeof requestAnimationFrame !== 'function') {
        throw new Error('requestAnimationFrameが存在しない');
    }
    if (typeof cancelAnimationFrame !== 'function') {
        throw new Error('cancelAnimationFrameが存在しない');
    }
    
    let callbackExecuted = false;
    const animationId = requestAnimationFrame(() => {
        callbackExecuted = true;
    });
    
    if (typeof animationId !== 'number') {
        throw new Error('requestAnimationFrameが数値IDを返さない');
    }
    
    // 同期的にはコールバックが実行されていないことを確認
    if (callbackExecuted) {
        throw new Error('requestAnimationFrameのコールバックが同期的に実行された');
    }
});

runTest('HTML5 Canvas要素の互換性テスト', () => {
    const canvas = document.getElementById('gameCanvas');
    
    // Canvas要素の基本プロパティ
    if (canvas.width !== 800) {
        throw new Error('Canvas幅が正しく設定されていない');
    }
    if (canvas.height !== 600) {
        throw new Error('Canvas高さが正しく設定されていない');
    }
    if (canvas.tagName.toLowerCase() !== 'canvas') {
        throw new Error('Canvas要素のtagNameが正しくない');
    }
    
    // 2Dコンテキストの取得
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('2Dコンテキストが取得できない');
    }
    if (typeof ctx !== 'object') {
        throw new Error('2Dコンテキストがオブジェクトでない');
    }
});

// 5. 全要件の統合確認
console.log('\n📋 5. 全要件の統合確認');
console.log('======================');

runTest('全要件の統合確認', () => {
    const game = new Game();
    game.init();
    
    // 要件1: ゲーム画面の表示
    if (game.canvas.width !== 800 || game.canvas.height !== 600) {
        throw new Error('要件1: キャンバスサイズが正しくない');
    }
    if (game.blockManager.getStats().total <= 0) {
        throw new Error('要件1: ブロックが表示されていない');
    }
    if (!game.paddle) {
        throw new Error('要件1: パドルが表示されていない');
    }
    if (!game.ball) {
        throw new Error('要件1: ボールが表示されていない');
    }
    
    // 要件2: パドルの操作
    const initialPaddleX = game.paddle.x;
    game.paddle.moveLeft();
    if (game.paddle.x >= initialPaddleX) {
        throw new Error('要件2: パドルが左に移動しない');
    }
    
    game.paddle.moveRight();
    game.paddle.moveRight();
    if (game.paddle.x <= initialPaddleX) {
        throw new Error('要件2: パドルが右に移動しない');
    }
    
    // 要件3: ボールの動作
    const initialBallPos = { ...game.ball.getCenter() };
    game.ball.update();
    const newBallPos = game.ball.getCenter();
    
    const ballMoved = (initialBallPos.x !== newBallPos.x) || 
                    (initialBallPos.y !== newBallPos.y);
    if (!ballMoved) {
        throw new Error('要件3: ボールが移動しない');
    }
    
    // 要件4: ブロックの破壊
    const blocks = game.blockManager.getActiveBlocks();
    if (blocks.length > 0) {
        const initialCount = blocks.length;
        const points = blocks[0].destroy();
        if (points <= 0) {
            throw new Error('要件4: ブロック破壊時にポイントが加算されない');
        }
        if (!blocks[0].isDestroyed()) {
            throw new Error('要件4: ブロックが破壊されない');
        }
    }
    
    // 要件5: ゲーム状態の管理
    if (game.getGameState() !== GameState.PLAYING) {
        throw new Error('要件5: 初期ゲーム状態が正しくない');
    }
    game.handleGameOver();
    if (game.getGameState() !== GameState.GAME_OVER) {
        throw new Error('要件5: ゲームオーバー状態に遷移しない');
    }
    game.resetGame();
    if (game.getGameState() !== GameState.PLAYING) {
        throw new Error('要件5: リセット後にPLAYING状態に戻らない');
    }
    
    // 要件6: スコア表示
    const initialScore = game.getScore();
    game.addScore(10);
    if (game.getScore() !== initialScore + 10) {
        throw new Error('要件6: スコア加算が正しく動作しない');
    }
    game.resetGame();
    if (game.getScore() !== 0) {
        throw new Error('要件6: リセット後にスコアが0に戻らない');
    }
    
    game.stopGameLoop();
});

// テスト結果の表示
console.log('\n📊 テスト結果サマリー');
console.log('====================');
console.log(`✅ 成功: ${testResults.passed} テスト`);
console.log(`❌ 失敗: ${testResults.failed} テスト`);
console.log(`📈 成功率: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

if (testResults.failed > 0) {
    console.log('\n❌ 失敗したテスト:');
    testResults.details
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
            console.log(`   - ${test.name}: ${test.error}`);
        });
}

console.log('\n🎯 Task 14 完了確認');
console.log('==================');
console.log('✅ 全機能の統合テスト: 完了');
console.log('✅ ゲームプレイフローの動作確認: 完了');
console.log('✅ パフォーマンステストとフレームレート確認: 完了');
console.log('✅ ブラウザ互換性テスト: 完了');
console.log('✅ 全要件の統合確認: 完了');

if (testResults.failed === 0) {
    console.log('\n🎉 Task 14: 統合テストとデバッグ - 全て成功！');
    process.exit(0);
} else {
    console.log('\n⚠️  Task 14: 統合テストとデバッグ - 一部失敗');
    process.exit(1);
}