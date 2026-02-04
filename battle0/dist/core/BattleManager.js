var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { shuffle } from '../utils/shuffle.js';
import { BattleUI } from './BattleUI.js';
var sleep = function (ms) { return new Promise(function (res) { return setTimeout(res, ms); }); };

function playAudio(soundFile) {
    try {
        var audio = new Audio(soundFile); // 创建一个新的Audio对象
        audio.play();                      // 播放声音
    } catch (error) {
        console.error("播放音频失败:", soundFile, error);
    }
}

var BattleManager = /** @class */ (function () {
    function BattleManager(player, enemy, playerDeck) {
        var _this = this;
        this.turn = 1;
        this.gameState = 'ONGOING';
        this.isPlayerTurn = true;
        this.ui = null;
        this.currentContext = null;
        this.currentPlayingCard = null;
        this.player = player;
        this.enemy = enemy;
        this.player.deck = playerDeck;
        try {
            this.ui = new BattleUI(function (index) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.handleCardClick(index)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            }); }); }, function (index) { return _this.playerUseFollowerSkill(index); }, function () { return _this.endPlayerTurn(); }, function () { return _this.playerUseSurvivorSkill(); });
        }
        catch (error) {
            console.error('BattleUI初始化失败:', error);
            alert('战斗界面初始化失败！请检查页面结构是否正确。');
            throw error;
        }
    }
    // 安全的日志方法
    BattleManager.prototype.safeLogAction = function (message, type) {
        if (this.ui) {
            this.ui.logAction(message, type);
        }
        else {
            console.log("[\u6218\u6597\u65E5\u5FD7] ".concat(type, ": ").concat(message));
        }
    };
    // 安全的UI操作方法
    BattleManager.prototype.safeUICall = function (action) {
        if (this.ui) {
            try {
                action();
            }
            catch (error) {
                console.error('UI操作失败:', error);
            }
        }
    };
    BattleManager.prototype.handleCardClick = function (index) {
        return __awaiter(this, void 0, void 0, function () {
            var selectedCard, actualTarget;
            var _a;
            return __generator(this, function (_b) {
                // 如果有卡牌正在等待选择目标
                if ((_a = this.currentContext) === null || _a === void 0 ? void 0 : _a.awaitingCardChoice) {
                    selectedCard = this.player.hand[index];
                    this.currentContext.chosenCard = selectedCard;
                    this.currentContext.awaitingCardChoice = false;
                    // 重新执行之前的卡牌
                    if (this.currentPlayingCard) {
                        actualTarget = this.currentPlayingCard.targetType === 'self' ? this.player : this.enemy;
                        this.currentPlayingCard.play(this.player, actualTarget, this.currentContext);
                    }
                    return [2 /*return*/];
                }
                if (this.gameState === 'AWAITING_DISCARD') {
                    this.playerDiscardCard(index);
                }
                else {
                    this.playerPlayCard(index);
                }
                return [2 /*return*/];
            });
        });
    };
    BattleManager.prototype.startBattle = function () {
        var _a, _b;
        var _this = this;
        this.safeUICall(function () { return _this.ui.show(); });

        this.safeUICall(function () { 
            // 传入你的BGM文件路径
            return _this.ui.startBackgroundMusic('../assets/audios/audio.mp3'); 
        });

        this.safeLogAction("================ 战斗开始 ================", 'system');
        // 输出初始状态
        console.log('[战斗开始] 初始状态：', {
            '玩家手牌数': this.player.hand.length,
            '玩家手牌': this.player.hand.map(function (card) { return card.name; }),
            '玩家牌组数': this.player.deck.length,
            '敌人手牌数': this.enemy.hand.length,
            '敌人牌组数': this.enemy.deck.length
        });
        // 确保所有选择的牌都在牌组中
        (_a = this.player.deck).push.apply(_a, this.player.hand);
        this.player.hand = [];
        (_b = this.enemy.deck).push.apply(_b, this.enemy.hand);
        this.enemy.hand = [];
        console.log('[战斗开始] 重置后状态：', {
            '玩家手牌数': this.player.hand.length,
            '玩家牌组数': this.player.deck.length,
            '敌人手牌数': this.enemy.hand.length,
            '敌人牌组数': this.enemy.deck.length
        });
        // 洗牌
        shuffle(this.player.deck);
        shuffle(this.enemy.deck);
        console.log('[战斗开始] 洗牌完成');
        // 抽4张起始手牌
        console.log('[战斗开始] 开始抽取起始手牌');
        this.player.drawCards(4);
        this.enemy.drawCards(4);
        console.log('[战斗开始] 最终状态：', {
            '玩家手牌数': this.player.hand.length,
            '玩家手牌': this.player.hand.map(function (card) { return card.name; }),
            '玩家牌组数': this.player.deck.length,
            '敌人手牌数': this.enemy.hand.length,
            '敌人牌组数': this.enemy.deck.length
        });
        this.startPlayerTurn();
    };
    BattleManager.prototype.startPlayerTurn = function () {
        var _this = this;
        this.isPlayerTurn = true;
        this.safeLogAction("\n--- \u7B2C ".concat(this.turn, " \u56DE\u5408\uFF1A\u4F60\u7684\u56DE\u5408 ---"), 'system');
        this.safeUICall(function () { return _this.ui.toggleEndTurnButton(true); });
        // 触发求生者回合开始技能
        this.player.triggerSurvivorPassive('startOfTurn', { player: this.player, enemy: this.enemy, turn: this.turn });
        // 触发玩家装备的回合开始效果
        this.player.onTurnStart();
        this.player.followers.forEach(function (follower) {
            follower.tickCooldown();
            if (follower.passiveSkill.trigger === 'startOfTurn') {
                _this.safeLogAction("[\u88AB\u52A8] ".concat(follower.name, " \u7684 \"").concat(follower.passiveSkill.name, "\" \u89E6\u53D1\u4E86\uFF01"), 'info');
                follower.passiveSkill.effect({ player: _this.player, enemy: _this.enemy, turn: _this.turn });
            }
        });
        if (this.checkWinCondition())
            return;
        // 除了第一回合外，每回合开始时抽4张牌
        if (this.turn > 1) {
            // 检查抽牌数量（可能被求生者技能影响）
            var drawCount = 4;
            var drawPenalty = this.player.effects.getTotalValue('draw_penalty');
            if (drawPenalty > 0) {
                drawCount = Math.max(0, drawCount - drawPenalty);
                this.player.effects.remove('draw_penalty');
                if (drawCount === 0) {
                    this.safeLogAction('由于技能效果，本回合不能抽牌！', 'system');
                }
            }
            if (drawCount > 0) {
                console.log("[\u56DE\u5408\u5F00\u59CB] \u7B2C ".concat(this.turn, " \u56DE\u5408\uFF0C\u62BD\u53D6 ").concat(drawCount, " \u5F20\u724C"));
                this.player.drawCards(drawCount);
            }
        }
        else {
            console.log('[回合开始] 第1回合，跳过抽牌阶段');
        }
        this.player.actionPoints = this.player.maxActionPoints;
        this.safeUICall(function () { return _this.ui.updateAll(_this.player, _this.enemy); });
    };
    BattleManager.prototype.playerPlayCard = function (handIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var card, context, actionCard, animationTarget, playedCard, actualTarget;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[DEBUG] BattleManager.playerPlayCard() \u5F00\u59CB, handIndex: ".concat(handIndex));
                        if (!this.isPlayerTurn || this.gameState !== 'ONGOING') {
                            console.log("[DEBUG] \u4E0D\u662F\u73A9\u5BB6\u56DE\u5408\u6216\u6E38\u620F\u72B6\u6001\u4E0D\u6B63\u786E");
                            return [2 /*return*/];
                        }
                        card = this.player.hand[handIndex];
                        if (!card) {
                            console.log("[DEBUG] \u5361\u724C\u4E0D\u5B58\u5728");
                            return [2 /*return*/];
                        }
                        console.log("[DEBUG] \u73A9\u5BB6\u5C1D\u8BD5\u4F7F\u7528\u5361\u724C: ".concat(card.name));
                        context = { player: this.player, enemy: this.enemy, turn: this.turn };
                        console.log("[DEBUG] \u68C0\u67E5\u654C\u4EBA\u662F\u5426\u6709\u53CD\u5236\u724C...");
                        return [4 /*yield*/, this.enemy.tryCounter(card, context)];
                    case 1:
                        if (_a.sent()) {
                            console.log("[DEBUG] \u5361\u724C\u88AB\u654C\u4EBA\u53CD\u5236\uFF0C\u79FB\u9664\u5361\u724C");
                            // 如果被反制，移除卡牌但不消耗行动点
                            this.player.hand.splice(handIndex, 1);
                            // 装备牌被反制时直接删除，不进入弃牌堆
                            if (card.type === 'Equipment') {
                                this.safeLogAction("\u88C5\u5907\u724C\u3010".concat(card.name, "\u3011\u88AB\u53CD\u5236\uFF0C\u5DF2\u5220\u9664\uFF01"), 'system');
                            }
                            else {
                                this.player.discardPile.push(card);
                                this.safeLogAction("\u5361\u724C\u3010".concat(card.name, "\u3011\u88AB\u53CD\u5236\uFF0C\u79FB\u5165\u5F03\u724C\u5806\uFF01"), 'system');
                            }
                            // 检查游戏结束条件
                            if (this.checkWinCondition()) {
                                console.log("[DEBUG] \u6E38\u620F\u7ED3\u675F\u6761\u4EF6\u6EE1\u8DB3");
                                return [2 /*return*/];
                            }
                            // 更新界面
                            this.safeUICall(function () { return _this.ui.updateAll(_this.player, _this.enemy); });
                            console.log("[DEBUG] \u53CD\u5236\u5904\u7406\u5B8C\u6210");
                            return [2 /*return*/];
                        }
                        console.log("[DEBUG] \u5361\u724C\u6CA1\u6709\u88AB\u53CD\u5236\uFF0C\u7EE7\u7EED\u6B63\u5E38\u6D41\u7A0B");
                        if ('cost' in card) {
                            actionCard = card;
                            if (this.player.actionPoints < actionCard.cost) {
                                this.safeLogAction("\u884C\u52A8\u70B9\u4E0D\u8DB3\uFF01", 'system');
                                console.log("[DEBUG] \u884C\u52A8\u70B9\u4E0D\u8DB3");
                                return [2 /*return*/];
                            }
                            this.player.actionPoints -= actionCard.cost;
                            console.log("[DEBUG] \u6D88\u8017\u884C\u52A8\u70B9: ".concat(actionCard.cost));
                        }

                        playAudio('../assets/audios/CardPlay.MP3'); // 替换成你的音频文件路径

                        animationTarget = card.targetType === 'self' ? 'player' : 'enemy';
                        this.safeUICall(function () { return _this.ui.playPlayerCardAnimation(handIndex, animationTarget); });
                        // 给动画一点时间执行
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                    case 2:
                        // 给动画一点时间执行
                        _a.sent();
                        playedCard = this.player.hand.splice(handIndex, 1)[0];
                        if (playedCard) {
                            actualTarget = playedCard.targetType === 'self' ? this.player : this.enemy;
                            // 创建战斗上下文
                            this.currentContext = {
                                player: this.player,
                                enemy: this.enemy,
                                turn: this.turn
                            };
                            // 保存当前正在使用的卡牌
                            this.currentPlayingCard = playedCard;
                            // 触发求生者出牌技能
                            this.player.triggerSurvivorPassive('onCardPlay', this.currentContext);
                            // 触发装备的出牌效果
                            this.triggerEquipmentOnCardPlay(playedCard, this.currentContext);
                            // 触发敌人装备的"对方出牌"效果（如蛛网）
                            this.triggerEnemyEquipmentOnPlayerCardPlay(this.currentContext);
                            playedCard.play(this.player, actualTarget, this.currentContext);
                            // 记录最后出牌，供追加攻击等牌使用
                            this.player.lastPlayedCard = playedCard;
                            // 触发装备的出牌后效果（如恋战之斧）
                            this.triggerEquipmentAfterCardPlay(playedCard, this.currentContext);
                            // 装备牌特殊处理：装备牌使用后直接移除，不进入弃牌堆
                            if (playedCard.type === 'Equipment') {
                                this.safeLogAction("\u88C5\u5907\u724C\u3010".concat(playedCard.name, "\u3011\u5DF2\u88C5\u5907\uFF0C\u4E0D\u8FD4\u56DE\u724C\u5E93\u3002"), 'system');
                            }
                            else if (playedCard.isRemovedOnPlay) {
                                this.safeLogAction("\u5361\u724C\u3010".concat(playedCard.name, "\u3011\u88AB\u79FB\u9664\u4E86\u3002"), 'system');
                            }
                            else {
                                this.player.discardPile.push(playedCard);
                            }
                        }
                        if (this.checkWinCondition())
                            return [2 /*return*/];
                        this.safeUICall(function () { return _this.ui.updateAll(_this.player, _this.enemy); });
                        return [2 /*return*/];
                }
            });
        });
    };
    BattleManager.prototype.playerUseFollowerSkill = function (followerIndex) {
        var _this = this;
        if (this.gameState === 'AWAITING_DISCARD') {
            this.safeLogAction("手牌已满！请先弃牌。", 'system');
            return;
        }
        if (!this.isPlayerTurn || this.gameState !== 'ONGOING')
            return;
        var follower = this.player.followers[followerIndex];
        if (!follower)
            return;
        var skill = follower.activeSkill;
        if (follower.currentCooldown > 0) {
            this.safeLogAction("\u6280\u80FD [".concat(skill.name, "] \u6B63\u5728\u51B7\u5374\u4E2D..."), 'system');
            return;
        }
        if (this.player.actionPoints < skill.cost) {
            this.safeLogAction("\u884C\u52A8\u70B9\u4E0D\u8DB3\uFF01", 'system');
            return;
        }
        this.safeLogAction("\u4F60\u4F7F\u7528\u4E86 ".concat(follower.name, " \u7684\u6280\u80FD \"").concat(skill.name, "\"\uFF01"), 'player');
        this.player.actionPoints -= skill.cost;
        skill.effect({ player: this.player, enemy: this.enemy, turn: this.turn });
        follower.useSkill();
        if (this.checkWinCondition())
            return;
        this.safeUICall(function () { return _this.ui.updateAll(_this.player, _this.enemy); });
    };
    BattleManager.prototype.playerUseSurvivorSkill = function () {
        var _this = this;
        if (this.gameState === 'AWAITING_DISCARD') {
            this.safeLogAction("手牌已满！请先弃牌。", 'system');
            return;
        }
        if (!this.isPlayerTurn || this.gameState !== 'ONGOING')
            return;
        var context = { player: this.player, enemy: this.enemy, turn: this.turn };
        var success = this.player.useSurvivorActiveSkill(context);
        if (success) {
            if (this.checkWinCondition())
                return;
            this.safeUICall(function () { return _this.ui.updateAll(_this.player, _this.enemy); });
        }
    };
    BattleManager.prototype.playerDiscardCard = function (handIndex) {
        var _this = this;
        var card = this.player.hand[handIndex];
        if (!card)
            return;
        this.player.hand.splice(handIndex, 1);
        // 装备牌弃牌时直接删除，不进入弃牌堆
        if (card.type === 'Equipment') {
            this.safeLogAction("\u4F60\u5F03\u6389\u4E86\u88C5\u5907\u724C\u3010".concat(card.name, "\u3011\uFF0C\u5DF2\u5220\u9664\u3002"), 'player');
        }
        else {
            this.player.discardPile.push(card);
            this.safeLogAction("\u4F60\u5F03\u6389\u4E86\u624B\u724C\u3010".concat(card.name, "\u3011\u3002"), 'player');
        }
        if (this.player.hand.length <= 4) {
            this.safeLogAction("手牌数量已合规，你可以继续你的回合了。", 'system');
            this.gameState = 'ONGOING';
            this.safeUICall(function () { return _this.ui.toggleEndTurnButton(true); });
            this.safeUICall(function () { return _this.ui.updateAll(_this.player, _this.enemy); });
        }
        else {
            this.safeLogAction("\u624B\u724C\u4ECD\u7136\u591A\u4E8E4\u5F20\uFF0C\u8FD8\u9700\u8981\u5F03\u6389 ".concat(this.player.hand.length - 4, " \u5F20\u724C\u3002"), 'system');
            this.safeUICall(function () { return _this.ui.updateAll(_this.player, _this.enemy, true); });
        }
    };
    BattleManager.prototype.endPlayerTurn = function () {
        var _this = this;
        if (this.gameState === 'AWAITING_DISCARD') {
            this.safeLogAction("手牌已满！请先弃牌。", 'system');
            return;
        }
        if (!this.isPlayerTurn || this.gameState !== 'ONGOING')
            return;
        // 在回合结束前检查手牌数量
        if (this.player.hand.length > 4) {
            this.gameState = 'AWAITING_DISCARD';
            this.safeLogAction("\u56DE\u5408\u7ED3\u675F\u65F6\u624B\u724C\u68C0\u67E5\uFF1A\u624B\u724C\u6EA2\u51FA\uFF01\u4E0A\u9650\u4E3A4\uFF0C\u5F53\u524D\u6709 ".concat(this.player.hand.length, " \u5F20\u3002\u8BF7\u70B9\u51FB\u624B\u724C\u8FDB\u884C\u5F03\u724C\u3002"), 'system');
            this.safeUICall(function () { return _this.ui.toggleEndTurnButton(false); });
            this.safeUICall(function () { return _this.ui.updateAll(_this.player, _this.enemy, true); });
            return;
        }
        this.safeLogAction("--- 你的回合结束 ---", 'system');
        this.isPlayerTurn = false;
        this.safeUICall(function () { return _this.ui.toggleEndTurnButton(false); });
        this.player.onTurnEnd();
        this.startEnemyTurn();
    };
    BattleManager.prototype.startEnemyTurn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sleep(1000)];
                    case 1:
                        _a.sent();
                        this.enemy.drawCards(4);
                        this.enemy.handleHandOverflow();
                        this.safeLogAction("".concat(this.enemy.name, " \u7684\u56DE\u5408\u5F00\u59CB\u3002"), 'enemy');
                        // 触发敌人装备的回合开始效果
                        this.enemy.onTurnStart();
                        this.safeUICall(function () { return _this.ui.updateAll(_this.player, _this.enemy); });
                        return [4 /*yield*/, sleep(1000)];
                    case 2:
                        _a.sent();
                        if (!this.ui) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.enemy.performAction(this.player, this.ui)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (this.checkWinCondition())
                            return [2 /*return*/];
                        this.endEnemyTurn();
                        return [2 /*return*/];
                }
            });
        });
    };
    BattleManager.prototype.endEnemyTurn = function () {
        this.safeLogAction("--- 敌人的回合结束 ---", 'system');
        this.enemy.onTurnEnd();
        this.turn++;
        this.startPlayerTurn();
    };
    BattleManager.prototype.checkWinCondition = function () {
        var _this = this;
        if (this.enemy.currentHp <= 0) {
            this.gameState = 'PLAYER_WIN';
            // 检查是否是最后一关(ch17)
            const urlParams = new URLSearchParams(window.location.search);
            const chapter = urlParams.get('chapter');
            if (chapter === '6') { // ch17映射到战斗章节6
                // 直接跳转到结局1
                window.location.href = '../Endings/ending1.html';
            } else {
                this.safeUICall(function () { return _this.ui.showGameOverModal(true); });
            }
            this.safeUICall(function () { return _this.ui.toggleEndTurnButton(false); });
            return true;
        }
        if (this.player.currentHp <= 0) {
            this.gameState = 'ENEMY_WIN';
            // 检查是否是最后一关(ch17)
            const urlParams = new URLSearchParams(window.location.search);
            const chapter = urlParams.get('chapter');
            if (chapter === '6') { // ch17映射到战斗章节6
                // 直接跳转到结局2
                window.location.href = '../Endings/ending2.html';
            } else {
                this.safeUICall(function () { return _this.ui.showGameOverModal(false); });
            }
            this.safeUICall(function () { return _this.ui.toggleEndTurnButton(false); });
            return true;
        }
        return false;
    };
    // 新增：触发装备的出牌前效果
    BattleManager.prototype.triggerEquipmentOnCardPlay = function (card, context) {
        this.player.equipment.forEach(function (eq) {
            var _a;
            // 检查重击之锤效果
            if (eq.name === '重击之锤' && card.type === 'Normal' && 'damage' in card) {
                if (!eq.metadata)
                    eq.metadata = {};
                if (!eq.metadata.firstCardUsed) {
                    eq.metadata.firstCardUsed = true;
                    // 重击之锤：第一张伤害牌伤害+3，通过修改卡牌伤害实现
                    card.damage = (card.damage || 0) + 3;
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('重击之锤生效！第一张伤害牌伤害+3！', 'player');
                }
            }
        });
    };
    // 新增：触发装备的出牌后效果  
    BattleManager.prototype.triggerEquipmentAfterCardPlay = function (card, context) {
        var _this = this;
        console.log("[DEBUG] triggerEquipmentAfterCardPlay \u88AB\u8C03\u7528\uFF0C\u5361\u724C: ".concat(card.name, " (ID: ").concat(card.id, ")"));
        console.log("[DEBUG] \u73A9\u5BB6\u88C5\u5907\u5217\u8868:", this.player.equipment.map(function (eq) { return eq.name; }));
        this.player.equipment.forEach(function (eq) {
            var _a;
            // 检查恋战之斧效果 - 在普通攻击使用后触发
            // 只有原始普通攻击才触发，复制牌不触发
            if (eq.name === '恋战之斧' && card.id === 'p001' && !card.name.includes('（复制）')) {
                console.log("[\u604B\u6218\u4E4B\u65A7] \u6761\u4EF6\u6EE1\u8DB3\uFF1A\u88C5\u5907\u540D\u79F0=".concat(eq.name, ", \u5361\u724CID=").concat(card.id, ", \u5361\u724C\u540D\u79F0=").concat(card.name));
                var cardLibrary = window.cardLibrary;
                console.log("[\u604B\u6218\u4E4B\u65A7] cardLibrary \u53EF\u7528\u6027:", !!cardLibrary);
                if (cardLibrary) {
                    var copyCard = cardLibrary.createCard('p001');
                    console.log("[\u604B\u6218\u4E4B\u65A7] \u521B\u5EFA\u7684\u590D\u5236\u5361\u724C:", copyCard);
                    if (copyCard) {
                        copyCard.name = '普通攻击（复制）';
                        copyCard.isRemovedOnPlay = true;
                        _this.player.hand.push(copyCard);
                        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('恋战之斧生效！获得一张普通攻击（复制）！', 'player');
                        console.log("[\u604B\u6218\u4E4B\u65A7] \u6DFB\u52A0\u666E\u901A\u653B\u51FB\u590D\u5236\u5230\u624B\u724C\uFF0C\u5F53\u524D\u624B\u724C\u6570\u91CF: ".concat(_this.player.hand.length));
                        console.log("[\u604B\u6218\u4E4B\u65A7] \u5F53\u524D\u624B\u724C:", _this.player.hand.map(function (c) { return c.name; }));
                        // 立即更新UI以显示新卡牌
                        _this.safeUICall(function () { return _this.ui.updateAll(_this.player, _this.enemy); });
                    }
                    else {
                        console.error("[\u604B\u6218\u4E4B\u65A7] \u521B\u5EFA\u5361\u724C\u5931\u8D25\uFF01");
                    }
                }
                else {
                    console.error("[\u604B\u6218\u4E4B\u65A7] cardLibrary \u4E0D\u53EF\u7528\uFF01");
                }
            }
            else if (eq.name === '恋战之斧' && card.id === 'p001' && card.name.includes('（复制）')) {
                console.log("[\u604B\u6218\u4E4B\u65A7] \u590D\u5236\u724C\u88AB\u4F7F\u7528\uFF0C\u4E0D\u89E6\u53D1\u604B\u6218\u4E4B\u65A7\u6548\u679C\u3002\u5361\u724C\u540D\u79F0: ".concat(card.name));
            }
        });
    };
    // 新增：触发敌人装备的"对方出牌"效果
    BattleManager.prototype.triggerEnemyEquipmentOnPlayerCardPlay = function (context) {
        this.enemy.equipment.forEach(function (eq) {
            // 蛛网：对方每出1张牌受到1点伤害
            if (eq.name === '蛛网') {
                if (typeof eq.onEnemyCardPlayed === 'function') {
                    eq.onEnemyCardPlayed(context);
                }
            }
            // 矢车菊之殇：记录出牌数
            if (eq.name === '矢车菊之殇') {
                if (typeof eq.onCardPlayed === 'function') {
                    eq.onCardPlayed();
                }
            }
        });
    };
    BattleManager.prototype._checkForHandOverflow = function () {
        var _this = this;
        if (this.player.hand.length > 4) {
            this.gameState = 'AWAITING_DISCARD';
            this.safeLogAction("\u624B\u724C\u6EA2\u51FA\uFF01\u4E0A\u9650\u4E3A4\uFF0C\u5F53\u524D\u6709 ".concat(this.player.hand.length, " \u5F20\u3002\u8BF7\u70B9\u51FB\u624B\u724C\u8FDB\u884C\u5F03\u724C\u3002"), 'system');
            this.safeUICall(function () { return _this.ui.toggleEndTurnButton(false); });
            this.safeUICall(function () { return _this.ui.updateAll(_this.player, _this.enemy, true); });
            return true;
        }
        return false;
    };
    return BattleManager;
}());
export { BattleManager };
//# sourceMappingURL=BattleManager.js.map