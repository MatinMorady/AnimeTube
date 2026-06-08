// ----------------------
// 1) دکمه‌ی تغییر تم
// ----------------------
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

if (localStorage.getItem("theme") === "light") {
  body.classList.remove("dark");
  themeToggle.textContent = "🌙";
} else {
  body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark");

  if (body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    themeToggle.textContent = "☀️";
  } else {
    localStorage.setItem("theme", "light");
    themeToggle.textContent = "🌙";
  }
});


// ----------------------
// 2) دریافت ویدیوها از Railway
// ----------------------
const API = "https://animetube-production.up.railway.app";

async function loadVideos() {
  try {
    const res = await fetch(`${API}/videos`);
    const videos = await res.json();

    const container = document.querySelector(".video-grid");
    container.innerHTML = "";

    videos.forEach(video => {
      container.innerHTML += `
        <div class="video-card">
            <img src="${video.thumbnail}">
            <h3>${video.title}</h3>
            <p>کانال: ${video.channel}</p>
        </div>
      `;
    });

  } catch (err) {
    console.error("خطا در دریافت ویدیوها:", err);
  }
}

loadVideos();
