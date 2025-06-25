import { showNotification } from "./notification.js";

// Catalog Manager Module
class GameCatalogManager {
  constructor() {
    this.allGames = [];
    this.currentView = "grid";
    this.init();
  }

  async init() {
    await this.loadGamesData();
    this.renderGames();
  }

  async loadGamesData() {
    try {
      const response = await fetch("assets/data/games.json");
      const data = await response.json();
      this.allGames = data.games || [];
    } catch (error) {
      console.error("Error loading games data:", error);
      this.showErrorMessage("Failed to load games data");
    }
  }

  renderGames() {
    const gridContainer = document.getElementById("games-grid");
    if (!this.allGames.length) {
      gridContainer.innerHTML = this.getEmptyStateHTML();
      return;
    }
    gridContainer.innerHTML = this.allGames
      .map((game) => this.createGameCard(game))
      .join("");
    this.attachGameCardEventListeners();
  }

  createGameCard(game) {
    const hasDiscount = game.discount && game.discount > 0;
    const currentPrice = hasDiscount
      ? (game.price * (1 - game.discount / 100)).toFixed(2)
      : game.price.toFixed(2);
    const discountPercentage = hasDiscount ? game.discount : 0;
    return `
      <div class="game-card" data-game-id="${game.id}">
        <div class="game-card-image">
          <img src="${game.image}" alt="${game.title}" loading="lazy">
          ${
            hasDiscount
              ? `<div class="game-card-badge">-${discountPercentage}%</div>`
              : ""
          }
        </div>
        <div class="game-card-content">
          <h3 class="game-card-title">${game.title}</h3>
          <div class="game-card-genre">${game.genre}</div>
          <div class="game-card-rating">
            <div class="rating-stars">
              ${this.generateStars(game.rating)}
            </div>
            <span class="rating-text">${game.rating}/5</span>
          </div>
          <div class="game-card-price">
            <div>
              <span class="price-current">$${currentPrice}</span>
              ${
                hasDiscount
                  ? `<span class="price-original">$${game.price.toFixed(
                      2
                    )}</span>`
                  : ""
              }
            </div>
          </div>
          <div class="game-card-actions">
            <button class="btn-add-cart" data-game-id="${game.id}">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;
  }

  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = "";
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars += '<span class="star full">★</span>';
      } else if (i === fullStars && halfStar) {
        stars += '<span class="star half">★</span>';
      } else {
        stars += '<span class="star empty">☆</span>';
      }
    }
    return stars;
  }

  attachGameCardEventListeners() {
    // Add to cart buttons
    document.querySelectorAll(".btn-add-cart").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const gameId = btn.dataset.gameId;
        this.addToCart(gameId);
      });
    });
    // Card click (navigate to detail)
    document.querySelectorAll(".game-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (!e.target.closest(".btn-add-cart")) {
          const gameId = card.dataset.gameId;
          this.navigateToGameDetail(gameId);
        }
      });
    });
  }

  addToCart(gameId) {
    // Получаем все игры
    const game = this.allGames.find((g) => g.id === gameId);
    if (!game) return;

    // Получаем текущую корзину
    let cart = JSON.parse(localStorage.getItem("pixelVaultCart") || "[]");

    // Проверяем, есть ли игра уже в корзине
    const existingItem = cart.find((item) => item.id === gameId);
    if (existingItem) {
      if (existingItem.quantity < 99) {
        existingItem.quantity += 1;
        showNotification("Game already in cart! Quantity increased.", "info");
      } else {
        showNotification("Maximum quantity reached in cart!", "info");
      }
    } else {
      cart.push({
        id: gameId,
        title: game.title,
        price:
          game.discount && game.discount > 0
            ? (game.price * (1 - game.discount / 100)).toFixed(2) * 1
            : game.price,
        image: game.image,
        quantity: 1,
      });
      showNotification("Game added to cart!", "success");
    }

    // Сохраняем корзину
    localStorage.setItem("pixelVaultCart", JSON.stringify(cart));

    // Обновляем счетчик
    this.updateCartCounter();
  }

  updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem("pixelVaultCart") || "[]");
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCounter = document.querySelector(".cart-count, .cart-counter");
    if (cartCounter) {
      cartCounter.textContent = totalItems;
      cartCounter.style.display = totalItems > 0 ? "block" : "none";
    }
  }

  navigateToGameDetail(gameId) {
    window.location.href = `game-detail.html?id=${gameId}`;
  }

  getEmptyStateHTML() {
    return `<div class="empty-state">No games found.</div>`;
  }

  showErrorMessage(message) {
    showNotification(message, "error");
  }
}

// Initialize catalog manager when DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
  new GameCatalogManager();
});
