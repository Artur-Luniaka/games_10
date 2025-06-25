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
      existingItem.quantity += 1;
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
    }

    // Сохраняем корзину
    localStorage.setItem("pixelVaultCart", JSON.stringify(cart));

    // Обновляем счетчик
    this.updateCartCounter();

    // Показываем уведомление
    this.showNotification("Game added to cart!", "success");
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

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${
        type === "success"
          ? "#22b573"
          : type === "error"
          ? "#d32f2f"
          : "#ffb300"
      };
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode)
          notification.parentNode.removeChild(notification);
      }, 300);
    }, 2200);
  }

  showErrorMessage(message) {
    this.showNotification(message, "error");
  }
}

// Initialize catalog manager when DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
  new GameCatalogManager();
});
