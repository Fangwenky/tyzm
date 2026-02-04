var DeckBuilder = /** @class */ (function () {
    function DeckBuilder(library) {
        this.cardLimits = {
            'p001': 5, 'p002': 2, 'p003': 2, 'p004': 2, 'p006': 3,
            'p007': 3, 'p008': 2, 'p009': 2, 'p010': 2,
            'p101': 2, 'p102': 2, 'p103': 2, 'p104': 1, 'p105': 1, 'p106': 1,
            'p107': 1, 'p108': 1, 'p109': 1, 'p110': 2, 'p111': 2, 'p112': 3,
            'p114': 2, 'p115': 1,
            // 装备牌限制：每张装备牌只能选择1张进入牌组
            'p301': 1, 'p302': 1, 'p303': 1, 'p304': 1, 'p305': 1, 'p306': 1,
            'p307': 1,
        };
        this.library = library;
    }
    DeckBuilder.prototype.getAvailableCards = function () {
        return this.library.getPlayerCardsData();
    };
    DeckBuilder.prototype.buildDeck = function (selectedCardIds) {
        var _this = this;
        return selectedCardIds.map(function (id) { return _this.library.createCard(id); });
    };
    return DeckBuilder;
}());
export { DeckBuilder };
//# sourceMappingURL=DeckBuilder.js.map