import { Player, Enemy } from '../components/Character.js';
import { Card, ActionCard, BattleContext } from '../components/Card.js';
import { shuffle } from '../utils/shuffle.js';
import { BattleUI } from './BattleUI.js';

type GameState = 'ONGOING' | 'PLAYER_WIN' | 'ENEMY_WIN' | 'AWAITING_DISCARD';

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export class BattleManager {
    public player: Player;
    public enemy: Enemy;
    private turn: number = 1;
    private gameState: GameState = 'ONGOING';
    private isPlayerTurn: boolean = true;
    private ui: BattleUI | null = null;

    constructor(player: Player, enemy: Enemy, playerDeck: Card[]) {
        this.player = player;
        this.enemy = enemy;
        this.player.deck = playerDeck;
        
        try {
            this.ui = new BattleUI(
                async (index) => await this.handleCardClick(index),
                (index) => this.playerUseFollowerSkill(index),
                () => this.endPlayerTurn(),
                () => this.playerUseSurvivorSkill()
            );
        } catch (error) {
            console.error('BattleUI初始化失败:', error);
            alert('战斗界面初始化失败！请检查页面结构是否正确。');
            throw error;
        }
    }
    
    // 安全的日志方法
    private safeLogAction(message: string, type: 'player' | 'enemy' | 'system' | 'info'): void {
        if (this.ui) {
            this.ui.logAction(message, type);
        } else {
            console.log(`[战斗日志] ${type}: ${message}`);
        }
    }
    
    // 安全的UI操作方法
    private safeUICall(action: () => void): void {
        if (this.ui) {
            try {
                action();
            } catch (error) {
                console.error('UI操作失败:', error);
            }
        }
    }
    
    private async handleCardClick(index: number): Promise<void> {
        // 如果有卡牌正在等待选择目标
        if (this.currentContext?.awaitingCardChoice) {
            const selectedCard = this.player.hand[index];
            this.currentContext.chosenCard = selectedCard;
            this.currentContext.awaitingCardChoice = false;
            // 重新执行之前的卡牌
            if (this.currentPlayingCard) {
                const actualTarget = this.currentPlayingCard.targetType === 'self' ? this.player : this.enemy;
                this.currentPlayingCard.play(this.player, actualTarget, this.currentContext);
            }
            return;
        }

        if (this.gameState === 'AWAITING_DISCARD') {
            this.playerDiscardCard(index);
        } else {
            this.playerPlayCard(index);
        }
    }

    private currentContext: BattleContext | null = null;
    private currentPlayingCard: Card | null = null;

    public startBattle(): void {
        this.safeUICall(() => this.ui!.show());
        this.safeLogAction("================ 战斗开始 ================", 'system');

        // 输出初始状态
        console.log('[战斗开始] 初始状态：', {
            '玩家手牌数': this.player.hand.length,
            '玩家手牌': this.player.hand.map(card => card.name),
            '玩家牌组数': this.player.deck.length,
            '敌人手牌数': this.enemy.hand.length,
            '敌人牌组数': this.enemy.deck.length
        });

        // 确保所有选择的牌都在牌组中
        this.player.deck.push(...this.player.hand);
        this.player.hand = [];
        this.enemy.deck.push(...this.enemy.hand);
        this.enemy.hand = [];

        console.log('[战斗开始] 重置后状态：', {
            '玩家手牌数': this.player.hand.length,
            '玩家牌组数': this.player.deck.length,
            '敌人手牌数': this.enemy.hand.length,
            '敌人牌组数': this.enemy.deck.length
        });

        // 洗牌
        shuffle(this.player.deck);
        shuffle(this.enemy.deck);
        console.log('[战斗开始] 洗牌完成');

        // 抽4张起始手牌
        console.log('[战斗开始] 开始抽取起始手牌');
        this.player.drawCards(4);
        this.enemy.drawCards(4);

        console.log('[战斗开始] 最终状态：', {
            '玩家手牌数': this.player.hand.length,
            '玩家手牌': this.player.hand.map(card => card.name),
            '玩家牌组数': this.player.deck.length,
            '敌人手牌数': this.enemy.hand.length,
            '敌人牌组数': this.enemy.deck.length
        });

        this.startPlayerTurn();
    }

    private startPlayerTurn(): void {
        this.isPlayerTurn = true;
        this.safeLogAction(`\n--- 第 ${this.turn} 回合：你的回合 ---`, 'system');
        this.safeUICall(() => this.ui!.toggleEndTurnButton(true));

        // 触发求生者回合开始技能
        this.player.triggerSurvivorPassive('startOfTurn', { player: this.player, enemy: this.enemy, turn: this.turn });
        
        // 触发玩家装备的回合开始效果
        this.player.onTurnStart();

        this.player.followers.forEach(follower => {
            follower.tickCooldown();
            if (follower.passiveSkill.trigger === 'startOfTurn') {
                this.safeLogAction(`[被动] ${follower.name} 的 "${follower.passiveSkill.name}" 触发了！`, 'info');
                follower.passiveSkill.effect({ player: this.player, enemy: this.enemy, turn: this.turn });
            }
        });
        if (this.checkWinCondition()) return;

        // 除了第一回合外，每回合开始时抽4张牌
        if (this.turn > 1) {
            // 检查抽牌数量（可能被求生者技能影响）
            let drawCount = 4;
            const drawPenalty = this.player.effects.getTotalValue('draw_penalty');
            if (drawPenalty > 0) {
                drawCount = Math.max(0, drawCount - drawPenalty);
                this.player.effects.remove('draw_penalty');
                if (drawCount === 0) {
                    this.safeLogAction('由于技能效果，本回合不能抽牌！', 'system');
                }
            }
            
            if (drawCount > 0) {
                console.log(`[回合开始] 第 ${this.turn} 回合，抽取 ${drawCount} 张牌`);
                this.player.drawCards(drawCount);
            }
        } else {
            console.log('[回合开始] 第1回合，跳过抽牌阶段');
        }

        this.player.actionPoints = this.player.maxActionPoints;
        this.safeUICall(() => this.ui!.updateAll(this.player, this.enemy));
    }
    
    public async playerPlayCard(handIndex: number): Promise<void> {
        console.log(`[DEBUG] BattleManager.playerPlayCard() 开始, handIndex: ${handIndex}`);
        if (!this.isPlayerTurn || this.gameState !== 'ONGOING') {
            console.log(`[DEBUG] 不是玩家回合或游戏状态不正确`);
            return;
        }
        const card = this.player.hand[handIndex];
        if (!card) {
            console.log(`[DEBUG] 卡牌不存在`);
            return;
        }

        console.log(`[DEBUG] 玩家尝试使用卡牌: ${card.name}`);
        // 检查敌人是否有反制牌
        const context = { player: this.player, enemy: this.enemy, turn: this.turn };
        console.log(`[DEBUG] 检查敌人是否有反制牌...`);
        if (await this.enemy.tryCounter(card, context)) {
            console.log(`[DEBUG] 卡牌被敌人反制，移除卡牌`);
            // 如果被反制，移除卡牌但不消耗行动点
            this.player.hand.splice(handIndex, 1);
            // 装备牌被反制时直接删除，不进入弃牌堆
            if (card.type === 'Equipment') {
                this.safeLogAction(`装备牌【${card.name}】被反制，已删除！`, 'system');
            } else {
                this.player.discardPile.push(card);
                this.safeLogAction(`卡牌【${card.name}】被反制，移入弃牌堆！`, 'system');
            }
            
            // 检查游戏结束条件
            if (this.checkWinCondition()) {
                console.log(`[DEBUG] 游戏结束条件满足`);
                return;
            }
            
            // 更新界面
            this.safeUICall(() => this.ui!.updateAll(this.player, this.enemy));
            console.log(`[DEBUG] 反制处理完成`);
            return;
        }

        console.log(`[DEBUG] 卡牌没有被反制，继续正常流程`);
        if ('cost' in card) {
            const actionCard = card as ActionCard;
            if (this.player.actionPoints < actionCard.cost) {
                this.safeLogAction(`行动点不足！`, 'system');
                console.log(`[DEBUG] 行动点不足`);
                return;
            }
            this.player.actionPoints -= actionCard.cost;
            console.log(`[DEBUG] 消耗行动点: ${actionCard.cost}`);
        }
        
        // 确定动画目标
        const animationTarget = card.targetType === 'self' ? 'player' : 'enemy';
        
        this.safeUICall(() => this.ui!.playPlayerCardAnimation(handIndex, animationTarget));
        
        // 给动画一点时间执行
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const playedCard = this.player.hand.splice(handIndex, 1)[0];
        if (playedCard) {
            const actualTarget = playedCard.targetType === 'self' ? this.player : this.enemy;
            
            // 创建战斗上下文
            this.currentContext = { 
                player: this.player, 
                enemy: this.enemy, 
                turn: this.turn
            };
            
            // 保存当前正在使用的卡牌
            this.currentPlayingCard = playedCard;
            
            // 触发求生者出牌技能
            this.player.triggerSurvivorPassive('onCardPlay', this.currentContext);
            
            // 触发装备的出牌效果
            this.triggerEquipmentOnCardPlay(playedCard, this.currentContext);
            
            // 触发敌人装备的"对方出牌"效果（如蛛网）
            this.triggerEnemyEquipmentOnPlayerCardPlay(this.currentContext);
            
            playedCard.play(this.player, actualTarget, this.currentContext);
            
            // 记录最后出牌，供追加攻击等牌使用
            this.player.lastPlayedCard = playedCard;

            // 触发装备的出牌后效果（如恋战之斧）
            this.triggerEquipmentAfterCardPlay(playedCard, this.currentContext);

            // 装备牌特殊处理：装备牌使用后直接移除，不进入弃牌堆
            if (playedCard.type === 'Equipment') {
                this.safeLogAction(`装备牌【${playedCard.name}】已装备，不返回牌库。`, 'system');
            } else if (playedCard.isRemovedOnPlay) {
                this.safeLogAction(`卡牌【${playedCard.name}】被移除了。`, 'system');
            } else {
                this.player.discardPile.push(playedCard);
            }
        }

        if (this.checkWinCondition()) return;

        this.safeUICall(() => this.ui!.updateAll(this.player, this.enemy));
    }
    
    public playerUseFollowerSkill(followerIndex: number): void {
        if (this.gameState === 'AWAITING_DISCARD') {
            this.safeLogAction("手牌已满！请先弃牌。", 'system');
            return;
        }
        if (!this.isPlayerTurn || this.gameState !== 'ONGOING') return;
        const follower = this.player.followers[followerIndex];
        if (!follower) return;
        const skill = follower.activeSkill;
        if (follower.currentCooldown > 0) {
            this.safeLogAction(`技能 [${skill.name}] 正在冷却中...`, 'system');
            return;
        }
        if (this.player.actionPoints < skill.cost) {
            this.safeLogAction(`行动点不足！`, 'system');
            return;
        }
        
        this.safeLogAction(`你使用了 ${follower.name} 的技能 "${skill.name}"！`, 'player');
        this.player.actionPoints -= skill.cost;
        skill.effect({ player: this.player, enemy: this.enemy, turn: this.turn });
        follower.useSkill();
        
        if (this.checkWinCondition()) return;
        this.safeUICall(() => this.ui!.updateAll(this.player, this.enemy));
    }

    public playerUseSurvivorSkill(): void {
        if (this.gameState === 'AWAITING_DISCARD') {
            this.safeLogAction("手牌已满！请先弃牌。", 'system');
            return;
        }
        if (!this.isPlayerTurn || this.gameState !== 'ONGOING') return;
        
        const context = { player: this.player, enemy: this.enemy, turn: this.turn };
        const success = this.player.useSurvivorActiveSkill(context);
        
        if (success) {
            if (this.checkWinCondition()) return;
            this.safeUICall(() => this.ui!.updateAll(this.player, this.enemy));
        }
    }

    public playerDiscardCard(handIndex: number): void {
        const card = this.player.hand[handIndex];
        if (!card) return;
        
        this.player.hand.splice(handIndex, 1);
        // 装备牌弃牌时直接删除，不进入弃牌堆
        if (card.type === 'Equipment') {
            this.safeLogAction(`你弃掉了装备牌【${card.name}】，已删除。`, 'player');
        } else {
            this.player.discardPile.push(card);
            this.safeLogAction(`你弃掉了手牌【${card.name}】。`, 'player');
        }
        
        if (this.player.hand.length <= 4) {
            this.safeLogAction("手牌数量已合规，你可以继续你的回合了。", 'system');
            this.gameState = 'ONGOING';
            this.safeUICall(() => this.ui!.toggleEndTurnButton(true));
            this.safeUICall(() => this.ui!.updateAll(this.player, this.enemy));
        } else {
            this.safeLogAction(`手牌仍然多于4张，还需要弃掉 ${this.player.hand.length - 4} 张牌。`, 'system');
            this.safeUICall(() => this.ui!.updateAll(this.player, this.enemy, true));
        }
    }

    public endPlayerTurn(): void {
        if (this.gameState === 'AWAITING_DISCARD') {
            this.safeLogAction("手牌已满！请先弃牌。", 'system');
            return;
        }
        if (!this.isPlayerTurn || this.gameState !== 'ONGOING') return;
        
        // 在回合结束前检查手牌数量
        if (this.player.hand.length > 4) {
            this.gameState = 'AWAITING_DISCARD';
            this.safeLogAction(`回合结束时手牌检查：手牌溢出！上限为4，当前有 ${this.player.hand.length} 张。请点击手牌进行弃牌。`, 'system');
            this.safeUICall(() => this.ui!.toggleEndTurnButton(false));
            this.safeUICall(() => this.ui!.updateAll(this.player, this.enemy, true));
            return;
        }
        
        this.safeLogAction("--- 你的回合结束 ---", 'system');
        this.isPlayerTurn = false;
        this.safeUICall(() => this.ui!.toggleEndTurnButton(false));
        this.player.onTurnEnd();
        this.startEnemyTurn();
    }

    private async startEnemyTurn(): Promise<void> {
        await sleep(1000);

        this.enemy.drawCards(4);
        this.enemy.handleHandOverflow();
        this.safeLogAction(`${this.enemy.name} 的回合开始。`, 'enemy');
        
        // 触发敌人装备的回合开始效果
        this.enemy.onTurnStart();
        
        this.safeUICall(() => this.ui!.updateAll(this.player, this.enemy));
        
        await sleep(1000);

        // 执行敌人的行动，Enemy类中会处理反制检查
        if (this.ui) {
            await this.enemy.performAction(this.player, this.ui);
        }
        
        if (this.checkWinCondition()) return;

        this.endEnemyTurn();
    }

    private endEnemyTurn(): void {
        this.safeLogAction("--- 敌人的回合结束 ---", 'system');
        this.enemy.onTurnEnd();
        this.turn++;
        this.startPlayerTurn();
    }
    
    private checkWinCondition(): boolean {
        if (this.enemy.currentHp <= 0) {
            this.gameState = 'PLAYER_WIN';
            this.safeUICall(() => this.ui!.showGameOverModal(true));
            this.safeUICall(() => this.ui!.toggleEndTurnButton(false));
            return true;
        }
        if (this.player.currentHp <= 0) {
            this.gameState = 'ENEMY_WIN';
            this.safeUICall(() => this.ui!.showGameOverModal(false));
            this.safeUICall(() => this.ui!.toggleEndTurnButton(false));
            return true;
        }
        return false;
    }

    // 新增：触发装备的出牌前效果
    private triggerEquipmentOnCardPlay(card: Card, context: BattleContext): void {
        this.player.equipment.forEach(eq => {
            // 检查重击之锤效果
            if (eq.name === '重击之锤' && card.type === 'Normal' && 'damage' in card) {
                if (!(eq as any).metadata) (eq as any).metadata = {};
                if (!(eq as any).metadata.firstCardUsed) {
                    (eq as any).metadata.firstCardUsed = true;
                    // 重击之锤：第一张伤害牌伤害+3，通过修改卡牌伤害实现
                    (card as any).damage = ((card as any).damage || 0) + 3;
                    (window as any).battle?.ui.logAction('重击之锤生效！第一张伤害牌伤害+3！', 'player');
                }
            }
        });
    }

    // 新增：触发装备的出牌后效果  
    private triggerEquipmentAfterCardPlay(card: Card, context: BattleContext): void {
        console.log(`[DEBUG] triggerEquipmentAfterCardPlay 被调用，卡牌: ${card.name} (ID: ${card.id})`);
        console.log(`[DEBUG] 玩家装备列表:`, this.player.equipment.map(eq => eq.name));
        
        this.player.equipment.forEach(eq => {
            // 检查恋战之斧效果 - 在普通攻击使用后触发
            // 只有原始普通攻击才触发，复制牌不触发
            if (eq.name === '恋战之斧' && card.id === 'p001' && !card.name.includes('（复制）')) {
                console.log(`[恋战之斧] 条件满足：装备名称=${eq.name}, 卡牌ID=${card.id}, 卡牌名称=${card.name}`);
                const cardLibrary = (window as any).cardLibrary;
                console.log(`[恋战之斧] cardLibrary 可用性:`, !!cardLibrary);
                
                if (cardLibrary) {
                    const copyCard = cardLibrary.createCard('p001');
                    console.log(`[恋战之斧] 创建的复制卡牌:`, copyCard);
                    if (copyCard) {
                        copyCard.name = '普通攻击（复制）';
                        copyCard.isRemovedOnPlay = true;
                        this.player.hand.push(copyCard);
                        (window as any).battle?.ui.logAction('恋战之斧生效！获得一张普通攻击（复制）！', 'player');
                        console.log(`[恋战之斧] 添加普通攻击复制到手牌，当前手牌数量: ${this.player.hand.length}`);
                        console.log(`[恋战之斧] 当前手牌:`, this.player.hand.map(c => c.name));
                        // 立即更新UI以显示新卡牌
                        this.safeUICall(() => this.ui!.updateAll(this.player, this.enemy));
                    } else {
                        console.error(`[恋战之斧] 创建卡牌失败！`);
                    }
                } else {
                    console.error(`[恋战之斧] cardLibrary 不可用！`);
                }
            } else if (eq.name === '恋战之斧' && card.id === 'p001' && card.name.includes('（复制）')) {
                console.log(`[恋战之斧] 复制牌被使用，不触发恋战之斧效果。卡牌名称: ${card.name}`);
            }
        });
    }

    // 新增：触发敌人装备的"对方出牌"效果
    private triggerEnemyEquipmentOnPlayerCardPlay(context: BattleContext): void {
        this.enemy.equipment.forEach(eq => {
            // 蛛网：对方每出1张牌受到1点伤害
            if (eq.name === '蛛网') {
                if (typeof (eq as any).onEnemyCardPlayed === 'function') {
                    (eq as any).onEnemyCardPlayed(context);
                }
            }
            
            // 矢车菊之殇：记录出牌数
            if (eq.name === '矢车菊之殇') {
                if (typeof (eq as any).onCardPlayed === 'function') {
                    (eq as any).onCardPlayed();
                }
            }
        });
    }

    private _checkForHandOverflow(): boolean {
        if (this.player.hand.length > 4) {
            this.gameState = 'AWAITING_DISCARD';
            this.safeLogAction(`手牌溢出！上限为4，当前有 ${this.player.hand.length} 张。请点击手牌进行弃牌。`, 'system');
            this.safeUICall(() => this.ui!.toggleEndTurnButton(false));
            this.safeUICall(() => this.ui!.updateAll(this.player, this.enemy, true));
            return true;
        }
        return false;
    }
}