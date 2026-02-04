const btn = document.querySelector("button");
    btn.addEventListener(
        "click", function () {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

    // 简单判别是否为空
    if (username === "" || password === "" || confirmPassword === "") {
        alert("请填写完整信息！");
        return;
    }
    if (password !== confirmPassword) {
            alert("两次输入的密码不一致！");
            return;
        }

    // 存储到 localStorage
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);

    alert("注册成功！");
    window.location.href = "../login/login.html";
})
