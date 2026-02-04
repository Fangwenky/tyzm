var SurvivorSelectionUI = /** @class */ (function () {
    function SurvivorSelectionUI(survivorLibrary, onSurvivorSelected, availableSurvivorIds) {
        this.selectedSurvivorId = null;
        this.availableSurvivorIds = null; // 可选的求生者ID限制
        this.survivorLibrary = survivorLibrary;
        this.onSurvivorSelected = onSurvivorSelected;
        this.availableSurvivorIds = availableSurvivorIds || null;
        this.initializeUI();
    }
    SurvivorSelectionUI.prototype.initializeUI = function () {
        this.renderSurvivors();
        this.setupEventListeners();
    };
    SurvivorSelectionUI.prototype.renderSurvivors = function () {
        var _this = this;
        var container = document.getElementById('survivor-grid-container');
        if (!container)
            return;
        var survivors = this.survivorLibrary.getAllSurvivors();
        // 如果设置了可用求生者ID限制，则过滤求生者列表
        if (this.availableSurvivorIds && this.availableSurvivorIds.length > 0) {
            survivors = survivors.filter(function (survivor) {
                return _this.availableSurvivorIds.includes(survivor.id);
            });
        }
        container.innerHTML = '';
        survivors.forEach(function (survivor) {
            var card = _this.createSurvivorCard(survivor);
            container.appendChild(card);
        });
        // 在控制台输出可选求生者信息
        console.log('可选择的求生者:', survivors.map(function (s) { return "".concat(s.name, " (").concat(s.id, ")"); }));
    };
    SurvivorSelectionUI.prototype.createSurvivorCard = function (survivor) {
        var card = document.createElement('div');
        card.className = 'survivor-card';
        card.dataset.survivorId = survivor.id;
        // 根据求生者类型设置头像表情
        var avatarEmoji = this.getSurvivorAvatar(survivor.id);
        // 类型显示文本
        var typeText = {
            'intellect': '智力型',
            'agility': '敏捷型',
            'strength': '力量型'
        }[survivor.type] || '未知';
        card.innerHTML = "\n            <div class=\"survivor-avatar\">".concat(avatarEmoji, "</div>\n            <div class=\"survivor-name\">").concat(survivor.name, "</div>\n            <div class=\"survivor-profession\">").concat(survivor.profession, "</div>\n            <div class=\"survivor-type ").concat(survivor.type, "\">").concat(typeText, "</div>\n            <div class=\"survivor-description\">").concat(survivor.description, "</div>\n            <div class=\"survivor-skills\">\n                <div class=\"survivor-skill\">\n                    <div class=\"skill-name\">\u88AB\u52A8: ").concat(survivor.passiveSkill.name, "</div>\n                    <div class=\"skill-description\">").concat(survivor.passiveSkill.description, "</div>\n                </div>\n                <div class=\"survivor-skill\">\n                    <div class=\"skill-name\">\u4E3B\u52A8: ").concat(survivor.activeSkill.name, "</div>\n                    <div class=\"skill-description\">").concat(survivor.activeSkill.description, "</div>\n                </div>\n            </div>\n            <div class=\"survivor-stats\">\n                <div class=\"stat-item\">\n                    <div class=\"stat-value\">").concat(survivor.baseHp, "</div>\n                    <div class=\"stat-label\">\u751F\u547D\u503C</div>\n                </div>\n                <div class=\"stat-item\">\n                    <div class=\"stat-value\">").concat(survivor.baseActionPoints, "</div>\n                    <div class=\"stat-label\">\u884C\u52A8\u70B9</div>\n                </div>\n            </div>\n        ");
        return card;
    };
    SurvivorSelectionUI.prototype.getSurvivorAvatar = function (survivorId) {
        var avatars = {
            'doctor': '👩‍⚕️',
            'gardener': '👨‍🌾',
            'lawyer': '👨‍💼',
            'dancer': '💃',
            'acrobat': '🤹',
            'novelist': '📝',
            'wildman': '🦍',
            'reporter': '📰',
            'composer': '🎵',
            'entomologist': '🔬',
            'little_girl': '👧',
            'mechanic': '🔧',
            'forward': '⚔️'
        };
        return avatars[survivorId] || '❓';
    };
    SurvivorSelectionUI.prototype.setupEventListeners = function () {
        var _this = this;
        // 求生者卡片点击事件
        document.addEventListener('click', function (e) {
            var card = e.target.closest('.survivor-card');
            if (card) {
                _this.selectSurvivor(card.dataset.survivorId);
            }
        });
        // 确认选择按钮
        var confirmBtn = document.getElementById('confirm-survivor-btn');
        confirmBtn === null || confirmBtn === void 0 ? void 0 : confirmBtn.addEventListener('click', function () {
            if (_this.selectedSurvivorId) {
                _this.onSurvivorSelected(_this.selectedSurvivorId);
            }
        });
    };
    SurvivorSelectionUI.prototype.selectSurvivor = function (survivorId) {
        // 移除之前的选择
        document.querySelectorAll('.survivor-card.selected').forEach(function (card) {
            card.classList.remove('selected');
        });
        // 选择新的求生者
        var card = document.querySelector("[data-survivor-id=\"".concat(survivorId, "\"]"));
        if (card) {
            card.classList.add('selected');
            this.selectedSurvivorId = survivorId;
            // 更新信息显示
            var survivor = this.survivorLibrary.getSurvivor(survivorId);
            if (survivor) {
                var infoElement = document.getElementById('survivor-selection-info');
                if (infoElement) {
                    infoElement.textContent = "\u5DF2\u9009\u62E9: ".concat(survivor.name, " - ").concat(survivor.profession);
                }
            }
            // 启用确认按钮
            var confirmBtn = document.getElementById('confirm-survivor-btn');
            if (confirmBtn) {
                confirmBtn.disabled = false;
            }
        }
    };
    SurvivorSelectionUI.prototype.getSelectedSurvivorId = function () {
        return this.selectedSurvivorId;
    };
    return SurvivorSelectionUI;
}());
export { SurvivorSelectionUI };
//# sourceMappingURL=SurvivorSelectionUI.js.map