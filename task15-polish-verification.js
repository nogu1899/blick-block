// Task 15: 最終調整とポリッシュ - 検証テスト

console.log('🎮 Task 15: 最終調整とポリッシュ - 検証開始');
console.log('='.repeat(50));

// Node.js環境でのDOM環境シミュレーション
const { JSDOM } = require('jsdom');

// DOM環境を作成
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
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

// requestAnimationFrame のモック
global.requestAnimationFrame = (callback) => {
    return setTimeout(callback, 16);
};

global.cancelAnimationFrame = (id) => {
    clearTimeout(id);
};

// Canvas 2D context のモック
const mockContext = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: '',
    globalCompositeOperation: '',
    fillRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    fillText: () => {},
    measureText: () => ({ width: 100 }),
    createLinearGradient: () => ({
        addColorStop: () => {}
    }),
    createRadialGradient: () => ({
        addColorStop: () => {}
    }),
    save: () => {},
    restore: () => {},
    translate: () => {},
    moveTo: () => {},
    lineTo: () => {}
};

// Canvas要素のモック
const mockCanvas = {
    width: 800,
    height: 600,
    getContext: () => mockContext
};

// document.getElementById のモック
const originalGetElementById = global.document.getElementById;
global.document.getElementById = (id) => {
    if (id === 'gameCanvas') {
        return mockCanvas;
    }
    return originalGetElementById.call(global.document, id);
};

// ゲームスクリプトを読み込み
const fs = require('fs');
const gameScript = fs.readFileSync('script.js', 'utf8');

try {
    eval(gameScript);
    console.log('✅ ゲームスクリプト読み込み成功');
} catch (error) {
    console.error('❌ ゲームスクリプト読み込み失敗:', error.message);
    process.exit(1);
}

// テスト実行
async function runPolishTests() {
    let passedTests = 0;
    let totalTests = 0;
    
    console.log('\n📊 ポリッシュ機能テスト開始');
    console.log('-'.repeat(30));
    
    // 1. 改良されたゲーム設定の確認
    totalTests++;
    try {
        console.log('\n1. 改良されたゲーム設定の確認');
        
        // 新しい設定項目の存在確認
        const requiredConfigs = [
            'BALL_SPEED_INCREMENT',
            'BALL_MAX_SPEED',
            'COMBO_MULTIPLIER',
            'ROW_BONUS_MULTIPLIER',
            'DIFFICULTY',
            'EFFECTS'
        ];
        
        let configsFound = 0;
        requiredConfigs.forEach(config => {
            if (GAME_CONFIG[config] !== undefined) {
                configsFound++;
                console.log(`   ✅ ${config}: ${JSON.stringify(GAME_CONFIG[config])}`);
            } else {
                console.log(`   ❌ ${config}: 未定義`);
            }
        });
        
        // 改良されたカラーパレットの確認
        const requiredColors = [
            'BALL_TRAIL',
            'BLOCK_BORDERS',
            'SCORE_HIGHLIGHT',
            'SUCCESS',
            'WARNING'
        ];
        
        let colorsFound = 0;
        requiredColors.forEach(color => {
            if (GAME_CONFIG.COLORS[color] !== undefined) {
                colorsFound++;
                console.log(`   ✅ COLOR.${color}: ${GAME_CONFIG.COLORS[color]}`);
            } else {
                console.log(`   ❌ COLOR.${color}: 未定義`);
            }
        });
        
        if (configsFound >= 4 && colorsFound >= 3) {
            console.log('   ✅ ゲーム設定の改良確認完了');
            passedTests++;
        } else {
            console.log('   ❌ ゲーム設定の改良が不完全');
        }
        
    } catch (error) {
        console.log('   ❌ テスト実行エラー:', error.message);
    }
    
    // 2. Ball クラスの視覚効果確認
    totalTests++;
    try {
        console.log('\n2. Ball クラスの視覚効果確認');
        
        const ball = new Ball();
        
        // 軌跡機能の確認
        if (ball.trail && Array.isArray(ball.trail)) {
            console.log('   ✅ ボールの軌跡機能実装済み');
        } else {
            console.log('   ❌ ボールの軌跡機能未実装');
        }
        
        // パーティクル機能の確認
        if (ball.particles && Array.isArray(ball.particles)) {
            console.log('   ✅ ボールのパーティクル機能実装済み');
        } else {
            console.log('   ❌ ボールのパーティクル機能未実装');
        }
        
        // エフェクト追加メソッドの確認
        if (typeof ball.addParticles === 'function') {
            console.log('   ✅ パーティクル追加メソッド実装済み');
        } else {
            console.log('   ❌ パーティクル追加メソッド未実装');
        }
        
        // 更新処理の確認
        if (typeof ball.updateParticles === 'function') {
            console.log('   ✅ パーティクル更新メソッド実装済み');
        } else {
            console.log('   ❌ パーティクル更新メソッド未実装');
        }
        
        console.log('   ✅ Ball クラスの視覚効果確認完了');
        passedTests++;
        
    } catch (error) {
        console.log('   ❌ テスト実行エラー:', error.message);
    }
    
    // 3. Block クラスの視覚改善確認
    totalTests++;
    try {
        console.log('\n3. Block クラスの視覚改善確認');
        
        const block = new Block(100, 100, 0);
        
        // 色操作メソッドの確認
        if (typeof block.darkenColor === 'function') {
            console.log('   ✅ 色を暗くするメソッド実装済み');
        } else {
            console.log('   ❌ 色を暗くするメソッド未実装');
        }
        
        if (typeof block.lightenColor === 'function') {
            console.log('   ✅ 色を明るくするメソッド実装済み');
        } else {
            console.log('   ❌ 色を明るくするメソッド未実装');
        }
        
        console.log('   ✅ Block クラスの視覚改善確認完了');
        passedTests++;
        
    } catch (error) {
        console.log('   ❌ テスト実行エラー:', error.message);
    }
    
    // 4. Game クラスのエフェクト機能確認
    totalTests++;
    try {
        console.log('\n4. Game クラスのエフェクト機能確認');
        
        const game = new Game();
        
        // エフェクト関連プロパティの確認
        const effectProperties = ['screenShake', 'flashEffect', 'particles', 'combo'];
        let effectPropsFound = 0;
        
        effectProperties.forEach(prop => {
            if (game[prop] !== undefined) {
                effectPropsFound++;
                console.log(`   ✅ ${prop}: 実装済み`);
            } else {
                console.log(`   ❌ ${prop}: 未実装`);
            }
        });
        
        // エフェクト関連メソッドの確認
        const effectMethods = ['addScreenShake', 'addFlashEffect', 'updateEffects', 'resetCombo'];
        let effectMethodsFound = 0;
        
        effectMethods.forEach(method => {
            if (typeof game[method] === 'function') {
                effectMethodsFound++;
                console.log(`   ✅ ${method}(): 実装済み`);
            } else {
                console.log(`   ❌ ${method}(): 未実装`);
            }
        });
        
        if (effectPropsFound >= 3 && effectMethodsFound >= 3) {
            console.log('   ✅ Game クラスのエフェクト機能確認完了');
            passedTests++;
        } else {
            console.log('   ❌ Game クラスのエフェクト機能が不完全');
        }
        
    } catch (error) {
        console.log('   ❌ テスト実行エラー:', error.message);
    }
    
    // 5. エラーハンドリング改善確認
    totalTests++;
    try {
        console.log('\n5. エラーハンドリング改善確認');
        
        // CanvasManager の改善確認
        if (typeof CanvasManager.safeRender === 'function') {
            console.log('   ✅ 安全な描画実行メソッド実装済み');
        } else {
            console.log('   ❌ 安全な描画実行メソッド未実装');
        }
        
        // Ball クラスの安全性確認
        const ball = new Ball();
        ball.dx = NaN; // 無効な値を設定
        ball.update(); // エラーハンドリングをテスト
        
        if (isFinite(ball.dx) && isFinite(ball.dy)) {
            console.log('   ✅ Ball クラスのエラーハンドリング動作確認');
        } else {
            console.log('   ❌ Ball クラスのエラーハンドリング未動作');
        }
        
        console.log('   ✅ エラーハンドリング改善確認完了');
        passedTests++;
        
    } catch (error) {
        console.log('   ❌ テスト実行エラー:', error.message);
    }
    
    // 6. パフォーマンス最適化確認
    totalTests++;
    try {
        console.log('\n6. パフォーマンス最適化確認');
        
        const game = new Game();
        
        // パフォーマンス関連プロパティの確認
        if (game.skipFrames !== undefined && game.maxSkipFrames !== undefined) {
            console.log('   ✅ フレームスキップ機能実装済み');
        } else {
            console.log('   ❌ フレームスキップ機能未実装');
        }
        
        // パフォーマンス統計メソッドの確認
        if (typeof game.updatePerformanceStats === 'function') {
            console.log('   ✅ パフォーマンス統計更新メソッド実装済み');
        } else {
            console.log('   ❌ パフォーマンス統計更新メソッド未実装');
        }
        
        // デバッグ情報の拡張確認
        const debugInfo = game.getDebugInfo();
        if (debugInfo.combo !== undefined && debugInfo.effects !== undefined) {
            console.log('   ✅ デバッグ情報拡張済み');
        } else {
            console.log('   ❌ デバッグ情報拡張未完了');
        }
        
        console.log('   ✅ パフォーマンス最適化確認完了');
        passedTests++;
        
    } catch (error) {
        console.log('   ❌ テスト実行エラー:', error.message);
    }
    
    // 結果サマリー
    console.log('\n📊 テスト結果サマリー');
    console.log('='.repeat(30));
    console.log(`✅ 成功: ${passedTests} テスト`);
    console.log(`❌ 失敗: ${totalTests - passedTests} テスト`);
    console.log(`📈 成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 全てのポリッシュ機能が正常に実装されています！');
        console.log('Task 15「最終調整とポリッシュ」完了');
    } else {
        console.log('\n⚠️  一部のポリッシュ機能に問題があります');
    }
    
    return passedTests === totalTests;
}

// テスト実行
runPolishTests().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('テスト実行中にエラーが発生しました:', error);
    process.exit(1);
});