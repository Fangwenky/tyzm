# 战斗卡牌 V6.2 - 可选求生者配置版 使用说明

## 概述

本版本保留了完整的三步游戏流程：**选择求生者 → 选择手牌 → 战斗**，但在代码中配置可供选择的求生者列表。玩家只能从预定义的求生者中进行选择。

## 配置方式

### 1. 打开配置文件

编辑 `src/main.ts` 文件，在文件顶部找到 `BATTLE_CONFIG` 配置区域：

```typescript
// =================== 手动战斗配置区域 ===================
// 在这里手动配置本次游戏可选择的求生者
// 修改下面的配置来改变可选择的角色

const BATTLE_CONFIG = {
    // 可选择的求生者ID列表（玩家只能从这些求生者中选择）
    availableSurvivors: [
        'doctor',      // 医生
        'lawyer',      // 律师
        'gardener',    // 园丁
        'mechanic',    // 机械师
        'forward'      // 前锋
    ]
};
```

### 2. 修改可选求生者

在 `availableSurvivors` 数组中添加或删除求生者ID，只有列表中的求生者会在选择界面中显示。

#### 全部可用的求生者 ID：
- `doctor` - 医生
- `lawyer` - 律师  
- `gardener` - 园丁
- `thief` - 小偷
- `coordinator` - 空军
- `mechanic` - 机械师
- `forward` - 前锋
- `magician` - 魔术师
- `explorer` - 探险家
- `mercenary` - 佣兵
- `air_force` - 空军
- `cowboy` - 牛仔
- `dancer` - 舞女
- `seer` - 先知
- `embalmer` - 入殓师
- `prospector` - 勘探者
- `enchantress` - 咒术师
- `wildling` - 野人
- `acrobat` - 杂技演员
- `first_officer` - 一等舱乘客
- `postman` - 邮递员
- `gravekeeper` - 守墓人
- `female_dancer` - 女舞者
- `prisoner` - 囚徒
- `entomologist` - 昆虫学家
- `painter` - 画家
- `batter` - 击球手
- `toy_merchant` - 玩具商
- `weeping_clown` - 哭泣小丑
- `inventor` - 发明家
- `lucky_guy` - 幸运儿
- `patient` - 病患

### 3. 重新编译

修改配置后，需要重新编译TypeScript代码：

```bash
cd 战斗卡牌V5.1_装备栏版_修复版
npx tsc
```

### 4. 运行游戏

在浏览器中打开 `index.html` 文件，按照标准流程进行游戏。

## 游戏流程

### 第一步：选择求生者
- 界面只显示您在配置中指定的求生者
- 左上角会显示当前可选求生者的提示信息
- 点击选择您想要的求生者

### 第二步：构建牌组
- 选择您想要的卡牌组合
- 构建包含20张卡牌的牌组

### 第三步：战斗
- 与随机选择的监管者进行战斗
- 使用您构建的牌组和选择的求生者技能

## 特性

### 灵活的求生者选择
- 完全自定义可选择的求生者列表
- 可以设置1个到32个求生者供选择
- 支持任意组合搭配

### 配置验证
- 游戏启动时会验证配置的求生者ID是否有效
- 无效的ID会被自动过滤并在控制台显示警告
- 如果所有ID都无效，游戏会显示错误信息

### 配置提示
- 游戏启动时在左上角显示当前可选求生者
- 提示信息会在8秒后自动消失
- 控制台输出详细的配置信息

### 随机敌人
- 监管者仍然随机选择（厂长、小丑、蜘蛛、红夫人、愚人金、噩梦）
- 保持游戏的不确定性和挑战性

## 配置示例

### 示例1：新手友好配置
```typescript
const BATTLE_CONFIG = {
    availableSurvivors: [
        'doctor',      // 医生 - 治疗能力强
        'lawyer',      // 律师 - 地图知识丰富
        'gardener'     // 园丁 - 简单易用
    ]
};
```

### 示例2：高手挑战配置
```typescript
const BATTLE_CONFIG = {
    availableSurvivors: [
        'magician',    // 魔术师 - 操作复杂
        'acrobat',     // 杂技演员 - 高风险高回报
        'seer',        // 先知 - 需要策略思维
        'enchantress'  // 咒术师 - 技能组合复杂
    ]
};
```

### 示例3：全角色配置
```typescript
const BATTLE_CONFIG = {
    availableSurvivors: [
        'doctor', 'lawyer', 'gardener', 'thief', 'coordinator',
        'mechanic', 'forward', 'magician', 'explorer', 'mercenary',
        'air_force', 'cowboy', 'dancer', 'seer', 'embalmer',
        'prospector', 'enchantress', 'wildling', 'acrobat',
        'first_officer', 'postman', 'gravekeeper', 'female_dancer',
        'prisoner', 'entomologist', 'painter', 'batter',
        'toy_merchant', 'weeping_clown', 'inventor', 'lucky_guy', 'patient'
    ]
};
```

## 调试信息

游戏会在浏览器控制台输出详细信息：
- 当前配置的求生者ID列表
- 配置验证结果
- 可选择的求生者名称列表
- 战斗开始信息

## 注意事项

1. **配置验证**：无效的求生者ID会被自动过滤
2. **编译必需**：每次修改配置后都需要重新编译
3. **至少一个**：至少要配置一个有效的求生者ID
4. **浏览器缓存**：修改后没生效请刷新浏览器并清除缓存

## 版本变更

### V6.2 主要变更：
- ✅ 保留完整三步游戏流程（选求生者 → 选手牌 → 战斗）
- ✅ 在代码中配置可选择的求生者列表
- ✅ 求生者选择界面只显示配置中的角色
- ✅ 自动验证配置有效性
- ✅ 随机敌人选择机制
- ✅ 配置提示和调试信息

---

**开发时间**: 2025-09-06  
**作者**: MiniMax Agent
