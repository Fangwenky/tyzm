// script/managers/AchievementManager.js
class AchievementManager {
  constructor() {
    this.STORAGE_KEY = "account_achievements"; // 账号级持久化 key

    this.achievements = [
      { id: 'ach1', name: '噩梦的开始', desc: '完成注册', completed: false },
      { id: 'ach2', name: '这里不对！', desc: '有所发现', completed: false },
      { id: 'ach3', name: '接近真相', desc: '进入地下室', completed: false },
      { id: 'ach4', name: '钢琴家', desc: '弹一次钢琴', completed: false },
      { id: 'ach5', name: '日记推演', desc: '观看一次剧情', completed: false },
      { id: 'ach6', name: '首战告捷', desc: '战斗胜利一次', completed: false },
      { id: 'ach7', name: '故事的最后', desc: '乌鸦亲手杀死了夜莺', completed: false },
      { id: 'ach8', name: '欧律狄刻', desc: '如果神话可以改写', completed: false },
      { id: 'ach9', name: 'color egg', desc: '发现彩蛋', completed: false }
    ];

    this.importFromLocal();      // 启动：从账号级 localStorage 恢复
    // 在 AchievementManager constructor() 里，this.importFromLocal(); 之后加入：
window.addEventListener('mapchange', (ev) => {
  if (ev?.detail?.mapId === 'room2') {
    this.checkAchievements({ ach3: true }); // ✅ 进入房间2 → 成就3完成
  }
});

// 可选兜底：如果一加载进来就已经在 room2（例如读档切图），也补一次判定
if (window.Game?.currentMapId === 'room2') {
  this.checkAchievements({ ach3: true });
}

    // === 监听：获得《网页设计与制作》 => 完成 ach9 ===
document.addEventListener('reward:granted', (e) => {
  const id = e?.detail?.id;
  if (id === 'web_book') {
    this.checkAchievements({ ach9: true });
  }
});

// 背包变动时也判一下（兼容：读档导入、手动添加、批量导入等）
document.addEventListener('inventory:changed', () => {
  const hasBook = (window.inventory?.count?.('web_book') || 0) > 0;
  if (hasBook) {
    this.checkAchievements({ ach9: true });
  }
});

// 兜底：页面就绪后检查一次（避免玩家先前已拥有该书但尚未刷成就）
window.addEventListener('DOMContentLoaded', () => {
  const hasBook = (window.inventory?.count?.('web_book') || 0) > 0
               || !!window.inventory?.items?.web_book;
  if (hasBook) {
    this.checkAchievements({ ach9: true });
  }
});


  }

  // —— 账号级持久化 —— //
  exportState() {
    const state = {};
    this.achievements.forEach(a => { state[a.id] = !!a.completed; });
    return state;
  }
  importState(stateObj = {}, { silent = true } = {}) {
    this.achievements.forEach(a => {
      if (typeof stateObj[a.id] === 'boolean') a.completed = stateObj[a.id];
    });
    this.updateView();
    if (!silent) {
      // 如需加载时也弹窗，可在此对比变化后调用 showPopup
    }
  }
  saveToLocal() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.exportState()));
    } catch (e) {
      console.warn('保存成就失败：', e);
    }
  }
  importFromLocal() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) this.importState(JSON.parse(raw), { silent: true });
    } catch (e) {
      console.warn('读取成就失败：', e);
    }
  }

  // —— 逻辑 —— //
  checkAchievements(gameState = {}) {
    console.log('[Achievement] 检查成就状态:', gameState);
    let changed = false;
    this.achievements.forEach(ach => {
      if (!ach.completed && gameState[ach.id]) {
        console.log(`[Achievement] 解锁成就 ${ach.id}: ${ach.name}`);
        ach.completed = true;
        this.showPopup(ach.name, ach.desc);
        changed = true;
      }
    });
    if (changed) {
      console.log('[Achievement] 成就状态有变化，更新视图和保存');
      this.updateView();
      this.saveToLocal();
    } else {
      console.log('[Achievement] 成就状态无变化');
    }
  }

  saveToLocal() {
    try {
      const state = this.exportState();
      console.log('[Achievement] 保存成就状态到本地:', state);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('[Achievement] 保存成就失败：', e);
    }
  }

  importFromLocal() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const state = JSON.parse(raw);
        console.log('[Achievement] 从本地加载成就状态:', state);
        this.importState(state, { silent: true });
      } else {
        console.log('[Achievement] 本地无成就数据');
      }
    } catch (e) {
      console.error('[Achievement] 读取成就失败：', e);
    }
  }
  resetAll() {
    this.achievements.forEach(a => a.completed = false);
    this.updateView();
    this.saveToLocal();
  }

  // —— UI —— //
  updateView() {
    this.achievements.forEach(ach => {
      const el = document.getElementById(ach.id);
      if (!el) return;
      const status = el.querySelector('.ach-status');
      if (!status) return;
      status.innerText = ach.completed ? '已完成' : '未完成';
      status.style.color = ach.completed ? 'green' : '#c00';
    });
  }
  showPopup(title, desc) {
    const popup = document.querySelector('.ach-popup');
    if (!popup) return; // 没有弹窗 DOM 就直接跳过
    popup.querySelector('.ach-title').innerText = title;
    popup.querySelector('.ach-desc').innerText = desc;
    popup.classList.remove('hidden', 'hide');
    setTimeout(() => {
      popup.classList.add('hide');
      setTimeout(() => {
        popup.classList.add('hidden');
        popup.classList.remove('hide');
      }, 1000);
    }, 3000);
  }
  // 在 AchievementManager 类里新增：
// 轻量“中心文字提示”——不再复用 .ach-popup，避免大块占位
// 轻量“中心文字提示”——带一点点背景，文字加粗
showCenterText(text, { duration = 3000 } = {}) {
  let mid = document.getElementById('mid-toast');
  if (!mid) {
    mid = document.createElement('div');
    mid.id = 'mid-toast';
    Object.assign(mid.style, {
      position: 'fixed',
      left: '50%',
      top: '42%',                     // 稍微靠上，避免挡住主角
      transform: 'translate(-50%, -50%)',
      zIndex: '9999',
      padding: '8px 14px',            // 适度内边距，小巧不臃肿
      background: 'rgba(0, 0, 0, 0.35)', // 半透明黑，淡背景
      borderRadius: '8px',            // 圆角
      color: '#fff',
      fontSize: '18px',
      fontWeight: '600',              // 粗体
      lineHeight: '1.4',
      textAlign: 'center',
      pointerEvents: 'none',
      textShadow: '0 2px 4px rgba(0,0,0,.6)', // 保证可读性
      opacity: '0',
      transition: 'opacity .18s ease'
    });
    document.body.appendChild(mid);
  }

  mid.textContent = text;
  mid.style.opacity = '1';

  clearTimeout(this._midTimer);
  this._midTimer = setTimeout(() => {
    mid.style.opacity = '0';
  }, duration);
}



}



// —— 单例 & 页面就绪时刷新 —— //
if (!window.achievementManager) {
  window.achievementManager = new AchievementManager();
}
window.addEventListener('DOMContentLoaded', () => {
  window.achievementManager.updateView?.();
});

// —— 兼容你现有的按钮测试（main.html 里的两个按钮） —— //
window.showAchievement = function(title, desc){
  window.achievementManager?.showPopup?.(title, desc);
};
window.completeAchievement2 = function(){
  window.achievementManager?.checkAchievements?.({ ach2: true });
};
