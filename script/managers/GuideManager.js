// script/managers/GuideManager.js
class GuideManager {
  constructor() {

this.itemTaskMap = {
  'web_book':  'pickup_web_book',
  'note_book': 'pickup_note',
  'lab_key':   'pickup_key',
};

// ✅ 统一用一个处理器接两类事件（无论背包变更还是发奖都能打勾）
const handleItemEvent = (e) => {
  const id = e?.detail?.id;
  const taskId = this.itemTaskMap[id];
  if (taskId) this.done(taskId);
};
document.addEventListener('inventory:changed', handleItemEvent);
document.addEventListener('reward:granted',    handleItemEvent);


    this.KEY = 'guide_state_v1';
    // 任务清单：id 要稳定，title 可改文案，autoHide 为 true 则完成后直接从列表消失
    this.tasks = [
      { id: 'enter_fullscreen',     title: '按下F11进入全屏',desc: '肥肠简单的小任务', autoHide: true },
      { id: 'open_bag',        title: '打开背包（I 键或按钮）',desc: '学习查看物品', autoHide: true },
      { id: 'pickup_web_book', title: '在房间寻找彩蛋',esc: '接近柜子交互获得', autoHide: true },
      { id: 'enter_piano',   title: '演奏一次钢琴',desc: '猜出这首乐谱是什么乐曲吧！', autoHide: true },
      { id: 'secret_passage',  title: '找到房间出口',desc: '发现暗道并切换地图', autoHide: true },
      { id: 'pickup_key',  title: '找到钥匙',desc: '完成修机游戏并拿到钥匙', autoHide: true },
      { id: 'pickup_note',     title: '找到实验笔记',desc: '接近书柜获得', autoHide: true },
      { id: 'open_story_system',     title: '打开剧情系统',desc: '找到日记后在左侧边栏处点击', autoHide: true },
    ];

    // 读取状态
    this.state = this._load() || {};
    // 绑定 UI
    this.$panel = document.getElementById('guide-panel');
    this.$list  = document.getElementById('guide-list');
    this.$btnOpen  = document.getElementById('btn-open-guide');
    this.$btnClose = document.getElementById('btn-close-guide');

    this.$btnOpen && this.$btnOpen.addEventListener('click', () => this.open());
    this.$btnClose && this.$btnClose.addEventListener('click', () => this.close());
    this.$panel && this.$panel.addEventListener('click', (e) => {
      if (e.target === this.$panel) this.close();
    });

    // 事件联动 —— 根据你的项目里已经存在的事件进行勾连
    document.addEventListener('inventory:changed', (e) => {
      const id = e?.detail?.id;
      if (id === 'web_book') this.done('pickup_web_book');
      if (id === 'note_book') this.done('pickup_note');
      if (id === 'lab_key') this.done('pickup_key');
    });
    // 切图：从 interaction/p.js 里会派发 mapchange
    window.addEventListener('mapchange', (ev) => {
      if (ev?.detail?.mapId === 'room2') this.done('secret_passage');
    });
    // 钢琴进入（我们会在 p.js 的 openPiano 前派发事件）
    document.addEventListener('piano:enter', () => this.done('enter_piano'));
    // 背包打开（我们会在 InventoryManager.open() 里派发事件）
    document.addEventListener('guide:bag-opened', () => this.done('open_bag'));
    queueMicrotask(() => this.reconcileFromCurrentState());
    document.addEventListener('guide:open-story', () => {
    this.done('open_story_system');
    });

    // 初次渲染
    this.render();
    this.open();
    document.addEventListener('keydown', (e) => {
  // F11键的keyCode是122
  if (e.keyCode === 122) {
    // 触发完成逻辑
    this.done("enter_fullscreen");
  }
});
    
  }

  // ===== 基础 UI =====
  open(){ this.$panel?.classList.remove('hidden'); }
  close(){ this.$panel?.classList.add('hidden'); }

  render() {
    if (!this.$list) return;
    const html = this.tasks
      .filter(t => !(t.autoHide && this.state[t.id])) // 自动隐藏的，完成后不再展示
      .map(t => {
        const done = !!this.state[t.id];
        return `
          <div class="guide-item ${done?'done':''}" data-id="${t.id}">
            <div>
              <div class="g-title">${t.title}</div>
              ${t.desc ? `<div class="g-desc">${t.desc}</div>` : ''}
            </div>
            <div class="g-act">
              ${done ? '✅' : ''}
            </div>
          </div>
        `;
      }).join('');
    this.$list.innerHTML = html || `<div style="opacity:.7;padding:16px;">🎉 引导已完成！</div>`;
  }

  // ===== 状态存取 =====
  _load(){
    try{ return JSON.parse(localStorage.getItem(this.KEY)) || {}; }catch{ return {}; }
  }
  _save(){
    try{ localStorage.setItem(this.KEY, JSON.stringify(this.state)); }catch{}
  }

  // 对外：标记完成
  done(id){
    if (!id) return;
    if (this.state[id]) return; // 已完成
    this.state[id] = true;
    this._save();
    this.render();
  }
  reconcileFromCurrentState() {
  const inv = (window.inventory && window.inventory.items) || {};
  if (inv['web_book']?.count > 0)  this.done('pickup_web_book');
  if (inv['note_book']?.count > 0) this.done('pickup_note');

  // 已在房间2（或最近一次保存就在房间2），也算完成“暗道/壁炉”任务
  const current = (window.Game && Game.currentMapId) || '';
  const savedMap = localStorage.getItem('save_current_map') || '';
  if (current === 'room2' || savedMap === 'room2') this.done('secret_passage');
}
  // 可选：与存档互通（写入/恢复）
  exportState(){ return { ...this.state }; }
  importState(s = {}){
    this.state = { ...this.state, ...s };
    this._save(); this.render();
  }
}

if (!window.guideManager) window.guideManager = new GuideManager();
