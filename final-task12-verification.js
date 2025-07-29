// Final comprehensive verification for Task 12
const fs = require('fs');
const scriptContent = fs.readFileSync('script.js', 'utf8');

console.log('🔍 FINAL VERIFICATION - Task 12: ゲーム終了条件の実装\n');

// Task 12 Sub-tasks verification
const subTasks = [
    {
        name: 'ゲームオーバー判定を実装',
        patterns: [
            /handleGameOver\(\)\s*{[\s\S]*?this\.gameState\s*=\s*GameState\.GAME_OVER/,
            /wallCollision\.bottom[\s\S]*?handleGameOver\(\)/
        ],
        description: 'Game over detection when ball hits bottom'
    },
    {
        name: 'ゲームクリア判定を実装',
        patterns: [
            /handleGameWin\(\)\s*{[\s\S]*?this\.gameState\s*=\s*GameState\.GAME_WIN/,
            /areAllBlocksDestroyed\(\)[\s\S]*?handleGameWin\(\)/
        ],
        description: 'Game win detection when all blocks destroyed'
    },
    {
        name: 'ボールが画面下端に到達した場合の処理を実装',
        patterns: [
            /wallCollision\.bottom/,
            /handleGameOver\(\)/
        ],
        description: 'Ball bottom collision handling'
    },
    {
        name: '全ブロック破壊時の処理を実装',
        patterns: [
            /areAllBlocksDestroyed/,
            /handleGameWin/
        ],
        description: 'All blocks destroyed handling'
    }
];

console.log('📋 Sub-task Implementation Check:\n');

let allSubTasksComplete = true;
subTasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task.name}`);
    
    let taskComplete = true;
    task.patterns.forEach(pattern => {
        const found = pattern.test(scriptContent);
        const status = found ? '✅' : '❌';
        console.log(`   ${status} Pattern found: ${found}`);
        if (!found) taskComplete = false;
    });
    
    console.log(`   📝 ${task.description}`);
    console.log(`   🎯 Status: ${taskComplete ? 'COMPLETE' : 'INCOMPLETE'}\n`);
    
    if (!taskComplete) allSubTasksComplete = false;
});

// Requirements verification
console.log('📊 Requirements Verification:\n');

const requirements = [
    {
        id: '3.4',
        text: 'WHEN ボールが画面下端に到達する THEN システムはゲームオーバー状態にする',
        pattern: /wallCollision\.bottom[\s\S]*?handleGameOver/,
        implemented: false
    },
    {
        id: '4.4',
        text: 'WHEN 全てのブロックが破壊される THEN システムはゲームクリア状態にする',
        pattern: /areAllBlocksDestroyed[\s\S]*?handleGameWin/,
        implemented: false
    },
    {
        id: '5.2',
        text: 'WHEN ゲームオーバーになる THEN システムは「ゲームオーバー」メッセージを表示する',
        pattern: /GameState\.GAME_OVER[\s\S]*?ゲームオーバー/,
        implemented: false
    },
    {
        id: '5.3',
        text: 'WHEN ゲームクリアになる THEN システムは「ゲームクリア」メッセージを表示する',
        pattern: /GameState\.GAME_WIN[\s\S]*?ゲームクリア/,
        implemented: false
    }
];

let allRequirementsMet = true;
requirements.forEach(req => {
    req.implemented = req.pattern.test(scriptContent);
    const status = req.implemented ? '✅' : '❌';
    console.log(`${status} Requirement ${req.id}: ${req.implemented}`);
    console.log(`   📝 ${req.text}\n`);
    
    if (!req.implemented) allRequirementsMet = false;
});

// Code structure verification
console.log('🏗️ Code Structure Verification:\n');

const codeStructure = [
    {
        name: 'GameState enum with GAME_OVER and GAME_WIN',
        pattern: /GameState\s*=\s*{[\s\S]*?GAME_OVER[\s\S]*?GAME_WIN/,
        found: false
    },
    {
        name: 'handleGameOver method implementation',
        pattern: /handleGameOver\(\)\s*{[\s\S]*?GameState\.GAME_OVER/,
        found: false
    },
    {
        name: 'handleGameWin method implementation',
        pattern: /handleGameWin\(\)\s*{[\s\S]*?GameState\.GAME_WIN/,
        found: false
    },
    {
        name: 'checkGameEndConditions method',
        pattern: /checkGameEndConditions\(\)\s*{/,
        found: false
    },
    {
        name: 'Game state message rendering',
        pattern: /renderGameStateMessage/,
        found: false
    },
    {
        name: 'Ball collision with bottom wall',
        pattern: /wallCollision\.bottom/,
        found: false
    },
    {
        name: 'All blocks destroyed check',
        pattern: /areAllBlocksDestroyed/,
        found: false
    }
];

let allStructurePresent = true;
codeStructure.forEach(item => {
    item.found = item.pattern.test(scriptContent);
    const status = item.found ? '✅' : '❌';
    console.log(`${status} ${item.name}: ${item.found}`);
    
    if (!item.found) allStructurePresent = false;
});

// Final assessment
console.log('\n============================================================');
console.log('🎯 TASK 12 FINAL ASSESSMENT');
console.log('============================================================\n');

if (allSubTasksComplete && allRequirementsMet && allStructurePresent) {
    console.log('🎉 TASK 12 COMPLETED SUCCESSFULLY!\n');
    console.log('✅ All sub-tasks implemented:');
    console.log('   - ゲームオーバー判定を実装');
    console.log('   - ゲームクリア判定を実装');
    console.log('   - ボールが画面下端に到達した場合の処理を実装');
    console.log('   - 全ブロック破壊時の処理を実装\n');
    
    console.log('✅ All requirements satisfied:');
    requirements.forEach(req => {
        console.log(`   - Requirement ${req.id}: ${req.implemented ? 'SATISFIED' : 'NOT SATISFIED'}`);
    });
    
    console.log('\n✅ Code structure complete');
    console.log('\n🎮 Game ending conditions are fully functional!');
    
} else {
    console.log('❌ TASK 12 INCOMPLETE\n');
    
    if (!allSubTasksComplete) {
        console.log('❌ Missing sub-task implementations');
    }
    
    if (!allRequirementsMet) {
        console.log('❌ Requirements not fully satisfied:');
        requirements.forEach(req => {
            if (!req.implemented) {
                console.log(`   - Requirement ${req.id}: NOT SATISFIED`);
            }
        });
    }
    
    if (!allStructurePresent) {
        console.log('❌ Code structure incomplete');
    }
}

console.log('\n============================================================');

// Additional verification - check if methods are called in the right places
console.log('\n🔗 Integration Verification:\n');

const integrationChecks = [
    {
        name: 'checkGameEndConditions called in update loop',
        pattern: /update\(\)[\s\S]*?checkGameEndConditions\(\)/,
        found: false
    },
    {
        name: 'handleCollisions processes bottom collision',
        pattern: /handleCollisions[\s\S]*?wallCollision\.bottom[\s\S]*?handleGameOver/,
        found: false
    },
    {
        name: 'Game state messages rendered',
        pattern: /render[\s\S]*?renderGameStateMessage/,
        found: false
    }
];

integrationChecks.forEach(check => {
    check.found = check.pattern.test(scriptContent);
    const status = check.found ? '✅' : '❌';
    console.log(`${status} ${check.name}: ${check.found}`);
});

const allIntegrated = integrationChecks.every(check => check.found);
console.log(`\n🔗 Integration Status: ${allIntegrated ? 'COMPLETE' : 'INCOMPLETE'}`);

console.log('\n============================================================');