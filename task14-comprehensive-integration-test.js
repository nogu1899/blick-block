// Task 14: 統合テストとデバッグ - 包括的統合テスト
// Node.js環境での実行可能な統合テストスイート

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

console.log('🚀 Task 14: 統合テストとデバッグ - 包括的テスト開始');
console.log('=================================================');

// DOM環境のセットアップ
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
    <title>Block Breaker Game - Comprehensive Integration Test</title>
</head>
<body>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
</body>
</html>
`);

// グローバル環境の設定
global.window = dom.window;
global.document = dom.window.document;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.CanvasRenderingContext2D = dom.window.CanvasRenderingContext2D;
global.performance = { now: () => Date.now() };

// requestAnimationFrameのモック
let animationFrameId = 0;
global.requestAnimationFrame = (callback) => {
    const id = ++animationFrameId;
    setTimeout(() => callback(performance.now()), 16);
    return id;
};
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Canvas APIの拡張モック
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(contextType) {
    const context = originalGetContext.call(this, contextType);
    if (context && contextType === '2d') {
        // 必要なメソッドを追加
        if (!context.measureText) {
            context.measureText = (text) => ({ 
                width: text.length * 8,
                actualBoundingBoxLeft: 0,
                actualBoundingBoxRight: text.length * 8
            });
        }
        if (!context.createLinearGradient) {
            context.createLinearGradient = () => ({
                addColorStop: () => {}
            });
        }
        if (!context.createRadialGradient) {
            context.createRadialGradient = () => ({
                addColorStop: () => {}
            });
        }
    }
    return context;
};

// ゲームスクリプトの読み込みと処理
function loadGameClasses() {
    const gameScript = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
    
    // スクリプトからクラス定義と必要な部分のみを抽出
    const lines = gameScript.split('\n');
    const filteredLines = [];
    let skipBlock = false;
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // DOMContentLoadedイベントリスナーをスキップ
        if (line.includes("document.addEventListener('DOMContentLoaded'")) {
            skipBlock = true;
            braceCount = 0;
        }
        
        // テスト関数をスキップ
        if (line.includes('function drawInitialScreen') || 
            line.includes('function testBallClass') ||
            line.includes('function testPaddleClass') ||
            line.includes('function testBlockClass') ||
            line.includes('function testInputHandler')) {
            skipBlock = true;
            braceCount = 0;
        }
        
        if (skipBlock) {
            // 中括弧をカウントしてブロックの終了を検出
            for (const char of line) {
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
            }
            
            if (braceCount <= 0) {
                skipBlock = false;
            }
            continue;
        }
        
        filteredLines.push(line);
    }
    
    const cleanedScript = filteredLines.join('\n');
    
    try {
        eval(cleanedScript);
        return true;
    } catch (error) {
        console.error('❌ ゲームクラス読み込み失敗:', error.message);
        return false;
    }
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

// ゲームクラスを読み込み
if (!loadGameClasses()) {
    console.error('❌ ゲームクラスの読み込みに失敗しました');
    process.exit(1);
}

console.log('✅ ゲームクラス読み込み成功');

// 1. 全機能の統合テスト
console.log('\n📋 1. 全機能の統合テスト');
console.log('========================');

runTest('ゲーム定数とユーティリティの確認', () => {
    if (typeof GAME_CONFIG === 'undefined') throw new Error('GAME_CONFIG が定義されていない');
    if (typeof GameState === 'undefined') throw new Error('GameState が定義されていない');
    if (typeof Utils === 'undefined') throw new Error('Utils が定義されていない');
    
    // 基本的な定数値の確認
    if (GAME_CONFIG.CANVAS_WIDTH !== 800) throw new Error('Canvas幅が正しくない');
    if (GAME_CONFIG.CANVAS_HEIGHT !== 600) throw new Error('Canvas高さが正しくない');
    if (GAME_CONFIG.FPS !== 60) throw new Error('FPS設定が正しくない');
});

runTest('ゲームクラスの存在確認', () => {
    if (typeof Game === 'undefined') throw new Error('Game クラスが定義されていない');
    if (typeof Ball === 'undefined') throw new Error('Ball クラスが定義されていない');
    if (typeof Paddle === 'undefined') throw new Error('Paddle クラスが定義されていない');
    if (typeof Block === 'undefined') throw new Error('Block クラスが定義されていない');
    if (typeof BlockManager === 'undefined') throw new Error('BlockManager クラスが定義されていない');
    if (typeof InputHandler === 'undefined') throw new Error('InputHandler クラスが定義されていない');
    if (typeof CollisionDetector === 'undefined') throw new Error('CollisionDetector クラスが定義されていない');
});

runTest('Ball クラスの基本機能テスト', () => {
    const ball = new Ball();
    
    // 初期位置の確認
    if (ball.x !== GAME_CONFIG.CANVAS_WIDTH / 2) throw new Error('ボールの初期X位置が正しくない');
    if (ball.y !== GAME_CONFIG.CANVAS_HEIGHT / 2) throw new Error('ボールの初期Y位置が正しくない');
    
    // 基本メソッドの存在確認
    if (typeof ball.update !== 'function') throw new Error('update メソッドが存在しない');
    if (typeof ball.render !== 'function') throw new Error('render メソッドが存在しない');
    if (typeof ball.reverseX !== 'function') throw new Error('reverseX メソッドが存在しない');
    if (typeof ball.reverseY !== 'function') throw new Error('reverseY メソッドが存在しない');
    if (typeof ball.reset !== 'function') throw new Error('reset メソッドが存在しない');
    
    // 移動テスト
    const initialX = ball.x;
    const initialY = ball.y;
    ball.update();
    
    const moved = (ball.x !== initialX) || (ball.y !== initialY);
    if (!moved) throw new Error('ボールが移動していない');
    
    // 速度反転テスト
    const initialDx = ball.dx;
    const initialDy = ball.dy;
    ball.reverseX();
    ball.reverseY();
    
    if (ball.dx !== -initialDx) throw new Error('X方向の速度反転が正しくない');
    if (ball.dy !== -initialDy) throw new Error('Y方向の速度反転が正しくない');
    
    // リセットテスト
    ball.reset();
    if (ball.x !== GAME_CONFIG.CANVAS_WIDTH / 2) throw new Error('リセット後のX位置が正しくない');
    if (ball.y !== GAME_CONFIG.CANVAS_HEIGHT / 2) throw new Error('リセット後のY位置が正しくない');
});

runTest('Paddle クラスの基本機能テスト', () => {
    const paddle = new Paddle();
    
    // 初期位置の確認
    const expectedX = (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH) / 2;
    const expectedY = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE_Y_OFFSET;
    
    if (paddle.x !== expectedX) throw new Error('パドルの初期X位置が正しくない');
    if (paddle.y !== expectedY) throw new Error('パドルの初期Y位置が正しくない');
    
    // 基本メソッドの存在確認
    if (typeof paddle.update !== 'function') throw new Error('update メソッドが存在しない');
    if (typeof paddle.render !== 'function') throw new Error('render メソッドが存在しない');
    if (typeof paddle.moveLeft !== 'function') throw new Error('moveLeft メソッドが存在しない');
    if (typeof paddle.moveRight !== 'function') throw new Error('moveRight メソッドが存在しない');
    
    // 移動テスト
    const initialX = paddle.x;
    paddle.moveRight();
    if (paddle.x <= initialX) throw new Error('右移動が正しく動作しない');
    
    paddle.moveLeft();
    paddle.moveLeft();
    if (paddle.x >= initialX) throw new Error('左移動が正しく動作しない');
    
    // 境界制限テスト
    paddle.x = -100; // 画面外に設定
    paddle.update();
    if (paddle.x < 0) throw new Error('左境界制限が正しく動作しない');
    
    paddle.x = GAME_CONFIG.CANVAS_WIDTH + 100; // 画面外に設定
    paddle.update();
    if (paddle.x + paddle.width > GAME_CONFIG.CANVAS_WIDTH) throw new Error('右境界制限が正しく動作しない');
});

runTest('Block クラスの基本機能テスト', () => {
    const block = new Block(100, 100, 0);
    
    // 初期状態の確認
    if (block.x !== 100) throw new Error('ブロックの初期X位置が正しくない');
    if (block.y !== 100) throw new Error('ブロックの初期Y位置が正しくない');
    if (block.destroyed !== false) throw new Error('ブロックの初期破壊状態が正しくない');
    
    // 基本メソッドの存在確認
    if (typeof block.render !== 'function') throw new Error('render メソッドが存在しない');
    if (typeof block.destroy !== 'function') throw new Error('destroy メソッドが存在しない');
    if (typeof block.isDestroyed !== 'function') throw new Error('isDestroyed メソッドが存在しない');
    if (typeof block.reset !== 'function') throw new Error('reset メソッドが存在しない');
    
    // 破壊テスト
    if (block.isDestroyed()) throw new Error('初期状態で破壊されている');
    
    const points = block.destroy();
    if (!block.isDestroyed()) throw new Error('破壊後に破壊状態になっていない');
    if (points <= 0) throw new Error('破壊時にポイントが返されない');
    
    // 重複破壊テスト
    const secondPoints = block.destroy();
    if (secondPoints !== 0) throw new Error('既に破壊されたブロックからポイントが返される');
    
    // リセットテスト
    block.reset();
    if (block.isDestroyed()) throw new Error('リセット後に破壊状態が残っている');
});

runTest('BlockManager クラスの基本機能テスト', () => {
    const blockManager = new BlockManager();
    
    // 基本メソッドの存在確認
    if (typeof blockManager.initializeBlocks !== 'function') throw new Error('initializeBlocks メソッドが存在しない');
    if (typeof blockManager.renderAll !== 'function') throw new Error('renderAll メソッドが存在しない');
    if (typeof blockManager.getActiveBlocks !== 'function') throw new Error('getActiveBlocks メソッドが存在しない');
    if (typeof blockManager.areAllBlocksDestroyed !== 'function') throw new Error('areAllBlocksDestroyed メソッドが存在しない');
    if (typeof blockManager.getStats !== 'function') throw new Error('getStats メソッドが存在しない');
    
    // ブロック初期化テスト
    const blocks = blockManager.initializeBlocks();
    const expectedTotal = GAME_CONFIG.BLOCK_ROWS * GAME_CONFIG.BLOCK_COLS;
    
    if (blocks.length !== expectedTotal) throw new Error(`ブロック数が正しくない: 期待値${expectedTotal}, 実際${blocks.length}`);
    
    // 統計情報テスト
    const stats = blockManager.getStats();
    if (stats.total !== expectedTotal) throw new Error('統計の総数が正しくない');
    if (stats.active !== expectedTotal) throw new Error('統計のアクティブ数が正しくない');
    if (stats.destroyed !== 0) throw new Error('統計の破壊数が正しくない');
    if (stats.percentage !== 0) throw new Error('統計のパーセンテージが正しくない');
    
    // ブロック破壊テスト
    if (blocks.length > 0) {
        blocks[0].destroy();
        const newStats = blockManager.getStats();
        if (newStats.destroyed !== 1) throw new Error('ブロック破壊後の統計が正しくない');
        if (newStats.active !== expectedTotal - 1) throw new Error('ブロック破壊後のアクティブ数が正しくない');
    }
    
    // 全破壊テスト
    blocks.forEach(block => block.destroy());
    if (!blockManager.areAllBlocksDestroyed()) throw new Error('全ブロック破壊の判定が正しくない');
    
    // リセットテスト
    blockManager.resetAll();
    const resetStats = blockManager.getStats();
    if (resetStats.destroyed !== 0) throw new Error('リセット後の破壊数が正しくない');
    if (resetStats.active !== expectedTotal) throw new Error('リセット後のアクティブ数が正しくない');
});

runTest('InputHandler クラスの基本機能テスト', () => {
    const inputHandler = new InputHandler();
    
    // 基本メソッドの存在確認
    if (typeof inputHandler.init !== 'function') throw new Error('init メソッドが存在しない');
    if (typeof inputHandler.isKeyPressed !== 'function') throw new Error('isKeyPressed メソッドが存在しない');
    if (typeof inputHandler.isLeftPressed !== 'function') throw new Error('isLeftPressed メソッドが存在しない');
    if (typeof inputHandler.isRightPressed !== 'function') throw new Error('isRightPressed メソッドが存在しない');
    if (typeof inputHandler.isSpacePressed !== 'function') throw new Error('isSpacePressed メソッドが存在しない');
    
    // 初期化テスト
    inputHandler.init();
    if (!inputHandler.initialized) throw new Error('初期化フラグが設定されていない');
    
    // キー状態テスト
    if (inputHandler.isLeftPressed()) throw new Error('初期状態で左キーが押されている');
    if (inputHandler.isRightPressed()) throw new Error('初期状態で右キーが押されている');
    if (inputHandler.isSpacePressed()) throw new Error('初期状態でスペースキーが押されている');
    
    // キーイベントシミュレーション
    const keyDownEvent = {
        key: 'ArrowLeft',
        preventDefault: () => {}
    };
    
    inputHandler.handleKeyDown(keyDownEvent);
    if (!inputHandler.isLeftPressed()) throw new Error('キーダウン後に左キーが押されていない');
    
    const keyUpEvent = {
        key: 'ArrowLeft'
    };
    
    inputHandler.handleKeyUp(keyUpEvent);
    if (inputHandler.isLeftPressed()) throw new Error('キーアップ後に左キーが押されている');
});

runTest('CollisionDetector クラスの基本機能テスト', () => {
    const collisionDetector = new CollisionDetector();
    const ball = new Ball();
    const paddle = new Paddle();
    const block = new Block(100, 100, 0);
    
    // 基本メソッドの存在確認
    if (typeof collisionDetector.rectIntersect !== 'function') throw new Error('rectIntersect メソッドが存在しない');
    if (typeof collisionDetector.checkBallPaddleCollision !== 'function') throw new Error('checkBallPaddleCollision メソッドが存在しない');
    if (typeof collisionDetector.checkBallBlockCollision !== 'function') throw new Error('checkBallBlockCollision メソッドが存在しない');
    if (typeof collisionDetector.checkBallWallCollision !== 'function') throw new Error('checkBallWallCollision メソッドが存在しない');
    
    // 矩形衝突判定テスト
    const rect1 = { x: 0, y: 0, width: 10, height: 10 };
    const rect2 = { x: 5, y: 5, width: 10, height: 10 };
    const rect3 = { x: 20, y: 20, width: 10, height: 10 };
    
    if (!collisionDetector.rectIntersect(rect1, rect2)) throw new Error('重複する矩形の衝突が検出されない');
    if (collisionDetector.rectIntersect(rect1, rect3)) throw new Error('離れた矩形で衝突が検出される');
    
    // ボールと壁の衝突テスト
    ball.x = ball.radius / 2; // 左壁に近づける
    const wallCollision = collisionDetector.checkBallWallCollision(ball, 800, 600);
    if (!wallCollision.left) throw new Error('左壁との衝突が検出されない');
    
    ball.x = 800 - ball.radius / 2; // 右壁に近づける
    const rightWallCollision = collisionDetector.checkBallWallCollision(ball, 800, 600);
    if (!rightWallCollision.right) throw new Error('右壁との衝突が検出されない');
    
    // ボールとパドルの衝突テスト
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius;
    const paddleCollision = collisionDetector.checkBallPaddleCollision(ball, paddle);
    if (!paddleCollision || !paddleCollision.collision) throw new Error('パドルとの衝突が検出されない');
    
    // ボールとブロックの衝突テスト
    ball.x = block.x + block.width / 2;
    ball.y = block.y + block.height + ball.radius;
    const blockCollision = collisionDetector.checkBallBlockCollision(ball, block);
    if (!blockCollision || !blockCollision.collision) throw new Error('ブロックとの衝突が検出されない');
});

runTest('Game クラスの統合初期化テスト', () => {
    const game = new Game();
    
    // 基本メソッドの存在確認
    if (typeof game.init !== 'function') throw new Error('init メソッドが存在しない');
    if (typeof game.startGame !== 'function') throw new Error('startGame メソッドが存在しない');
    if (typeof game.update !== 'function') throw new Error('update メソッドが存在しない');
    if (typeof game.render !== 'function') throw new Error('render メソッドが存在しない');
    if (typeof game.resetGame !== 'function') throw new Error('resetGame メソッドが存在しない');
    
    // 初期化テスト
    const initResult = game.init();
    if (!initResult) throw new Error('ゲーム初期化に失敗');
    if (!game.initialized) throw new Error('初期化フラグが設定されていない');
    
    // ゲーム要素の初期化確認
    if (!game.canvas) throw new Error('Canvasが初期化されていない');
    if (!game.ctx) throw new Error('Canvas contextが初期化されていない');
    if (!game.ball) throw new Error('Ballが初期化されていない');
    if (!game.paddle) throw new Error('Paddleが初期化されていない');
    if (!game.blockManager) throw new Error('BlockManagerが初期化されていない');
    if (!game.inputHandler) throw new Error('InputHandlerが初期化されていない');
    if (!game.collisionDetector) throw new Error('CollisionDetectorが初期化されていない');
    
    // 初期状態の確認
    if (game.getGameState() !== GameState.PLAYING) throw new Error('初期ゲーム状態が正しくない');
    if (game.getScore() !== 0) throw new Error('初期スコアが0でない');
    
    game.stopGameLoop();
});

// 2. ゲームプレイフローの動作確認
console.log('\n🎮 2. ゲームプレイフローの動作確認');
console.log('==================================');

runTest('ゲーム状態管理フロー', () => {
    const game = new Game();
    game.init();
    
    // 初期状態
    if (game.getGameState() !== GameState.PLAYING) throw new Error('初期状態がPLAYINGでない');
    
    // ゲームオーバー状態
    game.handleGameOver();
    if (game.getGameState() !== GameState.GAME_OVER) throw new Error('ゲームオーバー状態に遷移しない');
    
    // ゲームリセット
    game.resetGame();
    if (game.getGameState() !== GameState.PLAYING) throw new Error('リセット後にPLAYING状態に戻らない');
    if (game.getScore() !== 0) throw new Error('リセット後にスコアが0に戻らない');
    
    // ゲームクリア状態
    game.handleGameWin();
    if (game.getGameState() !== GameState.GAME_WIN) throw new Error('ゲームクリア状態に遷移しない');
    
    game.stopGameLoop();
});

runTest('スコアシステムフロー', () => {
    const game = new Game();
    game.init();
    
    const initialScore = game.getScore();
    if (initialScore !== 0) throw new Error('初期スコアが0でない');
    
    // スコア加算テスト
    game.addScore(100);
    if (game.getScore() !== 100) throw new Error('スコア加算が正しく動作しない');
    
    game.addScore(50);
    if (game.getScore() !== 150) throw new Error('複数回のスコア加算が正しく動作しない');
    
    // 無効なスコア加算テスト
    game.addScore(-10);
    if (game.getScore() !== 150) throw new Error('負のスコアが加算されてしまう');
    
    // スコアリセット
    game.resetGame();
    if (game.getScore() !== 0) throw new Error('リセット後にスコアが0に戻らない');
    
    game.stopGameLoop();
});

runTest('ブロック破壊とスコア加算フロー', () => {
    const game = new Game();
    game.init();
    
    const initialScore = game.getScore();
    const blocks = game.blockManager.getActiveBlocks();
    const initialBlockCount = blocks.length;
    
    if (blocks.length > 0) {
        const targetBlock = blocks[0];
        const expectedPoints = game.calculateBlockScore(targetBlock);
        
        // ブロック破壊
        const actualPoints = targetBlock.destroy();
        game.addScore(actualPoints);
        
        // 結果確認
        if (!targetBlock.isDestroyed()) throw new Error('ブロックが破壊されていない');
        if (game.getScore() !== initialScore + actualPoints) throw new Error('スコアが正しく加算されていない');
        if (actualPoints <= 0) throw new Error('破壊時のポイントが0以下');
        
        const newBlockCount = game.blockManager.getActiveBlocks().length;
        if (newBlockCount !== initialBlockCount - 1) throw new Error('アクティブブロック数が正しく減少していない');
    }
    
    game.stopGameLoop();
});

runTest('ゲーム終了条件フロー', () => {
    const game = new Game();
    game.init();
    
    // ゲームクリア条件：全ブロック破壊
    const blocks = game.blockManager.getActiveBlocks();
    blocks.forEach(block => block.destroy());
    
    game.checkGameEndConditions();
    if (game.getGameState() !== GameState.GAME_WIN) throw new Error('全ブロック破壊後にゲームクリア状態にならない');
    
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
    if (game.getScore() !== 0) throw new Error('リセット後にスコアが0に戻らない');
    if (game.getGameState() !== GameState.PLAYING) throw new Error('リセット後にPLAYING状態に戻らない');
    if (game.ball.x !== GAME_CONFIG.CANVAS_WIDTH / 2) throw new Error('リセット後にボールが初期位置に戻らない');
    if (game.paddle.x !== (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH) / 2) throw new Error('リセット後にパドルが初期位置に戻らない');
    
    const resetStats = game.blockManager.getStats();
    if (resetStats.destroyed !== 0) throw new Error('リセット後に破壊されたブロックが残っている');
    if (resetStats.active !== resetStats.total) throw new Error('リセット後にアクティブブロック数が総数と一致しない');
    
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
    
    // 描画時間の要件確認（Node.js環境では緩い基準）
    if (averageRenderTime > 20) throw new Error(`平均描画時間が遅すぎる: ${averageRenderTime.toFixed(3)}ms`);
    if (maxRenderTime > 100) throw new Error(`最大描画時間が遅すぎる: ${maxRenderTime.toFixed(3)}ms`);
    
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
    
    // 更新時間の要件確認（Node.js環境では緩い基準）
    if (averageUpdateTime > 10) throw new Error(`平均更新時間が遅すぎる: ${averageUpdateTime.toFixed(3)}ms`);
    if (maxUpdateTime > 50) throw new Error(`最大更新時間が遅すぎる: ${maxUpdateTime.toFixed(3)}ms`);
    
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
    
    // 衝突検出時間の要件確認（Node.js環境では緩い基準）
    if (averageCollisionTime > 2) throw new Error(`平均衝突検出時間が遅すぎる: ${averageCollisionTime.toFixed(4)}ms`);
    if (maxCollisionTime > 10) throw new Error(`最大衝突検出時間が遅すぎる: ${maxCollisionTime.toFixed(4)}ms`);
    
    game.stopGameLoop();
});

// 4. ブラウザ互換性テスト（Node.js環境での基本確認）
console.log('\n🌐 4. ブラウザ互換性テスト');
console.log('==========================');

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
    if (instance.getValue() !== 'test') throw new Error('クラス構文が正しく動作しない');
    
    // アロー関数
    const arrowFunc = (x, y) => x + y;
    if (arrowFunc(2, 3) !== 5) throw new Error('アロー関数が正しく動作しない');
    
    // const/let
    const constVar = 'constant';
    let letVar = 'variable';
    if (constVar !== 'constant' || letVar !== 'variable') throw new Error('const/letが正しく動作しない');
    
    // テンプレートリテラル
    const name = 'World';
    const greeting = `Hello, ${name}!`;
    if (greeting !== 'Hello, World!') throw new Error('テンプレートリテラルが正しく動作しない');
    
    // デストラクチャリング
    const obj = { a: 1, b: 2 };
    const { a, b } = obj;
    if (a !== 1 || b !== 2) throw new Error('デストラクチャリングが正しく動作しない');
    
    // スプレッド演算子
    const arr1 = [1, 2, 3];
    const arr2 = [...arr1, 4, 5];
    if (arr2.length !== 5 || arr2[4] !== 5) throw new Error('スプレッド演算子が正しく動作しない');
});

runTest('Canvas API基本互換性テスト', () => {
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
    if (ctx.fillStyle !== '#ff0000') throw new Error('fillStyleの設定が正しく動作しない');
    
    ctx.strokeStyle = '#00ff00';
    if (ctx.strokeStyle !== '#00ff00') throw new Error('strokeStyleの設定が正しく動作しない');
    
    ctx.lineWidth = 5;
    if (ctx.lineWidth !== 5) throw new Error('lineWidthの設定が正しく動作しない');
    
    game.stopGameLoop();
});

runTest('HTML5 Canvas要素の互換性テスト', () => {
    const canvas = document.getElementById('gameCanvas');
    
    // Canvas要素の基本プロパティ
    if (canvas.width !== 800) throw new Error('Canvas幅が正しく設定されていない');
    if (canvas.height !== 600) throw new Error('Canvas高さが正しく設定されていない');
    if (canvas.tagName.toLowerCase() !== 'canvas') throw new Error('Canvas要素のtagNameが正しくない');
    
    // 2Dコンテキストの取得
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2Dコンテキストが取得できない');
    if (typeof ctx !== 'object') throw new Error('2Dコンテキストがオブジェクトでない');
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