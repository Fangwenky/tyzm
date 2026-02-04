import { CounterCard } from '../components/Card.js';

// 音频播放辅助函数
function playAudio(soundFile) {
    try {
        var audio = new Audio(soundFile);
        audio.play();
    } catch (error) {
        console.error("播放音频失败:", soundFile, error);
    }
}

var BattleUI = /** @class */ (function () {
    function BattleUI(onCardClick, onSkillClick, onEndTurn, onSurvivorSkill) {
        this.tooltipTimeout = null;
        try {
            // 获取战斗界面DOM元素
            this.battleScreen = this.getRequiredElement('battle-screen');
            this.playerName = this.getRequiredElement('player-name');
            this.playerHpText = this.getRequiredElement('player-hp-text');
            this.playerHpFill = this.getRequiredElement('player-hp-fill');
            this.playerAp = this.getRequiredElement('player-ap');
            this.playerShield = this.getRequiredElement('player-shield');
            this.enemyName = this.getRequiredElement('enemy-name');
            this.enemyHpText = this.getRequiredElement('enemy-hp-text');
            this.enemyHpFill = this.getRequiredElement('enemy-hp-fill');
            this.enemyShield = this.getRequiredElement('enemy-shield');
            this.playerHand = this.getRequiredElement('player-hand');
            this.followerArea = this.getRequiredElement('follower-area');
            this.endTurnBtn = this.getRequiredElement('end-turn-btn');
            this.dropZone = this.getRequiredElement('drop-zone');
            this.gameOverModal = this.getRequiredElement('game-over-modal');
            this.gameOverText = this.getRequiredElement('game-over-text');
            this.restartBtn = this.getRequiredElement('restart-btn');
            this.playerFloatingTextContainer = this.getRequiredElement('#player-area-container-hud .floating-text-container', true);
            this.enemyFloatingTextContainer = this.getRequiredElement('#opponent-area-container .floating-text-container', true);
            this.enemyCardArea = this.getRequiredElement('enemy-card-area');
            this.survivorSkillContainer = this.getRequiredElement('survivor-skill-container');
            this.equipmentArea = this.getRequiredElement('equipment-area');
            this.equipmentList = this.getRequiredElement('equipment-list');
            // Tooltip 系统初始化
            this.tooltipContainer = this.getRequiredElement('tooltip-container');
            this.tooltipTitle = this.getRequiredElement('tooltip-title');
            this.tooltipCost = this.getRequiredElement('tooltip-cost');
            this.tooltipDescription = this.getRequiredElement('tooltip-description');
            this.tooltipEffects = this.getRequiredElement('tooltip-effects');
            // 绑定事件
            this.endTurnBtn.addEventListener('click', onEndTurn);
            this.restartBtn.addEventListener('click', function () { return window.location.reload(); });
        }
        catch (error) {
            console.error('BattleUI初始化失败:', error);
            throw error;
        }
        this.playerHand.onCardClick = onCardClick;
        this.followerArea.onSkillClick = onSkillClick;
        this.survivorSkillContainer.onSurvivorSkill = onSurvivorSkill;
        this.setupDragAndDrop(onCardClick);
    }

    BattleUI.prototype.startBackgroundMusic = function (musicFile, volume) {
        var _this = this;
        if (volume === void 0) { volume = 0.3; } // BGM音量建议小一点

        // 如果已经有BGM在播放，就先停止
        if (this.backgroundMusic) {
            this.stopBackgroundMusic();
        }

        this.backgroundMusic = new Audio(musicFile);
        this.backgroundMusic.loop = true; // 设置为循环播放
        this.backgroundMusic.volume = volume;

        // 现代浏览器需要用户交互后才能播放音频，所以我们尝试播放，并处理可能发生的错误
        var playPromise = this.backgroundMusic.play();

        if (playPromise !== undefined) {
            playPromise.catch(function (error) {
                console.warn("背景音乐自动播放失败，将在用户首次交互后重试:", error);
                // 创建一个一次性事件监听器，在用户点击页面任何地方后，再次尝试播放BGM
                var playAfterInteraction = function () {
                    _this.backgroundMusic.play();
                    document.body.removeEventListener('click', playAfterInteraction);
                };
                document.body.addEventListener('click', playAfterInteraction);
            });
        }
    };

    /**
     * 停止播放背景音乐
     */
    BattleUI.prototype.stopBackgroundMusic = function () {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause(); // 暂停
            this.backgroundMusic.currentTime = 0; // 将播放进度重置到开头
            this.backgroundMusic = null; // 清理对象
        }
    };

    // 安全获取DOM元素的辅助方法
    BattleUI.prototype.getRequiredElement = function (selector, useQuerySelector) {
        if (useQuerySelector === void 0) { useQuerySelector = false; }
        var element = useQuerySelector ?
            document.querySelector(selector) :
            document.getElementById(selector);
        if (!element) {
            throw new Error("\u65E0\u6CD5\u627E\u5230\u5FC5\u9700\u7684DOM\u5143\u7D20: ".concat(selector));
        }
        return element;
    };

    BattleUI.prototype.playSound = function (soundFile) {
        playAudio(soundFile);
    };

    BattleUI.prototype.show = function () {
        this.battleScreen.classList.remove('hidden');
    };
    BattleUI.prototype.updateAll = function (player, enemy, isDiscardMode) {
        if (isDiscardMode === void 0) { isDiscardMode = false; }
        this.updateHealth(player, enemy);
        this.updateActionPoints(player.actionPoints);
        this.renderPlayerHand(player.hand, player.actionPoints, isDiscardMode);
        this.renderFollowers(player.followers, player.actionPoints);
        this.renderSurvivorSkill(player);
        this.renderEquipment(player);
        this.playerName.textContent = player.name;
        this.enemyName.textContent = enemy.name;
    };
    BattleUI.prototype.updateHealth = function (player, enemy) {
        this.playerHpText.textContent = "".concat(player.currentHp, " / ").concat(player.maxHp);
        this.playerHpFill.style.width = "".concat((player.currentHp / player.maxHp) * 100, "%");
        this.enemyHpText.textContent = "".concat(enemy.currentHp, " / ").concat(enemy.maxHp);
        this.enemyHpFill.style.width = "".concat((enemy.currentHp / enemy.maxHp) * 100, "%");
        if (this.playerShield) {
            this.playerShield.textContent = "\u62A4\u76FE: ".concat(player.shield);
            this.playerShield.style.display = player.shield > 0 ? 'block' : 'none';
        }
        if (this.enemyShield) {
            this.enemyShield.textContent = "\u62A4\u76FE: ".concat(enemy.shield);
            this.enemyShield.style.display = enemy.shield > 0 ? 'block' : 'none';
        }
    };
    BattleUI.prototype.updateActionPoints = function (ap) {
        this.playerAp.textContent = "\u884C\u52A8\u70B9: ".concat(ap);
    };
    BattleUI.prototype.createCardElement = function (card) {
        var cardEl = document.createElement('div');
        cardEl.className = 'battle-card';
        if (card instanceof CounterCard) {
            cardEl.classList.add('counter-card');
        }
        cardEl.dataset.cardId = card.id;
        var cost = 'cost' in card ? card.cost : 0;
        var cardData = card.data || {}; // 获取卡牌数据以访问图片路径
        var imagePath = cardData.image || this.getDefaultImagePath(card);
        cardEl.innerHTML = "\n            <div class=\"card-content\">\n                ".concat(imagePath ? "<div class=\"card-image\"><img src=\"".concat(imagePath, "\" alt=\"").concat(card.name, "\" onerror=\"this.style.display='none'\"></div>") : '', "\n                <div class=\"card-name\">").concat(card.name, "<span class=\"card-cost\">").concat(cost > 0 ? cost : '', "</span></div>\n                <p class=\"card-description\">").concat(card.description, "</p>\n            </div>\n        ");
        return cardEl;
    };
    BattleUI.prototype.getDefaultImagePath = function (card) {
        // 根据卡牌类型返回默认图片路径
        var baseDir = 'assets/images/cards/';
        // 根据卡牌名称和类型匹配图片
        var imageMap = {
            '普通攻击': 'normal_attack.png',
            '利剑之刺': 'piercing_strike.png',
            '舍命相搏': 'desperate_blow.png',
            '火焰攻击': 'fire_attack.png',
            '迅捷攻击': 'swift_attack.png',
            '重拳出击': 'heavy_punch.png',
            '双重打击': 'double_tap.png',
            '汲取攻击': 'leeching_strike.png',
            '千钧之力': 'mighty_blow.png',
            '重创': 'critical_strike.png',
            '毅力守护': 'enduring_guard.png',
            '以守为攻': 'defensive_stance.png',
            '神圣守护': 'sacred_protection.png',
            '力量强化': 'strength_boost.png',
            '狂徒之攻': 'berserker_assault.png',
            '命中要害': 'vital_strike.png',
            '极速追击': 'rapid_pursuit.png',
            '影影绰绰': 'shadow_copy.png',
            '全力以赴': 'all_out_attack.png',
            '弃甲追击': 'armorless_pursuit.png',
            '盔甲护身': 'armor_protection.png',
            '追击之刃': 'pursuit_blade.png',
            '重击之锤': 'heavy_hammer.png',
            '泣血之刃': 'bloodthirsty_blade.png',
            '恋战之斧': 'battle_axe.png',
            '一念神魔': 'dual_nature.png',
            '迎头痛击': 'headlong_strike.png',
            '伤害吸收': 'damage_absorption.png',
            '噩梦凝视': 'nightmare_gaze.png',
            '和声共鸣': 'harmonious_resonance.png',
            '木炭': 'charcoal.png',
            '毒液': 'venom.png',
            '蛛网': 'spider_web.png',
            '坍塌': 'collapse.png',
            '水镜': 'water_mirror.png',
            '滋长': 'growth.png',
            '梦魇': 'nightmare.png',
            '火箭礼花': 'rocket_fireworks.png',
            '矢车菊之殇': 'cornflower_sorrow.png',
            '生命滋长': 'life_growth.png',
        };
        var imageName = imageMap[card.name];
        return imageName ? baseDir + imageName : '';
    };
    BattleUI.prototype.renderPlayerHand = function (hand, currentAp, isDiscardMode) {
        var _this = this;
        if (isDiscardMode === void 0) { isDiscardMode = false; }
        this.playerHand.innerHTML = '';
        hand.forEach(function (card, index) {
            var cardEl = _this.createCardElement(card);
            cardEl.dataset.cardIndex = String(index);
            var isPlayable = false;
            // 反制牌不能主动使用
            if (card instanceof CounterCard) {
                isPlayable = false;
                cardEl.draggable = false;
            }
            else if ('cost' in card) {
                isPlayable = card.cost <= currentAp;
            }
            else {
                isPlayable = true;
            }
            if (isDiscardMode) {
                cardEl.classList.add('playable');
                cardEl.addEventListener('click', function () { return _this.playerHand.onCardClick(index); });
            }
            else {
                if (isPlayable) {
                    cardEl.draggable = true;
                    cardEl.classList.add('playable');
                }
            }
            // 添加 Tooltip 功能
            _this.addCardTooltip(cardEl, card);
            _this.playerHand.appendChild(cardEl);
        });
    };
    BattleUI.prototype.renderFollowers = function (followers, currentAp) {
        var _this = this;
        this.followerArea.innerHTML = '';
        followers.forEach(function (follower, index) {
            var followerEl = document.createElement('div');
            followerEl.className = 'follower-card';
            var skill = follower.activeSkill;
            var skillStatus = '';
            if (follower.currentCooldown > 0) {
                skillStatus = "<div class=\"skill-cooldown\">\u51B7\u5374\u4E2D: ".concat(follower.currentCooldown, "</div>");
            }
            else if (skill.cost > currentAp) {
                skillStatus = "<div class=\"skill-cooldown\">\u884C\u52A8\u70B9\u4E0D\u8DB3</div>";
            }
            followerEl.innerHTML = "\n                <div class=\"follower-name\">".concat(follower.name, "</div>\n                <p class=\"skill-description\"><b>\u4E3B\u52A8:</b> ").concat(skill.name, " (\u6D88\u8017:").concat(skill.cost, ")</p>\n                ").concat(skillStatus, "\n            ");
            if (follower.currentCooldown === 0 && skill.cost <= currentAp) {
                followerEl.classList.add('playable');
                followerEl.addEventListener('click', function () { return _this.followerArea.onSkillClick(index); });
            }
            // 添加随从 Tooltip
            var followerTooltipData = {
                title: follower.name,
                description: "\u4E3B\u52A8\u6280\u80FD: ".concat(skill.name),
                cost: skill.cost,
                effects: [
                    "\u51B7\u5374\u65F6\u95F4: ".concat(skill.cooldown, " \u56DE\u5408"),
                    "\u88AB\u52A8\u6280\u80FD: ".concat(follower.passiveSkill.name)
                ]
            };
            if (follower.currentCooldown > 0) {
                followerTooltipData.effects.push("\u5269\u4F59\u51B7\u5374: ".concat(follower.currentCooldown, " \u56DE\u5408"));
            }
            followerEl.addEventListener('mouseenter', function () {
                _this.showTooltip(followerEl, followerTooltipData);
            });
            followerEl.addEventListener('mouseleave', function () {
                _this.hideTooltip();
            });
            _this.followerArea.appendChild(followerEl);
        });
    };
    BattleUI.prototype.renderSurvivorSkill = function (player) {
        var _this = this;
        this.survivorSkillContainer.innerHTML = '';
        if (!player.survivor)
            return;
        var survivor = player.survivor;
        var activeSkill = survivor.data.activeSkill;
        // 创建被动技能显示
        var passiveEl = document.createElement('div');
        passiveEl.className = 'survivor-skill-info';
        passiveEl.innerHTML = "\n            <div style=\"font-size: 0.7em; color: #aaa; margin-bottom: 2px;\">\u88AB\u52A8: ".concat(survivor.data.passiveSkill.name, "</div>\n        ");
        // 添加被动技能 Tooltip
        var passiveTooltipData = {
            title: survivor.data.passiveSkill.name,
            description: survivor.data.passiveSkill.description || '被动技能',
            effects: ['类型: 被动技能', "\u89E6\u53D1\u6761\u4EF6: ".concat(survivor.data.passiveSkill.trigger || '持续效果')]
        };
        passiveEl.addEventListener('mouseenter', function () {
            _this.showTooltip(passiveEl, passiveTooltipData);
        });
        passiveEl.addEventListener('mouseleave', function () {
            _this.hideTooltip();
        });
        this.survivorSkillContainer.appendChild(passiveEl);
        // 创建主动技能按钮
        var skillButton = document.createElement('button');
        skillButton.className = 'survivor-skill-button';
        var buttonContent = "<span class=\"skill-name\">".concat(activeSkill.name, "</span>");
        if (activeSkill.cost) {
            buttonContent += " <span class=\"skill-cost\">(".concat(activeSkill.cost, " AP)</span>");
        }
        if (activeSkill.currentCooldown && activeSkill.currentCooldown > 0) {
            buttonContent += " <span class=\"skill-cooldown\">[".concat(activeSkill.currentCooldown, "\u56DE\u5408]</span>");
            skillButton.disabled = true;
        }
        else if (activeSkill.cost && player.actionPoints < activeSkill.cost) {
            buttonContent += " <span class=\"skill-cooldown\">[AP\u4E0D\u8DB3]</span>";
            skillButton.disabled = true;
        }
        skillButton.innerHTML = buttonContent;
        // 添加主动技能 Tooltip
        var activeTooltipData = {
            title: activeSkill.name,
            description: activeSkill.description || '主动技能',
            cost: activeSkill.cost,
            effects: []
        };
        if (activeSkill.cooldown) {
            activeTooltipData.effects.push("\u51B7\u5374\u65F6\u95F4: ".concat(activeSkill.cooldown, " \u56DE\u5408"));
        }
        if (activeSkill.currentCooldown && activeSkill.currentCooldown > 0) {
            activeTooltipData.effects.push("\u5269\u4F59\u51B7\u5374: ".concat(activeSkill.currentCooldown, " \u56DE\u5408"));
        }
        skillButton.addEventListener('mouseenter', function () {
            _this.showTooltip(skillButton, activeTooltipData);
        });
        skillButton.addEventListener('mouseleave', function () {
            _this.hideTooltip();
        });
        if (!skillButton.disabled) {
            skillButton.addEventListener('click', function () {
                if (_this.survivorSkillContainer.onSurvivorSkill) {
                    _this.survivorSkillContainer.onSurvivorSkill();
                }
            });
        }
        this.survivorSkillContainer.appendChild(skillButton);
    };
    BattleUI.prototype.renderEquipment = function (player) {
        var _this = this;
        // 清空装备列表
        this.equipmentList.innerHTML = '';
        // 如果没有装备，显示提示信息
        if (!player.equipment || player.equipment.length === 0) {
            var emptyMsg = document.createElement('div');
            emptyMsg.className = 'equipment-empty';
            emptyMsg.style.cssText = 'text-align: center; color: #666; font-size: 0.75em; padding: 8px;';
            emptyMsg.textContent = '暂无装备';
            this.equipmentList.appendChild(emptyMsg);
            return;
        }
        // 显示每个装备
        player.equipment.forEach(function (equipment, index) {
            var equipmentEl = document.createElement('div');
            equipmentEl.className = 'equipment-item';
            // 装备名称
            var nameEl = document.createElement('div');
            nameEl.className = 'equipment-name';
            nameEl.textContent = equipment.name;
            // 装备效果描述（简化版）
            var effectEl = document.createElement('div');
            effectEl.className = 'equipment-effect';
            // 简化装备效果描述
            var effectText = '';
            if ('damage' in equipment && equipment.damage) {
                effectText = "\u4F24\u5BB3+".concat(equipment.damage);
            }
            else if ('passiveEffect' in equipment && equipment.passiveEffect) {
                var passive = equipment.passiveEffect; // 使用any类型来避免类型错误
                if (passive.bonusAttack)
                    effectText = "\u653B\u51FB+".concat(passive.bonusAttack);
                else if (passive.damageReduction)
                    effectText = "\u51CF\u4F24+".concat(passive.damageReduction);
                else if (passive.shieldOnTurnStart)
                    effectText = "\u56DE\u5408\u5F00\u59CB\u62A4\u76FE+".concat(passive.shieldOnTurnStart);
                else
                    effectText = '特殊效果';
            }
            else if (equipment.description) {
                // 如果有描述，使用描述的前15个字符
                effectText = equipment.description.length > 15
                    ? equipment.description.substring(0, 15) + '...'
                    : equipment.description;
            }
            if (effectText) {
                effectEl.textContent = effectText;
            }
            else {
                effectEl.textContent = '装备效果';
            }
            equipmentEl.appendChild(nameEl);
            equipmentEl.appendChild(effectEl);
            // 添加装备详情的Tooltip
            var equipmentTooltipData = {
                title: equipment.name,
                description: equipment.description || '装备卡牌',
                effects: ['类型: 装备卡']
            };
            if ('damage' in equipment && equipment.damage) {
                equipmentTooltipData.effects.push("\u57FA\u7840\u4F24\u5BB3: ".concat(equipment.damage));
            }
            if ('passiveEffect' in equipment && equipment.passiveEffect) {
                var passive = equipment.passiveEffect; // 使用any类型来避免类型错误
                if (passive.bonusAttack)
                    equipmentTooltipData.effects.push("\u653B\u51FB\u52A0\u6210: +".concat(passive.bonusAttack));
                if (passive.damageReduction)
                    equipmentTooltipData.effects.push("\u4F24\u5BB3\u51CF\u514D: +".concat(passive.damageReduction));
                if (passive.shieldOnTurnStart)
                    equipmentTooltipData.effects.push("\u56DE\u5408\u5F00\u59CB\u83B7\u5F97\u62A4\u76FE: +".concat(passive.shieldOnTurnStart));
                if (passive.cardDrawOnTurnStart)
                    equipmentTooltipData.effects.push("\u56DE\u5408\u5F00\u59CB\u62BD\u724C: +".concat(passive.cardDrawOnTurnStart));
            }
            equipmentEl.addEventListener('mouseenter', function () {
                _this.showTooltip(equipmentEl, equipmentTooltipData);
            });
            equipmentEl.addEventListener('mouseleave', function () {
                _this.hideTooltip();
            });
            _this.equipmentList.appendChild(equipmentEl);
        });
    };
    BattleUI.prototype.logAction = function (message, type) {
        // 日志功能已移除 - 可以选择在控制台输出或完全移除
        console.log("[".concat(type.toUpperCase(), "] ").concat(message));
    };
    BattleUI.prototype.toggleEndTurnButton = function (enabled) {
        this.endTurnBtn.disabled = !enabled;
    };
    // ========================= Tooltip 系统 ========================= //
    BattleUI.prototype.showTooltip = function (element, tooltipData, delay) {
        var _this = this;
        if (delay === void 0) { delay = 200; }
        // 清除之前的定时器
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
        }
        this.tooltipTimeout = setTimeout(function () {
            _this.updateTooltipContent(tooltipData);
            _this.positionTooltip(element);
            _this.tooltipContainer.classList.remove('hidden');
        }, delay);
    };
    BattleUI.prototype.hideTooltip = function () {
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
            this.tooltipTimeout = null;
        }
        this.tooltipContainer.classList.add('hidden');
    };
    BattleUI.prototype.updateTooltipContent = function (data) {
        this.tooltipTitle.textContent = data.title;
        if (data.cost !== undefined && data.cost > 0) {
            this.tooltipCost.textContent = "".concat(data.cost, " AP");
            this.tooltipCost.style.display = 'inline-block';
        }
        else {
            this.tooltipCost.style.display = 'none';
        }
        this.tooltipDescription.innerHTML = this.formatDescription(data.description);
        if (data.effects && data.effects.length > 0) {
            this.tooltipEffects.innerHTML = data.effects
                .map(function (effect) { return "<div class=\"tooltip-effect-item\">".concat(effect, "</div>"); })
                .join('');
            this.tooltipEffects.style.display = 'block';
        }
        else {
            this.tooltipEffects.style.display = 'none';
        }
    };
    BattleUI.prototype.formatDescription = function (description) {
        // 突出显示关键词
        var keywords = ['抽卡', '伤害', '治疗', '护盾', '眩晕', '灰心', '燃烧', '冻结', '中毒', '虚弱', '加速', '复活'];
        var formatted = description;
        keywords.forEach(function (keyword) {
            var regex = new RegExp(keyword, 'g');
            formatted = formatted.replace(regex, "<span class=\"tooltip-keyword\">".concat(keyword, "</span>"));
        });
        return formatted;
    };
    BattleUI.prototype.positionTooltip = function (element) {
        var elementRect = element.getBoundingClientRect();
        var tooltipRect = this.tooltipContainer.getBoundingClientRect();
        var viewportWidth = window.innerWidth;
        var viewportHeight = window.innerHeight;
        var left = elementRect.left + elementRect.width / 2;
        var top = elementRect.top - tooltipRect.height - 10;
        // 水平边界检查
        if (left + tooltipRect.width / 2 > viewportWidth) {
            left = viewportWidth - tooltipRect.width - 10;
        }
        else if (left - tooltipRect.width / 2 < 0) {
            left = 10;
        }
        else {
            left = left - tooltipRect.width / 2;
        }
        // 垂直边界检查
        if (top < 0) {
            top = elementRect.bottom + 10;
        }
        this.tooltipContainer.style.left = "".concat(left, "px");
        this.tooltipContainer.style.top = "".concat(top, "px");
    };
    // ========================= 卡牌 Tooltip 支持 ========================= //
    BattleUI.prototype.addCardTooltip = function (cardEl, card) {
        var _this = this;
        var tooltipData = {
            title: card.name,
            description: card.description,
            effects: []
        };
        if ('cost' in card) {
            tooltipData.cost = card.cost;
        }
        // 根据卡牌类型添加额外信息
        if (card.type === 'Equipment') {
            tooltipData.effects.push('类型: 装备卡');
        }
        else if (card.type === 'Counter') {
            tooltipData.effects.push('类型: 反制卡');
        }
        if (card.isPiercing) {
            tooltipData.effects.push('特性: 穿刺（无视护盾）');
        }
        if (card.isRemovedOnPlay) {
            tooltipData.effects.push('使用后: 移除出游戏');
        }
        cardEl.addEventListener('mouseenter', function () {
            _this.showTooltip(cardEl, tooltipData);
        });
        cardEl.addEventListener('mouseleave', function () {
            _this.hideTooltip();
        });
    };
    BattleUI.prototype.setupDragAndDrop = function (onCardDrop) {
        var _this = this;
        this.playerHand.addEventListener('dragstart', function (e) {
            var target = e.target;
            if (target.classList.contains('battle-card') && target.draggable) {
                e.dataTransfer.setData('text/plain', target.dataset.cardIndex);
                setTimeout(function () { return target.classList.add('dragging'); }, 0);
            }
            else {
                e.preventDefault();
            }
        });
        this.playerHand.addEventListener('dragend', function (e) {
            var target = e.target;
            if (target.classList.contains('battle-card')) {
                target.classList.remove('dragging');
            }
        });
        this.dropZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            _this.dropZone.classList.add('drag-over');
        });
        this.dropZone.addEventListener('dragleave', function () {
            _this.dropZone.classList.remove('drag-over');
        });
        this.dropZone.addEventListener('drop', function (e) {
            e.preventDefault();
            _this.dropZone.classList.remove('drag-over');
            var cardIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
            if (!isNaN(cardIndex)) {
                onCardDrop(cardIndex);
            }
        });
    };
    BattleUI.prototype.showFloatingText = function (target, text, type) {
        var container = target === 'player' ? this.playerFloatingTextContainer : this.enemyFloatingTextContainer;
        if (!container) {
            console.error("\u65E0\u6CD5\u4E3A ".concat(target, " \u627E\u5230\u6D6E\u52A8\u6587\u5B57\u5BB9\u5668\uFF01"));
            return;
        }
        var textEl = document.createElement('div');
        textEl.className = "floating-text ".concat(type);
        textEl.textContent = text;
        container.appendChild(textEl);
        setTimeout(function () { return textEl.remove(); }, 1500);
    };
    // ================== 解决方案：重写此方法以支持不同目标 ==================
    BattleUI.prototype.playPlayerCardAnimation = function (cardIndex, target) {
        var _this = this;
        var cardEl = this.playerHand.querySelector("[data-card-index=\"".concat(cardIndex, "\"]"));
        if (!cardEl)
            return;
        var dropZoneRect = this.dropZone.getBoundingClientRect();
        var cardRect = cardEl.getBoundingClientRect();
        // 步骤1：飞到出牌区 (逻辑不变)
        var x1 = dropZoneRect.left + (dropZoneRect.width / 2) - cardRect.left - (cardRect.width / 2);
        var y1 = dropZoneRect.top + (dropZoneRect.height / 2) - cardRect.top - (cardRect.height / 2);
        cardEl.classList.add('playing-step1');
        cardEl.style.transform = "translate(".concat(x1, "px, ").concat(y1, "px) scale(1.1)");
        // 步骤2：根据目标飞向不同位置
        setTimeout(function () {
            // 决定最终目标是玩家还是敌人
            var targetElement = target === 'player' ? _this.playerName : _this.enemyName;
            var targetRect = targetElement.getBoundingClientRect();
            var x2 = targetRect.left + (targetRect.width / 2) - cardRect.left - (cardRect.width / 2);
            var y2 = targetRect.top + (targetRect.height / 2) - cardRect.top - (cardRect.height / 2);
            cardEl.classList.remove('playing-step1');
            cardEl.classList.add('playing-step2');
            cardEl.style.transform = "translate(".concat(x2, "px, ").concat(y2, "px) scale(0.5)");
            cardEl.style.opacity = '0';
            setTimeout(function () {
                cardEl.remove();
            }, 500); // 动画完成后移除卡牌元素
        }, 400); // 步骤1动画时长
    };
    // ====================================================================
    BattleUI.prototype.playCounterCardAnimation = function (cardIndex, callback) {
        console.log("[DEBUG] playCounterCardAnimation \u5F00\u59CB, cardIndex: ".concat(cardIndex));
        var cardEl = this.playerHand.querySelector("[data-card-index=\"".concat(cardIndex, "\"]"));
        if (!cardEl) {
            console.log("[DEBUG] \u627E\u4E0D\u5230\u5361\u724C\u5143\u7D20\uFF0C\u76F4\u63A5\u8C03\u7528\u56DE\u8C03");
            // 如果找不到卡牌元素，直接调用回调
            if (callback) {
                console.log("[DEBUG] \u6267\u884C\u56DE\u8C03\u51FD\u6570");
                callback();
            }
            return;
        }
        console.log("[DEBUG] \u627E\u5230\u5361\u724C\u5143\u7D20\uFF0C\u5F00\u59CB\u52A8\u753B");
        var dropZoneRect = this.dropZone.getBoundingClientRect();
        var cardRect = cardEl.getBoundingClientRect();
        // 给反制牌添加特殊的动画类
        cardEl.classList.add('counter-animation');
        // 飞向牌桌中心
        var x1 = dropZoneRect.left + (dropZoneRect.width / 2) - cardRect.left - (cardRect.width / 2);
        var y1 = dropZoneRect.top + (dropZoneRect.height / 2) - cardRect.top - (cardRect.height / 2);
        cardEl.style.transform = "translate(".concat(x1, "px, ").concat(y1, "px) scale(1.2)");
        cardEl.style.opacity = '1';
        console.log("[DEBUG] \u7B2C\u4E00\u9636\u6BB5\u52A8\u753B\u8BBE\u7F6E\u5B8C\u6210\uFF0C800ms\u540E\u8FDB\u5165\u7B2C\u4E8C\u9636\u6BB5");
        // 添加发光效果和消失动画
        setTimeout(function () {
            console.log("[DEBUG] \u7B2C\u4E8C\u9636\u6BB5\u52A8\u753B\u5F00\u59CB");
            cardEl.style.transform = "translate(".concat(x1, "px, ").concat(y1, "px) scale(0.8)");
            cardEl.style.opacity = '0';
            setTimeout(function () {
                console.log("[DEBUG] \u52A8\u753B\u5B8C\u6210\uFF0C\u79FB\u9664\u5361\u724C\u5143\u7D20");
                cardEl.remove();
                // 在动画结束后调用回调
                if (callback) {
                    console.log("[DEBUG] \u6267\u884C\u52A8\u753B\u5B8C\u6210\u56DE\u8C03\u51FD\u6570");
                    callback();
                }
                else {
                    console.log("[DEBUG] \u6CA1\u6709\u56DE\u8C03\u51FD\u6570\u9700\u8981\u6267\u884C");
                }
            }, 500);
        }, 800);
    };
    BattleUI.prototype.playEnemyCardAnimation = function (card) {
        var _this = this;

        this.playSound('../assets/audios/CardPlay.MP3');

        var cardEl = this.createCardElement(card);
        cardEl.style.position = 'absolute';
        cardEl.style.opacity = '0';
        var enemyCardAreaRect = this.enemyCardArea.getBoundingClientRect();
        cardEl.style.left = "".concat(enemyCardAreaRect.left, "px");
        cardEl.style.top = "".concat(enemyCardAreaRect.top, "px");
        document.body.appendChild(cardEl);
        requestAnimationFrame(function () {
            var dropZoneRect = _this.dropZone.getBoundingClientRect();
            var x1 = dropZoneRect.left + (dropZoneRect.width / 2) - enemyCardAreaRect.left - (cardEl.offsetWidth / 2);
            var y1 = dropZoneRect.top + (dropZoneRect.height / 2) - enemyCardAreaRect.top - (cardEl.offsetHeight / 2);
            cardEl.classList.add('playing-step1');
            cardEl.style.opacity = '1';
            cardEl.style.transform = "translate(".concat(x1, "px, ").concat(y1, "px) scale(1.1)");
        });
        setTimeout(function () {
            var cardCurrentRect = cardEl.getBoundingClientRect();
            var targetRect = _this.playerName.getBoundingClientRect();
            var x2 = targetRect.left + (targetRect.width / 2) - cardCurrentRect.left - (cardEl.offsetWidth / 2);
            var y2 = targetRect.top + (targetRect.height / 2) - cardCurrentRect.top - (cardEl.offsetHeight / 2);
            cardEl.classList.remove('playing-step1');
            cardEl.classList.add('playing-step2');
            cardEl.style.transform = "translate(".concat(x2, "px, ").concat(y2, "px) scale(0.5)");
            cardEl.style.opacity = '0';
            setTimeout(function () {
                cardEl.remove();
            }, 500);
        }, 1000);
    };
    BattleUI.prototype.showGameOverModal = function (didPlayerWin) {
        
        this.stopBackgroundMusic();

        // 2. 然后根据结果播放胜利或失败的音效
        if (didPlayerWin) {
            this.playSound('../assets/audios/Victory.mp3'); 
        } else {
            this.playSound('../assets/audios/Defeat.mp3');
        }
        
        this.gameOverText.textContent = didPlayerWin ? "胜利！" : "失败...";
        this.gameOverText.className = didPlayerWin ? 'win' : 'lose';
        this.gameOverModal.classList.remove('hidden');
        // 🆕 新增：更新返回按钮的URL，携带战斗结果
        // 战斗页：把 ch4 → battle4
        const ch2battle = {
        1: 'battle4',
        2: 'battle7', 3: 'battle9', 4: 'battle12',
        5: 'battle14',6: 'battle17'
        };

        var returnButton = document.querySelector('#game-over-modal a[href="../game.html"]');
        if (returnButton) {
        var urlParams = new URLSearchParams(window.location.search);
        var ch  = urlParams.get('chapter') || 'unknown'; // 拿到的是 ch4
        var battle = ch2battle[ch] || ch;                // 反向映射成 battle4
        var result = didPlayerWin ? 'win' : 'lose';
        returnButton.href = `../game.html?from=${battle}&result=${result}`;
        console.log('设置返回URL:', returnButton.href);
        }
    };
    return BattleUI;
}());
export { BattleUI };
//# sourceMappingURL=BattleUI.js.map