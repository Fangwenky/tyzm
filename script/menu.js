// 兼容canvas页面的MockGame（如未定义则提供默认实现）
if (!window.MockGame) {
  window.MockGame = {
    getCurrentGameState() {
      return {
        progress: Math.floor(Math.random() * 100),
        gold: Math.floor(300 + Math.random() * 700),
        scene: '庄园大厅'
      };
    },
    applyLoadedState(state) {
      console.log('已加载的游戏状态：', state);
      if (window.toast) toast('已应用存档到游戏（Console 可查看）');
    }
  };
}

// —— 菜单按钮/遮罩/控件 ——
//（容错：元素可能不存在时不绑定事件）
const gearBtn = document.getElementById('btn-gear');
const menuOverlay = document.getElementById('ingame-menu');
const btnSaveNow = document.getElementById('btn-save-now');
const btnCloseMenu = document.getElementById('btn-close-menu');
const btnBackMain = document.getElementById('btn-back-main');

gearBtn && gearBtn.addEventListener('click', () => menuOverlay?.classList.remove('hidden'));
btnCloseMenu && btnCloseMenu.addEventListener('click', () => menuOverlay?.classList.add('hidden'));

// 保存游戏：使用 SaveManager.captureNew，把成就状态与游戏状态一起存档
btnSaveNow && btnSaveNow.addEventListener('click', () => {
  if (!window.SaveManager) {
    alert('存档功能未加载，无法保存！');
    menuOverlay?.classList.add('hidden');
    return;
  }

  // 统一生成存档标题
  const title = `存档 ${new Date().toLocaleString()}`;

  try {
    // 只用 captureNew 自动抓取 player 位置
    window.SaveManager.captureNew({
  title,
extra: {
    // 已有的背包等
    inventory: window.inventory?.exportState?.(),
    // ✅ 新增：剧情系统状态
    plot: window.plot?.exportState?.(),
    // 你还可以在这里放 worldFlags 等其它自定义运行态
     // ✅ 新增：一次性标记（随存档走，就不会刷新后能重复拾取）
  worldFlags: window.worldFlags || {}
  }
});

    if (window.toast) window.toast('✅ 已保存');
    else alert('✅ 已保存');
  } catch (e) {
    console.error(e);
    alert('保存失败：' + (e?.message || e));
  }

  menuOverlay?.classList.add('hidden');
});

btnBackMain && btnBackMain.addEventListener('click', () => {
  window.location.href = "./main.html";
});


