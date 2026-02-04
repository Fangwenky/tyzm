import { SurvivorLibrary } from './SurvivorLibrary.js';
import { SurvivorData } from '../components/Survivor.js';

export class SurvivorSelectionUI {
    private survivorLibrary: SurvivorLibrary;
    private selectedSurvivorId: string | null = null;
    private onSurvivorSelected: (survivorId: string) => void;
    private availableSurvivorIds: string[] | null = null; // 可选的求生者ID限制

    constructor(survivorLibrary: SurvivorLibrary, onSurvivorSelected: (survivorId: string) => void, availableSurvivorIds?: string[]) {
        this.survivorLibrary = survivorLibrary;
        this.onSurvivorSelected = onSurvivorSelected;
        this.availableSurvivorIds = availableSurvivorIds || null;
        this.initializeUI();
    }

    private initializeUI(): void {
        this.renderSurvivors();
        this.setupEventListeners();
    }

    private renderSurvivors(): void {
        const container = document.getElementById('survivor-grid-container');
        if (!container) return;

        let survivors = this.survivorLibrary.getAllSurvivors();
        
        // 如果设置了可用求生者ID限制，则过滤求生者列表
        if (this.availableSurvivorIds && this.availableSurvivorIds.length > 0) {
            survivors = survivors.filter(survivor => 
                this.availableSurvivorIds!.includes(survivor.id)
            );
        }
        
        container.innerHTML = '';

        survivors.forEach(survivor => {
            const card = this.createSurvivorCard(survivor);
            container.appendChild(card);
        });
        
        // 在控制台输出可选求生者信息
        console.log('可选择的求生者:', survivors.map(s => `${s.name} (${s.id})`));
    }

    private createSurvivorCard(survivor: SurvivorData): HTMLElement {
        const card = document.createElement('div');
        card.className = 'survivor-card';
        card.dataset.survivorId = survivor.id;

        // 根据求生者类型设置头像表情
        const avatarEmoji = this.getSurvivorAvatar(survivor.id);
        
        // 类型显示文本
        const typeText = {
            'intellect': '智力型',
            'agility': '敏捷型', 
            'strength': '力量型'
        }[survivor.type] || '未知';

        card.innerHTML = `
            <div class="survivor-avatar">${avatarEmoji}</div>
            <div class="survivor-name">${survivor.name}</div>
            <div class="survivor-profession">${survivor.profession}</div>
            <div class="survivor-type ${survivor.type}">${typeText}</div>
            <div class="survivor-description">${survivor.description}</div>
            <div class="survivor-skills">
                <div class="survivor-skill">
                    <div class="skill-name">被动: ${survivor.passiveSkill.name}</div>
                    <div class="skill-description">${survivor.passiveSkill.description}</div>
                </div>
                <div class="survivor-skill">
                    <div class="skill-name">主动: ${survivor.activeSkill.name}</div>
                    <div class="skill-description">${survivor.activeSkill.description}</div>
                </div>
            </div>
            <div class="survivor-stats">
                <div class="stat-item">
                    <div class="stat-value">${survivor.baseHp}</div>
                    <div class="stat-label">生命值</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${survivor.baseActionPoints}</div>
                    <div class="stat-label">行动点</div>
                </div>
            </div>
        `;

        return card;
    }

    private getSurvivorAvatar(survivorId: string): string {
        const avatars: Record<string, string> = {
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
    }

    private setupEventListeners(): void {
        // 求生者卡片点击事件
        document.addEventListener('click', (e) => {
            const card = (e.target as HTMLElement).closest('.survivor-card') as HTMLElement;
            if (card) {
                this.selectSurvivor(card.dataset.survivorId!);
            }
        });

        // 确认选择按钮
        const confirmBtn = document.getElementById('confirm-survivor-btn');
        confirmBtn?.addEventListener('click', () => {
            if (this.selectedSurvivorId) {
                this.onSurvivorSelected(this.selectedSurvivorId);
            }
        });
    }

    private selectSurvivor(survivorId: string): void {
        // 移除之前的选择
        document.querySelectorAll('.survivor-card.selected').forEach(card => {
            card.classList.remove('selected');
        });

        // 选择新的求生者
        const card = document.querySelector(`[data-survivor-id="${survivorId}"]`);
        if (card) {
            card.classList.add('selected');
            this.selectedSurvivorId = survivorId;

            // 更新信息显示
            const survivor = this.survivorLibrary.getSurvivor(survivorId);
            if (survivor) {
                const infoElement = document.getElementById('survivor-selection-info');
                if (infoElement) {
                    infoElement.textContent = `已选择: ${survivor.name} - ${survivor.profession}`;
                }
            }

            // 启用确认按钮
            const confirmBtn = document.getElementById('confirm-survivor-btn') as HTMLButtonElement;
            if (confirmBtn) {
                confirmBtn.disabled = false;
            }
        }
    }

    public getSelectedSurvivorId(): string | null {
        return this.selectedSurvivorId;
    }
}
