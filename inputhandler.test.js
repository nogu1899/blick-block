// InputHandler クラスの単体テスト

// テスト用のモック関数
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

// DOM APIのモック
Object.defineProperty(global, 'document', {
    value: {
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener
    },
    writable: true
});

Object.defineProperty(global, 'window', {
    value: {
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener
    },
    writable: true
});

// console.log と console.warn をモック
global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

// InputHandler クラスをインポート（script.js から）
// テスト環境では直接クラス定義を含める
class InputHandler {
    constructor() {
        this.keys = new Set();
        this.initialized = false;
        this.KEY_CODES = {
            LEFT: 'ArrowLeft',
            RIGHT: 'ArrowRight',
            SPACE: ' ',
            ESCAPE: 'Escape',
            ENTER: 'Enter'
        };
    }
    
    init() {
        if (this.initialized) {
            console.warn('InputHandler already initialized');
            return;
        }
        
        try {
            document.addEventListener('keydown', this.handleKeyDown.bind(this));
            document.addEventListener('keyup', this.handleKeyUp.bind(this));
            window.addEventListener('blur', this.handleWindowBlur.bind(this));
            
            this.initialized = true;
            console.log('InputHandler initialized successfully');
            
        } catch (error) {
            console.error('InputHandler initialization failed:', error);
            throw error;
        }
    }
    
    handleKeyDown(event) {
        try {
            if (this.isGameKey(event.key)) {
                event.preventDefault();
            }
            
            this.keys.add(event.key);
            console.log(`Key pressed: ${event.key}`);
            
        } catch (error) {
            console.error('Error in handleKeyDown:', error);
        }
    }
    
    handleKeyUp(event) {
        try {
            this.keys.delete(event.key);
            console.log(`Key released: ${event.key}`);
            
        } catch (error) {
            console.error('Error in handleKeyUp:', error);
        }
    }
    
    handleWindowBlur() {
        try {
            this.keys.clear();
            console.log('Window lost focus, cleared all key states');
            
        } catch (error) {
            console.error('Error in handleWindowBlur:', error);
        }
    }
    
    isKeyPressed(key) {
        return this.keys.has(key);
    }
    
    isLeftPressed() {
        return this.isKeyPressed(this.KEY_CODES.LEFT);
    }
    
    isRightPressed() {
        return this.isKeyPressed(this.KEY_CODES.RIGHT);
    }
    
    isSpacePressed() {
        return this.isKeyPressed(this.KEY_CODES.SPACE);
    }
    
    isEscapePressed() {
        return this.isKeyPressed(this.KEY_CODES.ESCAPE);
    }
    
    isEnterPressed() {
        return this.isKeyPressed(this.KEY_CODES.ENTER);
    }
    
    isGameKey(key) {
        return Object.values(this.KEY_CODES).includes(key);
    }
    
    getPressedKeys() {
        return Array.from(this.keys);
    }
    
    clearKeys() {
        this.keys.clear();
    }
    
    destroy() {
        if (!this.initialized) {
            return;
        }
        
        try {
            document.removeEventListener('keydown', this.handleKeyDown.bind(this));
            document.removeEventListener('keyup', this.handleKeyUp.bind(this));
            window.removeEventListener('blur', this.handleWindowBlur.bind(this));
            
            this.keys.clear();
            this.initialized = false;
            
            console.log('InputHandler destroyed successfully');
            
        } catch (error) {
            console.error('Error destroying InputHandler:', error);
        }
    }
    
    getDebugInfo() {
        return {
            initialized: this.initialized,
            pressedKeys: this.getPressedKeys(),
            keyCount: this.keys.size,
            leftPressed: this.isLeftPressed(),
            rightPressed: this.isRightPressed(),
            spacePressed: this.isSpacePressed()
        };
    }
}

describe('InputHandler', () => {
    let inputHandler;
    
    beforeEach(() => {
        // モック関数をリセット
        mockAddEventListener.mockClear();
        mockRemoveEventListener.mockClear();
        console.log.mockClear();
        console.warn.mockClear();
        console.error.mockClear();
        
        // 新しいInputHandlerインスタンスを作成
        inputHandler = new InputHandler();
    });
    
    afterEach(() => {
        // テスト後のクリーンアップ
        if (inputHandler && inputHandler.initialized) {
            inputHandler.destroy();
        }
    });
    
    describe('コンストラクタ', () => {
        test('初期状態が正しく設定される', () => {
            expect(inputHandler.keys).toBeInstanceOf(Set);
            expect(inputHandler.keys.size).toBe(0);
            expect(inputHandler.initialized).toBe(false);
            expect(inputHandler.KEY_CODES).toBeDefined();
            expect(inputHandler.KEY_CODES.LEFT).toBe('ArrowLeft');
            expect(inputHandler.KEY_CODES.RIGHT).toBe('ArrowRight');
            expect(inputHandler.KEY_CODES.SPACE).toBe(' ');
        });
    });
    
    describe('init()', () => {
        test('初期化が正常に実行される', () => {
            inputHandler.init();
            
            expect(inputHandler.initialized).toBe(true);
            expect(mockAddEventListener).toHaveBeenCalledTimes(3);
            expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
            expect(mockAddEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
            expect(mockAddEventListener).toHaveBeenCalledWith('blur', expect.any(Function));
            expect(console.log).toHaveBeenCalledWith('InputHandler initialized successfully');
        });
        
        test('重複初期化時に警告が表示される', () => {
            inputHandler.init();
            inputHandler.init(); // 2回目の初期化
            
            expect(console.warn).toHaveBeenCalledWith('InputHandler already initialized');
        });
    });
    
    describe('キー押下処理', () => {
        beforeEach(() => {
            inputHandler.init();
        });
        
        test('handleKeyDown でキーが正しく記録される', () => {
            const mockEvent = {
                key: 'ArrowLeft',
                preventDefault: jest.fn()
            };
            
            inputHandler.handleKeyDown(mockEvent);
            
            expect(inputHandler.keys.has('ArrowLeft')).toBe(true);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('Key pressed: ArrowLeft');
        });
        
        test('handleKeyUp でキーが正しく削除される', () => {
            const mockEvent = { key: 'ArrowLeft' };
            
            // まずキーを押下状態にする
            inputHandler.keys.add('ArrowLeft');
            expect(inputHandler.keys.has('ArrowLeft')).toBe(true);
            
            // キーを離す
            inputHandler.handleKeyUp(mockEvent);
            
            expect(inputHandler.keys.has('ArrowLeft')).toBe(false);
            expect(console.log).toHaveBeenCalledWith('Key released: ArrowLeft');
        });
        
        test('ゲームキー以外ではpreventDefaultが呼ばれない', () => {
            const mockEvent = {
                key: 'a',
                preventDefault: jest.fn()
            };
            
            inputHandler.handleKeyDown(mockEvent);
            
            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
            expect(inputHandler.keys.has('a')).toBe(true);
        });
    });
    
    describe('キー状態チェック', () => {
        beforeEach(() => {
            inputHandler.init();
        });
        
        test('isKeyPressed が正しく動作する', () => {
            expect(inputHandler.isKeyPressed('ArrowLeft')).toBe(false);
            
            inputHandler.keys.add('ArrowLeft');
            expect(inputHandler.isKeyPressed('ArrowLeft')).toBe(true);
        });
        
        test('isLeftPressed が正しく動作する', () => {
            expect(inputHandler.isLeftPressed()).toBe(false);
            
            inputHandler.keys.add('ArrowLeft');
            expect(inputHandler.isLeftPressed()).toBe(true);
        });
        
        test('isRightPressed が正しく動作する', () => {
            expect(inputHandler.isRightPressed()).toBe(false);
            
            inputHandler.keys.add('ArrowRight');
            expect(inputHandler.isRightPressed()).toBe(true);
        });
        
        test('isSpacePressed が正しく動作する', () => {
            expect(inputHandler.isSpacePressed()).toBe(false);
            
            inputHandler.keys.add(' ');
            expect(inputHandler.isSpacePressed()).toBe(true);
        });
        
        test('isEscapePressed が正しく動作する', () => {
            expect(inputHandler.isEscapePressed()).toBe(false);
            
            inputHandler.keys.add('Escape');
            expect(inputHandler.isEscapePressed()).toBe(true);
        });
        
        test('isEnterPressed が正しく動作する', () => {
            expect(inputHandler.isEnterPressed()).toBe(false);
            
            inputHandler.keys.add('Enter');
            expect(inputHandler.isEnterPressed()).toBe(true);
        });
    });
    
    describe('ユーティリティメソッド', () => {
        test('isGameKey が正しく判定する', () => {
            expect(inputHandler.isGameKey('ArrowLeft')).toBe(true);
            expect(inputHandler.isGameKey('ArrowRight')).toBe(true);
            expect(inputHandler.isGameKey(' ')).toBe(true);
            expect(inputHandler.isGameKey('Escape')).toBe(true);
            expect(inputHandler.isGameKey('Enter')).toBe(true);
            expect(inputHandler.isGameKey('a')).toBe(false);
            expect(inputHandler.isGameKey('1')).toBe(false);
        });
        
        test('getPressedKeys が正しく動作する', () => {
            inputHandler.keys.add('ArrowLeft');
            inputHandler.keys.add('ArrowRight');
            
            const pressedKeys = inputHandler.getPressedKeys();
            expect(pressedKeys).toContain('ArrowLeft');
            expect(pressedKeys).toContain('ArrowRight');
            expect(pressedKeys.length).toBe(2);
        });
        
        test('clearKeys が正しく動作する', () => {
            inputHandler.keys.add('ArrowLeft');
            inputHandler.keys.add('ArrowRight');
            expect(inputHandler.keys.size).toBe(2);
            
            inputHandler.clearKeys();
            expect(inputHandler.keys.size).toBe(0);
        });
    });
    
    describe('ウィンドウフォーカス処理', () => {
        beforeEach(() => {
            inputHandler.init();
        });
        
        test('handleWindowBlur でキー状態がクリアされる', () => {
            inputHandler.keys.add('ArrowLeft');
            inputHandler.keys.add('ArrowRight');
            expect(inputHandler.keys.size).toBe(2);
            
            inputHandler.handleWindowBlur();
            
            expect(inputHandler.keys.size).toBe(0);
            expect(console.log).toHaveBeenCalledWith('Window lost focus, cleared all key states');
        });
    });
    
    describe('destroy()', () => {
        test('正常にクリーンアップされる', () => {
            inputHandler.init();
            expect(inputHandler.initialized).toBe(true);
            
            inputHandler.destroy();
            
            expect(inputHandler.initialized).toBe(false);
            expect(inputHandler.keys.size).toBe(0);
            expect(mockRemoveEventListener).toHaveBeenCalledTimes(3);
            expect(console.log).toHaveBeenCalledWith('InputHandler destroyed successfully');
        });
        
        test('未初期化状態でのdestroy呼び出しは何もしない', () => {
            expect(inputHandler.initialized).toBe(false);
            
            inputHandler.destroy();
            
            expect(mockRemoveEventListener).not.toHaveBeenCalled();
        });
    });
    
    describe('getDebugInfo()', () => {
        test('デバッグ情報が正しく取得される', () => {
            inputHandler.init();
            inputHandler.keys.add('ArrowLeft');
            inputHandler.keys.add(' ');
            
            const debugInfo = inputHandler.getDebugInfo();
            
            expect(debugInfo.initialized).toBe(true);
            expect(debugInfo.pressedKeys).toContain('ArrowLeft');
            expect(debugInfo.pressedKeys).toContain(' ');
            expect(debugInfo.keyCount).toBe(2);
            expect(debugInfo.leftPressed).toBe(true);
            expect(debugInfo.rightPressed).toBe(false);
            expect(debugInfo.spacePressed).toBe(true);
        });
    });
    
    describe('エラーハンドリング', () => {
        test('handleKeyDown でエラーが発生してもクラッシュしない', () => {
            inputHandler.init();
            
            // エラーを発生させるモックイベント
            const mockEvent = {
                key: 'ArrowLeft',
                preventDefault: () => {
                    throw new Error('Test error');
                }
            };
            
            expect(() => {
                inputHandler.handleKeyDown(mockEvent);
            }).not.toThrow();
            
            expect(console.error).toHaveBeenCalledWith('Error in handleKeyDown:', expect.any(Error));
        });
        
        test('handleKeyUp でエラーが発生してもクラッシュしない', () => {
            inputHandler.init();
            
            // keys.delete でエラーを発生させる
            inputHandler.keys.delete = jest.fn(() => {
                throw new Error('Test error');
            });
            
            const mockEvent = { key: 'ArrowLeft' };
            
            expect(() => {
                inputHandler.handleKeyUp(mockEvent);
            }).not.toThrow();
            
            expect(console.error).toHaveBeenCalledWith('Error in handleKeyUp:', expect.any(Error));
        });
    });
    
    describe('要件検証', () => {
        beforeEach(() => {
            inputHandler.init();
        });
        
        test('要件 2.1: 左矢印キーの検出', () => {
            // WHEN プレイヤーが左矢印キーを押す
            const leftKeyEvent = {
                key: 'ArrowLeft',
                preventDefault: jest.fn()
            };
            
            inputHandler.handleKeyDown(leftKeyEvent);
            
            // THEN システムは左キーの押下を検出する
            expect(inputHandler.isLeftPressed()).toBe(true);
            expect(inputHandler.isKeyPressed('ArrowLeft')).toBe(true);
        });
        
        test('要件 2.2: 右矢印キーの検出', () => {
            // WHEN プレイヤーが右矢印キーを押す
            const rightKeyEvent = {
                key: 'ArrowRight',
                preventDefault: jest.fn()
            };
            
            inputHandler.handleKeyDown(rightKeyEvent);
            
            // THEN システムは右キーの押下を検出する
            expect(inputHandler.isRightPressed()).toBe(true);
            expect(inputHandler.isKeyPressed('ArrowRight')).toBe(true);
        });
        
        test('要件 5.4: スペースキーによるリスタート検出', () => {
            // WHEN ゲーム終了後にスペースキーが押される
            const spaceKeyEvent = {
                key: ' ',
                preventDefault: jest.fn()
            };
            
            inputHandler.handleKeyDown(spaceKeyEvent);
            
            // THEN システムはスペースキーの押下を検出する
            expect(inputHandler.isSpacePressed()).toBe(true);
            expect(inputHandler.isKeyPressed(' ')).toBe(true);
        });
        
        test('複数キーの同時押下処理', () => {
            // 左右同時押下のテスト
            inputHandler.handleKeyDown({ key: 'ArrowLeft', preventDefault: jest.fn() });
            inputHandler.handleKeyDown({ key: 'ArrowRight', preventDefault: jest.fn() });
            
            expect(inputHandler.isLeftPressed()).toBe(true);
            expect(inputHandler.isRightPressed()).toBe(true);
            expect(inputHandler.keys.size).toBe(2);
        });
        
        test('キー離上時の状態更新', () => {
            // キーを押下
            inputHandler.handleKeyDown({ key: 'ArrowLeft', preventDefault: jest.fn() });
            expect(inputHandler.isLeftPressed()).toBe(true);
            
            // キーを離上
            inputHandler.handleKeyUp({ key: 'ArrowLeft' });
            expect(inputHandler.isLeftPressed()).toBe(false);
        });
    });
});