const btn = document.querySelector("button");
    btn.addEventListener(
        "click", function () {
        const username = document.getElementById("username-login").value;
        const password = document.getElementById("password-login").value;

    // 简单判别是否为空
    if (username === ""|| password === "") {
        alert("请填写完整信息！");
        return;
    }

    // 存储到 localStorage
    localStorage.setItem("username-login", username);
    localStorage.setItem("password-login", password);

    const storedUsername= localStorage.getItem("username")
    const storedPassword = localStorage.getItem("password");

    if (username === storedUsername && password === storedPassword) {
        alert("欢迎回来，" + username + "！");
        window.location.href = "../../../main.html"; // 跳转到游戏页面
    } else {
        alert("用户名或密码错误！");
    }
    
})
