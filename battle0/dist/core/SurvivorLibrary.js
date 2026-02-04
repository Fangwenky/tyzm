import { Survivor } from '../components/Survivor.js';
var SurvivorLibrary = /** @class */ (function () {
    function SurvivorLibrary() {
        this.survivors = {};
        this.initializeSurvivors();
    }
    SurvivorLibrary.prototype.initializeSurvivors = function () {
        // 医生 - 智力型治疗专家
        this.survivors['doctor'] = {
            id: 'doctor',
            name: '医生',
            profession: '医疗专家',
            description: '一位技艺精湛的医者，在危险中依然能够拯救生命。',
            type: 'intellect',
            baseHp: 90,
            baseActionPoints: 3,
            passiveSkill: {
                name: '悲悯的救赎',
                description: '每当对敌人造成伤害时，恢复等量生命值的50%',
                trigger: 'onDamage',
                effect: function (context) {
                    // 这个会在实际伤害计算后触发
                }
            },
            activeSkill: {
                name: '急救处理',
                description: '消耗2行动点，恢复15点生命值',
                cost: 2,
                cooldown: 3,
                effect: function (context) {
                    var _a;
                    var healAmount = 15;
                    var newHp = Math.min(context.player.maxHp, context.player.currentHp + healAmount);
                    var actualHeal = newHp - context.player.currentHp;
                    context.player.currentHp = newHp;
                    if (context.player.ui) {
                        context.player.ui.showFloatingText("+".concat(actualHeal), 'heal');
                    }
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u533B\u751F\u4F7F\u7528\u4E86\u6025\u6551\u5904\u7406\uFF0C\u6062\u590D\u4E86".concat(actualHeal, "\u70B9\u751F\u547D\uFF01"), 'player');
                }
            },
            flavorText: '即使在最黑暗的时刻，她也不会放弃任何一个生命。'
        };
        // 园丁 - 力量型防御专家
        this.survivors['gardener'] = {
            id: 'gardener',
            name: '园丁',
            profession: '园艺师',
            description: '一位充满父爱的园艺师，用自己的身躯守护着希望。',
            type: 'strength',
            baseHp: 110,
            baseActionPoints: 3,
            passiveSkill: {
                name: '父亲的守护',
                description: '回合开始时获得15点护盾',
                trigger: 'startOfTurn',
                effect: function (context) {
                    var _a;
                    if (1) {
                        context.player.gainShield(15);
                        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('园丁的父爱之心激活，获得了15点护盾！', 'player');
                    }
                }
            },
            activeSkill: {
                name: '木秀于林',
                description: '消耗1行动点，对自己造成5点伤害，对敌人造成20点伤害',
                cost: 1,
                cooldown: 3,
                effect: function (context) {
                    var _a;
                    context.player.takeDamage(5);
                    context.enemy.takeDamage(20);
                    if (context.enemy.ui) {
                        context.enemy.ui.showFloatingText('-12', 'damage');
                    }
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('园丁挥舞着满是荆棘的树枝，与敌人同归于尽！', 'player');
                }
            },
            flavorText: '为了守护心中的花园，他愿意承受任何痛苦。'
        };
        // 律师 - 智力型策略专家
        this.survivors['lawyer'] = {
            id: 'lawyer',
            name: '律师',
            profession: '法律专家',
            description: '一位冷静理智的律师，擅长用逻辑和策略击败对手。',
            type: 'intellect',
            baseHp: 85,
            baseActionPoints: 4,
            passiveSkill: {
                name: '郎心似铁',
                description: '受到伤害时，有30%的几率减少1点伤害',
                trigger: 'onDamage',
                effect: function (context) {
                    // 这个会在伤害系统中处理
                }
            },
            activeSkill: {
                name: '说谎的艺术',
                description: '消耗2行动点，下一张牌的伤害+12',
                cost: 2,
                cooldown: 3,
                effect: function (context) {
                    var _a;
                    context.player.effects.add({ type: 'next_card_damage', value: 12, duration: 1 });
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('律师巧舌如簧，下一击将更加犀利！', 'player');
                }
            },
            flavorText: '真相只有一个，但谎言却有无数种可能。'
        };
        // 小说家 - 智力型策略专家
        this.survivors['novelist'] = {
            id: 'novelist',
            name: '小说家',
            profession: '作家',
            description: '善于观察和思考的作家，用文字的力量改变现实。',
            type: 'intellect',
            baseHp: 85,
            baseActionPoints: 3,
            passiveSkill: {
                name: '夜莺的祝福',
                description: '每当对敌人造成伤害时，恢复1点生命值',
                trigger: 'onDamage',
                effect: function (context) {
                    // 这个会在伤害计算后触发
                }
            },
            activeSkill: {
                name: '隐喻',
                description: '消耗1行动点，获得1点行动点，抽2张牌',
                cost: 1,
                cooldown: 1,
                effect: function (context) {
                    var _a;
                    context.player.actionPoints += 1;
                    context.player.drawCards(2);
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('小说家巧妙运用隐喻，获得了新的灵感！', 'player');
                }
            },
            flavorText: '笔下生花，字里藏刀。'
        };
        // 野人 - 力量型攻击专家
        this.survivors['wildman'] = {
            id: 'wildman',
            name: '野人',
            profession: '原始战士',
            description: '来自荒野的强壮战士，拥有原始的力量和野性。',
            type: 'strength',
            baseHp: 105,
            baseActionPoints: 3,
            passiveSkill: {
                name: '野蛮冲撞',
                description: '生命值越低，伤害越高（每失去15点生命+1伤害）',
                trigger: 'onDamage',
                effect: function (context) {
                    // 这个会在伤害计算时处理
                }
            },
            activeSkill: {
                name: '原始冲击',
                description: '消耗1行动点，造成15点伤害',
                cost: 1,
                cooldown: 3,
                effect: function (context) {
                    var _a;
                    context.enemy.takeDamage(15);
                    if (context.enemy.ui) {
                        context.enemy.ui.showFloatingText('-15', 'damage');
                    }
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('野人发动了野蛮的冲击', 'player');
                }
            },
            flavorText: '文明的束缚对他而言不过是枷锁。'
        };
        // 记者 - 智力型爆发专家
        this.survivors['reporter'] = {
            id: 'reporter',
            name: '记者',
            profession: '新闻记者',
            description: '敏锐的记者，擅长抓住关键时机发动致命一击。',
            type: 'intellect',
            baseHp: 85,
            baseActionPoints: 3,
            passiveSkill: {
                name: '第六感',
                description: '出牌时，如果敌人生命值低于30%，本次伤害+5',
                trigger: 'onCardPlay',
                effect: function (context) {
                    // 这个会在伤害计算时处理
                }
            },
            activeSkill: {
                name: '连击',
                description: '消耗1行动点，造成18点伤害',
                cost: 1,
                cooldown: 3,
                effect: function (context) {
                    var _a;
                    context.enemy.takeDamage(18);
                    if (context.enemy.ui) {
                        context.enemy.ui.showFloatingText('-18', 'damage');
                    }
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('记者抓住时机发动连击，造成巨大伤害！', 'player');
                }
            },
            flavorText: '真相，总是在最后一刻被揭露。'
        };
        // 作曲家 - 智力型辅助专家
        this.survivors['composer'] = {
            id: 'composer',
            name: '作曲家',
            profession: '音乐家',
            description: '富有艺术气息的音乐家，用旋律的力量影响战场。',
            type: 'intellect',
            baseHp: 80,
            baseActionPoints: 3,
            passiveSkill: {
                name: '音韵',
                description: '回合开始时，抽一张牌',
                trigger: 'startOfTurn',
                effect: function (context) {
                    var _a;
                    if (context.player.hand.length < 4) {
                        context.player.drawCards(1);
                        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('作曲家聆听内心的旋律，获得了新的灵感！', 'player');
                    }
                }
            },
            activeSkill: {
                name: '行云流水',
                description: '消耗1行动点，造成7点伤害，抽一张牌',
                cost: 1,
                cooldown: 1,
                effect: function (context) {
                    var _a;
                    context.enemy.takeDamage(7);
                    context.player.drawCards(1);
                    if (context.enemy.ui) {
                        context.enemy.ui.showFloatingText('-7', 'damage');
                    }
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('作曲家如行云流水般攻击，同时获得了新的灵感！', 'player');
                }
            },
            flavorText: '每一个音符，都是生命的律动。'
        };
        // 小女孩 - 敏捷型神秘专家
        this.survivors['little_girl'] = {
            id: 'little_girl',
            name: '小女孩',
            profession: '神秘少女',
            description: '看似脆弱的小女孩，却拥有着神秘的力量。',
            type: 'agility',
            baseHp: 85,
            baseActionPoints: 3,
            passiveSkill: {
                name: '俄耳甫斯',
                description: '对敌人造成伤害时，转化为对自己的护盾',
                trigger: 'onDamage',
                effect: function (context) {
                    // 这个会在伤害计算后处理，将伤害转化为护盾
                }
            },
            activeSkill: {
                name: '恸哭',
                description: '消耗2行动点，对敌人造成当前生命值15%的伤害',
                cost: 2,
                cooldown: 4,
                effect: function (context) {
                    var _a;
                    var damage = Math.floor(context.enemy.currentHp * 0.15);
                    var finalDamage = Math.max(damage, 5); // 最低5点伤害
                    context.enemy.takeDamage(finalDamage);
                    if (context.enemy.ui) {
                        context.enemy.ui.showFloatingText("-".concat(finalDamage), 'damage');
                    }
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u5C0F\u5973\u5B69\u7684\u6078\u54ED\u58F0\u54CD\u5F7B\u6218\u573A\uFF0C\u9020\u6210\u4E86".concat(finalDamage, "\u70B9\u4F24\u5BB3\uFF01"), 'player');
                }
            },
            flavorText: '纯真的外表下，隐藏着不为人知的秘密。'
        };
        // 舞女 - 敏捷型魅惑专家
        this.survivors['dancer'] = {
            id: 'dancer',
            name: '舞女',
            profession: '魅力舞者',
            description: '用优雅的舞姿迷惑敌人，在舞蹈中寻找生机。',
            type: 'agility',
            baseHp: 95,
            baseActionPoints: 4,
            passiveSkill: {
                name: '华丽转身',
                description: '每当使用行动牌时，下一张攻击牌伤害+2',
                trigger: 'onCardPlay',
                effect: function (context) {
                    var _a;
                    // 这个会在行动牌使用后触发
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('舞女华丽转身，下一次攻击将更加致命！', 'player');
                }
            },
            activeSkill: {
                name: '魅惑之舞',
                description: '消耗1行动点，敌人受到魅惑效果，自己获12点护盾',
                cost: 1,
                cooldown: 3,
                effect: function (context) {
                    var _a;
                    // 自己获得护盾
                    context.player.gainShield(12);
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('舞女施展魅惑之舞，获得了护盾！', 'player');
                }
            },
            flavorText: '在优雅的舞步中，隐藏着致命的陷阱。'
        };
        // 杂技演员 - 敏捷型表演专家
        this.survivors['acrobat'] = {
            id: 'acrobat',
            name: '杂技演员',
            profession: '灵巧表演者',
            description: '拥有超凡身手的杂技演员，能够在危险中翻转乾坤。',
            type: 'agility',
            baseHp: 100,
            baseActionPoints: 4,
            passiveSkill: {
                name: '灵巧身手',
                description: '受到攻击时，有25%的几率完全闪避伤害并抽1张牌',
                trigger: 'onDamage',
                effect: function (context) {
                    // 这个会在伤害系统中处理
                }
            },
            activeSkill: {
                name: '空中翻腾',
                description: '消耗1行动点，对敌人造成10点伤害，获得1点额外行动点',
                cost: 1,
                cooldown: 1,
                effect: function (context) {
                    var _a;
                    context.enemy.takeDamage(10);
                    context.player.actionPoints += 1;
                    if (context.enemy.ui) {
                        context.enemy.ui.showFloatingText('-8', 'damage');
                    }
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('杂技演员在空中翻腾，造成了伤害并获得额外行动机会！', 'player');
                }
            },
            flavorText: '没有什么障碍能够阻挡真正的表演艺术家。'
        };
        // 昆虫学家 - 智力型研究专家
        this.survivors['entomologist'] = {
            id: 'entomologist',
            name: '昆虫学家',
            profession: '昆虫研究者',
            description: '痴迷于昆虫研究的学者，掌握着自然界的奥秘。',
            type: 'intellect',
            baseHp: 88,
            baseActionPoints: 3,
            passiveSkill: {
                name: '昆虫之友',
                description: '回合开始时，召唤一只昆虫伙伴，对敌人造成3点持续伤害',
                trigger: 'startOfTurn',
                effect: function (context) {
                    var _a;
                    context.enemy.takeDamage(3);
                    if (context.enemy.ui) {
                        context.enemy.ui.showFloatingText('-3', 'damage');
                    }
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('昆虫伙伴对敌人造成了3点伤害！', 'player');
                }
            },
            activeSkill: {
                name: '毒虫释放',
                description: '消耗1行动点，对敌人造成8点伤害，敌人接下来2回合每回合受到4点毒素伤害',
                cost: 1,
                cooldown: 3,
                effect: function (context) {
                    var _a;
                    context.enemy.takeDamage(8);
                    // 应用毒素效果
                    if (context.enemy.ui) {
                        context.enemy.ui.showFloatingText('-6', 'damage');
                    }
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('昆虫学家释放了毒虫，敌人中毒了！', 'player');
                }
            },
            flavorText: '大自然的力量，永远超出人类的想象。'
        };
        // 机械师 - 智力型工程专家
        this.survivors['mechanic'] = {
            id: 'mechanic',
            name: '机械师',
            profession: '工程专家',
            description: '精通机械制造的工程师，能够在战场上创造奇迹。',
            type: 'intellect',
            baseHp: 92,
            baseActionPoints: 3,
            passiveSkill: {
                name: '机械天赋',
                description: '每当使用卡牌时，有30%几率获得2点护盾',
                trigger: 'onCardPlay',
                effect: function (context) {
                    var _a;
                    if (Math.random() < 0.3) {
                        context.player.gainShield(2);
                        (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('机械师的天赋让装备发挥更大作用！', 'player');
                    }
                }
            },
            activeSkill: {
                name: '机械改造',
                description: '消耗2行动点，从牌库随机获得一张装备牌到手牌',
                cost: 2,
                cooldown: 3,
                effect: function (context) {
                    var _a;
                    // 添加随机装备牌到手牌
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('机械师制造了新的装备！', 'player');
                }
            },
            flavorText: '机械永远不会背叛，只有人心才会。'
        };
        // 前锋 - 力量型突击专家
        this.survivors['forward'] = {
            id: 'forward',
            name: '前锋',
            profession: '突击战士',
            description: '冲锋在前的勇敢战士，用无畏的精神开辟道路。',
            type: 'strength',
            baseHp: 105,
            baseActionPoints: 3,
            passiveSkill: {
                name: '冲锋陷阵',
                description: '每当对敌人造成伤害时，下一张攻击牌伤害+1',
                trigger: 'onDamage',
                effect: function (context) {
                    var _a;
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction('前锋的冲锋精神被激发，下次攻击会更强！', 'player');
                }
            },
            activeSkill: {
                name: '破釜沉舟',
                description: '消耗1行动点，对敌人造成自己已损失生命值25%的伤害，最少8点',
                cost: 1,
                cooldown: 3,
                effect: function (context) {
                    var _a;
                    var lostHp = context.player.maxHp - context.player.currentHp;
                    var damage = Math.max(Math.floor(lostHp * 0.25), 8);
                    context.enemy.takeDamage(damage);
                    if (context.enemy.ui) {
                        context.enemy.ui.showFloatingText("-".concat(damage), 'damage');
                    }
                    (_a = window.battle) === null || _a === void 0 ? void 0 : _a.ui.logAction("\u524D\u950B\u62FC\u5C3D\u5168\u529B\uFF0C\u9020\u6210\u4E86".concat(damage, "\u70B9\u4F24\u5BB3\uFF01"), 'player');
                }
            },
            flavorText: '真正的勇者，永远冲在最前面。'
        };
    };
    SurvivorLibrary.prototype.getAllSurvivors = function () {
        return Object.values(this.survivors);
    };
    SurvivorLibrary.prototype.getSurvivor = function (id) {
        return this.survivors[id];
    };
    SurvivorLibrary.prototype.createSurvivor = function (id) {
        var data = this.getSurvivor(id);
        if (!data)
            return undefined;
        return new Survivor(data);
    };
    return SurvivorLibrary;
}());
export { SurvivorLibrary };
//# sourceMappingURL=SurvivorLibrary.js.map