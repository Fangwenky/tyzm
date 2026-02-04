function getEndingConfig() {
    return {
        meta: {
            title: "结局",
            author: "六个基米哈一天"
        },
        assets: {
            background: "../backgrounds/ending1.jpg",
            bgmusic: "audio/ending.mp3"
        },
        uiText: {
            zh: { languageBtn: "中文", endText: "【结局结束】" },
            en: { languageBtn: "English", endText: "[Ending Complete]" }
        },
        dialogues: {
            zh: [
                { name: "旁白", text: "这是游戏的结局" },
                { name: "旁白", text: "所有故事都迎来了终章" },
                { name: "旁白", text: "莉迪亚·琼斯的旅程在此画上句点" },
                { name: "旁白", text: "她的选择将永远改变这个世界" },
                { name: "旁白", text: "但有些伤痛永远无法愈合" },
                { name: "旁白", text: "有些罪孽永远无法偿还" },
                { name: "旁白", text: "在最后的最后" },
                { name: "旁白", text: "她终于找到了内心的平静" }
            ],
            en: [
                { name: "Narrator", text: "This is the ending of the game" },
                { name: "Narrator", text: "All stories have come to an end" },
                { name: "Narrator", text: "Lydia Jones's journey ends here" },
                { name: "Narrator", text: "Her choices will forever change this world" },
                { name: "Narrator", text: "But some wounds will never heal" },
                { name: "Narrator", text: "Some sins can never be atoned for" },
                { name: "Narrator", text: "In the very end" },
                { name: "Narrator", text: "She finally found peace within herself" }
            ]
        }
    };
}

window.endingConfig = {
    getEndingConfig
};