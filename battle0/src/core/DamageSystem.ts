import { Character, Player, Enemy } from '../components/Character.js';

export type DamageType = 'normal' | 'piercing';
export interface Damage {
    amount: number;
    type: DamageType;
    source: Character;
}

export class DamageSystem {
    public static dealDamage(damage: Damage, target: Character): void {
        let finalAmount = damage.amount;

        // 源角色的伤害buff
        const damageBuff = damage.source.effects.getTotalValue('damage_buff');
        finalAmount += damageBuff;
        if (damageBuff > 0) {
            (window as any).battle?.ui.logAction(`伤害加成生效！额外+${damageBuff}伤害！`, damage.source instanceof Player ? 'player' : 'enemy');
        }

        // 添加求生者伤害加成
        if (damage.source instanceof Player) {
            const survivorBonus = damage.source.getSurvivorDamageBonus();
            finalAmount += survivorBonus;

            // 记者的第六感技能
            if (damage.source.survivor?.data.id === 'reporter' && target instanceof Player === false) {
                if ((target as any).currentHp < (target as any).maxHp * 0.3) {
                    finalAmount += 5;
                    (window as any).battle?.ui.logAction('记者的第六感发挥作用，伤害+5！', 'player');
                }
            }
        }

        // 伤害翻倍效果
        if (damage.source.effects.consume('damage_double')) {
            finalAmount *= 2;
            (window as any).battle?.ui.logAction(`${damage.source.name} 的伤害翻倍了！`, 'system');
        }

        // 下一张牌伤害增强效果
        const nextCardDamage = damage.source.effects.getTotalValue('next_card_damage');
        if (nextCardDamage > 0) {
            finalAmount += nextCardDamage;
            damage.source.effects.remove('next_card_damage');
            (window as any).battle?.ui.logAction(`下一张牌的伤害增强效果发挥作用，伤害+${nextCardDamage}！`, 'system');
        }

        // 求生者伤害减免
        let damageReduction = 0;
        if (target instanceof Player) {
            damageReduction = target.getSurvivorDamageReduction(finalAmount);
            finalAmount = Math.max(0, finalAmount - damageReduction);
        }

        // 护盾计算
        let damageToShield = 0;
        if (damage.type !== 'piercing') {
            damageToShield = Math.min(target.shield, finalAmount);
            target.shield -= damageToShield;
            finalAmount -= damageToShield;
        }

        const actualDamageDealt = finalAmount;

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
            } else if (damage.source instanceof Enemy) {
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
        
        console.log(`${damage.source.name} 对 ${target.name} 造成了 ${damage.amount} 点初始伤害, 最终对生命值造成 ${actualDamageDealt} 点伤害。`);
    }

    private static triggerSurvivorOnDamageEffects(player: Player, damageDealt: number): void {
        if (!player.survivor) return;

        const context = {
            player: player,
            enemy: (window as any).battle?.enemy,
            turn: (window as any).battle?.turn || 0
        };

        switch (player.survivor.data.id) {
            case 'doctor':
                // 医生：悲悯的救赎 - 对敌人造成伤害时，恢复等量生命值的50%
                const healAmount = Math.floor(damageDealt * 0.5);
                const newHp = Math.min(player.maxHp, player.currentHp + healAmount);
                const actualHeal = newHp - player.currentHp;
                if (actualHeal > 0) {
                    player.currentHp = newHp;
                    if (player.ui) {
                        player.ui.showFloatingText(`+${actualHeal}`, 'heal');
                    }
                    (window as any).battle?.ui.logAction(`医生的悲悯救赎发挥作用，恢复了${actualHeal}点生命！`, 'player');
                }
                break;

            case 'novelist':
                // 小说家：夜莺的祝福 - 对敌人造成伤害时，恢复1点生命值
                const novelistHeal = Math.min(1, player.maxHp - player.currentHp);
                if (novelistHeal > 0) {
                    player.currentHp += novelistHeal;
                    if (player.ui) {
                        player.ui.showFloatingText(`+${novelistHeal}`, 'heal');
                    }
                    (window as any).battle?.ui.logAction('小说家的夜莺祝福发挥作用，恢复了1点生命！', 'player');
                }
                break;

            case 'little_girl':
                // 小女孩：俄耳甫斯 - 对敌人造成伤害时，转化为对自己的护盾
                player.gainShield(damageDealt);
                (window as any).battle?.ui.logAction(`小女孩的神秘力量将${damageDealt}点伤害转化为护盾！`, 'player');
                break;
        }
    }

    private static triggerSurvivorOnTakeDamageEffects(player: Player, damageReceived: number): void {
        if (!player.survivor) return;

        switch (player.survivor.data.id) {
            case 'entomologist':
                // 昆虫学者：汲取 - 受到伤害时，有50%几率恢复2点生命值
                if (Math.random() < 0.5) {
                    const healAmount = 2;
                    const newHp = Math.min(player.maxHp, player.currentHp + healAmount);
                    const actualHeal = newHp - player.currentHp;
                    if (actualHeal > 0) {
                        player.currentHp = newHp;
                        if (player.ui) {
                            player.ui.showFloatingText(`+${actualHeal}`, 'heal');
                        }
                        (window as any).battle?.ui.logAction('昆虫学者的汲取能力发挥作用，恢复了生命！', 'player');
                    }
                }
                break;
        }
    }

    private static handleDamageReflection(victim: Character, attacker: Character, damageReceived: number): void {
        const reflectionEffects = victim.effects.getAllEffects().filter(effect => effect.type === 'damage_reflection');
        
        for (const effect of reflectionEffects) {
            // 检查是否还有反弹次数
            if (!effect.metadata?.reflectCount || effect.metadata.reflectCount > 0) {
                const reflectedDamage = Math.floor(damageReceived * effect.value);
                
                if (reflectedDamage > 0) {
                    // 对攻击者造成反弹伤害
                    attacker.takeDamage(reflectedDamage);
                    (window as any).battle?.ui.logAction(`和声共鸣生效！反弹了${reflectedDamage}点伤害给${attacker.name}！`, 'player');
                    
                    // 减少反弹次数
                    if (effect.metadata?.reflectCount) {
                        effect.metadata.reflectCount--;
                        (window as any).battle?.ui.logAction(`和声共鸣还能再反弹${effect.metadata.reflectCount}次伤害。`, 'system');
                        
                        // 如果次数用完，移除效果
                        if (effect.metadata.reflectCount <= 0) {
                            victim.effects.remove('damage_reflection');
                            (window as any).battle?.ui.logAction('和声共鸣效果已结束。', 'system');
                        }
                    }
                }
                break; // 只处理第一个反弹效果
            }
        }
    }

    // 新增：装备伤害减免效果
    private static applyEquipmentDamageReduction(player: Player, damage: number): number {
        let finalDamage = damage;
        
        player.equipment.forEach(eq => {
            // 统统加护：受到的所有伤害-1
            if (eq.name === '统统加护') {
                finalDamage = Math.max(0, finalDamage - 1);
                (window as any).battle?.ui.logAction('统统加护生效！伤害减少1点！', 'player');
            }
        });
        
        return finalDamage;
    }

    // 新增：装备造成伤害后效果
    private static triggerEquipmentOnDamageDealt(player: Player, damageDealt: number): void {
        const context = {
            player: player,
            enemy: (window as any).battle?.enemy,
            turn: (window as any).battle?.turn || 0
        };

        player.equipment.forEach(eq => {
            // 调用装备的onDamageDealt方法（新装备系统）
            if (typeof (eq as any).onDamageDealt === 'function') {
                (eq as any).onDamageDealt(damageDealt, context);
            }
            
            // 特殊装备效果处理
            switch (eq.name) {
                case '追击之刃':
                    // 每使用两次能造成伤害的牌对敌方造成1点伤害
                    if (!(eq as any).metadata) (eq as any).metadata = { damageCount: 0 };
                    (eq as any).metadata.damageCount = ((eq as any).metadata.damageCount || 0) + 1;
                    
                    if ((eq as any).metadata.damageCount >= 2) {
                        (eq as any).metadata.damageCount = 0;
                        const bonusDamage = { amount: 1, type: 'normal' as any, source: player };
                        this.dealDamage(bonusDamage, context.enemy);
                        (window as any).battle?.ui.logAction('追击之刃生效！造成额外1点伤害！', 'player');
                    }
                    break;
                    
                case '泣血之刃':
                    // 每造成6点伤害获得1点生命值
                    if (!(eq as any).metadata) (eq as any).metadata = { damageAccumulated: 0 };
                    (eq as any).metadata.damageAccumulated = ((eq as any).metadata.damageAccumulated || 0) + damageDealt;
                    
                    while ((eq as any).metadata.damageAccumulated >= 6) {
                        (eq as any).metadata.damageAccumulated -= 6;
                        const healAmount = 1;
                        context.player.currentHp = Math.min(context.player.maxHp, context.player.currentHp + healAmount);
                        if (context.player.ui) {
                            context.player.ui.showFloatingText(`+${healAmount}`, 'heal');
                        }
                        (window as any).battle?.ui.logAction('泣血之刃吸血效果触发，恢复1点生命！', 'player');
                    }
                    break;
            }
        });
    }

    // 新增：装备受到伤害后效果
    private static triggerEquipmentOnTakeDamage(player: Player, damageReceived: number): void {
        const context = {
            player: player,
            enemy: (window as any).battle?.enemy,
            turn: (window as any).battle?.turn || 0
        };

        player.equipment.forEach(eq => {
            // 调用装备的onTakeDamage方法
            if (typeof (eq as any).onTakeDamage === 'function') {
                (eq as any).onTakeDamage(damageReceived, context);
            }
        });
    }

    // 新增：敌人装备造成伤害后效果
    private static triggerEnemyEquipmentOnDamageDealt(enemy: Enemy, damageDealt: number): void {
        const context = {
            player: (window as any).battle?.player,
            enemy: enemy,
            turn: (window as any).battle?.turn || 0
        };

        if (enemy.equipment) {
            enemy.equipment.forEach((eq: any) => {
                // 调用装备的onDamageDealt方法
                if (typeof eq.onDamageDealt === 'function') {
                    eq.onDamageDealt(damageDealt, context);
                }
                
                // 特殊装备效果处理
                switch (eq.name) {
                    case '不稳定区域':
                        // 每对敌方造成4次伤害触发1次坍塌伤害（4点）
                        if (!eq.metadata) eq.metadata = { damageCount: 0 };
                        eq.metadata.damageCount = (eq.metadata.damageCount || 0) + 1;
                        
                        if (eq.metadata.damageCount >= 4) {
                            eq.metadata.damageCount = 0;
                            const collapseDamage = { amount: 4, type: 'normal' as any, source: enemy };
                            setTimeout(() => {
                                this.dealDamage(collapseDamage, context.player);
                                (window as any).battle?.ui.logAction('不稳定区域触发坍塌！造成4点伤害！', 'enemy');
                            }, 500);
                        }
                        break;
                }
            });
        }
    }
}