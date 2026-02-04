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
import { Player, Enemy } from './Character.js';
import { DamageSystem } from '../core/DamageSystem.js';
var Card = /** @class */ (function () {
    function Card(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.type = data.type;
        this.isRemovedOnPlay = data.isRemovedOnPlay || false;
        this.targetType = data.targetType || 'enemy';
        this.isPiercing = data.isPiercing || false;
        this.requiresChoice = data.requiresChoice || false;
        this.data = data; // 保存完整数据，包括图片路径
    }
    Card.prototype.getBaseDamage = function (caster) {
        return 0;
    };
    // 新增：用于反制卡的方法
    Card.prototype.canCounter = function (playedCard, context) {
        return false;
    };
    // 新增：触发反制效果
    Card.prototype.triggerCounter = function (playedCard, context) {
        return false;
    };
    return Card;
}());
export { Card };
var NormalAttackCard = /** @class */ (function (_super) {
    __extends(NormalAttackCard, _super);
    function NormalAttackCard(data) {
        var _this = _super.call(this, data) || this;
        _this.damage = data.damage || 0;
        return _this;
    }
    NormalAttackCard.prototype.play = function (caster, target, context) {
        var damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        // 触发装备的普通攻击后效果（如恋战之斧）
        if (caster && caster.equipment) {
            caster.equipment.forEach(function (eq) {
                if (typeof eq.onNormalAttackUsed === 'function') {
                    var attackContext = context || { player: caster, enemy: target, turn: 0 };
                    eq.onNormalAttackUsed(attackContext);
                }
            });
        }
    };
    NormalAttackCard.prototype.getBaseDamage = function (caster) {
        return this.damage;
    };
    return NormalAttackCard;
}(Card));
export { NormalAttackCard };
var ActionCard = /** @class */ (function (_super) {
    __extends(ActionCard, _super);
    function ActionCard(data) {
        var _this = _super.call(this, data) || this;
        _this.damage = data.damage || 0;
        _this.cost = data.cost || 0;
        return _this;
    }
    ActionCard.prototype.play = function (caster, target, context) {
        var damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
    };
    ActionCard.prototype.getBaseDamage = function (caster) {
        return this.damage;
    };
    return ActionCard;
}(Card));
export { ActionCard };
var EquipmentCard = /** @class */ (function (_super) {
    __extends(EquipmentCard, _super);
    function EquipmentCard(data) {
        var _this = _super.call(this, data) || this;
        _this.passiveEffect = data.effectData || {};
        return _this;
    }
    EquipmentCard.prototype.play = function (caster, target, context) {
        if (caster instanceof Player) {
            caster.equip(this);
        }
    };
    return EquipmentCard;
}(Card));
export { EquipmentCard };
var EnduringGuardCard = /** @class */ (function (_super) {
    __extends(EnduringGuardCard, _super);
    function EnduringGuardCard(data) {
        var _this = _super.call(this, data) || this;
        _this.cost = data.cost || 0;
        return _this;
    }
    EnduringGuardCard.prototype.play = function (caster, target, context) {
        target.gainShield(5);
    };
    return EnduringGuardCard;
}(Card));
export { EnduringGuardCard };
var LethalStingCard = /** @class */ (function (_super) {
    __extends(LethalStingCard, _super);
    function LethalStingCard(data) {
        var _this = _super.call(this, data) || this;
        _this.damage = data.damage || 0;
        return _this;
    }
    LethalStingCard.prototype.play = function (caster, target, context) {
        var damage = { amount: this.damage, type: 'piercing', source: caster };
        DamageSystem.dealDamage(damage, target);
    };
    LethalStingCard.prototype.getBaseDamage = function (caster) {
        return this.damage;
    };
    return LethalStingCard;
}(Card));
export { LethalStingCard };
var DefensiveStanceCard = /** @class */ (function (_super) {
    __extends(DefensiveStanceCard, _super);
    function DefensiveStanceCard(data) {
        var _this = _super.call(this, data) || this;
        _this.cost = data.cost || 0;
        return _this;
    }
    DefensiveStanceCard.prototype.play = function (caster, target, context) {
        target.gainShield(6);
        if (target instanceof Player || target instanceof Enemy) {
            target.drawCards(1);
        }
    };
    return DefensiveStanceCard;
}(Card));
export { DefensiveStanceCard };
var DesperateBlowCard = /** @class */ (function (_super) {
    __extends(DesperateBlowCard, _super);
    function DesperateBlowCard(data) {
        var _this = _super.call(this, data) || this;
        _this.damage = data.damage || 0;
        return _this;
    }
    DesperateBlowCard.prototype.play = function (caster, target, context) {
        var damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        caster.takeDamage(1);
    };
    DesperateBlowCard.prototype.getBaseDamage = function (caster) {
        return this.damage;
    };
    return DesperateBlowCard;
}(Card));
export { DesperateBlowCard };
var FireAttackCard = /** @class */ (function (_super) {
    __extends(FireAttackCard, _super);
    function FireAttackCard(data) {
        var _this = _super.call(this, data) || this;
        _this.damage = data.damage || 0;
        return _this;
    }
    FireAttackCard.prototype.play = function (caster, target, context) {
        var lostHp = caster.maxHp - caster.currentHp;
        var bonusDamage = Math.floor(lostHp / 5);
        var damage = { amount: this.damage + bonusDamage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
    };
    FireAttackCard.prototype.getBaseDamage = function (caster) {
        var lostHp = caster.maxHp - caster.currentHp;
        var bonusDamage = Math.floor(lostHp / 5);
        return (this.damage || 0) + bonusDamage;
    };
    return FireAttackCard;
}(Card));
export { FireAttackCard };
var SwiftAttackCard = /** @class */ (function (_super) {
    __extends(SwiftAttackCard, _super);
    function SwiftAttackCard(data) {
        var _this = _super.call(this, data) || this;
        _this.damage = data.damage || 0;
        return _this;
    }
    SwiftAttackCard.prototype.play = function (caster, target, context) {
        var damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        if (caster instanceof Player || caster instanceof Enemy)
            caster.drawCards(1);
    };
    SwiftAttackCard.prototype.getBaseDamage = function (caster) {
        return this.damage;
    };
    return SwiftAttackCard;
}(Card));
export { SwiftAttackCard };
var DoubleTapCard = /** @class */ (function (_super) {
    __extends(DoubleTapCard, _super);
    function DoubleTapCard(data) {
        var _this = _super.call(this, data) || this;
        _this.damage = data.damage || 0;
        return _this;
    }
    DoubleTapCard.prototype.play = function (caster, target, context) {
        var damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        if (caster instanceof Player || caster instanceof Enemy)
            caster.drawCards(2);
    };
    DoubleTapCard.prototype.getBaseDamage = function (caster) {
        return this.damage;
    };
    return DoubleTapCard;
}(Card));
export { DoubleTapCard };
var LeechingStrikeCard = /** @class */ (function (_super) {
    __extends(LeechingStrikeCard, _super);
    function LeechingStrikeCard(data) {
        var _this = _super.call(this, data) || this;
        _this.damage = data.damage || 0;
        return _this;
    }
    LeechingStrikeCard.prototype.play = function (caster, target, context) {
        var damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        caster.currentHp = Math.min(caster.maxHp, caster.currentHp + this.damage);
        if (caster.ui)
            caster.ui.showFloatingText("+".concat(this.damage), 'heal');
    };
    LeechingStrikeCard.prototype.getBaseDamage = function (caster) {
        return this.damage;
    };
    return LeechingStrikeCard;
}(Card));
export { LeechingStrikeCard };
var MightyBlowCard = /** @class */ (function (_super) {
    __extends(MightyBlowCard, _super);
    function MightyBlowCard(data) {
        var _this = _super.call(this, data) || this;
        _this.damage = data.damage || 0;
        return _this;
    }
    MightyBlowCard.prototype.play = function (caster, target, context) {
        var damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
    };
    MightyBlowCard.prototype.getBaseDamage = function (caster) {
        return this.damage;
    };
    return MightyBlowCard;
}(Card));
export { MightyBlowCard };
var SacredProtectionCard = /** @class */ (function (_super) {
    __extends(SacredProtectionCard, _super);
    function SacredProtectionCard(data) {
        var _this = _super.call(this, data) || this;
        _this.cost = data.cost || 0;
        return _this;
    }
    SacredProtectionCard.prototype.play = function (caster, target, context) {
        target.gainShield(10);
    };
    return SacredProtectionCard;
}(Card));
export { SacredProtectionCard };
var BuffNextCardAction = /** @class */ (function (_super) {
    __extends(BuffNextCardAction, _super);
    function BuffNextCardAction(data) {
        var _this = _super.call(this, data) || this;
        _this.cost = data.cost || 0;
        return _this;
    }
    BuffNextCardAction.prototype.play = function (caster, target, context) {
        if (caster instanceof Player || caster instanceof Enemy) {
            caster.drawCards(1);
        }
        caster.effects.add({ type: 'damage_double', value: 1, duration: 2 });
    };
    return BuffNextCardAction;
}(Card));
export { BuffNextCardAction };
// 力量强化 - 本回合所有伤害+3
var StrengthBoostCard = /** @class */ (function (_super) {
    __extends(StrengthBoostCard, _super);
    function StrengthBoostCard(data) {
        var _this = _super.call(this, data) || this;
        _this.cost = data.cost || 1;
        return _this;
    }
    StrengthBoostCard.prototype.play = function (caster, target, context) {
        var _a;
        // 添加本回合伤害加成效果
        caster.effects.add({ type: 'damage_buff', value: 3, duration: 1 });
        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u529B\u91CF\u5F3A\u5316\u751F\u6548\uFF01\u672C\u56DE\u5408\u6240\u6709\u4F24\u5BB3+3\uFF01", caster instanceof Player ? 'player' : 'enemy');
    };
    return StrengthBoostCard;
}(Card));
export { StrengthBoostCard };
// 狂徒之攻 - 随机从牌堆获得2张攻击牌 
var BerserkerAssaultCard = /** @class */ (function (_super) {
    __extends(BerserkerAssaultCard, _super);
    function BerserkerAssaultCard(data) {
        var _this = _super.call(this, data) || this;
        _this.cost = data.cost || 1;
        return _this;
    }
    BerserkerAssaultCard.prototype.play = function (caster, target, context) {
        var _a;
        // 抽取2张牌
        if (caster instanceof Player || caster instanceof Enemy) {
            caster.drawCards(2);
            (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u72C2\u5F92\u4E4B\u653B\u751F\u6548\uFF01\u4ECE\u724C\u5806\u62BD\u53D6\u4E862\u5F20\u724C\uFF01", caster instanceof Player ? 'player' : 'enemy');
        }
    };
    return BerserkerAssaultCard;
}(Card));
export { BerserkerAssaultCard };
// 命中要害 - 造成3点伤害，敌方下回合抽牌-1
var VitalStrikeCard = /** @class */ (function (_super) {
    __extends(VitalStrikeCard, _super);
    function VitalStrikeCard(data) {
        var _this = _super.call(this, data) || this;
        _this.cost = data.cost || 1;
        _this.damage = data.damage || 3;
        return _this;
    }
    VitalStrikeCard.prototype.play = function (caster, target, context) {
        var _a;
        // 造成伤害
        var damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        // 敌方下回合抽牌-1
        target.effects.add({ type: 'draw_penalty', value: 1, duration: 1 });
        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u547D\u4E2D\u8981\u5BB3\uFF01".concat(target.name, "\u4E0B\u56DE\u5408\u62BD\u724C-1\uFF01"), caster instanceof Player ? 'player' : 'enemy');
    };
    VitalStrikeCard.prototype.getBaseDamage = function (caster) {
        return this.damage;
    };
    return VitalStrikeCard;
}(Card));
export { VitalStrikeCard };
var CharcoalCard = /** @class */ (function (_super) {
    __extends(CharcoalCard, _super);
    function CharcoalCard(data) {
        var _this = _super.call(this, data) || this;
        _this.damage = data.damage || 0;
        return _this;
    }
    CharcoalCard.prototype.play = function (caster, target, context) {
        var damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
    };
    CharcoalCard.prototype.getBaseDamage = function (caster) {
        return this.damage;
    };
    return CharcoalCard;
}(Card));
export { CharcoalCard };
var LifeGrowthCard = /** @class */ (function (_super) {
    __extends(LifeGrowthCard, _super);
    function LifeGrowthCard(data) {
        var _this = _super.call(this, data) || this;
        _this.cost = data.cost || 0;
        return _this;
    }
    LifeGrowthCard.prototype.play = function (caster, target, context) {
        caster.maxHp += 5;
        caster.currentHp += 5;
        if (caster.ui)
            caster.ui.showFloatingText("+5 HP", 'heal');
    };
    return LifeGrowthCard;
}(Card));
export { LifeGrowthCard };
var HeavyPunchCard = /** @class */ (function (_super) {
    __extends(HeavyPunchCard, _super);
    function HeavyPunchCard(data) {
        var _a;
        var _this = _super.call(this, data) || this;
        _this.damage = data.damage || 0;
        _this.cardsToGain = ((_a = data.effectData) === null || _a === void 0 ? void 0 : _a.draw) || 1;
        _this.gainCardId = (data.id.startsWith('e')) ? 'e001' : 'p001';
        return _this;
    }
    HeavyPunchCard.prototype.play = function (caster, target, context) {
        var _a, _b;
        console.log("[\u91CD\u62F3\u51FA\u51FB] \u5F00\u59CB\u6267\u884C\uFF0C\u5F53\u524D\u624B\u724C\u6570\u91CF: ".concat(caster.hand.length));
        if (this.damage > 0) {
            var damage = { amount: this.damage, type: 'normal', source: caster };
            DamageSystem.dealDamage(damage, target);
        }
        var cardLibrary = window.cardLibrary;
        console.log("[\u91CD\u62F3\u51FA\u51FB] cardLibrary \u53EF\u7528\u6027:", !!cardLibrary);
        if (cardLibrary) {
            console.log("[\u91CD\u62F3\u51FA\u51FB] \u51C6\u5907\u83B7\u5F97 ".concat(this.cardsToGain, " \u5F20 ").concat(this.gainCardId, " \u5361\u724C"));
            for (var i = 0; i < this.cardsToGain; i++) {
                var newCard = cardLibrary.createCard(this.gainCardId);
                console.log("[\u91CD\u62F3\u51FA\u51FB] \u521B\u5EFA\u7684\u65B0\u5361\u724C:", newCard);
                if (newCard) {
                    caster.hand.push(newCard);
                    console.log("[\u91CD\u62F3\u51FA\u51FB] \u5DF2\u6DFB\u52A0\u5361\u724C\u5230\u624B\u724C\uFF0C\u73B0\u5728\u624B\u724C\u6570\u91CF: ".concat(caster.hand.length));
                }
                else {
                    console.error("[\u91CD\u62F3\u51FA\u51FB] \u521B\u5EFA\u5361\u724C\u5931\u8D25\uFF01");
                }
            }
            (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u91CD\u62F3\u51FA\u51FB\u751F\u6548\uFF01\u83B7\u5F97".concat(this.cardsToGain, "\u5F20\u666E\u901A\u653B\u51FB\uFF01"), 'player');
            // 立即更新UI以显示新卡牌
            if ((_b = window.battle) === null || _b === void 0 ? void 0 : _b.ui) {
                window.battle.ui.updateAll(caster, (context === null || context === void 0 ? void 0 : context.enemy) || target);
            }
        }
        else {
            console.error("[\u91CD\u62F3\u51FA\u51FB] cardLibrary \u4E0D\u53EF\u7528\uFF01");
        }
    };
    HeavyPunchCard.prototype.getBaseDamage = function (caster) { return this.damage; };
    return HeavyPunchCard;
}(Card));
export { HeavyPunchCard };
var StrengthFromHealthCard = /** @class */ (function (_super) {
    __extends(StrengthFromHealthCard, _super);
    function StrengthFromHealthCard(data) {
        var _this = _super.call(this, data) || this;
        _this.cost = data.cost || 0;
        _this.ratio = data.id === 'p106' ? 0.3 : 0.2;
        _this.maxDamage = data.id === 'e012' ? 10 : Infinity;
        return _this;
    }
    StrengthFromHealthCard.prototype.play = function (caster, target, context) {
        var damageAmount = Math.min(Math.floor(caster.currentHp * this.ratio), this.maxDamage);
        var damage = { amount: damageAmount, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
    };
    StrengthFromHealthCard.prototype.getBaseDamage = function (caster) {
        return Math.min(Math.floor(caster.currentHp * this.ratio), this.maxDamage);
    };
    return StrengthFromHealthCard;
}(Card));
export { StrengthFromHealthCard };
var TenaciousGuardCard = /** @class */ (function (_super) {
    __extends(TenaciousGuardCard, _super);
    function TenaciousGuardCard(data) {
        var _this = _super.call(this, data) || this;
        _this.cost = data.cost || 0;
        return _this;
    }
    TenaciousGuardCard.prototype.play = function (caster, target, context) {
        var _a;
        target.gainShield(6);
        var discardedCount = target.hand.length;
        if (discardedCount > 0) {
            (_a = target.discardPile).push.apply(_a, target.hand);
            target.hand = [];
            target.gainShield(discardedCount * 6);
        }
    };
    return TenaciousGuardCard;
}(Card));
export { TenaciousGuardCard };
var AllOutAttackCard = /** @class */ (function (_super) {
    __extends(AllOutAttackCard, _super);
    function AllOutAttackCard(data) {
        var _this = _super.call(this, data) || this;
        _this.cost = data.cost || 0;
        return _this;
    }
    AllOutAttackCard.prototype.play = function (caster, target, context) {
        var _a;
        var discardedCount = caster.hand.length;
        if (discardedCount > 0) {
            (_a = caster.discardPile).push.apply(_a, caster.hand);
            caster.hand = [];
        }
        var totalDamage = 3 + (discardedCount * 3);
        var damage = { amount: totalDamage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
    };
    AllOutAttackCard.prototype.getBaseDamage = function (caster) {
        return 3 + (caster.hand.length * 3);
    };
    return AllOutAttackCard;
}(Card));
export { AllOutAttackCard };
var RapidPursuitCard = /** @class */ (function (_super) {
    __extends(RapidPursuitCard, _super);
    function RapidPursuitCard(data) {
        var _this = _super.call(this, data) || this;
        _this.cost = data.cost || 0;
        return _this;
    }
    RapidPursuitCard.prototype.play = function (caster, target, context) {
        if ('actionPoints' in caster && (caster instanceof Player || caster instanceof Enemy)) {
            caster.actionPoints += 2;
            caster.drawCards(1);
        }
    };
    return RapidPursuitCard;
}(Card));
export { RapidPursuitCard };
var ArmorlessPursuitCard = /** @class */ (function (_super) {
    __extends(ArmorlessPursuitCard, _super);
    function ArmorlessPursuitCard(data) {
        var _this = _super.call(this, data) || this;
        _this.cost = data.cost || 0;
        return _this;
    }
    ArmorlessPursuitCard.prototype.play = function (caster, target, context) {
        if (caster.hand.length > 0) {
            var discarded = caster.hand.pop();
            if (discarded)
                caster.discardPile.push(discarded);
            var damage = { amount: 11, type: 'normal', source: caster };
            DamageSystem.dealDamage(damage, target);
        }
    };
    ArmorlessPursuitCard.prototype.getBaseDamage = function (caster) {
        return caster.hand.length > 0 ? 11 : 0;
    };
    return ArmorlessPursuitCard;
}(Card));
export { ArmorlessPursuitCard };
var SpecialActionCard = /** @class */ (function (_super) {
    __extends(SpecialActionCard, _super);
    function SpecialActionCard(data) {
        var _a, _b;
        var _this = _super.call(this, data) || this;
        _this.cost = data.cost || 0;
        _this.damage = data.damage || 0;
        _this.draw = ((_a = data.effectData) === null || _a === void 0 ? void 0 : _a.draw) || 0;
        _this.weaken = ((_b = data.effectData) === null || _b === void 0 ? void 0 : _b.weaken) || 0;
        return _this;
    }
    SpecialActionCard.prototype.play = function (caster, target, context) {
        if (this.draw > 0 && (caster instanceof Player || caster instanceof Enemy)) {
            caster.drawCards(this.draw);
        }
        if (this.damage > 0) {
            var damage = { amount: this.damage, type: 'normal', source: caster };
            DamageSystem.dealDamage(damage, target);
        }
        if (this.weaken > 0) {
            console.log("".concat(target.name, " \u88AB\u524A\u5F31\u4E86\uFF01"));
        }
    };
    SpecialActionCard.prototype.getBaseDamage = function (caster) { return this.damage; };
    return SpecialActionCard;
}(Card));
export { SpecialActionCard };
// =============== 新增反制卡基类 ===============
var CounterCard = /** @class */ (function (_super) {
    __extends(CounterCard, _super);
    function CounterCard(data) {
        var _a;
        var _this = _super.call(this, data) || this;
        _this.counterType = ((_a = data.effectData) === null || _a === void 0 ? void 0 : _a.counterType) || 'any';
        _this.type = 'Counter';
        return _this;
    }
    CounterCard.prototype.play = function (caster, target, context) {
        // 反制卡通常在手牌中被动触发，不主动使用
        // 但也可以设置一些立即生效的反制状态
        this.applyCounterState(caster, target, context);
    };
    CounterCard.prototype.canCounter = function (playedCard, context) {
        var _a, _b, _c, _d;
        console.log("[DEBUG] CounterCard.canCounter() - \u68C0\u67E5 ".concat(this.name, " \u662F\u5426\u53EF\u4EE5\u53CD\u5236 ").concat(playedCard.name));
        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u68C0\u67E5\u53CD\u5236\u724C[".concat(this.name, "]\u662F\u5426\u53EF\u4EE5\u53CD\u5236[").concat(playedCard.name, "]..."), 'system');
        switch (this.counterType) {
            case 'attack':
                var isAttack = playedCard.type === 'Normal' || (playedCard.type === 'Action' && playedCard.getBaseDamage(context.enemy) > 0);
                console.log("[DEBUG] \u53CD\u5236\u7C7B\u578B: attack, \u5361\u724C\u7C7B\u578B: ".concat(playedCard.type, ", \u57FA\u7840\u4F24\u5BB3: ").concat(playedCard.getBaseDamage(context.enemy), ", \u7ED3\u679C: ").concat(isAttack));
                (_b = window.battle) === null || _b === void 0 ? void 0 : _b.ui.logAction("\u68C0\u67E5\u662F\u5426\u4E3A\u653B\u51FB\u724C\uFF1A".concat(isAttack ? '是' : '否'), 'system');
                return isAttack;
            case 'damage':
                var hasDamage = playedCard.getBaseDamage(context.enemy) > 0;
                console.log("[DEBUG] \u53CD\u5236\u7C7B\u578B: damage, \u57FA\u7840\u4F24\u5BB3: ".concat(playedCard.getBaseDamage(context.enemy), ", \u7ED3\u679C: ").concat(hasDamage));
                (_c = window.battle) === null || _c === void 0 ? void 0 : _c.ui.logAction("\u68C0\u67E5\u662F\u5426\u9020\u6210\u4F24\u5BB3\uFF1A".concat(hasDamage ? '是' : '否'), 'system');
                return hasDamage;
            case 'next':
                console.log("[DEBUG] \u53CD\u5236\u7C7B\u578B: next, \u53EF\u4EE5\u53CD\u5236\u4EFB\u610F\u4E0B\u4E00\u5F20\u724C");
                (_d = window.battle) === null || _d === void 0 ? void 0 : _d.ui.logAction("\u53EF\u4EE5\u53CD\u5236\u4EFB\u610F\u4E0B\u4E00\u5F20\u724C", 'system');
                return true; // 可以反制下一张任意牌
            case 'any':
            default:
                console.log("[DEBUG] \u53CD\u5236\u7C7B\u578B: any, \u53EF\u4EE5\u53CD\u5236\u4EFB\u610F\u724C");
                return true;
        }
    };
    return CounterCard;
}(Card));
export { CounterCard };
var EnhancedEquipmentCard = /** @class */ (function (_super) {
    __extends(EnhancedEquipmentCard, _super);
    function EnhancedEquipmentCard(data) {
        var _a;
        var _this = _super.call(this, data) || this;
        _this.isActive = false;
        _this.type = 'Equipment';
        _this.equipmentSlot = ((_a = data.effectData) === null || _a === void 0 ? void 0 : _a.equipmentSlot) || 'accessory';
        _this.effects = [];
        return _this;
    }
    EnhancedEquipmentCard.prototype.play = function (caster, target, context) {
        if (caster instanceof Player) {
            console.log("[\u88C5\u5907\u7CFB\u7EDF] \u73A9\u5BB6\u88C5\u5907: ".concat(this.name));
            caster.equip(this);
            this.isActive = true;
            this.onEquip(caster, context);
        }
        else if (caster instanceof Enemy) {
            console.log("[\u88C5\u5907\u7CFB\u7EDF] \u654C\u4EBA\u88C5\u5907: ".concat(this.name));
            caster.equip(this);
            this.isActive = true;
            this.onEquip(caster, context);
        }
    };
    EnhancedEquipmentCard.prototype.onEquip = function (wearer, context) {
        // 装备时的初始化效果
    };
    EnhancedEquipmentCard.prototype.addEffect = function (effect) {
        this.effects.push(effect);
    };
    EnhancedEquipmentCard.prototype.triggerEffects = function (triggerType, context) {
        if (!this.isActive)
            return;
        this.effects.forEach(function (effect) {
            if (effect.type === 'trigger' && effect.trigger === triggerType) {
                if (!effect.condition || effect.condition(context)) {
                    effect.effect(context);
                }
            }
        });
    };
    EnhancedEquipmentCard.prototype.getPassiveEffects = function () {
        return this.effects.filter(function (e) { return e.type === 'passive'; });
    };
    return EnhancedEquipmentCard;
}(Card));
export { EnhancedEquipmentCard };
// =============== 特殊效果卡牌类 ===============
// 重创卡 - 移除，造成3点伤害，敌方失去所有行动点，每失去1点行动点伤害+3
var CriticalStrikeCard = /** @class */ (function (_super) {
    __extends(CriticalStrikeCard, _super);
    function CriticalStrikeCard(data) {
        var _this = _super.call(this, data) || this;
        _this.isRemovedOnPlay = true;
        return _this;
    }
    CriticalStrikeCard.prototype.play = function (caster, target, context) {
        var _a;
        var baseDamage = 3;
        var actionPointsLost = 0;
        if ('actionPoints' in target && (target instanceof Player || target instanceof Enemy)) {
            actionPointsLost = target.actionPoints;
            target.actionPoints = 0;
        }
        var totalDamage = baseDamage + (actionPointsLost * 3);
        var damage = { amount: totalDamage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        if (context) {
            (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u91CD\u521B\u751F\u6548\uFF01\u654C\u65B9\u5931\u53BB".concat(actionPointsLost, "\u70B9\u884C\u52A8\u70B9\uFF0C\u989D\u5916\u9020\u6210").concat(actionPointsLost * 3, "\u70B9\u4F24\u5BB3\uFF01"), 'player');
        }
    };
    CriticalStrikeCard.prototype.getBaseDamage = function (caster) {
        return 3; // 基础伤害，实际伤害会根据目标的行动点增加
    };
    return CriticalStrikeCard;
}(Card));
export { CriticalStrikeCard };
// 追加攻击卡 - 这张牌视为你使用的上一张攻击牌
var FollowUpAttackCard = /** @class */ (function (_super) {
    __extends(FollowUpAttackCard, _super);
    function FollowUpAttackCard(data) {
        return _super.call(this, data) || this;
    }
    FollowUpAttackCard.prototype.play = function (caster, target, context) {
        var _a, _b;
        if (context && caster instanceof Player) {
            var lastPlayedCard = caster.lastPlayedCard;
            if (lastPlayedCard && (lastPlayedCard.type === 'Normal' || lastPlayedCard.getBaseDamage(caster) > 0)) {
                // 复制上一张攻击牌的效果
                lastPlayedCard.play(caster, target, context);
                (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u8FFD\u52A0\u653B\u51FB\u751F\u6548\uFF01\u590D\u5236\u4E86\u4E0A\u4E00\u5F20\u653B\u51FB\u724C\u7684\u6548\u679C\uFF01", 'player');
            }
            else {
                // 如果没有上一张攻击牌，则无法使用该牌
                (_b = window.battle) === null || _b === void 0 ? void 0 : _b.ui.logAction("\u8FFD\u52A0\u653B\u51FB\u65E0\u6CD5\u4F7F\u7528\uFF01\u6CA1\u6709\u53EF\u590D\u5236\u7684\u653B\u51FB\u724C\uFF01", 'player');
                return;
            }
        }
    };
    FollowUpAttackCard.prototype.getBaseDamage = function (caster) {
        if (caster instanceof Player && caster.lastPlayedCard) {
            return caster.lastPlayedCard.getBaseDamage(caster);
        }
        return 3; // 默认基础伤害
    };
    return FollowUpAttackCard;
}(Card));
export { FollowUpAttackCard };
// 兵甲之刃卡 - 每装备了1件装备造成1次2点伤害  
var WeaponMasteryCard = /** @class */ (function (_super) {
    __extends(WeaponMasteryCard, _super);
    function WeaponMasteryCard(data) {
        return _super.call(this, data) || this;
    }
    WeaponMasteryCard.prototype.play = function (caster, target, context) {
        var _a, _b;
        var equipmentCount = 0;
        if (caster instanceof Player) {
            equipmentCount = caster.equipment.length;
        }
        // 每个装备造成2点伤害
        for (var i = 0; i < equipmentCount; i++) {
            var damage = { amount: 2, type: 'normal', source: caster };
            DamageSystem.dealDamage(damage, target);
        }
        if (context && equipmentCount > 0) {
            (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u5175\u7532\u4E4B\u5203\u751F\u6548\uFF01\u57FA\u4E8E".concat(equipmentCount, "\u4EF6\u88C5\u5907\u9020\u6210\u4E86").concat(equipmentCount * 2, "\u70B9\u4F24\u5BB3\uFF01"), 'player');
        }
        else if (context) {
            (_b = window.battle) === null || _b === void 0 ? void 0 : _b.ui.logAction("\u5175\u7532\u4E4B\u5203\u65E0\u6548\u679C\uFF0C\u4F60\u6CA1\u6709\u88C5\u5907\u4EFB\u4F55\u88C5\u5907\uFF01", 'player');
        }
    };
    WeaponMasteryCard.prototype.getBaseDamage = function (caster) {
        if (caster instanceof Player) {
            return caster.equipment.length * 2;
        }
        return 0;
    };
    return WeaponMasteryCard;
}(Card));
export { WeaponMasteryCard };
// 影影绰绰卡 - 选择手牌中的1张牌，将该牌的2张复制加入牌堆
var ShadowCopyCard = /** @class */ (function (_super) {
    __extends(ShadowCopyCard, _super);
    function ShadowCopyCard(data) {
        var _this = _super.call(this, data) || this;
        _this.cost = data.cost || 1;
        _this.requiresChoice = true;
        return _this;
    }
    ShadowCopyCard.prototype.play = function (caster, target, context) {
        var _a, _b, _c;
        console.log('[影影绰绰] 开始执行');
        if (!context) {
            console.log('[影影绰绰] 错误：context 未定义');
            return;
        }
        if (!(caster instanceof Player)) {
            console.log('[影影绰绰] 错误：施法者不是玩家');
            return;
        }
        console.log('[影影绰绰] 玩家手牌数量:', caster.hand.length);
        // 如果玩家手牌为空，不执行任何操作
        if (caster.hand.length === 0) {
            console.log('[影影绰绰] 错误：没有可以复制的手牌');
            (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u6CA1\u6709\u53EF\u4EE5\u590D\u5236\u7684\u624B\u724C\uFF01", 'system');
            return;
        }
        console.log('[影影绰绰] 检查是否已选择卡牌:', context.chosenCard ? '是' : '否');
        console.log('[影影绰绰] 等待选择状态:', context.awaitingCardChoice ? '是' : '否');
        // 如果已经选择了卡牌，执行复制操作
        if (context.chosenCard) {
            console.log('[影影绰绰] 选中的卡牌:', context.chosenCard.name);
            var cardToCopy = context.chosenCard;
            console.log('[影影绰绰] 开始创建卡牌复制');
            // 创建2张复制到牌库
            for (var i = 0; i < 2; i++) {
                var copy = Object.create(Object.getPrototypeOf(cardToCopy));
                Object.assign(copy, cardToCopy);
                copy.name = cardToCopy.name + '（复制）';
                caster.deck.push(copy);
                console.log('[影影绰绰] 创建复制卡牌:', copy.name);
            }
            // 洗牌
            var originalDeckSize = caster.deck.length;
            caster.deck = caster.deck.sort(function () { return Math.random() - 0.5; });
            console.log('[影影绰绰] 洗牌完成，牌库大小:', caster.deck.length, '(原大小:', originalDeckSize, ')');
            (_b = window.battle) === null || _b === void 0 ? void 0 : _b.ui.logAction("\u5F71\u5F71\u7EF0\u7EF0\u751F\u6548\uFF01\u590D\u5236\u4E862\u5F20\u3010".concat(cardToCopy.name, "\u3011\u5230\u724C\u5E93\u4E2D\uFF01"), 'player');
            console.log('[影影绰绰] 复制操作完成');
            return;
        }
        // 如果还没有选择卡牌，显示选择提示
        console.log('[影影绰绰] 等待玩家选择卡牌');
        (_c = window.battle) === null || _c === void 0 ? void 0 : _c.ui.logAction("\u8BF7\u9009\u62E9\u4E00\u5F20\u624B\u724C\u8FDB\u884C\u590D\u5236...", 'system');
        context.awaitingCardChoice = true;
        console.log('[影影绰绰] 已设置等待选择状态');
    };
    return ShadowCopyCard;
}(Card));
export { ShadowCopyCard };
// =============== 反制卡具体实现 ===============
// 迎头痛击 - 敌方使用攻击牌时：将其无效，对敌方造成2伤害，抽1张牌
var HeadlongStrikeCounter = /** @class */ (function (_super) {
    __extends(HeadlongStrikeCounter, _super);
    function HeadlongStrikeCounter(data) {
        var _this = _super.call(this, data) || this;
        _this.counterType = 'attack';
        return _this;
    }
    HeadlongStrikeCounter.prototype.applyCounterState = function (caster, target, context) {
        // 反制卡通常在手牌中被动触发，这里不需要特殊处理
    };
    HeadlongStrikeCounter.prototype.triggerCounter = function (playedCard, context) {
        var _a, _b, _c, _d;
        console.log("[DEBUG] HeadlongStrikeCounter.triggerCounter() \u5F00\u59CB\u6267\u884C");
        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u89E6\u53D1[\u8FCE\u5934\u75DB\u51FB]\u7684\u6548\u679C...", 'system');
        // 无效化敌方攻击牌
        console.log("[DEBUG] \u51C6\u5907\u9020\u62102\u70B9\u53CD\u51FB\u4F24\u5BB3");
        (_b = window.battle) === null || _b === void 0 ? void 0 : _b.ui.logAction("\u51C6\u5907\u5BF9\u654C\u65B9\u9020\u62102\u70B9\u53CD\u51FB\u4F24\u5BB3...", 'system');
        var damage = { amount: 2, type: 'normal', source: context.player };
        DamageSystem.dealDamage(damage, context.enemy);
        console.log("[DEBUG] \u4F24\u5BB3\u5DF2\u9020\u6210");
        if (context.player instanceof Player) {
            console.log("[DEBUG] \u73A9\u5BB6\u62BD\u53D61\u5F20\u724C");
            (_c = window.battle) === null || _c === void 0 ? void 0 : _c.ui.logAction("\u73A9\u5BB6\u62BD\u53D61\u5F20\u724C...", 'system');
            context.player.drawCards(1);
        }
        (_d = window.battle) === null || _d === void 0 ? void 0 : _d.ui.logAction("\u8FCE\u5934\u75DB\u51FB\u53D1\u52A8\uFF01\u65E0\u6548\u5316\u4E86\u654C\u65B9\u7684\u653B\u51FB\uFF0C\u5E76\u9020\u62102\u70B9\u53CD\u51FB\u4F24\u5BB3\uFF01", 'player');
        console.log("[DEBUG] HeadlongStrikeCounter.triggerCounter() \u6267\u884C\u5B8C\u6210\uFF0C\u8FD4\u56DE true");
        return true; // 返回true表示成功反制
    };
    return HeadlongStrikeCounter;
}(CounterCard));
export { HeadlongStrikeCounter };
// 伤害吸收 - 敌方使用能造成伤害的牌时，将其无效，抽1张牌
var DamageAbsorptionCounter = /** @class */ (function (_super) {
    __extends(DamageAbsorptionCounter, _super);
    function DamageAbsorptionCounter(data) {
        var _this = _super.call(this, data) || this;
        _this.counterType = 'damage';
        return _this;
    }
    DamageAbsorptionCounter.prototype.applyCounterState = function (caster, target, context) {
        // 反制卡通常在手牌中被动触发
    };
    DamageAbsorptionCounter.prototype.triggerCounter = function (playedCard, context) {
        var _a;
        // 无效化敌方伤害牌
        if (context.player instanceof Player) {
            context.player.drawCards(1);
        }
        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u4F24\u5BB3\u5438\u6536\u53D1\u52A8\uFF01\u5438\u6536\u4E86\u654C\u65B9\u7684\u653B\u51FB\uFF0C\u5E76\u62BD\u53D6\u4E861\u5F20\u724C\uFF01", 'player');
        return true; // 返回true表示成功反制
    };
    return DamageAbsorptionCounter;
}(CounterCard));
export { DamageAbsorptionCounter };
// 噩梦凝视 - 敌方使用的下一张牌失效
var NightmareGazeCounter = /** @class */ (function (_super) {
    __extends(NightmareGazeCounter, _super);
    function NightmareGazeCounter(data) {
        var _this = _super.call(this, data) || this;
        _this.counterType = 'next';
        return _this;
    }
    NightmareGazeCounter.prototype.applyCounterState = function (caster, target, context) {
        // 为敌方添加下一张牌无效的状态
        if (target instanceof Enemy) {
            target.effects.add({ type: 'card_nullify', value: 1, duration: 2 });
        }
    };
    NightmareGazeCounter.prototype.triggerCounter = function (playedCard, context) {
        var _a;
        // 这张反制卡是预防性的，在play时就生效
        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u5669\u68A6\u51DD\u89C6\u751F\u6548\uFF01\u654C\u65B9\u7684\u4E0B\u4E00\u5F20\u724C\u5C06\u65E0\u6548\u5316\uFF01", 'player');
        return true;
    };
    return NightmareGazeCounter;
}(CounterCard));
export { NightmareGazeCounter };
// 和声共鸣 - 敌方下回合前2次伤害将会被反弹一半
var HarmoniousResonanceCounter = /** @class */ (function (_super) {
    __extends(HarmoniousResonanceCounter, _super);
    function HarmoniousResonanceCounter(data) {
        var _this = _super.call(this, data) || this;
        _this.counterType = 'damage';
        return _this;
    }
    HarmoniousResonanceCounter.prototype.applyCounterState = function (caster, target, context) {
        // 为玩家添加伤害反弹状态
        caster.effects.add({
            type: 'damage_reflection',
            value: 0.5, // 反弹50%伤害
            duration: 2,
            metadata: { reflectCount: 2 } // 只反弹前2次伤害
        });
    };
    HarmoniousResonanceCounter.prototype.triggerCounter = function (playedCard, context) {
        var _a;
        this.applyCounterState(context.player, context.enemy, context);
        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u548C\u58F0\u5171\u9E23\u53D1\u52A8\uFF01\u63A5\u4E0B\u67652\u6B21\u53D7\u5230\u7684\u4F24\u5BB3\u5C06\u53CD\u5F39\u4E00\u534A\u7ED9\u654C\u65B9\uFF01", 'player');
        return false; // 这张牌不直接反制，而是设置状态
    };
    return HarmoniousResonanceCounter;
}(CounterCard));
export { HarmoniousResonanceCounter };
// =============== 装备卡具体实现 ===============
// 盔甲护身 - 每回合开始时获得4点护盾
var ArmorProtectionEquipment = /** @class */ (function (_super) {
    __extends(ArmorProtectionEquipment, _super);
    function ArmorProtectionEquipment(data) {
        var _this = _super.call(this, data) || this;
        _this.equipmentSlot = 'armor';
        _this.addEffect({
            type: 'trigger',
            trigger: 'startTurn',
            effect: function (context) {
                var _a;
                context.player.gainShield(4);
                (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('盔甲护身生效，获得4点护盾！', 'player');
            }
        });
        return _this;
    }
    return ArmorProtectionEquipment;
}(EnhancedEquipmentCard));
export { ArmorProtectionEquipment };
// 统统加护 - 受到的所有伤害-1
var UniversalProtectionEquipment = /** @class */ (function (_super) {
    __extends(UniversalProtectionEquipment, _super);
    function UniversalProtectionEquipment(data) {
        var _this = _super.call(this, data) || this;
        _this.equipmentSlot = 'armor';
        return _this;
    }
    // 特殊方法：减少伤害
    UniversalProtectionEquipment.prototype.reduceDamage = function (damage) {
        var _a;
        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('统统加护减少了1点伤害！', 'player');
        return Math.max(0, damage - 1);
    };
    return UniversalProtectionEquipment;
}(EnhancedEquipmentCard));
export { UniversalProtectionEquipment };
// 追击之刃 - 每使用两次能造成伤害的牌对敌方造成1点伤害
var PursuitBladeEquipment = /** @class */ (function (_super) {
    __extends(PursuitBladeEquipment, _super);
    function PursuitBladeEquipment(data) {
        var _this = _super.call(this, data) || this;
        _this.damageCardCount = 0;
        _this.equipmentSlot = 'weapon';
        return _this;
    }
    PursuitBladeEquipment.prototype.onDamageCardPlayed = function (context) {
        var _a;
        this.damageCardCount++;
        if (this.damageCardCount >= 2) {
            var damage = { amount: 1, type: 'normal', source: context.player };
            DamageSystem.dealDamage(damage, context.enemy);
            this.damageCardCount = 0;
            (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('追击之刃触发，造成额外1点伤害！', 'player');
        }
    };
    return PursuitBladeEquipment;
}(EnhancedEquipmentCard));
export { PursuitBladeEquipment };
// 重击之锤 - 每回合的第1张伤害牌伤害翻倍
var HeavyStrikeHammerEquipment = /** @class */ (function (_super) {
    __extends(HeavyStrikeHammerEquipment, _super);
    function HeavyStrikeHammerEquipment(data) {
        var _this = _super.call(this, data) || this;
        _this.firstCardUsed = false;
        _this.equipmentSlot = 'weapon';
        return _this;
    }
    HeavyStrikeHammerEquipment.prototype.onTurnStart = function () {
        this.firstCardUsed = false;
    };
    HeavyStrikeHammerEquipment.prototype.checkFirstDamageCard = function (context) {
        var _a;
        if (!this.firstCardUsed) {
            this.firstCardUsed = true;
            (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('重击之锤生效！第一张伤害牌伤害翻倍！', 'player');
            return true;
        }
        return false;
    };
    return HeavyStrikeHammerEquipment;
}(EnhancedEquipmentCard));
export { HeavyStrikeHammerEquipment };
// 泣血之刃 - 每造成4点伤害获得1点生命值
var BloodthirstyBladeEquipment = /** @class */ (function (_super) {
    __extends(BloodthirstyBladeEquipment, _super);
    function BloodthirstyBladeEquipment(data) {
        var _this = _super.call(this, data) || this;
        _this.damageAccumulated = 0;
        _this.equipmentSlot = 'weapon';
        return _this;
    }
    BloodthirstyBladeEquipment.prototype.onDamageDealt = function (damage, context) {
        var _a;
        this.damageAccumulated += damage;
        while (this.damageAccumulated >= 6) {
            this.damageAccumulated -= 6;
            var healAmount = 1;
            context.player.currentHp = Math.min(context.player.maxHp, context.player.currentHp + healAmount);
            if (context.player.ui) {
                context.player.ui.showFloatingText("+".concat(healAmount), 'heal');
            }
            (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('泣血之刃吸血效果触发，恢复1点生命！', 'player');
        }
    };
    return BloodthirstyBladeEquipment;
}(EnhancedEquipmentCard));
export { BloodthirstyBladeEquipment };
// 一念神魔 - 每回合结束时获得2点护盾，对敌方造成2点伤害
var DualNatureEquipment = /** @class */ (function (_super) {
    __extends(DualNatureEquipment, _super);
    function DualNatureEquipment(data) {
        var _this = _super.call(this, data) || this;
        _this.equipmentSlot = 'accessory';
        return _this;
    }
    DualNatureEquipment.prototype.onTurnEnd = function (context) {
        var _a;
        context.player.gainShield(2);
        var damage = { amount: 2, type: 'normal', source: context.player };
        DamageSystem.dealDamage(damage, context.enemy);
        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('一念神魔生效！获得2点护盾并对敌方造成2点伤害！', 'player');
    };
    return DualNatureEquipment;
}(EnhancedEquipmentCard));
export { DualNatureEquipment };
// 恋战之斧 - 每次使用普通攻击后获得一张普通攻击(复制：该卡牌使用后将直接消失)
var BattleAxeEquipment = /** @class */ (function (_super) {
    __extends(BattleAxeEquipment, _super);
    function BattleAxeEquipment(data) {
        var _this = _super.call(this, data) || this;
        _this.equipmentSlot = 'weapon';
        return _this;
    }
    BattleAxeEquipment.prototype.onNormalAttackUsed = function (context) {
        // 这个方法不再需要，因为已经在BattleManager中统一处理了
        // 防止重复触发，这里只做日志记录
        console.log("[DEBUG] BattleAxeEquipment.onNormalAttackUsed \u88AB\u8C03\u7528\uFF08\u5DF2\u5728BattleManager\u4E2D\u5904\u7406\uFF09");
    };
    return BattleAxeEquipment;
}(EnhancedEquipmentCard));
export { BattleAxeEquipment };
// =============== 监管者专属卡牌实现 ===============
// 蜘蛛 - 毒液
var VenomCard = /** @class */ (function (_super) {
    __extends(VenomCard, _super);
    function VenomCard(data) {
        var _this = _super.call(this, data) || this;
        _this.damage = data.damage || 0;
        return _this;
    }
    VenomCard.prototype.play = function (caster, target, context) {
        var _a;
        var damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        // 敌方下回合抽牌-1
        if (target instanceof Player) {
            target.effects.add({ type: 'draw_penalty', value: 1, duration: 1 });
            (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u6BD2\u6DB2\u751F\u6548\uFF01".concat(target.name, "\u4E0B\u56DE\u5408\u62BD\u724C-1\uFF01"), 'enemy');
        }
    };
    VenomCard.prototype.getBaseDamage = function (caster) {
        return this.damage;
    };
    return VenomCard;
}(Card));
export { VenomCard };
// 蜘蛛 - 蛛网装备
var SpiderWebEquipment = /** @class */ (function (_super) {
    __extends(SpiderWebEquipment, _super);
    function SpiderWebEquipment(data) {
        var _this = _super.call(this, data) || this;
        _this.equipmentSlot = 'accessory';
        return _this;
    }
    SpiderWebEquipment.prototype.onEnemyCardPlayed = function (context) {
        var _a;
        // 对方每出1张牌受到1点伤害
        var damage = { amount: 1, type: 'normal', source: context.enemy };
        DamageSystem.dealDamage(damage, context.player);
        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('蛛网缠绕！你因出牌受到1点伤害！', 'enemy');
    };
    return SpiderWebEquipment;
}(EnhancedEquipmentCard));
export { SpiderWebEquipment };
// 愚人金 - 坍塌
var CollapseCard = /** @class */ (function (_super) {
    __extends(CollapseCard, _super);
    function CollapseCard(data) {
        var _this = _super.call(this, data) || this;
        _this.damage = data.damage || 0;
        return _this;
    }
    CollapseCard.prototype.play = function (caster, target, context) {
        // 造成两次伤害
        var damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        setTimeout(function () {
            var _a;
            DamageSystem.dealDamage(damage, target);
            (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('坍塌的第二波伤害到来！', 'enemy');
        }, 300);
    };
    CollapseCard.prototype.getBaseDamage = function (caster) {
        return (this.damage || 0) * 2;
    };
    return CollapseCard;
}(Card));
export { CollapseCard };
// 愚人金 - 不稳定区域装备
var UnstableAreaEquipment = /** @class */ (function (_super) {
    __extends(UnstableAreaEquipment, _super);
    function UnstableAreaEquipment(data) {
        var _this = _super.call(this, data) || this;
        _this.damageCount = 0;
        _this.equipmentSlot = 'accessory';
        return _this;
    }
    UnstableAreaEquipment.prototype.onDamageDealt = function (damage, context) {
        this.damageCount++;
        if (this.damageCount >= 4) {
            this.damageCount = 0;
            var collapseDamage_1 = { amount: 3, type: 'normal', source: context.enemy };
            setTimeout(function () {
                var _a;
                DamageSystem.dealDamage(collapseDamage_1, context.player);
                (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('不稳定区域触发坍塌！造成3点伤害！', 'enemy');
            }, 500);
        }
    };
    return UnstableAreaEquipment;
}(EnhancedEquipmentCard));
export { UnstableAreaEquipment };
// 愚人金 - 重组装备
var RecompositionEquipment = /** @class */ (function (_super) {
    __extends(RecompositionEquipment, _super);
    function RecompositionEquipment(data) {
        var _this = _super.call(this, data) || this;
        _this.equipmentSlot = 'accessory';
        return _this;
    }
    RecompositionEquipment.prototype.onTurnStart = function (context) {
        var _a;
        var healAmount = 3;
        context.enemy.currentHp = Math.min(context.enemy.maxHp, context.enemy.currentHp + healAmount);
        if (context.enemy.ui) {
            context.enemy.ui.showFloatingText("+".concat(healAmount), 'heal');
        }
        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('重组装备生效！恢复3点生命！', 'enemy');
    };
    return RecompositionEquipment;
}(EnhancedEquipmentCard));
export { RecompositionEquipment };
// 红夫人 - 水镜
var WaterMirrorCard = /** @class */ (function (_super) {
    __extends(WaterMirrorCard, _super);
    function WaterMirrorCard(data) {
        var _this = _super.call(this, data) || this;
        _this.damage = data.damage || 0;
        return _this;
    }
    WaterMirrorCard.prototype.play = function (caster, target, context) {
        var _a;
        var damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        // 下一张牌伤害翻倍
        caster.effects.add({ type: 'damage_double', value: 1, duration: 2 });
        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('水镜生效！下一张牌伤害翻倍！', 'enemy');
    };
    WaterMirrorCard.prototype.getBaseDamage = function (caster) {
        return this.damage;
    };
    return WaterMirrorCard;
}(Card));
export { WaterMirrorCard };
// 红夫人 - 矢车菊之殇装备
var CornflowerSorrowEquipment = /** @class */ (function (_super) {
    __extends(CornflowerSorrowEquipment, _super);
    function CornflowerSorrowEquipment(data) {
        var _this = _super.call(this, data) || this;
        _this.cardsPlayedThisTurn = 0;
        _this.equipmentSlot = 'accessory';
        return _this;
    }
    CornflowerSorrowEquipment.prototype.onTurnStart = function () {
        this.cardsPlayedThisTurn = 0;
    };
    CornflowerSorrowEquipment.prototype.onCardPlayed = function () {
        this.cardsPlayedThisTurn++;
    };
    CornflowerSorrowEquipment.prototype.onTurnEnd = function (context) {
        var _a, _b;
        if (this.cardsPlayedThisTurn < 5) {
            context.enemy.gainShield(4);
            (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('矢车菊之殇：出牌少于5张，获得4点护盾！', 'enemy');
        }
        else {
            var damage = { amount: 4, type: 'normal', source: context.enemy };
            DamageSystem.dealDamage(damage, context.player);
            (_b = window.battle) === null || _b === void 0 ? void 0 : _b.ui.logAction('矢车菊之殇：出牌大于等于5张，对敌方造成4点伤害！', 'enemy');
        }
    };
    return CornflowerSorrowEquipment;
}(EnhancedEquipmentCard));
export { CornflowerSorrowEquipment };
// 噩梦 - 滋长装备
var GrowthEquipment = /** @class */ (function (_super) {
    __extends(GrowthEquipment, _super);
    function GrowthEquipment(data) {
        var _this = _super.call(this, data) || this;
        _this.equipmentSlot = 'accessory';
        return _this;
    }
    GrowthEquipment.prototype.onTurnEnd = function (context) {
        var _a;
        console.log("[\u6ECB\u957F\u88C5\u5907] onTurnEnd \u88AB\u8C03\u7528");
        var lostHp = context.enemy.maxHp - context.enemy.currentHp;
        var healAmount = Math.floor(lostHp * 0.12);
        console.log("[\u6ECB\u957F\u88C5\u5907] \u6700\u5927\u751F\u547D: ".concat(context.enemy.maxHp, ", \u5F53\u524D\u751F\u547D: ").concat(context.enemy.currentHp, ", \u635F\u5931\u751F\u547D: ").concat(lostHp, ", \u8BA1\u7B97\u56DE\u590D\u91CF: ").concat(healAmount));
        if (healAmount > 0) {
            var oldHp = context.enemy.currentHp;
            context.enemy.currentHp = Math.min(context.enemy.maxHp, context.enemy.currentHp + healAmount);
            var actualHeal = context.enemy.currentHp - oldHp;
            console.log("[\u6ECB\u957F\u88C5\u5907] \u5B9E\u9645\u56DE\u590D: ".concat(actualHeal, "\u70B9\u751F\u547D"));
            if (context.enemy.ui) {
                context.enemy.ui.showFloatingText("+".concat(actualHeal), 'heal');
            }
            (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u6ECB\u957F\u751F\u6548\uFF01\u6062\u590D".concat(actualHeal, "\u70B9\u751F\u547D\uFF08\u635F\u5931\u751F\u547D\u768412%\uFF09\uFF01"), 'enemy');
        }
        else {
            console.log("[\u6ECB\u957F\u88C5\u5907] \u65E0\u9700\u56DE\u590D\u751F\u547D\uFF08\u5DF2\u6EE1\u8840\u6216\u635F\u5931\u8FC7\u5C11\uFF09");
        }
    };
    return GrowthEquipment;
}(EnhancedEquipmentCard));
export { GrowthEquipment };
// 噩梦 - 梦魇装备 
var NightmareEquipment = /** @class */ (function (_super) {
    __extends(NightmareEquipment, _super);
    function NightmareEquipment(data) {
        var _this = _super.call(this, data) || this;
        _this.turnCounter = 0;
        _this.equipmentSlot = 'accessory';
        return _this;
    }
    NightmareEquipment.prototype.onTurnEnd = function (context) {
        var _a;
        this.turnCounter++;
        console.log("[\u68A6\u9B47\u88C5\u5907] onTurnEnd \u88AB\u8C03\u7528\uFF0C\u5F53\u524D\u8BA1\u6570: ".concat(this.turnCounter, "/8"));
        if (this.turnCounter >= 8) {
            this.turnCounter = 0;
            var lostHp = context.enemy.maxHp - context.enemy.currentHp;
            var healAmount = Math.floor(lostHp * 0.3);
            console.log("[\u68A6\u9B47\u88C5\u5907] 8\u56DE\u5408\u5230\u8FBE\uFF01\u6700\u5927\u751F\u547D: ".concat(context.enemy.maxHp, ", \u5F53\u524D\u751F\u547D: ").concat(context.enemy.currentHp, ", \u635F\u5931\u751F\u547D: ").concat(lostHp, ", \u8BA1\u7B97\u56DE\u590D\u91CF: ").concat(healAmount));
            if (healAmount > 0) {
                var oldHp = context.enemy.currentHp;
                context.enemy.currentHp = Math.min(context.enemy.maxHp, context.enemy.currentHp + healAmount);
                var actualHeal = context.enemy.currentHp - oldHp;
                console.log("[\u68A6\u9B47\u88C5\u5907] \u5B9E\u9645\u56DE\u590D: ".concat(actualHeal, "\u70B9\u751F\u547D"));
                if (context.enemy.ui) {
                    context.enemy.ui.showFloatingText("+".concat(actualHeal), 'heal');
                }
                (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u68A6\u9B47\u82CF\u9192\uFF01\u6062\u590D".concat(actualHeal, "\u70B9\u751F\u547D\uFF08\u635F\u5931\u751F\u547D\u768430%\uFF09\uFF01"), 'enemy');
            }
            else {
                console.log("[\u68A6\u9B47\u88C5\u5907] \u65E0\u9700\u56DE\u590D\u751F\u547D\uFF08\u5DF2\u6EE1\u8840\u6216\u635F\u5931\u8FC7\u5C11\uFF09");
            }
        }
    };
    return NightmareEquipment;
}(EnhancedEquipmentCard));
export { NightmareEquipment };
// 火箭礼花 - 普通攻击伤害+2
var RocketFireworksEquipment = /** @class */ (function (_super) {
    __extends(RocketFireworksEquipment, _super);
    function RocketFireworksEquipment(data) {
        var _this = _super.call(this, data) || this;
        _this.equipmentSlot = 'weapon';
        return _this;
    }
    RocketFireworksEquipment.prototype.modifyDamage = function (damage, card, context) {
        var _a;
        // 如果是普通攻击卡，增加2点伤害
        if (card.name === '监管者普攻' || card.name === '普通攻击') {
            (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('火箭礼花生效！普通攻击伤害+2！', 'enemy');
            return damage + 2;
        }
        return damage;
    };
    return RocketFireworksEquipment;
}(EnhancedEquipmentCard));
export { RocketFireworksEquipment };
// 火箭改装 - 获得2张[监管者普攻]
var RocketModificationCard = /** @class */ (function (_super) {
    __extends(RocketModificationCard, _super);
    function RocketModificationCard(data) {
        var _this = _super.call(this, data) || this;
        _this.cost = data.cost || 1;
        return _this;
    }
    RocketModificationCard.prototype.play = function (caster, target, context) {
        var _a;
        // 获得2张监管者普攻
        if (caster instanceof Enemy) {
            var cardLibrary = window.cardLibrary;
            var normalAttackData = cardLibrary === null || cardLibrary === void 0 ? void 0 : cardLibrary.getCardData('e001');
            if (normalAttackData) {
                for (var i = 0; i < 2; i++) {
                    var attackCard = cardLibrary.createCard('e001');
                    caster.hand.push(attackCard);
                }
                (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('火箭改装生效！获得2张监管者普攻！', 'enemy');
            }
        }
    };
    return RocketModificationCard;
}(Card));
export { RocketModificationCard };
// 以攻为守 - 从牌库中随机抽取一张牌到手牌
var AttackAsDefenseCard = /** @class */ (function (_super) {
    __extends(AttackAsDefenseCard, _super);
    function AttackAsDefenseCard(data) {
        var _this = _super.call(this, data) || this;
        _this.cost = data.cost || 1;
        return _this;
    }
    AttackAsDefenseCard.prototype.play = function (caster, target, context) {
        var _a;
        // 从牌库中随机抽取一张牌到手牌
        if (caster instanceof Player || caster instanceof Enemy) {
            caster.drawCards(1);
            (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u4EE5\u653B\u4E3A\u5B88\u751F\u6548\uFF01\u4ECE\u724C\u5E93\u4E2D\u62BD\u53D6\u4E861\u5F20\u724C\uFF01", caster instanceof Player ? 'player' : 'enemy');
        }
    };
    return AttackAsDefenseCard;
}(Card));
export { AttackAsDefenseCard };
//# sourceMappingURL=Card.js.map