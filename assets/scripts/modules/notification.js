// Универсальный модуль уведомлений
export function showNotification(message, type = "info") {
  // Удалить предыдущее уведомление, если есть
  document.querySelectorAll(".site-notification").forEach((n) => n.remove());
  const notif = document.createElement("div");
  notif.className = `site-notification ${type}`;
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3300);
}
