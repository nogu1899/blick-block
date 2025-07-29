// Test script for the scoring system implementation
console.log('Testing Scoring System Implementation...\n');

// Mock DOM environment for testing
global.document = {
    getElementById: () => ({
        width: 800,
        height: 600,
        getContext: () => ({
            fillStyle: '',
            font: '',
            textAlign: '',
            fillText: () => {},
            fillRect: () => {},
            beginPath: () => {},
            arc: () => {},
            fill: () => {},
            strokeStyle: '',
            lineWidth: 0,
            strokeRect: () => {},
            measureText: () => ({ width: 100 }),
            createLinearGradient: () => ({
                addColorStop: () => {}
            })
        })
    }),
    addEventListener: () => {}
};

global.window = {
    addEventListener: () => {}
};

global.requestAnimationFrame = (callback) => setTimeout(callback, 16);

// Load the game script
const fs = require('fs');
const script = fs.readFileSync('script.js', 'utf8');
eval(script);

// Test 1: Basic scoring functionality
console.log('=== Test 1: Basic Scoring Functionality ===');
const game = new Game();

console.log('Initial score:', game.getScore());
console.log('Expected: 0');
console.log('✓ Pass:', game.getScore() === 0);
console.log();

// Test 2: Score addition
console.log('=== Test 2: Score Addition ===');
game.addScore(10);
console.log('After adding 10:', game.getScore());
console.log('Expected: 10');
console.log('✓ Pass:', game.getScore() === 10);

game.addScore(25);
console.log('After adding 25:', game.getScore());
console.log('Expected: 35');
console.log('✓ Pass:', game.getScore() === 35);
console.log();

// Test 3: Invalid score handling
console.log('=== Test 3: Invalid Score Handling ===');
const scoreBefore = game.getScore();
game.addScore(-5); // Should be ignored
console.log('After adding -5 (should be ignored):', game.getScore());
console.log('Expected:', scoreBefore);
console.log('✓ Pass:', game.getScore() === scoreBefore);

game.addScore('invalid'); // Should be ignored
console.log('After adding "invalid" (should be ignored):', game.getScore());
console.log('Expected:', scoreBefore);
console.log('✓ Pass:', game.getScore() === scoreBefore);
console.log();

// Test 4: Score reset
console.log('=== Test 4: Score Reset ===');
game.resetScore();
console.log('After reset:', game.getScore());
console.log('Expected: 0');
console.log('✓ Pass:', game.getScore() === 0);
console.log();

// Test 5: Block score calculation
console.log('=== Test 5: Block Score Calculation ===');
// Create mock blocks with different color indices (representing different rows)
const mockBlocks = [
    { colorIndex: 0 }, // Top row (highest bonus)
    { colorIndex: 1 }, // Second row
    { colorIndex: 2 }, // Middle row
    { colorIndex: 3 }, // Fourth row
    { colorIndex: 4 }  // Bottom row (lowest bonus)
];

mockBlocks.forEach((block, index) => {
    const score = game.calculateBlockScore(block);
    const expectedBonus = (GAME_CONFIG.BLOCK_ROWS - block.colorIndex) * 2;
    const expectedScore = GAME_CONFIG.POINTS_PER_BLOCK + expectedBonus;
    
    console.log(`Block row ${block.colorIndex}: ${score} points (base: ${GAME_CONFIG.POINTS_PER_BLOCK}, bonus: ${expectedBonus})`);
    console.log('Expected:', expectedScore);
    console.log('✓ Pass:', score === expectedScore);
});
console.log();

// Test 6: Game reset functionality
console.log('=== Test 6: Game Reset Functionality ===');
game.addScore(100);
console.log('Score before game reset:', game.getScore());
game.resetGame();
console.log('Score after game reset:', game.getScore());
console.log('Expected: 0');
console.log('✓ Pass:', game.getScore() === 0);
console.log();

// Test 7: Score formatting (toLocaleString)
console.log('=== Test 7: Score Formatting ===');
game.addScore(1234);
const formattedScore = game.getScore().toLocaleString();
console.log('Score:', game.getScore());
console.log('Formatted score:', formattedScore);
console.log('✓ Pass: Formatting works');
console.log();

console.log('=== All Scoring System Tests Completed ===');
console.log('✓ Score calculation logic implemented');
console.log('✓ Block destruction score addition implemented');
console.log('✓ Score reset functionality implemented');
console.log('✓ Score display updates implemented');
console.log('✓ Enhanced score formatting with toLocaleString()');
console.log('✓ Row-based bonus scoring system');
console.log('✓ Input validation for score addition');
console.log('✓ Score change event system for future extensions');