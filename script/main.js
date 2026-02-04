
// 关于我们按钮：直接跳转链接
const btnAbout = document.getElementById('btn-about');
btnAbout?.addEventListener('click', ()=> {
  window.location.href = './pages/about us/aboutus.html';
});
/* 将这两处换成你的真实游戏状态读/写逻辑 */
const MockGame = {
  getCurrentGameState(){
    return { progress: Math.floor(Math.random()*100), gold: Math.floor(300+Math.random()*700), scene: '庄园大厅' };
  },
  applyLoadedState(state){ console.log('已加载的游戏状态：', state); toast('已应用存档到游戏（Console 可查看）'); }
};

const scrMain = document.getElementById('screen-main');
const scrList = document.getElementById('screen-savelist');
const scrAch = document.getElementById('screen-achievement');
const btnToLoad = document.getElementById('btn-to-load');
const btnBackMain = document.getElementById('btn-back-main');
const btnBackMainAch = document.getElementById('btn-back-main-ach');
const btnNewSave = document.getElementById('btn-new-save');
const btnClearAll = document.getElementById('btn-clear-all');
const listEl = document.getElementById('save-list');
const btnNewGame = document.getElementById('btn-new-game');

const gearBtn = document.getElementById('btn-gear');
const menuOverlay = document.getElementById('ingame-menu');
const btnSaveNow = document.getElementById('btn-save-now');
const btnOpenList = document.getElementById('btn-open-savelist');
const btnCloseMenu = document.getElementById('btn-close-menu');
const btnAch = document.getElementById('btn-ach');
function goto(screen) {
  // 先移除所有界面的 active
  scrMain.classList.remove('active');
  scrList.classList.remove('active');
  scrAch.classList.remove('active');

  // 根据传入参数决定显示哪个
  if (screen === 'main') {
    scrMain.classList.add('active');
  } else if (screen === 'list') {
    scrList.classList.add('active');
  } else if (screen === 'achievement') {
    scrAch.classList.add('active');
  } else {
    console.warn('未知的 screen:', screen);
  }
}

// 按钮 → 切换到成就界面
btnNewGame?.addEventListener('click', () => {
  // 告诉游戏页：这次是“开新档”
  sessionStorage.setItem('startNewGame', '1');
  try { localStorage.removeItem('guide_state_v1'); } catch {}

  // ✅ 清理所有可能影响起始地图的指针 / 标记
  try {
    localStorage.removeItem('AUTO_SAVE_ID');      // 自动存档槽位指针
    localStorage.removeItem('lastLoadedSaveId');  // 上次手动加载槽位
    localStorage.removeItem('save_current_map');  // switchMap 持久化的当前地图
  } catch {}

  // （你原来就有的）
  try { localStorage.removeItem('world_flags_v1'); } catch {}
  window.worldFlags = {};

  // 跳转
  window.location.href = "./video.html?from=main";
});


btnAch?.addEventListener('click', () => {
  goto('achievement');
});
btnBackMainAch?.addEventListener('click', () => {
  goto('main');
});
btnToLoad.addEventListener('click', ()=>{ renderSaveList(); goto('list'); });
btnBackMain.addEventListener('click', ()=> goto('main'));



btnCloseMenu.addEventListener('click', ()=> menuOverlay.classList.add('hidden'));
btnOpenList?.addEventListener('click', ()=>{ menuOverlay.classList.add('hidden'); renderSaveList(); goto('list'); });

 function createSave(){

   const title = `存档 ${new Date().toLocaleString()}`;

  const item = SaveManager.captureNew({ title });
   renderSaveList(); toast('✅ 已保存');
   return item;
 }

btnNewSave.addEventListener('click', createSave);
btnSaveNow.addEventListener('click', ()=>{ createSave(); menuOverlay.classList.add('hidden'); });

btnClearAll.addEventListener('click', ()=>{
  if(!confirm('确定要清空全部存档吗？此操作不可恢复。')) return;
  SaveManager.clearAll(); renderSaveList(); toast('已清空');
});

function renderSaveList(){
  const list = SaveManager.all();
  if(list.length===0){ listEl.innerHTML = '<div class="save-item"><div class="save-meta"><div class="save-title">暂无存档</div><div class="save-sub">点击“新建存档”创建一个。</div></div></div>'; return; }
  listEl.innerHTML = list.map(item=>{
    const info = typeof item.data==='object' ? JSON.stringify(item.data) : String(item.data);
    return `
      <div class="save-item" data-id="${item.id}">
        <div class="save-meta">
          <div class="save-title">${item.title}</div>
          <div class="save-sub">创建：${fmtTime(item.createdAt)}　更新：${fmtTime(item.updatedAt)}</div>
          <div class="save-sub">摘要：<code>${info.length>64?info.slice(0,64)+'…':info}</code></div>
        </div>
        <div class="save-actions">
          <button class="btn ghost" data-act="load">加载</button>
          <button class="btn ghost" data-act="rename">重命名</button>
          <button class="btn danger" data-act="delete">删除</button>
        </div>
      </div>`;
  }).join('');

  listEl.querySelectorAll('.save-item').forEach(row=>{
    const id = row.getAttribute('data-id');
    row.querySelector('[data-act="load"]').addEventListener('click', ()=>{
     const rec = SaveManager.loadToRuntime(id);
   if(!rec){ toast('未找到该存档'); return; }
   // 如需把其它游戏状态也应用（位置/金币/关卡等），在这里处理：
   // MockGame.applyLoadedState?.(rec.data);
     // ✅ 把这次加载的存档 ID 存到 localStorage
  localStorage.setItem('lastLoadedSaveId', id);

  // 跳转到游戏页（路径按你实际的来，比如 game.html）
  window.location.href = './game.html?from=main';
    });
    row.querySelector('[data-act="rename"]').addEventListener('click', ()=>{
      const s = SaveManager.get(id); if(!s) return;
      const title = prompt('输入新的存档名：', s.title); if(!title) return;
      SaveManager.update(id, { title }); renderSaveList();
    });
    row.querySelector('[data-act="delete"]').addEventListener('click', ()=>{
      if(!confirm('确定删除该存档吗？')) return;
      SaveManager.remove(id); renderSaveList();
    });
  });
}
renderSaveList();
// main.js
document.addEventListener('DOMContentLoaded', () => {
  // 1) 确保有实例
  if (!window.achievementManager) {
    window.achievementManager = new AchievementManager();
  }
  // 2) 先刷新一下首页成就列表（如果此页展示的话）
  window.achievementManager.updateView?.();

  // 3) 打开首页时自动完成成就1（只在未完成时触发与弹窗）
  const state = window.achievementManager.exportState?.() || {};
  if (!state.ach1) {
    window.achievementManager.checkAchievements({ ach1: true });
  }
  // 如果你想“已完成也弹一次提示”，再放开下一行即可：
  // else { window.achievementManager.showPopup('噩梦的开始', '完成注册'); }
  //角色档案
  const btnProfile = document.getElementById('btn-profile');
if (btnProfile) {
  btnProfile.addEventListener('click', () => {
  window.location.href = './pages/Profile/profile.html';
});

}

});


