// Ball クラスの単体テスト

// テスト用のモックCanvas設定
const mockCanvas = {
    width: 800,
    height: 600
};

const mockCtx = {
    fillStyle: '',
    beginPath: function() {},
    arc: function() {},
    fill: function() {},
    calls: {
        beginPath: 0,
        arc: [],
        fill: 0
    },
    reset: function() {
        this.calls.beginPath = 0;
        this.calls.arc = [];
        this.calls.fill = 0;
    }
};

// モックのメソッドを追跡
mockCtx.beginPath = function() { this.calls.beginPath++; };
mockCtx.arc = function(x, y, radius, start, end) { 
    this.calls.arc.push({x, y, radius, start, end}); 
};
mockCtx.fill = function() { this.calls.fill++; };

// テストヘルパー関数
function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: Expected ${expected}, got ${actual}`);
    }
}

function assertAlmostEqual(actual, expected, tolerance = 0.001, message) {
    if (Math.abs(actual - expected) > tolerance) {
        throw new Error(`${message}: Expected ${expected} (±${tolerance}), got ${actual}`);
    }
}

function assertTrue(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function runTest(testName, testFunction) {
    try {
        testFunction();
        console.log(`✓ ${testName}`);
        return true;
    } catch (error) {
        console.error(`✗ ${testName}: ${error.message}`);
        return false;
    }
}

// Ball クラスのテスト
function testBallConstruction() {
    // デフォルト位置でのコンストラクション
    const ball1 = new Ball();
    assertEqual(ball1.x, GAME_CONFIG.CANVAS_WIDTH / 2, 'Default X position');
    assertEqual(ball1.y, GAME_CONFIG.CANVAS_HEIGHT / 2, 'Default Y position');
    assertEqual(ball1.radius, GAME_CONFIG.BALL_RADIUS, 'Ball radius');
    assertEqual(ball1.speed, GAME_CONFIG.BALL_SPEED, 'Ball speed');
    assertEqual(ball1.color, GAME_CONFIG.COLORS.BALL, 'Ball color');
    
    // 指定位置でのコンストラクション
    const ball2 = new Ball(100, 200);
    assertEqual(ball2.x, 100, 'Custom X position');
    assertEqual(ball2.y, 200, 'Custom Y position');
    
    // 初期速度の確認
    const expectedDx = GAME_CONFIG.BALL_SPEED * Math.cos(GAME_CONFIG.BALL_INITIAL_ANGLE);
    const expectedDy = GAME_CONFIG.BALL_SPEED * Math.sin(GAME_CONFIG.BALL_INITIAL_ANGLE);
    assertAlmostEqual(ball1.dx, expectedDx, 0.001, 'Initial dx velocity');
    assertAlmostEqual(ball1.dy, expectedDy, 0.001, 'Initial dy velocity');
}

function testBallUpdate() {
    const ball = new Ball(100, 100);
    const initialX = ball.x;
    const initialY = ball.y;
    const dx = ball.dx;
    const dy = ball.dy;
    
    ball.update();
    
    assertEqual(ball.x, initialX + dx, 'X position after update');
    assertEqual(ball.y, initialY + dy, 'Y position after update');
    
    // 複数回の更新テスト
    ball.update();
    assertEqual(ball.x, initialX + dx * 2, 'X position after second update');
    assertEqual(ball.y, initialY + dy * 2, 'Y position after second update');
}

function testBallRender() {
    const ball = new Ball(150, 250);
    mockCtx.reset();
    
    ball.render(mockCtx);
    
    assertEqual(mockCtx.fillStyle, GAME_CONFIG.COLORS.BALL, 'Fill style set correctly');
    assertEqual(mockCtx.calls.beginPath, 1, 'beginPath called once');
    assertEqual(mockCtx.calls.fill, 1, 'fill called once');
    assertEqual(mockCtx.calls.arc.length, 1, 'arc called once');
    
    const arcCall = mockCtx.calls.arc[0];
    assertEqual(arcCall.x, 150, 'Arc X position');
    assertEqual(arcCall.y, 250, 'Arc Y position');
    assertEqual(arcCall.radius, GAME_CONFIG.BALL_RADIUS, 'Arc radius');
    assertEqual(arcCall.start, 0, 'Arc start angle');
    assertAlmostEqual(arcCall.end, Math.PI * 2, 0.001, 'Arc end angle');
}

function testBallRenderError() {
    const ball = new Ball();
    let errorThrown = false;
    
    try {
        ball.render(null);
    } catch (error) {
        errorThrown = true;
        assertTrue(error.message.includes('Canvas context is required'), 'Error message check');
    }
    
    assertTrue(errorThrown, 'Error thrown for null context');
}

function testBallVelocityReverse() {
    const ball = new Ball();
    const originalDx = ball.dx;
    const originalDy = ball.dy;
    
    // X方向の速度反転
    ball.reverseX();
    assertEqual(ball.dx, -originalDx, 'X velocity reversed');
    assertEqual(ball.dy, originalDy, 'Y velocity unchanged');
    
    // Y方向の速度反転
    ball.reverseY();
    assertEqual(ball.dx, -originalDx, 'X velocity still reversed');
    assertEqual(ball.dy, -originalDy, 'Y velocity reversed');
    
    // 再度反転して元に戻る
    ball.reverseX();
    ball.reverseY();
    assertEqual(ball.dx, originalDx, 'X velocity back to original');
    assertEqual(ball.dy, originalDy, 'Y velocity back to original');
}

function testBallReset() {
    const ball = new Ball();
    
    // 位置と速度を変更
    ball.x = 500;
    ball.y = 300;
    ball.dx = 10;
    ball.dy = -8;
    
    ball.reset();
    
    // 初期状態に戻ることを確認
    assertEqual(ball.x, GAME_CONFIG.CANVAS_WIDTH / 2, 'X position reset');
    assertEqual(ball.y, GAME_CONFIG.CANVAS_HEIGHT / 2, 'Y position reset');
    
    const expectedDx = GAME_CONFIG.BALL_SPEED * Math.cos(GAME_CONFIG.BALL_INITIAL_ANGLE);
    const expectedDy = GAME_CONFIG.BALL_SPEED * Math.sin(GAME_CONFIG.BALL_INITIAL_ANGLE);
    assertAlmostEqual(ball.dx, expectedDx, 0.001, 'dx velocity reset');
    assertAlmostEqual(ball.dy, expectedDy, 0.001, 'dy velocity reset');
}

function testBallGetBounds() {
    const ball = new Ball(100, 150);
    const bounds = ball.getBounds();
    
    assertEqual(bounds.x, 100 - GAME_CONFIG.BALL_RADIUS, 'Bounds X position');
    assertEqual(bounds.y, 150 - GAME_CONFIG.BALL_RADIUS, 'Bounds Y position');
    assertEqual(bounds.width, GAME_CONFIG.BALL_RADIUS * 2, 'Bounds width');
    assertEqual(bounds.height, GAME_CONFIG.BALL_RADIUS * 2, 'Bounds height');
}

function testBallGetCenter() {
    const ball = new Ball(200, 300);
    const center = ball.getCenter();
    
    assertEqual(center.x, 200, 'Center X position');
    assertEqual(center.y, 300, 'Center Y position');
}

function testBallSetVelocityFromAngle() {
    const ball = new Ball();
    const angle = Math.PI / 2; // 90度（真上）
    const speed = 8;
    
    ball.setVelocityFromAngle(angle, speed);
    
    assertEqual(ball.speed, speed, 'Speed set correctly');
    assertAlmostEqual(ball.dx, 0, 0.001, 'dx for 90 degree angle');
    assertAlmostEqual(ball.dy, speed, 0.001, 'dy for 90 degree angle');
    
    // デフォルト速度でのテスト
    ball.setVelocityFromAngle(0); // 0度（右向き）
    assertAlmostEqual(ball.dx, GAME_CONFIG.BALL_SPEED, 0.001, 'dx for 0 degree angle');
    assertAlmostEqual(ball.dy, 0, 0.001, 'dy for 0 degree angle');
}

function testBallGetVelocity() {
    const ball = new Ball();
    ball.dx = 3;
    ball.dy = 4;
    
    const velocity = ball.getVelocity();
    
    assertEqual(velocity.dx, 3, 'Velocity dx');
    assertEqual(velocity.dy, 4, 'Velocity dy');
    assertAlmostEqual(velocity.speed, 5, 0.001, 'Velocity magnitude (3-4-5 triangle)');
}

// すべてのテストを実行
function runAllBallTests() {
    console.log('=== Ball クラス 単体テスト ===');
    
    const tests = [
        ['Ball Construction', testBallConstruction],
        ['Ball Update', testBallUpdate],
        ['Ball Render', testBallRender],
        ['Ball Render Error', testBallRenderError],
        ['Ball Velocity Reverse', testBallVelocityReverse],
        ['Ball Reset', testBallReset],
        ['Ball Get Bounds', testBallGetBounds],
        ['Ball Get Center', testBallGetCenter],
        ['Ball Set Velocity From Angle', testBallSetVelocityFromAngle],
        ['Ball Get Velocity', testBallGetVelocity]
    ];
    
    let passed = 0;
    let total = tests.length;
    
    tests.forEach(([name, testFunc]) => {
        if (runTest(name, testFunc)) {
            passed++;
        }
    });
    
    console.log(`\n=== テスト結果: ${passed}/${total} 成功 ===`);
    
    if (passed === total) {
        console.log('✓ すべてのテストが成功しました！');
        return true;
    } else {
        console.log(`✗ ${total - passed} 個のテストが失敗しました。`);
        return false;
    }
}

// テスト実行（ブラウザ環境でのみ）
if (typeof window !== 'undefined') {
    // DOM読み込み後にテスト実行
    document.addEventListener('DOMContentLoaded', function() {
        // 少し遅延してからテスト実行（他の初期化が完了してから）
        setTimeout(runAllBallTests, 100);
    });
}

// Node.js環境での実行サポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllBallTests,
        testBallConstruction,
        testBallUpdate,
        testBallRender,
        testBallVelocityReverse,
        testBallReset,
        testBallGetBounds,
        testBallGetCenter,
        testBallSetVelocityFromAngle,
        testBallGetVelocity
    };
}