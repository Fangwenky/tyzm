import { Card, CardData } from '../components/Card.js';
import { CardLibrary } from './CardLibrary.js';

export class DeckBuilder {
    private library: CardLibrary;

    constructor(library: CardLibrary) {
        this.library = library;
    }
    
    public cardLimits: { [key: string]: number } = {
        'p001': 5, 'p002': 2, 'p003': 2, 'p004': 2, 'p006': 3,
        'p007': 3, 'p008': 2, 'p009': 2, 'p010': 2,
        'p101': 2, 'p102': 2, 'p103': 2, 'p104': 1, 'p105': 1, 'p106': 1,
        'p107': 1, 'p108': 1, 'p109': 1, 'p110': 2, 'p111': 2, 'p112': 3,
        'p114': 2, 'p115': 1,
        // 装备牌限制：每张装备牌只能选择1张进入牌组
        'p301': 1, 'p302': 1, 'p303': 1, 'p304': 1, 'p305': 1, 'p306': 1,
        'p307': 1,
    };
    
    public getAvailableCards(): CardData[] {
        return this.library.getPlayerCardsData();
    }

    public buildDeck(selectedCardIds: string[]): Card[] {
        return selectedCardIds.map(id => this.library.createCard(id));
    }
}