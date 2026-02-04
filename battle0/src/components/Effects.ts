// 文件: src/components/Effects.ts

export type EffectType = 
    // 原有效果
    'damage_double' | // 伤害翻倍
    'damage_buff' |   // 伤害增加
    'next_card_damage' | // 下一张牌伤害增强
    'draw_penalty' |   // 抽牌惩罚
    
    // 新增状态效果
    'double_effect' |  // 双重效果（替身攻击）
    'shield_reduction' | // 护盾减伤
    'damage_reflection' | // 伤害反弹
    'card_nullify' |   // 卡牌无效化
    'burn' |          // 燃烧效果
    'first_card_double' | // 首张牌伤害翻倍
    'damage_threshold' | // 伤害阈值保护
    'life_steal' |    // 生命偷取
    'action_point_bonus' | // 行动点加成
    'card_draw_bonus'; // 抽牌加成

export interface Effect {
    type: EffectType;
    value: number; // 加成数值，对于翻倍来说，可以设为1，表示有1次翻倍效果
    duration: number; // 持续的回合数
    metadata?: any; // 额外的效果数据，如燃烧伤害值、反弹比例等
}

/**
 * 效果管理器，每个角色都会有一个实例
 */
export class EffectManager {
    private effects: Effect[] = [];

    add(effect: Effect): void {
        const existingEffect = this.effects.find(e => e.type === effect.type);
        if (existingEffect) {
            // 如果是同种效果，根据效果类型进行不同处理
            switch (effect.type) {
                case 'burn':
                    // 燃烧效果：刷新持续时间，但不叠加伤害
                    existingEffect.duration = effect.duration;
                    break;

                case 'damage_reflection':
                    // 伤害反弹：取最高比例
                    existingEffect.value = Math.max(existingEffect.value, effect.value);
                    existingEffect.duration = Math.max(existingEffect.duration, effect.duration);
                    break;
                default:
                    // 默认行为：叠加数值，正确处理永久效果
                    existingEffect.value += effect.value;
                    // 永久效果(-1)优先，其次取较大的正数duration
                    if (existingEffect.duration === -1 || effect.duration === -1) {
                        existingEffect.duration = -1;
                    } else {
                        existingEffect.duration = Math.max(existingEffect.duration, effect.duration);
                    }
                    if (effect.metadata) {
                        existingEffect.metadata = { ...existingEffect.metadata, ...effect.metadata };
                    }
                    break;
            }
        } else {
            this.effects.push(effect);
        }
    }

    /**
     * 消耗并获取一个效果的数值。
     * 例如，消耗一层“伤害翻倍”。
     */
    consume(type: EffectType, amount = 1): Effect | undefined {
        const effect = this.effects.find(e => e.type === type);
        if (effect) {
            effect.value -= amount;
            if (effect.value <= 0) {
                this.remove(type);
            }
            return { ...effect, value: amount }; // 返回被消耗的部分
        }
        return undefined;
    }
    
    /**
     * 获取某种效果的总值，但不消耗
     */
    getTotalValue(type: EffectType): number {
        return this.effects
            .filter(e => e.type === type)
            .reduce((sum, e) => sum + e.value, 0);
    }
    
    /**
     * 获取某种效果
     */
    getEffect(type: EffectType): Effect | undefined {
        return this.effects.find(e => e.type === type);
    }
    
    /**
     * 检查是否有某种效果
     */
    hasEffect(type: EffectType): boolean {
        return this.effects.some(e => e.type === type);
    }
    
    remove(type: EffectType): void {
        this.effects = this.effects.filter(e => e.type !== type);
    }

    /**
     * 在回合结束时调用，更新所有有时效性的效果
     */
    tick(): void {
        this.effects.forEach(e => {
            if (e.duration > 0) {
                e.duration--;
            }
        });
        // 只移除duration为0的过期效果，保留duration为-1的永久效果和正数duration的正常效果
        this.effects = this.effects.filter(e => e.duration > 0 || e.duration === -1);
    }

    /**
     * 获取所有活跃的效果
     */
    getAllEffects(): Effect[] {
        return [...this.effects];
    }

    /**
     * 清除所有效果
     */
    clear(): void {
        this.effects = [];
    }
}