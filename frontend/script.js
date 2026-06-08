// دکمه‌ی تغییر تم
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// بررسی حالت ذخیره‌شده
if (localStorage.getItem("theme") === "light") {
  body.classList.remove("dark");
  themeToggle.textContent = "🌙";
} else {
  body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

// تغییر تم با کلیک
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
