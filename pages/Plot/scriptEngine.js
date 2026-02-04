class DataManager {
    constructor() {
        this.resourceContainer = document.createElement('div');
        this.resourceContainer.id = 'resource-container';
        this.resourceContainer.style.display = 'none';
        document.body.appendChild(this.resourceContainer);
    }

    async loadImg(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`图片加载失败: ${src}`));
            this.resourceContainer.appendChild(img);
        });
    }

    async loadAudio(src) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.src = src;
            audio.oncanplaythrough = () => resolve(audio);
            audio.onerror = () => reject(new Error(`音频加载失败: ${src}`));
            this.resourceContainer.appendChild(audio);
        });
    }

    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                if (window.scenarioConfig?.getScenarioConfig) {
                    resolve(window.scenarioConfig.getScenarioConfig());
                } else {
                    reject(new Error(`脚本加载成功，但未找到剧情配置: ${src}`));
                }
            };
            script.onerror = () => reject(new Error(`脚本加载失败: ${src}`));
            this.resourceContainer.appendChild(script);
        });
    }
}

class ScriptEngine {
    returnToMain() {
  try {
    const chId = sessionStorage.getItem('currentChapterId');
    if (chId) {
      sessionStorage.setItem('plotComplete', JSON.stringify({
        chId,
        unlockNext: true,
        t: Date.now()
      }));
    }
  } catch (e) {
    console.warn('记录剧情完成失败（可忽略）：', e);
  }
    window.location.href = '../../game.html?from=plot';
  
}

    constructor() {
        this.currentIndex = 0;
        this.isTyping = false;
        this.typeTimeout = null;
        this.typeToken = 0; // ← 新增：打字会话令牌
        this.currentLang = 'zh';
        this.currentScenario = null;
        this.dataManager = new DataManager();
        // 记录立绘是否已完成首次加载（用于控制弹出动画）
        this.spritesInitialized = {
            left: false,
            right: false
        };
        // 新增：记录当前显示的立绘位置（left/right/null）
        this.currentlyShowing = null;

        this.dom = {
            bg: document.body.style,
            bgm: document.getElementById("bgm"),
            name: document.getElementById("character-name"),
            text: document.getElementById("dialogue-text"),
            leftSprite: document.getElementById("sprite-left"),
            rightSprite: document.getElementById("sprite-right"),
            btnZh: document.getElementById("btn-zh"),
            btnEn: document.getElementById("btn-en"),
            skipBtn: document.getElementById("skip-btn") 
        };
        // === 返回主界面按钮（默认隐藏，只有结尾时显示） ===
this.dom.backBtn = document.createElement('button');
this.dom.backBtn.textContent = '返回主界面';
Object.assign(this.dom.backBtn.style, {
  position: 'fixed',
  left: '50%',
  bottom: '32px',
  transform: 'translateX(-50%)',
  padding: '10px 18px',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  cursor: 'pointer',
  boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
  zIndex: '9999',
  display: 'none',
  background: 'rgba(255,255,255,0.9)'
});
document.body.appendChild(this.dom.backBtn);

// 点击返回：写入通关标记 -> 返回主页面
this.dom.backBtn.addEventListener('click', () => this.returnToMain());


        this.initEvents();
        this.loadScenarioFromURL().catch(err => {
            console.error('剧情引擎初始化失败:', err);
          
        });
    }
      // ✅ 在这里加 resetTyping
  resetTyping(clearText = true) {
    if (this.typeTimeout) {
      clearTimeout(this.typeTimeout);
      this.typeTimeout = null;
    }
    this.isTyping = false;
    this.typeToken++; // 让旧的 typeText 循环自动失效
    if (clearText) this.dom.text.textContent = "";
  }
    getAssetPath(relativePath) {
        return `assets/${relativePath}`;
    }

    async loadScenarioFromURL() {
        const scenarioName = this.getScenarioNameFromURL();
        try {
            this.currentScenario = await this.dataManager.loadScript(`scenarios/${scenarioName}.js`);
            // 切换场景时重置状态
            this.spritesInitialized = { left: false, right: false };
            this.currentlyShowing = null;
            await this.initScenario();
        } catch (error) {
            console.error(`加载剧情 ${scenarioName} 失败，尝试默认剧情:`, error);
            this.currentScenario = await this.dataManager.loadScript('scenarios/scenario1.js');
            this.spritesInitialized = { left: false, right: false };
            this.currentlyShowing = null;
            await this.initScenario();
        }
    }

    async initScenario() {
        if (!this.currentScenario || !this.currentScenario.assets) {
            throw new Error('剧情配置不完整');
        }

        const { assets } = this.currentScenario;
        
        try {
            const bgImg = await this.dataManager.loadImg(this.getAssetPath(assets.background));
            this.dom.bg.backgroundImage = `url(${bgImg.src})`;
            
            try {
  const bgmAudio = await this.dataManager.loadAudio(this.getAssetPath(assets.bgmusic));
   this.dom.bgm.src = bgmAudio.src;
   this.ensureBGMPlaying();
 } catch (e) {
      console.warn('BGM 加载失败，跳过音频但继续剧情：', e);
 }
            
            this.dom.btnZh.textContent = this.currentScenario.uiText.zh.languageBtn;
            this.dom.btnEn.textContent = this.currentScenario.uiText.en.languageBtn;
            
            this.startDialogue();
        } catch (err) {
            console.error('场景初始化失败:', err);
            throw err;
        }
    }
    ensureBGMPlaying() {
  const a = this.dom.bgm;
  if (!a) return;
  a.preload = 'auto';
  a.loop = true;

  // 尝试直接播放（有些情况下已经满足自动播放策略）
  const tryPlay = () => a.play().catch(() => { /* 被拦也别抛错 */ });

  tryPlay();

  // 如果仍被拦截（通常 a.paused === true），就挂一次性监听，等用户任意操作就播放
  if (a.paused) {
    const onFirstInteract = () => {
      // 如果你想更保险，可以先静音播放再取消静音
      // a.muted = true;
      tryPlay();
      // a.muted = false;

      window.removeEventListener('pointerdown', onFirstInteract);
      window.removeEventListener('keydown', onFirstInteract);
    };
    window.addEventListener('pointerdown', onFirstInteract, { once: true });
    window.addEventListener('keydown', onFirstInteract, { once: true });
  }
}

    async showCurrentDialogue() {
        this.resetTyping(true); // 保守起见，展示新台词之前先清掉残留打字
        if (!this.currentScenario || !this.currentScenario.dialogues) {
            return;
        }

        const dialogues = this.currentScenario.dialogues[this.currentLang] || [];
        if (this.currentIndex >= dialogues.length) {
            this.dom.text.textContent = this.currentScenario.uiText[this.currentLang].endText;
            // 剧情结束时隐藏所有立绘
            this.dom.leftSprite.classList.remove('show');
            this.dom.rightSprite.classList.remove('show');
            this.currentlyShowing = null;
             // ★ 显示“返回主界面”按钮（由玩家点击决定是否返回）
    if (this.dom.backBtn) this.dom.backBtn.style.display = 'block';
            return;
        }

        const dialogue = dialogues[this.currentIndex];
        this.dom.name.textContent = dialogue.name || "???";

        try {
            if (dialogue.sprite) {
                const side = dialogue.side || 'left';
                
                // 核心修改：如果当前有显示的立绘且不是当前需要显示的，就隐藏它
                if (this.currentlyShowing && this.currentlyShowing !== side) {
                    this.dom[this.currentlyShowing + 'Sprite'].classList.remove('show');
                }

                const spriteImg = await this.dataManager.loadImg(this.getAssetPath(dialogue.sprite));
                this.dom[side + 'Sprite'].src = spriteImg.src;

                // 仅首次加载时显示弹出动画
                if (!this.spritesInitialized[side]) {
                    setTimeout(() => {
                        this.dom[side + 'Sprite'].classList.add('show');
                        this.spritesInitialized[side] = true;
                        this.currentlyShowing = side; // 更新当前显示状态
                    }, 200);
                } else {
                    // 非首次加载直接显示（无动画）
                    this.dom[side + 'Sprite'].classList.add('show');
                    this.currentlyShowing = side; // 更新当前显示状态
                }
            } else {
                // 如果当前对话没有立绘，隐藏所有立绘
                this.dom.leftSprite.classList.remove('show');
                this.dom.rightSprite.classList.remove('show');
                this.currentlyShowing = null;
            }
        } catch (err) {
            console.error('立绘加载失败:', err);
        }

        this.typeText(dialogue.text || "");
    }

    typeText(text) {
      this.resetTyping(true);      // 开新一段打字前清理旧的
   this.isTyping = true;
   const token = this.typeToken; // 捕获当前令牌
   let i = 0;
   const typeChar = () => {
     if (token !== this.typeToken) return; // 令牌变了=旧循环，直接退出
    if (i < text.length) {
       this.dom.text.textContent += text.charAt(i++);
       this.typeTimeout = setTimeout(typeChar, 40);
    } else {
       this.isTyping = false;
    }
   };
   typeChar();
    }

    next() {
        if (!this.currentScenario || !this.currentScenario.dialogues) return;

        const dialogues = this.currentScenario.dialogues[this.currentLang] || [];
        if (this.currentIndex >= dialogues.length) 
            
            
            return;

        if (this.isTyping) {
            clearTimeout(this.typeTimeout);
            this.dom.text.textContent = dialogues[this.currentIndex].text || "";
            this.isTyping = false;
        } else {
            this.currentIndex++;
            this.showCurrentDialogue();
        }
    }

    loadLanguage(lang) {
        if (lang === this.currentLang) return;
        this.resetTyping(true);
        this.currentLang = lang;
        this.currentIndex = 0;
        this.showCurrentDialogue();
    }

    initEvents() {
        document.addEventListener("keydown", (e) => {
            if (["Space", "Enter"].includes(e.code)) {
                e.preventDefault();
                this.next();
            }
        });

        this.dom.btnZh?.addEventListener("click", () => this.loadLanguage('zh'));
        this.dom.btnEn?.addEventListener("click", () => this.loadLanguage('en'));
        this.dom.skipBtn?.addEventListener("click", () => this.skipToEnd());
        document.getElementById("dialogue-box")?.addEventListener("click", () => this.next());
    }

    getScenarioNameFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('scene') || 'scenario1.3';
    }

    startDialogue() {
         if (this.dom.backBtn) this.dom.backBtn.style.display = 'none';  // 进入剧情时先隐藏
        this.currentIndex = 0;
        this.showCurrentDialogue();
    }
    skipToEnd() {
    if (!this.currentScenario || !this.currentScenario.dialogues) return;
    
    const dialogues = this.currentScenario.dialogues[this.currentLang] || [];
    
    // 直接跳到最后一个对话
    this.currentIndex = dialogues.length;
    
    // 隐藏所有立绘
    this.dom.leftSprite.classList.remove('show');
    this.dom.rightSprite.classList.remove('show');
    this.currentlyShowing = null;
    
    // 显示结束文本
    this.resetTyping(true);
    this.dom.name.textContent = "";
    this.dom.text.textContent = this.currentScenario.uiText[this.currentLang].endText;
    
    // 显示返回主界面按钮
    if (this.dom.backBtn) this.dom.backBtn.style.display = 'block';
}
}

const engine = new ScriptEngine();