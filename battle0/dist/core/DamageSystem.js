import { Player, Enemy } from '../components/Character.js';
var DamageSystem = /** @class */ (function () {
    function DamageSystem() {
    }
    DamageSystem.dealDamage = function (damage, target) {
        var _a, _b, _c, _d, _e;
        var finalAmount = damage.amount;
        // 源角色的伤害buff
        var damageBuff = damage.source.effects.getTotalValue('damage_buff');
        finalAmount += damageBuff;
        if (damageBuff > 0) {
            (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u4F24\u5BB3\u52A0\u6210\u751F\u6548\uFF01\u989D\u5916+".concat(damageBuff, "\u4F24\u5BB3\uFF01"), damage.source instanceof Player ? 'player' : 'enemy');
        }
        // 添加求生者伤害加成
        if (damage.source instanceof Player) {
            var survivorBonus = damage.source.getSurvivorDamageBonus();
            finalAmount += survivorBonus;
            // 记者的第六感技能
            if (((_b = damage.source.survivor) === null || _b === void 0 ? void 0 : _b.data.id) === 'reporter' && target instanceof Player === false) {
                if (target.currentHp < target.maxHp * 0.3) {
                    finalAmount += 5;
                    (_c = window.battle) === null || _c === void 0 ? void 0 : _c.ui.logAction('记者的第六感发挥作用，伤害+5！', 'player');
                }
            }
        }
        // 伤害翻倍效果
        if (damage.source.effects.consume('damage_double')) {
            finalAmount *= 2;
            (_d = window.battle) === null || _d === void 0 ? void 0 : _d.ui.logAction("".concat(damage.source.name, " \u7684\u4F24\u5BB3\u7FFB\u500D\u4E86\uFF01"), 'system');
        }
        // 下一张牌伤害增强效果
        var nextCardDamage = damage.source.effects.getTotalValue('next_card_damage');
        if (nextCardDamage > 0) {
            finalAmount += nextCardDamage;
            damage.source.effects.remove('next_card_damage');
            (_e = window.battle) === null || _e === void 0 ? void 0 : _e.ui.logAction("\u4E0B\u4E00\u5F20\u724C\u7684\u4F24\u5BB3\u589E\u5F3A\u6548\u679C\u53D1\u6325\u4F5C\u7528\uFF0C\u4F24\u5BB3+".concat(nextCardDamage, "\uFF01"), 'system');
        }
        // 求生者伤害减免
        var damageReduction = 0;
        if (target instanceof Player) {
            damageReduction = target.getSurvivorDamageReduction(finalAmount);
            finalAmount = Math.max(0, finalAmount - damageReduction);
        }
        // 护盾计算
        var damageToShield = 0;
        if (damage.type !== 'piercing') {
            damageToShield = Math.min(target.shield, finalAmount);
            target.shield -= damageToShield;
            finalAmount -= damageToShield;
        }
        var actualDamageDealt = finalAmount;
        // 在扣血前，先检查装备的伤害减免效果
        if (target instanceof Player) {
            // 触发装备的受伤前效果（如统统加护的伤害减免）
            finalAmount = this.applyEquipmentDamageReduction(target, finalAmount);
        }
        // 造成伤害
        if (finalAmount > 0) {
            target.takeDamage(finalAmount);
            // 处理伤害反弹效果
            this.handleDamageReflection(target, damage.source, finalAmount);
        }
        // 触发装备的造成伤害后效果
        if (actualDamageDealt > 0) {
            if (damage.source instanceof Player) {
                this.triggerEquipmentOnDamageDealt(damage.source, actualDamageDealt);
            }
            else if (damage.source instanceof Enemy) {
                // 触发敌人装备的造成伤害后效果
                this.triggerEnemyEquipmentOnDamageDealt(damage.source, actualDamageDealt);
            }
        }
        // 触发装备的受到伤害后效果
        if (actualDamageDealt > 0 && target instanceof Player) {
            this.triggerEquipmentOnTakeDamage(target, actualDamageDealt);
        }
        // 触发求生者伤害后效果
        if (actualDamageDealt > 0 && damage.source instanceof Player) {
            this.triggerSurvivorOnDamageEffects(damage.source, actualDamageDealt);
        }
        if (actualDamageDealt > 0 && target instanceof Player) {
            this.triggerSurvivorOnTakeDamageEffects(target, actualDamageDealt);
        }
        console.log("".concat(damage.source.name, " \u5BF9 ").concat(target.name, " \u9020\u6210\u4E86 ").concat(damage.amount, " \u70B9\u521D\u59CB\u4F24\u5BB3, \u6700\u7EC8\u5BF9\u751F\u547D\u503C\u9020\u6210 ").concat(actualDamageDealt, " \u70B9\u4F24\u5BB3\u3002"));
    };
    DamageSystem.triggerSurvivorOnDamageEffects = function (player, damageDealt) {
        var _a, _b, _c, _d, _e;
        if (!player.survivor)
            return;
        var context = {
            player: player,
            enemy: (_a = window.battle) === null || _a === void 0 ? void 0 : _a.enemy,
            turn: ((_b = window.battle) === null || _b === void 0 ? void 0 : _b.turn) || 0
        };
        switch (player.survivor.data.id) {
            case 'doctor':
                // 医生：悲悯的救赎 - 对敌人造成伤害时，恢复等量生命值的50%
                var healAmount = Math.floor(damageDealt * 0.5);
                var newHp = Math.min(player.maxHp, player.currentHp + healAmount);
                var actualHeal = newHp - player.currentHp;
                if (actualHeal > 0) {
                    player.currentHp = newHp;
                    if (player.ui) {
                        player.ui.showFloatingText("+".concat(actualHeal), 'heal');
                    }
                    (_c = window.battle) === null || _c === void 0 ? void 0 : _c.ui.logAction("\u533B\u751F\u7684\u60B2\u60AF\u6551\u8D4E\u53D1\u6325\u4F5C\u7528\uFF0C\u6062\u590D\u4E86".concat(actualHeal, "\u70B9\u751F\u547D\uFF01"), 'player');
                }
                break;
            case 'novelist':
                // 小说家：夜莺的祝福 - 对敌人造成伤害时，恢复1点生命值
                var novelistHeal = Math.min(1, player.maxHp - player.currentHp);
                if (novelistHeal > 0) {
                    player.currentHp += novelistHeal;
                    if (player.ui) {
                        player.ui.showFloatingText("+".concat(novelistHeal), 'heal');
                    }
                    (_d = window.battle) === null || _d === void 0 ? void 0 : _d.ui.logAction('小说家的夜莺祝福发挥作用，恢复了1点生命！', 'player');
                }
                break;
            case 'little_girl':
                // 小女孩：俄耳甫斯 - 对敌人造成伤害时，转化为对自己的护盾
                player.gainShield(damageDealt);
                (_e = window.battle) === null || _e === void 0 ? void 0 : _e.ui.logAction("\u5C0F\u5973\u5B69\u7684\u795E\u79D8\u529B\u91CF\u5C06".concat(damageDealt, "\u70B9\u4F24\u5BB3\u8F6C\u5316\u4E3A\u62A4\u76FE\uFF01"), 'player');
                break;
        }
    };
    DamageSystem.triggerSurvivorOnTakeDamageEffects = function (player, damageReceived) {
        var _a;
        if (!player.survivor)
            return;
        switch (player.survivor.data.id) {
            case 'entomologist':
                // 昆虫学者：汲取 - 受到伤害时，有50%几率恢复2点生命值
                if (Math.random() < 0.5) {
                    var healAmount = 2;
                    var newHp = Math.min(player.maxHp, player.currentHp + healAmount);
                    var actualHeal = newHp - player.currentHp;
                    if (actualHeal > 0) {
                        player.currentHp = newHp;
                        if (player.ui) {
                            player.ui.showFloatingText("+".concat(actualHeal), 'heal');
                        }
                        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('昆虫学者的汲取能力发挥作用，恢复了生命！', 'player');
                    }
                }
                break;
        }
    };
    DamageSystem.handleDamageReflection = function (victim, attacker, damageReceived) {
        var _a, _b, _c, _d, _e;
        var reflectionEffects = victim.effects.getAllEffects().filter(function (effect) { return effect.type === 'damage_reflection'; });
        for (var _i = 0, reflectionEffects_1 = reflectionEffects; _i < reflectionEffects_1.length; _i++) {
            var effect = reflectionEffects_1[_i];
            // 检查是否还有反弹次数
            if (!((_a = effect.metadata) === null || _a === void 0 ? void 0 : _a.reflectCount) || effect.metadata.reflectCount > 0) {
                var reflectedDamage = Math.floor(damageReceived * effect.value);
                if (reflectedDamage > 0) {
                    // 对攻击者造成反弹伤害
                    attacker.takeDamage(reflectedDamage);
                    (_b = window.battle) === null || _b === void 0 ? void 0 : _b.ui.logAction("\u548C\u58F0\u5171\u9E23\u751F\u6548\uFF01\u53CD\u5F39\u4E86".concat(reflectedDamage, "\u70B9\u4F24\u5BB3\u7ED9").concat(attacker.name, "\uFF01"), 'player');
                    // 减少反弹次数
                    if ((_c = effect.metadata) === null || _c === void 0 ? void 0 : _c.reflectCount) {
                        effect.metadata.reflectCount--;
                        (_d = window.battle) === null || _d === void 0 ? void 0 : _d.ui.logAction("\u548C\u58F0\u5171\u9E23\u8FD8\u80FD\u518D\u53CD\u5F39".concat(effect.metadata.reflectCount, "\u6B21\u4F24\u5BB3\u3002"), 'system');
                        // 如果次数用完，移除效果
                        if (effect.metadata.reflectCount <= 0) {
                            victim.effects.remove('damage_reflection');
                            (_e = window.battle) === null || _e === void 0 ? void 0 : _e.ui.logAction('和声共鸣效果已结束。', 'system');
                        }
                    }
                }
                break; // 只处理第一个反弹效果
            }
        }
    };
    // 新增：装备伤害减免效果
    DamageSystem.applyEquipmentDamageReduction = function (player, damage) {
        var finalDamage = damage;
        player.equipment.forEach(function (eq) {
            var _a;
            // 统统加护：受到的所有伤害-1
            if (eq.name === '统统加护') {
                finalDamage = Math.max(0, finalDamage - 1);
                (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('统统加护生效！伤害减少1点！', 'player');
            }
        });
        return finalDamage;
    };
    // 新增：装备造成伤害后效果
    DamageSystem.triggerEquipmentOnDamageDealt = function (player, damageDealt) {
        var _this = this;
        var _a, _b;
        var context = {
            player: player,
            enemy: (_a = window.battle) === null || _a === void 0 ? void 0 : _a.enemy,
            turn: ((_b = window.battle) === null || _b === void 0 ? void 0 : _b.turn) || 0
        };
        player.equipment.forEach(function (eq) {
            var _a, _b;
            // 调用装备的onDamageDealt方法（新装备系统）
            if (typeof eq.onDamageDealt === 'function') {
                eq.onDamageDealt(damageDealt, context);
            }
            // 特殊装备效果处理
            switch (eq.name) {
                case '追击之刃':
                    // 每使用两次能造成伤害的牌对敌方造成1点伤害
                    if (!eq.metadata)
                        eq.metadata = { damageCount: 0 };
                    eq.metadata.damageCount = (eq.metadata.damageCount || 0) + 1;
                    if (eq.metadata.damageCount >= 2) {
                        eq.metadata.damageCount = 0;
                        var bonusDamage = { amount: 1, type: 'normal', source: player };
                        _this.dealDamage(bonusDamage, context.enemy);
                        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('追击之刃生效！造成额外1点伤害！', 'player');
                    }
                    break;
                case '泣血之刃':
                    // 每造成6点伤害获得1点生命值
                    if (!eq.metadata)
                        eq.metadata = { damageAccumulated: 0 };
                    eq.metadata.damageAccumulated = (eq.metadata.damageAccumulated || 0) + damageDealt;
                    while (eq.metadata.damageAccumulated >= 6) {
                        eq.metadata.damageAccumulated -= 6;
                        var healAmount = 1;
                        context.player.currentHp = Math.min(context.player.maxHp, context.player.currentHp + healAmount);
                        if (context.player.ui) {
                            context.player.ui.showFloatingText("+".concat(healAmount), 'heal');
                        }
                        (_b = window.battle) === null || _b === void 0 ? void 0 : _b.ui.logAction('泣血之刃吸血效果触发，恢复1点生命！', 'player');
                    }
                    break;
            }
        });
    };
    // 新增：装备受到伤害后效果
    DamageSystem.triggerEquipmentOnTakeDamage = function (player, damageReceived) {
        var _a, _b;
        var context = {
            player: player,
            enemy: (_a = window.battle) === null || _a === void 0 ? void 0 : _a.enemy,
            turn: ((_b = window.battle) === null || _b === void 0 ? void 0 : _b.turn) || 0
        };
        player.equipment.forEach(function (eq) {
            // 调用装备的onTakeDamage方法
            if (typeof eq.onTakeDamage === 'function') {
                eq.onTakeDamage(damageReceived, context);
            }
        });
    };
    // 新增：敌人装备造成伤害后效果
    DamageSystem.triggerEnemyEquipmentOnDamageDealt = function (enemy, damageDealt) {
        var _this = this;
        var _a, _b;
        var context = {
            player: (_a = window.battle) === null || _a === void 0 ? void 0 : _a.player,
            enemy: enemy,
            turn: ((_b = window.battle) === null || _b === void 0 ? void 0 : _b.turn) || 0
        };
        if (enemy.equipment) {
            enemy.equipment.forEach(function (eq) {
                // 调用装备的onDamageDealt方法
                if (typeof eq.onDamageDealt === 'function') {
                    eq.onDamageDealt(damageDealt, context);
                }
                // 特殊装备效果处理
                switch (eq.name) {
                    case '不稳定区域':
                        // 每对敌方造成4次伤害触发1次坍塌伤害（4点）
                        if (!eq.metadata)
                            eq.metadata = { damageCount: 0 };
                        eq.metadata.damageCount = (eq.metadata.damageCount || 0) + 1;
                        if (eq.metadata.damageCount >= 4) {
                            eq.metadata.damageCount = 0;
                            var collapseDamage_1 = { amount: 4, type: 'normal', source: enemy };
                            setTimeout(function () {
                                var _a;
                                _this.dealDamage(collapseDamage_1, context.player);
                                (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('不稳定区域触发坍塌！造成4点伤害！', 'enemy');
                            }, 500);
                        }
                        break;
                }
            });
        }
    };
    return DamageSystem;
}());
export { DamageSystem };
//# sourceMappingURL=DamageSystem.js.map