import { BattleContext } from './Card.js';

export interface SurvivorSkill {
    name: string;
    description: string;
    trigger?: 'startOfTurn' | 'endOfTurn' | 'onDamage' | 'onHeal' | 'onCardPlay' | 'manual';
    cost?: number;
    cooldown?: number;
    currentCooldown?: number;
    effect: (context: BattleContext) => void;
}

export interface SurvivorData {
    id: string;
    name: string;
    profession: string;
    description: string;
    type: 'intellect' | 'agility' | 'strength';
    baseHp: number;
    baseActionPoints: number;
    passiveSkill: SurvivorSkill;
    activeSkill: SurvivorSkill;
    flavorText?: string;
}

export class Survivor {
    public data: SurvivorData;
    
    constructor(data: SurvivorData) {
        this.data = data;
        // 初始化冷却时间
        if (this.data.activeSkill.cooldown) {
            this.data.activeSkill.currentCooldown = 0;
        }
    }

    public canUseActiveSkill(): boolean {
        return !this.data.activeSkill.currentCooldown || this.data.activeSkill.currentCooldown <= 0;
    }

    public useActiveSkill(context: BattleContext): boolean {
        if (!this.canUseActiveSkill()) return false;
        if (this.data.activeSkill.cost && context.player.actionPoints < this.data.activeSkill.cost) return false;
        
        // 消耗行动点
        if (this.data.activeSkill.cost) {
            context.player.actionPoints -= this.data.activeSkill.cost;
        }
        
        // 执行技能效果
        this.data.activeSkill.effect(context);
        
        // 设置冷却时间
        if (this.data.activeSkill.cooldown) {
            this.data.activeSkill.currentCooldown = this.data.activeSkill.cooldown;
        }
        
        return true;
    }

    public triggerPassiveSkill(context: BattleContext, trigger: string): void {
        if (this.data.passiveSkill.trigger === trigger) {
            this.data.passiveSkill.effect(context);
        }
    }

    public onTurnEnd(): void {
        // 冷却时间递减
        if (this.data.activeSkill.currentCooldown && this.data.activeSkill.currentCooldown > 0) {
            this.data.activeSkill.currentCooldown--;
        }
    }
}
