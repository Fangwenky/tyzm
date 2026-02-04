import { Player, Enemy } from './components/Character.js';
import { Card, CardData, BattleContext, NormalAttackCard } from './components/Card.js';
import { BattleManager } from './core/BattleManager.js';
import { Follower } from './components/Follower.js';
import { DeckBuilder } from './core/DeckBuilder.js';
import { DeckBuilderUI } from './core/DeckBuilderUI.js';
import { CardLibrary } from './core/CardLibrary.js';
import { SurvivorLibrary } from './core/SurvivorLibrary.js';
import { SurvivorSelectionUI } from './core/SurvivorSelectionUI.js';
import { Survivor } from './components/Survivor.js';
import { chapterConfigManager, ChapterBattleConfig } from './core/ChapterConfig.js';

// =================== 章节战斗配置系统 ===================
// 现在支持根据章节数自动配置求生者和监管者！
// 
// 使用方法：
// 1. URL参数方式：在URL中添加 ?chapter=2 或 ?level=3
// 2. 程序调用方式：调用 setCurrentChapter(chapterNumber)
// 
// 章节说明：
// 第1章：医者仁心 - 医疗主题 (医生、园丁、作曲家 vs 厂长)
// 第2章：法理之争 - 智力对决 (律师、小说家、记者 vs 小丑)
// 第3章：野性呼唤 - 力量较量 (野人、前锋、昆虫学家 vs 蜘蛛)
// 第4章：舞台惊魂 - 敏捷表演 (舞女、杂技演员、小女孩 vs 红夫人)
// 第5章：机械迷城 - 科技对决 (机械师、医生、律师 vs 愚人金)
// 第6章：末日审判 - 终极对决 (全体求生者 vs 噩梦)

// 当前章节配置（动态设置）
let CURRENT_CHAPTER_CONFIG: ChapterBattleConfig;

// 设置当前章节的函数（可被外部调用）
function setCurrentChapter(chapterNumber: number): void {
    CURRENT_CHAPTER_CONFIG = chapterConfigManager.getChapterConfig(chapterNumber);
    chapterConfigManager.logChapterInfo(chapterNumber);
    console.log(`当前章节配置已更新为第 ${chapterNumber} 章`);
}

// 获取当前战斗配置（兼容原有代码结构）
function getBattleConfig() {
    return {
        availableSurvivors: CURRENT_CHAPTER_CONFIG.availableSurvivors,
        availableHunters: CURRENT_CHAPTER_CONFIG.availableHunters,
        chapterInfo: {
            number: CURRENT_CHAPTER_CONFIG.chapterNumber,
            name: CURRENT_CHAPTER_CONFIG.chapterName,
            description: CURRENT_CHAPTER_CONFIG.description
        }
    };
}

// ======================================================

interface BattleSetup {
    player: Player;
    enemy: Enemy;
    playerDeck: Card[];
    selectedSurvivor: Survivor;
}

// 游戏状态管理
class GameState {
    selectedSurvivor: Survivor | null = null;
    
    setSelectedSurvivor(survivor: Survivor): void {
        this.selectedSurvivor = survivor;
    }
    
    getSelectedSurvivor(): Survivor | null {
        return this.selectedSurvivor;
    }
}

const gameState = new GameState();

function startBattle(setup: BattleSetup) {
    const battle = new BattleManager(setup.player, setup.enemy, setup.playerDeck);

    (battle.player as any).ui = {
        showFloatingText: (text: string, type: 'damage' | 'heal') => (battle as any).ui.showFloatingText('player', text, type)
    };
    (battle.enemy as any).ui = {
        showFloatingText: (text: string, type: 'damage' | 'heal') => (battle as any).ui.showFloatingText('enemy', text, type)
    };
    
    // 将求生者绑定到玩家
    (battle.player as any).survivor = setup.selectedSurvivor;
    
    battle.startBattle();
    (window as any).battle = battle;
}

function showScreen(screenId: string): void {
    // 隐藏所有界面
    document.querySelectorAll('#survivor-selection-screen, #deck-builder-screen, #battle-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // 显示指定界面
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
    }
}

// --- 游戏主流程 ---

const cardLibrary = new CardLibrary();
const deckBuilder = new DeckBuilder(cardLibrary);
const survivorLibrary = new SurvivorLibrary();

// 将cardLibrary设为全局可访问，供其他模块使用
(window as any).cardLibrary = cardLibrary;

// 求生者选择完成后的回调
const onSurvivorSelected = (survivorId: string) => {
    const survivor = survivorLibrary.createSurvivor(survivorId);
    if (survivor) {
        gameState.setSelectedSurvivor(survivor);
        
        // 显示牌组构建界面
        showScreen('deck-builder-screen');
        
        // 初始化牌组构建UI
        new DeckBuilderUI(
            deckBuilder.getAvailableCards(),
            deckBuilder.cardLimits,
            20,
            onDeckSelected
        );
        
        console.log('已选择求生者:', survivor.data.name);
    }
};

// 牌组选择完成后的回调
const onDeckSelected = (selectedIds: string[]) => {
    const selectedSurvivor = gameState.getSelectedSurvivor();
    if (!selectedSurvivor) {
        console.error('未选择求生者！');
        return;
    }
    
    const finalPlayerDeck = deckBuilder.buildDeck(selectedIds);
    const config = getBattleConfig();

    // 从当前章节配置的可用监管者中随机选择一个
    const availableHunters = config.availableHunters;
    const randomEnemyData = availableHunters[Math.floor(Math.random() * availableHunters.length)];
    const enemy = new Enemy(randomEnemyData.name, randomEnemyData.hp);

    enemy.deck = cardLibrary.buildRandomEnemyDeck(enemy.name, 8, 3); 
    
    console.log(`=================== 战斗信息 ===================`);
    console.log(`章节: 第${config.chapterInfo.number}章 - ${config.chapterInfo.name}`);
    console.log(`选择的求生者: ${selectedSurvivor.data.name}`);
    console.log(`本场战斗的敌人是: ${enemy.name}!`);
    console.log(`敌人描述: ${randomEnemyData.description || '无'}`);
    console.log(`敌人的随机牌组:`, enemy.deck.map(c => c.name));
    console.log(`==============================================`);

    // 根据选择的求生者创建玩家
    const player = new Player(selectedSurvivor.data.name, selectedSurvivor.data.baseHp);
    player.maxActionPoints = selectedSurvivor.data.baseActionPoints;
    player.actionPoints = selectedSurvivor.data.baseActionPoints;
    
    // 注释：已按用户要求删除战地医师和战术家随从
    
    const battleSetupData: BattleSetup = {
        player: player,
        enemy: enemy,
        playerDeck: finalPlayerDeck,
        selectedSurvivor: selectedSurvivor
    };

    showScreen('battle-screen');
    startBattle(battleSetupData);
};

// 显示正常的游戏流程，显示当前章节的求生者
function showNormalGameFlow(): void {
    showScreen('survivor-selection-screen');
    const config = getBattleConfig();
    
    // 传入当前章节配置的可选求生者ID列表
    new SurvivorSelectionUI(survivorLibrary, onSurvivorSelected, config.availableSurvivors);
    
    // 显示章节信息提示
    showChapterHint();
}

// 显示章节信息提示
function showChapterHint(): void {
    const config = getBattleConfig();
    const chapterInfo = config.chapterInfo;
    
    const chapterHint = document.createElement('div');
    chapterHint.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(30, 30, 80, 0.9));
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 1000;
        font-size: 14px;
        max-width: 350px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    // 获取求生者名称用于显示
    const survivorNames = config.availableSurvivors.map(id => {
        const survivor = survivorLibrary.getAllSurvivors().find(s => s.id === id);
        return survivor ? survivor.name : id;
    });
    
    // 获取可选监管者名称
    const hunterNames = config.availableHunters.map(hunter => hunter.name);
    
    chapterHint.innerHTML = `
        <div style="font-size: 16px; font-weight: bold; color: #ffcc00; margin-bottom: 8px;">
            第 ${chapterInfo.number} 章：${chapterInfo.name}
        </div>
        <div style="margin-bottom: 10px; color: #cccccc; font-style: italic;">
            ${chapterInfo.description}
        </div>
        <div><strong>可选求生者:</strong></div>
        <div style="color: #88ff88; margin-bottom: 8px;">${survivorNames.join('、')}</div>
        <div><strong>本章监管者:</strong></div>
        <div style="color: #ff8888; margin-bottom: 5px;">${hunterNames.join('、')}</div>
        <div style="margin-top: 10px; font-size: 11px; color: #999; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 5px;">
            提示：通过URL参数 ?chapter=N 来切换章节 (N=1-6)
        </div>
    `;
    document.body.appendChild(chapterHint);
    
    // 10秒后自动隐藏
    setTimeout(() => {
        if (chapterHint.parentNode) {
            chapterHint.parentNode.removeChild(chapterHint);
        }
    }, 10000);
}

// 游戏初始化 - 根据章节配置显示求生者选择界面
function initializeGame(): void {
    console.log('================= 游戏初始化 =================');
    
    // 1. 检测章节数（优先级：URL参数 > 默认第1章）
    let chapterNumber = chapterConfigManager.getChapterFromURL();
    console.log(`检测到章节数: ${chapterNumber}`);
    
    // 2. 设置当前章节配置
    setCurrentChapter(chapterNumber);
    
    // 3. 获取当前配置并验证
    const config = getBattleConfig();
    
    // 4. 验证配置的求生者ID是否有效
    const validSurvivors = chapterConfigManager.validateChapterSurvivors(chapterNumber, survivorLibrary);
    
    if (validSurvivors.length === 0) {
        console.error(`第 ${chapterNumber} 章的求生者配置无效！`, config.availableSurvivors);
        console.log('可用的求生者ID:', survivorLibrary.getAllSurvivors().map((s: any) => s.id));
        
        // 回退到第一章
        console.log('回退到第一章配置');
        setCurrentChapter(1);
        const fallbackConfig = getBattleConfig();
        console.log('回退后的配置:', fallbackConfig);
    }
    
    // 5. 验证配置的监管者是否有效（至少要有一个）
    if (config.availableHunters.length === 0) {
        console.error(`第 ${chapterNumber} 章没有配置任何可选监管者！`);
        return;
    }
    
    // 6. 显示配置信息
    console.log('=================== 最终配置 =================');
    console.log(`当前章节: 第${config.chapterInfo.number}章 - ${config.chapterInfo.name}`);
    console.log(`章节描述: ${config.chapterInfo.description}`);
    console.log(`可选求生者(${config.availableSurvivors.length}个):`, config.availableSurvivors);
    console.log(`可选监管者(${config.availableHunters.length}个):`, config.availableHunters.map(h => h.name));
    console.log('===========================================');
    
    // 7. 显示正常的选择流程
    showNormalGameFlow();
}

// 启动游戏
initializeGame();

// =================== 全局接口 ===================
// 提供给外部调用的接口函数

/**
 * 设置战斗章节并重新初始化游戏
 * @param chapterNumber 章节数 (1-6)
 */
function setBattleChapter(chapterNumber: number): void {
    console.log(`外部调用：设置战斗章节为 ${chapterNumber}`);
    setCurrentChapter(chapterNumber);
    
    // 重新显示求生者选择界面
    showNormalGameFlow();
}

/**
 * 获取当前章节信息
 * @returns 当前章节的配置信息
 */
function getCurrentChapterInfo() {
    const config = getBattleConfig();
    return {
        chapterNumber: config.chapterInfo.number,
        chapterName: config.chapterInfo.name,
        description: config.chapterInfo.description,
        availableSurvivors: config.availableSurvivors,
        availableHunters: config.availableHunters.map(h => h.name)
    };
}

/**
 * 获取所有章节列表
 * @returns 所有章节的基本信息
 */
function getAllChaptersInfo() {
    return chapterConfigManager.getAllChapters().map(chapter => ({
        chapterNumber: chapter.chapterNumber,
        chapterName: chapter.chapterName,
        description: chapter.description,
        survivorCount: chapter.availableSurvivors.length,
        hunterCount: chapter.availableHunters.length
    }));
}

// 将接口函数暴露到全局 window 对象，供外部调用
(window as any).battleSystem = {
    setBattleChapter,
    getCurrentChapterInfo,
    getAllChaptersInfo,
    // 兼容性接口（如果主游戏使用其他函数名）
    setChapter: setBattleChapter,
    setLevel: setBattleChapter
};

// 也可以直接暴露到 window 上（为了向后兼容）
(window as any).setBattleChapter = setBattleChapter;
(window as any).setChapter = setBattleChapter;

console.log('================= 全局接口已注册 =================');
console.log('可用接口:');
console.log('- window.battleSystem.setBattleChapter(chapterNumber)');
console.log('- window.battleSystem.getCurrentChapterInfo()');
console.log('- window.battleSystem.getAllChaptersInfo()');
console.log('- window.setBattleChapter(chapterNumber) // 兼容接口');
console.log('=================================================');