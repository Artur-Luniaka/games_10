// Mystery Box Drop interactivity
const rewards = [
  { text: "10% OFF", emoji: "🎟️" },
  { text: "Free Game", emoji: "🕹️" },
  { text: "Bonus XP", emoji: "💎" },
  { text: "Mystery Gift", emoji: "🎁" },
  { text: "Exclusive Skin", emoji: "🦾" },
  { text: "Early Access", emoji: "🚀" },
  { text: "Secret Code", emoji: "🔑" },
];

function getRandomReward() {
  const idx = Math.floor(Math.random() * rewards.length);
  return rewards[idx];
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".mystery-box").forEach((box) => {
    const btn = box.querySelector(".box-open-btn");
    const rewardDiv = box.querySelector(".box-reward");
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      btn.disabled = true;
      btn.textContent = "Opened!";
      const reward = getRandomReward();
      rewardDiv.innerHTML = `<span class="reward-emoji">${reward.emoji}</span> <span class="reward-text">${reward.text}</span>`;
      rewardDiv.style.transform = "scale(0.7)";
      rewardDiv.style.opacity = "0";
      setTimeout(() => {
        rewardDiv.style.transition = "transform 0.4s, opacity 0.4s";
        rewardDiv.style.transform = "scale(1.15)";
        rewardDiv.style.opacity = "1";
      }, 50);
      setTimeout(() => {
        rewardDiv.style.transform = "scale(1)";
      }, 500);
    });
  });
});
