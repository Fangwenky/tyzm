/**
 * 章节配置系统
 * 根据剧情章节配置不同的求生者和监管者
 */
var ChapterConfigManager = /** @class */ (function () {
    function ChapterConfigManager() {
        this.chapterConfigs = {};
        this.initializeChapterConfigs();
    }
    ChapterConfigManager.prototype.initializeChapterConfigs = function () {
        // 第一章：新手教程 - 医疗主题
        this.chapterConfigs[1] = {
            chapterNumber: 1,
            chapterName: "医者仁心",
            description: "在庄园的医务室中，医疗专家们面临着第一次考验",
            availableSurvivors: [
                'doctor', // 医生 - 治疗专家
                'gardener', // 园丁 - 防御专家
                'lawyer'
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
                'doctor', 'lawyer', 'gardener','dancer','acrobat'
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
                'doctor', 'lawyer', 'gardener','dancer','acrobat','wildman'
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
                'doctor', 'lawyer', 'gardener','dancer','acrobat','wildman','reporter','composer'
            ],
            availableHunters: [
                {
                    name: '愚人金',
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
                'doctor', 'lawyer', 'gardener','dancer','acrobat','wildman','reporter','composer','entomologist'
            ],
            availableHunters: [
                {
                    name: '红夫人',
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
                'doctor', 'lawyer', 'gardener','dancer','acrobat','wildman','reporter','composer','entomologist','novelist','little_girl'
            ],
            availableHunters: [
                {
                    name: '噩梦',
                    hp: 250,
                    description: '庄园中最强大的邪恶存在，集合了所有恐怖的力量'
                }
            ]
        };
    };
    /**
     * 根据章节数获取战斗配置
     * @param chapterNumber 章节数 (1-6)
     * @returns 该章节的战斗配置，如果章节数无效则返回第一章配置
     */
    ChapterConfigManager.prototype.getChapterConfig = function (chapterNumber) {
        // 验证章节数范围
        if (chapterNumber < 1 || chapterNumber > 6) {
            console.warn("\u65E0\u6548\u7684\u7AE0\u8282\u6570: ".concat(chapterNumber, "\uFF0C\u4F7F\u7528\u7B2C\u4E00\u7AE0\u914D\u7F6E"));
            return this.chapterConfigs[1];
        }
        var config = this.chapterConfigs[chapterNumber];
        if (!config) {
            console.warn("\u7AE0\u8282 ".concat(chapterNumber, " \u7684\u914D\u7F6E\u4E0D\u5B58\u5728\uFF0C\u4F7F\u7528\u7B2C\u4E00\u7AE0\u914D\u7F6E"));
            return this.chapterConfigs[1];
        }
        return config;
    };
    /**
     * 获取所有章节的列表
     */
    ChapterConfigManager.prototype.getAllChapters = function () {
        return Object.values(this.chapterConfigs).sort(function (a, b) { return a.chapterNumber - b.chapterNumber; });
    };
    /**
     * 验证指定章节的求生者ID是否有效
     * @param chapterNumber 章节数
     * @param survivorLibrary 求生者库实例
     * @returns 有效的求生者ID列表
     */
    ChapterConfigManager.prototype.validateChapterSurvivors = function (chapterNumber, survivorLibrary) {
        var config = this.getChapterConfig(chapterNumber);
        var allSurvivors = survivorLibrary.getAllSurvivors();
        var validSurvivors = config.availableSurvivors.filter(function (id) {
            return allSurvivors.some(function (survivor) { return survivor.id === id; });
        });
        if (validSurvivors.length !== config.availableSurvivors.length) {
            console.warn("\u7AE0\u8282 ".concat(chapterNumber, " \u7684\u90E8\u5206\u6C42\u751F\u8005ID\u65E0\u6548:"), {
                原配置: config.availableSurvivors,
                有效配置: validSurvivors
            });
        }
        return validSurvivors;
    };
    /**
     * 根据URL参数获取章节数
     * @returns 章节数，默认为1
     */
    ChapterConfigManager.prototype.getChapterFromURL = function () {
        var urlParams = new URLSearchParams(window.location.search);
        var chapterParam = urlParams.get('chapter') || urlParams.get('level');
        if (chapterParam) {
            var chapterNumber = parseInt(chapterParam, 10);
            if (chapterNumber >= 1 && chapterNumber <= 6) {
                return chapterNumber;
            }
        }
        return 1; // 默认第一章
    };
    /**
     * 显示章节信息到控制台
     * @param chapterNumber 章节数
     */
    ChapterConfigManager.prototype.logChapterInfo = function (chapterNumber) {
        var config = this.getChapterConfig(chapterNumber);
        console.log("================= \u7AE0\u8282\u4FE1\u606F =================");
        console.log("\u7B2C ".concat(config.chapterNumber, " \u7AE0: ").concat(config.chapterName));
        console.log("\u63CF\u8FF0: ".concat(config.description));
        console.log("\u53EF\u9009\u6C42\u751F\u8005:", config.availableSurvivors);
        console.log("\u53EF\u9009\u76D1\u7BA1\u8005:", config.availableHunters.map(function (h) { return h.name; }));
        console.log("===========================================");
    };
    return ChapterConfigManager;
}());
export { ChapterConfigManager };
// 导出单例实例
export var chapterConfigManager = new ChapterConfigManager();
//# sourceMappingURL=ChapterConfig.js.map