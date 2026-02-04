// script/managers/PlotManager.js
class PlotManager {
  constructor() {
    // 固定章节（id / 名称 / 对应scenario文件名，不带扩展名）
    // script/managers/PlotManager.js
this.chapters = [
  { id: 'ch1',  name: '第一章：蓟花刺<br><br>第一幕：医生：无罪的白衣',   scenario: 'scenario1.1',  unlocked: true,  completed: false, battleDone: true },
  { id: 'ch2',  name: '第二幕 园丁：蓟花的浪漫',   scenario: 'scenario1.2',  unlocked: false, completed: false, battleDone: true },
  { id: 'ch3',  name: '第三幕 律师:合法的不德',   scenario: 'scenario1.3',  unlocked: false, completed: false, battleDone: true },
  { id: 'ch4',  name: '第四幕 厂长:未寄出的信',   scenario: 'scenario1.4',  unlocked: false, completed: false, battleDone: false },
  { id: 'ch5',  name: '第二章：回不去的喧嚣<br><br> 第一幕：舞女:笼中的金丝雀',   scenario: 'scenario2.1',  unlocked: false, completed: false, battleDone: true },
  { id: 'ch6',  name: '第二幕 杂技演员:褪色的彩球',   scenario: 'scenario2.2',  unlocked: false, completed: false, battleDone: true },
  { id: 'ch7',  name: '第三幕 小丑:燃烧的面具',   scenario: 'scenario2.3',  unlocked: false, completed: false, battleDone: false },
  { id: 'ch8',  name: '第四幕 野人:林间的鬃毛',   scenario: 'scenario2.4',  unlocked: false, completed: false, battleDone: true },
  { id: 'ch9',  name: '第五幕 蜘蛛:织网的纺车',   scenario: 'scenario2.5',  unlocked: false, completed: false, battleDone: false },
  { id: 'ch10', name: '第三章 记忆余烬<br><br>第一幕：记者:夜莺的守护',   scenario: 'scenario3.1', unlocked: false, completed: false, battleDone: true },
  { id: 'ch11', name: '第二幕 作曲家:缪斯的弃婴', scenario: 'scenario3.2', unlocked: false, completed: false, battleDone: true },
  { id: 'ch12', name: '第三幕 “愚人金”:命运的愚弄', scenario: 'scenario3.3', unlocked: false, completed: false, battleDone: false },
  { id: 'ch13',  name: '第四幕 昆虫学者:自由如蜂群新生',   scenario: 'scenario3.4',  unlocked: false, completed: false, battleDone: true },
  { id: 'ch14',  name: '第五幕 红夫人:矢车菊似皇后的哀伤',   scenario: 'scenario3.5',  unlocked: false, completed: false, battleDone: false },
  { id: 'ch15',  name: '第四章：重逢之时<br><br>第一幕：“小女孩”:回忆似书页未搁浅',   scenario: 'scenario4.1',  unlocked: false,  completed: false, battleDone: true },
  { id: 'ch16',  name: '第二幕 小说家:遗忘如美梦又重启',   scenario: 'scenario4.2',  unlocked: false, completed: false, battleDone: true },
  { id: 'ch17',  name: '第三幕 “噩梦”:渡鸦若噩梦不归林(终极 boss)',   scenario: 'scenario4.3',  unlocked: false, completed: false, battleDone: false },

];

// ……this.chapters = [ … ]; 之后
this.unlockCharMap = {
  ch1: '医生',
  ch2: '园丁',
  ch3: '律师',
  ch4: '厂长',
  ch5: '舞女',
  ch6: '杂技演员',
  ch7: '小丑',
  ch8: '野人',
  ch9: '蜘蛛',
  ch10: '记者',
  ch11: '作曲家',
  ch12: '“愚人金”',
  ch13: '昆虫学者',
  ch14: '红夫人',
  ch15: '“小女孩”',
  ch16: '小说家',
  ch17: '“噩梦”'
};


/** 弹出“已解锁 XX 角色”气泡（复用成就弹窗 UI） */
this._showCharacterUnlock = (chapter) => {
  // 角色名优先取映射；没有则从章节标题里兜底抽取冒号/全角冒号后的角色关键词
  const fallback = (chapter?.name || '').split(/[:：]/)[1]?.split(/[：:（(（]/)[0]?.trim() || '新角色';
  const charName = this.unlockCharMap[chapter.id] || fallback;

  // 只要成就弹窗存在，就复用它
  window.achievementManager?.showPopup?.(
    `已解锁「${charName}」角色`,
    `在《${(chapter?.name || '').replace(/<br\s*\/?>/gi,' ').trim()}》首次通关获得`
  );
};


    // 绑定 UI
    this.$overlay   = document.getElementById('plot-overlay');
    this.$list      = document.getElementById('plot-list');
    this.$btnOpen   = document.getElementById('btn-open-plot');
    this.$btnClose  = document.getElementById('btn-close-plot');

this.$btnOpen && this.$btnOpen.addEventListener('click', () => this.open());
document.getElementById('btn-open-plot')?.addEventListener('click', () => {
  document.dispatchEvent(new CustomEvent('guide:open-story'));
});

    this.$btnClose && this.$btnClose.addEventListener('click', () => this.close());
    this.$overlay  && this.$overlay.addEventListener('click', (e) => { if (e.target === this.$overlay) this.close(); });

    this.render();
  }
  // 标记一章“剧情完成”
setChapterCompleted(chId, done = true) {
  const idx = this.chapters.findIndex(c => c.id === chId);
  if (idx === -1) return false;
  this.chapters[idx].completed = !!done;
  this.recomputeUnlocks?.();     // 完成后重算解锁链
  return true;
}

  // 标记一章战斗结果，并触发重算
setBattleDoneFor(chId, done = true) {
  const idx = this.chapters.findIndex(c => c.id === chId);
  if (idx === -1) return false;

  const ch = this.chapters[idx];
  ch.battleDone = !!done;

  // 如果你的规则是“战斗胜利 = 本章通关”，这里顺手置 completed
  if (done) ch.completed = true;

  this.recomputeUnlocks?.();
  return true;
}


// 根据规则重算整条解锁链（建议：上一章 battleDone 或 completed → 下一章解锁）
// PlotManager.js 内（class PlotManager { ... } 里）
recomputeUnlocks() {
  const list = this.chapters;
  if (!Array.isArray(list) || list.length === 0) return;

  // 第 1 章默认可进入
  list[0].unlocked = true;

  for (let i = 1; i < list.length; i++) {
    const prev = list[i - 1];

    // —— 严格规则：上一章“剧情完成 + 战斗胜利” → 才解锁下一章 ——
    const canOpen = !!(prev && prev.completed === true && prev.battleDone === true);

    list[i].unlocked = canOpen;
  }
}


  // 新增：标记战斗完成并解锁下一章
  setBattleDoneFor(chId, done = true) {
    const idx = this.chapters.findIndex(c => c.id === chId);
    if (idx === -1) return false;

    const ch = this.chapters[idx];
    ch.battleDone = !!done;

    // 解锁下一章（仅在胜利时）
    const next = this.chapters[idx + 1];
    if (next && done) next.unlocked = true;

    return true;   // ← 别忘了返回值！
  }
  


  // —— 基础状态 API —— //
  getChapter(id) { return this.chapters.find(c => c.id === id); }

  unlock(id) {
    const ch = this.getChapter(id);
    if (ch && !ch.unlocked) { ch.unlocked = true; this.render(); }
  }

  // 通关（不再直接解锁下一章）
  markCompleted(id) {
    const ch = this.getChapter(id);
    if (ch && !ch.completed) {
      ch.completed = true;
      this._tryUnlockNext(id);
      this.render();
        // ★ 新增：仅首次通关时提示“已解锁角色”
    try { this._showCharacterUnlock(ch); } catch(e) { /* 忽略 UI 异常 */ }
    }
  }

  // 标记战斗已完成（无论胜负）
  markBattleDone(id) {
    const ch = this.getChapter(id);
    if (ch && !ch.battleDone) {
      ch.battleDone = true;
      this._tryUnlockNext(id);
      this.render();
    }
  }

  // 检查上一章已通关且战斗已完成，才解锁下一章
  _tryUnlockNext(id) {
    const idx = this.chapters.findIndex(x => x.id === id);
    if (idx >= 0 && idx + 1 < this.chapters.length) {
      const cur = this.chapters[idx];
      const nxt = this.chapters[idx + 1];
      if (cur.completed && cur.battleDone && !nxt.unlocked) {
        nxt.unlocked = true;
      }
    }
  }

  // —— 与存档交互（跟背包同风格）—— //
  // 与存档交互
exportState() {
  return {
    // ① unlocked 可选：建议不保存，避免旧值污染
    // chapters: this.chapters.map(c => ({ id: c.id, completed: !!c.completed, battleDone: !!c.battleDone })),
    chapters: this.chapters.map(c => ({ id: c.id, completed: !!c.completed, battleDone: !!c.battleDone }))
  };
}

importState(state = {}) {
  const map = new Map((state.chapters || []).map(x => [x.id, x]));
  this.chapters.forEach(c => {
    const s = map.get(c.id);
    if (s) {
      // ② 不再从存档覆盖 unlocked（让它由规则重算）
      // c.unlocked  = !!s.unlocked;   // ← 删除
      c.completed = !!s.completed;
      c.battleDone = !!s.battleDone;
    }
  });

  // ③ 导入后统一按规则重算解锁链（保证 UI 一致）
  this.recomputeUnlocks?.();

  this.render?.();
}


  // —— UI —— //
  open() {
    this.render();
    this.$overlay?.classList.remove('hidden');
  }
  close() {
    this.$overlay?.classList.add('hidden');
  }

  // 进入剧情：跳到 plot.html，带上 scenario 名
  enterChapter(id) {
  const ch = this.getChapter(id);
  if (!ch || !ch.unlocked) { window.toast?.('该章节未解锁'); return; }
  
  
  sessionStorage.setItem('currentChapterId', ch.id);
  sessionStorage.removeItem('plotComplete'); // 清掉上次的标记
  // 同标签页跳转，保持键盘事件正常
  window.autoSaveNow?.('进入剧情');
  window.location.href = `./pages/Plot/plot.html?scene=${encodeURIComponent(ch.scenario)}`;
}


  // 战斗占位（后续你接入真正战斗系统）
  startBattle(id) {
  const ch = this.getChapter(id);
  if (!ch || !ch.unlocked) { window.toast?.('该章节未解锁'); return; }
  if (!ch.completed) { window.toast?.('请先通关本章剧情，再开始战斗'); return; } // ✅ 兜底

  // 保底：点击战斗键即标记战斗已完成
 

   // 🆕 重构后：跳转到统一的战斗页面，通过URL参数传递关卡ID
  window.autoSaveNow?.('进入战斗');
  
  // 将章节ID映射到战斗章节编号 (只有特定章节有战斗)
  const battleChapterMap = {
    'ch4': 1,   // 第三幕 律师 -> 第1章 医者仁心
    'ch7': 2,   // 第二章第一幕 舞女 -> 第2章 法理之争
    'ch9': 3,   // 第二幕 杂技演员 -> 第3章 野性呼唤
    'ch12': 4,   // 第四幕 野人 -> 第4章 舞台惊魂
    'ch14': 5,   // 第五幕 蜘蛛 -> 第5章 机械迷城
    'ch17': 6   // 第二幕 作曲家 -> 第6章 末日审判
  };
  
  const chapterNumber = battleChapterMap[ch.id] || 1;
  console.log(`章节 ${ch.id} 映射到战斗章节 ${chapterNumber}`);
  
  // 统一战斗页面，支持所有关卡
  const battlePage = "./battle0/index.html";
  window.location.href = `${battlePage}?chapter=${chapterNumber}`;
}


 render() {
  if (!this.$list) return;
  this.$list.innerHTML = this.chapters.map(c => {
    let statusText = '未解锁';
    let statusColor = '#c00';
    if (c.unlocked) {
      const chaptersWithBattle = ['ch4','ch7','ch9','ch12','ch14','ch17'];
      if (c.completed && c.battleDone && chaptersWithBattle.includes(c.id)) {
        statusText = '已通关+战斗';
        statusColor = 'green';
      } else if (c.completed) {
        statusText = '已通关';
        statusColor = '#0a0';
      } else {
        statusText = '已解锁';
        statusColor = '#0aa';
      }
    }

    const enterDisabled   = c.unlocked ? '' : 'disabled';

    // 只在特定章节显示战斗键
  const chaptersWithBattle = ['ch4','ch7','ch9','ch12','ch14','ch17'];
const showBattle = chaptersWithBattle.includes(c.id);

// ✅ 只要求“已通关”，不再因为 battleDone==true 禁用
const battleDisabled = (showBattle && c.unlocked && c.completed) ? '' : 'disabled';

// ✅ 已打过显示“重打战斗”，没打过显示“战斗”
const battleLabel = (showBattle && c.battleDone) ? '重打战斗' : '战斗';


    return `
      <div class="save-item" data-id="${c.id}">
        <div class="save-meta">
          <div class="save-title">${c.name}</div>
          <div class="save-sub" style="color:${statusColor}">${statusText}</div>
        </div>
        <div class="save-actions">
          <button class="btn" data-act="enter" ${enterDisabled}>进入剧情</button>
          ${ showBattle ? `<button class="btn ghost" data-act="battle" ${battleDisabled}>${battleLabel}</button>` : '' }


        </div>
      </div>
    `;
  }).join('');


  // 你的事件委派保持不变（注意不要 { once:true }，否则重渲染后只响应一次）
  this.$list.onclick = (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const item = e.target.closest('.save-item');
    if (!item) return;
    const id = item.dataset.id;
    const act = btn.dataset.act;
    if (act === 'enter')  this.enterChapter(id);
    if (act === 'battle') this.startBattle(id);
  };
}

}
// === 单例 & 全局别名（文件末尾追加）===
window.Game = window.Game || {};
window.Game.plotManager = window.Game.plotManager || new PlotManager();

// 兼容旧代码：两种老入口都指向同一个实例
window.PlotManager = window.Game.plotManager;
window.plot = window.Game.plotManager;   // ← 关键补这一行



// —— 全局单例 —— //
if (!window.plot) window.plot = new PlotManager();
