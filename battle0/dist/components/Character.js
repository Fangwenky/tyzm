var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { EquipmentCard, CounterCard, EnhancedEquipmentCard } from './Card.js';
import { EffectManager } from './Effects.js';
import { shuffle } from '../utils/shuffle.js';
var sleep = function (ms) { return new Promise(function (res) { return setTimeout(res, ms); }); };
var Character = /** @class */ (function () {
    function Character(name, hp) {
        this.shield = 0;
        this.deck = [];
        this.hand = [];
        this.discardPile = [];
        this.counterCards = []; // 手牌中的反制卡
        this.statusEffects = new Map(); // 复杂状态效果
        this.name = name;
        this.maxHp = hp;
        this.currentHp = hp;
        this.effects = new EffectManager();
    }
    Character.prototype.takeDamage = function (amount) {
        // takeDamage 现在只负责扣血和动画，计算在DamageSystem中
        this.currentHp -= amount;
        if (this.currentHp < 0)
            this.currentHp = 0;
        if (this.ui) {
            this.ui.showFloatingText("-".concat(amount), 'damage');
        }
    };
    Character.prototype.gainShield = function (amount) {
        this.shield += amount;
        if (this.ui) {
            this.ui.showFloatingText("+".concat(amount), 'heal');
        }
    };
    // 新增：应用燃烧伤害
    Character.prototype.applyBurnDamage = function () {
        var _a, _b;
        if (this.statusEffects.has('burn')) {
            var burnEffect = this.statusEffects.get('burn');
            this.takeDamage(burnEffect.damage);
            burnEffect.duration--;
            if (burnEffect.duration <= 0) {
                this.statusEffects.delete('burn');
                (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("".concat(this.name, " \u7684\u71C3\u70E7\u6548\u679C\u6D88\u5931\u4E86\u3002"), 'system');
            }
            else {
                (_b = window.battle) === null || _b === void 0 ? void 0 : _b.ui.logAction("".concat(this.name, " \u53D7\u5230\u71C3\u70E7\u4F24\u5BB3").concat(burnEffect.damage, "\u70B9\uFF01"), 'system');
            }
        }
    };
    // 新增：添加状态效果
    Character.prototype.addStatusEffect = function (type, effect) {
        this.statusEffects.set(type, effect);
    };
    Character.prototype._drawOneCard = function () {
        if (this.deck.length === 0) {
            if (this.discardPile.length > 0) {
                console.log("[\u62BD\u724C] ".concat(this.name, " \u724C\u5806\u5DF2\u7A7A\uFF0C\u5C06\u5F03\u724C\u5806\uFF08").concat(this.discardPile.length, "\u5F20\uFF09\u6D17\u56DE\u724C\u5806"));
                this.deck = __spreadArray([], this.discardPile, true);
                this.discardPile = [];
                shuffle(this.deck);
            }
            else {
                console.log("[\u62BD\u724C] ".concat(this.name, " \u724C\u5806\u548C\u5F03\u724C\u5806\u90FD\u4E3A\u7A7A\uFF0C\u65E0\u6CD5\u62BD\u724C"));
                return null;
            }
        }
        var card = this.deck.pop();
        if (card) {
            this.hand.push(card);
            // 检查是否为反制卡
            if (card instanceof CounterCard) {
                this.counterCards.push(card);
                console.log("[\u62BD\u724C] ".concat(this.name, " \u62BD\u5230\u53CD\u5236\u5361 ").concat(card.name));
            }
            return card;
        }
        return null;
    };
    Character.prototype.drawCards = function (amount) {
        console.log("[\u62BD\u724C] ".concat(this.name, " \u51C6\u5907\u62BD\u53D6 ").concat(amount, " \u5F20\u724C"), {
            '当前手牌数': this.hand.length,
            '牌堆剩余': this.deck.length,
            '弃牌堆': this.discardPile.length
        });
        for (var i = 0; i < amount; i++) {
            var card = this._drawOneCard();
            if (!card) {
                console.log("[\u62BD\u724C] ".concat(this.name, " \u65E0\u6CD5\u7EE7\u7EED\u62BD\u724C\uFF0C\u724C\u5806\u5DF2\u7A7A"));
                break;
            }
            console.log("[\u62BD\u724C] ".concat(this.name, " \u62BD\u5230\u4E86 ").concat(card.name));
        }
        console.log("[\u62BD\u724C] ".concat(this.name, " \u62BD\u724C\u5B8C\u6210"), {
            '现有手牌数': this.hand.length,
            '牌堆剩余': this.deck.length,
            '弃牌堆': this.discardPile.length
        });
    };
    Character.prototype.onTurnEnd = function () {
        var _this = this;
        this.effects.tick();
        this.applyBurnDamage(); // 回合结束时应用燃烧伤害
        // 处理装备的回合结束效果
        if (this instanceof Player) {
            this.equipment.forEach(function (eq) {
                if (eq instanceof EnhancedEquipmentCard) {
                    eq.triggerEffects('endTurn', { player: _this, enemy: _this, turn: 0 });
                }
            });
        }
    };
    // 新增：尝试反制敌方的牌
    Character.prototype.tryCounter = function (playedCard, context) {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1, i, state_1;
            var _this = this;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        console.log("[DEBUG] ".concat(this.name, ".tryCounter() \u5F00\u59CB\u6267\u884C, \u76EE\u6807\u5361\u724C: ").concat(playedCard.name));
                        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("".concat(this.name, "\u68C0\u67E5\u662F\u5426\u6709\u53EF\u7528\u7684\u53CD\u5236\u724C..."), 'system');
                        if (this.counterCards.length === 0) {
                            console.log("[DEBUG] ".concat(this.name, " \u6CA1\u6709\u53CD\u5236\u724C"));
                            (_b = window.battle) === null || _b === void 0 ? void 0 : _b.ui.logAction("\u6CA1\u6709\u53CD\u5236\u724C\u53EF\u7528", 'system');
                            return [2 /*return*/, false];
                        }
                        console.log("[DEBUG] ".concat(this.name, " \u6709 ").concat(this.counterCards.length, " \u5F20\u53CD\u5236\u724C"));
                        _loop_1 = function (i) {
                            var counterCard, handIndex_1, result;
                            return __generator(this, function (_h) {
                                switch (_h.label) {
                                    case 0:
                                        counterCard = this_1.counterCards[i];
                                        console.log("[DEBUG] \u68C0\u67E5\u7B2C ".concat(i, " \u5F20\u53CD\u5236\u724C: ").concat(counterCard.name));
                                        (_c = window.battle) === null || _c === void 0 ? void 0 : _c.ui.logAction("\u68C0\u67E5\u53CD\u5236\u724C[".concat(counterCard.name, "]..."), 'system');
                                        if (!counterCard.canCounter(playedCard, context)) return [3 /*break*/, 4];
                                        console.log("[DEBUG] ".concat(counterCard.name, " \u53EF\u4EE5\u53CD\u5236 ").concat(playedCard.name, "\uFF01"));
                                        (_d = window.battle) === null || _d === void 0 ? void 0 : _d.ui.logAction("[".concat(counterCard.name, "]\u53EF\u4EE5\u53CD\u5236[").concat(playedCard.name, "]\uFF01"), 'system');
                                        handIndex_1 = this_1.hand.indexOf(counterCard);
                                        console.log("[DEBUG] \u53CD\u5236\u5361\u5728\u624B\u724C\u4E2D\u7684\u7D22\u5F15: ".concat(handIndex_1));
                                        if (!(handIndex_1 > -1)) return [3 /*break*/, 2];
                                        console.log("[DEBUG] \u5F00\u59CB\u64AD\u653E\u53CD\u5236\u52A8\u753B...");
                                        // 先播放反制动画
                                        return [4 /*yield*/, new Promise(function (resolve) {
                                                var _a;
                                                if ((_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui) {
                                                    console.log("[DEBUG] \u8C03\u7528 playCounterCardAnimation");
                                                    window.battle.ui.playCounterCardAnimation(handIndex_1, function () {
                                                        console.log("[DEBUG] \u53CD\u5236\u52A8\u753B\u56DE\u8C03\u51FD\u6570\u6267\u884C");
                                                        _this.hand.splice(handIndex_1, 1);
                                                        _this.counterCards.splice(i, 1);
                                                        _this.discardPile.push(counterCard);
                                                        console.log("[DEBUG] \u53CD\u5236\u5361\u5DF2\u79FB\u9664\u5E76\u653E\u5165\u5F03\u724C\u5806");
                                                        resolve();
                                                    });
                                                }
                                                else {
                                                    console.log("[DEBUG] battle.ui \u4E0D\u5B58\u5728\uFF0C\u76F4\u63A5resolve");
                                                    resolve();
                                                }
                                            })];
                                    case 1:
                                        // 先播放反制动画
                                        _h.sent();
                                        console.log("[DEBUG] \u53CD\u5236\u52A8\u753B\u5B8C\u6210\uFF0C\u51C6\u5907\u89E6\u53D1\u53CD\u5236\u6548\u679C");
                                        (_e = window.battle) === null || _e === void 0 ? void 0 : _e.ui.logAction("\u51C6\u5907\u89E6\u53D1\u53CD\u5236\u6548\u679C...", 'system');
                                        result = counterCard.triggerCounter(playedCard, context);
                                        console.log("[DEBUG] \u53CD\u5236\u6548\u679C\u89E6\u53D1\u7ED3\u679C: ".concat(result));
                                        return [2 /*return*/, { value: result }];
                                    case 2:
                                        console.log("[DEBUG] \u53CD\u5236\u5361\u4E0D\u5728\u624B\u724C\u4E2D\uFF01");
                                        _h.label = 3;
                                    case 3: return [3 /*break*/, 5];
                                    case 4:
                                        console.log("[DEBUG] ".concat(counterCard.name, " \u4E0D\u80FD\u53CD\u5236 ").concat(playedCard.name));
                                        (_f = window.battle) === null || _f === void 0 ? void 0 : _f.ui.logAction("[".concat(counterCard.name, "]\u4E0D\u80FD\u53CD\u5236[").concat(playedCard.name, "]"), 'system');
                                        _h.label = 5;
                                    case 5: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        i = 0;
                        _g.label = 1;
                    case 1:
                        if (!(i < this.counterCards.length)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(i)];
                    case 2:
                        state_1 = _g.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _g.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        console.log("[DEBUG] ".concat(this.name, ".tryCounter() \u6267\u884C\u5B8C\u6210\uFF0C\u8FD4\u56DE false"));
                        return [2 /*return*/, false];
                }
            });
        });
    };
    return Character;
}());
export { Character };
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.actionPoints = 3;
        _this.maxActionPoints = 3;
        _this.equipment = [];
        _this.followers = [];
        _this.equipmentSlots = {};
        return _this;
    }
    Player.prototype.attack = function (enemy) {
        var baseDamage = 5;
        var totalBonusDamage = this.equipment.reduce(function (sum, eq) {
            if (eq instanceof EquipmentCard) {
                return sum + (eq.passiveEffect.bonusAttack || 0);
            }
            return sum;
        }, 0);
        var totalDamage = baseDamage + totalBonusDamage;
        enemy.takeDamage(totalDamage);
    };
    Player.prototype.equip = function (card) {
        var _a;
        if (card instanceof EnhancedEquipmentCard) {
            // 新装备系统：允许多装备共存，不再检查装备槽冲突
            console.log("[\u88C5\u5907\u7CFB\u7EDF] \u88C5\u5907 ".concat(card.name, "\uFF0C\u5F53\u524D\u88C5\u5907\u6570\u91CF: ").concat(this.equipment.length));
            // 直接添加新装备，不移除旧装备
            this.equipment.push(card);
            card.isActive = true;
            // 可选：记录装备槽信息（仅用于显示，不做冲突检查）
            var slot = card.equipmentSlot;
            if (slot) {
                // 如果这个槽位有装备，记录但不移除
                if (this.equipmentSlots[slot]) {
                    console.log("[\u88C5\u5907\u7CFB\u7EDF] ".concat(slot, "\u69FD\u4F4D\u5DF2\u6709\u88C5\u5907: ").concat(this.equipmentSlots[slot].name, "\uFF0C\u65B0\u88C5\u5907 ").concat(card.name, " \u5C06\u5171\u5B58"));
                }
                // 更新槽位引用为最新装备（用于UI显示）
                this.equipmentSlots[slot] = card;
            }
        }
        else {
            // 旧装备系统兼容
            this.equipment.push(card);
        }
        console.log("[\u88C5\u5907\u7CFB\u7EDF] \u88C5\u5907\u5B8C\u6210\uFF01\u5F53\u524D\u603B\u88C5\u5907\u6570: ".concat(this.equipment.length));
        console.log("[\u88C5\u5907\u7CFB\u7EDF] \u5F53\u524D\u88C5\u5907\u5217\u8868:", this.equipment.map(function (eq) { return eq.name; }));
        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u88C5\u5907\u4E86\u3010".concat(card.name, "\u3011\uFF01"), 'player');
    };
    // 新增：获取装备数量
    Player.prototype.getEquipmentCount = function () {
        return this.equipment.length;
    };
    // 新增：触发装备的被动效果
    Player.prototype.triggerEquipmentEffects = function (triggerType, context) {
        this.equipment.forEach(function (eq) {
            if (eq instanceof EnhancedEquipmentCard) {
                eq.triggerEffects(triggerType, context);
            }
        });
    };
    // 重写onTurnEnd以触发装备效果
    Player.prototype.onTurnEnd = function () {
        var _this = this;
        _super.prototype.onTurnEnd.call(this);
        // 清除临时伤害增益效果，确保回合结束后重置
        this.effects.remove('damage_buff');
        if (this.survivor) {
            this.survivor.onTurnEnd();
        }
        // 触发装备的回合结束效果
        this.equipment.forEach(function (eq) {
            var _a, _b, _c, _d, _e;
            var context = { player: _this, enemy: ((_a = window.battle) === null || _a === void 0 ? void 0 : _a.enemy) || _this, turn: ((_b = window.battle) === null || _b === void 0 ? void 0 : _b.turn) || 0 };
            // 调用装备的onTurnEnd方法（新装备系统）
            if (typeof eq.onTurnEnd === 'function') {
                eq.onTurnEnd(context);
            }
            // 特殊装备效果处理
            switch (eq.name) {
                case '一念神魔':
                    // 每回合结束时获得2点护盾，对敌方造成2点伤害
                    _this.gainShield(2);
                    var damage = { amount: 2, type: 'normal', source: _this };
                    (_d = (_c = window.DamageSystem) === null || _c === void 0 ? void 0 : _c.dealDamage) === null || _d === void 0 ? void 0 : _d.call(_c, damage, context.enemy);
                    (_e = window.battle) === null || _e === void 0 ? void 0 : _e.ui.logAction('一念神魔生效！获得2点护盾并对敌方造成2点伤害！', 'player');
                    break;
            }
        });
    };
    // 新增：回合开始触发装备效果
    Player.prototype.onTurnStart = function () {
        var _this = this;
        if (this.survivor && typeof this.survivor.onTurnStart === 'function') {
            this.survivor.onTurnStart();
        }
        // 触发装备的回合开始效果
        this.equipment.forEach(function (eq) {
            var _a, _b, _c;
            var context = { player: _this, enemy: ((_a = window.battle) === null || _a === void 0 ? void 0 : _a.enemy) || _this, turn: ((_b = window.battle) === null || _b === void 0 ? void 0 : _b.turn) || 0 };
            // 调用装备的onTurnStart方法（新装备系统）
            if (typeof eq.onTurnStart === 'function') {
                eq.onTurnStart(context);
            }
            // 特殊装备效果处理
            switch (eq.name) {
                case '盔甲护身':
                    // 每回合开始时获得4点护盾
                    _this.gainShield(4);
                    (_c = window.battle) === null || _c === void 0 ? void 0 : _c.ui.logAction('盔甲护身生效！获得4点护盾！', 'player');
                    break;
                case '重击之锤':
                    // 重置第一张牌标记
                    if (!eq.metadata)
                        eq.metadata = {};
                    eq.metadata.firstCardUsed = false;
                    break;
            }
        });
    };
    Player.prototype.addFollower = function (follower) {
        if (this.followers.length < 4)
            this.followers.push(follower);
    };
    // 触发求生者被动技能
    Player.prototype.triggerSurvivorPassive = function (trigger, context) {
        if (this.survivor) {
            this.survivor.triggerPassiveSkill(context, trigger);
        }
    };
    // 使用求生者主动技能
    Player.prototype.useSurvivorActiveSkill = function (context) {
        if (this.survivor) {
            return this.survivor.useActiveSkill(context);
        }
        return false;
    };
    // 获取求生者伤害加成
    Player.prototype.getSurvivorDamageBonus = function () {
        if (!this.survivor)
            return 0;
        switch (this.survivor.data.id) {
            case 'wildman':
                // 野人：生命值越低，伤害越高
                var lostHp = this.maxHp - this.currentHp;
                return Math.floor(lostHp / 10);
            default:
                return 0;
        }
    };
    // 处理求生者伤害减免
    Player.prototype.getSurvivorDamageReduction = function (damage) {
        var _a;
        if (!this.survivor)
            return 0;
        switch (this.survivor.data.id) {
            case 'lawyer':
                // 律师：有30%几率减少1点伤害
                if (Math.random() < 0.3) {
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('律师的钢铁意志发挥作用，减少了1点伤害！', 'player');
                    return 1;
                }
                break;
        }
        return 0;
    };
    return Player;
}(Character));
export { Player };
var Enemy = /** @class */ (function (_super) {
    __extends(Enemy, _super);
    function Enemy() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.actionPoints = 3;
        _this.maxActionPoints = 3;
        _this.handLimit = 8;
        _this.equipment = [];
        _this.equipmentSlots = {};
        return _this;
    }
    Enemy.prototype.handleHandOverflow = function () {
        var _a, _b;
        var _loop_2 = function () {
            var cardToDiscard = null;
            var highestCost = -1;
            var discardIndex = -1;
            this_2.hand.forEach(function (card, index) {
                var cost = card.cost || 0;
                if (cost > highestCost) {
                    highestCost = cost;
                    cardToDiscard = card;
                    discardIndex = index;
                }
            });
            if (discardIndex === -1) {
                discardIndex = this_2.hand.length - 1;
            }
            var discarded = this_2.hand.splice(discardIndex, 1)[0];
            if (discarded) {
                // 装备牌自动弃牌时直接删除，不进入弃牌堆
                if (discarded.type === 'Equipment') {
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("".concat(this_2.name, " \u7684\u624B\u724C\u5DF2\u6EE1\uFF0C\u5F03\u6389\u4E86\u88C5\u5907\u724C\u3010").concat(discarded.name, "\u3011\uFF0C\u5DF2\u5220\u9664"), 'system');
                }
                else {
                    this_2.discardPile.push(discarded);
                    (_b = window.battle) === null || _b === void 0 ? void 0 : _b.ui.logAction("".concat(this_2.name, " \u7684\u624B\u724C\u5DF2\u6EE1\uFF0C\u5F03\u6389\u4E86\u3010").concat(discarded.name, "\u3011"), 'system');
                }
            }
        };
        var this_2 = this;
        while (this.hand.length > this.handLimit) {
            _loop_2();
        }
    };
    Enemy.prototype.performAction = function (player, ui) {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_3, this_3, state_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[DEBUG] ".concat(this.name, " \u56DE\u5408\u5F00\u59CB"));
                        this.actionPoints = this.maxActionPoints;
                        _loop_3 = function () {
                            var bestCard, cardIndex, context, isCountered, cardCost, target;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        console.log("[DEBUG] ".concat(this_3.name, " \u5269\u4F59\u884C\u52A8\u70B9: ").concat(this_3.actionPoints, "\uFF0C\u6B63\u5728\u5BFB\u627E\u6700\u4F73\u51FA\u724C..."));
                                        bestCard = this_3.findBestCard(player);
                                        if (!bestCard) {
                                            console.log("[DEBUG] ".concat(this_3.name, " \u6CA1\u6709\u627E\u5230\u53EF\u7528\u7684\u724C\uFF0C\u7ED3\u675F\u56DE\u5408"));
                                            ui.logAction("".concat(this_3.name, " \u65E0\u6CD5\u627E\u5230\u6709\u6548\u7684\u653B\u51FB\u724C\uFF0C\u7ED3\u675F\u56DE\u5408\u3002"), 'enemy');
                                            return [2 /*return*/, "break"];
                                        }
                                        console.log("[DEBUG] ".concat(this_3.name, " \u51B3\u5B9A\u4F7F\u7528\u724C: ").concat(bestCard.name, "\uFF0C\u8D39\u7528: ").concat(bestCard.cost || 0));
                                        cardIndex = this_3.hand.findIndex(function (c) { return c === bestCard; });
                                        if (cardIndex === -1) {
                                            console.log("[DEBUG] \u9519\u8BEF\uFF1A\u627E\u4E0D\u5230\u5361\u724C\u5728\u624B\u724C\u4E2D");
                                            return [2 /*return*/, "break"];
                                        }
                                        context = { player: player, enemy: this_3, turn: 0 };
                                        ui.logAction("".concat(this_3.name, " \u5C1D\u8BD5\u4F7F\u7528\u3010").concat(bestCard.name, "\u3011..."), 'system');
                                        console.log("[DEBUG] \u68C0\u67E5\u73A9\u5BB6\u662F\u5426\u6709\u53CD\u5236\u724C...");
                                        return [4 /*yield*/, player.tryCounter(bestCard, context)];
                                    case 1:
                                        isCountered = _b.sent();
                                        console.log("[DEBUG] \u53CD\u5236\u68C0\u67E5\u7ED3\u679C: ".concat(isCountered));
                                        // 从手牌中移除这张牌
                                        this_3.hand.splice(cardIndex, 1);
                                        if (!isCountered) return [3 /*break*/, 3];
                                        console.log("[DEBUG] \u5361\u724C\u88AB\u73A9\u5BB6\u53CD\u5236\uFF0C\u4E0D\u6D88\u8017\u884C\u52A8\u70B9\uFF0C\u91CD\u65B0\u8BC4\u4F30...");
                                        ui.logAction("\u53CD\u5236\u724C\u6210\u529F\u963B\u6B62\u4E86\u3010".concat(bestCard.name, "\u3011\uFF01"), 'system');
                                        // 装备牌被反制时直接删除，不进入弃牌堆
                                        if (bestCard.type === 'Equipment') {
                                            ui.logAction("\u88C5\u5907\u724C\u3010".concat(bestCard.name, "\u3011\u88AB\u53CD\u5236\uFF0C\u5DF2\u5220\u9664\uFF01"), 'system');
                                        }
                                        else {
                                            this_3.discardPile.push(bestCard);
                                        }
                                        // 被反制的牌不消耗行动点，直接继续下一轮选择
                                        ui.updateAll(player, this_3);
                                        return [4 /*yield*/, sleep(500)];
                                    case 2:
                                        _b.sent();
                                        return [2 /*return*/, "continue"];
                                    case 3:
                                        cardCost = bestCard.cost || 0;
                                        this_3.actionPoints -= cardCost;
                                        console.log("[DEBUG] ".concat(this_3.name, " \u6D88\u8017\u884C\u52A8\u70B9: ").concat(cardCost, "\uFF0C\u5269\u4F59: ").concat(this_3.actionPoints));
                                        ui.logAction("\uD83C\uDFAC ".concat(this_3.name, " \u6253\u51FA\u4E86\u3010").concat(bestCard.name, "\u3011\uFF01"), 'enemy');
                                        ui.playEnemyCardAnimation(bestCard);
                                        return [4 /*yield*/, sleep(500)];
                                    case 4:
                                        _b.sent();
                                        target = bestCard.targetType === 'self' ? this_3 : player;
                                        bestCard.play(this_3, target, { player: player, enemy: this_3, turn: 0 });
                                        this_3.lastPlayedCard = bestCard;
                                        // 装备牌使用后直接删除，不进入弃牌堆
                                        if (bestCard.type === 'Equipment') {
                                            ui.logAction("".concat(this_3.name, " \u4F7F\u7528\u4E86\u88C5\u5907\u724C\u3010").concat(bestCard.name, "\u3011\uFF0C\u5DF2\u5220\u9664\uFF01"), 'system');
                                        }
                                        else {
                                            this_3.discardPile.push(bestCard);
                                        }
                                        ui.updateAll(player, this_3);
                                        if (player.currentHp <= 0) {
                                            console.log("[DEBUG] \u73A9\u5BB6\u751F\u547D\u503C\u5F52\u96F6\uFF0C\u7ED3\u675F\u6218\u6597");
                                            return [2 /*return*/, "break"];
                                        }
                                        return [4 /*yield*/, sleep(600)];
                                    case 5:
                                        _b.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_3 = this;
                        _a.label = 1;
                    case 1:
                        if (!(this.actionPoints > 0)) return [3 /*break*/, 3];
                        return [5 /*yield**/, _loop_3()];
                    case 2:
                        state_2 = _a.sent();
                        if (state_2 === "break")
                            return [3 /*break*/, 3];
                        return [3 /*break*/, 1];
                    case 3:
                        console.log("[DEBUG] ".concat(this.name, " \u56DE\u5408\u7ED3\u675F\uFF0C\u5269\u4F59\u884C\u52A8\u70B9: ").concat(this.actionPoints));
                        return [2 /*return*/];
                }
            });
        });
    };
    Enemy.prototype.findBestCard = function (target) {
        var bestCard = null;
        var maxValue = -1;
        for (var _i = 0, _a = this.hand; _i < _a.length; _i++) {
            var card = _a[_i];
            var cardCost = card.cost || 0;
            // 检查是否有足够的行动点
            if (cardCost > this.actionPoints) {
                continue;
            }
            // 计算卡牌价值（伤害/效果价值）
            var cardValue = 0;
            if (card.targetType === 'self') {
                // 自身目标的牌（治疗、增益等）
                cardValue = 10; // 基础价值
            }
            else {
                // 攻击牌
                cardValue = card.getBaseDamage(this);
            }
            // 考虑费用效率（价值/费用比）
            var efficiency = cardCost > 0 ? cardValue / cardCost : cardValue;
            if (efficiency > maxValue) {
                maxValue = efficiency;
                bestCard = card;
            }
        }
        return bestCard;
    };
    Enemy.prototype.findBestPlay = function (target) {
        var bestCombination = [];
        var maxDamage = -1;
        var handSize = this.hand.length;
        for (var i = 0; i < (1 << handSize); i++) {
            var currentCombination = [];
            var currentCost = 0;
            var currentDamage = 0;
            for (var j = 0; j < handSize; j++) {
                if ((i >> j) & 1) {
                    var card = this.hand[j];
                    currentCombination.push(card);
                    currentCost += card.cost || 0;
                    if (card.targetType !== 'self') {
                        currentDamage += card.getBaseDamage(this);
                    }
                }
            }
            if (currentCost <= this.actionPoints) {
                if (currentDamage > maxDamage) {
                    maxDamage = currentDamage;
                    bestCombination = currentCombination;
                }
            }
        }
        return { cards: bestCombination, totalDamage: maxDamage };
    };
    // 装备系统支持
    Enemy.prototype.equip = function (card) {
        var _a;
        if (card instanceof EnhancedEquipmentCard) {
            // 新装备系统：允许多装备共存，不再检查装备槽冲突
            console.log("[\u654C\u4EBA\u88C5\u5907\u7CFB\u7EDF] ".concat(this.name, "\u88C5\u5907 ").concat(card.name, "\uFF0C\u5F53\u524D\u88C5\u5907\u6570\u91CF: ").concat(this.equipment.length));
            // 直接添加新装备，不移除旧装备
            this.equipment.push(card);
            card.isActive = true;
            // 可选：记录装备槽信息（仅用于显示，不做冲突检查）
            var slot = card.equipmentSlot;
            if (slot) {
                // 如果这个槽位有装备，记录但不移除
                if (this.equipmentSlots[slot]) {
                    console.log("[\u654C\u4EBA\u88C5\u5907\u7CFB\u7EDF] ".concat(this.name, "\u7684").concat(slot, "\u69FD\u4F4D\u5DF2\u6709\u88C5\u5907: ").concat(this.equipmentSlots[slot].name, "\uFF0C\u65B0\u88C5\u5907 ").concat(card.name, " \u5C06\u5171\u5B58"));
                }
                // 更新槽位引用为最新装备（用于UI显示）
                this.equipmentSlots[slot] = card;
            }
        }
        else {
            // 旧装备系统兼容
            this.equipment.push(card);
        }
        console.log("[\u654C\u4EBA\u88C5\u5907\u7CFB\u7EDF] ".concat(this.name, "\u88C5\u5907\u5B8C\u6210\uFF01\u5F53\u524D\u603B\u88C5\u5907\u6570: ").concat(this.equipment.length));
        console.log("[\u654C\u4EBA\u88C5\u5907\u7CFB\u7EDF] ".concat(this.name, "\u5F53\u524D\u88C5\u5907\u5217\u8868:"), this.equipment.map(function (eq) { return eq.name; }));
        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("".concat(this.name, "\u88C5\u5907\u4E86\u3010").concat(card.name, "\u3011\uFF01"), 'enemy');
    };
    // 重写onTurnEnd以触发装备效果
    Enemy.prototype.onTurnEnd = function () {
        var _this = this;
        _super.prototype.onTurnEnd.call(this);
        console.log("[\u654C\u4EBA\u56DE\u5408\u7ED3\u675F] ".concat(this.name, " \u88C5\u5907\u6570\u91CF: ").concat(this.equipment.length));
        console.log("[\u654C\u4EBA\u56DE\u5408\u7ED3\u675F] ".concat(this.name, " \u88C5\u5907\u5217\u8868:"), this.equipment.map(function (eq) { return eq.name; }));
        // 触发装备的回合结束效果
        this.equipment.forEach(function (eq, index) {
            var _a, _b;
            var context = { player: ((_a = window.battle) === null || _a === void 0 ? void 0 : _a.player) || _this, enemy: _this, turn: ((_b = window.battle) === null || _b === void 0 ? void 0 : _b.turn) || 0 };
            console.log("[\u654C\u4EBA\u56DE\u5408\u7ED3\u675F] \u68C0\u67E5\u88C5\u5907 ".concat(index, ": ").concat(eq.name, ", \u662F\u5426\u6709onTurnEnd\u65B9\u6CD5: ").concat(typeof eq.onTurnEnd === 'function'));
            // 调用装备的onTurnEnd方法（新装备系统）
            if (typeof eq.onTurnEnd === 'function') {
                console.log("[\u654C\u4EBA\u56DE\u5408\u7ED3\u675F] \u89E6\u53D1\u88C5\u5907 ".concat(eq.name, " \u7684onTurnEnd\u6548\u679C"));
                eq.onTurnEnd(context);
            }
        });
    };
    // 回合开始触发装备效果
    Enemy.prototype.onTurnStart = function () {
        var _this = this;
        // 触发装备的回合开始效果
        this.equipment.forEach(function (eq) {
            var _a, _b;
            var context = { player: ((_a = window.battle) === null || _a === void 0 ? void 0 : _a.player) || _this, enemy: _this, turn: ((_b = window.battle) === null || _b === void 0 ? void 0 : _b.turn) || 0 };
            // 调用装备的onTurnStart方法（新装备系统）
            if (typeof eq.onTurnStart === 'function') {
                eq.onTurnStart(context);
            }
        });
    };
    return Enemy;
}(Character));
export { Enemy };
//# sourceMappingURL=Character.js.map