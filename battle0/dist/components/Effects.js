// 文件: src/components/Effects.ts
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * 效果管理器，每个角色都会有一个实例
 */
var EffectManager = /** @class */ (function () {
    function EffectManager() {
        this.effects = [];
    }
    EffectManager.prototype.add = function (effect) {
        var existingEffect = this.effects.find(function (e) { return e.type === effect.type; });
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
                    }
                    else {
                        existingEffect.duration = Math.max(existingEffect.duration, effect.duration);
                    }
                    if (effect.metadata) {
                        existingEffect.metadata = __assign(__assign({}, existingEffect.metadata), effect.metadata);
                    }
                    break;
            }
        }
        else {
            this.effects.push(effect);
        }
    };
    /**
     * 消耗并获取一个效果的数值。
     * 例如，消耗一层“伤害翻倍”。
     */
    EffectManager.prototype.consume = function (type, amount) {
        if (amount === void 0) { amount = 1; }
        var effect = this.effects.find(function (e) { return e.type === type; });
        if (effect) {
            effect.value -= amount;
            if (effect.value <= 0) {
                this.remove(type);
            }
            return __assign(__assign({}, effect), { value: amount }); // 返回被消耗的部分
        }
        return undefined;
    };
    /**
     * 获取某种效果的总值，但不消耗
     */
    EffectManager.prototype.getTotalValue = function (type) {
        return this.effects
            .filter(function (e) { return e.type === type; })
            .reduce(function (sum, e) { return sum + e.value; }, 0);
    };
    /**
     * 获取某种效果
     */
    EffectManager.prototype.getEffect = function (type) {
        return this.effects.find(function (e) { return e.type === type; });
    };
    /**
     * 检查是否有某种效果
     */
    EffectManager.prototype.hasEffect = function (type) {
        return this.effects.some(function (e) { return e.type === type; });
    };
    EffectManager.prototype.remove = function (type) {
        this.effects = this.effects.filter(function (e) { return e.type !== type; });
    };
    /**
     * 在回合结束时调用，更新所有有时效性的效果
     */
    EffectManager.prototype.tick = function () {
        this.effects.forEach(function (e) {
            if (e.duration > 0) {
                e.duration--;
            }
        });
        // 只移除duration为0的过期效果，保留duration为-1的永久效果和正数duration的正常效果
        this.effects = this.effects.filter(function (e) { return e.duration > 0 || e.duration === -1; });
    };
    /**
     * 获取所有活跃的效果
     */
    EffectManager.prototype.getAllEffects = function () {
        return __spreadArray([], this.effects, true);
    };
    /**
     * 清除所有效果
     */
    EffectManager.prototype.clear = function () {
        this.effects = [];
    };
    return EffectManager;
}());
export { EffectManager };
//# sourceMappingURL=Effects.js.map