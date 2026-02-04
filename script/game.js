

const btnShowImage = document.getElementById("btn-open-money");
const imageOverlay = document.getElementById("image-overlay");
const btnCloseImage = document.getElementById("btn-close-image");

btnShowImage.addEventListener("click", () => {
  imageOverlay.classList.remove("hidden");
});

btnCloseImage.addEventListener("click", () => {
  imageOverlay.classList.add("hidden");
});
document.addEventListener('DOMContentLoaded', () => {
  
const plotBtn = document.getElementById('btn-open-plot');
  if (plotBtn) plotBtn.classList.add('hidden');  
  // —— 工具：根据是否拥有 note_book 决定剧情按钮是否可见 —— //
window.updatePlotBtnVisibility = function () {
  const btn = document.getElementById('btn-open-plot');
  if (!btn) return;
  const inv = window.inventory?.items || {};
  const hasNote = !!(inv['note_book'] && inv['note_book'].count > 0);
  btn.classList.toggle('hidden', !hasNote);
};
// 仍然保留剧情按钮监听
document.addEventListener('inventory:changed', () => window.updatePlotBtnVisibility?.());

// ✅ 仅在未被读档逻辑设置过的情况下，推断一次初始房间
window.Game = window.Game || {};

(function initCurrentMapIdSafely(){
  // 如果 _applyToRuntime 或其他地方已经设置了，就不要覆盖
  if (window.Game.currentMapId) return;

  // 1) 优先从最近一次相关的存档中推断（AUTO_SAVE / lastLoaded）
  function inferFromSaves() {
    try {
      const ids = [
        localStorage.getItem('AUTO_SAVE_ID'),      // 自动存档指针（game.js 维护）:contentReference[oaicite:1]{index=1}
        localStorage.getItem('lastLoadedSaveId')   // 手动加载过的槽位（main.js 写入）:contentReference[oaicite:2]{index=2}
      ].filter(Boolean);

      for (const id of ids) {
        const rec = window.SaveManager?.get?.(id);
        const d = rec?.data;
        if (!d) continue;
        const rid =
          d?.game?.roomId ||     // 新结构（我们推荐/已改造的）
          d?.roomId ||           // 旧的自动存档附加字段
          d?.player?.roomId;     // 极端旧版本
        if (rid) return rid;
      }
    } catch (e) { console.warn('inferFromSaves() 失败：', e); }
    return null;
  }

  // 2) 退化：从 switchMap 持久化的键里取（切图时有落盘）
  //    在 p.js 的 switchMap 里会写入 save_current_map:contentReference[oaicite:3]{index=3}
  function inferFromLocalFlag() {
    try { return localStorage.getItem('save_current_map') || null; }
    catch { return null; }
  }

  // 3) 决策：有就用；都没有再默认 room1
  const guess =
    inferFromSaves() ||
    inferFromLocalFlag() ||
    'room1';

  window.Game.currentMapId = guess;
})();


// 初始化后调用一次（读档/导入背包后能立刻生效）
window.updatePlotBtnVisibility();

// 监听“背包变化”事件（第 3 步会在 add/remove 后派发）
document.addEventListener('inventory:changed', () => window.updatePlotBtnVisibility());

  if (sessionStorage.getItem('startNewGame') === '1') {
    sessionStorage.removeItem('startNewGame');
    

    // 1) 成就（若你要保留 ach1，可在这里手动置回 true）
    if (!window.achievementManager) window.achievementManager = new AchievementManager();

    window.achievementManager.updateView?.();

    // 2) 初始坐标（按需修改）
const cfg = window.MapConfigs[Game.currentMapId] || {};
const pos = cfg.startPos || { x: 0, y: 0 };
if (window.player) {
  window.player.gridX = pos.x;
  window.player.gridY = pos.y;
  if ('renderX' in window.player) window.player.renderX = pos.x * 25;
  if ('renderY' in window.player) window.player.renderY = pos.y * 25;
}


    // ❌ 不再这里创建存档，不设置 lastLoadedSaveId
    // 让玩家真正点击“保存游戏”时，才在 menu.js 里创建一个新存档（你已有）
    return;
  }

    // —— 从 sessionStorage 读取剧情完成标记，并应用 —— //
  const pc = sessionStorage.getItem('plotComplete');
  if (pc && window.plot && typeof window.plot.markCompleted === 'function') {
    try {
      const { chId, unlockNext } = JSON.parse(pc);
      if (chId) {
        window.plot.markCompleted(chId, { unlockNext: !!unlockNext });
           // ✅ 日记推演成就
      window.achievementManager?.checkAchievements?.({ ach5: true }); 
      }
    } catch (e) {
      console.warn('解析剧情完成标记失败：', e);
    }
    // 用过即删，避免重复触发
    sessionStorage.removeItem('plotComplete');
  }
  
});
// === 全局自动保存（单槽循环覆盖） ===
(() => {
  
  const AUTO_SAVE_PREFIX = '自动保存';
  let lastAutoSaveAt = 0;

  // 收集当前运行态，按需加字段（背包/剧情/角色位置/成就等）
  function buildExtra() {
    const extra = {};
    try {
      if (window.inventory?.exportState) {
        extra.inventory = window.inventory.exportState();
      }
      if (window.plot?.exportState) {
        extra.plot = window.plot.exportState();
      }
      if (window.achievementManager?.exportState) {
        // 如果你的成就管理器有导出方法就带上
        extra.achievements = window.achievementManager.exportState();
      }
      if (window.player) {
        extra.player = { gridX: window.player.gridX, gridY: window.player.gridY };
      }
      extra.roomId = window.Game?.currentMapId || "room1";
      extra.worldFlags = window.worldFlags || {};
            if (window.guideManager?.exportState) {
        extra.guide = window.guideManager.exportState();
      }

      // 你还有其它需要随存档保存的运行态，也可以在这里追加
    } catch (e) {
      console.warn('buildExtra() 采集运行态失败：', e);
    }
    return extra;
  }

  // 真正执行一次自动保存（幂等 + 轻量）
  // 供自动保存使用的“自动存档槽位指针”键
const AUTO_SAVE_ID_KEY = 'AUTO_SAVE_ID';

/**
 * 自动保存（指针失效则自动新建并回写指针）
 * @param {string} reason 触发原因（日志用）
 */
function doAutoSave(reason = '自动') {
  try {
    // ===== 1) 采集运行态（你原有的收集函数，如果没有就换成自己的）=====
    const extra = (typeof buildExtra === 'function') ? buildExtra() : {};
    const title = `自动保存 - ${new Date().toLocaleString()}`;

    // ===== 2) 读取并校验“自动存档槽位指针”=====
    let id = null;
    try { id = localStorage.getItem(AUTO_SAVE_ID_KEY) || null; } catch(e){}

    let valid = false;
    if (id && typeof window.SaveManager?.get === 'function') {
      valid = !!SaveManager.get(id);    // 指向的这条存档还在吗？
    }

    // ===== 3) 覆盖 or 新建 =====
    if (valid) {
      // 有效：优先用 overwriteFromRuntime，没有就退化为 update
      if (typeof SaveManager.overwriteFromRuntime === 'function') {
        SaveManager.overwriteFromRuntime(id, { extra, title });
      } else if (typeof SaveManager.update === 'function') {
        const old = SaveManager.get(id);
        if (old) {
          SaveManager.update(id, { title, data: { ...old.data, ...extra } });
        } else {
          // 理论上走不到这，但兜底一下
          const rec = (typeof SaveManager.captureNew === 'function')
            ? SaveManager.captureNew({ title, extra })
            : SaveManager.create({ title, data: extra });
          if (rec && rec.id) localStorage.setItem(AUTO_SAVE_ID_KEY, rec.id);
        }
      }
    } else {
      // 无效：大概率刚清空过 ————> 直接新建再写回指针
      const rec = (typeof SaveManager.captureNew === 'function')
        ? SaveManager.captureNew({ title, extra })
        : SaveManager.create({ title, data: extra });
      if (rec && rec.id) localStorage.setItem(AUTO_SAVE_ID_KEY, rec.id);
    }

    // （可选）如果你用了 file:// 桥接，这里也可补：setFileBridge?.(extra, title);

    console.log(`[AUTO-SAVE] ${reason} ✓`);
  } catch (e) {
    console.error('[AUTO-SAVE] 失败：', e);
  }
}


  // 暴露一个显式调用的入口（比如代码里跳剧情前也可以手动调用）
  window.autoSaveNow = (reason) => doAutoSave(reason);

  // A) 捕获所有 <a href> 点击（含父元素代理）
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a) return;
    // 不阻塞跳转；保存是同步 localStorage 操作
    doAutoSave(`跳转:${a.getAttribute('href') || ''}`);
  }, true); // 捕获阶段尽早触发

  // B) beforeunload：离开页面
window.addEventListener('beforeunload', () => {
  doAutoSave('离开页面');
});

// C) visibilitychange：标签页转入后台/隐藏（file:// 下更稳）
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    doAutoSave('页面隐藏');
  }
});

// D) pagehide：历史导航/内核特殊场景（再兜底）
window.addEventListener('pagehide', () => {
  doAutoSave('pagehide');
});

})();
 