// Test script for Task 12: Game Ending Conditions Implementation
console.log('Testing Task 12 - Game Ending Conditions Implementation...\n');

// Load the game script
const fs = require('fs');
const scriptContent = fs.readFileSync('script.js', 'utf8');

// Check if the script can be evaluated in Node.js environment
let Game, GameState, Ball, Paddle, Block, BlockManager, InputHandler, CollisionDetector;

try {
    // Create a mock DOM environment for Node.js
    global.document = {
        getElementById: () => ({
            width: 800,
            height: 600,
            getContext: () => ({
                fillStyle: '',
                fillRect: () => {},
                strokeStyle: '',
                strokeRect: () => {},
                beginPath: () => {},
                arc: () => {},
                fill: () => {},
                font: '',
                textAlign: '',
                fillText: () => {},
                strokeText: () => {},
                lineWidth: 0,
                createLinearGradient: () => ({
                    addColorStop: () => {}
                }),
                save: () => {},
                restore: () => {},
                scale: () => {},
                translate: () => {},
                imageSmoothingEnabled: false
            })
        }),
        addEventListener: () => {}
    };
    
    global.window = {
        addEventListener: () => {}
    };
    
    global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
    global.cancelAnimationFrame = (id) => clearTimeout(id);
    
    // Evaluate the script
    eval(scriptContent);
    
    console.log('✅ Script loaded successfully');
    
} catch (error) {
    console.log('❌ Error loading script:', error.message);
    process.exit(1);
}

// Test Task 12 specific requirements
console.log('\n📋 Testing Task 12 Requirements:\n');

// Test 1: Game Over Detection Implementation
console.log('1. Testing Game Over Detection:');
try {
    const game = new Game();
    game.init();
    
    // Check if handleGameOver method exists and works
    if (typeof game.handleGameOver === 'function') {
        console.log('   ✅ handleGameOver() method exists');
        
        // Test game over functionality
        game.handleGameOver();
        if (game.getGameState() === GameState.GAME_OVER) {
            console.log('   ✅ Game over state is set correctly');
        } else {
            console.log('   ❌ Game over state not set correctly');
        }
    } else {
        console.log('   ❌ handleGameOver() method missing');
    }
} catch (error) {
    console.log('   ❌ Error testing game over:', error.message);
}

// Test 2: Game Win Detection Implementation
console.log('\n2. Testing Game Win Detection:');
try {
    const game = new Game();
    game.init();
    
    // Check if handleGameWin method exists and works
    if (typeof game.handleGameWin === 'function') {
        console.log('   ✅ handleGameWin() method exists');
        
        // Test game win functionality
        game.handleGameWin();
        if (game.getGameState() === GameState.GAME_WIN) {
            console.log('   ✅ Game win state is set correctly');
        } else {
            console.log('   ❌ Game win state not set correctly');
        }
    } else {
        console.log('   ❌ handleGameWin() method missing');
    }
} catch (error) {
    console.log('   ❌ Error testing game win:', error.message);
}

// Test 3: Ball Bottom Collision Detection
console.log('\n3. Testing Ball Bottom Collision Detection:');
try {
    const game = new Game();
    game.init();
    
    // Check if collision detection handles bottom wall
    const collisionDetector = new CollisionDetector();
    const ball = new Ball(400, 590); // Near bottom
    
    const wallCollision = collisionDetector.checkBallWallCollision(ball, 800, 600);
    
    if (wallCollision && wallCollision.bottom) {
        console.log('   ✅ Ball bottom collision detection works');
    } else {
        console.log('   ❌ Ball bottom collision detection not working');
    }
    
    // Check if handleCollisions calls handleGameOver on bottom collision
    const scriptHasBottomCollisionHandling = /wallCollision\.bottom.*handleGameOver/.test(scriptContent);
    if (scriptHasBottomCollisionHandling) {
        console.log('   ✅ Bottom collision triggers game over');
    } else {
        console.log('   ❌ Bottom collision does not trigger game over');
    }
    
} catch (error) {
    console.log('   ❌ Error testing ball bottom collision:', error.message);
}

// Test 4: All Blocks Destroyed Detection
console.log('\n4. Testing All Blocks Destroyed Detection:');
try {
    const game = new Game();
    game.init();
    
    // Check if checkGameEndConditions exists
    if (typeof game.checkGameEndConditions === 'function') {
        console.log('   ✅ checkGameEndConditions() method exists');
        
        // Check if it calls handleGameWin when all blocks destroyed
        const scriptHasAllBlocksCheck = /areAllBlocksDestroyed.*handleGameWin/.test(scriptContent);
        if (scriptHasAllBlocksCheck) {
            console.log('   ✅ All blocks destroyed triggers game win');
        } else {
            console.log('   ❌ All blocks destroyed does not trigger game win');
        }
    } else {
        console.log('   ❌ checkGameEndConditions() method missing');
    }
    
    // Test BlockManager.areAllBlocksDestroyed()
    const blockManager = new BlockManager();
    blockManager.initializeBlocks();
    
    if (typeof blockManager.areAllBlocksDestroyed === 'function') {
        console.log('   ✅ areAllBlocksDestroyed() method exists');
        
        // Initially should be false
        if (!blockManager.areAllBlocksDestroyed()) {
            console.log('   ✅ Initially not all blocks destroyed');
        } else {
            console.log('   ❌ Initially all blocks destroyed (should be false)');
        }
        
        // Destroy all blocks and test
        const blocks = blockManager.getActiveBlocks();
        blocks.forEach(block => block.destroy());
        
        if (blockManager.areAllBlocksDestroyed()) {
            console.log('   ✅ All blocks destroyed detection works');
        } else {
            console.log('   ❌ All blocks destroyed detection not working');
        }
    } else {
        console.log('   ❌ areAllBlocksDestroyed() method missing');
    }
    
} catch (error) {
    console.log('   ❌ Error testing all blocks destroyed:', error.message);
}

// Test 5: Requirements Coverage
console.log('\n📊 Requirements Coverage Check:');

const requirements = [
    {
        id: '3.4',
        description: 'WHEN ボールが画面下端に到達する THEN システムはゲームオーバー状態にする',
        check: /wallCollision\.bottom.*handleGameOver/.test(scriptContent)
    },
    {
        id: '4.4', 
        description: 'WHEN 全てのブロックが破壊される THEN システムはゲームクリア状態にする',
        check: /areAllBlocksDestroyed.*handleGameWin/.test(scriptContent)
    },
    {
        id: '5.2',
        description: 'WHEN ゲームオーバーになる THEN システムは「ゲームオーバー」メッセージを表示する',
        check: /GameState\.GAME_OVER.*ゲームオーバー/.test(scriptContent)
    },
    {
        id: '5.3',
        description: 'WHEN ゲームクリアになる THEN システムは「ゲームクリア」メッセージを表示する',
        check: /GameState\.GAME_WIN.*ゲームクリア/.test(scriptContent)
    }
];

requirements.forEach(req => {
    const status = req.check ? '✅' : '❌';
    console.log(`   ${status} Requirement ${req.id}: ${req.check}`);
});

// Summary
console.log('\n============================================================');
const allRequirementsMet = requirements.every(req => req.check);
if (allRequirementsMet) {
    console.log('🎉 TASK 12 COMPLETED SUCCESSFULLY!');
    console.log('\nAll game ending conditions are implemented:');
    console.log('- ✅ Game over detection implemented');
    console.log('- ✅ Game win detection implemented'); 
    console.log('- ✅ Ball bottom collision handling implemented');
    console.log('- ✅ All blocks destroyed handling implemented');
    console.log('\nRequirements 3.4, 4.4, 5.2, 5.3 are satisfied.');
} else {
    console.log('❌ TASK 12 INCOMPLETE');
    console.log('\nMissing implementations:');
    requirements.forEach(req => {
        if (!req.check) {
            console.log(`- ❌ Requirement ${req.id}`);
        }
    });
}
console.log('============================================================');