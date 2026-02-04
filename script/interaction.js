/**********************  回城判定（win/lose）—放在 interaction.js 顶部  **********************/

// 1) 具体逻辑：解析 URL，胜利则写入 battleDone/completed，并保存与刷新 UI
function handleBattleReturn() {
  const sp = new URLSearchParams(location.search);

  // 支持两种：?from=battle3&result=win  或  ?battle3=win
  let from = (sp.get('from') || '').toLowerCase();
  let result = (sp.get('result') || '').toLowerCase();
  let isWin  = result === 'win'  || sp.has('win');
  let isLose = result === 'lose' || sp.has('lose');

  if (!from) {
    for (const [k, v] of sp.entries()) {
      if (/^battle\d+$/i.test(k)) {
        from = k.toLowerCase();
        const vv = String(v).toLowerCase();
        isWin  = vv === 'win';
        isLose = vv === 'lose';
        break;
      }
    }
  }
  if (!from || (!isWin && !isLose)) return; // 没参数就不处理

  // battle → chapter 的映射（按你的章节实际补齐/修改）
  const map = {
    battle1: 'ch1',
    battle2: 'ch2',
    battle3: 'ch3',
    battle4: 'ch4',
    battle5: 'ch5',
    battle6: 'ch6',
    battle7: 'ch7',
    battle8: 'ch8',
    battle9: 'ch9',
    battle10: 'ch10',
    battle11: 'ch11',
    battle12: 'ch12',
    battle13: 'ch13',
    battle14: 'ch14',
    battle15: 'ch15',
    battle16: 'ch16',
    battle17: 'ch17',
  };
  const chId = map[from];
  if (!chId) return;

  const pm = window.Game?.plotManager || window.PlotManager;
  if (!pm) return;

  if (isWin) {
    // 胜利：标记本章战斗完成（内部会顺便 completed=true 并重算解锁；若你不想“胜利即通关”，把 setBattleDoneFor 里的 completed=true 去掉）
    const ok = pm.setBattleDoneFor?.(chId, true);
    console.log('[BattleReturn] 胜利：标记 battleDone，章节=', chId, '结果=', ok);

    // 保存一次，避免刷新丢失
    if (window.SaveManager?.saveAuto) window.SaveManager.saveAuto('[auto] battle win');
    else if (window.SaveManager?.saveNow) window.SaveManager.saveNow('[auto] battle win');
  //   // ✅ 首战告捷成就
  window.achievementManager?.checkAchievements?.({ ach6: true });

    // 刷新 UI（你项目里有哪个就调哪个）
    window.updatePlotBtnVisibility?.();
    window.renderChapterList?.();
  } else {
    console.log('[BattleReturn] 失败：不更改章节状态，battle=', from, 'chapter=', chId);
  }

  // 1s 后清理 URL，防止 F5 重复触发
  setTimeout(() => {
    const url = new URL(location.href);
    url.search = '';
    history.replaceState(null, '', url.toString());
  }, 1000);
}

// 2) 只运行一次的保护 & 触发时机：等“存档应用完成(save:applied)”后再执行，防止被读档覆盖
window.__BATTLE_RETURN_DONE__ = false;

function runBattleReturnOnce() {
  if (window.__BATTLE_RETURN_DONE__) return;
  window.__BATTLE_RETURN_DONE__ = true;
  try { handleBattleReturn(); } catch (e) { console.error(e); }
}

// a) 主要触发：SaveManager._applyToRuntime 结束后会派发 save:applied 事件（你已经加过）
window.addEventListener('save:applied', () => {
  runBattleReturnOnce();
}, { once: true });

// b) 兜底触发：如果本次没有读档，也在 DOM 就绪后跑一次
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => runBattleReturnOnce(), 0);
});
/**********************  回城判定 - 结束  **********************/

(function () {
  'use strict';
// === 返回战斗页后的解锁判定（win/lose） ===

  // 全局命名空间
  window.Game = window.Game || {};
  const Game = window.Game;
  


  // ==== (可选) 工具函数示例 ====
  Game.utils = Game.utils || {};
  Game.utils.clamp = function clamp(x, lo, hi) {
    return Math.min(hi, Math.max(lo, x));
  };
  Game.VERSION = '1.3.31';
  let currentPointType=null;

  // ==== 交互点 ====
  // 把交互点包进一个对象里
window.MapConfigs = window.MapConfigs || {};
window.MapConfigs["room1"] = {
  interactions : [
    { x: 3, y: 7,
      range: { width: 0, height: 3 }, messages: ["乱翻别人的柜子不太好吧...,不过放在这里的东西似乎很重要......纠结。", "没事翻就翻了，反正没人知道。",
        "一本'赵丰年'编著的《网页设计与制作》第五版。","封面好精美...内容也很有意思。","好像很有用，先收起来吧！"] ,reward: { id: 'web_book', name: '《网页设计与制作》第五版', count: 1, onceKey: 'pickup_book_12_10' }},
    { x: 14, y: 7, range: { width: 4, height: 0 }, messages: ["咳咳..壁炉里灰尘好多。", "但其中并没有我所期待的实验笔记。","这是..从未燃烧过的薪柴?",
      "烟道也是堵上的，看起来壁炉的主人并不希望真正使用它，但却希望别人认为它是真的，以忽视它的真正作用。",
      "这里一定还有其他秘密。",
      "......",
      "我就知道！",
      "这里.......通向哪里？"
    ],goto: { mapId: "room2",pos: { x: 8, y: 16}} },
    { x: 9, y: 14, range: { width: 4, height: 0 }, messages: ["看起来就很舒服的沙发...,不过上面红色的是什么？", "......口区。"] },
    { x: 22, y: 12, 
      type: "piano", range: { width: 3, height: 0 }, messages: ["上次弹钢琴...是什么时候？奇怪，为什么不记得了？"] },
    { x: 19, y: 14, messages: ["一个旧旧的纸团。"] },
    { x: 24, y: 7, range:{width:3,height:0},messages: ["有镜子？？照一下。", "被帅晕。"] },
    { x: 8, y: 7, range:{width:3,height:0},messages: ["一幅十字绣的牡丹花？", "好像回到了我奶奶家。"] }
  ],
  startPos: { x: 26, y: 15 }  // 出生点
};
window.MapConfigs["room2"] = {
  startPos: { x: 8, y: 16 },
  interactions: [ 
    { x: 17, y: 4, range: { width: 2, height: 2 }, messages: ["这个实验台..好熟悉？", "不只是这个实验台，整个房间给我的感觉都好熟悉..","可是明明只是第一次来而已啊？..难道说.."]},
    { x: 19, y: 14, range: { width: 2, height: 3 }, messages: ["好像是个地下室改造而成的实验室。", "看看这些器具...太可怕了。","看样子，我离真相越来越近了..."]},
    { x: 10, y: 4, range: { width: 3, height: 1 }, messages: ["这本实验笔记...果然！"] ,reward: { id: 'note_book', name: '破旧的实验笔记', count: 1, onceKey: 'pickup_note_7_2' }},
    { x: 8, y: 16, range: { width: 3, height: 1 }, messages: ["打开这个活板门，应该就能回到第一个房间。"], goto: { mapId: "room1", pos: { x: 14, y: 7 } }  },
   {
  x: 14, y: 14,
  range: { width: 2, height: 2 },
  type: "minigame",                           // ✅ 用类型标记，便于对白末尾给按钮
  messages: [
    "找到了！",
    "看来需要破译这个才能拿到钥匙吗...有点意思。我越来越期待了...",
    "要开始修机挑战吗？"                      // 结尾给选择
  ]
},
{
  x: 4, y: 13,
  range: { width: 2, height: 2 },
  messages: [
    "这里有几个箱子..找找看。",
    "没有一样有用的东西...他们会把钥匙放在哪里呢？"
  ]
},
{
  x: 4, y: 16,
  range: { width: 5, height: 1 },
  messages: [
    "杂物堆..看起来很久没人来过这里了。",
    "这些骷髅..是没能找到钥匙走出这里的人们吗？",
    "愿他们安息。"
  ]
},
  ]  // 出生点
};
  let canInteract = false;        // 到点后允许按 E 触发
  let pendingPoint = null;        // 记录当前踩到的交互点
  let hintEl = null;              // “按E交互”提示 DOM

  let currentDialogIndex = 0;
  let currentMessages = [];
  let isDialogActive = false;

  // —— 一次性事件全局标记（持久化到 localStorage）——
const WF_KEY = 'world_flags_v1';
function _loadWF(){
  try { return JSON.parse(localStorage.getItem(WF_KEY)) || {}; }
  catch { return {}; }
}
function _saveWF(){
  try { localStorage.setItem(WF_KEY, JSON.stringify(window.worldFlags)); } catch {}
}
window.worldFlags = window.worldFlags || _loadWF();

function hasOnce(k){ return !!window.worldFlags[k]; }
function setOnce(k){ window.worldFlags[k] = true; _saveWF(); }
// ==== 修机小游戏 → 父页回传接入（胜利发放钥匙；失败不发；仅一次）====
(function () {
  const ONCE_KEY = 'once_room2_minigame_reward';   // 发奖一次性标记
  const REWARD_ID   = 'lab_key';
  const REWARD_NAME = '一把古老的黄铜钥匙';

  window.addEventListener('message', (ev) => {
    const d = ev?.data || {};
    if (d.channel !== 'skillcheck:v1') return;      // 只处理修机小游戏的通道
    // 可选：若你想更安全，可校验来源：
    // if (ev.origin !== location.origin) return;

    if (d.status === 'win') {
      if (!hasOnce(ONCE_KEY)) {
        // 发奖（仅一次）
        // 发奖
window.inventory?.add?.('lab_key', '一把古老的黄铜钥匙', 1);

// ✅ 显式广播“已发奖”，让 GuideManager 无需依赖背包事件也能打勾
try {
  document.dispatchEvent(new CustomEvent('reward:granted', {
    detail: { id: 'lab_key', name: '一把古老的黄铜钥匙', from: 'minigame' }
  }));
} catch {}

        
        setOnce(ONCE_KEY);
        // 漂浮文字（可选）
        window.achievementManager?.showCenterText?.(`获得：${REWARD_NAME} ×1`);
      }
      // 自动存一下，避免刷新丢失
      (window.SaveManager?.saveAuto ?? window.SaveManager?.saveNow)?.('[auto] minigame win');
    } else {
      // 失败：不发奖；如需可记日志
      console.log('[minigame] lose：未发放奖励');
    }

    // 收尾：无论胜负都关弹窗，回到主画面
    window.closePopup?.();
  });
})();


function getInteractions() {
  const cfg = (window.MapConfigs && window.MapConfigs[Game.currentMapId]) || {};
  return cfg.interactions || [];
}


// 针对当前对话点执行奖励
function grantPointReward(point) {
  if (!point || !point.reward) return;
  const { id, name = id, count = 1, onceKey } = point.reward;

  if (onceKey && hasOnce(onceKey)) return; // 已拿过，不重复发
  // 如果背包里已经有该物品，也视为已领取（用于回填历史标记）
const invHas = !!(window.inventory?.items?.[id] && window.inventory.items[id].count > 0);
if (invHas) {
  if (onceKey) setOnce(onceKey); // 回填 once 标记，防止再次拾取
  try { document.dispatchEvent(new CustomEvent('reward:granted', { detail: { id, name, count: 0, source: 'already-had' } })); } catch {}
  return;
}


  // 真正发放
  window.inventory?.add?.(id, name, count);
  window.achievementManager?.showCenterText?.(`获得：${name} ×${count}`);

  try { document.dispatchEvent(new CustomEvent('reward:granted', { detail: { id, name, count, source: 'grant' } })); } catch {}
  if (onceKey) setOnce(onceKey);
}


  // ===================== 从就绪点正式开启对话 =====================
function beginDialogFromPoint(point) {
  if (!point) return;
  currentPointType = point.type || null;

  // 1) 准备对话文本
  currentDialogIndex = 0;
  if (Array.isArray(point.messages)) {
    currentMessages = point.messages;
  } else if (typeof point.message === 'string') {
    currentMessages = [point.message];
  } else {
    currentMessages = [];
  }

  // 2) 进入对话态 & 收起“按E提示”
  isDialogActive = true;
  canInteract = false;
  hideHint && hideHint();

  // 如果你希望对话中继续显示“带感叹号”，就别改；如果希望对话中换别的立绘，可在这里切
  // Game.player && Game.player.setSprite && Game.player.setSprite("assets/imgs/奥菲头上带感叹号.png");

  // 3) 打开对话框（统一创建DOM的函数）
  if (typeof openDialogBoxIfNeeded === 'function') {
 
    openDialogBoxIfNeeded();
  } 

  // 4) 展示第一句（你现有的逐字机/下一句函数）
  if (typeof showNextDialog === 'function') {
    showNextDialog();
  } else {
    currentMessages[0];
    showDialog(currentMessages[0]);
  }
}


  // 简单的对话框（DOM）
 function showDialog(text, isLast=false) {
    const old = document.getElementById('game-dialog');
    if (old) old.remove();

    const dialog = document.createElement('div');
    dialog.id = 'game-dialog';
    dialog.textContent = "";
    const textWrapper = document.createElement('div');
    textWrapper.id = "dialog-text";
    Object.assign(textWrapper.style, {
      maxWidth: "500px",     // 最大宽度限制（可以调大或调小）
      margin: "0 auto",      // 居中显示
      whiteSpace: "normal",  // 自动换行
      wordWrap: "break-word",
      lineHeight: "1.6",     // 行距更舒服
    });
dialog.appendChild(textWrapper);

    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();

    dialog.style.position = 'absolute';
    dialog.style.left = '10%';
    dialog.style.bottom = '0px';

/* 固定对话框大小和位置 */
    dialog.style.width = '82%';
    dialog.style.height = '100px';
    dialog.style.position = 'absolute';
    dialog.style.left = '10%';
    dialog.style.boxSizing = 'border-box';
    dialog.style.padding = '16px 24px';
    dialog.style.opacity = "0.7"; 

/* 背景 */
    dialog.style.backgroundImage = "url('assets/imgs/对话框.png')";
    dialog.style.backgroundSize = '100% 100%';
    dialog.style.backgroundPosition = 'center';
    dialog.style.backgroundRepeat = 'no-repeat';
    dialog.style.backgroundColor = 'transparent';

/* 其他样式 */
    dialog.style.overflow = 'hidden';
    dialog.style.backdropFilter = 'blur(2px)';
    dialog.style.zIndex = 10000;
    dialog.style.color = '#000000ff';
    dialog.style.fontSize = '22px';
    dialog.style.fontWeight = '700';
    dialog.style.fontFamily = "'SimSun', 'NSimSun', 'PMingLiU', serif";
    dialog.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)';


    document.body.appendChild(dialog);

    let charIndex = 0;
    const typingSpeed = 30;

    function typeNextChar() {
        if (charIndex < text.length) {
            textWrapper.textContent += text.charAt(charIndex);
            charIndex++;
            setTimeout(typeNextChar, typingSpeed);
        } else if (!isLast) {
            
          addContinuePrompt(dialog);
        } else {
      maybeShowChoices(dialog);
      }
    }
    typeNextChar();

    dialog.dataset.fullText = text;
    dialog.dataset.isLast = isLast;
    dialog.dataset.charIndex = charIndex;

    function maybeShowChoices() {
    if (isLast && currentPointType === 'piano') {
      const bar = document.createElement('div');
      Object.assign(bar.style, {
        marginTop: '10px', display: 'flex', gap: '8px', justifyContent: 'center'
      });

      const btnEnter = document.createElement('button');
      btnEnter.textContent = '进入演奏';
      const btnCancel = document.createElement('button');
      btnCancel.textContent = '算了';

      [btnEnter, btnCancel].forEach(b => Object.assign(b.style, {
        padding: '6px 12px', border:'1px solid #3c3c3c', background:'#1b1b1b',
        marginTop: '-25px', bottom:'15px', fontFamily: "'SimSun', 'NSimSun', 'PMingLiU', serif",
        color:'#fff', borderRadius:'6px', cursor:'pointer'
      }));

      btnEnter.onclick = () => { openPiano(); };
      btnCancel.onclick = () => { Game.closeDialog && Game.closeDialog(); };

      bar.appendChild(btnEnter);
      bar.appendChild(btnCancel);
      dialog.appendChild(bar);
    }
    else if (isLast && currentPointType === 'minigame') {
  const bar = document.createElement('div');
  Object.assign(bar.style, {
    position:'absolute',
    bottom: '13px',
    left:'43%',
    display: 'flex',
    gap: '8px',
    justifyContent: 'center'
  });

  const btnEnter  = document.createElement('button');
  const btnCancel = document.createElement('button');
  btnEnter.textContent  = '进入小游戏';
  btnCancel.textContent = '算了';

  [btnEnter, btnCancel].forEach(b => Object.assign(b.style, {
    padding: '6px 12px',
    border: '1px solid #3c3c3c',
    background: '#1b1b1b',
    marginTop: '-25px',
    bottom: '15px',
    fontFamily: "'SimSun','NSimSun','PMingLiU',serif",
    color: '#fff',
    borderRadius: '6px',
    cursor: 'pointer'
  }));

  btnEnter.onclick = () => {
    // 先关对白，再开弹窗（更干净）
    if (window.Game?.closeDialog) window.Game.closeDialog();
    if (window.openPopup) window.openPopup();
  };
  btnCancel.onclick = () => {
    if (window.Game?.closeDialog) window.Game.closeDialog();
  };

  bar.appendChild(btnEnter);
  bar.appendChild(btnCancel);
  dialog.appendChild(bar);
}

  }
  }


  const PIANO_URL = './piano/piano.html'; //钢琴页路径
  function openPiano() {
    try { document.dispatchEvent(new CustomEvent('piano:enter')); } catch {}
  // 关闭对话框
  Game.closeDialog && Game.closeDialog();
  // 再跳转
  window.autoSaveNow?.('进入钢琴');
  window.location.href = PIANO_URL+'?from=game';
}
  function addContinuePrompt(dialog) {
    const prompt = document.createElement('span');
    prompt.classList.add('continue-prompt');
    prompt.textContent = '  按下F键继续/点击鼠标关闭';
   Object.assign(prompt.style, {
    fontSize: "0.8em",
    opacity: "0.7",
    position: "absolute",   // 绝对定位
    bottom: "8px",          // 距离对话框底部 8px
    right: "12px",          // 距离右侧 12px（也可以改成 left 或居中）
    width: "100%",          // 占满一行（可选）
    textAlign: "center",    // 居中显示（如果用 width:100%）
    margin: 0
});
    dialog.appendChild(prompt);

    let opacity = 0.7;
    let increasing = false;
    function breathe() {
        if (!document.getElementById('game-dialog')) return;
        if (opacity <= 0.4) increasing = true;
        if (opacity >= 0.9) increasing = false;
        opacity += increasing ? 0.02 : -0.02;
        prompt.style.opacity = opacity.toString();
        requestAnimationFrame(breathe);
    }
    breathe();
  }

  function showNextDialog() {
  if (currentDialogIndex < currentMessages.length) {
    const isLast = currentDialogIndex === currentMessages.length - 1;
    showDialog(currentMessages[currentDialogIndex], isLast);
    currentDialogIndex++; 
    // 渲染完这一句后，把索引+1，下一次就会显示下一句

    // 在“最后一句已经显示完”时就立刻还原立绘，判断 isLast 后切回
    if (isLast && Game.player?.setSprite)
       Game.player.setSprite("assets/imgs/奥菲.png");

  } else {
    //用统一的关闭逻辑,还原 isDialogActive 状态
    if (typeof Game.closeDialog === 'function') {
      Game.closeDialog();
    } else {
      isDialogActive = false;
      const dlg = document.getElementById('game-dialog');
      if (dlg) dlg.remove();
    }
  }
}


  function checkInteraction(player) {
  if (isDialogActive) return;
  
  let onPoint = false;
  for (let i = 0; i < getInteractions().length; i++) {
    const point = getInteractions()[i];
    // 获取交互范围（默认范围为1x1即仅自身点）
    const range = point.range || { width: 0, height: 0 };
    
    // 计算区域边界
    const minX = point.x - Math.floor(range.width / 2);
    const maxX = point.x + Math.floor(range.width / 2);
    const minY = point.y - Math.floor(range.height / 2);
    const maxY = point.y + Math.floor(range.height / 2);

    // 检测玩家是否在区域内
    if (player.gridX >= minX && player.gridX <= maxX && 
        player.gridY >= minY && player.gridY <= maxY) {
      onPoint = true;

      if (!canInteract) {
        canInteract = true;
        pendingPoint = point;
        if (Game.player && Game.player.setSprite) {
          Game.player.setSprite("assets/imgs/奥菲头上带感叹号.png");
        }
        showHint("按 E 进行交互");
      }
      break;
    }
  }

  // 离开交互区域时恢复状态
  if (!onPoint && canInteract && !isDialogActive) {
    canInteract = false;
    pendingPoint = null;
    hideHint();
    if (Game.player && Game.player.setSprite) {
      Game.player.setSprite("assets/imgs/奥菲.png");
    }
  }
}


 document.addEventListener('keydown', (ev) => {
  const key = ev.key;
  // E / e 触发
  if ((key === 'e' || key === 'E') && !isDialogActive && canInteract && pendingPoint) {
    beginDialogFromPoint(pendingPoint);
   // 例如在 interaction.js 里
  window.achievementManager?.checkAchievements?.({ ach2: true });

    return;
  }

  // F 快进
  if ((key === 'f' || key === 'F') && isDialogActive) {
    showNextDialog();
    return;
  }
});

    


  function showHint(text = "按 E 进行交互") {
  if (hintEl) return;
  hintEl = document.createElement('div');
  hintEl.className = 'interact-hint';
  hintEl.textContent = text;
  Object.assign(hintEl.style, {
    position: 'absolute',
    left: '50%',
    bottom: '40px',
    transform: 'translateX(-50%)',
    padding: '20px 200px',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    borderRadius: '5px',
    fontSize: '17px',
    userSelect: 'none',
    zIndex: 9999
  });
  document.body.appendChild(hintEl);
}

function hideHint() {
  if (hintEl) {
    hintEl.remove();
    hintEl = null;
  }
}
function switchMap(nextId, opts = {}) {
  const cfgAll = window.MapConfigs || {};
  if (!cfgAll[nextId]) {
    console.warn("switchMap: 未找到地图：", nextId);
    return;
  }
  
  // 1) 设置当前地图
  Game.currentMapId = nextId;

  // 2) 关闭对话 & 清理交互状态
  if (typeof hideHint === 'function') hideHint();  // 你的 hideHint 已有定义:contentReference[oaicite:2]{index=2}

  // 3) 按需把玩家传送到该地图的出生点（默认传送；传 opts.keepPosition=true 可保留原地）
  const cfg = cfgAll[nextId] || {};
  if (!opts.keepPosition && cfg.startPos && window.player) {
    const { x, y } = cfg.startPos;
    window.player.gridX = x; window.player.gridY = y;
    if ('renderX' in window.player) window.player.renderX = x * 25;
    if ('renderY' in window.player) window.player.renderY = y * 25;
  }
  try {
    localStorage.setItem('save_current_map', nextId);
    if (window.player) {
      localStorage.setItem('save_player_pos', JSON.stringify({
        x: window.player.gridX, y: window.player.gridY
      }));
    }
  } catch (e) { console.warn('保存地图/坐标失败', e); }

  // （可选：如果你有 autoSaveNow，就顺带记一笔）
  window.autoSaveNow?.(`切换到 ${nextId}`);
  // 4) 通知渲染层更新矩阵/贴图
  window.dispatchEvent(new CustomEvent('mapchange', { detail: { mapId: nextId }}));
}

// 暴露给外部调用
Game.switchMap = switchMap;




  Game.showDialog = showDialog;
  Game.checkInteraction = checkInteraction;
  function closeDialog() {
  const dialog = document.getElementById('game-dialog');
  if (dialog) dialog.remove();
  isDialogActive = false;
   // ✅ 在对话真正结束时对当前点发奖励
  grantPointReward(pendingPoint);
  if (pendingPoint?.action) {
    pendingPoint.action();
  }
  
  const pt = pendingPoint;
  if (pt && (pt.nextMap || (pt.goto && pt.goto.mapId))) {
    const nextId = pt.nextMap || pt.goto.mapId;
    const keep = !!(pt.goto && pt.goto.keepPosition);
    const pos = pt.goto && pt.goto.pos;

    if (pos) {
      // 指定落点：先切图再手动定位
      Game.switchMap(nextId, { keepPosition: true });
      if (window.player) {
        window.player.gridX = pos.x; window.player.gridY = pos.y;
        if ('renderX' in window.player) window.player.renderX = pos.x * 25;
        if ('renderY' in window.player) window.player.renderY = pos.y * 25;
      }
    } else {
      // 用目标地图的 startPos（或 keepPosition）
      Game.switchMap(nextId, { keepPosition: keep });
    }
    // 防止重复触发
    pendingPoint = null;
  }
  currentMessages = [];
  currentDialogIndex = 0;
  if (Game.player) Game.player.setSprite("assets/imgs/奥菲.png");

}

Game.closeDialog = closeDialog;
// 背包发生变化 → 触发一次自动保存（防抖可按需加）
window.addEventListener('inventory:changed', () => {
  if (window.SaveManager?.saveAuto) {
    window.SaveManager.saveAuto('[auto] inventory changed');
  } else if (window.SaveManager?.overwriteFromRuntime) {
    // 如果你的项目没有 saveAuto，就用覆盖最近的自动槽位（见第3点）
    try { window.SaveManager._saveAutoCompat?.('[auto] inventory changed'); } catch {}
  }
});


// 鼠标点击：若正在对话，直接关闭并重置状态
window.addEventListener('click', () => {
  if (isDialogActive) closeDialog();
});


})();
