import { Player, Enemy } from '../components/Character.js';
import { Card, ActionCard, CounterCard } from '../components/Card.js';
import { Follower } from '../components/Follower.js';

type CardClickCallback = (index: number) => void;
type SkillClickCallback = (index: number) => void;
type SurvivorSkillCallback = () => void;
type EndTurnCallback = () => void;

interface TooltipData {
    title: string;
    description: string;
    cost?: number;
    effects?: string[];
}

export class BattleUI {
    private battleScreen: HTMLElement;
    private playerName: HTMLElement;
    private playerHpText: HTMLElement;
    private playerHpFill: HTMLElement;
    private playerAp: HTMLElement;
    private playerShield: HTMLElement;
    private enemyName: HTMLElement;
    private enemyHpText: HTMLElement;
    private enemyHpFill: HTMLElement;
    private enemyShield: HTMLElement;
    private playerHand: HTMLElement;
    private followerArea: HTMLElement;
    private endTurnBtn: HTMLButtonElement;
    private dropZone: HTMLElement;
    private gameOverModal: HTMLElement;
    private gameOverText: HTMLElement;
    private restartBtn: HTMLButtonElement;
    private playerFloatingTextContainer: HTMLElement;
    private enemyFloatingTextContainer: HTMLElement;
    private enemyCardArea: HTMLElement;
    private survivorSkillContainer: HTMLElement;
    private equipmentArea: HTMLElement;
    private equipmentList: HTMLElement;
    // Tooltip 系统
    private tooltipContainer: HTMLElement;
    private tooltipTitle: HTMLElement;
    private tooltipCost: HTMLElement;
    private tooltipDescription: HTMLElement;
    private tooltipEffects: HTMLElement;
    private tooltipTimeout: number | null = null;

    constructor(
        onCardClick: CardClickCallback,
        onSkillClick: SkillClickCallback,
        onEndTurn: EndTurnCallback,
        onSurvivorSkill?: SurvivorSkillCallback
    ) {
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
            this.endTurnBtn = this.getRequiredElement('end-turn-btn') as HTMLButtonElement;
            this.dropZone = this.getRequiredElement('drop-zone');
            this.gameOverModal = this.getRequiredElement('game-over-modal');
            this.gameOverText = this.getRequiredElement('game-over-text');
            this.restartBtn = this.getRequiredElement('restart-btn') as HTMLButtonElement;
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
            this.restartBtn.addEventListener('click', () => window.location.reload());
        } catch (error) {
            console.error('BattleUI初始化失败:', error);
            throw error;
        }

        (this.playerHand as any).onCardClick = onCardClick;
        (this.followerArea as any).onSkillClick = onSkillClick;
        (this.survivorSkillContainer as any).onSurvivorSkill = onSurvivorSkill;

        this.setupDragAndDrop(onCardClick);
    }
    
    // 安全获取DOM元素的辅助方法
    private getRequiredElement(selector: string, useQuerySelector = false): HTMLElement {
        const element = useQuerySelector ? 
            document.querySelector(selector) as HTMLElement : 
            document.getElementById(selector);
            
        if (!element) {
            throw new Error(`无法找到必需的DOM元素: ${selector}`);
        }
        return element;
    }

    public show() {
        this.battleScreen.classList.remove('hidden');
    }
    
    public updateAll(player: Player, enemy: Enemy, isDiscardMode = false) {
        this.updateHealth(player, enemy);
        this.updateActionPoints(player.actionPoints);
        this.renderPlayerHand(player.hand, player.actionPoints, isDiscardMode);
        this.renderFollowers(player.followers, player.actionPoints);
        this.renderSurvivorSkill(player);
        this.renderEquipment(player);
        this.playerName.textContent = player.name;
        this.enemyName.textContent = enemy.name;
    }

    public updateHealth(player: Player, enemy: Enemy) {
        this.playerHpText.textContent = `${player.currentHp} / ${player.maxHp}`;
        this.playerHpFill.style.width = `${(player.currentHp / player.maxHp) * 100}%`;
        this.enemyHpText.textContent = `${enemy.currentHp} / ${enemy.maxHp}`;
        this.enemyHpFill.style.width = `${(enemy.currentHp / enemy.maxHp) * 100}%`;

        if (this.playerShield) {
            this.playerShield.textContent = `护盾: ${player.shield}`;
            this.playerShield.style.display = player.shield > 0 ? 'block' : 'none';
        }
        if (this.enemyShield) {
            this.enemyShield.textContent = `护盾: ${enemy.shield}`;
            this.enemyShield.style.display = enemy.shield > 0 ? 'block' : 'none';
        }
    }

    public updateActionPoints(ap: number) {
        this.playerAp.textContent = `行动点: ${ap}`;
    }
    
    private createCardElement(card: Card): HTMLElement {
        const cardEl = document.createElement('div');
        cardEl.className = 'battle-card';
        if (card instanceof CounterCard) {
            cardEl.classList.add('counter-card');
        }
        cardEl.dataset.cardId = card.id;
        
        const cost = 'cost' in card ? (card as ActionCard).cost : 0;
        const cardData = (card as any).data || {}; // 获取卡牌数据以访问图片路径
        const imagePath = cardData.image || this.getDefaultImagePath(card);
        
        cardEl.innerHTML = `
            <div class="card-content">
                ${imagePath ? `<div class="card-image"><img src="${imagePath}" alt="${card.name}" onerror="this.style.display='none'"></div>` : ''}
                <div class="card-name">${card.name}<span class="card-cost">${cost > 0 ? cost : ''}</span></div>
                <p class="card-description">${card.description}</p>
            </div>
        `;
        return cardEl;
    }

    private getDefaultImagePath(card: Card): string {
        // 根据卡牌类型返回默认图片路径
        const baseDir = 'assets/images/cards/';
        
        // 根据卡牌名称和类型匹配图片
        const imageMap: { [key: string]: string } = {
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
        
        const imageName = imageMap[card.name];
        return imageName ? baseDir + imageName : '';
    }

    public renderPlayerHand(hand: Card[], currentAp: number, isDiscardMode = false) {
        this.playerHand.innerHTML = '';
        hand.forEach((card, index) => {
            const cardEl = this.createCardElement(card);
            cardEl.dataset.cardIndex = String(index);
            
            let isPlayable = false;
            // 反制牌不能主动使用
            if (card instanceof CounterCard) {
                isPlayable = false;
                cardEl.draggable = false;
            } else if ('cost' in card) {
                isPlayable = (card as ActionCard).cost <= currentAp;
            } else {
                isPlayable = true;
            }
            
            if (isDiscardMode) {
                cardEl.classList.add('playable');
                cardEl.addEventListener('click', () => (this.playerHand as any).onCardClick(index));
            } else {
                if (isPlayable) {
                    cardEl.draggable = true;
                    cardEl.classList.add('playable');
                }
            }
            
            // 添加 Tooltip 功能
            this.addCardTooltip(cardEl, card);
            
            this.playerHand.appendChild(cardEl);
        });
    }

    public renderFollowers(followers: Follower[], currentAp: number) {
        this.followerArea.innerHTML = '';
        followers.forEach((follower, index) => {
            const followerEl = document.createElement('div');
            followerEl.className = 'follower-card';
            const skill = follower.activeSkill;
            let skillStatus = '';
            if (follower.currentCooldown > 0) {
                skillStatus = `<div class="skill-cooldown">冷却中: ${follower.currentCooldown}</div>`;
            } else if (skill.cost > currentAp) {
                skillStatus = `<div class="skill-cooldown">行动点不足</div>`;
            }
            followerEl.innerHTML = `
                <div class="follower-name">${follower.name}</div>
                <p class="skill-description"><b>主动:</b> ${skill.name} (消耗:${skill.cost})</p>
                ${skillStatus}
            `;
            if (follower.currentCooldown === 0 && skill.cost <= currentAp) {
                followerEl.classList.add('playable');
                followerEl.addEventListener('click', () => (this.followerArea as any).onSkillClick(index));
            }
            
            // 添加随从 Tooltip
            const followerTooltipData: TooltipData = {
                title: follower.name,
                description: `主动技能: ${skill.name}`,
                cost: skill.cost,
                effects: [
                    `冷却时间: ${skill.cooldown} 回合`,
                    `被动技能: ${follower.passiveSkill.name}`
                ]
            };
            
            if (follower.currentCooldown > 0) {
                followerTooltipData.effects!.push(`剩余冷却: ${follower.currentCooldown} 回合`);
            }
            
            followerEl.addEventListener('mouseenter', () => {
                this.showTooltip(followerEl, followerTooltipData);
            });
            
            followerEl.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
            
            this.followerArea.appendChild(followerEl);
        });
    }

    public renderSurvivorSkill(player: Player) {
        this.survivorSkillContainer.innerHTML = '';
        
        if (!player.survivor) return;

        const survivor = player.survivor;
        const activeSkill = survivor.data.activeSkill;
        
        // 创建被动技能显示
        const passiveEl = document.createElement('div');
        passiveEl.className = 'survivor-skill-info';
        passiveEl.innerHTML = `
            <div style="font-size: 0.7em; color: #aaa; margin-bottom: 2px;">被动: ${survivor.data.passiveSkill.name}</div>
        `;
        
        // 添加被动技能 Tooltip
        const passiveTooltipData: TooltipData = {
            title: survivor.data.passiveSkill.name,
            description: survivor.data.passiveSkill.description || '被动技能',
            effects: ['类型: 被动技能', `触发条件: ${survivor.data.passiveSkill.trigger || '持续效果'}`]
        };
        
        passiveEl.addEventListener('mouseenter', () => {
            this.showTooltip(passiveEl, passiveTooltipData);
        });
        
        passiveEl.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
        
        this.survivorSkillContainer.appendChild(passiveEl);

        // 创建主动技能按钮
        const skillButton = document.createElement('button');
        skillButton.className = 'survivor-skill-button';
        
        let buttonContent = `<span class="skill-name">${activeSkill.name}</span>`;
        
        if (activeSkill.cost) {
            buttonContent += ` <span class="skill-cost">(${activeSkill.cost} AP)</span>`;
        }
        
        if (activeSkill.currentCooldown && activeSkill.currentCooldown > 0) {
            buttonContent += ` <span class="skill-cooldown">[${activeSkill.currentCooldown}回合]</span>`;
            skillButton.disabled = true;
        } else if (activeSkill.cost && player.actionPoints < activeSkill.cost) {
            buttonContent += ` <span class="skill-cooldown">[AP不足]</span>`;
            skillButton.disabled = true;
        }

        skillButton.innerHTML = buttonContent;
        
        // 添加主动技能 Tooltip
        const activeTooltipData: TooltipData = {
            title: activeSkill.name,
            description: activeSkill.description || '主动技能',
            cost: activeSkill.cost,
            effects: []
        };
        
        if (activeSkill.cooldown) {
            activeTooltipData.effects!.push(`冷却时间: ${activeSkill.cooldown} 回合`);
        }
        
        if (activeSkill.currentCooldown && activeSkill.currentCooldown > 0) {
            activeTooltipData.effects!.push(`剩余冷却: ${activeSkill.currentCooldown} 回合`);
        }
        
        skillButton.addEventListener('mouseenter', () => {
            this.showTooltip(skillButton, activeTooltipData);
        });
        
        skillButton.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
        
        if (!skillButton.disabled) {
            skillButton.addEventListener('click', () => {
                if ((this.survivorSkillContainer as any).onSurvivorSkill) {
                    (this.survivorSkillContainer as any).onSurvivorSkill();
                }
            });
        }

        this.survivorSkillContainer.appendChild(skillButton);
    }

    public renderEquipment(player: Player) {
        // 清空装备列表
        this.equipmentList.innerHTML = '';
        
        // 如果没有装备，显示提示信息
        if (!player.equipment || player.equipment.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'equipment-empty';
            emptyMsg.style.cssText = 'text-align: center; color: #666; font-size: 0.75em; padding: 8px;';
            emptyMsg.textContent = '暂无装备';
            this.equipmentList.appendChild(emptyMsg);
            return;
        }

        // 显示每个装备
        player.equipment.forEach((equipment, index) => {
            const equipmentEl = document.createElement('div');
            equipmentEl.className = 'equipment-item';
            
            // 装备名称
            const nameEl = document.createElement('div');
            nameEl.className = 'equipment-name';
            nameEl.textContent = equipment.name;
            
            // 装备效果描述（简化版）
            const effectEl = document.createElement('div');
            effectEl.className = 'equipment-effect';
            
            // 简化装备效果描述
            let effectText = '';
            if ('damage' in equipment && equipment.damage) {
                effectText = `伤害+${equipment.damage}`;
            } else if ('passiveEffect' in equipment && equipment.passiveEffect) {
                const passive = equipment.passiveEffect as any; // 使用any类型来避免类型错误
                if (passive.bonusAttack) effectText = `攻击+${passive.bonusAttack}`;
                else if (passive.damageReduction) effectText = `减伤+${passive.damageReduction}`;
                else if (passive.shieldOnTurnStart) effectText = `回合开始护盾+${passive.shieldOnTurnStart}`;
                else effectText = '特殊效果';
            } else if (equipment.description) {
                // 如果有描述，使用描述的前15个字符
                effectText = equipment.description.length > 15 
                    ? equipment.description.substring(0, 15) + '...' 
                    : equipment.description;
            }
            
            if (effectText) {
                effectEl.textContent = effectText;
            } else {
                effectEl.textContent = '装备效果';
            }
            
            equipmentEl.appendChild(nameEl);
            equipmentEl.appendChild(effectEl);
            
            // 添加装备详情的Tooltip
            const equipmentTooltipData: TooltipData = {
                title: equipment.name,
                description: equipment.description || '装备卡牌',
                effects: ['类型: 装备卡']
            };
            
            if ('damage' in equipment && equipment.damage) {
                equipmentTooltipData.effects!.push(`基础伤害: ${equipment.damage}`);
            }
            
            if ('passiveEffect' in equipment && equipment.passiveEffect) {
                const passive = equipment.passiveEffect as any; // 使用any类型来避免类型错误
                if (passive.bonusAttack) equipmentTooltipData.effects!.push(`攻击加成: +${passive.bonusAttack}`);
                if (passive.damageReduction) equipmentTooltipData.effects!.push(`伤害减免: +${passive.damageReduction}`);
                if (passive.shieldOnTurnStart) equipmentTooltipData.effects!.push(`回合开始获得护盾: +${passive.shieldOnTurnStart}`);
                if (passive.cardDrawOnTurnStart) equipmentTooltipData.effects!.push(`回合开始抽牌: +${passive.cardDrawOnTurnStart}`);
            }
            
            equipmentEl.addEventListener('mouseenter', () => {
                this.showTooltip(equipmentEl, equipmentTooltipData);
            });
            
            equipmentEl.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
            
            this.equipmentList.appendChild(equipmentEl);
        });
    }

    public logAction(message: string, type: 'player' | 'enemy' | 'system' | 'info') {
        // 日志功能已移除 - 可以选择在控制台输出或完全移除
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    public toggleEndTurnButton(enabled: boolean) {
        this.endTurnBtn.disabled = !enabled;
    }

    // ========================= Tooltip 系统 ========================= //
    
    public showTooltip(element: HTMLElement, tooltipData: TooltipData, delay: number = 200) {
        // 清除之前的定时器
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
        }
        
        this.tooltipTimeout = setTimeout(() => {
            this.updateTooltipContent(tooltipData);
            this.positionTooltip(element);
            this.tooltipContainer.classList.remove('hidden');
        }, delay);
    }
    
    public hideTooltip() {
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
            this.tooltipTimeout = null;
        }
        this.tooltipContainer.classList.add('hidden');
    }
    
    private updateTooltipContent(data: TooltipData) {
        this.tooltipTitle.textContent = data.title;
        
        if (data.cost !== undefined && data.cost > 0) {
            this.tooltipCost.textContent = `${data.cost} AP`;
            this.tooltipCost.style.display = 'inline-block';
        } else {
            this.tooltipCost.style.display = 'none';
        }
        
        this.tooltipDescription.innerHTML = this.formatDescription(data.description);
        
        if (data.effects && data.effects.length > 0) {
            this.tooltipEffects.innerHTML = data.effects
                .map(effect => `<div class="tooltip-effect-item">${effect}</div>`)
                .join('');
            this.tooltipEffects.style.display = 'block';
        } else {
            this.tooltipEffects.style.display = 'none';
        }
    }
    
    private formatDescription(description: string): string {
        // 突出显示关键词
        const keywords = ['抽卡', '伤害', '治疗', '护盾', '眩晕', '灰心', '燃烧', '冻结', '中毒', '虚弱', '加速', '复活'];
        let formatted = description;
        
        keywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'g');
            formatted = formatted.replace(regex, `<span class="tooltip-keyword">${keyword}</span>`);
        });
        
        return formatted;
    }
    
    private positionTooltip(element: HTMLElement) {
        const elementRect = element.getBoundingClientRect();
        const tooltipRect = this.tooltipContainer.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = elementRect.left + elementRect.width / 2;
        let top = elementRect.top - tooltipRect.height - 10;
        
        // 水平边界检查
        if (left + tooltipRect.width / 2 > viewportWidth) {
            left = viewportWidth - tooltipRect.width - 10;
        } else if (left - tooltipRect.width / 2 < 0) {
            left = 10;
        } else {
            left = left - tooltipRect.width / 2;
        }
        
        // 垂直边界检查
        if (top < 0) {
            top = elementRect.bottom + 10;
        }
        
        this.tooltipContainer.style.left = `${left}px`;
        this.tooltipContainer.style.top = `${top}px`;
    }

    // ========================= 卡牌 Tooltip 支持 ========================= //
    
    private addCardTooltip(cardEl: HTMLElement, card: Card) {
        const tooltipData: TooltipData = {
            title: card.name,
            description: card.description,
            effects: []
        };
        
        if ('cost' in card) {
            tooltipData.cost = (card as ActionCard).cost;
        }
        
        // 根据卡牌类型添加额外信息
        if (card.type === 'Equipment') {
            tooltipData.effects!.push('类型: 装备卡');
        } else if (card.type === 'Counter') {
            tooltipData.effects!.push('类型: 反制卡');
        }
        
        if (card.isPiercing) {
            tooltipData.effects!.push('特性: 穿刺（无视护盾）');
        }
        
        if (card.isRemovedOnPlay) {
            tooltipData.effects!.push('使用后: 移除出游戏');
        }
        
        cardEl.addEventListener('mouseenter', () => {
            this.showTooltip(cardEl, tooltipData);
        });
        
        cardEl.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
    }

    private setupDragAndDrop(onCardDrop: CardClickCallback): void {
        this.playerHand.addEventListener('dragstart', (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('battle-card') && target.draggable) {
                e.dataTransfer!.setData('text/plain', target.dataset.cardIndex!);
                setTimeout(() => target.classList.add('dragging'), 0);
            } else {
                e.preventDefault();
            }
        });

        this.playerHand.addEventListener('dragend', (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('battle-card')) {
                target.classList.remove('dragging');
            }
        });

        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-over');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('drag-over');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
            const cardIndex = parseInt(e.dataTransfer!.getData('text/plain'), 10);
            if (!isNaN(cardIndex)) {
                onCardDrop(cardIndex);
            }
        });
    }
    
    public showFloatingText(target: 'player' | 'enemy', text: string, type: 'damage' | 'heal'): void {
        const container = target === 'player' ? this.playerFloatingTextContainer : this.enemyFloatingTextContainer;
        if (!container) {
            console.error(`无法为 ${target} 找到浮动文字容器！`);
            return;
        }
        const textEl = document.createElement('div');
        textEl.className = `floating-text ${type}`;
        textEl.textContent = text;
        container.appendChild(textEl);
        setTimeout(() => textEl.remove(), 1500);
    }

    // ================== 解决方案：重写此方法以支持不同目标 ==================
    public playPlayerCardAnimation(cardIndex: number, target: 'player' | 'enemy'): void {
        const cardEl = this.playerHand.querySelector(`[data-card-index="${cardIndex}"]`) as HTMLElement;
        if (!cardEl) return;

        const dropZoneRect = this.dropZone.getBoundingClientRect();
        const cardRect = cardEl.getBoundingClientRect();

        // 步骤1：飞到出牌区 (逻辑不变)
        const x1 = dropZoneRect.left + (dropZoneRect.width / 2) - cardRect.left - (cardRect.width / 2);
        const y1 = dropZoneRect.top + (dropZoneRect.height / 2) - cardRect.top - (cardRect.height / 2);

        cardEl.classList.add('playing-step1');
        cardEl.style.transform = `translate(${x1}px, ${y1}px) scale(1.1)`;

        // 步骤2：根据目标飞向不同位置
        setTimeout(() => {
            // 决定最终目标是玩家还是敌人
            const targetElement = target === 'player' ? this.playerName : this.enemyName;
            const targetRect = targetElement.getBoundingClientRect();

            const x2 = targetRect.left + (targetRect.width / 2) - cardRect.left - (cardRect.width / 2);
            const y2 = targetRect.top + (targetRect.height / 2) - cardRect.top - (cardRect.height / 2);

            cardEl.classList.remove('playing-step1');
            cardEl.classList.add('playing-step2');
            cardEl.style.transform = `translate(${x2}px, ${y2}px) scale(0.5)`;
            cardEl.style.opacity = '0';
            
            setTimeout(() => {
                cardEl.remove();
            }, 500); // 动画完成后移除卡牌元素
        }, 400); // 步骤1动画时长
    }
    // ====================================================================

    public playCounterCardAnimation(cardIndex: number, callback?: () => void): void {
        console.log(`[DEBUG] playCounterCardAnimation 开始, cardIndex: ${cardIndex}`);
        const cardEl = this.playerHand.querySelector(`[data-card-index="${cardIndex}"]`) as HTMLElement;
        if (!cardEl) {
            console.log(`[DEBUG] 找不到卡牌元素，直接调用回调`);
            // 如果找不到卡牌元素，直接调用回调
            if (callback) {
                console.log(`[DEBUG] 执行回调函数`);
                callback();
            }
            return;
        }

        console.log(`[DEBUG] 找到卡牌元素，开始动画`);
        const dropZoneRect = this.dropZone.getBoundingClientRect();
        const cardRect = cardEl.getBoundingClientRect();

        // 给反制牌添加特殊的动画类
        cardEl.classList.add('counter-animation');

        // 飞向牌桌中心
        const x1 = dropZoneRect.left + (dropZoneRect.width / 2) - cardRect.left - (cardRect.width / 2);
        const y1 = dropZoneRect.top + (dropZoneRect.height / 2) - cardRect.top - (cardRect.height / 2);

        cardEl.style.transform = `translate(${x1}px, ${y1}px) scale(1.2)`;
        cardEl.style.opacity = '1';

        console.log(`[DEBUG] 第一阶段动画设置完成，800ms后进入第二阶段`);
        // 添加发光效果和消失动画
        setTimeout(() => {
            console.log(`[DEBUG] 第二阶段动画开始`);
            cardEl.style.transform = `translate(${x1}px, ${y1}px) scale(0.8)`;
            cardEl.style.opacity = '0';
            
            setTimeout(() => {
                console.log(`[DEBUG] 动画完成，移除卡牌元素`);
                cardEl.remove();
                // 在动画结束后调用回调
                if (callback) {
                    console.log(`[DEBUG] 执行动画完成回调函数`);
                    callback();
                } else {
                    console.log(`[DEBUG] 没有回调函数需要执行`);
                }
            }, 500);
        }, 800);
    }

    public playEnemyCardAnimation(card: Card): void {
        const cardEl = this.createCardElement(card);
        cardEl.style.position = 'absolute';
        cardEl.style.opacity = '0';
        const enemyCardAreaRect = this.enemyCardArea.getBoundingClientRect();
        cardEl.style.left = `${enemyCardAreaRect.left}px`;
        cardEl.style.top = `${enemyCardAreaRect.top}px`;
        document.body.appendChild(cardEl);

        requestAnimationFrame(() => {
            const dropZoneRect = this.dropZone.getBoundingClientRect();
            const x1 = dropZoneRect.left + (dropZoneRect.width / 2) - enemyCardAreaRect.left - (cardEl.offsetWidth / 2);
            const y1 = dropZoneRect.top + (dropZoneRect.height / 2) - enemyCardAreaRect.top - (cardEl.offsetHeight / 2);
            cardEl.classList.add('playing-step1');
            cardEl.style.opacity = '1';
            cardEl.style.transform = `translate(${x1}px, ${y1}px) scale(1.1)`;
        });

        setTimeout(() => {
            const cardCurrentRect = cardEl.getBoundingClientRect();
            const targetRect = this.playerName.getBoundingClientRect();
            const x2 = targetRect.left + (targetRect.width / 2) - cardCurrentRect.left - (cardEl.offsetWidth / 2);
            const y2 = targetRect.top + (targetRect.height / 2) - cardCurrentRect.top - (cardEl.offsetHeight / 2);
            cardEl.classList.remove('playing-step1');
            cardEl.classList.add('playing-step2');
            cardEl.style.transform = `translate(${x2}px, ${y2}px) scale(0.5)`;
            cardEl.style.opacity = '0';
            setTimeout(() => {
                cardEl.remove();
            }, 500);
        }, 1000);
    }

    public showGameOverModal(didPlayerWin: boolean): void {
        const urlParams = new URLSearchParams(window.location.search);
        const chapter = urlParams.get('chapter') || '1';
        const chapterNumber = parseInt(chapter, 10);

        // 如果是最后一章（第6章），直接跳转到结局页面
        if (chapterNumber === 6) {
            const endingPage = didPlayerWin ? 'ending1.html' : 'ending2.html';
            window.location.href = `../${endingPage}`;
            return;
        }

        // 非最后一章保持原有逻辑
        this.gameOverText.textContent = didPlayerWin ? "胜利！" : "失败...";
        this.gameOverText.className = didPlayerWin ? 'win' : 'lose';
        this.gameOverModal.classList.remove('hidden');
        
        // 更新返回按钮的URL，携带战斗结果
        const returnButton = document.querySelector('#game-over-modal a[href="../game.html"]') as HTMLAnchorElement;
        if (returnButton) {
            const result = didPlayerWin ? 'win' : 'lose';
            returnButton.href = `../game.html?battleResult=${result}&chapter=${chapter}`;
            console.log(`设置返回URL: ${returnButton.href}`);
        }
    }
}