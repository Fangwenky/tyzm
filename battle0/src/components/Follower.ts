import { BattleContext } from './Card.js';

// 定义技能效果函数的类型
type SkillEffect = (context: BattleContext) => void;

// 定义被动技能的结构
export interface PassiveSkill {
    name: string;
    description: string;
    // 技能的触发时机，可以扩展更多，如 'onTakeDamage', 'onPlayCard' 等
    trigger: 'startOfTurn'; 
    effect: SkillEffect;
}

// 定义主动技能的结构
export interface ActiveSkill {
    name: string;
    description: string;
    cost: number; // 消耗的行动点
    cooldown: number; // 冷却回合数
    effect: SkillEffect;
}

export class Follower {
    public name: string;
    public description: string;
    public passiveSkill: PassiveSkill;
    public activeSkill: ActiveSkill;
    
    // 用于追踪主动技能的当前冷却时间
    public currentCooldown: number = 0;

    constructor(name: string, description: string, passive: PassiveSkill, active: ActiveSkill) {
        this.name = name;
        this.description = description;
        this.passiveSkill = passive;
        this.activeSkill = active;
    }

    /**
     * 在回合开始时调用，用于减少冷却时间
     */
    tickCooldown(): void {
        if (this.currentCooldown > 0) {
            this.currentCooldown--;
        }
    }

    /**
     * 使用主动技能后，设置冷却时间
     */
    useSkill(): void {
        this.currentCooldown = this.activeSkill.cooldown;
    }
}