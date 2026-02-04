var Survivor = /** @class */ (function () {
    function Survivor(data) {
        this.data = data;
        // 初始化冷却时间
        if (this.data.activeSkill.cooldown) {
            this.data.activeSkill.currentCooldown = 0;
        }
    }
    Survivor.prototype.canUseActiveSkill = function () {
        return !this.data.activeSkill.currentCooldown || this.data.activeSkill.currentCooldown <= 0;
    };
    Survivor.prototype.useActiveSkill = function (context) {
        if (!this.canUseActiveSkill())
            return false;
        if (this.data.activeSkill.cost && context.player.actionPoints < this.data.activeSkill.cost)
            return false;
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
    };
    Survivor.prototype.triggerPassiveSkill = function (context, trigger) {
        if (this.data.passiveSkill.trigger === trigger) {
            this.data.passiveSkill.effect(context);
        }
    };
    Survivor.prototype.onTurnEnd = function () {
        // 冷却时间递减
        if (this.data.activeSkill.currentCooldown && this.data.activeSkill.currentCooldown > 0) {
            this.data.activeSkill.currentCooldown--;
        }
    };
    return Survivor;
}());
export { Survivor };
//# sourceMappingURL=Survivor.js.map