// script/managers/InventoryManager.js
class InventoryManager {
  constructor() {
    // 物品字典：key 为物品 id，value 为 {name, count}
    // 你也可以扩展为 {name, count, icon, desc}
    this.items = {}; 
    // 绑定 UI
    this.$overlay = document.getElementById('bag-overlay');
    this.$list = document.getElementById('bag-list');
    this.$btnOpen = document.getElementById('btn-open-bag');
    this.$btnClose = document.getElementById('btn-close-bag');

    this.$btnOpen && this.$btnOpen.addEventListener('click', () => this.open());
    this.$btnClose && this.$btnClose.addEventListener('click', () => this.close());
    // 点击遮罩空白区域关闭（可选）
    this.$overlay && this.$overlay.addEventListener('click', (e) => {
      if (e.target === this.$overlay) this.close();
    });

    this.render();
  }

  // —— 基础 API —— //
  has(id) { return !!this.items[id]; }
  count(id) { return this.items[id]?.count || 0; }

  add(id, name = id, n = 1) {
    if (!this.items[id]) this.items[id] = { name, count: 0 };
    this.items[id].count += n;
    this.render();
    window.updatePlotBtnVisibility?.();
    try {
    document.dispatchEvent(new CustomEvent('inventory:changed', { detail: { type: 'add', id, count, name } }));
  } catch {}
  }

  remove(id, n = 1) {
    if (!this.items[id]) return;
    this.items[id].count -= n;
    if (this.items[id].count <= 0) delete this.items[id];
    this.render();
      try {
    document.dispatchEvent(new CustomEvent('inventory:changed', { detail: { type: 'remove', id, count } }));
  } catch {}
  }

  clear() { this.items = {}; this.render(); }

  // —— 存档交互（按存档保存） —— //
  exportState() {
    // 返回纯数据，便于写入 SaveManager 的 extra
    return { items: this.items };
  }
importState(state = {}) {
  this.items = state.items || {};
  this.render();
  window.updatePlotBtnVisibility?.();
  try {
    document.dispatchEvent(new CustomEvent('inventory:changed', { detail: { type: 'sync' }}));
  } catch {}
}


  // —— UI —— //
  open() {
    if (!this.$overlay) return;
    this.render();
    this.$overlay.classList.remove('hidden');
     try { document.dispatchEvent(new CustomEvent('guide:bag-opened')); } catch {}
  }
  close() {
    this.$overlay?.classList.add('hidden');
  }

  render() {
    if (!this.$list) return;
    const ids = Object.keys(this.items);
    if (ids.length === 0) {
      this.$list.innerHTML = `<div class="save-item"><div class="save-meta"><div class="save-title">（空）</div><div class="save-sub">还没有任何物品。</div></div></div>`;
      return;
    }
    this.$list.innerHTML = ids.map(id => {
      const it = this.items[id];
      return `
        <div class="save-item" data-id="${id}">
          <div class="save-meta">
            <div class="save-title">${it.name}</div>
            <div class="save-sub">数量：${it.count}</div>
          </div>
          <div class="save-actions">
            <!-- 预留按钮：将来可以做“使用/丢弃” -->
            <!-- <button class="btn ghost" data-act="use">使用</button> -->
            <!-- <button class="btn danger" data-act="drop">丢弃</button> -->
          </div>
        </div>
      `;
    }).join('');
  }
}

// —— 全局单例 —— //
if (!window.inventory) window.inventory = new InventoryManager();

// （可选）开发期测试热键：按 I 打开/关闭背包，按 B 获得一本“网页设计与制作”
document.addEventListener('keydown', (e) => {
  if (e.key === 'i' || e.key === 'I') {
    const show = document.getElementById('bag-overlay')?.classList.contains('hidden');
    show ? window.inventory?.open() : window.inventory?.close();
  }
  if (e.key === 'b' || e.key === 'B') {
    window.inventory?.add('web_book', '《网页设计与制作》第四版', 1);
    if (window.toast) toast('获得：网页设计与制作（示例）');
  }
});
