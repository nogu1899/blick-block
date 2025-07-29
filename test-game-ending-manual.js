// Manual test for game ending conditions
console.log('=== Game Ending Conditions Manual Test ===');
console.log('To test the game ending conditions:');
console.log('');
console.log('1. Open index.html in a browser');
console.log('2. Open browser console');
console.log('3. Test Game Over condition:');
console.log('   - Run: game.ball.y = 600; game.handleCollisions();');
console.log('   - Should trigger game over state');
console.log('');
console.log('4. Test Game Win condition:');
console.log('   - Run: game.blockManager.getActiveBlocks().forEach(b => b.destroy());');
console.log('   - Run: game.checkGameEndConditions();');
console.log('   - Should trigger game win state');
console.log('');
console.log('5. Test Reset functionality:');
console.log('   - Press Space key after game over/win');
console.log('   - Should reset game to playing state');
console.log('');
console.log('Or run automated tests:');
console.log('   testGameOver()');
console.log('   testGameWin()');
console.log('');

// Create browser-compatible test functions
const browserTestCode = `
// Test functions for browser console
function testGameOver() {
    console.log('Testing Game Over...');
    game.ball.y = 600; // Move ball to bottom
    game.handleCollisions();
    console.log('Game state:', game.getGameState());
    console.log('Expected: game_over, Actual:', game.getGameState() === 'game_over' ? 'PASS' : 'FAIL');
}

function testGameWin() {
    console.log('Testing Game Win...');
    game.resetGame(); // Reset first
    game.blockManager.getActiveBlocks().forEach(block => block.destroy());
    game.checkGameEndConditions();
    console.log('Game state:', game.getGameState());
    console.log('Expected: game_win, Actual:', game.getGameState() === 'game_win' ? 'PASS' : 'FAIL');
}

function testReset() {
    console.log('Testing Reset...');
    game.handleGameOver(); // Set to game over
    console.log('Before reset:', game.getGameState());
    game.resetGame();
    console.log('After reset:', game.getGameState());
    console.log('Expected: playing, Actual:', game.getGameState() === 'playing' ? 'PASS' : 'FAIL');
}

function runAllTests() {
    console.log('=== Running All Game Ending Tests ===');
    testGameOver();
    testReset();
    testGameWin();
    testReset();
    console.log('=== Tests Complete ===');
}

console.log('Test functions loaded. Run runAllTests() to test all conditions.');
`;

console.log('Browser test code:');
console.log(browserTestCode);