/**
 * 章节配置系统
 * 根据剧情章节配置不同的求生者和监管者
 */

export interface ChapterBattleConfig {
    chapterNumber: number;
    chapterName: string;
    description: string;
    availableSurvivors: string[];
    availableHunters: {
        name: string;
        hp: number;
        description?: string;
    }[];
}

export class ChapterConfigManager {
    private chapterConfigs: { [key: number]: ChapterBattleConfig } = {};

    constructor() {
        this.initializeChapterConfigs();
    }

    private initializeChapterConfigs(): void {
        // 第一章：新手教程 - 医疗主题
        this.chapterConfigs[1] = {
            chapterNumber: 1,
            chapterName: "医者仁心",
            description: "在庄园的医务室中，医疗专家们面临着第一次考验",
            availableSurvivors: [
                'doctor',      // 医生 - 治疗专家
                'gardener',    // 园丁 - 防御专家
                'composer'     // 作曲家 - 辅助专家
            ],
            availableHunters: [
                { 
                    name: '厂长', 
                    hp: 160,
                    description: '庄园的管理者，机械化的恐怖存在'
                }
            ]
        };

        // 第二章：法律与正义 - 智力对决
        this.chapterConfigs[2] = {
            chapterNumber: 2,
            chapterName: "法理之争",
            description: "在庄园的法庭中，智慧型求生者与邪恶进行智力对决",
            availableSurvivors: [
                'lawyer',      // 律师 - 策略专家
                'novelist',    // 小说家 - 智力专家
                'reporter'     // 记者 - 爆发专家
            ],
            availableHunters: [
                { 
                    name: '小丑', 
                    hp: 170,
                    description: '疯狂的马戏团表演者，善于心理战'
                }
            ]
        };

        // 第三章：原始力量 - 力量较量
        this.chapterConfigs[3] = {
            chapterNumber: 3,
            chapterName: "野性呼唤",
            description: "在庄园的荒野中，原始力量与野性本能的较量",
            availableSurvivors: [
                'wildman',     // 野人 - 力量型攻击专家
                'forward',     // 前锋 - 突击战士
                'entomologist' // 昆虫学家 - 自然专家
            ],
            availableHunters: [
                { 
                    name: '蜘蛛', 
                    hp: 180,
                    description: '巨大的蛛形生物，擅长陷阱和毒素攻击'
                }
            ]
        };

        // 第四章：艺术与魅力 - 敏捷与表演
        this.chapterConfigs[4] = {
            chapterNumber: 4,
            chapterName: "舞台惊魂",
            description: "在庄园的剧场中，艺术家们用优雅与技巧对抗邪恶",
            availableSurvivors: [
                'dancer',      // 舞女 - 魅惑专家
                'acrobat',     // 杂技演员 - 灵巧专家
                'little_girl'  // 小女孩 - 神秘专家
            ],
            availableHunters: [
                { 
                    name: '红夫人', 
                    hp: 185,
                    description: '优雅而致命的贵族女性，擅长镜像幻术'
                }
            ]
        };

        // 第五章：科技与创新 - 机械对决
        this.chapterConfigs[5] = {
            chapterNumber: 5,
            chapterName: "机械迷城",
            description: "在庄园的工厂中，机械师们与工业恐怖进行最后的较量",
            availableSurvivors: [
                'mechanic',    // 机械师 - 工程专家
                'doctor',      // 医生 - 医疗专家（支援）
                'lawyer'       // 律师 - 策略专家（支援）
            ],
            availableHunters: [
                { 
                    name: '愚人金', 
                    hp: 200,
                    description: '黄金铸造的机械怪物，拥有强大的防御能力'
                }
            ]
        };

        // 第六章：终极对决 - 全体集合
        this.chapterConfigs[6] = {
            chapterNumber: 6,
            chapterName: "末日审判",
            description: "最终章节，所有幸存的求生者联合对抗终极邪恶",
            availableSurvivors: [
                'doctor',      // 医生
                'lawyer',      // 律师
                'gardener',    // 园丁
                'wildman',     // 野人
                'reporter',    // 记者
                'composer',    // 作曲家
                'dancer',      // 舞女
                'acrobat',     // 杂技演员
                'mechanic'     // 机械师
            ],
            availableHunters: [
                { 
                    name: '噩梦', 
                    hp: 250,
                    description: '庄园中最强大的邪恶存在，集合了所有恐怖的力量'
                }
            ]
        };
    }

    /**
     * 根据章节数获取战斗配置
     * @param chapterNumber 章节数 (1-6)
     * @returns 该章节的战斗配置，如果章节数无效则返回第一章配置
     */
    public getChapterConfig(chapterNumber: number): ChapterBattleConfig {
        // 验证章节数范围
        if (chapterNumber < 1 || chapterNumber > 6) {
            console.warn(`无效的章节数: ${chapterNumber}，使用第一章配置`);
            return this.chapterConfigs[1];
        }

        const config = this.chapterConfigs[chapterNumber];
        if (!config) {
            console.warn(`章节 ${chapterNumber} 的配置不存在，使用第一章配置`);
            return this.chapterConfigs[1];
        }

        return config;
    }

    /**
     * 获取所有章节的列表
     */
    public getAllChapters(): ChapterBattleConfig[] {
        return Object.values(this.chapterConfigs).sort((a, b) => a.chapterNumber - b.chapterNumber);
    }

    /**
     * 验证指定章节的求生者ID是否有效
     * @param chapterNumber 章节数
     * @param survivorLibrary 求生者库实例
     * @returns 有效的求生者ID列表
     */
    public validateChapterSurvivors(chapterNumber: number, survivorLibrary: any): string[] {
        const config = this.getChapterConfig(chapterNumber);
        const allSurvivors = survivorLibrary.getAllSurvivors();
        
        const validSurvivors = config.availableSurvivors.filter(id => 
            allSurvivors.some((survivor: any) => survivor.id === id)
        );

        if (validSurvivors.length !== config.availableSurvivors.length) {
            console.warn(`章节 ${chapterNumber} 的部分求生者ID无效:`, {
                原配置: config.availableSurvivors,
                有效配置: validSurvivors
            });
        }

        return validSurvivors;
    }

    /**
     * 根据URL参数获取章节数
     * @returns 章节数，默认为1
     */
    public getChapterFromURL(): number {
        const urlParams = new URLSearchParams(window.location.search);
        const chapterParam = urlParams.get('chapter') || urlParams.get('level');
        
        if (chapterParam) {
            const chapterNumber = parseInt(chapterParam, 10);
            if (chapterNumber >= 1 && chapterNumber <= 6) {
                return chapterNumber;
            }
        }
        
        return 1; // 默认第一章
    }

    /**
     * 显示章节信息到控制台
     * @param chapterNumber 章节数
     */
    public logChapterInfo(chapterNumber: number): void {
        const config = this.getChapterConfig(chapterNumber);
        console.log(`================= 章节信息 =================`);
        console.log(`第 ${config.chapterNumber} 章: ${config.chapterName}`);
        console.log(`描述: ${config.description}`);
        console.log(`可选求生者:`, config.availableSurvivors);
        console.log(`可选监管者:`, config.availableHunters.map(h => h.name));
        console.log(`===========================================`);
    }
}

// 导出单例实例
export const chapterConfigManager = new ChapterConfigManager();