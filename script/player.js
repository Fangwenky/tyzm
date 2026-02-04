// script/player.js
/* === 门与钥匙配置（可修改） ===
   DOORS: 列出需要钥匙才能通过的格子（基于地图 id 与坐标）
*/
const DOORS = {
  
  room2: [ { x: 17, y: 15 },{ x: 18, y: 15 }  ]  // 示例：room2 门在 (8,16)
};

// 识别为钥匙的物品 id 列表（按需修改）
const KEY_IDS = ['lab_key', 'key', 'silver_key'];

function isDoorCoord(mapId, x, y) {
  const arr = DOORS[mapId] || [];
  return arr.some(p => p.x === x && p.y === y);
}


function playerHasKey() {
  const inv = window.inventory && window.inventory.items;
  if (!inv) return false;
  for (const id of KEY_IDS) {
    if (inv[id] && inv[id].count > 0) return true;
  }
  return false;
}

(function () {
  'use strict';
  window.Game = window.Game || {};
  const Game = window.Game;

  // ====== 画布 ======
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  // ====== 地图与尺寸 ======
  const maps = {
    room1: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],
      [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
      [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1],
      [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,1],
      [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
      [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
      [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
      [1,1,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
      [1,1,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    room2: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
      [0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
      [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
      [1,1,1,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
      [1,1,1,0,0,1,0,0,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1],
      [1,1,1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,1,1,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,1,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,1,1,1,1,1,1,1],
      [1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
  };
// ===== 改进版 open/close popup（替换原有 window.openPopup / window.closePopup） =====
(function(){
  // 确保全局 Game 存在
  window.Game = window.Game || {};

  const canvasEl = document.getElementById('gameCanvas');

  window.openPopup = function() {
    overlay.style.display = 'block';
    popup.style.display = 'block';
    // 给 iframe 补上 ?origin=...，便于子页校验父页来源
try {
  const ifr = document.querySelector('#popup iframe');
  if (ifr) {
    const base = ifr.getAttribute('data-src-base') || ifr.getAttribute('src') || './minigame/minigame/minigame.html';
    ifr.setAttribute('data-src-base', base);
    const url = new URL(base, location.href);
    url.searchParams.set('origin', location.origin);
    ifr.src = url.toString();
  }
} catch (e) { console.warn('设置 minigame origin 失败：', e); }

    // 标记弹窗开启（其他输入处理可检测此标志）
    window.Game.popupOpen = true;

    // 把主画布去焦点（防止误触发），并把焦点放到 popup（iframe 内）
    try { 
      if (canvasEl) canvasEl.blur();
      // 但主动把父窗口的焦点移走，避免键盘事件到主页面
      window.focus();
    } catch(e){}
  };

  window.closePopup = function() {
    overlay.style.display = 'none';
    popup.style.display = 'none';
    window.Game.popupOpen = false;

    // 关闭后主动把焦点返回到 canvas（稍延迟以保证 iframe 已被隐藏）
    try {
      window.focus();
      setTimeout(() => {
        if (canvasEl) canvasEl.focus();
      }, 50);
    } catch(e){}
  };

  // 为了避免 overlay 不慎挡住点击（保守做法）
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) window.closePopup();
  });

  // 防止 closeBtn 的事件冒泡到别处
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.closePopup();
    });
  }
})();
// —— 钢琴家：从钢琴页返回触发成就（仅改判定逻辑） —— //
(function(){
  let done = false;

  function isFromPiano() {
    // 兼容两种写法：?from=piano 或 ?from/piano
    // 只在“查询串”里判断，不改你的其他解析/读档代码
    return /\bfrom(?:=|\/)piano\b/i.test(location.search || '');
  }

  function runOnce(tag = '') {
    if (done) return;
    try {
      const hit = isFromPiano();
      // 可留，也可删：调试看命中情况
      console.log('[piano-ach]', { tag, search: location.search, hit });

      if (hit) {
        // 点亮成就
        window.achievementManager?.checkAchievements?.({ ach4: true });

        // 清一次查询串，避免刷新重复触发
        setTimeout(() => {
          const url = new URL(location.href);
          url.search = '';
          history.replaceState(null, '', url.toString());
        }, 200);

        done = true;
      }
    } catch (e) {
      console.warn('[piano-ach] error:', e);
    }
  }

  // 立刻判一次 + 常见时序兜底（不改你其余事件流）
  runOnce('immediate');
  window.addEventListener('save:applied', () => runOnce('save:applied'), { once: true });
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => runOnce('dom'), 0), { once: true });
  window.addEventListener('load', () => runOnce('load'), { once: true });
})();




// 1) 如果还没设置 currentMapId，就从本地记录里兜底
const lastMap =
  localStorage.getItem('save_current_map') ||
  sessionStorage.getItem('last_loaded_map'); // 没有这个键可以不管
if (!Game.currentMapId) {
  Game.currentMapId = lastMap || 'room1';
}

// 2) 拿到地图；如果拿不到，兜底 room1，并打日志方便排查
let map = maps[Game.currentMapId];
if (!map) {
  console.warn('[player] unknown map id:', Game.currentMapId, '→ fallback room1');
  Game.currentMapId = 'room1';
  map = maps['room1'];
}

const tileSize = 25;
const rows = map.length;
const cols = map[0].length;
function drawBrownForTwos(ctx) {
  if (typeof map === 'undefined') return;
  const rows = map.length;
  const cols = map[0].length;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (map[y][x] === 2) {
        const px = x * tileSize;
        const py = y * tileSize;
        // 棕色矩形（门体）
        ctx.fillStyle = 'rgba(66, 32, 7, 0.95)';
        ctx.fillRect(px, py, tileSize, tileSize*1.5);

        // 黑色竖线（门缝）
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        const seamW = Math.max(2, Math.floor(tileSize * 0.12));
        ctx.fillRect(
          px + Math.floor(tileSize * 0.82),
          py + Math.floor(tileSize * 0.12),
          seamW,
          Math.floor(tileSize * 0.76)
        );
      }
      if (map[y][x] === 3) {
        const px = x * tileSize;
        const py = y * tileSize;
        // 棕色矩形（门体）
        ctx.fillStyle = 'rgba(66, 32, 7, 0.95)';
        ctx.fillRect(px, py, tileSize*1.5, tileSize*0.2);

        // 黑色竖线（门缝）
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        const seamW = Math.max(2, Math.floor(tileSize * 0.12));
        ctx.fillRect(
          px + Math.floor(tileSize * 0.82),
          py + Math.floor(tileSize * 0.12),
          seamW,
          Math.floor(tileSize * 0.76)
        );
      }
    }
  }
}
  canvas.width = cols * tileSize;
  canvas.height = rows * tileSize;

  // ====== 自适应显示尺寸（CSS 缩放）======
  let scaleRatio = 1;
  function resizeCanvas() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scaleX = windowWidth / canvas.width;
    const scaleY = windowHeight / canvas.height;
    scaleRatio = Math.min(scaleX, scaleY);
    canvas.style.width = `${canvas.width * scaleRatio}px`;
    canvas.style.height = `${canvas.height * scaleRatio}px`;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // ====== Player 类 ======
  class Player {
  constructor(x, y) {
    this.gridX = x;
    this.gridY = y;
    this.renderX = x * tileSize;
    this.renderY = y * tileSize;

    // 每秒像素速度（原来是每帧 +2px）
    this.speed = 150;

    this.sprite = "assets/imgs/奥菲.png";
    this.img = new Image();
    this.imgLoaded = false;
    this.img.onload = () => { this.imgLoaded = true; };
    this.img.src = this.sprite;
  }

  setSprite(src) {
    if (this.sprite === src) return;
    this.sprite = src;
    this.imgLoaded = false;
    this.img.src = src;
  }

  move(dx, dy) {
    const newX = this.gridX + dx;
    const newY = this.gridY + dy;
    if (newX >= 0 && newY >= 0 && newX < cols && newY < rows && map[newY][newX] !== 1&& map[newY][newX] !== 2) {
      this.gridX = newX;
      this.gridY = newY;
    }
  }

  // ✅ 基于 dt（秒）推进，和刷新率解耦
  update(dt) {
    const targetX = this.gridX * tileSize;
    const targetY = this.gridY * tileSize;
    const maxStep = this.speed * dt;

    const dx = targetX - this.renderX;
    const dy = targetY - this.renderY;

    if (Math.abs(dx) <= maxStep) this.renderX = targetX;
    else this.renderX += Math.sign(dx) * maxStep;

    if (Math.abs(dy) <= maxStep) this.renderY = targetY;
    else this.renderY += Math.sign(dy) * maxStep;
  }

  isIdle() {
    return this.renderX === this.gridX * tileSize && this.renderY === this.gridY * tileSize;
  }

  draw(ctx) {
    if (this.imgLoaded) {
      ctx.drawImage(this.img, this.renderX, this.renderY, tileSize * 1.5, tileSize * 1.5);
    }
  }
}

  const player = new Player(26, 15);
 // ====== 【存档对接】将 player 实例挂到全局，便于 SaveManager 访问和操作角色位置 ======
  window.player = player; // 供 SaveManager 直接访问
  Game.player = player;   // 兼容 Game.player 方式
// === 优先自动读档：凡是带 ?from=xxx 且 xxx !== 'main'，都先尝试读自动存档 ===
(function installEntrySaveLoader(){
  if (window.__SAVE_APPLIED_ONCE) return;

  // 同步渲染与交互提示的小工具
  function syncRenderAndHint() {
    if (window.player) {
      if ('renderX' in player) player.renderX = player.gridX * 25;
      if ('renderY' in player) player.renderY = player.gridY * 25;
    }
    if (window.Game?.checkInteraction) Game.checkInteraction(player);
  }

  function entryLoadOnce(){
    if (window.__SAVE_APPLIED_ONCE) return;
    const params = new URLSearchParams(location.search);
    const from = params.get('from'); // 'main' | 'piano' | 其它 | null
    const isNewGame = sessionStorage.getItem('startNewGame') === '1';

    // ✅ 新游戏：强制 room1 出生，不读任何存档
    if (isNewGame) {
      window.Game = window.Game || {};
      const targetRoom = 'room1';
      window.Game.currentMapId = targetRoom;

      // 优先用 switchMap，保证地图与贴图、矩阵都刷新；并且出生点落位
      if (typeof Game.switchMap === 'function') {
        Game.switchMap(targetRoom, { keepPosition: false }); // 不保留旧位置
      } else {
        // 没有 switchMap 的兜底：直接按 room1.startPos 定位
        const cfg = (window.MapConfigs && window.MapConfigs[targetRoom]) || {};
        const pos = cfg.startPos || { x: 0, y: 0 };
        player.gridX = pos.x; player.gridY = pos.y;
      }

      syncRenderAndHint();
      window.__SAVE_APPLIED_ONCE = true;
      console.log('🆕 新游戏：固定出生 room1 ->', {
        roomId: window.Game?.currentMapId,
        x: player.gridX, y: player.gridY
      });
      return;
    }

    // —— 非新游戏时的其它入口逻辑（如：非主页优先自动存档；主页用 lastLoaded）
    // 你若已按我之前的版本写了 AUTO_SAVE_ID / lastLoadedSaveId 的加载，这里保持不变即可
    // 关键是“新游戏分支”在最前面直接 return，确保不会被覆盖
  }

  entryLoadOnce();
})();



// ==== 入口：只加载一次的保护 ====
if (!window.__SAVE_APPLIED_ONCE) {
  try {
    const params = new URLSearchParams(location.search);
    const from = params.get('from');             // 'main' / 'piano' / 其它 / null
    const isNewGame = sessionStorage.getItem('startNewGame') === '1';

    // 1) 非主页来源 → 优先自动存档
    if (!isNewGame && from !== 'main') {
      const autoId = localStorage.getItem('AUTO_SAVE_ID');   // 由 game.js 自动保存维护:contentReference[oaicite:1]{index=1}
      if (autoId && window.SaveManager?.loadToRuntime) {
        const rec = SaveManager.loadToRuntime(autoId);
        if (rec) {
          window.__SAVE_APPLIED_ONCE = true;                 // ✅ 只加载一次
          // 同步渲染坐标，立即对齐画面
          if (window.player) {
            if ('renderX' in player) player.renderX = player.gridX * 25;
            if ('renderY' in player) player.renderY = player.gridY * 25;
          }
          // 让交互提示立即可用
          if (window.Game?.checkInteraction) Game.checkInteraction(player);
        }
      }
    }

    // 2) 主页来源（from=main）→ 才使用 lastLoadedSaveId
    if (!window.__SAVE_APPLIED_ONCE && !isNewGame && from === 'main') {
      const lastId = localStorage.getItem('lastLoadedSaveId');  // main.js 写入:contentReference[oaicite:2]{index=2}
      if (lastId && window.SaveManager?.loadToRuntime) {
        const rec = SaveManager.loadToRuntime(lastId);
        if (rec) {
          window.__SAVE_APPLIED_ONCE = true;                 // ✅ 只加载一次
          if (window.player) {
            if ('renderX' in player) player.renderX = player.gridX * 25;
            if ('renderY' in player) player.renderY = player.gridY * 25;
          }
          if (window.Game?.checkInteraction) Game.checkInteraction(player);
        }
      }
    }

    // （可选）3) 来自钢琴页的兜底：仍然走自动存档或放回钢琴交互范围（你已有逻辑，可保留）
    // handleReturnFromPiano() ... 仍可保留你原来的实现:contentReference[oaicite:3]{index=3}
  } catch (e) {
    console.warn('入口读档失败：', e);
  }
}

  // ====== 输入（长按连发）======
  const pressedKeys = { w: false, s: false, a: false, d: false };

// 固定“每步用时”（秒），不随刷新率变化
const STEP_TIME = 0.18;  // 原来 180ms
let stepCooldown = 0;

document.addEventListener("keydown", (e) => {
  if (window.Game && window.Game.popupOpen) return; // 如果弹窗打开，忽略按键
  const k = e.key.toLowerCase();
  if (["w","a","s","d"].includes(k)) {
    e.preventDefault();
    pressedKeys[k] = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (window.Game && window.Game.popupOpen) return;
  const k = e.key.toLowerCase();
  if (["w","a","s","d"].includes(k)) {
    pressedKeys[k] = false;
  }
});


// 每一帧决定是否迈出“下一格”
function tryStep() {
  // 正在补间动画时，不发起新格子移动，避免卡顿/抖动
  if (!player.isIdle()) return;
  if (stepCooldown > 0) return;

  let dx = 0, dy = 0;

  // 给出优先级，避免斜向同时触发（你也可以改成允许斜走）
  if (pressedKeys.w) dy = -1;
  else if (pressedKeys.s) dy = 1;
  else if (pressedKeys.a) dx = -1;
  else if (pressedKeys.d) dx = 1;

  if (dx !== 0 || dy !== 0) {
  // 计算目标格
  const newX = player.gridX + dx;
  const newY = player.gridY + dy;

  // 边界保护
  if (!(newX >= 0 && newY >= 0 && newX < cols && newY < rows)) {
    return;
  }

  // 当前地图 id（fallback room1）
  const currentMapId = (window.Game && window.Game.currentMapId) || 'room1';

  // 如果目标格是我们定义的门，并且该格现在为 1（封闭墙体），则检查钥匙
  if (isDoorCoord(currentMapId, newX, newY) && map[newY][newX] === 2) {
    if (!playerHasKey()) {
      try { window.achievementManager?.showCenterText?.('门被锁住了，需要钥匙'); } catch (e) {}
      return;
    } else {
      map[newY][newX] = 3;
      if (maps[currentMapId]) maps[currentMapId][newY][newX] = 3;
      try { window.achievementManager?.showCenterText?.('使用钥匙打开了门'); } catch (e) {}
    }
  }

  // 若不是门，或门已开，就按原逻辑移动
  player.move(dx, dy);
  if (Game.checkInteraction) Game.checkInteraction(player);
  stepCooldown = STEP_TIME; // 进入冷却
}
}

  // ====== 资源加载 ======
  const roomImage = new Image();
  const roomImages = {
  room1: 'assets/imgs/房间.png',
  room2: 'assets/imgs/room2.png',
  room3: 'assets/imgs/room3.png'
};
function setRoomImageByMapId(id) {
  roomImage.src = roomImages[id] || roomImages.room1;
}
setRoomImageByMapId((window.Game && window.Game.currentMapId) || "room1");

  let imagesLoaded = 0;
  function onImg() {
    imagesLoaded++;
    if (imagesLoaded === 1) startGame();
  }
  roomImage.onload = onImg;
window.addEventListener('mapchange', () => {
  const id = (window.Game && window.Game.currentMapId) || "room1";
  // 更新矩阵引用与背景
  if (maps[id]) map = maps[id];
  setRoomImageByMapId(id);

  // 若你的渲染层需要刷新缓冲/重绘，这里可以触发一次清屏或重算相机
  // 例如：ctx.clearRect(0,0,canvas.width,canvas.height);
});
  // ====== 主循环 ======
  function startGame() {
  document.addEventListener("click", () => {
  if (window.Game && window.Game.popupOpen) return; // 有弹窗时不要触发这些
  Game.player.setSprite("assets/imgs/奥菲.png");
  if (Game.closeDialog) Game.closeDialog();
});

  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

let lastTime = 0;
function gameLoop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05); // 上限防止切窗卡顿后猛跳
  lastTime = now;

  // 输入：基于 dt 的步进冷却
  if (stepCooldown > 0) stepCooldown -= dt;
  tryStep();

  // 更新
  player.update(dt);

  // 渲染
 ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.drawImage(roomImage, 0, 0, canvas.width, canvas.height);

player.draw(ctx);
drawBrownForTwos(ctx);
  requestAnimationFrame(gameLoop);
}
})();
