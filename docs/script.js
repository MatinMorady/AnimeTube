/* ------------------------------
   تغییر تم (Dark / Light)
------------------------------ */

const body = document.body;
const themeToggle = document.getElementById("themeToggle");

// اگر قبلاً تم ذخیره شده بود، همان را اعمال کن
if (localStorage.getItem("theme") === "light") {
    body.classList.add("light");
}

// دکمه تغییر تم
themeToggle.addEventListener("click", () => {
    body.classList.toggle("light");

    if (body.classList.contains("light")) {
        localStorage.setItem("theme", "light");
    } else {
        localStorage.setItem("theme", "dark");
    }
});

/* ------------------------------
   کلیک روی کارت ویدیو → باز شدن صفحه پخش
------------------------------ */

const videoCards = document.querySelectorAll(".yt-video-card");

videoCards.forEach((card, index) => {
    card.addEventListener("click", () => {
        // در آینده اینجا ID واقعی ویدیو را می‌فرستیم
        window.location.href = `video.html?id=${index}`;
    });
});

/* ------------------------------
   انیمیشن ساده هنگام لود شدن صفحه
------------------------------ */

window.addEventListener("load", () => {
    document.querySelectorAll(".yt-video-card").forEach(card => {
        card.style.opacity = "0";
        card.style.transform = "translateY(10px)";

        setTimeout(() => {
            card.style.transition = "0.4s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, 200);
    });
});