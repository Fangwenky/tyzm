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
import { Character } from './Character.js';
var sleep = function (ms) { return new Promise(function (res) { return setTimeout(res, ms); }); };
var Enemy = /** @class */ (function (_super) {
    __extends(Enemy, _super);
    function Enemy() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.actionPoints = 3;
        _this.maxActionPoints = 3;
        _this.handLimit = 8;
        return _this;
    }
    Enemy.prototype.handleHandOverflow = function () {
        var _a;
        var _loop_1 = function () {
            var cardToDiscard = null;
            var highestCost = -1;
            var discardIndex = -1;
            this_1.hand.forEach(function (card, index) {
                var cost = card.cost || 0;
                if (cost > highestCost) {
                    highestCost = cost;
                    cardToDiscard = card;
                    discardIndex = index;
                }
            });
            if (discardIndex === -1) {
                discardIndex = this_1.hand.length - 1;
            }
            var discarded = this_1.hand.splice(discardIndex, 1)[0];
            if (discarded) {
                this_1.discardPile.push(discarded);
                (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("".concat(this_1.name, " \u7684\u624B\u724C\u5DF2\u6EE1\uFF0C\u5F03\u6389\u4E86\u3010").concat(discarded.name, "\u3011"), 'system');
            }
        };
        var this_1 = this;
        while (this.hand.length > this.handLimit) {
            _loop_1();
        }
    };
    Enemy.prototype.performAction = function (player, ui) {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_2, this_2, state_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[DEBUG] ".concat(this.name, " \u56DE\u5408\u5F00\u59CB"));
                        this.actionPoints = this.maxActionPoints;
                        _loop_2 = function () {
                            var bestCard, cardIndex, context, isCountered, cardCost, target;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        console.log("[DEBUG] ".concat(this_2.name, " \u5269\u4F59\u884C\u52A8\u70B9: ").concat(this_2.actionPoints, "\uFF0C\u6B63\u5728\u5BFB\u627E\u6700\u4F73\u51FA\u724C..."));
                                        bestCard = this_2.findBestCard(player);
                                        if (!bestCard) {
                                            console.log("[DEBUG] ".concat(this_2.name, " \u6CA1\u6709\u627E\u5230\u53EF\u7528\u7684\u724C\uFF0C\u7ED3\u675F\u56DE\u5408"));
                                            ui.logAction("".concat(this_2.name, " \u65E0\u6CD5\u627E\u5230\u6709\u6548\u7684\u653B\u51FB\u724C\uFF0C\u7ED3\u675F\u56DE\u5408\u3002"), 'enemy');
                                            return [2 /*return*/, "break"];
                                        }
                                        console.log("[DEBUG] ".concat(this_2.name, " \u51B3\u5B9A\u4F7F\u7528\u724C: ").concat(bestCard.name, "\uFF0C\u8D39\u7528: ").concat(bestCard.cost || 0));
                                        cardIndex = this_2.hand.findIndex(function (c) { return c === bestCard; });
                                        if (cardIndex === -1) {
                                            console.log("[DEBUG] \u9519\u8BEF\uFF1A\u627E\u4E0D\u5230\u5361\u724C\u5728\u624B\u724C\u4E2D");
                                            return [2 /*return*/, "break"];
                                        }
                                        context = { player: player, enemy: this_2, turn: 0 };
                                        ui.logAction("".concat(this_2.name, " \u5C1D\u8BD5\u4F7F\u7528\u3010").concat(bestCard.name, "\u3011..."), 'system');
                                        console.log("[DEBUG] \u68C0\u67E5\u73A9\u5BB6\u662F\u5426\u6709\u53CD\u5236\u724C...");
                                        return [4 /*yield*/, player.tryCounter(bestCard, context)];
                                    case 1:
                                        isCountered = _b.sent();
                                        console.log("[DEBUG] \u53CD\u5236\u68C0\u67E5\u7ED3\u679C: ".concat(isCountered));
                                        // 从手牌中移除这张牌
                                        this_2.hand.splice(cardIndex, 1);
                                        if (!isCountered) return [3 /*break*/, 3];
                                        console.log("[DEBUG] \u5361\u724C\u88AB\u73A9\u5BB6\u53CD\u5236\uFF0C\u4E0D\u6D88\u8017\u884C\u52A8\u70B9\uFF0C\u91CD\u65B0\u8BC4\u4F30...");
                                        ui.logAction("\u53CD\u5236\u724C\u6210\u529F\u963B\u6B62\u4E86\u3010".concat(bestCard.name, "\u3011\uFF01"), 'system');
                                        this_2.discardPile.push(bestCard);
                                        // 被反制的牌不消耗行动点，直接继续下一轮选择
                                        ui.updateAll(player, this_2);
                                        return [4 /*yield*/, sleep(500)];
                                    case 2:
                                        _b.sent();
                                        return [2 /*return*/, "continue"];
                                    case 3:
                                        cardCost = bestCard.cost || 0;
                                        this_2.actionPoints -= cardCost;
                                        console.log("[DEBUG] ".concat(this_2.name, " \u6D88\u8017\u884C\u52A8\u70B9: ").concat(cardCost, "\uFF0C\u5269\u4F59: ").concat(this_2.actionPoints));
                                        ui.logAction("\uD83C\uDFAC ".concat(this_2.name, " \u6253\u51FA\u4E86\u3010").concat(bestCard.name, "\u3011\uFF01"), 'enemy');
                                        ui.playEnemyCardAnimation(bestCard);
                                        return [4 /*yield*/, sleep(500)];
                                    case 4:
                                        _b.sent();
                                        target = bestCard.targetType === 'self' ? this_2 : player;
                                        bestCard.play(this_2, target, { player: player, enemy: this_2, turn: 0 });
                                        this_2.lastPlayedCard = bestCard;
                                        this_2.discardPile.push(bestCard);
                                        ui.updateAll(player, this_2);
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
                        this_2 = this;
                        _a.label = 1;
                    case 1:
                        if (!(this.actionPoints > 0)) return [3 /*break*/, 3];
                        return [5 /*yield**/, _loop_2()];
                    case 2:
                        state_1 = _a.sent();
                        if (state_1 === "break")
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
    // 保留原有的方法以防其他地方有用到，但标记为已废弃
    Enemy.prototype.findBestPlay = function (target) {
        // 这个方法已废弃，保留仅为兼容性
        var bestCard = this.findBestCard(target);
        if (bestCard) {
            return { cards: [bestCard], totalDamage: bestCard.getBaseDamage(this) };
        }
        return { cards: [], totalDamage: 0 };
    };
    return Enemy;
}(Character));
export { Enemy };
//# sourceMappingURL=Enemy.js.map