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
                if (window.endingConfig?.getEndingConfig) {
                    resolve(window.endingConfig.getEndingConfig());
                } else {
                    reject(new Error(`脚本加载成功，但未找到结局配置: ${src}`));
                }
            };
            script.onerror = () => reject(new Error(`脚本加载失败: ${src}`));
            this.resourceContainer.appendChild(script);
        });
    }
}

class EndingEngine {
    returnToMain() {
        try {
            const chId = sessionStorage.getItem('currentChapterId');
            if (chId) {
                sessionStorage.setItem('endingComplete', JSON.stringify({
                    chId,
                    unlockNext: true,
                    t: Date.now()
                }));
            }
        } catch (e) {
            console.warn('记录结局完成失败（可忽略）：', e);
        }
        window.location.href = '../../game.html?from=ending';
    }

    constructor() {
        this.currentIndex = 0;
        this.isTyping = false;
        this.typeTimeout = null;
        this.typeToken = 0;
        this.currentLang = 'zh';
        this.currentEnding = null;
        this.dataManager = new DataManager();

        this.dom = {
            bg: document.body.style,
            bgm: document.getElementById("bgm"),
            name: document.getElementById("character-name"),
            text: document.getElementById("dialogue-text"),
            btnZh: document.getElementById("btn-zh"),
            btnEn: document.getElementById("btn-en"),
            skipBtn: document.getElementById("skip-btn")
        };

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
        this.dom.backBtn.addEventListener('click', () => this.returnToMain());

        this.initEvents();
        this.loadEnding().catch(err => {
            console.error('结局引擎初始化失败:', err);
        });
    }

    resetTyping(clearText = true) {
        if (this.typeTimeout) {
            clearTimeout(this.typeTimeout);
            this.typeTimeout = null;
        }
        this.isTyping = false;
        this.typeToken++;
        if (clearText) this.dom.text.textContent = "";
    }

    getAssetPath(relativePath) {
        return relativePath; // 返回相对路径
    }

    async loadEnding() {
        try {
            this.currentEnding = await this.dataManager.loadScript('ending.js');
            await this.initEnding();
        } catch (error) {
            console.error('加载结局失败:', error);
        }
    }

    async initEnding() {
        if (!this.currentEnding || !this.currentEnding.assets) {
            throw new Error('结局配置不完整');
        }

        const { assets } = this.currentEnding;

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

            this.dom.btnZh.textContent = this.currentEnding.uiText.zh.languageBtn;
            this.dom.btnEn.textContent = this.currentEnding.uiText.en.languageBtn;

            this.startEnding();
        } catch (err) {
            console.error('结局初始化失败:', err);
            throw err;
        }
    }

    ensureBGMPlaying() {
        const a = this.dom.bgm;
        if (!a) return;
        a.preload = 'auto';
        a.loop = true;

        const tryPlay = () => a.play().catch(() => {});

        tryPlay();

        if (a.paused) {
            const onFirstInteract = () => {
                tryPlay();
                window.removeEventListener('pointerdown', onFirstInteract);
                window.removeEventListener('keydown', onFirstInteract);
            };
            window.addEventListener('pointerdown', onFirstInteract, { once: true });
            window.addEventListener('keydown', onFirstInteract, { once: true });
        }
    }

    showCurrentDialogue() {
        this.resetTyping(true);
        if (!this.currentEnding || !this.currentEnding.dialogues) {
            return;
        }

        const dialogues = this.currentEnding.dialogues[this.currentLang] || [];
        if (this.currentIndex >= dialogues.length) {
            this.dom.text.textContent = this.currentEnding.uiText[this.currentLang].endText;
            if (this.dom.backBtn) this.dom.backBtn.style.display = 'block';
            return;
        }

        const dialogue = dialogues[this.currentIndex];
        this.dom.name.textContent = dialogue.name || "???";
        this.typeText(dialogue.text || "");
    }

    typeText(text) {
        this.resetTyping(true);
        this.isTyping = true;
        const token = this.typeToken;
        let i = 0;
        const typeChar = () => {
            if (token !== this.typeToken) return;
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
        if (!this.currentEnding || !this.currentEnding.dialogues) return;

        const dialogues = this.currentEnding.dialogues[this.currentLang] || [];
        if (this.currentIndex >= dialogues.length) return;

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

    startEnding() {
        if (this.dom.backBtn) this.dom.backBtn.style.display = 'none';
        this.currentIndex = 0;
        this.showCurrentDialogue();
    }

    skipToEnd() {
        if (!this.currentEnding || !this.currentEnding.dialogues) return;

        const dialogues = this.currentEnding.dialogues[this.currentLang] || [];
        this.currentIndex = dialogues.length;

        this.resetTyping(true);
        this.dom.name.textContent = "";
        this.dom.text.textContent = this.currentEnding.uiText[this.currentLang].endText;

        if (this.dom.backBtn) this.dom.backBtn.style.display = 'block';
    }
}

const engine = new EndingEngine();
