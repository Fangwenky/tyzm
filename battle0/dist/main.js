import { Player, Enemy } from './components/Character.js';
import { BattleManager } from './core/BattleManager.js';
import { DeckBuilder } from './core/DeckBuilder.js';
import { DeckBuilderUI } from './core/DeckBuilderUI.js';
import { CardLibrary } from './core/CardLibrary.js';
import { SurvivorLibrary } from './core/SurvivorLibrary.js';
import { SurvivorSelectionUI } from './core/SurvivorSelectionUI.js';
import { chapterConfigManager } from './core/ChapterConfig.js';
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
var CURRENT_CHAPTER_CONFIG;
// 设置当前章节的函数（可被外部调用）
function setCurrentChapter(chapterNumber) {
    CURRENT_CHAPTER_CONFIG = chapterConfigManager.getChapterConfig(chapterNumber);
    chapterConfigManager.logChapterInfo(chapterNumber);
    console.log("\u5F53\u524D\u7AE0\u8282\u914D\u7F6E\u5DF2\u66F4\u65B0\u4E3A\u7B2C ".concat(chapterNumber, " \u7AE0"));
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
// 游戏状态管理
var GameState = /** @class */ (function () {
    function GameState() {
        this.selectedSurvivor = null;
    }
    GameState.prototype.setSelectedSurvivor = function (survivor) {
        this.selectedSurvivor = survivor;
    };
    GameState.prototype.getSelectedSurvivor = function () {
        return this.selectedSurvivor;
    };
    return GameState;
}());
var gameState = new GameState();
function startBattle(setup) {
    var battle = new BattleManager(setup.player, setup.enemy, setup.playerDeck);
    battle.player.ui = {
        showFloatingText: function (text, type) { return battle.ui.showFloatingText('player', text, type); }
    };
    battle.enemy.ui = {
        showFloatingText: function (text, type) { return battle.ui.showFloatingText('enemy', text, type); }
    };
    // 将求生者绑定到玩家
    battle.player.survivor = setup.selectedSurvivor;
    battle.startBattle();
    window.battle = battle;
}
function showScreen(screenId) {
    // 隐藏所有界面
    document.querySelectorAll('#survivor-selection-screen, #deck-builder-screen, #battle-screen').forEach(function (screen) {
        screen.classList.add('hidden');
    });
    // 显示指定界面
    var targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
    }
}
// --- 游戏主流程 ---
var cardLibrary = new CardLibrary();
var deckBuilder = new DeckBuilder(cardLibrary);
var survivorLibrary = new SurvivorLibrary();
// 将cardLibrary设为全局可访问，供其他模块使用
window.cardLibrary = cardLibrary;
// 求生者选择完成后的回调
var onSurvivorSelected = function (survivorId) {
    var survivor = survivorLibrary.createSurvivor(survivorId);
    if (survivor) {
        gameState.setSelectedSurvivor(survivor);
        // 显示牌组构建界面
        showScreen('deck-builder-screen');
        // 初始化牌组构建UI
        new DeckBuilderUI(deckBuilder.getAvailableCards(), deckBuilder.cardLimits, 20, onDeckSelected);
        console.log('已选择求生者:', survivor.data.name);
    }
};
// 牌组选择完成后的回调
var onDeckSelected = function (selectedIds) {
    var selectedSurvivor = gameState.getSelectedSurvivor();
    if (!selectedSurvivor) {
        console.error('未选择求生者！');
        return;
    }
    var finalPlayerDeck = deckBuilder.buildDeck(selectedIds);
    var config = getBattleConfig();
    // 从当前章节配置的可用监管者中随机选择一个
    var availableHunters = config.availableHunters;
    var randomEnemyData = availableHunters[Math.floor(Math.random() * availableHunters.length)];
    var enemy = new Enemy(randomEnemyData.name, randomEnemyData.hp);
    enemy.deck = cardLibrary.buildRandomEnemyDeck(enemy.name, 8, 3);
    console.log("=================== \u6218\u6597\u4FE1\u606F ===================");
    console.log("\u7AE0\u8282: \u7B2C".concat(config.chapterInfo.number, "\u7AE0 - ").concat(config.chapterInfo.name));
    console.log("\u9009\u62E9\u7684\u6C42\u751F\u8005: ".concat(selectedSurvivor.data.name));
    console.log("\u672C\u573A\u6218\u6597\u7684\u654C\u4EBA\u662F: ".concat(enemy.name, "!"));
    console.log("\u654C\u4EBA\u63CF\u8FF0: ".concat(randomEnemyData.description || '无'));
    console.log("\u654C\u4EBA\u7684\u968F\u673A\u724C\u7EC4:", enemy.deck.map(function (c) { return c.name; }));
    console.log("==============================================");
    // 根据选择的求生者创建玩家
    var player = new Player(selectedSurvivor.data.name, selectedSurvivor.data.baseHp);
    player.maxActionPoints = selectedSurvivor.data.baseActionPoints;
    player.actionPoints = selectedSurvivor.data.baseActionPoints;
    // 注释：已按用户要求删除战地医师和战术家随从
    var battleSetupData = {
        player: player,
        enemy: enemy,
        playerDeck: finalPlayerDeck,
        selectedSurvivor: selectedSurvivor
    };
    showScreen('battle-screen');
    startBattle(battleSetupData);
};
// 显示正常的游戏流程，显示当前章节的求生者
function showNormalGameFlow() {
    showScreen('survivor-selection-screen');
    var config = getBattleConfig();
    // 传入当前章节配置的可选求生者ID列表
    new SurvivorSelectionUI(survivorLibrary, onSurvivorSelected, config.availableSurvivors);
    // 显示章节信息提示
    showChapterHint();
}
// 显示章节信息提示
function showChapterHint() {
    var config = getBattleConfig();
    var chapterInfo = config.chapterInfo;
    var chapterHint = document.createElement('div');
    chapterHint.style.cssText = "\n        position: fixed;\n        top: 10px;\n        left: 10px;\n        background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(30, 30, 80, 0.9));\n        color: white;\n        padding: 15px 20px;\n        border-radius: 10px;\n        z-index: 1000;\n        font-size: 14px;\n        max-width: 350px;\n        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);\n        border: 1px solid rgba(255, 255, 255, 0.2);\n    ";
    // 获取求生者名称用于显示
    var survivorNames = config.availableSurvivors.map(function (id) {
        var survivor = survivorLibrary.getAllSurvivors().find(function (s) { return s.id === id; });
        return survivor ? survivor.name : id;
    });
    // 获取可选监管者名称
    var hunterNames = config.availableHunters.map(function (hunter) { return hunter.name; });
    chapterHint.innerHTML = "\n        <div style=\"font-size: 16px; font-weight: bold; color: #ffcc00; margin-bottom: 8px;\">\n            \u7B2C ".concat(chapterInfo.number, " \u7AE0\uFF1A").concat(chapterInfo.name, "\n        </div>\n        <div style=\"margin-bottom: 10px; color: #cccccc; font-style: italic;\">\n            ").concat(chapterInfo.description, "\n        </div>\n        <div><strong>\u53EF\u9009\u6C42\u751F\u8005:</strong></div>\n        <div style=\"color: #88ff88; margin-bottom: 8px;\">").concat(survivorNames.join('、'), "</div>\n        <div><strong>\u672C\u7AE0\u76D1\u7BA1\u8005:</strong></div>\n        <div style=\"color: #ff8888; margin-bottom: 5px;\">").concat(hunterNames.join('、'), "</div>\n        <div style=\"margin-top: 10px; font-size: 11px; color: #999; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 5px;\">\n            \u63D0\u793A\uFF1A\u901A\u8FC7URL\u53C2\u6570 ?chapter=N \u6765\u5207\u6362\u7AE0\u8282 (N=1-6)\n        </div>\n    ");
    document.body.appendChild(chapterHint);
    // 10秒后自动隐藏
    setTimeout(function () {
        if (chapterHint.parentNode) {
            chapterHint.parentNode.removeChild(chapterHint);
        }
    }, 10000);
}
// 游戏初始化 - 根据章节配置显示求生者选择界面
function initializeGame() {
    console.log('================= 游戏初始化 =================');
    // 1. 检测章节数（优先级：URL参数 > 默认第1章）
    var chapterNumber = chapterConfigManager.getChapterFromURL();
    console.log("\u68C0\u6D4B\u5230\u7AE0\u8282\u6570: ".concat(chapterNumber));
    // 2. 设置当前章节配置
    setCurrentChapter(chapterNumber);
    // 3. 获取当前配置并验证
    var config = getBattleConfig();
    // 4. 验证配置的求生者ID是否有效
    var validSurvivors = chapterConfigManager.validateChapterSurvivors(chapterNumber, survivorLibrary);
    if (validSurvivors.length === 0) {
        console.error("\u7B2C ".concat(chapterNumber, " \u7AE0\u7684\u6C42\u751F\u8005\u914D\u7F6E\u65E0\u6548\uFF01"), config.availableSurvivors);
        console.log('可用的求生者ID:', survivorLibrary.getAllSurvivors().map(function (s) { return s.id; }));
        // 回退到第一章
        console.log('回退到第一章配置');
        setCurrentChapter(1);
        var fallbackConfig = getBattleConfig();
        console.log('回退后的配置:', fallbackConfig);
    }
    // 5. 验证配置的监管者是否有效（至少要有一个）
    if (config.availableHunters.length === 0) {
        console.error("\u7B2C ".concat(chapterNumber, " \u7AE0\u6CA1\u6709\u914D\u7F6E\u4EFB\u4F55\u53EF\u9009\u76D1\u7BA1\u8005\uFF01"));
        return;
    }
    // 6. 显示配置信息
    console.log('=================== 最终配置 =================');
    console.log("\u5F53\u524D\u7AE0\u8282: \u7B2C".concat(config.chapterInfo.number, "\u7AE0 - ").concat(config.chapterInfo.name));
    console.log("\u7AE0\u8282\u63CF\u8FF0: ".concat(config.chapterInfo.description));
    console.log("\u53EF\u9009\u6C42\u751F\u8005(".concat(config.availableSurvivors.length, "\u4E2A):"), config.availableSurvivors);
    console.log("\u53EF\u9009\u76D1\u7BA1\u8005(".concat(config.availableHunters.length, "\u4E2A):"), config.availableHunters.map(function (h) { return h.name; }));
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
function setBattleChapter(chapterNumber) {
    console.log("\u5916\u90E8\u8C03\u7528\uFF1A\u8BBE\u7F6E\u6218\u6597\u7AE0\u8282\u4E3A ".concat(chapterNumber));
    setCurrentChapter(chapterNumber);
    // 重新显示求生者选择界面
    showNormalGameFlow();
}
/**
 * 获取当前章节信息
 * @returns 当前章节的配置信息
 */
function getCurrentChapterInfo() {
    var config = getBattleConfig();
    return {
        chapterNumber: config.chapterInfo.number,
        chapterName: config.chapterInfo.name,
        description: config.chapterInfo.description,
        availableSurvivors: config.availableSurvivors,
        availableHunters: config.availableHunters.map(function (h) { return h.name; })
    };
}
/**
 * 获取所有章节列表
 * @returns 所有章节的基本信息
 */
function getAllChaptersInfo() {
    return chapterConfigManager.getAllChapters().map(function (chapter) { return ({
        chapterNumber: chapter.chapterNumber,
        chapterName: chapter.chapterName,
        description: chapter.description,
        survivorCount: chapter.availableSurvivors.length,
        hunterCount: chapter.availableHunters.length
    }); });
}
// 将接口函数暴露到全局 window 对象，供外部调用
window.battleSystem = {
    setBattleChapter: setBattleChapter,
    getCurrentChapterInfo: getCurrentChapterInfo,
    getAllChaptersInfo: getAllChaptersInfo,
    // 兼容性接口（如果主游戏使用其他函数名）
    setChapter: setBattleChapter,
    setLevel: setBattleChapter
};
// 也可以直接暴露到 window 上（为了向后兼容）
window.setBattleChapter = setBattleChapter;
window.setChapter = setBattleChapter;
console.log('================= 全局接口已注册 =================');
console.log('可用接口:');
console.log('- window.battleSystem.setBattleChapter(chapterNumber)');
console.log('- window.battleSystem.getCurrentChapterInfo()');
console.log('- window.battleSystem.getAllChaptersInfo()');
console.log('- window.setBattleChapter(chapterNumber) // 兼容接口');
console.log('=================================================');
//# sourceMappingURL=main.js.map