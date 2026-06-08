// تغییر تم دارک / لایت
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light');
        themeToggle.textContent = body.classList.contains('light') ? '☀️' : '🌙';
    });
}

// باز و بسته کردن سایدبار در موبایل
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// کلیک روی کارت ویدیو (در آینده می‌تونی وصلش کنی به video.html)
const videoCards = document.querySelectorAll('.video-card');

videoCards.forEach(card => {
    card.addEventListener('click', () => {
        // فعلاً فقط لاگ می‌گیریم، بعداً می‌تونیم ببریمش به video.html
        console.log('Video clicked:', card.dataset.id);
        // window.location.href = 'video.html';
    });
});