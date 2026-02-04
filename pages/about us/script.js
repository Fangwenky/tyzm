// 成员数据（与你之前的一致）
const members = {
    1: {
        name: "赵烁涵",
        title: "项目经理、总预备队",
        description: "我的名字是赵烁涵，最开始接触编程是scratch图形化网站，有点被课外班半蒙半骗地进入到hello world的大门的意思，当时做了一个简单的空战街机游戏，看着自己的游戏就跟4399上面的差不多很有成就感。后来在高年级接触到了cpp，但是到了循环这一块就拉倒了，属于是连最基础的语法也没怎么学明白，上到初中跟着同学一起去做参加信息竞赛（主要是为了中午能有会电脑玩），绿皮水平的技术拿奖进省队是不用想的，做题只能用俺寻思之力，做最waghh的战士。高中沉寂了三年，直到一大学，第一次在cpp课上知道了ACM算法竞赛，当时就被奇高的难度所吸引，立刻开始学习数据结构和算法，在leetcode和洛谷上刷题，到学期末一直刷到了能做绿题的水平，基本上掌握了动态规划、图论、二分等等算法，并且将解题思路沉淀到笔记中。后来发现自己的脑子确实打不了算法竞赛，但是学习算法这一过程确实很着迷的，现在如果能空闲下来一周上四休三，我也想要去研究更多的类型。暑假开始学习安卓开发，因为觉得手机上面的专注软件做的太废物了，不能满足自己的需求，所以想要自己开发一个，现在基本掌握了UI界面设计,数据库交互逻辑,怎么联网调数据，正在攒零件搓一个大的。",
        avatar: "images/zsh1.jpg",
        detailImage: "images/zsh2.jpg"
    },
    2: {
        name: "房金衡",
        title: "剧情策划、战斗策划、艺术总监",
        description: "神秘二次元，控长水群，抽象，玩第五人格，红温，压力组长干活，push A1写代码，擅长马史山，嵌套十个循环，设计n^n^n数据炒模史山算法，洛谷入门级题目全部WA，TLE， RE的糕手，内存泄漏大师，毕业即被优化",
        avatar: "images/fjh1.jpg",
        detailImage: "images/fjh2.jpg"
    },
    3: {
        name: "梁思齐",
        title: "程序员、网站编辑、测试",
        description: "我是梁思齐，北京理工大学的一名学生，平时有着丰富的课余爱好，对生活充满热情。我来自山西省太原市，家乡美食有打卤面，刀削面。好玩的地方有平遥古城，晋祠。欢迎大家来玩。我特别喜欢打羽毛球，经常和同学在学校体育馆切磋球技，享受运动带来的活力。每周都会打几把，既锻炼了身体，也增进了同学间的友谊。最近沉迷于《赛博朋克2077》，但是由于小学期没什么时间沉迷了。我最喜欢打mod玩。除此之外，我还喜欢看电影（各种类型都有涉猎，尤其喜欢文艺片）、阅读书籍（偏爱文学类和幻想类作品）、和朋友一起探索校园周边的美食。如果有共同爱好的同学，很期待能认识交流！",
        avatar: "images/lsq1.jpg",
        detailImage: "images/lsq2.jpg"
    },
    4: {
        name: "刘雨桐",
        title: "程序员、网站编辑、测试",
        description: "我是刘雨桐，就读于北京理工大学计算机科学与技术专业。是一个从小练乒乓球，但是热爱踢足球，经常打羽毛球，最近又迷上了台球的篮球二级运动员。喜欢旅游，抵达过与自己年龄数字相同的国家和地区，平时会看看电影听听歌。一年编程经验正在努力生存，喜欢钻研算法所以选择了计算机相关专业，希望借此机会能多学到一些东西，欢迎大家和我交流跟我约球！",
        avatar: "images/lyt1.jpg",
        detailImage: "images/lyt2.jpg"
    },
    5: {
        name: "潘治鑫",
        title: "程序员、网站编辑、测试",
        description: "我是潘治鑫，目前于北京理工大学计算机科学与技术专业就读。个人爱好主要是足球，也是一名皇马球迷，目前也担任北京理工大学足球协会的裁判。游戏方面，主要爱好是FPS游戏，如CS（五年老兵一位），以及战争雷霆这样的军事题材游戏，不过最近也上头于kards这样的卡牌游戏。",
        avatar: "images/pzx1.jpg",
        detailImage: "images/pzx2.jpg"
    },
    6: {
        name: "王宇豪",
        title: "美工、网站编辑、测试",
        description: "大家好，我是王宇豪，来自广东广州。平时热爱听音乐，多听日流、欧美流行和轻音乐，R&B爱好者。平时读书，人物传记、历史类和人文社科类书籍都有涉及。也打一些steam上的小游戏，和朋友打王者荣耀，自己玩我的世界比较多。爱好杂糅，但都不深，欢迎与我聊天交流。",
        avatar: "images/wyh1.jpg",
        detailImage: "images/wyh2.jpg"
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const homePage = document.getElementById('home-page');
    const detailPage = document.getElementById('detail-page');
    const teamSection = document.querySelector('.team-section');
    // 绑定到 详细页 内的返回按钮，避免与页面底部 "返回主界面" 冲突
    const backButton = document.querySelector('#detail-page .back-button');
    const detailTitle = document.querySelector('.detail-title');
    const detailText = document.querySelector('.detail-text');
    const detailImage = document.querySelector('.detail-image img');
    const contactLink = document.querySelector('.contact-link');

    // 动态生成团队成员列表（网格里面每个为一格）
    function renderTeamMembers() {
        let html = '';
        for (const [id, member] of Object.entries(members)) {
            html += `
                <div class="team-member">
                    <div class="member-avatar">
                        <img src="${member.avatar}" alt="${member.name}的头像">
                    </div>
                    <div class="member-info">
                        <a href="#" class="member-name" data-id="${id}">${member.name}</a>
                        <p class="member-desc">${member.title}</p>
                    </div>
                </div>
            `;
        }
        teamSection.innerHTML = html;

        // 添加成员点击事件（跳转到详情）
        const memberLinks = document.querySelectorAll('.member-name');
        memberLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showMemberDetail(this.getAttribute('data-id'));
            });
        });
    }

    // 显示成员详情
    function showMemberDetail(memberId) {
        const member = members[memberId];
        if (member) {
            detailTitle.textContent = member.name;
            detailText.innerHTML = `
                <p><strong>${member.title}</strong></p>
                <p>${member.description}</p>
            `;
            detailImage.src = member.detailImage;
            detailImage.alt = `${member.name}的详情图片`;

            homePage.style.display = 'none';
            detailPage.style.display = 'block';
            // main-return 按钮的显示由页面内的 MutationObserver 控制（保留原逻辑）
        }
    }

    // 返回主页：**只绑定详细页内的返回按钮**（确保选中正确的那一个）
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            detailPage.style.display = 'none';
            homePage.style.display = 'block';
        });
    } else {
        console.warn('未找到详细页内的返回按钮（#detail-page .back-button）');
    }

    // 联系我们弹窗
    if (contactLink) {
        contactLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert("请联系我们！\n电话：17324007062\n邮箱：3125324827@qq.com");
        });
    }

    // 初始化
    renderTeamMembers();
});
