function getScenarioConfig() {
    return {
        meta: {
            title: "第二章第五幕",
            author: "第五人格团队"
        },
        assets: {
            background: "backgrounds/scene2.5.jpg",
            bgmusic: "audio/scene1.mp3"
        },
        uiText: {
            zh: { languageBtn: "中文", endText: "【剧情结束】", nextTip: "按空格键进入下一句" },
            en: { languageBtn: "English", endText: "[The End]", nextTip: "Press Space to continue"}
        },
        dialogues: {
            zh: [
                { name: "瓦尔莱塔", text: "我是瓦尔莱塔。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "我出生时便与旁人不同，四肢残缺如同海豹的鳍肢。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "我被遗弃在马戏团的座椅下，直到麦克斯发现了我这棵\"摇钱树\"。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "他给了我一个栖身之所，却也给了我一个身份——供人猎奇观赏的\"活体奇迹\"。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "他特地为打造了\"惊奇小屋\"，将我宣传为\"企鹅与人的混合体\"来牟利。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "我的表演被刻意设计得简单而重复，只是在球上滚动和缝补破布，以最大化猎奇效果。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "我渴望能像其他演员一样演奏乐器，但麦克斯说我的身体只适合这种\"特色表演\"。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "观众的目光从最初的猎奇渐渐变为乏味的厌恶，而麦克斯只关心门票收入。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "新年时，我收到了一件从不合身的根西衫，像是敷衍的施舍。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "尽管它并不合身，我仍天真地相信这是人们怀着真心送出的礼物。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "当我不再能带来暴利时，麦克斯毫不犹豫地将我卖给了喧嚣马戏团，数着钱头也不回地离开。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "在喧嚣马戏团，一位善良的机械师为我安装了精巧的机械肢体。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "我创造了新的表演——\"人形蜘蛛秀\"，终于以新的面貌重生。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "但在马戏团中，我依然被排挤，处于边缘地位，连排练都无人参与。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "月亮河嘉年华前，因无人参加我的排练，伯纳德直接将我赶出了马戏团。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "这让我意外地避开了后来发生的月亮河惨案，可谓因祸得福。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "离开马戏团后，我独自生活，织衣服送给陌生人寻求一丝温暖。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "但人们总是被我的外貌吓跑，我的善意很少得到回应。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "后来，我收到庄园的邀请函，渴望与马戏团的旧友重聚。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "我在日记中写下：\"我们会忘记一切，重获新生。\"", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "在庄园里，穆罗和麦克是少数愿意向我伸出援手的人。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "我感受到了久违的温暖，并微妙地维持着两派之间的平衡。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "然而，裘克以收集表演灵感为借口将我骗出。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "他残忍地切掉了我所有的机械蜘蛛腿，任我在冰天雪中自生自灭。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "在生命的最后时刻，我仿佛听到了观众的欢呼和舞台的聚光灯终于为我亮起。", sprite: "characters/2.5.png", side: "left" },
                { name: "瓦尔莱塔", text: "我的世界终于安静下来，彻底远离了尘世的喧嚣。", sprite: "characters/2.5.png", side: "left" }
            ],
            en: [
                { name: "Violette", text: "I am Violette.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "I was born different, with congenital limb deficiency resembling a seal's flippers.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "I was abandoned under the circus seats until Max found me, his \"golden ticket\".", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "He gave me shelter, but also an identity—a \"living miracle\" for gawking spectators.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "He specially prepared a \"Chamber of Horrors\" for me, marketing me as a \"penguin-human hybrid\" for profit.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "My performances were deliberately kept simple and repetitive—just rolling on a ball and mending rags—to maximize the freak show effect.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "I longed to play musical instruments like other performers, but Max said my body was only suited for this \"specialty act\".", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "The audience's gaze gradually shifted from curiosity to bored disgust, while Max cared only about ticket sales.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "On New Year's, I received an ill-fitting guernsey, like a perfunctory handout.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "Although it didn't fit, I naively believed it was a gift given with genuine heart.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "When I could no longer generate huge profits, Max sold me to the Noisy Circus, counting his money without looking back.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "At the Noisy Circus, a kind mechanic fitted me with exquisite mechanical limbs.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "I created a new act—the \"Human Spider Show\"—finally reborn in a new form.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "But in the circus, I was still marginalized and excluded, with no one even attending my rehearsals.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "Before the Moonlight River Carnival, with no one attending my rehearsals, Bernard expelled me from the circus.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "This unexpectedly allowed me to avoid the subsequent Moonlight River tragedy, a blessing in disguise.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "After leaving the circus, I lived alone, knitting clothes for strangers to seek a shred of warmth.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "But people were always frightened by my appearance, and my kindness was rarely reciprocated.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "Later, I received an invitation to the manor, yearning to reunite with my old circus friends.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "I wrote in my diary: \"We will forget everything and be reborn.\"", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "In the manor, Murro and Mike were among the few willing to extend a helping hand to me.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "I felt long-lost warmth and subtly maintained a balance between the two factions.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "However, Joker lured me out under the false pretense of gathering performance inspiration.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "He cruelly severed all my mechanical spider legs, leaving me to die in the freezing snow.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "In my final moments, I seemed to hear audience cheers and see stage spotlights finally shining on me.", sprite: "characters/2.5.png", side: "left" },
                { name: "Violette", text: "My world finally fell silent, forever away from the noise of this world.", sprite: "characters/2.5.png", side: "left" }
            ]
        }
    };
}

window.scenarioConfig = {
    getScenarioConfig
};