var DeckBuilderUI = /** @class */ (function () {
    function DeckBuilderUI(availableCards, cardLimits, deckSize, onConfirm) {
        var _this = this;
        this.selections = {};
        this.currentFilter = 'all';
        this.cardLimits = cardLimits;
        this.deckSize = deckSize;
        this.onConfirm = onConfirm;
        this.allCards = availableCards;
        this.container = document.getElementById('card-list-container');
        this.countInfo = document.getElementById('deck-count-info');
        this.startButton = document.getElementById('start-battle-btn');
        this.initializeFilterButtons();
        this.render(availableCards);
        this.updateAllUI();
        this.startButton.addEventListener('click', function () { return _this.handleConfirm(); });
    }
    DeckBuilderUI.prototype.initializeFilterButtons = function () {
        var _this = this;
        // 创建筛选按钮容器（假设HTML中有对应的元素）
        var filterContainer = document.getElementById('card-filter-container');
        if (filterContainer) {
            filterContainer.innerHTML = "\n                <button class=\"filter-btn active\" data-filter=\"all\">\u5168\u90E8\u5361\u724C</button>\n                <button class=\"filter-btn\" data-filter=\"normal\">\u2694\uFE0F \u666E\u901A\u724C</button>\n                <button class=\"filter-btn\" data-filter=\"action\">\u26A1 \u884C\u52A8\u724C</button>\n                <button class=\"filter-btn\" data-filter=\"counter\">\uD83D\uDEE1\uFE0F \u53CD\u5236\u724C</button>\n                <button class=\"filter-btn\" data-filter=\"equipment\">\uD83D\uDD27 \u88C5\u5907\u724C</button>\n            ";
            // 添加筛选事件监听
            filterContainer.addEventListener('click', function (e) {
                var target = e.target;
                if (target.classList.contains('filter-btn')) {
                    var filter = target.dataset.filter;
                    _this.setFilter(filter);
                    // 更新按钮样式
                    filterContainer.querySelectorAll('.filter-btn').forEach(function (btn) { return btn.classList.remove('active'); });
                    target.classList.add('active');
                }
            });
        }
    };
    DeckBuilderUI.prototype.setFilter = function (filter) {
        this.currentFilter = filter;
        var cardsToShow = filter === 'all'
            ? this.allCards
            : this.allCards.filter(function (card) { return card.type.toLowerCase() === filter; });
        this.render(cardsToShow);
        this.updateAllUI();
    };
    DeckBuilderUI.prototype.render = function (cards) {
        var _this = this;
        this.container.innerHTML = '';
        cards.forEach(function (card) {
            // 如果是第一次渲染，初始化selections
            if (!(card.id in _this.selections)) {
                _this.selections[card.id] = 0;
            }
            var cardElement = _this.createCardElement(card);
            _this.container.appendChild(cardElement);
        });
    };
    DeckBuilderUI.prototype.createCardElement = function (card) {
        var _this = this;
        var el = document.createElement('div');
        el.className = "card-item card-type-".concat(card.type.toLowerCase());
        el.dataset.cardId = card.id;
        el.dataset.cardType = card.type.toLowerCase();
        // 卡牌类型图标和样式映射
        var typeConfig = {
            'normal': { icon: '⚔️', name: '普通牌', color: '#4CAF50' },
            'action': { icon: '⚡', name: '行动牌', color: '#2196F3' },
            'counter': { icon: '🛡️', name: '反制牌', color: '#FF9800' },
            'equipment': { icon: '🔧', name: '装备牌', color: '#9C27B0' }
        };
        var typeInfo = typeConfig[card.type.toLowerCase()] || { icon: '❓', name: '未知', color: '#757575' };
        var imagePath = card.image || 'assets/images/cards/default.png';
        console.log("[\u8C03\u8BD5] \u5361\u724C ".concat(card.name, " \u7684\u56FE\u7247\u8DEF\u5F84: ").concat(imagePath, ", \u5B8C\u6574\u6570\u636E:"), card);
        el.innerHTML = "\n            <div class=\"card-type-badge\" style=\"background-color: ".concat(typeInfo.color, "\">\n                <span class=\"card-type-icon\">").concat(typeInfo.icon, "</span>\n                <span class=\"card-type-text\">").concat(typeInfo.name, "</span>\n            </div>\n            <div class=\"card-image\">\n                <img src=\"").concat(imagePath, "\" alt=\"").concat(card.name, "\" onerror=\"this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;image-placeholder&quot;>").concat(typeInfo.icon, "</div>'\">\n            </div>\n            <h3 class=\"card-name\">").concat(card.name, "</h3>\n            <p class=\"card-description\">").concat(card.description, "</p>\n            <div class=\"quantity-selector\">\n                <button class=\"decrease-btn\">-</button>\n                <span class=\"quantity-display\">0</span>\n                <button class=\"increase-btn\">+</button>\n            </div>\n        ");
        var decreaseBtn = el.querySelector('.decrease-btn');
        var increaseBtn = el.querySelector('.increase-btn');
        increaseBtn.addEventListener('click', function () { return _this.changeQuantity(card.id, 1); });
        decreaseBtn.addEventListener('click', function () { return _this.changeQuantity(card.id, -1); });
        return el;
    };
    DeckBuilderUI.prototype.changeQuantity = function (cardId, amount) {
        var currentCount = this.selections[cardId];
        var newCount = currentCount + amount;
        if (newCount < 0)
            return;
        if (newCount > this.cardLimits[cardId])
            return;
        if (amount > 0) {
            var currentTotal = Object.values(this.selections).reduce(function (sum, count) { return sum + count; }, 0);
            if (currentTotal >= this.deckSize)
                return;
        }
        this.selections[cardId] = newCount;
        this.updateAllUI();
    };
    DeckBuilderUI.prototype.updateAllUI = function () {
        var total = Object.values(this.selections).reduce(function (sum, count) { return sum + count; }, 0);
        this.countInfo.textContent = "\u5DF2\u9009\u5361\u724C: ".concat(total, " / ").concat(this.deckSize);
        this.startButton.disabled = total > this.deckSize;
        for (var cardId in this.selections) {
            var el = this.container.querySelector("[data-card-id=\"".concat(cardId, "\"]"));
            if (!el)
                continue;
            var count = this.selections[cardId];
            var limit = this.cardLimits[cardId];
            el.querySelector('.quantity-display').textContent = String(count);
            el.querySelector('.decrease-btn').disabled = count === 0;
            el.querySelector('.increase-btn').disabled = count === limit || total >= this.deckSize;
        }
    };
    // ================== 解决方案：修改这里的补牌逻辑 ==================
    DeckBuilderUI.prototype.handleConfirm = function () {
        var finalDeckIds = [];
        for (var cardId in this.selections) {
            for (var i = 0; i < this.selections[cardId]; i++) {
                finalDeckIds.push(cardId);
            }
        }
        var total = finalDeckIds.length;
        if (total > this.deckSize) {
            alert("\u724C\u7EC4\u5DF2\u8D85\u51FA\u4E0A\u9650\uFF01\u8BF7\u79FB\u9664 ".concat(total - this.deckSize, " \u5F20\u5361\u724C\u3002"));
            return;
        }
        // 如果选择的牌少于4张，从基础卡池中随机补充
        if (total < 4) {
            alert("\u4F60\u9009\u62E9\u7684\u724C\u5C11\u4E8E4\u5F20\uFF0C\u5C06\u4E3A\u4F60\u4ECE\u57FA\u7840\u5361\u6C60\u4E2D\u968F\u673A\u8865\u8DB3\u52304\u5F20\u3002");
            // 定义一个基础卡池，可以根据游戏设计调整
            var basicCardPool = ['p001', 'p004', 'p006']; // 例如：普攻, 快斩, 毅力守护
            while (finalDeckIds.length < 4) {
                // 从基础卡池中随机挑选一张牌的ID
                var randomId = basicCardPool[Math.floor(Math.random() * basicCardPool.length)];
                finalDeckIds.push(randomId);
            }
        }
        document.getElementById('deck-builder-screen').style.display = 'none';
        this.onConfirm(finalDeckIds);
    };
    return DeckBuilderUI;
}());
export { DeckBuilderUI };
//# sourceMappingURL=DeckBuilderUI.js.map