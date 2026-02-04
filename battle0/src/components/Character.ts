import { Card, EquipmentCard, ActionCard, CounterCard, EnhancedEquipmentCard } from './Card.js';
import { Follower } from './Follower.js';
import { BattleUI } from '../core/BattleUI.js';
import { EffectManager } from './Effects.js';
import { Survivor } from './Survivor.js';
import { shuffle } from '../utils/shuffle.js';

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export abstract class Character {
    name: string;
    maxHp: number;
    currentHp: number;
    public shield: number = 0;
    deck: Card[] = [];      
    hand: Card[] = [];      
    discardPile: Card[] = [];
    ui?: { showFloatingText: (text: string, type: 'damage' | 'heal') => void };
    public effects: EffectManager;
    public lastPlayedCard?: Card; // 追踪上一张打出的牌
    public counterCards: CounterCard[] = []; // 手牌中的反制卡

    public statusEffects: Map<string, any> = new Map(); // 复杂状态效果

    constructor(name: string, hp: number) {
        this.name = name;
        this.maxHp = hp;
        this.currentHp = hp;
        this.effects = new EffectManager();
    }

    takeDamage(amount: number): void {
        // takeDamage 现在只负责扣血和动画，计算在DamageSystem中
        this.currentHp -= amount;
        if (this.currentHp < 0) this.currentHp = 0;
        if (this.ui) {
            this.ui.showFloatingText(`-${amount}`, 'damage');
        }
    }
    
    public gainShield(amount: number): void {
        this.shield += amount;
        if (this.ui) {
            this.ui.showFloatingText(`+${amount}`, 'heal');
        }
    }



    // 新增：应用燃烧伤害
    public applyBurnDamage(): void {
        if (this.statusEffects.has('burn')) {
            const burnEffect = this.statusEffects.get('burn');
            this.takeDamage(burnEffect.damage);
            burnEffect.duration--;
            
            if (burnEffect.duration <= 0) {
                this.statusEffects.delete('burn');
                (window as any).battle?.ui.logAction(`${this.name} 的燃烧效果消失了。`, 'system');
            } else {
                (window as any).battle?.ui.logAction(`${this.name} 受到燃烧伤害${burnEffect.damage}点！`, 'system');
            }
        }
    }

    // 新增：添加状态效果
    public addStatusEffect(type: string, effect: any): void {
        this.statusEffects.set(type, effect);
    }

    protected _drawOneCard(): Card | null {
        if (this.deck.length === 0) {
            if (this.discardPile.length > 0) {
                console.log(`[抽牌] ${this.name} 牌堆已空，将弃牌堆（${this.discardPile.length}张）洗回牌堆`);
                this.deck = [...this.discardPile];
                this.discardPile = [];
                shuffle(this.deck);
            } else {
                console.log(`[抽牌] ${this.name} 牌堆和弃牌堆都为空，无法抽牌`);
                return null;
            }
        }

        const card = this.deck.pop();
        if (card) {
            this.hand.push(card);
            // 检查是否为反制卡
            if (card instanceof CounterCard) {
                this.counterCards.push(card);
                console.log(`[抽牌] ${this.name} 抽到反制卡 ${card.name}`);
            }
            return card;
        }
        return null;
    }

    public drawCards(amount: number): void {
        console.log(`[抽牌] ${this.name} 准备抽取 ${amount} 张牌`, {
            '当前手牌数': this.hand.length,
            '牌堆剩余': this.deck.length,
            '弃牌堆': this.discardPile.length
        });

        for (let i = 0; i < amount; i++) {
            const card = this._drawOneCard();
            if (!card) {
                console.log(`[抽牌] ${this.name} 无法继续抽牌，牌堆已空`);
                break;
            }
            console.log(`[抽牌] ${this.name} 抽到了 ${card.name}`);
        }

        console.log(`[抽牌] ${this.name} 抽牌完成`, {
            '现有手牌数': this.hand.length,
            '牌堆剩余': this.deck.length,
            '弃牌堆': this.discardPile.length
        });
    }

    public onTurnEnd(): void {
        this.effects.tick();
        this.applyBurnDamage(); // 回合结束时应用燃烧伤害
        
        // 处理装备的回合结束效果
        if (this instanceof Player) {
            this.equipment.forEach(eq => {
                if (eq instanceof EnhancedEquipmentCard) {
                    eq.triggerEffects('endTurn', { player: this, enemy: this, turn: 0 });
                }
            });
        }
    }

    // 新增：尝试反制敌方的牌
    public async tryCounter(playedCard: Card, context: any): Promise<boolean> {
        console.log(`[DEBUG] ${this.name}.tryCounter() 开始执行, 目标卡牌: ${playedCard.name}`);
        (window as any).battle?.ui.logAction(`${this.name}检查是否有可用的反制牌...`, 'system');
        
        if (this.counterCards.length === 0) {
            console.log(`[DEBUG] ${this.name} 没有反制牌`);
            (window as any).battle?.ui.logAction(`没有反制牌可用`, 'system');
            return false;
        }
        
        console.log(`[DEBUG] ${this.name} 有 ${this.counterCards.length} 张反制牌`);
        
        for (let i = 0; i < this.counterCards.length; i++) {
            const counterCard = this.counterCards[i];
            console.log(`[DEBUG] 检查第 ${i} 张反制牌: ${counterCard.name}`);
            (window as any).battle?.ui.logAction(`检查反制牌[${counterCard.name}]...`, 'system');
            
            if (counterCard.canCounter(playedCard, context)) {
                console.log(`[DEBUG] ${counterCard.name} 可以反制 ${playedCard.name}！`);
                (window as any).battle?.ui.logAction(`[${counterCard.name}]可以反制[${playedCard.name}]！`, 'system');
                
                // 移除反制卡
                const handIndex = this.hand.indexOf(counterCard);
                console.log(`[DEBUG] 反制卡在手牌中的索引: ${handIndex}`);
                
                if (handIndex > -1) {
                    console.log(`[DEBUG] 开始播放反制动画...`);
                    // 先播放反制动画
                    await new Promise<void>((resolve) => {
                        if ((window as any).battle?.ui) {
                            console.log(`[DEBUG] 调用 playCounterCardAnimation`);
                            (window as any).battle.ui.playCounterCardAnimation(handIndex, () => {
                                console.log(`[DEBUG] 反制动画回调函数执行`);
                                this.hand.splice(handIndex, 1);
                                this.counterCards.splice(i, 1);
                                this.discardPile.push(counterCard);
                                console.log(`[DEBUG] 反制卡已移除并放入弃牌堆`);
                                resolve();
                            });
                        } else {
                            console.log(`[DEBUG] battle.ui 不存在，直接resolve`);
                            resolve();
                        }
                    });
                    
                    console.log(`[DEBUG] 反制动画完成，准备触发反制效果`);
                    (window as any).battle?.ui.logAction(`准备触发反制效果...`, 'system');
                    
                    // 触发反制效果
                    const result = counterCard.triggerCounter(playedCard, context);
                    console.log(`[DEBUG] 反制效果触发结果: ${result}`);
                    return result;
                } else {
                    console.log(`[DEBUG] 反制卡不在手牌中！`);
                }
            } else {
                console.log(`[DEBUG] ${counterCard.name} 不能反制 ${playedCard.name}`);
                (window as any).battle?.ui.logAction(`[${counterCard.name}]不能反制[${playedCard.name}]`, 'system');
            }
        }
        
        console.log(`[DEBUG] ${this.name}.tryCounter() 执行完成，返回 false`);
        return false;
    }
}

export class Player extends Character {
    actionPoints: number = 3; 
    maxActionPoints: number = 3; 
    equipment: (EquipmentCard | EnhancedEquipmentCard)[] = [];
    public followers: Follower[] = [];
    public survivor?: Survivor;
    public equipmentSlots: {
        weapon?: EnhancedEquipmentCard;
        armor?: EnhancedEquipmentCard;
        accessory?: EnhancedEquipmentCard;
    } = {};

    attack(enemy: Enemy): void {
        const baseDamage = 5; 
        const totalBonusDamage = this.equipment.reduce((sum, eq) => {
            if (eq instanceof EquipmentCard) {
                return sum + (eq.passiveEffect.bonusAttack || 0);
            }
            return sum;
        }, 0);
        const totalDamage = baseDamage + totalBonusDamage;
        enemy.takeDamage(totalDamage);
    }
    
    equip(card: EquipmentCard | EnhancedEquipmentCard): void {
        if (card instanceof EnhancedEquipmentCard) {
            // 新装备系统：允许多装备共存，不再检查装备槽冲突
            console.log(`[装备系统] 装备 ${card.name}，当前装备数量: ${this.equipment.length}`);
            
            // 直接添加新装备，不移除旧装备
            this.equipment.push(card);
            card.isActive = true;
            
            // 可选：记录装备槽信息（仅用于显示，不做冲突检查）
            const slot = card.equipmentSlot;
            if (slot) {
                // 如果这个槽位有装备，记录但不移除
                if (this.equipmentSlots[slot]) {
                    console.log(`[装备系统] ${slot}槽位已有装备: ${this.equipmentSlots[slot]!.name}，新装备 ${card.name} 将共存`);
                }
                // 更新槽位引用为最新装备（用于UI显示）
                this.equipmentSlots[slot] = card;
            }
        } else {
            // 旧装备系统兼容
            this.equipment.push(card);
        }
        
        console.log(`[装备系统] 装备完成！当前总装备数: ${this.equipment.length}`);
        console.log(`[装备系统] 当前装备列表:`, this.equipment.map(eq => eq.name));
        (window as any).battle?.ui.logAction(`装备了【${card.name}】！`, 'player');
    }

    // 新增：获取装备数量
    public getEquipmentCount(): number {
        return this.equipment.length;
    }

    // 新增：触发装备的被动效果
    public triggerEquipmentEffects(triggerType: string, context: any): void {
        this.equipment.forEach(eq => {
            if (eq instanceof EnhancedEquipmentCard) {
                eq.triggerEffects(triggerType, context);
            }
        });
    }

    // 重写onTurnEnd以触发装备效果
    public onTurnEnd(): void {
        super.onTurnEnd();
        
        // 清除临时伤害增益效果，确保回合结束后重置
        this.effects.remove('damage_buff');
        
        if (this.survivor) {
            this.survivor.onTurnEnd();
        }
        
        // 触发装备的回合结束效果
        this.equipment.forEach(eq => {
            const context = { player: this, enemy: (window as any).battle?.enemy || this, turn: (window as any).battle?.turn || 0 };
            
            // 调用装备的onTurnEnd方法（新装备系统）
            if (typeof (eq as any).onTurnEnd === 'function') {
                (eq as any).onTurnEnd(context);
            }
            
            // 特殊装备效果处理
            switch (eq.name) {
                case '一念神魔':
                    // 每回合结束时获得2点护盾，对敌方造成2点伤害
                    this.gainShield(2);
                    const damage = { amount: 2, type: 'normal' as any, source: this };
                    (window as any).DamageSystem?.dealDamage?.(damage, context.enemy);
                    (window as any).battle?.ui.logAction('一念神魔生效！获得2点护盾并对敌方造成2点伤害！', 'player');
                    break;
            }
        });
    }

    // 新增：回合开始触发装备效果
    public onTurnStart(): void {
        if (this.survivor && typeof (this.survivor as any).onTurnStart === 'function') {
            (this.survivor as any).onTurnStart();
        }
        
        // 触发装备的回合开始效果
        this.equipment.forEach(eq => {
            const context = { player: this, enemy: (window as any).battle?.enemy || this, turn: (window as any).battle?.turn || 0 };
            
            // 调用装备的onTurnStart方法（新装备系统）
            if (typeof (eq as any).onTurnStart === 'function') {
                (eq as any).onTurnStart(context);
            }
            
            // 特殊装备效果处理
            switch (eq.name) {
                case '盔甲护身':
                    // 每回合开始时获得4点护盾
                    this.gainShield(4);
                    (window as any).battle?.ui.logAction('盔甲护身生效！获得4点护盾！', 'player');
                    break;
                case '重击之锤':
                    // 重置第一张牌标记
                    if (!(eq as any).metadata) (eq as any).metadata = {};
                    (eq as any).metadata.firstCardUsed = false;
                    break;
            }
        });
    }

    addFollower(follower: Follower): void {
        if (this.followers.length < 4) this.followers.push(follower);
    }

    // 触发求生者被动技能
    public triggerSurvivorPassive(trigger: string, context: any): void {
        if (this.survivor) {
            this.survivor.triggerPassiveSkill(context, trigger);
        }
    }

    // 使用求生者主动技能
    public useSurvivorActiveSkill(context: any): boolean {
        if (this.survivor) {
            return this.survivor.useActiveSkill(context);
        }
        return false;
    }

    // 获取求生者伤害加成
    public getSurvivorDamageBonus(): number {
        if (!this.survivor) return 0;
        
        switch (this.survivor.data.id) {
            case 'wildman':
                // 野人：生命值越低，伤害越高
                const lostHp = this.maxHp - this.currentHp;
                return Math.floor(lostHp / 10);
            default:
                return 0;
        }
    }

    // 处理求生者伤害减免
    public getSurvivorDamageReduction(damage: number): number {
        if (!this.survivor) return 0;
        
        switch (this.survivor.data.id) {
            case 'lawyer':
                // 律师：有30%几率减少1点伤害
                if (Math.random() < 0.3) {
                    (window as any).battle?.ui.logAction('律师的钢铁意志发挥作用，减少了1点伤害！', 'player');
                    return 1;
                }
                break;
        }
        return 0;
    }
}

export class Enemy extends Character {
    actionPoints: number = 3;
    maxActionPoints: number = 3;
    handLimit: number = 8;
    equipment: (EquipmentCard | EnhancedEquipmentCard)[] = [];
    public equipmentSlots: {
        weapon?: EnhancedEquipmentCard;
        armor?: EnhancedEquipmentCard;
        accessory?: EnhancedEquipmentCard;
    } = {};

    public handleHandOverflow(): void {
        while (this.hand.length > this.handLimit) {
            let cardToDiscard: Card | null = null;
            let highestCost = -1;
            let discardIndex = -1;
            this.hand.forEach((card, index) => {
                const cost = (card as ActionCard).cost || 0;
                if (cost > highestCost) {
                    highestCost = cost;
                    cardToDiscard = card;
                    discardIndex = index;
                }
            });
            if (discardIndex === -1) {
                discardIndex = this.hand.length - 1;
            }
            const discarded = this.hand.splice(discardIndex, 1)[0];
            if (discarded) {
                // 装备牌自动弃牌时直接删除，不进入弃牌堆
                if (discarded.type === 'Equipment') {
                     (window as any).battle?.ui.logAction(`${this.name} 的手牌已满，弃掉了装备牌【${discarded.name}】，已删除`, 'system');
                } else {
                    this.discardPile.push(discarded);
                     (window as any).battle?.ui.logAction(`${this.name} 的手牌已满，弃掉了【${discarded.name}】`, 'system');
                }
            }
        }
    }

    async performAction(player: Player, ui: BattleUI): Promise<void> {
        console.log(`[DEBUG] ${this.name} 回合开始`);
        this.actionPoints = this.maxActionPoints;

        // 改为动态决策：每次选择当前最佳的单张牌
        while (this.actionPoints > 0) {
            console.log(`[DEBUG] ${this.name} 剩余行动点: ${this.actionPoints}，正在寻找最佳出牌...`);
            const bestCard = this.findBestCard(player);
            
            if (!bestCard) {
                console.log(`[DEBUG] ${this.name} 没有找到可用的牌，结束回合`);
                ui.logAction(`${this.name} 无法找到有效的攻击牌，结束回合。`, 'enemy');
                break;
            }

            console.log(`[DEBUG] ${this.name} 决定使用牌: ${bestCard.name}，费用: ${(bestCard as ActionCard).cost || 0}`);
            const cardIndex = this.hand.findIndex(c => c === bestCard);
            
            if (cardIndex === -1) {
                console.log(`[DEBUG] 错误：找不到卡牌在手牌中`);
                break;
            }

            // 检查玩家是否有反制牌
            const context = { player: player, enemy: this, turn: 0 };
            ui.logAction(`${this.name} 尝试使用【${bestCard.name}】...`, 'system');
            
            console.log(`[DEBUG] 检查玩家是否有反制牌...`);
            const isCountered = await player.tryCounter(bestCard, context);
            console.log(`[DEBUG] 反制检查结果: ${isCountered}`);
            
            // 从手牌中移除这张牌
            this.hand.splice(cardIndex, 1);
            
            if (isCountered) {
                console.log(`[DEBUG] 卡牌被玩家反制，不消耗行动点，重新评估...`);
                ui.logAction(`反制牌成功阻止了【${bestCard.name}】！`, 'system');
                // 装备牌被反制时直接删除，不进入弃牌堆
                if (bestCard.type === 'Equipment') {
                    ui.logAction(`装备牌【${bestCard.name}】被反制，已删除！`, 'system');
                } else {
                    this.discardPile.push(bestCard);
                }
                // 被反制的牌不消耗行动点，直接继续下一轮选择
                ui.updateAll(player, this);
                await sleep(500);
                continue; // 重新开始选择牌
            }

            // 卡牌没有被反制，正常执行
            const cardCost = (bestCard as ActionCard).cost || 0;
            this.actionPoints -= cardCost;
            console.log(`[DEBUG] ${this.name} 消耗行动点: ${cardCost}，剩余: ${this.actionPoints}`);

            ui.logAction(`🎬 ${this.name} 打出了【${bestCard.name}】！`, 'enemy');
            
            ui.playEnemyCardAnimation(bestCard);
            await sleep(500);
            
            const target = bestCard.targetType === 'self' ? this : player;
            bestCard.play(this, target, { player: player, enemy: this, turn: 0 });
            this.lastPlayedCard = bestCard;
            // 装备牌使用后直接删除，不进入弃牌堆
            if (bestCard.type === 'Equipment') {
                ui.logAction(`${this.name} 使用了装备牌【${bestCard.name}】，已删除！`, 'system');
            } else {
                this.discardPile.push(bestCard);
            }
            
            ui.updateAll(player, this);

            if (player.currentHp <= 0) {
                console.log(`[DEBUG] 玩家生命值归零，结束战斗`);
                break;
            }

            await sleep(600);
        }
        
        console.log(`[DEBUG] ${this.name} 回合结束，剩余行动点: ${this.actionPoints}`);
    }

    private findBestCard(target: Player): Card | null {
        let bestCard: Card | null = null;
        let maxValue = -1;

        for (const card of this.hand) {
            const cardCost = (card as ActionCard).cost || 0;
            
            // 检查是否有足够的行动点
            if (cardCost > this.actionPoints) {
                continue;
            }

            // 计算卡牌价值（伤害/效果价值）
            let cardValue = 0;
            if (card.targetType === 'self') {
                // 自身目标的牌（治疗、增益等）
                cardValue = 10; // 基础价值
            } else {
                // 攻击牌
                cardValue = card.getBaseDamage(this);
            }

            // 考虑费用效率（价值/费用比）
            const efficiency = cardCost > 0 ? cardValue / cardCost : cardValue;
            
            if (efficiency > maxValue) {
                maxValue = efficiency;
                bestCard = card;
            }
        }
        
        return bestCard;
    }

    private findBestPlay(target: Player): { cards: Card[], totalDamage: number } {
        let bestCombination: Card[] = [];
        let maxDamage = -1;

        const handSize = this.hand.length;
        for (let i = 0; i < (1 << handSize); i++) {
            let currentCombination: Card[] = [];
            let currentCost = 0;
            let currentDamage = 0;

            for (let j = 0; j < handSize; j++) {
                if ((i >> j) & 1) {
                    const card = this.hand[j];
                    currentCombination.push(card);
                    currentCost += (card as ActionCard).cost || 0;
                    if(card.targetType !== 'self') {
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
    }

    // 装备系统支持
    equip(card: EquipmentCard | EnhancedEquipmentCard): void {
        if (card instanceof EnhancedEquipmentCard) {
            // 新装备系统：允许多装备共存，不再检查装备槽冲突
            console.log(`[敌人装备系统] ${this.name}装备 ${card.name}，当前装备数量: ${this.equipment.length}`);
            
            // 直接添加新装备，不移除旧装备
            this.equipment.push(card);
            card.isActive = true;
            
            // 可选：记录装备槽信息（仅用于显示，不做冲突检查）
            const slot = card.equipmentSlot;
            if (slot) {
                // 如果这个槽位有装备，记录但不移除
                if (this.equipmentSlots[slot]) {
                    console.log(`[敌人装备系统] ${this.name}的${slot}槽位已有装备: ${this.equipmentSlots[slot]!.name}，新装备 ${card.name} 将共存`);
                }
                // 更新槽位引用为最新装备（用于UI显示）
                this.equipmentSlots[slot] = card;
            }
        } else {
            // 旧装备系统兼容
            this.equipment.push(card);
        }
        
        console.log(`[敌人装备系统] ${this.name}装备完成！当前总装备数: ${this.equipment.length}`);
        console.log(`[敌人装备系统] ${this.name}当前装备列表:`, this.equipment.map(eq => eq.name));
        (window as any).battle?.ui.logAction(`${this.name}装备了【${card.name}】！`, 'enemy');
    }

    // 重写onTurnEnd以触发装备效果
    public onTurnEnd(): void {
        super.onTurnEnd();
        
        console.log(`[敌人回合结束] ${this.name} 装备数量: ${this.equipment.length}`);
        console.log(`[敌人回合结束] ${this.name} 装备列表:`, this.equipment.map(eq => eq.name));
        
        // 触发装备的回合结束效果
        this.equipment.forEach((eq, index) => {
            const context = { player: (window as any).battle?.player || this, enemy: this, turn: (window as any).battle?.turn || 0 };
            
            console.log(`[敌人回合结束] 检查装备 ${index}: ${eq.name}, 是否有onTurnEnd方法: ${typeof (eq as any).onTurnEnd === 'function'}`);
            
            // 调用装备的onTurnEnd方法（新装备系统）
            if (typeof (eq as any).onTurnEnd === 'function') {
                console.log(`[敌人回合结束] 触发装备 ${eq.name} 的onTurnEnd效果`);
                (eq as any).onTurnEnd(context);
            }
        });
    }

    // 回合开始触发装备效果
    public onTurnStart(): void {
        // 触发装备的回合开始效果
        this.equipment.forEach(eq => {
            const context = { player: (window as any).battle?.player || this, enemy: this, turn: (window as any).battle?.turn || 0 };
            
            // 调用装备的onTurnStart方法（新装备系统）
            if (typeof (eq as any).onTurnStart === 'function') {
                (eq as any).onTurnStart(context);
            }
        });
    }
}
