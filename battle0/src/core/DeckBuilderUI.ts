import { CardData } from '../components/Card.js';

export class DeckBuilderUI {
    private selections: { [key: string]: number } = {};
    private cardLimits: { [key: string]: number };
    private container: HTMLElement;
    private countInfo: HTMLElement;
    private startButton: HTMLButtonElement;
    private onConfirm: (deck: string[]) => void;
    private deckSize: number;
    private allCards: CardData[];
    private currentFilter: string = 'all';

    constructor(
        availableCards: CardData[],
        cardLimits: { [key: string]: number },
        deckSize: number,
        onConfirm: (deck: string[]) => void
    ) {
        this.cardLimits = cardLimits;
        this.deckSize = deckSize;
        this.onConfirm = onConfirm;
        this.allCards = availableCards;
        this.container = document.getElementById('card-list-container')!;
        this.countInfo = document.getElementById('deck-count-info')!;
        this.startButton = document.getElementById('start-battle-btn')! as HTMLButtonElement;
        this.initializeFilterButtons();
        this.render(availableCards);
        this.updateAllUI();
        this.startButton.addEventListener('click', () => this.handleConfirm());
    }

    private initializeFilterButtons(): void {
        // 创建筛选按钮容器（假设HTML中有对应的元素）
        const filterContainer = document.getElementById('card-filter-container');
        if (filterContainer) {
            filterContainer.innerHTML = `
                <button class="filter-btn active" data-filter="all">全部卡牌</button>
                <button class="filter-btn" data-filter="normal">⚔️ 普通牌</button>
                <button class="filter-btn" data-filter="action">⚡ 行动牌</button>
                <button class="filter-btn" data-filter="counter">🛡️ 反制牌</button>
                <button class="filter-btn" data-filter="equipment">🔧 装备牌</button>
            `;
            
            // 添加筛选事件监听
            filterContainer.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                if (target.classList.contains('filter-btn')) {
                    const filter = target.dataset.filter!;
                    this.setFilter(filter);
                    
                    // 更新按钮样式
                    filterContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                    target.classList.add('active');
                }
            });
        }
    }

    private setFilter(filter: string): void {
        this.currentFilter = filter;
        const cardsToShow = filter === 'all' 
            ? this.allCards 
            : this.allCards.filter(card => card.type.toLowerCase() === filter);
        this.render(cardsToShow);
        this.updateAllUI();
    }

    private render(cards: CardData[]): void {
        this.container.innerHTML = '';
        cards.forEach(card => {
            // 如果是第一次渲染，初始化selections
            if (!(card.id in this.selections)) {
                this.selections[card.id] = 0;
            }
            const cardElement = this.createCardElement(card);
            this.container.appendChild(cardElement);
        });
    }

    private createCardElement(card: CardData): HTMLElement {
        const el = document.createElement('div');
        el.className = `card-item card-type-${card.type.toLowerCase()}`;
        el.dataset.cardId = card.id;
        el.dataset.cardType = card.type.toLowerCase();
        
        // 卡牌类型图标和样式映射
        const typeConfig = {
            'normal': { icon: '⚔️', name: '普通牌', color: '#4CAF50' },
            'action': { icon: '⚡', name: '行动牌', color: '#2196F3' },
            'counter': { icon: '🛡️', name: '反制牌', color: '#FF9800' },
            'equipment': { icon: '🔧', name: '装备牌', color: '#9C27B0' }
        };
        
        const typeInfo = typeConfig[card.type.toLowerCase() as keyof typeof typeConfig] || { icon: '❓', name: '未知', color: '#757575' };
        
        const imagePath = card.image || 'assets/images/cards/default.png';
        console.log(`[调试] 卡牌 ${card.name} 的图片路径: ${imagePath}, 完整数据:`, card);
        
        el.innerHTML = `
            <div class="card-type-badge" style="background-color: ${typeInfo.color}">
                <span class="card-type-icon">${typeInfo.icon}</span>
                <span class="card-type-text">${typeInfo.name}</span>
            </div>
            <div class="card-image">
                <img src="${imagePath}" alt="${card.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;image-placeholder&quot;>${typeInfo.icon}</div>'">
            </div>
            <h3 class="card-name">${card.name}</h3>
            <p class="card-description">${card.description}</p>
            <div class="quantity-selector">
                <button class="decrease-btn">-</button>
                <span class="quantity-display">0</span>
                <button class="increase-btn">+</button>
            </div>
        `;
        const decreaseBtn = el.querySelector('.decrease-btn')! as HTMLButtonElement;
        const increaseBtn = el.querySelector('.increase-btn')! as HTMLButtonElement;
        increaseBtn.addEventListener('click', () => this.changeQuantity(card.id, 1));
        decreaseBtn.addEventListener('click', () => this.changeQuantity(card.id, -1));
        return el;
    }

    private changeQuantity(cardId: string, amount: number): void {
        const currentCount = this.selections[cardId];
        const newCount = currentCount + amount;
        if (newCount < 0) return;
        if (newCount > this.cardLimits[cardId]) return;
        if (amount > 0) {
            const currentTotal = Object.values(this.selections).reduce((sum, count) => sum + count, 0);
            if (currentTotal >= this.deckSize) return;
        }
        this.selections[cardId] = newCount;
        this.updateAllUI();
    }

    private updateAllUI(): void {
        const total = Object.values(this.selections).reduce((sum, count) => sum + count, 0);
        this.countInfo.textContent = `已选卡牌: ${total} / ${this.deckSize}`;
        this.startButton.disabled = total > this.deckSize;
        for (const cardId in this.selections) {
            const el = this.container.querySelector(`[data-card-id="${cardId}"]`);
            if (!el) continue;
            const count = this.selections[cardId];
            const limit = this.cardLimits[cardId];
            (el.querySelector('.quantity-display') as HTMLElement).textContent = String(count);
            (el.querySelector('.decrease-btn') as HTMLButtonElement).disabled = count === 0;
            (el.querySelector('.increase-btn') as HTMLButtonElement).disabled = count === limit || total >= this.deckSize;
        }
    }

    // ================== 解决方案：修改这里的补牌逻辑 ==================
    private handleConfirm(): void {
        let finalDeckIds: string[] = [];
        for (const cardId in this.selections) {
            for (let i = 0; i < this.selections[cardId]; i++) {
                finalDeckIds.push(cardId);
            }
        }
        
        const total = finalDeckIds.length;

        if (total > this.deckSize) {
            alert(`牌组已超出上限！请移除 ${total - this.deckSize} 张卡牌。`);
            return;
        }
        
        // 如果选择的牌少于4张，从基础卡池中随机补充
        if (total < 4) {
            alert(`你选择的牌少于4张，将为你从基础卡池中随机补足到4张。`);
            
            // 定义一个基础卡池，可以根据游戏设计调整
            const basicCardPool = ['p001', 'p004', 'p006']; // 例如：普攻, 快斩, 毅力守护

            while (finalDeckIds.length < 4) {
                // 从基础卡池中随机挑选一张牌的ID
                const randomId = basicCardPool[Math.floor(Math.random() * basicCardPool.length)];
                finalDeckIds.push(randomId);
            }
        }
        
        (document.getElementById('deck-builder-screen') as HTMLElement).style.display = 'none';
        this.onConfirm(finalDeckIds);
    }
    // ==========================================================
}