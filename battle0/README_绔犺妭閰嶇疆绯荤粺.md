# 战斗系统章节配置使用说明

## 概述

现在战斗系统支持根据剧情章节自动配置不同的求生者和监管者！系统总共支持6个章节，每个章节都有独特的主题、可选角色和对应的监管者。

## 章节配置详情

### 第1章：医者仁心 🏥
- **主题**: 医疗主题，注重治疗和防御
- **可选求生者**: 医生、园丁、作曲家
- **监管者**: 厂长 (HP: 160)
- **描述**: 在庄园的医务室中，医疗专家们面临着第一次考验

### 第2章：法理之争 ⚖️
- **主题**: 智力对决，策略为王
- **可选求生者**: 律师、小说家、记者
- **监管者**: 小丑 (HP: 170)
- **描述**: 在庄园的法庭中，智慧型求生者与邪恶进行智力对决

### 第3章：野性呼唤 🌿
- **主题**: 力量较量，原始本能
- **可选求生者**: 野人、前锋、昆虫学家
- **监管者**: 蜘蛛 (HP: 180)
- **描述**: 在庄园的荒野中，原始力量与野性本能的较量

### 第4章：舞台惊魂 🎭
- **主题**: 敏捷与表演，艺术对抗
- **可选求生者**: 舞女、杂技演员、小女孩
- **监管者**: 红夫人 (HP: 185)
- **描述**: 在庄园的剧场中，艺术家们用优雅与技巧对抗邪恶

### 第5章：机械迷城 ⚙️
- **主题**: 科技对决，机械力量
- **可选求生者**: 机械师、医生、律师
- **监管者**: 愚人金 (HP: 200)
- **描述**: 在庄园的工厂中，机械师们与工业恐怖进行最后的较量

### 第6章：末日审判 ☠️
- **主题**: 终极对决，全体集合
- **可选求生者**: 医生、律师、园丁、野人、记者、作曲家、舞女、杂技演员、机械师（9个角色）
- **监管者**: 噩梦 (HP: 250)
- **描述**: 最终章节，所有幸存的求生者联合对抗终极邪恶

## 使用方法

### 方法1：URL参数（推荐）
在战斗页面URL中添加章节参数：

```
# 进入第2章
battle.html?chapter=2

# 或使用 level 参数
battle.html?level=3
```

### 方法2：JavaScript编程调用
在主游戏的 `plotmaneger` 或其他脚本中调用：

```javascript
// 设置战斗章节
window.setBattleChapter(2);

// 或使用完整接口
window.battleSystem.setBattleChapter(3);

// 获取当前章节信息
const chapterInfo = window.battleSystem.getCurrentChapterInfo();
console.log(`当前章节: 第${chapterInfo.chapterNumber}章 - ${chapterInfo.chapterName}`);

// 获取所有章节列表
const allChapters = window.battleSystem.getAllChaptersInfo();
```

### 方法3：跳转时传递参数
从主游戏跳转到战斗系统时，可以这样操作：

```javascript
// 在主游戏的 plotmaneger 中
function startBattleWithChapter(chapterNumber) {
    // 方法A：URL参数方式
    window.location.href = `battle/index.html?chapter=${chapterNumber}`;
    
    // 方法B：如果是在同一个页面，直接调用
    if (typeof window.setBattleChapter === 'function') {
        window.setBattleChapter(chapterNumber);
    }
}

// 使用示例
startBattleWithChapter(3); // 进入第3章战斗
```

## 技术实现说明

### 新增文件
- `src/core/ChapterConfig.ts` - 章节配置管理器

### 修改文件
- `src/main.ts` - 主入口文件，现在支持章节配置

### 核心类
- `ChapterConfigManager` - 管理所有章节配置
- `ChapterBattleConfig` - 章节配置数据结构

### 全局接口
系统会在 `window` 对象上注册以下接口供外部调用：

```typescript
window.battleSystem = {
    setBattleChapter(chapterNumber: number): void,
    getCurrentChapterInfo(): ChapterInfo,
    getAllChaptersInfo(): ChapterInfo[],
    setChapter: setBattleChapter,  // 兼容别名
    setLevel: setBattleChapter     // 兼容别名
}

// 兼容性全局函数
window.setBattleChapter(chapterNumber: number): void
window.setChapter(chapterNumber: number): void
```

## 调试和验证

### 控制台输出
系统启动时会在控制台输出详细信息：

```
================= 游戏初始化 =================
检测到章节数: 2
================ 章节信息 ================
第 2 章: 法理之争
描述: 在庄园的法庭中，智慧型求生者与邪恶进行智力对决
可选求生者: ['lawyer', 'novelist', 'reporter']
可选监管者: ['小丑']
===========================================
```

### 界面提示
游戏会在左上角显示当前章节信息，包括：
- 章节编号和名称
- 章节描述
- 可选求生者列表
- 本章监管者

### 错误处理
- 如果章节数无效（<1 或 >6），会自动回退到第1章
- 如果章节配置有问题，会在控制台显示错误信息并使用默认配置

## 扩展和自定义

### 添加新章节
如需添加新章节，在 `ChapterConfig.ts` 的 `initializeChapterConfigs()` 方法中添加：

```typescript
this.chapterConfigs[7] = {
    chapterNumber: 7,
    chapterName: "新章节名称",
    description: "新章节描述",
    availableSurvivors: ['doctor', 'lawyer'],
    availableHunters: [{ name: '新监管者', hp: 200 }]
};
```

### 修改现有配置
直接修改 `ChapterConfig.ts` 文件中对应章节的配置即可。

### 添加新求生者或监管者
1. 在 `SurvivorLibrary.ts` 中添加新的求生者定义
2. 在章节配置中将新求生者ID添加到对应章节的 `availableSurvivors` 数组
3. 监管者可直接在章节配置的 `availableHunters` 数组中添加

## 常见问题

**Q: 如何确认系统正在使用正确的章节？**
A: 查看控制台输出，或调用 `window.battleSystem.getCurrentChapterInfo()` 获取当前章节信息。

**Q: 能否在战斗中切换章节？**
A: 可以调用 `window.setBattleChapter(newChapter)` 来重新初始化游戏，但会返回到求生者选择界面。

**Q: 如果URL中没有指定章节会怎样？**
A: 系统会自动使用第1章的配置。

**Q: 章节配置会影响现有的存档吗？**
A: 不会，章节配置只影响新开始的战斗，不会修改已有数据。

## 更新日志

### v1.0 - 章节配置系统
- ✅ 新增6个预定义章节配置
- ✅ 支持URL参数指定章节
- ✅ 支持JavaScript接口调用
- ✅ 完整的错误处理和回退机制
- ✅ 直观的章节信息显示
- ✅ 向后兼容原有配置方式