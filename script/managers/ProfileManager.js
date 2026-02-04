// script/managers/ProfileManager.js
// 角色档案系统逻辑（返回按钮底部居中 + 标签更大）

class ProfileManager {
  constructor() {
    this.STORAGE_KEY = 'account_profiles';
    this.characters = window.PROFILE_CHARACTERS || [];
    this.state = {};
    this.importFromLocal();
    this.injectStyles();

    document.addEventListener('DOMContentLoaded', () => {
      this.mountPoint = document.getElementById('profile-root');
      this.render();
      const backBtn = document.getElementById('btn-back-main');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          window.location.href = '../../main.html';
        });
      }
    });
  }

  exportState() {
    const s = {};
    this.characters.forEach(c => { s[c.id] = !!this.state[c.id]; });
    return s;
  }
  importFromLocal() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) this.state = JSON.parse(raw);
    else this.characters.forEach(c => this.state[c.id] = false);
  }
  saveToLocal() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.exportState()));
  }

  injectStyles() {
    const css = `
      .grid-wrapper {
        flex:1;
        display:flex;
        flex-direction:column;
        justify-content:center;
        align-items:center;
        gap:20px;
        transform: translateY(-60px);
      }

      .row {
        display:flex;
        justify-content:center;
        gap:20px;
      }

      .char-btn {
        width:180px;
        height:64px;
        border:1px solid rgba(255,255,255,0.08);
        border-radius:12px;
        background: rgba(0,0,0,0.45);
        color:#fff;
        cursor:pointer;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:16px;
        transition: all 0.12s;
        box-shadow: 0 2px 0 rgba(0,0,0,0.4) inset;
        backdrop-filter: blur(4px);
      }
      .char-btn:hover {
        transform: translateY(-3px);
        background: rgba(255,255,255,0.06);
      }
      .char-btn .mark {
        font-size:30px;
        color:#ff5a7a;
        font-family: "Chiller", "KaiTi", cursive, sans-serif;
      }

      .overlay {
        position:fixed;top:0;left:0;right:0;bottom:0;
        background:rgba(0,0,0,0.7);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:9999;
      }
      .modal {
        background:#222;
        padding:30px;
        border-radius:12px;
        width:82%;
        max-width:1100px;
        max-height:78vh;
        display:flex;
        flex-direction:column;   /* 纵向布局，按钮能固定在底部 */
        gap:28px;
        color:#fff;
        overflow:auto;
      }

      .modal .img-wrap {
        width:320px;
        height:420px;
        display:flex;
        align-items:center;
        justify-content:center;
        flex-shrink:0;
      }
      .modal .img-wrap img {
        max-width:100%;
        max-height:100%;
        object-fit:contain;
        display:block;
      }

      .modal .info {
        flex:1;                  /* 占满中间空间，按钮推到底部 */
        display:flex;
        flex-direction:column;
        gap:18px;
        justify-content:center;
      }

      .modal .two-cols {
        display:flex;
        gap:48px;
      }
      .modal .col {
        flex:1;
        display:flex;
        flex-direction:column;
        gap:10px;
      }

      .modal .field {
        line-height:1.7;
        color:#fff;
      }
      .modal .field .label {
        display:inline-block;
        width:78px;
        color:#986868;
        font-weight:700;
        font-size:20px;   /* 提示文字更大 */
      }
      .modal .field .value {
        color:#fff;
        font-size:16px;   /* 具体信息稍小一点 */
      }

      .modal .actions {
        margin-top:auto;
        text-align:center;       /* 按钮居中 */
      }
      .modal .actions button {
        padding:8px 30px;       /* 框 */
        font-size:16px;          /* ←文字 */
        border:none;
        border-radius:12px;
        background:#666;
        color:#fff;
        cursor:pointer;
      }

      @media (max-width:900px) {
        .modal { padding:20px; }
        .modal .img-wrap { width:240px; height:320px; }
        .modal .two-cols { flex-direction:column; gap:12px; }
        .modal .field .label { width:86px; }
      }
    `;
    const s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  render() {
    this.mountPoint.innerHTML = `<div class="grid-wrapper"></div>`;
    const wrapper = this.mountPoint.querySelector('.grid-wrapper');
    const layout = [4,5,5,3];
    let idx = 0;
    layout.forEach(count => {
      const row = document.createElement('div');
      row.className = 'row';
      for (let i=0; i<count; i++) {
        const c = this.characters[idx];
        if (!c) { idx++; continue; }
        const seen = !!this.state[c.id];
        const btn = document.createElement('button');
        btn.className = 'char-btn';
        btn.innerHTML = seen ? (c.job || c.name) : `<span class="mark">❓</span>`;

        btn.addEventListener('mouseenter', () => {
          if (!this.state[c.id]) btn.textContent = (c.job || c.name);
        });
        btn.addEventListener('mouseleave', () => {
          if (!this.state[c.id]) btn.innerHTML = `<span class="mark">❓</span>`;
        });

        btn.addEventListener('click', () => {
          this.openModal(c);
          if (!this.state[c.id]) {
            this.state[c.id] = true;
            this.saveToLocal();
            this.render();
          }
        });

        row.appendChild(btn);
        idx++;
      }
      wrapper.appendChild(row);
    });
  }

  openModal(c) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    overlay.innerHTML = `
      <div class="modal">
        <div style="display:flex;gap:28px;align-items:center;">
          <div class="img-wrap">
            <img src="${c.img}" alt="${c.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;320&quot; height=&quot;420&quot;><rect width=&quot;100%&quot; height=&quot;100%&quot; fill=&quot;#333&quot;/><text x=&quot;50%&quot; y=&quot;50%&quot; dominant-baseline=&quot;middle&quot; text-anchor=&quot;middle&quot; fill=&quot;#eee&quot;>NO IMG</text></svg>'">
          </div>
          <div class="info">
            <div class="two-cols">
              <div class="col">
                <div class="field"><span class="label">姓名:</span> <span class="value">${c.name || '未知'}</span></div>
                <div class="field"><span class="label">生日:</span> <span class="value">${c.birth || '未知'}</span></div>
                <div class="field"><span class="label">擅长:</span> <span class="value">${c.skill || '未知'}</span></div>
                <div class="field"><span class="label">喜欢:</span> <span class="value">${c.like || '未知'}</span></div>
              </div>
              <div class="col">
                <div class="field"><span class="label">职业:</span> <span class="value">${c.job || '未知'}</span></div>
                <div class="field"><span class="label">年龄:</span> <span class="value">${c.age || '未知'}</span></div>
                <div class="field"><span class="label">兴趣:</span> <span class="value">${c.hobby || '未知'}</span></div>
                <div class="field"><span class="label">厌恶:</span> <span class="value">${c.dislike || '未知'}</span></div>
              </div>
            </div>
            <div class="field"><span class="label">特质:</span> <span class="value">${c.trait || '未知'}</span></div>
          </div>
        </div>
        <div class="actions"><button id="close-modal">返回</button></div>
      </div>`;

    document.body.appendChild(overlay);

    overlay.querySelector('#close-modal').addEventListener('click', ()=> overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }
}

if (!window.profileManager) window.profileManager = new ProfileManager();


