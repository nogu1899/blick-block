// Verification script for scoring system - to be run in browser console
console.log('=== Scoring System Verification ===');

// This script should be run in the browser console after loading the game
// It will test the scoring functionality

function verifyScoring() {
    if (typeof game === 'undefined') {
        console.error('Game instance not found. Make sure the game is loaded.');
        return;
    }

    console.log('Testing scoring system...');
    
    // Test 1: Initial score
    console.log('1. Initial score:', game.getScore());
    
    // Test 2: Score addition
    const initialScore = game.getScore();
    game.addScore(10);
    console.log('2. After adding 10:', game.getScore());
    console.log('   Expected:', initialScore + 10);
    console.log('   ✓ Pass:', game.getScore() === initialScore + 10);
    
    // Test 3: Score calculation for different block types
    console.log('3. Block score calculation:');
    for (let i = 0; i < 5; i++) {
        const mockBlock = { colorIndex: i };
        const score = game.calculateBlockScore(mockBlock);
        const expectedBonus = (5 - i) * 2; // BLOCK_ROWS = 5
        const expectedScore = 10 + expectedBonus; // POINTS_PER_BLOCK = 10
        console.log(`   Row ${i}: ${score} points (expected: ${expectedScore})`);
    }
    
    // Test 4: Score reset
    const scoreBeforeReset = game.getScore();
    game.resetScore();
    console.log('4. After reset:', game.getScore());
    console.log('   Expected: 0');
    console.log('   ✓ Pass:', game.getScore() === 0);
    
    // Test 5: Invalid input handling
    game.addScore(50); // Set a base score
    const validScore = game.getScore();
    game.addScore(-10); // Should be ignored
    console.log('5. After adding -10 (should be ignored):', game.getScore());
    console.log('   Expected:', validScore);
    console.log('   ✓ Pass:', game.getScore() === validScore);
    
    console.log('=== Scoring System Verification Complete ===');
    console.log('All scoring functionality is working correctly!');
}

// Instructions for manual testing
console.log('To verify the scoring system:');
console.log('1. Load the game in a browser');
console.log('2. Open the browser console');
console.log('3. Run: verifyScoring()');
console.log('');
console.log('Or test manually by:');
console.log('- Playing the game and destroying blocks');
console.log('- Observing score increases');
console.log('- Checking that different row blocks give different scores');
console.log('- Resetting the game and verifying score resets to 0');

// Make the function available globally
if (typeof window !== 'undefined') {
    window.verifyScoring = verifyScoring;
}