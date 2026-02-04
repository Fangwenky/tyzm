import { Player, Enemy, Character } from './Character.js';
import { DamageSystem, Damage } from '../core/DamageSystem.js';

export interface CardData {
    id: string;
    name: string;
    description: string;
    type: 'Normal' | 'Action' | 'Equipment' | 'Counter';
    targetType?: 'self' | 'enemy';
    damage?: number;
    cost?: number;
    image?: string; // 新增：卡牌图片路径
    effectData?: {
        bonusAttack?: number;
        shield?: number;
        draw?: number;
        discard?: number;
        weaken?: number;
        counterType?: 'attack' | 'damage' | 'any' | 'next';
        equipmentSlot?: 'weapon' | 'armor' | 'accessory';
        passiveEffect?: string;
        triggerCondition?: string;
        burnDuration?: number;
        burnDamage?: number;

        damageReduction?: number;
        copyTargets?: number;
        doubleEffect?: boolean;
        damageBonus?: number;
    };
    isRemovedOnPlay?: boolean;
    isPiercing?: boolean;
    requiresChoice?: boolean;
}

export interface BattleContext {
    player: Player;
    enemy: Enemy | Character; // 允许更灵活的enemy类型
    turn: number;
    chosenCard?: Card;     // 新增：用于存储玩家选择的卡牌
    awaitingCardChoice?: boolean;  // 新增：标记是否正在等待玩家选择卡牌
}

export abstract class Card {
    public id: string;
    public name: string;
    public description: string;
    public type: 'Normal' | 'Action' | 'Equipment' | 'Counter';
    public isRemovedOnPlay: boolean;
    public targetType: 'self' | 'enemy';
    public isPiercing: boolean;
    public requiresChoice: boolean;
    public data: CardData; // 新增：保存完整的卡牌数据

    constructor(data: CardData) {
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

    abstract play(caster: Character, target: Character, context?: BattleContext): void;
    
    public getBaseDamage(caster: Character): number {
        return 0;
    }

    // 新增：用于反制卡的方法
    public canCounter(playedCard: Card, context: BattleContext): boolean {
        return false;
    }

    // 新增：触发反制效果
    public triggerCounter(playedCard: Card, context: BattleContext): boolean {
        return false;
    }
}

export class NormalAttackCard extends Card {
    damage: number;
    constructor(data: CardData) {
        super(data);
        this.damage = data.damage || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        const damage: Damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        
        // 触发装备的普通攻击后效果（如恋战之斧）
        if (caster && (caster as any).equipment) {
            (caster as any).equipment.forEach((eq: any) => {
                if (typeof eq.onNormalAttackUsed === 'function') {
                    const attackContext = context || { player: caster, enemy: target, turn: 0 };
                    eq.onNormalAttackUsed(attackContext);
                }
            });
        }
    }
    public getBaseDamage(caster: Character): number {
        return this.damage;
    }
}

export class ActionCard extends Card {
    damage: number;
    cost: number; 
    constructor(data: CardData) {
        super(data);
        this.damage = data.damage || 0;
        this.cost = data.cost || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        const damage: Damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
    }
    public getBaseDamage(caster: Character): number {
        return this.damage;
    }
}

export class EquipmentCard extends Card {
    passiveEffect: { bonusAttack?: number; }
    constructor(data: CardData) {
        super(data);
        this.passiveEffect = data.effectData || {};
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        if (caster instanceof Player) {
            caster.equip(this);
        }
    }
}

export class EnduringGuardCard extends Card {
    cost: number;
    constructor(data: CardData) {
        super(data);
        this.cost = data.cost || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        target.gainShield(5);
    }
}

export class LethalStingCard extends Card {
    private damage: number;
    constructor(data: CardData) {
        super(data);
        this.damage = data.damage || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        const damage: Damage = { amount: this.damage, type: 'piercing', source: caster };
        DamageSystem.dealDamage(damage, target);
    }
    public getBaseDamage(caster: Character): number {
        return this.damage;
    }
}

export class DefensiveStanceCard extends Card {
    cost: number;
    constructor(data: CardData) {
        super(data);
        this.cost = data.cost || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        target.gainShield(6);
        if (target instanceof Player || target instanceof Enemy) {
            target.drawCards(1);
        }
    }
}

export class DesperateBlowCard extends Card {
    damage: number;
    constructor(data: CardData) { 
        super(data); 
        this.damage = data.damage || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        const damage: Damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        caster.takeDamage(1);
    }
    public getBaseDamage(caster: Character): number {
        return this.damage;
    }
}

export class FireAttackCard extends Card {
    damage: number;
    constructor(data: CardData) { 
        super(data); 
        this.damage = data.damage || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        const lostHp = caster.maxHp - caster.currentHp;
        const bonusDamage = Math.floor(lostHp / 5);
        const damage: Damage = { amount: this.damage + bonusDamage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
    }
    public getBaseDamage(caster: Character): number {
        const lostHp = caster.maxHp - caster.currentHp;
        const bonusDamage = Math.floor(lostHp / 5);
        return (this.damage || 0) + bonusDamage;
    }
}

export class SwiftAttackCard extends Card {
    damage: number;
    constructor(data: CardData) { 
        super(data); 
        this.damage = data.damage || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        const damage: Damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        if (caster instanceof Player || caster instanceof Enemy) caster.drawCards(1);
    }
    public getBaseDamage(caster: Character): number {
        return this.damage;
    }
}

export class DoubleTapCard extends Card {
    damage: number;
    constructor(data: CardData) { 
        super(data); 
        this.damage = data.damage || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        const damage: Damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        if (caster instanceof Player || caster instanceof Enemy) caster.drawCards(2);
    }
    public getBaseDamage(caster: Character): number {
        return this.damage;
    }
}

export class LeechingStrikeCard extends Card {
    damage: number;
    constructor(data: CardData) { 
        super(data); 
        this.damage = data.damage || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        const damage: Damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        caster.currentHp = Math.min(caster.maxHp, caster.currentHp + this.damage);
        if (caster.ui) caster.ui.showFloatingText(`+${this.damage}`, 'heal');
    }
    public getBaseDamage(caster: Character): number {
        return this.damage;
    }
}

export class MightyBlowCard extends Card {
    damage: number;
    constructor(data: CardData) { 
        super(data); 
        this.damage = data.damage || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        const damage: Damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
    }
    public getBaseDamage(caster: Character): number {
        return this.damage;
    }
}

export class SacredProtectionCard extends Card {
    cost: number;
    constructor(data: CardData) { super(data); this.cost = data.cost || 0; }
    play(caster: Character, target: Character, context?: BattleContext): void {
        target.gainShield(10);
    }
}

export class BuffNextCardAction extends Card {
    cost: number;
    constructor(data: CardData) {
        super(data);
        this.cost = data.cost || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        if (caster instanceof Player || caster instanceof Enemy) {
            caster.drawCards(1);
        }
        caster.effects.add({ type: 'damage_double', value: 1, duration: 2 });
    }
}

// 力量强化 - 本回合所有伤害+3
export class StrengthBoostCard extends Card {
    cost: number;
    constructor(data: CardData) {
        super(data);
        this.cost = data.cost || 1;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        // 添加本回合伤害加成效果
        caster.effects.add({ type: 'damage_buff', value: 3, duration: 1 });
        (window as any).battle?.ui.logAction(`力量强化生效！本回合所有伤害+3！`, caster instanceof Player ? 'player' : 'enemy');
    }
}

// 狂徒之攻 - 随机从牌堆获得2张攻击牌 
export class BerserkerAssaultCard extends Card {
    cost: number;
    constructor(data: CardData) {
        super(data);
        this.cost = data.cost || 1;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        // 抽取2张牌
        if (caster instanceof Player || caster instanceof Enemy) {
            caster.drawCards(2);
            (window as any).battle?.ui.logAction(`狂徒之攻生效！从牌堆抽取了2张牌！`, caster instanceof Player ? 'player' : 'enemy');
        }
    }
}

// 命中要害 - 造成3点伤害，敌方下回合抽牌-1
export class VitalStrikeCard extends Card {
    cost: number;
    damage: number;
    constructor(data: CardData) {
        super(data);
        this.cost = data.cost || 1;
        this.damage = data.damage || 3;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        // 造成伤害
        const damage: Damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        
        // 敌方下回合抽牌-1
        target.effects.add({ type: 'draw_penalty', value: 1, duration: 1 });
        (window as any).battle?.ui.logAction(`命中要害！${target.name}下回合抽牌-1！`, caster instanceof Player ? 'player' : 'enemy');
    }
    public getBaseDamage(caster: Character): number {
        return this.damage;
    }
}

export class CharcoalCard extends Card {
    damage: number;
    constructor(data: CardData) { 
        super(data); 
        this.damage = data.damage || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        const damage: Damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
    }
    public getBaseDamage(caster: Character): number {
        return this.damage;
    }
}

export class LifeGrowthCard extends Card {
    cost: number;
    constructor(data: CardData) { 
        super(data); 
        this.cost = data.cost || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        caster.maxHp += 5;
        caster.currentHp += 5;
        if (caster.ui) caster.ui.showFloatingText(`+5 HP`, 'heal');
    }
}

export class HeavyPunchCard extends Card {
    private damage: number;
    private cardsToGain: number;
    private gainCardId: string;
    constructor(data: CardData) {
        super(data);
        this.damage = data.damage || 0;
        this.cardsToGain = data.effectData?.draw || 1;
        this.gainCardId = (data.id.startsWith('e')) ? 'e001' : 'p001';
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        console.log(`[重拳出击] 开始执行，当前手牌数量: ${caster.hand.length}`);
        
        if (this.damage > 0) {
            const damage: Damage = { amount: this.damage, type: 'normal', source: caster };
            DamageSystem.dealDamage(damage, target);
        }
        
        const cardLibrary = (window as any).cardLibrary;
        console.log(`[重拳出击] cardLibrary 可用性:`, !!cardLibrary);
        
        if (cardLibrary) {
            console.log(`[重拳出击] 准备获得 ${this.cardsToGain} 张 ${this.gainCardId} 卡牌`);
            for (let i = 0; i < this.cardsToGain; i++) {
                const newCard = cardLibrary.createCard(this.gainCardId);
                console.log(`[重拳出击] 创建的新卡牌:`, newCard);
                if (newCard) {
                    caster.hand.push(newCard);
                    console.log(`[重拳出击] 已添加卡牌到手牌，现在手牌数量: ${caster.hand.length}`);
                } else {
                    console.error(`[重拳出击] 创建卡牌失败！`);
                }
            }
            (window as any).battle?.ui.logAction(`重拳出击生效！获得${this.cardsToGain}张普通攻击！`, 'player');
            // 立即更新UI以显示新卡牌
            if ((window as any).battle?.ui) {
                (window as any).battle.ui.updateAll(caster, context?.enemy || target);
            }
        } else {
            console.error(`[重拳出击] cardLibrary 不可用！`);
        }
    }
    public getBaseDamage(caster: Character): number { return this.damage; }
}

export class StrengthFromHealthCard extends Card {
    cost: number;
    private ratio: number;
    private maxDamage: number;
    constructor(data: CardData) {
        super(data);
        this.cost = data.cost || 0;
        this.ratio = data.id === 'p106' ? 0.3 : 0.2;
        this.maxDamage = data.id === 'e012' ? 15 : Infinity;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        const damageAmount = Math.min(Math.floor(caster.currentHp * this.ratio), this.maxDamage);
        const damage: Damage = { amount: damageAmount, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
    }
    public getBaseDamage(caster: Character): number {
        return Math.min(Math.floor(caster.currentHp * this.ratio), this.maxDamage);
    }
}

export class TenaciousGuardCard extends Card {
    cost: number;
    constructor(data: CardData) { super(data); this.cost = data.cost || 0; }
    play(caster: Character, target: Character, context?: BattleContext): void {
        target.gainShield(6);
        const discardedCount = target.hand.length;
        if (discardedCount > 0) {
            target.discardPile.push(...target.hand);
            target.hand = [];
            target.gainShield(discardedCount * 6);
        }
    }
}

export class AllOutAttackCard extends Card {
    cost: number;
    constructor(data: CardData) { super(data); this.cost = data.cost || 0; }
    play(caster: Character, target: Character, context?: BattleContext): void {
        const discardedCount = caster.hand.length;
        if (discardedCount > 0) {
            caster.discardPile.push(...caster.hand);
            caster.hand = [];
        }
        const totalDamage = 3 + (discardedCount * 3);
        const damage: Damage = { amount: totalDamage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
    }
    public getBaseDamage(caster: Character): number {
        return 3 + (caster.hand.length * 3);
    }
}

export class RapidPursuitCard extends Card {
    cost: number;
    constructor(data: CardData) { super(data); this.cost = data.cost || 0; }
    play(caster: Character, target: Character, context?: BattleContext): void {
        if ('actionPoints' in caster && (caster instanceof Player || caster instanceof Enemy)) {
            caster.actionPoints += 2;
            caster.drawCards(1);
        }
    }
}

export class ArmorlessPursuitCard extends Card {
    cost: number;
    constructor(data: CardData) { super(data); this.cost = data.cost || 0; }
    play(caster: Character, target: Character, context?: BattleContext): void {
        if (caster.hand.length > 0) {
            const discarded = caster.hand.pop();
            if (discarded) caster.discardPile.push(discarded);
            const damage: Damage = { amount: 11, type: 'normal', source: caster };
            DamageSystem.dealDamage(damage, target);
        }
    }
    public getBaseDamage(caster: Character): number {
        return caster.hand.length > 0 ? 11 : 0;
    }
}

export class SpecialActionCard extends Card {
    cost: number;
    damage: number;
    draw: number;
    weaken: number;
    constructor(data: CardData) {
        super(data);
        this.cost = data.cost || 0;
        this.damage = data.damage || 0;
        this.draw = data.effectData?.draw || 0;
        this.weaken = data.effectData?.weaken || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        if (this.draw > 0 && (caster instanceof Player || caster instanceof Enemy)) {
            caster.drawCards(this.draw);
        }
        if (this.damage > 0) {
            const damage: Damage = { amount: this.damage, type: 'normal', source: caster };
            DamageSystem.dealDamage(damage, target);
        }
        if (this.weaken > 0) {
            console.log(`${target.name} 被削弱了！`);
        }
    }
    public getBaseDamage(caster: Character): number { return this.damage; }
}

// =============== 新增反制卡基类 ===============
export abstract class CounterCard extends Card {
    protected counterType: 'attack' | 'damage' | 'any' | 'next';
    
    constructor(data: CardData) {
        super(data);
        this.counterType = data.effectData?.counterType || 'any';
        this.type = 'Counter';
    }

    play(caster: Character, target: Character, context?: BattleContext): void {
        // 反制卡通常在手牌中被动触发，不主动使用
        // 但也可以设置一些立即生效的反制状态
        this.applyCounterState(caster, target, context);
    }

    protected abstract applyCounterState(caster: Character, target: Character, context?: BattleContext): void;

    public canCounter(playedCard: Card, context: BattleContext): boolean {
        console.log(`[DEBUG] CounterCard.canCounter() - 检查 ${this.name} 是否可以反制 ${playedCard.name}`);
        (window as any).battle?.ui.logAction(`检查反制牌[${this.name}]是否可以反制[${playedCard.name}]...`, 'system');
        
        switch (this.counterType) {
            case 'attack':
                const isAttack = playedCard.type === 'Normal' || (playedCard.type === 'Action' && playedCard.getBaseDamage(context.enemy) > 0);
                console.log(`[DEBUG] 反制类型: attack, 卡牌类型: ${playedCard.type}, 基础伤害: ${playedCard.getBaseDamage(context.enemy)}, 结果: ${isAttack}`);
                (window as any).battle?.ui.logAction(`检查是否为攻击牌：${isAttack ? '是' : '否'}`, 'system');
                return isAttack;
            case 'damage':
                const hasDamage = playedCard.getBaseDamage(context.enemy) > 0;
                console.log(`[DEBUG] 反制类型: damage, 基础伤害: ${playedCard.getBaseDamage(context.enemy)}, 结果: ${hasDamage}`);
                (window as any).battle?.ui.logAction(`检查是否造成伤害：${hasDamage ? '是' : '否'}`, 'system');
                return hasDamage;
            case 'next':
                console.log(`[DEBUG] 反制类型: next, 可以反制任意下一张牌`);
                (window as any).battle?.ui.logAction(`可以反制任意下一张牌`, 'system');
                return true; // 可以反制下一张任意牌
            case 'any':
            default:
                console.log(`[DEBUG] 反制类型: any, 可以反制任意牌`);
                return true;
        }
    }
}

// =============== 新增装备卡扩展 ===============
export interface EquipmentEffect {
    type: 'passive' | 'trigger';
    trigger?: 'startTurn' | 'endTurn' | 'onDamage' | 'onHeal' | 'onCardPlay' | 'onEvade';
    effect: (context: BattleContext) => void;
    condition?: (context: BattleContext) => boolean;
}

export class EnhancedEquipmentCard extends Card {
    public equipmentSlot: 'weapon' | 'armor' | 'accessory';
    public effects: EquipmentEffect[];
    public isActive: boolean = false;

    constructor(data: CardData) {
        super(data);
        this.type = 'Equipment';
        this.equipmentSlot = data.effectData?.equipmentSlot || 'accessory';
        this.effects = [];
    }

    play(caster: Character, target: Character, context?: BattleContext): void {
        if (caster instanceof Player) {
            console.log(`[装备系统] 玩家装备: ${this.name}`);
            caster.equip(this);
            this.isActive = true;
            this.onEquip(caster, context);
        } else if (caster instanceof Enemy) {
            console.log(`[装备系统] 敌人装备: ${this.name}`);
            caster.equip(this);
            this.isActive = true;
            this.onEquip(caster, context);
        }
    }

    protected onEquip(wearer: Character, context?: BattleContext): void {
        // 装备时的初始化效果
    }

    public addEffect(effect: EquipmentEffect): void {
        this.effects.push(effect);
    }

    public triggerEffects(triggerType: string, context: BattleContext): void {
        if (!this.isActive) return;
        
        this.effects.forEach(effect => {
            if (effect.type === 'trigger' && effect.trigger === triggerType) {
                if (!effect.condition || effect.condition(context)) {
                    effect.effect(context);
                }
            }
        });
    }

    public getPassiveEffects(): EquipmentEffect[] {
        return this.effects.filter(e => e.type === 'passive');
    }
}

// =============== 特殊效果卡牌类 ===============

// 重创卡 - 移除，造成3点伤害，敌方失去所有行动点，每失去1点行动点伤害+3
export class CriticalStrikeCard extends Card {
    constructor(data: CardData) {
        super(data);
        this.isRemovedOnPlay = true;
    }
    
    play(caster: Character, target: Character, context?: BattleContext): void {
        const baseDamage = 3;
        let actionPointsLost = 0;
        
        if ('actionPoints' in target && (target instanceof Player || target instanceof Enemy)) {
            actionPointsLost = target.actionPoints;
            target.actionPoints = 0;
        }
        
        const totalDamage = baseDamage + (actionPointsLost * 3);
        const damage: Damage = { amount: totalDamage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        
        if (context) {
            (window as any).battle?.ui.logAction(`重创生效！敌方失去${actionPointsLost}点行动点，额外造成${actionPointsLost * 3}点伤害！`, 'player');
        }
    }
    
    public getBaseDamage(caster: Character): number {
        return 3; // 基础伤害，实际伤害会根据目标的行动点增加
    }
}

// 追加攻击卡 - 这张牌视为你使用的上一张攻击牌
export class FollowUpAttackCard extends Card {
    constructor(data: CardData) {
        super(data);
    }
    
    play(caster: Character, target: Character, context?: BattleContext): void {
        if (context && caster instanceof Player) {
            const lastPlayedCard = caster.lastPlayedCard;
            if (lastPlayedCard && (lastPlayedCard.type === 'Normal' || lastPlayedCard.getBaseDamage(caster) > 0)) {
                // 复制上一张攻击牌的效果
                lastPlayedCard.play(caster, target, context);
                (window as any).battle?.ui.logAction(`追加攻击生效！复制了上一张攻击牌的效果！`, 'player');
            } else {
                // 如果没有上一张攻击牌，则无法使用该牌
                (window as any).battle?.ui.logAction(`追加攻击无法使用！没有可复制的攻击牌！`, 'player');
                return;
            }
        }
    }
    
    public getBaseDamage(caster: Character): number {
        if (caster instanceof Player && caster.lastPlayedCard) {
            return caster.lastPlayedCard.getBaseDamage(caster);
        }
        return 3; // 默认基础伤害
    }
}

// 兵甲之刃卡 - 每装备了1件装备造成1次2点伤害  
export class WeaponMasteryCard extends Card {
    constructor(data: CardData) {
        super(data);
    }
    
    play(caster: Character, target: Character, context?: BattleContext): void {
        let equipmentCount = 0;
        
        if (caster instanceof Player) {
            equipmentCount = caster.equipment.length;
        }
        
        // 每个装备造成2点伤害
        for (let i = 0; i < equipmentCount; i++) {
            const damage: Damage = { amount: 2, type: 'normal', source: caster };
            DamageSystem.dealDamage(damage, target);
        }
        
        if (context && equipmentCount > 0) {
            (window as any).battle?.ui.logAction(`兵甲之刃生效！基于${equipmentCount}件装备造成了${equipmentCount * 2}点伤害！`, 'player');
        } else if (context) {
            (window as any).battle?.ui.logAction(`兵甲之刃无效果，你没有装备任何装备！`, 'player');
        }
    }
    
    public getBaseDamage(caster: Character): number {
        if (caster instanceof Player) {
            return caster.equipment.length * 2;
        }
        return 0;
    }
}

// 影影绰绰卡 - 选择手牌中的1张牌，将该牌的2张复制加入牌堆
export class ShadowCopyCard extends Card {
    cost: number;
    constructor(data: CardData) {
        super(data);
        this.cost = data.cost || 1;
        this.requiresChoice = true;
    }
    
    play(caster: Character, target: Character, context?: BattleContext): void {
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
            (window as any).battle?.ui.logAction(`没有可以复制的手牌！`, 'system');
            return;
        }
        
        console.log('[影影绰绰] 检查是否已选择卡牌:', context.chosenCard ? '是' : '否');
        console.log('[影影绰绰] 等待选择状态:', context.awaitingCardChoice ? '是' : '否');
        // 如果已经选择了卡牌，执行复制操作
        if (context.chosenCard) {
            console.log('[影影绰绰] 选中的卡牌:', context.chosenCard.name);
            const cardToCopy = context.chosenCard;
            
            console.log('[影影绰绰] 开始创建卡牌复制');
            // 创建2张复制到牌库
            for (let i = 0; i < 2; i++) {
                const copy = Object.create(Object.getPrototypeOf(cardToCopy));
                Object.assign(copy, cardToCopy);
                copy.name = cardToCopy.name + '（复制）';
                caster.deck.push(copy);
                console.log('[影影绰绰] 创建复制卡牌:', copy.name);
            }
            
            // 洗牌
            const originalDeckSize = caster.deck.length;
            caster.deck = caster.deck.sort(() => Math.random() - 0.5);
            console.log('[影影绰绰] 洗牌完成，牌库大小:', caster.deck.length, '(原大小:', originalDeckSize, ')');
            
            (window as any).battle?.ui.logAction(`影影绰绰生效！复制了2张【${cardToCopy.name}】到牌库中！`, 'player');
            console.log('[影影绰绰] 复制操作完成');
            return;
        }
        
        // 如果还没有选择卡牌，显示选择提示
        console.log('[影影绰绰] 等待玩家选择卡牌');
        (window as any).battle?.ui.logAction(`请选择一张手牌进行复制...`, 'system');
        context.awaitingCardChoice = true;
        console.log('[影影绰绰] 已设置等待选择状态');
    }
}

// =============== 反制卡具体实现 ===============

// 迎头痛击 - 敌方使用攻击牌时：将其无效，对敌方造成2伤害，抽1张牌
export class HeadlongStrikeCounter extends CounterCard {
    constructor(data: CardData) {
        super(data);
        this.counterType = 'attack';
    }
    
    protected applyCounterState(caster: Character, target: Character, context?: BattleContext): void {
        // 反制卡通常在手牌中被动触发，这里不需要特殊处理
    }
    
    public triggerCounter(playedCard: Card, context: BattleContext): boolean {
        console.log(`[DEBUG] HeadlongStrikeCounter.triggerCounter() 开始执行`);
        (window as any).battle?.ui.logAction(`触发[迎头痛击]的效果...`, 'system');
        
        // 无效化敌方攻击牌
        console.log(`[DEBUG] 准备造成2点反击伤害`);
        (window as any).battle?.ui.logAction(`准备对敌方造成2点反击伤害...`, 'system');
        const damage: Damage = { amount: 2, type: 'normal', source: context.player };
        DamageSystem.dealDamage(damage, context.enemy);
        console.log(`[DEBUG] 伤害已造成`);
        
        if (context.player instanceof Player) {
            console.log(`[DEBUG] 玩家抽取1张牌`);
            (window as any).battle?.ui.logAction(`玩家抽取1张牌...`, 'system');
            context.player.drawCards(1);
        }
        
        (window as any).battle?.ui.logAction(`迎头痛击发动！无效化了敌方的攻击，并造成2点反击伤害！`, 'player');
        console.log(`[DEBUG] HeadlongStrikeCounter.triggerCounter() 执行完成，返回 true`);
        return true; // 返回true表示成功反制
    }
}

// 伤害吸收 - 敌方使用能造成伤害的牌时，将其无效，抽1张牌
export class DamageAbsorptionCounter extends CounterCard {
    constructor(data: CardData) {
        super(data);
        this.counterType = 'damage';
    }
    
    protected applyCounterState(caster: Character, target: Character, context?: BattleContext): void {
        // 反制卡通常在手牌中被动触发
    }
    
    public triggerCounter(playedCard: Card, context: BattleContext): boolean {
        // 无效化敌方伤害牌
        if (context.player instanceof Player) {
            context.player.drawCards(1);
        }
        
        (window as any).battle?.ui.logAction(`伤害吸收发动！吸收了敌方的攻击，并抽取了1张牌！`, 'player');
        return true; // 返回true表示成功反制
    }
}

// 噩梦凝视 - 敌方使用的下一张牌失效
export class NightmareGazeCounter extends CounterCard {
    constructor(data: CardData) {
        super(data);
        this.counterType = 'next';
    }
    
    protected applyCounterState(caster: Character, target: Character, context?: BattleContext): void {
        // 为敌方添加下一张牌无效的状态
        if (target instanceof Enemy) {
            target.effects.add({ type: 'card_nullify', value: 1, duration: 2 });
        }
    }
    
    public triggerCounter(playedCard: Card, context: BattleContext): boolean {
        // 这张反制卡是预防性的，在play时就生效
        (window as any).battle?.ui.logAction(`噩梦凝视生效！敌方的下一张牌将无效化！`, 'player');
        return true;
    }
}

// 和声共鸣 - 敌方下回合前2次伤害将会被反弹一半
export class HarmoniousResonanceCounter extends CounterCard {
    constructor(data: CardData) {
        super(data);
        this.counterType = 'damage';
    }
    
    protected applyCounterState(caster: Character, target: Character, context?: BattleContext): void {
        // 为玩家添加伤害反弹状态
        caster.effects.add({ 
            type: 'damage_reflection', 
            value: 0.5, // 反弹50%伤害
            duration: 2,
            metadata: { reflectCount: 2 } // 只反弹前2次伤害
        });
    }
    
    public triggerCounter(playedCard: Card, context: BattleContext): boolean {
        this.applyCounterState(context.player, context.enemy, context);
        (window as any).battle?.ui.logAction(`和声共鸣发动！接下来2次受到的伤害将反弹一半给敌方！`, 'player');
        return false; // 这张牌不直接反制，而是设置状态
    }
}

// =============== 装备卡具体实现 ===============

// 盔甲护身 - 每回合开始时获得4点护盾
export class ArmorProtectionEquipment extends EnhancedEquipmentCard {
    constructor(data: CardData) {
        super(data);
        this.equipmentSlot = 'armor';
        
        this.addEffect({
            type: 'trigger',
            trigger: 'startTurn',
            effect: (context: BattleContext) => {
                context.player.gainShield(4);
                (window as any).battle?.ui.logAction('盔甲护身生效，获得4点护盾！', 'player');
            }
        });
    }
}

// 统统加护 - 受到的所有伤害-1
export class UniversalProtectionEquipment extends EnhancedEquipmentCard {
    constructor(data: CardData) {
        super(data);
        this.equipmentSlot = 'armor';
    }
    
    // 特殊方法：减少伤害
    public reduceDamage(damage: number): number {
        (window as any).battle?.ui.logAction('统统加护减少了1点伤害！', 'player');
        return Math.max(0, damage - 1);
    }
}

// 追击之刃 - 每使用两次能造成伤害的牌对敌方造成1点伤害
export class PursuitBladeEquipment extends EnhancedEquipmentCard {
    private damageCardCount: number = 0;
    
    constructor(data: CardData) {
        super(data);
        this.equipmentSlot = 'weapon';
    }
    
    public onDamageCardPlayed(context: BattleContext): void {
        this.damageCardCount++;
        if (this.damageCardCount >= 2) {
            const damage: Damage = { amount: 1, type: 'normal', source: context.player };
            DamageSystem.dealDamage(damage, context.enemy);
            this.damageCardCount = 0;
            (window as any).battle?.ui.logAction('追击之刃触发，造成额外1点伤害！', 'player');
        }
    }
}

// 重击之锤 - 每回合的第1张伤害牌伤害翻倍
export class HeavyStrikeHammerEquipment extends EnhancedEquipmentCard {
    public firstCardUsed: boolean = false;
    
    constructor(data: CardData) {
        super(data);
        this.equipmentSlot = 'weapon';
    }
    
    public onTurnStart(): void {
        this.firstCardUsed = false;
    }
    
    public checkFirstDamageCard(context: BattleContext): boolean {
        if (!this.firstCardUsed) {
            this.firstCardUsed = true;
            (window as any).battle?.ui.logAction('重击之锤生效！第一张伤害牌伤害翻倍！', 'player');
            return true;
        }
        return false;
    }
}

// 泣血之刃 - 每造成4点伤害获得1点生命值
export class BloodthirstyBladeEquipment extends EnhancedEquipmentCard {
    private damageAccumulated: number = 0;
    
    constructor(data: CardData) {
        super(data);
        this.equipmentSlot = 'weapon';
    }
    
    public onDamageDealt(damage: number, context: BattleContext): void {
        this.damageAccumulated += damage;
        while (this.damageAccumulated >= 6) {
            this.damageAccumulated -= 6;
            const healAmount = 1;
            context.player.currentHp = Math.min(context.player.maxHp, context.player.currentHp + healAmount);
            if (context.player.ui) {
                context.player.ui.showFloatingText(`+${healAmount}`, 'heal');
            }
            (window as any).battle?.ui.logAction('泣血之刃吸血效果触发，恢复1点生命！', 'player');
        }
    }
}

// 一念神魔 - 每回合结束时获得2点护盾，对敌方造成2点伤害
export class DualNatureEquipment extends EnhancedEquipmentCard {
    constructor(data: CardData) {
        super(data);
        this.equipmentSlot = 'accessory';
    }
    
    public onTurnEnd(context: BattleContext): void {
        context.player.gainShield(2);
        const damage: Damage = { amount: 2, type: 'normal', source: context.player };
        DamageSystem.dealDamage(damage, context.enemy);
        (window as any).battle?.ui.logAction('一念神魔生效！获得2点护盾并对敌方造成2点伤害！', 'player');
    }
}

// 恋战之斧 - 每次使用普通攻击后获得一张普通攻击(复制：该卡牌使用后将直接消失)
export class BattleAxeEquipment extends EnhancedEquipmentCard {
    constructor(data: CardData) {
        super(data);
        this.equipmentSlot = 'weapon';
    }
    
    public onNormalAttackUsed(context: BattleContext): void {
        // 这个方法不再需要，因为已经在BattleManager中统一处理了
        // 防止重复触发，这里只做日志记录
        console.log(`[DEBUG] BattleAxeEquipment.onNormalAttackUsed 被调用（已在BattleManager中处理）`);
    }
}

// =============== 监管者专属卡牌实现 ===============

// 蜘蛛 - 毒液
export class VenomCard extends Card {
    damage: number;
    constructor(data: CardData) { 
        super(data); 
        this.damage = data.damage || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        const damage: Damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        // 敌方下回合抽牌-1
        if (target instanceof Player) {
            target.effects.add({ type: 'draw_penalty', value: 1, duration: 1 });
            (window as any).battle?.ui.logAction(`毒液生效！${target.name}下回合抽牌-1！`, 'enemy');
        }
    }
    public getBaseDamage(caster: Character): number {
        return this.damage;
    }
}

// 蜘蛛 - 蛛网装备
export class SpiderWebEquipment extends EnhancedEquipmentCard {
    constructor(data: CardData) {
        super(data);
        this.equipmentSlot = 'accessory';
    }
    
    public onEnemyCardPlayed(context: BattleContext): void {
        // 对方每出1张牌受到1点伤害
        const damage: Damage = { amount: 1, type: 'normal', source: context.enemy };
        DamageSystem.dealDamage(damage, context.player);
        (window as any).battle?.ui.logAction('蛛网缠绕！你因出牌受到1点伤害！', 'enemy');
    }
}

// 愚人金 - 坍塌
export class CollapseCard extends Card {
    damage: number;
    constructor(data: CardData) { 
        super(data); 
        this.damage = data.damage || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        // 造成两次伤害
        const damage: Damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        setTimeout(() => {
            DamageSystem.dealDamage(damage, target);
            (window as any).battle?.ui.logAction('坍塌的第二波伤害到来！', 'enemy');
        }, 300);
    }
    public getBaseDamage(caster: Character): number {
        return (this.damage || 0) * 2;
    }
}

// 愚人金 - 不稳定区域装备
export class UnstableAreaEquipment extends EnhancedEquipmentCard {
    private damageCount: number = 0;
    
    constructor(data: CardData) {
        super(data);
        this.equipmentSlot = 'accessory';
    }
    
    public onDamageDealt(damage: number, context: BattleContext): void {
        this.damageCount++;
        if (this.damageCount >= 4) {
            this.damageCount = 0;
            const collapseDamage: Damage = { amount: 3, type: 'normal', source: context.enemy };
            setTimeout(() => {
                DamageSystem.dealDamage(collapseDamage, context.player);
                (window as any).battle?.ui.logAction('不稳定区域触发坍塌！造成3点伤害！', 'enemy');
            }, 500);
        }
    }
}

// 愚人金 - 重组装备
export class RecompositionEquipment extends EnhancedEquipmentCard {
    constructor(data: CardData) {
        super(data);
        this.equipmentSlot = 'accessory';
    }
    
    public onTurnStart(context: BattleContext): void {
        const healAmount = 3;
        context.enemy.currentHp = Math.min(context.enemy.maxHp, context.enemy.currentHp + healAmount);
        if (context.enemy.ui) {
            context.enemy.ui.showFloatingText(`+${healAmount}`, 'heal');
        }
        (window as any).battle?.ui.logAction('重组装备生效！恢复3点生命！', 'enemy');
    }
}

// 红夫人 - 水镜
export class WaterMirrorCard extends Card {
    damage: number;
    constructor(data: CardData) { 
        super(data); 
        this.damage = data.damage || 0;
    }
    play(caster: Character, target: Character, context?: BattleContext): void {
        const damage: Damage = { amount: this.damage, type: 'normal', source: caster };
        DamageSystem.dealDamage(damage, target);
        // 下一张牌伤害翻倍
        caster.effects.add({ type: 'damage_double', value: 1, duration: 2 });
        (window as any).battle?.ui.logAction('水镜生效！下一张牌伤害翻倍！', 'enemy');
    }
    public getBaseDamage(caster: Character): number {
        return this.damage;
    }
}

// 红夫人 - 矢车菊之殇装备
export class CornflowerSorrowEquipment extends EnhancedEquipmentCard {
    private cardsPlayedThisTurn: number = 0;
    
    constructor(data: CardData) {
        super(data);
        this.equipmentSlot = 'accessory';
    }
    
    public onTurnStart(): void {
        this.cardsPlayedThisTurn = 0;
    }
    
    public onCardPlayed(): void {
        this.cardsPlayedThisTurn++;
    }
    
    public onTurnEnd(context: BattleContext): void {
        if (this.cardsPlayedThisTurn < 5) {
            context.enemy.gainShield(4);
            (window as any).battle?.ui.logAction('矢车菊之殇：出牌少于5张，获得4点护盾！', 'enemy');
        } else {
            const damage: Damage = { amount: 4, type: 'normal', source: context.enemy };
            DamageSystem.dealDamage(damage, context.player);
            (window as any).battle?.ui.logAction('矢车菊之殇：出牌大于等于5张，对敌方造成4点伤害！', 'enemy');
        }
    }
}

// 噩梦 - 滋长装备
export class GrowthEquipment extends EnhancedEquipmentCard {
    constructor(data: CardData) {
        super(data);
        this.equipmentSlot = 'accessory';
    }
    
    public onTurnEnd(context: BattleContext): void {
        console.log(`[滋长装备] onTurnEnd 被调用`);
        const lostHp = context.enemy.maxHp - context.enemy.currentHp;
        const healAmount = Math.floor(lostHp * 0.12);
        console.log(`[滋长装备] 最大生命: ${context.enemy.maxHp}, 当前生命: ${context.enemy.currentHp}, 损失生命: ${lostHp}, 计算回复量: ${healAmount}`);
        
        if (healAmount > 0) {
            const oldHp = context.enemy.currentHp;
            context.enemy.currentHp = Math.min(context.enemy.maxHp, context.enemy.currentHp + healAmount);
            const actualHeal = context.enemy.currentHp - oldHp;
            console.log(`[滋长装备] 实际回复: ${actualHeal}点生命`);
            
            if (context.enemy.ui) {
                context.enemy.ui.showFloatingText(`+${actualHeal}`, 'heal');
            }
            (window as any).battle?.ui.logAction(`滋长生效！恢复${actualHeal}点生命（损失生命的12%）！`, 'enemy');
        } else {
            console.log(`[滋长装备] 无需回复生命（已满血或损失过少）`);
        }
    }
}

// 噩梦 - 梦魇装备 
export class NightmareEquipment extends EnhancedEquipmentCard {
    private turnCounter: number = 0;
    
    constructor(data: CardData) {
        super(data);
        this.equipmentSlot = 'accessory';
    }
    
    public onTurnEnd(context: BattleContext): void {
        this.turnCounter++;
        console.log(`[梦魇装备] onTurnEnd 被调用，当前计数: ${this.turnCounter}/8`);
        
        if (this.turnCounter >= 8) {
            this.turnCounter = 0;
            const lostHp = context.enemy.maxHp - context.enemy.currentHp;
            const healAmount = Math.floor(lostHp * 0.3);
            console.log(`[梦魇装备] 8回合到达！最大生命: ${context.enemy.maxHp}, 当前生命: ${context.enemy.currentHp}, 损失生命: ${lostHp}, 计算回复量: ${healAmount}`);
            
            if (healAmount > 0) {
                const oldHp = context.enemy.currentHp;
                context.enemy.currentHp = Math.min(context.enemy.maxHp, context.enemy.currentHp + healAmount);
                const actualHeal = context.enemy.currentHp - oldHp;
                console.log(`[梦魇装备] 实际回复: ${actualHeal}点生命`);
                
                if (context.enemy.ui) {
                    context.enemy.ui.showFloatingText(`+${actualHeal}`, 'heal');
                }
                (window as any).battle?.ui.logAction(`梦魇苏醒！恢复${actualHeal}点生命（损失生命的30%）！`, 'enemy');
            } else {
                console.log(`[梦魇装备] 无需回复生命（已满血或损失过少）`);
            }
        }
    }
}

// 火箭礼花 - 普通攻击伤害+2
export class RocketFireworksEquipment extends EnhancedEquipmentCard {
    constructor(data: CardData) {
        super(data);
        this.equipmentSlot = 'weapon';
    }
    
    public modifyDamage(damage: number, card: Card, context: BattleContext): number {
        // 如果是普通攻击卡，增加2点伤害
        if (card.name === '监管者普攻' || card.name === '普通攻击') {
            (window as any).battle?.ui.logAction('火箭礼花生效！普通攻击伤害+2！', 'enemy');
            return damage + 2;
        }
        return damage;
    }
}

// 火箭改装 - 获得2张[监管者普攻]
export class RocketModificationCard extends Card {
    cost: number;
    constructor(data: CardData) {
        super(data);
        this.cost = data.cost || 1;
    }
    
    play(caster: Character, target: Character, context?: BattleContext): void {
        // 获得2张监管者普攻
        if (caster instanceof Enemy) {
            const cardLibrary = (window as any).cardLibrary;
            const normalAttackData = cardLibrary?.getCardData('e001');
            if (normalAttackData) {
                for (let i = 0; i < 2; i++) {
                    const attackCard = cardLibrary.createCard('e001');
                    caster.hand.push(attackCard);
                }
                (window as any).battle?.ui.logAction('火箭改装生效！获得2张监管者普攻！', 'enemy');
            }
        }
    }
}

// 以攻为守 - 从牌库中随机抽取一张牌到手牌
export class AttackAsDefenseCard extends Card {
    cost: number;
    constructor(data: CardData) {
        super(data);
        this.cost = data.cost || 1;
    }
    
    play(caster: Character, target: Character, context?: BattleContext): void {
        // 从牌库中随机抽取一张牌到手牌
        if (caster instanceof Player || caster instanceof Enemy) {
            caster.drawCards(1);
            (window as any).battle?.ui.logAction(`以攻为守生效！从牌库中抽取了1张牌！`, caster instanceof Player ? 'player' : 'enemy');
        }
    }
}