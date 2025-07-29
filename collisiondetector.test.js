// CollisionDetector クラスの単体テスト

// CollisionDetector クラスの定義（テスト用）
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

// テスト用のモッククラス
class MockBall {
    constructor(x, y, radius = 10) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = 5;
        this.dy = -5;
        this.speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    }
    
    getBounds() {
        return {
            x: this.x - this.radius,
            y: this.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }
    
    getCenter() {
        return { x: this.x, y: this.y };
    }
    
    getVelocity() {
        return {
            dx: this.dx,
            dy: this.dy,
            speed: this.speed
        };
    }
    
    reverseX() {
        this.dx = -this.dx;
    }
    
    reverseY() {
        this.dy = -this.dy;
    }
    
    setVelocityFromAngle(angle, speed) {
        this.speed = speed;
        this.dx = speed * Math.cos(angle);
        this.dy = speed * Math.sin(angle);
    }
}

class MockPaddle {
    constructor(x, y, width = 100, height = 20) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
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
}

class MockBlock {
    constructor(x, y, width = 75, height = 20, destroyed = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.destroyed = destroyed;
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
    
    isDestroyed() {
        return this.destroyed;
    }
}

describe('CollisionDetector', () => {
    let collisionDetector;
    
    beforeEach(() => {
        collisionDetector = new CollisionDetector();
    });
    
    describe('rectIntersect', () => {
        test('重なっている矩形で true を返す', () => {
            const rect1 = { x: 0, y: 0, width: 50, height: 50 };
            const rect2 = { x: 25, y: 25, width: 50, height: 50 };
            
            expect(collisionDetector.rectIntersect(rect1, rect2)).toBe(true);
        });
        
        test('重なっていない矩形で false を返す', () => {
            const rect1 = { x: 0, y: 0, width: 50, height: 50 };
            const rect2 = { x: 100, y: 100, width: 50, height: 50 };
            
            expect(collisionDetector.rectIntersect(rect1, rect2)).toBe(false);
        });
        
        test('隣接している矩形で false を返す', () => {
            const rect1 = { x: 0, y: 0, width: 50, height: 50 };
            const rect2 = { x: 50, y: 0, width: 50, height: 50 };
            
            expect(collisionDetector.rectIntersect(rect1, rect2)).toBe(false);
        });
        
        test('null や undefined で false を返す', () => {
            const rect = { x: 0, y: 0, width: 50, height: 50 };
            
            expect(collisionDetector.rectIntersect(null, rect)).toBe(false);
            expect(collisionDetector.rectIntersect(rect, null)).toBe(false);
            expect(collisionDetector.rectIntersect(undefined, rect)).toBe(false);
        });
    });
    
    describe('checkBallPaddleCollision', () => {
        test('ボールがパドルの上部に当たった場合に衝突を検出', () => {
            const ball = new MockBall(100, 295); // パドルの上（重なるように調整）
            const paddle = new MockPaddle(50, 300, 100, 20);
            
            const result = collisionDetector.checkBallPaddleCollision(ball, paddle);
            
            expect(result).toBeTruthy();
            expect(result.collision).toBe(true);
            expect(result.angle).toBeDefined();
            expect(result.hitPosition).toBeDefined();
        });
        
        test('ボールがパドルの下部に当たった場合は衝突しない', () => {
            const ball = new MockBall(100, 330); // パドルの下
            const paddle = new MockPaddle(50, 300, 100, 20);
            
            const result = collisionDetector.checkBallPaddleCollision(ball, paddle);
            
            expect(result).toBe(false);
        });
        
        test('ボールがパドルから離れている場合は衝突しない', () => {
            const ball = new MockBall(200, 200);
            const paddle = new MockPaddle(50, 300, 100, 20);
            
            const result = collisionDetector.checkBallPaddleCollision(ball, paddle);
            
            expect(result).toBe(false);
        });
        
        test('パドルの中央に当たった場合の角度計算', () => {
            const ball = new MockBall(100, 295); // パドル中央（重なるように調整）
            const paddle = new MockPaddle(50, 300, 100, 20);
            
            const result = collisionDetector.checkBallPaddleCollision(ball, paddle);
            
            expect(result.collision).toBe(true);
            expect(result.hitPosition).toBeCloseTo(0.5, 1); // 中央
            expect(result.angle).toBeCloseTo(-Math.PI / 2, 1); // 垂直上向き
        });
        
        test('null や undefined で false を返す', () => {
            const ball = new MockBall(100, 100);
            const paddle = new MockPaddle(50, 300, 100, 20);
            
            expect(collisionDetector.checkBallPaddleCollision(null, paddle)).toBe(false);
            expect(collisionDetector.checkBallPaddleCollision(ball, null)).toBe(false);
        });
    });
    
    describe('checkBallBlockCollision', () => {
        test('ボールがブロックに当たった場合に衝突を検出', () => {
            const ball = new MockBall(100, 100);
            const block = new MockBlock(90, 90, 75, 20);
            
            const result = collisionDetector.checkBallBlockCollision(ball, block);
            
            expect(result).toBeTruthy();
            expect(result.collision).toBe(true);
            expect(result.block).toBe(block);
            expect(result.side).toBeDefined();
        });
        
        test('破壊されたブロックとは衝突しない', () => {
            const ball = new MockBall(100, 100);
            const block = new MockBlock(90, 90, 75, 20, true); // 破壊済み
            
            const result = collisionDetector.checkBallBlockCollision(ball, block);
            
            expect(result).toBe(false);
        });
        
        test('ボールがブロックから離れている場合は衝突しない', () => {
            const ball = new MockBall(200, 200);
            const block = new MockBlock(50, 50, 75, 20);
            
            const result = collisionDetector.checkBallBlockCollision(ball, block);
            
            expect(result).toBe(false);
        });
        
        test('衝突面の判定 - 上面', () => {
            const ball = new MockBall(100, 80); // ブロックの上
            const block = new MockBlock(90, 90, 75, 20);
            
            const result = collisionDetector.checkBallBlockCollision(ball, block);
            
            expect(result.collision).toBe(true);
            expect(result.side).toBe('top');
        });
        
        test('衝突面の判定 - 左面', () => {
            const ball = new MockBall(80, 100); // ブロックの左
            const block = new MockBlock(90, 90, 75, 20);
            
            const result = collisionDetector.checkBallBlockCollision(ball, block);
            
            expect(result.collision).toBe(true);
            expect(result.side).toBe('left');
        });
    });
    
    describe('checkBallWallCollision', () => {
        test('ボールが左壁に当たった場合', () => {
            const ball = new MockBall(5, 300); // 左端近く
            
            const result = collisionDetector.checkBallWallCollision(ball, 800, 600);
            
            expect(result.left).toBe(true);
            expect(result.right).toBe(false);
            expect(result.top).toBe(false);
            expect(result.bottom).toBe(false);
        });
        
        test('ボールが右壁に当たった場合', () => {
            const ball = new MockBall(795, 300); // 右端近く
            
            const result = collisionDetector.checkBallWallCollision(ball, 800, 600);
            
            expect(result.left).toBe(false);
            expect(result.right).toBe(true);
            expect(result.top).toBe(false);
            expect(result.bottom).toBe(false);
        });
        
        test('ボールが上壁に当たった場合', () => {
            const ball = new MockBall(400, 5); // 上端近く
            
            const result = collisionDetector.checkBallWallCollision(ball, 800, 600);
            
            expect(result.left).toBe(false);
            expect(result.right).toBe(false);
            expect(result.top).toBe(true);
            expect(result.bottom).toBe(false);
        });
        
        test('ボールが下壁に当たった場合', () => {
            const ball = new MockBall(400, 595); // 下端近く
            
            const result = collisionDetector.checkBallWallCollision(ball, 800, 600);
            
            expect(result.left).toBe(false);
            expect(result.right).toBe(false);
            expect(result.top).toBe(false);
            expect(result.bottom).toBe(true);
        });
        
        test('ボールが壁に当たっていない場合', () => {
            const ball = new MockBall(400, 300); // 中央
            
            const result = collisionDetector.checkBallWallCollision(ball, 800, 600);
            
            expect(result.left).toBe(false);
            expect(result.right).toBe(false);
            expect(result.top).toBe(false);
            expect(result.bottom).toBe(false);
        });
    });
    
    describe('calculatePaddleBounceAngle', () => {
        test('パドル中央での跳ね返し角度', () => {
            const angle = collisionDetector.calculatePaddleBounceAngle(0.5);
            expect(angle).toBeCloseTo(-Math.PI / 2, 2); // 垂直上向き
        });
        
        test('パドル左端での跳ね返し角度', () => {
            const angle = collisionDetector.calculatePaddleBounceAngle(0);
            expect(angle).toBeCloseTo(-Math.PI / 2 - Math.PI / 3, 2); // 左斜め上
        });
        
        test('パドル右端での跳ね返し角度', () => {
            const angle = collisionDetector.calculatePaddleBounceAngle(1);
            expect(angle).toBeCloseTo(-Math.PI / 2 + Math.PI / 3, 2); // 右斜め上
        });
    });
    
    describe('determineCollisionSide', () => {
        test('上面衝突の判定', () => {
            const ballCenter = { x: 100, y: 80 };
            const blockBounds = { x: 90, y: 90, width: 75, height: 20 };
            const side = collisionDetector.determineCollisionSide(ballCenter, blockBounds, 10);
            
            expect(side).toBe('top');
        });
        
        test('下面衝突の判定', () => {
            const ballCenter = { x: 100, y: 120 };
            const blockBounds = { x: 90, y: 90, width: 75, height: 20 };
            const side = collisionDetector.determineCollisionSide(ballCenter, blockBounds, 10);
            
            expect(side).toBe('bottom');
        });
        
        test('左面衝突の判定', () => {
            const ballCenter = { x: 80, y: 100 };
            const blockBounds = { x: 90, y: 90, width: 75, height: 20 };
            const side = collisionDetector.determineCollisionSide(ballCenter, blockBounds, 10);
            
            expect(side).toBe('left');
        });
        
        test('右面衝突の判定', () => {
            const ballCenter = { x: 175, y: 100 };
            const blockBounds = { x: 90, y: 90, width: 75, height: 20 };
            const side = collisionDetector.determineCollisionSide(ballCenter, blockBounds, 10);
            
            expect(side).toBe('right');
        });
    });
    
    describe('checkBallBlocksCollision', () => {
        test('複数ブロックから衝突するブロックを検出', () => {
            const ball = new MockBall(100, 100);
            const blocks = [
                new MockBlock(200, 200, 75, 20), // 衝突しない
                new MockBlock(90, 90, 75, 20),   // 衝突する
                new MockBlock(300, 300, 75, 20)  // 衝突しない
            ];
            
            const result = collisionDetector.checkBallBlocksCollision(ball, blocks);
            
            expect(result).toBeTruthy();
            expect(result.collision).toBe(true);
            expect(result.block).toBe(blocks[1]);
        });
        
        test('破壊されたブロックは無視される', () => {
            const ball = new MockBall(100, 100);
            const blocks = [
                new MockBlock(90, 90, 75, 20, true), // 破壊済み
                new MockBlock(200, 200, 75, 20)       // 衝突しない
            ];
            
            const result = collisionDetector.checkBallBlocksCollision(ball, blocks);
            
            expect(result).toBeNull();
        });
        
        test('衝突するブロックがない場合は null を返す', () => {
            const ball = new MockBall(100, 100);
            const blocks = [
                new MockBlock(200, 200, 75, 20),
                new MockBlock(300, 300, 75, 20)
            ];
            
            const result = collisionDetector.checkBallBlocksCollision(ball, blocks);
            
            expect(result).toBeNull();
        });
        
        test('空の配列で null を返す', () => {
            const ball = new MockBall(100, 100);
            const blocks = [];
            
            const result = collisionDetector.checkBallBlocksCollision(ball, blocks);
            
            expect(result).toBeNull();
        });
    });
    
    describe('pointInRect', () => {
        test('点が矩形内にある場合', () => {
            const rect = { x: 50, y: 50, width: 100, height: 100 };
            
            expect(collisionDetector.pointInRect(100, 100, rect)).toBe(true);
            expect(collisionDetector.pointInRect(50, 50, rect)).toBe(true);
            expect(collisionDetector.pointInRect(150, 150, rect)).toBe(true);
        });
        
        test('点が矩形外にある場合', () => {
            const rect = { x: 50, y: 50, width: 100, height: 100 };
            
            expect(collisionDetector.pointInRect(40, 100, rect)).toBe(false);
            expect(collisionDetector.pointInRect(160, 100, rect)).toBe(false);
            expect(collisionDetector.pointInRect(100, 40, rect)).toBe(false);
            expect(collisionDetector.pointInRect(100, 160, rect)).toBe(false);
        });
    });
    
    describe('circleRectCollision', () => {
        test('円が矩形と重なっている場合', () => {
            const rect = { x: 50, y: 50, width: 100, height: 100 };
            
            expect(collisionDetector.circleRectCollision(100, 100, 20, rect)).toBe(true);
            expect(collisionDetector.circleRectCollision(40, 100, 15, rect)).toBe(true);
        });
        
        test('円が矩形と重なっていない場合', () => {
            const rect = { x: 50, y: 50, width: 100, height: 100 };
            
            expect(collisionDetector.circleRectCollision(200, 200, 10, rect)).toBe(false);
            expect(collisionDetector.circleRectCollision(30, 100, 10, rect)).toBe(false);
        });
    });
    
    describe('calculateBounceVelocity', () => {
        test('角度指定での速度計算（パドル衝突）', () => {
            const ball = new MockBall(100, 100);
            const originalSpeed = ball.getVelocity().speed;
            
            collisionDetector.calculateBounceVelocity(ball, null, -Math.PI / 2);
            
            const newVelocity = ball.getVelocity();
            expect(newVelocity.speed).toBeCloseTo(originalSpeed, 1);
            expect(newVelocity.dy).toBeLessThan(0); // 上向き
        });
        
        test('左右面での速度反転', () => {
            const ball = new MockBall(100, 100);
            const originalDx = ball.dx;
            
            collisionDetector.calculateBounceVelocity(ball, 'left');
            
            expect(ball.dx).toBe(-originalDx);
        });
        
        test('上下面での速度反転', () => {
            const ball = new MockBall(100, 100);
            const originalDy = ball.dy;
            
            collisionDetector.calculateBounceVelocity(ball, 'top');
            
            expect(ball.dy).toBe(-originalDy);
        });
    });
    
    describe('getCollisionDebugInfo', () => {
        test('デバッグ情報の取得', () => {
            const ball = new MockBall(100, 100);
            const paddle = new MockPaddle(50, 300, 100, 20);
            const blocks = [new MockBlock(90, 90, 75, 20)];
            
            const debugInfo = collisionDetector.getCollisionDebugInfo(ball, paddle, blocks, 800, 600);
            
            expect(debugInfo).toHaveProperty('wall');
            expect(debugInfo).toHaveProperty('paddle');
            expect(debugInfo).toHaveProperty('block');
            expect(debugInfo).toHaveProperty('ballPosition');
            expect(debugInfo).toHaveProperty('ballVelocity');
        });
    });
});