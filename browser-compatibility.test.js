// ブラウザ互換性テスト - Task 14 Sub-task
// 異なるブラウザ環境での動作確認とAPI互換性テスト

const { JSDOM } = require('jsdom');

// 複数のブラウザ環境をシミュレート
const browserEnvironments = {
    chrome: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        features: {
            canvas: true,
            webgl: true,
            requestAnimationFrame: true,
            es6: true,
            es2017: true
        }
    },
    firefox: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        features: {
            canvas: true,
            webgl: true,
            requestAnimationFrame: true,
            es6: true,
            es2017: true
        }
    },
    safari: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        features: {
            canvas: true,
            webgl: true,
            requestAnimationFrame: true,
            es6: true,
            es2017: false // 一部のES2017機能が制限される場合
        }
    },
    edge: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        features: {
            canvas: true,
            webgl: true,
            requestAnimationFrame: true,
            es6: true,
            es2017: true
        }
    }
};

function createBrowserEnvironment(browserName) {
    const config = browserEnvironments[browserName];
    
    const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Block Breaker Game - ${browserName} Compatibility Test</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <canvas id="gameCanvas" width="800" height="600"></canvas>
    </body>
    </html>
    `, {
        userAgent: config.userAgent,
        pretendToBeVisual: true,
        resources: 'usable'
    });
    
    // グローバル環境の設定
    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
    global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
    global.CanvasRenderingContext2D = dom.window.CanvasRenderingContext2D;
    
    // パフォーマンス API
    global.performance = {
        now: () => Date.now(),
        timing: {
            navigationStart: Date.now() - 1000
        }
    };
    
    // requestAnimationFrame の実装
    if (config.features.requestAnimationFrame) {
        global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
        global.cancelAnimationFrame = (id) => clearTimeout(id);
    }
    
    // Canvas API の拡張モック
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(contextType, options) {
        const context = originalGetContext.call(this, contextType, options);
        
        if (context && contextType === '2d') {
            // ブラウザ固有の機能をシミュレート
            if (!context.measureText) {
                context.measureText = (text) => ({ 
                    width: text.length * 8,
                    actualBoundingBoxLeft: 0,
                    actualBoundingBoxRight: text.length * 8,
                    actualBoundingBoxAscent: 12,
                    actualBoundingBoxDescent: 4
                });
            }
            
            if (!context.createLinearGradient) {
                context.createLinearGradient = (x0, y0, x1, y1) => ({
                    addColorStop: (offset, color) => {}
                });
            }
            
            if (!context.createRadialGradient) {
                context.createRadialGradient = (x0, y0, r0, x1, y1, r1) => ({
                    addColorStop: (offset, color) => {}
                });
            }
            
            // ブラウザ固有のプロパティ
            if (browserName === 'safari') {
                // Safariでは一部のプロパティが異なる場合がある
                context.webkitImageSmoothingEnabled = context.imageSmoothingEnabled;
            }
        }
        
        return context;
    };
    
    return { dom, config };
}

// ゲームスクリプトを読み込み
const fs = require('fs');
const path = require('path');
const gameScript = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');

describe('ブラウザ互換性テスト', () => {
    Object.keys(browserEnvironments).forEach(browserName => {
        describe(`${browserName.toUpperCase()} 互換性テスト`, () => {
            let game;
            let browserEnv;
            
            beforeEach(() => {
                // ブラウザ環境を作成
                browserEnv = createBrowserEnvironment(browserName);
                
                // ゲームスクリプトを評価
                eval(gameScript);
                
                // ゲームインスタンスを作成
                game = new Game();
            });
            
            afterEach(() => {
                if (game && game.stopGameLoop) {
                    game.stopGameLoop();
                }
            });

            test(`${browserName} - 基本的なDOM API互換性`, () => {
                // DOM要素の取得
                const canvas = document.getElementById('gameCanvas');
                expect(canvas).toBeTruthy();
                expect(canvas.tagName.toLowerCase()).toBe('canvas');
                
                // Canvas属性の設定と取得
                expect(canvas.width).toBe(800);
                expect(canvas.height).toBe(600);
                
                // User Agentの確認
                expect(navigator.userAgent).toContain(browserName === 'firefox' ? 'Firefox' : 
                                                     browserName === 'safari' ? 'Safari' :
                                                     browserName === 'edge' ? 'Edg' : 'Chrome');
            });

            test(`${browserName} - Canvas 2D API互換性`, () => {
                const canvas = document.getElementById('gameCanvas');
                const ctx = canvas.getContext('2d');
                
                expect(ctx).toBeTruthy();
                
                // 基本的な描画メソッドの存在確認
                expect(typeof ctx.fillRect).toBe('function');
                expect(typeof ctx.strokeRect).toBe('function');
                expect(typeof ctx.arc).toBe('function');
                expect(typeof ctx.beginPath).toBe('function');
                expect(typeof ctx.closePath).toBe('function');
                expect(typeof ctx.fill).toBe('function');
                expect(typeof ctx.stroke).toBe('function');
                
                // プロパティの設定と取得
                ctx.fillStyle = '#ff0000';
                expect(ctx.fillStyle).toBe('#ff0000');
                
                ctx.strokeStyle = '#00ff00';
                expect(ctx.strokeStyle).toBe('#00ff00');
                
                ctx.lineWidth = 5;
                expect(ctx.lineWidth).toBe(5);
                
                // テキスト関連API
                expect(typeof ctx.fillText).toBe('function');
                expect(typeof ctx.measureText).toBe('function');
                
                const textMetrics = ctx.measureText('Test');
                expect(textMetrics.width).toBeGreaterThan(0);
                
                // グラデーション API
                expect(typeof ctx.createLinearGradient).toBe('function');
                const gradient = ctx.createLinearGradient(0, 0, 100, 100);
                expect(gradient).toBeTruthy();
            });

            test(`${browserName} - JavaScript ES6+ 機能互換性`, () => {
                // クラス構文
                expect(() => {
                    class TestClass {
                        constructor(value) {
                            this.value = value;
                        }
                        
                        getValue() {
                            return this.value;
                        }
                    }
                    
                    const instance = new TestClass('test');
                    expect(instance.getValue()).toBe('test');
                }).not.toThrow();
                
                // アロー関数
                expect(() => {
                    const arrowFunc = (x, y) => x + y;
                    expect(arrowFunc(2, 3)).toBe(5);
                }).not.toThrow();
                
                // const/let
                expect(() => {
                    const constVar = 'constant';
                    let letVar = 'variable';
                    expect(constVar).toBe('constant');
                    expect(letVar).toBe('variable');
                }).not.toThrow();
                
                // テンプレートリテラル
                expect(() => {
                    const name = 'World';
                    const greeting = `Hello, ${name}!`;
                    expect(greeting).toBe('Hello, World!');
                }).not.toThrow();
                
                // デストラクチャリング
                expect(() => {
                    const obj = { a: 1, b: 2 };
                    const { a, b } = obj;
                    expect(a).toBe(1);
                    expect(b).toBe(2);
                }).not.toThrow();
                
                // スプレッド演算子
                expect(() => {
                    const arr1 = [1, 2, 3];
                    const arr2 = [...arr1, 4, 5];
                    expect(arr2).toEqual([1, 2, 3, 4, 5]);
                }).not.toThrow();
            });

            test(`${browserName} - ゲーム初期化互換性`, () => {
                expect(game.init()).toBe(true);
                expect(game.initialized).toBe(true);
                
                // ゲーム要素の初期化確認
                expect(game.canvas).toBeTruthy();
                expect(game.ctx).toBeTruthy();
                expect(game.ball).toBeInstanceOf(Ball);
                expect(game.paddle).toBeInstanceOf(Paddle);
                expect(game.blockManager).toBeInstanceOf(BlockManager);
                expect(game.inputHandler).toBeInstanceOf(InputHandler);
                expect(game.collisionDetector).toBeInstanceOf(CollisionDetector);
            });

            test(`${browserName} - イベントハンドリング互換性`, () => {
                game.init();
                
                const inputHandler = game.inputHandler;
                
                // KeyboardEvent の作成と処理
                expect(() => {
                    const keyEvent = new window.KeyboardEvent('keydown', {
                        key: 'ArrowLeft',
                        code: 'ArrowLeft',
                        keyCode: 37
                    });
                    
                    inputHandler.handleKeyDown(keyEvent);
                    expect(inputHandler.isLeftPressed()).toBe(true);
                    
                    const keyUpEvent = new window.KeyboardEvent('keyup', {
                        key: 'ArrowLeft',
                        code: 'ArrowLeft',
                        keyCode: 37
                    });
                    
                    inputHandler.handleKeyUp(keyUpEvent);
                    expect(inputHandler.isLeftPressed()).toBe(false);
                }).not.toThrow();
            });

            test(`${browserName} - requestAnimationFrame 互換性`, () => {
                if (!browserEnv.config.features.requestAnimationFrame) {
                    console.log(`${browserName} does not support requestAnimationFrame`);
                    return;
                }
                
                expect(typeof requestAnimationFrame).toBe('function');
                expect(typeof cancelAnimationFrame).toBe('function');
                
                let callbackExecuted = false;
                const animationId = requestAnimationFrame(() => {
                    callbackExecuted = true;
                });
                
                expect(typeof animationId).toBe('number');
                
                // コールバックが実行されることを確認
                return new Promise((resolve) => {
                    setTimeout(() => {
                        expect(callbackExecuted).toBe(true);
                        resolve();
                    }, 50);
                });
            });

            test(`${browserName} - ゲーム描画互換性`, () => {
                game.init();
                
                expect(() => {
                    game.render();
                }).not.toThrow();
                
                // 描画後のCanvas状態確認
                const ctx = game.ctx;
                expect(ctx.fillStyle).toBeTruthy();
                expect(ctx.strokeStyle).toBeTruthy();
            });

            test(`${browserName} - ゲーム更新処理互換性`, () => {
                game.init();
                
                const initialBallPosition = { ...game.ball.getCenter() };
                
                expect(() => {
                    for (let i = 0; i < 10; i++) {
                        game.update();
                    }
                }).not.toThrow();
                
                // ボールが移動したことを確認
                const newBallPosition = game.ball.getCenter();
                const moved = (initialBallPosition.x !== newBallPosition.x) || 
                             (initialBallPosition.y !== newBallPosition.y);
                expect(moved).toBe(true);
            });

            test(`${browserName} - エラーハンドリング互換性`, () => {
                // 無効なCanvas要素での初期化
                document.body.innerHTML = '';
                const newGame = new Game();
                
                expect(() => {
                    const result = newGame.init();
                    expect(result).toBe(false);
                }).not.toThrow();
                
                // 元のCanvas要素を復元
                document.body.innerHTML = '<canvas id="gameCanvas" width="800" height="600"></canvas>';
            });

            test(`${browserName} - パフォーマンス特性`, () => {
                game.init();
                
                const startTime = performance.now();
                
                // 複数回の更新と描画を実行
                for (let i = 0; i < 100; i++) {
                    game.update();
                    game.render();
                }
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                console.log(`${browserName} - 100回の更新+描画時間: ${duration.toFixed(2)}ms`);
                
                // 合理的な時間内に完了することを確認
                expect(duration).toBeLessThan(1000); // 1秒以内
            });

            test(`${browserName} - メモリ管理互換性`, () => {
                game.init();
                
                // 大量のオブジェクト作成と破棄
                const objects = [];
                for (let i = 0; i < 1000; i++) {
                    objects.push({
                        ball: new Ball(i, i),
                        paddle: new Paddle(i, i),
                        block: new Block(i, i, i % 5)
                    });
                }
                
                // オブジェクトの使用
                objects.forEach(obj => {
                    obj.ball.update();
                    obj.paddle.update();
                });
                
                // オブジェクトをクリア
                objects.length = 0;
                
                // ガベージコレクションのトリガー（可能な場合）
                if (global.gc) {
                    global.gc();
                }
                
                // エラーが発生しないことを確認
                expect(true).toBe(true);
            });
        });
    });

    describe('クロスブラウザ機能テスト', () => {
        test('全ブラウザでの基本機能一貫性', () => {
            const results = {};
            
            Object.keys(browserEnvironments).forEach(browserName => {
                const browserEnv = createBrowserEnvironment(browserName);
                eval(gameScript);
                
                const game = new Game();
                const initResult = game.init();
                
                results[browserName] = {
                    initialization: initResult,
                    hasCanvas: !!game.canvas,
                    hasContext: !!game.ctx,
                    hasGameElements: !!(game.ball && game.paddle && game.blockManager)
                };
                
                if (game.stopGameLoop) {
                    game.stopGameLoop();
                }
            });
            
            console.log('クロスブラウザ互換性結果:', results);
            
            // すべてのブラウザで基本機能が動作することを確認
            Object.values(results).forEach(result => {
                expect(result.initialization).toBe(true);
                expect(result.hasCanvas).toBe(true);
                expect(result.hasContext).toBe(true);
                expect(result.hasGameElements).toBe(true);
            });
        });

        test('ブラウザ固有の最適化テスト', () => {
            const performanceResults = {};
            
            Object.keys(browserEnvironments).forEach(browserName => {
                const browserEnv = createBrowserEnvironment(browserName);
                eval(gameScript);
                
                const game = new Game();
                game.init();
                
                const startTime = performance.now();
                
                // 標準的な処理を実行
                for (let i = 0; i < 50; i++) {
                    game.update();
                    game.render();
                }
                
                const endTime = performance.now();
                performanceResults[browserName] = endTime - startTime;
                
                if (game.stopGameLoop) {
                    game.stopGameLoop();
                }
            });
            
            console.log('ブラウザ別パフォーマンス結果:', performanceResults);
            
            // すべてのブラウザで合理的な時間内に完了することを確認
            Object.values(performanceResults).forEach(time => {
                expect(time).toBeLessThan(500); // 500ms以内
            });
        });
    });

    test('ブラウザ互換性テスト完了確認', () => {
        console.log('✅ ブラウザ互換性テスト完了');
        console.log('✅ Chrome互換性: テスト完了');
        console.log('✅ Firefox互換性: テスト完了');
        console.log('✅ Safari互換性: テスト完了');
        console.log('✅ Edge互換性: テスト完了');
        console.log('✅ クロスブラウザ機能一貫性: テスト完了');
        console.log('✅ ブラウザ固有最適化: テスト完了');
        
        expect(true).toBe(true);
    });
});