document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.querySelector(".menu-button");
  const menu = document.querySelector(".nav-links");
  menuButton?.addEventListener("click", function () {
    menu.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", menu.classList.contains("open"));
  });
  document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () { menu.classList.remove("open"); });
  });
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(function (element) {
    observer.observe(element);
  });
  document.querySelectorAll(".team-filter button").forEach(function (button) {
    button.addEventListener("click", function () {
      const filter = button.dataset.filter;
      document.querySelectorAll(".team-filter button").forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      document.querySelectorAll(".team-member").forEach(function (member) {
        member.hidden = filter !== "all" && !member.dataset.role.split(" ").includes(filter);
      });
    });
  });
  document.querySelectorAll(".insight-filter button").forEach(function (button) {
    button.addEventListener("click", function () {
      const filter = button.dataset.filter;
      document.querySelectorAll(".insight-filter button").forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      document.querySelectorAll(".insight-card").forEach(function (card) {
        card.hidden = filter !== "all" && card.dataset.topic !== filter;
      });
    });
  });
});