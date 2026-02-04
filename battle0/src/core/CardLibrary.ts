import { Card, CardData, NormalAttackCard, ActionCard, EquipmentCard, EnduringGuardCard, LethalStingCard, DefensiveStanceCard, DesperateBlowCard, FireAttackCard, SwiftAttackCard, HeavyPunchCard, DoubleTapCard, LeechingStrikeCard, MightyBlowCard, SacredProtectionCard, CharcoalCard, VenomCard, CollapseCard, WaterMirrorCard, LifeGrowthCard, TenaciousGuardCard, AllOutAttackCard, RapidPursuitCard, ArmorlessPursuitCard, SpecialActionCard, StrengthFromHealthCard, BuffNextCardAction, 
    // 新增卡牌类
    CriticalStrikeCard, FollowUpAttackCard, WeaponMasteryCard, ShadowCopyCard, AttackAsDefenseCard,
    StrengthBoostCard, BerserkerAssaultCard, VitalStrikeCard,
    HeadlongStrikeCounter, DamageAbsorptionCounter, NightmareGazeCounter, HarmoniousResonanceCounter,
    ArmorProtectionEquipment, UniversalProtectionEquipment, PursuitBladeEquipment, HeavyStrikeHammerEquipment, BloodthirstyBladeEquipment, DualNatureEquipment, BattleAxeEquipment, RocketFireworksEquipment, RocketModificationCard,
    // 监管者装备类
    SpiderWebEquipment, UnstableAreaEquipment, RecompositionEquipment, CornflowerSorrowEquipment, GrowthEquipment, NightmareEquipment } from '../components/Card.js';

const cardDataPool: { [key: string]: CardData } = {
    // === 玩家攻击牌 ===
    'p001': { id: 'p001', name: '普通攻击', type: 'Normal', description: '造成5点伤害', damage: 5, image: 'assets/images/cards/normal_attack.png' },
    'p002': { id: 'p002', name: '利剑之刺', type: 'Normal', description: '移除, 造成10点穿刺伤害', damage: 10, isRemovedOnPlay: true, isPiercing: true, image: 'assets/images/cards/piercing_strike.png' },
    'p003': { id: 'p003', name: '舍命相搏', type: 'Normal', description: '对敌方造成9点伤害，对自己造成1点穿刺伤害', damage: 9, image: 'assets/images/cards/desperate_blow.png' },
    'p004': { id: 'p004', name: '火焰攻击', type: 'Normal', description: '造成5点伤害, 已损失生命每有5点+1伤害', damage: 5, image: 'assets/images/cards/fire_attack.png' },

    'p006': { id: 'p006', name: '迅捷攻击', type: 'Normal', description: '造成5点伤害，抽1张牌', damage: 5, image: 'assets/images/cards/swift_attack.png' },
    'p007': { id: 'p007', name: '重拳出击', type: 'Normal', description: '造成5点伤害, 获得1张[普通攻击]', damage: 5, effectData: { draw: 1 }, image: 'assets/images/cards/heavy_punch.png' },
    'p008': { id: 'p008', name: '双重打击', type: 'Normal', description: '造成2点伤害，抽2张牌', damage: 2, image: 'assets/images/cards/double_tap.png' },
    'p009': { id: 'p009', name: '汲取攻击', type: 'Normal', description: '造成4点伤害，恢复等量生命', damage: 4, image: 'assets/images/cards/leeching_strike.png' },
    'p010': { id: 'p010', name: '千钧之力', type: 'Normal', description: '造成11点伤害', damage: 11, image: 'assets/images/cards/mighty_blow.png' },
    
    // 新增攻击牌
    'p011': { id: 'p011', name: '重创', type: 'Normal', description: '移除，造成3点伤害，敌方失去所有行动点，每失去1点行动点伤害+2', damage: 3, isRemovedOnPlay: true, image: 'assets/images/cards/critical_strike.png' },
    'p012': { id: 'p012', name: '追加攻击', type: 'Normal', description: '这张牌视为你使用的上一张攻击牌', damage: 3, image: 'assets/images/cards/normal_attack.png' },
    'p013': { id: 'p013', name: '兵甲之刃', type: 'Normal', description: '每装备了1件装备造成1次2点伤害', damage: 2, image: 'assets/images/cards/pursuit_blade.png' },
    
    // === 玩家行动牌 ===
    'p101': { id: 'p101', name: '毅力守护', type: 'Action', description: '获得5点护盾, 下回合受到的所有伤害减少1点', cost: 1, targetType: 'self', image: 'assets/images/cards/enduring_guard.png' },
    'p102': { id: 'p102', name: '以守为攻', type: 'Action', description: '获得6点护盾，抽1张牌', cost: 1, targetType: 'self', image: 'assets/images/cards/defensive_stance.png' },
    'p103': { id: 'p103', name: '神圣守护', type: 'Action', description: '获得10点护盾', cost: 1, targetType: 'self', image: 'assets/images/cards/sacred_protection.png' },
    'p104': { id: 'p104', name: '力量强化', type: 'Action', description: '本回合所有伤害+3', cost: 1, targetType: 'self', image: 'assets/images/cards/strength_boost.png' },
    'p105': { id: 'p105', name: '蓄势待发', type: 'Action', description: '抽1张牌, 本回合下1张牌伤害翻倍', cost: 1, targetType: 'self', image: 'assets/images/cards/strength_boost.png' },
    'p106': { id: 'p106', name: '遇强则强', type: 'Action', description: '造成自己当前生命30%的伤害', cost: 1, targetType: 'enemy', image: 'assets/images/cards/strength_boost.png' },
    'p107': { id: 'p107', name: '顽强守护', type: 'Action', description: '获得6点护盾, 弃掉所有手牌, 每弃1张再获6点护盾', cost: 1, targetType: 'self', image: 'assets/images/cards/defensive_stance.png' },
    'p108': { id: 'p108', name: '全力以赴', type: 'Action', description: '造成3点伤害, 弃掉所有手牌, 每弃1张再造成3点伤害', cost: 1, targetType: 'enemy', image: 'assets/images/cards/all_out_attack.png' },
    'p109': { id: 'p109', name: '狂徒之攻', type: 'Action', description: '随机从牌堆获得2张攻击牌', cost: 1, targetType: 'self', image: 'assets/images/cards/berserker_assault.png' },
    'p110': { id: 'p110', name: '极速追击', type: 'Action', description: '获得2点行动点, 抽1张牌', cost: 1, targetType: 'self', image: 'assets/images/cards/rapid_pursuit.png' },
    'p111': { id: 'p111', name: '弃甲追击', type: 'Action', description: '丢弃1张手牌, 对敌方造成11点伤害', cost: 1, targetType: 'enemy', image: 'assets/images/cards/armorless_pursuit.png' },
    'p112': { id: 'p112', name: '命中要害', type: 'Action', description: '造成3点伤害, 敌方下回合抽牌-1', cost: 1, targetType: 'enemy', damage: 3, effectData: { weaken: 1 }, image: 'assets/images/cards/vital_strike.png' },

    'p114': { id: 'p114', name: '专心攻击', type: 'Action', description: '抽2张牌', cost: 1, targetType: 'self', effectData: { draw: 2 }, image: 'assets/images/cards/strength_boost.png' },
    // 新增行动牌
    'p118': { id: 'p118', name: '影影绰绰', type: 'Action', description: '选择手牌中的1张牌，将该牌的2张复制加入牌堆', cost: 1, targetType: 'self', requiresChoice: true, effectData: { copyTargets: 2 }, image: 'assets/images/cards/shadow_copy.png' },
    'p119': { id: 'p119', name: '以攻为守', type: 'Action', description: '从牌库中随机抽取一张牌到手牌', cost: 1, targetType: 'self', effectData: { draw: 1 }, image: 'assets/images/cards/defensive_stance.png' },

    // === 反制牌 (全新类型) ===
    'p201': { id: 'p201', name: '迎头痛击', type: 'Counter', description: '敌方使用攻击牌时：将其无效，对敌方造成2伤害，抽1张牌', effectData: { counterType: 'attack' }, image: 'assets/images/cards/headlong_strike.png' },
    'p202': { id: 'p202', name: '伤害吸收', type: 'Counter', description: '敌方使用能造成伤害的牌时，将其无效，抽1张牌', effectData: { counterType: 'damage' }, image: 'assets/images/cards/damage_absorption.png' },
    'p203': { id: 'p203', name: '噩梦凝视', type: 'Counter', description: '敌方使用的下一张牌失效', effectData: { counterType: 'next' }, image: 'assets/images/cards/nightmare_gaze.png' },
    'p204': { id: 'p204', name: '和声共鸣', type: 'Counter', description: '敌方下回合前2次伤害将会被反弹一半', effectData: { counterType: 'damage' }, image: 'assets/images/cards/harmonious_resonance.png' },

    // === 装备牌 (全新类型) ===
    'p301': { id: 'p301', name: '盔甲护身', type: 'Equipment', description: '每回合开始时获得4点护盾', effectData: { equipmentSlot: 'armor' }, isRemovedOnPlay: true, image: 'assets/images/cards/armor_protection.png' },
    'p302': { id: 'p302', name: '统统加护', type: 'Equipment', description: '受到的所有伤害-1', effectData: { equipmentSlot: 'armor', damageReduction: 1 }, isRemovedOnPlay: true, image: 'assets/images/cards/armor_protection.png' },
    'p303': { id: 'p303', name: '追击之刃', type: 'Equipment', description: '每使用两次能造成伤害的牌对敌方造成1点伤害', effectData: { equipmentSlot: 'weapon' }, isRemovedOnPlay: true, image: 'assets/images/cards/pursuit_blade.png' },
    'p304': { id: 'p304', name: '重击之锤', type: 'Equipment', description: '每回合的第1张伤害牌伤害+3', effectData: { equipmentSlot: 'weapon' }, isRemovedOnPlay: true, image: 'assets/images/cards/heavy_hammer.png' },
    'p305': { id: 'p305', name: '泣血之刃', type: 'Equipment', description: '每造成6点伤害获得1点生命值', effectData: { equipmentSlot: 'weapon' }, isRemovedOnPlay: true, image: 'assets/images/cards/bloodthirsty_blade.png' },
    'p306': { id: 'p306', name: '一念神魔', type: 'Equipment', description: '每回合结束时获得2点护盾，对敌方造成2点伤害', effectData: { equipmentSlot: 'accessory' }, isRemovedOnPlay: true, image: 'assets/images/cards/dual_nature.png' },
    'p307': { id: 'p307', name: '恋战之斧', type: 'Equipment', description: '每次使用普通攻击后获得一张普通攻击（复制）', effectData: { equipmentSlot: 'weapon' }, isRemovedOnPlay: true, image: 'assets/images/cards/battle_axe.png' },


    // === 监管者通用卡池 ===
    'e001': { id: 'e001', name: '监管者普攻', type: 'Normal', description: '造成6点伤害', damage: 6, targetType: 'enemy', image: 'assets/images/cards/normal_attack.png' },
    'e003': { id: 'e003', name: '重击', type: 'Normal', description: '造成10点伤害', damage: 10, targetType: 'enemy', image: 'assets/images/cards/mighty_blow.png' },
    'e010': { id: 'e010', name: '生命滋长', type: 'Action', description: '获得5点生命上限, 恢复5点生命', cost: 1, targetType: 'self', image: 'assets/images/cards/life_growth.png' },
    'e011': { id: 'e011', name: '重重一击', type: 'Action', description: '对敌方造成18点伤害', cost: 1, damage: 18, targetType: 'enemy', image: 'assets/images/cards/mighty_blow.png' },
    'e012': { id: 'e012', name: '力量压制', type: 'Action', description: '对敌方造成自己当前生命1/5的伤害(最多18)', cost: 1, targetType: 'enemy', image: 'assets/images/cards/strength_boost.png' },
    
    // --- 厂长专属 ---
    'e101': { id: 'e101', name: '木炭', type: 'Normal', description: '造成12点火焰伤害', damage: 12, targetType: 'enemy', image: 'assets/images/cards/charcoal.png'},
    'e102': { id: 'e102', name: '傀儡', type: 'Action', description: '下一张牌伤害翻倍', cost: 1, targetType: 'self', image: 'assets/images/cards/strength_boost.png'},
    
    // --- 小丑专属 ---
    'e201': { id: 'e201', name: '火箭改装', type: 'Action', description: '获得2张[监管者普攻]', cost: 1, targetType: 'self', effectData: { draw: 2 }, image: 'assets/images/cards/rocket_fireworks.png'},
    'e202': { id: 'e202', name: '火箭礼花', type: 'Equipment', description: '普通攻击伤害+2', effectData: { equipmentSlot: 'weapon', damageBonus: 2 }, image: 'assets/images/cards/rocket_fireworks.png'},

    // --- 蜘蛛专属 ---
    'e301': { id: 'e301', name: '毒液', type: 'Normal', description: '造成7点伤害，敌方下回合抽牌-1', damage: 7, targetType: 'enemy', effectData: { weaken: 1 }, image: 'assets/images/cards/venom.png' },
    'e302': { id: 'e302', name: '蛛网', type: 'Equipment', description: '对方每出1张牌受到1点伤害', effectData: { equipmentSlot: 'accessory' }, image: 'assets/images/cards/spider_web.png' },

    // --- 愚人金专属 ---
    'e401': { id: 'e401', name: '坍塌', type: 'Normal', description: '造成两次4点伤害', damage: 4, targetType: 'enemy', image: 'assets/images/cards/collapse.png' },
    'e402': { id: 'e402', name: '不稳定区域', type: 'Equipment', description: '每对敌方造成4次伤害触发1次坍塌伤害（4点）', effectData: { equipmentSlot: 'accessory' }, image: 'assets/images/cards/collapse.png' },
    'e403': { id: 'e403', name: '重组', type: 'Equipment', description: '每回合回复3点生命值', effectData: { equipmentSlot: 'accessory' }, image: 'assets/images/cards/life_growth.png' },

    // --- 红夫人专属 ---
    'e501': { id: 'e501', name: '水镜', type: 'Normal', description: '造成6点伤害，下一张牌伤害翻倍', damage: 6, targetType: 'enemy', image: 'assets/images/cards/water_mirror.png' },
    'e502': { id: 'e502', name: '矢车菊之殇', type: 'Equipment', description: '每回合出牌少于5张获得4点护盾，出牌大于等于5张对敌方造成4点伤害', effectData: { equipmentSlot: 'accessory' }, image: 'assets/images/cards/cornflower_sorrow.png' },

    // --- 噩梦专属 ---
    'e601': { id: 'e601', name: '滋长', type: 'Equipment', description: '每回合结束回复损失生命的12%', effectData: { equipmentSlot: 'accessory' }, image: 'assets/images/cards/growth.png' },
    'e602': { id: 'e602', name: '梦魇', type: 'Equipment', description: '每8回合回复损失生命的30%', effectData: { equipmentSlot: 'accessory' }, image: 'assets/images/cards/nightmare.png' },
};

export class CardLibrary {
    private allCards: { [key: string]: CardData };
    private playerCardIds: string[];
    private enemyCommonCardIds: string[];
    private enemyExclusiveCardIds: { [key: string]: string[] };

    constructor() {
        this.allCards = cardDataPool;
        this.playerCardIds = Object.keys(this.allCards).filter(id => id.startsWith('p'));
        this.enemyCommonCardIds = Object.keys(this.allCards).filter(id => id.startsWith('e0'));
        this.enemyExclusiveCardIds = {
            '厂长': Object.keys(this.allCards).filter(id => id.startsWith('e1')),
            '小丑': Object.keys(this.allCards).filter(id => id.startsWith('e2')),
            '蜘蛛': Object.keys(this.allCards).filter(id => id.startsWith('e3')),
            '愚人金': Object.keys(this.allCards).filter(id => id.startsWith('e4')),
            '红夫人': Object.keys(this.allCards).filter(id => id.startsWith('e5')),
            '噩梦': Object.keys(this.allCards).filter(id => id.startsWith('e6')),
        };
    }

    public getCardData(cardId: string): CardData | undefined {
        return this.allCards[cardId];
    }
    
    public getPlayerCardsData(): CardData[] {
        return this.playerCardIds.map(id => this.allCards[id]);
    }

    public createCard(cardId: string): Card {
        const data = this.getCardData(cardId);
        if (!data) throw new Error(`在卡牌池中找不到ID为 ${cardId} 的卡牌`);

        switch (data.id) {
            // 原有卡牌
            case 'p003': return new DesperateBlowCard(data);
            case 'p004': return new FireAttackCard(data);
            case 'p006': return new SwiftAttackCard(data);
            case 'p007': return new HeavyPunchCard(data);
            case 'p008': return new DoubleTapCard(data);
            case 'p009': return new LeechingStrikeCard(data);
            case 'p010': return new MightyBlowCard(data);
            case 'p002': return new LethalStingCard(data);
            case 'p101': return new EnduringGuardCard(data);
            case 'p102': return new DefensiveStanceCard(data);
            case 'p103': return new SacredProtectionCard(data);
            case 'p104': return new StrengthBoostCard(data);
            case 'p105': return new BuffNextCardAction(data);
            case 'p106': return new StrengthFromHealthCard(data);
            case 'p107': return new TenaciousGuardCard(data);
            case 'p108': return new AllOutAttackCard(data);
            case 'p109': return new BerserkerAssaultCard(data);
            case 'p110': return new RapidPursuitCard(data);
            case 'p111': return new ArmorlessPursuitCard(data);
            case 'p112': return new VitalStrikeCard(data);

            case 'p114': return new SpecialActionCard(data);
            
            // 新增攻击牌
            case 'p011': return new CriticalStrikeCard(data);
            case 'p012': return new FollowUpAttackCard(data);
            case 'p013': return new WeaponMasteryCard(data);
            
            // 新增行动牌
            case 'p118': return new ShadowCopyCard(data);
            case 'p119': return new AttackAsDefenseCard(data);
            
            // 反制牌
            case 'p201': return new HeadlongStrikeCounter(data);
            case 'p202': return new DamageAbsorptionCounter(data);
            case 'p203': return new NightmareGazeCounter(data);
            case 'p204': return new HarmoniousResonanceCounter(data);
            
            // 装备牌
            case 'p301': return new ArmorProtectionEquipment(data);
            case 'p302': return new UniversalProtectionEquipment(data);
            case 'p303': return new PursuitBladeEquipment(data);
            case 'p304': return new HeavyStrikeHammerEquipment(data);
            case 'p305': return new BloodthirstyBladeEquipment(data);
            case 'p306': return new DualNatureEquipment(data);
            case 'p307': return new BattleAxeEquipment(data);

            
            // 敌方卡牌
            case 'e010': return new LifeGrowthCard(data);
            case 'e012': return new StrengthFromHealthCard(data);
            case 'e101': return new CharcoalCard(data);
            case 'e102': return new BuffNextCardAction(data);
            case 'e201': return new RocketModificationCard(data);
            case 'e202': return new RocketFireworksEquipment(data);
            case 'e301': return new VenomCard(data);
            case 'e302': return new SpiderWebEquipment(data);
            case 'e401': return new CollapseCard(data);
            case 'e402': return new UnstableAreaEquipment(data);
            case 'e403': return new RecompositionEquipment(data);
            case 'e501': return new WaterMirrorCard(data);
            case 'e502': return new CornflowerSorrowEquipment(data);
            case 'e601': return new GrowthEquipment(data);
            case 'e602': return new NightmareEquipment(data);
            
            default:
                // 默认处理
                if (data.type === 'Counter') return new HeadlongStrikeCounter(data); // 默认反制卡
                if (data.type === 'Equipment') return new ArmorProtectionEquipment(data); // 默认装备卡
                if (data.cost) return new ActionCard(data);
                return new NormalAttackCard(data);
        }
    }
    
    public buildRandomEnemyDeck(enemyName: string, deckSize: number, exclusiveCount: number): Card[] {
        const deck: Card[] = [];
        const exclusivePool = this.enemyExclusiveCardIds[enemyName] || [];
        const commonPool = this.enemyCommonCardIds;

        for (let i = 0; i < exclusiveCount; i++) {
            if (exclusivePool.length > 0) {
                const randomId = exclusivePool[Math.floor(Math.random() * exclusivePool.length)];
                deck.push(this.createCard(randomId));
            }
        }

        const remainingSize = deckSize - deck.length;
        for (let i = 0; i < remainingSize; i++) {
             if (commonPool.length > 0) {
                const randomId = commonPool[Math.floor(Math.random() * commonPool.length)];
                deck.push(this.createCard(randomId));
            }
        }
        
        return deck;
    }
}