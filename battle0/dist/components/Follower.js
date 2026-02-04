var Follower = /** @class */ (function () {
    function Follower(name, description, passive, active) {
        // 用于追踪主动技能的当前冷却时间
        this.currentCooldown = 0;
        this.name = name;
        this.description = description;
        this.passiveSkill = passive;
        this.activeSkill = active;
    }
    /**
     * 在回合开始时调用，用于减少冷却时间
     */
    Follower.prototype.tickCooldown = function () {
        if (this.currentCooldown > 0) {
            this.currentCooldown--;
        }
    };
    /**
     * 使用主动技能后，设置冷却时间
     */
    Follower.prototype.useSkill = function () {
        this.currentCooldown = this.activeSkill.cooldown;
    };
    return Follower;
}());
export { Follower };
//# sourceMappingURL=Follower.js.map