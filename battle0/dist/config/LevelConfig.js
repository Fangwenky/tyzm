// 关卡配置文件 - 统一管理所有关卡的求生者和监管者配置
// 这个文件替代了原来在6个main.js文件中重复的BATTLE_CONFIG
// 全部关卡配置
export var LEVEL_CONFIGS = [
    {
        id: 'ch4',
        name: '第三幕：律师的合法不德',
        description: '在律师的世界里，白与黑的界线往往模糊不清...',
        availableSurvivors: ['doctor', 'lawyer', 'gardener'],
        availableHunters: [{ name: '厂长', hp: 180 }]
    },
    {
        id: 'ch7',
        name: '第一幕：舞女的笼中金丝雀',
        description: '华丽的舞台背后，隐藏着不为人知的秘密...',
        availableSurvivors: ['doctor', 'lawyer', 'gardener','dancer','acrobat'],
        availableHunters: [{ name: '小丑', hp: 180 }]
    },
    {
        id: 'ch9',
        name: '第二幕：杂技演员的褪色彩球',
        description: '曾经绚烂的彩球，如今只剩下斑驳的记忆...',
        availableSurvivors: ['doctor', 'lawyer', 'gardener','dancer','acrobat','wildman'],
        availableHunters: [{ name: '蜘蛛', hp: 180 }]
    },
    {
        id: 'ch12',
        name: '第四幕：野人的林间鬃毛',
        description: '在原始的森林中，野性与文明产生了碰撞...',
        availableSurvivors: ['doctor', 'lawyer', 'gardener','dancer','acrobat','wildman','reporter','composer'],
        availableHunters: [{ name: '愚人金', hp: 180 }]
    },
    {
        id: 'ch4',
        name: '第五幕：蜘蛛的织网纺车',
        description: '精心编织的网络，等待着猎物的到来...',
        availableSurvivors:  ['doctor', 'lawyer', 'gardener','dancer','acrobat','wildman','reporter','composer','entomologist'],
        availableHunters: [{ name: '红夫人', hp: 180 }]
    },
    {
        id: 'ch17',
        name: '第二幕：作曲家的缪斯弃婴',
        description: '失去灵感的作曲家，在绝望中寻找最后的音符...',
        availableSurvivors: ['doctor', 'lawyer', 'gardener','dancer','acrobat','wildman','reporter','composer','entomologist','novelist','little_girl'],
        availableHunters: [{ name: '噩梦', hp: 180 }]
    }
];
// 根据关卡ID获取配置的工具函数
export function getLevelConfig(levelId) {
    return LEVEL_CONFIGS.find(function (config) { return config.id === levelId; }) || null;
}
// 根据关卡ID获取战斗配置（与原BATTLE_CONFIG格式兼容）
export function getBattleConfig(levelId) {
    var levelConfig = getLevelConfig(levelId);
    if (!levelConfig) {
        console.error("\u672A\u627E\u5230\u5173\u5361\u914D\u7F6E: ".concat(levelId));
        return null;
    }
    return {
        availableSurvivors: levelConfig.availableSurvivors,
        availableHunters: levelConfig.availableHunters
    };
}
// 获取所有可用的关卡ID
export function getAllLevelIds() {
    return LEVEL_CONFIGS.map(function (config) { return config.id; });
}
// 验证关卡ID是否有效
export function isValidLevelId(levelId) {
    return getAllLevelIds().includes(levelId);
}
//# sourceMappingURL=LevelConfig.js.map