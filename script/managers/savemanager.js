/** SaveManager: localStorage 持久化 */
class SaveManager {
  static KEY = 'game_saves_v1';
  // 读取单条存档（没有则返回 null）
static get(id){
  const list = SaveManager.all();
  return list.find(s => s.id === id) || null;
}

  static all() {
    try {
      const raw = localStorage.getItem(SaveManager.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e){ console.warn(e); return []; }
  }
  static _commit(list){
    try { localStorage.setItem(SaveManager.KEY, JSON.stringify(list)); return true; }
    catch(e){ console.error(e); return false; }
  }
  static create({ title, data }){
    const now = Date.now();
    const id = 'S' + now.toString(36) + Math.random().toString(36).slice(2,7);
    const item = { id, title, data, createdAt: now, updatedAt: now };
    const list = SaveManager.all(); list.unshift(item);
    SaveManager._commit(list); return item;
  }
  static update(id, { title, data }){
    const list = SaveManager.all();
    const i = list.findIndex(s=>s.id===id); if(i<0) return null;
    const now = Date.now();
    list[i] = { ...list[i], title: title ?? list[i].title, data: data ?? list[i].data, updatedAt: now };
    SaveManager._commit(list); return list[i];
  }
  static remove(id){ SaveManager._commit(SaveManager.all().filter(s=>s.id!==id)); }
  static clearAll(){ SaveManager._commit([]); 
     // 🧹 清除“自动保存”正在使用的槽位指针
  try { localStorage.removeItem('AUTO_SAVE_ID'); } catch(e){}
  }
  static get(id){ return SaveManager.all().find(s=>s.id===id) || null; }
  // === 新增：从当前运行态抓取需要的游戏数据（可按需扩展）===
// 只采集游戏态（坐标等），不再保存成就
// === 新增：把剧情 & 背包都打包进存档 ===
static _captureRuntimeData(extra = {}) {
  // 位置、房间（你已有）
  let game = null;
  const player = window.player || (window.Game && window.Game.player);
  if (player && typeof player.gridX === 'number' && typeof player.gridY === 'number') {
    game = { x: player.gridX, y: player.gridY, roomId: window.Game?.currentMapId || "room1" };
  }

  // ✅ 剧情（你已加）
  const pm   = window.Game?.plotManager || window.PlotManager || window.plot;
  const plot = pm?.exportState?.() || null;

  // ✅ 背包 —— 关键：如果你有 exportState 就用；没有就换 getState()
  const inventory =
    window.inventory?.exportState?.() ??
    window.inventory?.getState?.() ??
    null;

  return {
    version: 1,
    game,
    plot,          // 保留
    inventory,     // ★ 新增：背包
    ...extra,
  };
}


// === 新增：把存档数据应用回运行态（只做存在的数据）===
// savemanager.js 里
// savemanager.js
static _applyToRuntime(data = {}, title = "未知存档") {
  // ===== 入口选择：根据 ?from=xxx 决定是否强制走自动存档 =====
  try {
    const isGamePage = location.pathname.endsWith('game.html');
    if (isGamePage) {
      const params = new URLSearchParams(location.search);
      const from = params.get('from'); // main / piano / plot / null ...
      // 非 main 来源（含未带 from）=> 优先用自动存档覆盖本次应用
      if (from !== 'main' && !sessionStorage.getItem('__appliedFromAutoOnce')) {
        const autoId = localStorage.getItem('AUTO_SAVE_ID');  // game.js 维护的指针:contentReference[oaicite:1]{index=1}
        const autoRec = autoId && SaveManager.get(autoId);
        if (autoRec && autoRec.data) {
          // 防递归：只重入一次
          sessionStorage.setItem('__appliedFromAutoOnce', '1');
          return SaveManager._applyToRuntime(autoRec.data, autoRec.title || '自动保存');
        }
      }
    }
  } catch (e) { console.warn('来源分流失败:', e); }

  // ===== 兼容提取：支持 data.game.{x,y,roomId} / data.player.{gridX,gridY} / data.roomId =====
  let roomId, px, py;
  if (data.game) {
    roomId = data.game.roomId ?? roomId;
    if (typeof data.game.x === 'number') px = data.game.x;
    if (typeof data.game.y === 'number') py = data.game.y;
  }
  if (data.player) {
    if (typeof data.player.gridX === 'number' && px === undefined) px = data.player.gridX;
    if (typeof data.player.gridY === 'number' && py === undefined) py = data.player.gridY;
    if (typeof data.player.x === 'number' && px === undefined) px = data.player.x;
    if (typeof data.player.y === 'number' && py === undefined) py = data.player.y;
  }
  if (data.roomId && roomId === undefined) roomId = data.roomId;

  // ===== 切图（仅在 game 页面），保持坐标不被出生点覆盖 =====
  try {
    const isGamePage = location.pathname.endsWith('game.html');
    if (roomId && isGamePage) {
      window.Game = window.Game || {};
      window.Game.currentMapId = roomId;
      if (typeof Game.switchMap === 'function') {
        Game.switchMap(roomId, { keepPosition: true }); // p.js 会触发 mapchange 渲染:contentReference[oaicite:2]{index=2}
      }
    }
  } catch (e) { console.warn('切换地图失败:', e); }

  // ===== 坐标恢复 =====
  try {
    const player = window.player || (window.Game && window.Game.player);
    if (player && typeof px === 'number' && typeof py === 'number') {
      player.gridX = px; player.gridY = py;
      if ('renderX' in player) player.renderX = px * (window.tileSize || 25);
      if ('renderY' in player) player.renderY = py * (window.tileSize || 25);
    }
  } catch (e) { console.warn('坐标恢复失败:', e); }

  // ===== 其余：背包 / worldFlags / 剧情（保留你原有实现）=====
  // ……前面保持不变（含：来源分流、坐标提取、切图）

// ===== 其余运行态：背包 / 剧情 / 世界旗标 =====
try {
  // 1) 背包
  if (data.inventory && window.inventory?.importState) {
    window.inventory.importState(data.inventory);
  }

  // 2) 剧情（优先同一个实例）
  const pm = window.Game?.plotManager || window.PlotManager || window.plot;
  if (data.plot && pm?.importState) {
    pm.importState(data.plot);
  }

  // 3) 世界旗标（如果你有）
  if (data.worldFlags) {
    window.worldFlags = { ...(window.worldFlags || {}), ...data.worldFlags };
  }
} catch (e) {
  console.warn('应用运行态失败:', e);
}

// ===== 通知外部：存档已应用完成（给战斗回城监听用）
queueMicrotask(() => {
  try { window.dispatchEvent(new CustomEvent('save:applied', { detail: { title, data } })); } catch {}
});

  // ===== 调试输出（含存档标题）=====
  try {
    console.log('✅ 存档已应用:', {
      title,
      roomId: window.Game?.currentMapId,
      x: window.player?.gridX,
      y: window.player?.gridY
    });
  } catch {}
  // === 新增：通知“存档已应用完成” ===
  try {
    window.dispatchEvent(new CustomEvent('save:applied', { detail: { title } }));
  } catch (e) { /* 忽略 */ }
}




// === 便捷方法：创建新存档（从当前运行态抓取）===
static captureNew({ title = '新存档', extra = {} } = {}) {
  const data = SaveManager._captureRuntimeData(extra);
  return SaveManager.create({ title, data });
}

// === 便捷方法：覆盖已有存档（从当前运行态抓取）===
static overwriteFromRuntime(id, { extra = {} } = {}) {
  const data = SaveManager._captureRuntimeData(extra);
  return SaveManager.update(id, { data });
}

// === 便捷方法：加载指定存档并应用回运行态 ===
static loadToRuntime(id) {
  const rec = SaveManager.get(id);
  if (!rec) return null;
  SaveManager._applyToRuntime(rec.data || {});
  window.__SAVE_APPLIED_ONCE = true;  
  window.dispatchEvent(new CustomEvent('save:loaded', { detail: { id: rec.id, title: rec.title } }));
      // ✅ 任意路径读档成功后，打标记避免二次覆盖
  return rec;
}

}

function fmtTime(ts){
  const d=new Date(ts); const P=n=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${P(d.getMonth()+1)}-${P(d.getDate())} ${P(d.getHours())}:${P(d.getMinutes())}`;
}
function toast(msg){
  const el = document.getElementById('toast');
  if (!el) {
    // ✅ 兜底：页面没有 #toast 也不报错
    try { alert(msg); } catch(e) {}
    console.log('[toast]', msg);
    return;
  }
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add('hidden'), 1800);
}

window.SaveManager=SaveManager; window.fmtTime=fmtTime; window.toast=toast;