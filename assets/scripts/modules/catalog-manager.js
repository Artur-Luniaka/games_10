// Catalog Manager Module
class GameCatalogManager {
  constructor() {
    this.allGames = [];
    this.filteredGames = [];
    this.currentPage = 1;
    this.gamesPerPage = 12;
    this.currentView = "grid";
    this.filters = {
      platform: "",
      genre: "",
      priceRange: "",
      sortBy: "name",
    };

    this.init();
  }

  async init() {
    await this.loadGamesData();
    this.setupEventListeners();
    this.updateStats();
    this.renderGames();
  }

  async loadGamesData() {
    try {
      const response = await fetch("assets/data/games.json");
      this.allGames = await response.json();
      this.filteredGames = [...this.allGames];
    } catch (error) {
      console.error("Error loading games data:", error);
      this.showErrorMessage("Failed to load games data");
    }
  }

  setupEventListeners() {
    // Filter event listeners
    document
      .getElementById("platform-filter")
      .addEventListener("change", (e) => {
        this.filters.platform = e.target.value;
        this.applyFilters();
      });

    document.getElementById("genre-filter").addEventListener("change", (e) => {
      this.filters.genre = e.target.value;
      this.applyFilters();
    });

    document.getElementById("price-filter").addEventListener("change", (e) => {
      this.filters.priceRange = e.target.value;
      this.applyFilters();
    });

    document.getElementById("sort-filter").addEventListener("change", (e) => {
      this.filters.sortBy = e.target.value;
      this.applyFilters();
    });

    // Clear filters button
    document.getElementById("clear-filters").addEventListener("click", () => {
      this.clearAllFilters();
    });

    // View toggle buttons
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchView(e.target.dataset.view);
      });
    });
  }

  applyFilters() {
    this.filteredGames = this.allGames.filter((game) => {
      // Platform filter
      if (
        this.filters.platform &&
        !game.platforms.includes(this.filters.platform)
      ) {
        return false;
      }

      // Genre filter
      if (this.filters.genre && game.genre !== this.filters.genre) {
        return false;
      }

      // Price range filter
      if (this.filters.priceRange) {
        const [min, max] = this.filters.priceRange.split("-").map(Number);
        const currentPrice = game.discountPrice || game.price;

        if (this.filters.priceRange === "60+") {
          if (currentPrice < 60) return false;
        } else if (currentPrice < min || currentPrice > max) {
          return false;
        }
      }

      return true;
    });

    // Apply sorting
    this.sortGames();

    // Reset to first page
    this.currentPage = 1;

    // Update UI
    this.updateStats();
    this.renderGames();
    this.updateActiveFiltersCount();
  }

  sortGames() {
    const sortBy = this.filters.sortBy;

    this.filteredGames.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "price-low":
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case "price-high":
          return (b.discountPrice || b.price) - (a.discountPrice || a.price);
        case "rating":
          return b.rating - a.rating;
        case "release":
          return new Date(b.releaseDate) - new Date(a.releaseDate);
        default:
          return 0;
      }
    });
  }

  clearAllFilters() {
    // Reset filter values
    document.getElementById("platform-filter").value = "";
    document.getElementById("genre-filter").value = "";
    document.getElementById("price-filter").value = "";
    document.getElementById("sort-filter").value = "name";

    // Reset filter state
    this.filters = {
      platform: "",
      genre: "",
      priceRange: "",
      sortBy: "name",
    };

    // Reset games and UI
    this.filteredGames = [...this.allGames];
    this.currentPage = 1;
    this.updateStats();
    this.renderGames();
    this.updateActiveFiltersCount();
  }

  switchView(view) {
    this.currentView = view;

    // Update view buttons
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === view);
    });

    // Update view containers
    document
      .getElementById("games-grid")
      .classList.toggle("active", view === "grid");
    document
      .getElementById("games-list")
      .classList.toggle("active", view === "list");

    // Re-render games with new view
    this.renderGames();
  }

  renderGames() {
    const startIndex = (this.currentPage - 1) * this.gamesPerPage;
    const endIndex = startIndex + this.gamesPerPage;
    const gamesToShow = this.filteredGames.slice(startIndex, endIndex);

    if (this.currentView === "grid") {
      this.renderGridView(gamesToShow);
    } else {
      this.renderListView(gamesToShow);
    }

    this.renderPagination();
    this.updateResultsCount();
  }

  renderGridView(games) {
    const gridContainer = document.getElementById("games-grid");

    if (games.length === 0) {
      gridContainer.innerHTML = this.getEmptyStateHTML();
      return;
    }

    gridContainer.innerHTML = games
      .map((game) => this.createGameCard(game))
      .join("");
    this.attachGameCardEventListeners();
  }

  renderListView(games) {
    const listContainer = document.getElementById("games-list");

    if (games.length === 0) {
      listContainer.innerHTML = this.getEmptyStateHTML();
      return;
    }

    listContainer.innerHTML = games
      .map((game) => this.createGameListItem(game))
      .join("");
    this.attachGameCardEventListeners();
  }

  createGameCard(game) {
    const hasDiscount = game.discountPrice && game.discountPrice < game.price;
    const currentPrice = game.discountPrice || game.price;
    const discountPercentage = hasDiscount
      ? Math.round(((game.price - game.discountPrice) / game.price) * 100)
      : 0;

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
                  ? `<span class="price-original">$${game.price}</span>`
                  : ""
              }
            </div>
          </div>
          <div class="game-card-actions">
            <button class="btn-add-cart" data-game-id="${game.id}">
              Add to Cart
            </button>
            <button class="btn-wishlist" data-game-id="${
              game.id
            }" title="Add to Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  createGameListItem(game) {
    const hasDiscount = game.discountPrice && game.discountPrice < game.price;
    const currentPrice = game.discountPrice || game.price;
    const discountPercentage = hasDiscount
      ? Math.round(((game.price - game.discountPrice) / game.price) * 100)
      : 0;

    return `
      <div class="game-list-item" data-game-id="${game.id}">
        <div class="game-list-image">
          <img src="${game.image}" alt="${game.title}" loading="lazy">
        </div>
        <div class="game-list-content">
          <h3 class="game-list-title">${game.title}</h3>
          <div class="game-list-details">
            <span>${game.genre}</span>
            <span>${game.platforms.join(", ")}</span>
            <span>Rating: ${game.rating}/5</span>
            ${
              hasDiscount
                ? `<span class="discount-badge">-${discountPercentage}%</span>`
                : ""
            }
          </div>
          <div class="game-list-actions">
            <button class="btn-add-cart" data-game-id="${game.id}">
              Add to Cart
            </button>
            <button class="btn-wishlist" data-game-id="${
              game.id
            }" title="Add to Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="game-list-price">
          <span class="price-current">$${currentPrice}</span>
          ${
            hasDiscount
              ? `<span class="price-original">$${game.price}</span>`
              : ""
          }
        </div>
      </div>
    `;
  }

  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHTML = "";

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<span class="star">★</span>';
    }

    // Half star
    if (hasHalfStar) {
      starsHTML += '<span class="star">☆</span>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<span class="star" style="color: #e9ecef;">★</span>';
    }

    return starsHTML;
  }

  getEmptyStateHTML() {
    return `
      <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🎮</div>
        <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #495057;">No games found</h3>
        <p style="color: #6c757d; margin-bottom: 2rem;">Try adjusting your filters to find more games.</p>
        <button class="clear-filters-btn" onclick="document.getElementById('clear-filters').click()">
          Clear All Filters
        </button>
      </div>
    `;
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

    // Wishlist buttons
    document.querySelectorAll(".btn-wishlist").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const gameId = btn.dataset.gameId;
        this.toggleWishlist(gameId, btn);
      });
    });

    // Game card clicks (for navigation to detail page)
    document.querySelectorAll(".game-card, .game-list-item").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (
          !e.target.closest(".btn-add-cart") &&
          !e.target.closest(".btn-wishlist")
        ) {
          const gameId = card.dataset.gameId;
          this.navigateToGameDetail(gameId);
        }
      });
    });
  }

  addToCart(gameId) {
    const game = this.allGames.find((g) => g.id === gameId);
    if (!game) return;

    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem("pixelVaultCart") || "[]");

    // Check if game is already in cart
    const existingItem = cart.find((item) => item.id === gameId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: gameId,
        title: game.title,
        price: game.discountPrice || game.price,
        image: game.image,
        quantity: 1,
      });
    }

    // Save updated cart
    localStorage.setItem("pixelVaultCart", JSON.stringify(cart));

    // Update cart counter in header
    this.updateCartCounter();

    // Show success notification
    this.showNotification("Game added to cart!", "success");
  }

  toggleWishlist(gameId, button) {
    // Get current wishlist from localStorage
    let wishlist = JSON.parse(
      localStorage.getItem("pixelVaultWishlist") || "[]"
    );

    const isInWishlist = wishlist.includes(gameId);

    if (isInWishlist) {
      wishlist = wishlist.filter((id) => id !== gameId);
      button.classList.remove("active");
      this.showNotification("Removed from wishlist", "info");
    } else {
      wishlist.push(gameId);
      button.classList.add("active");
      this.showNotification("Added to wishlist!", "success");
    }

    localStorage.setItem("pixelVaultWishlist", JSON.stringify(wishlist));
  }

  navigateToGameDetail(gameId) {
    window.location.href = `game-detail.html?id=${gameId}`;
  }

  renderPagination() {
    const totalPages = Math.ceil(this.filteredGames.length / this.gamesPerPage);
    const paginationContainer = document.getElementById("pagination");

    if (totalPages <= 1) {
      paginationContainer.innerHTML = "";
      return;
    }

    let paginationHTML = "";

    // Previous button
    paginationHTML += `
      <button class="pagination-btn" ${
        this.currentPage === 1 ? "disabled" : ""
      } data-page="${this.currentPage - 1}">
        ←
      </button>
    `;

    // Page numbers
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, this.currentPage + 2);

    if (startPage > 1) {
      paginationHTML += `<button class="pagination-btn" data-page="1">1</button>`;
      if (startPage > 2) {
        paginationHTML += `<span style="padding: 0 0.5rem;">...</span>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <button class="pagination-btn ${
          i === this.currentPage ? "active" : ""
        }" data-page="${i}">
          ${i}
        </button>
      `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += `<span style="padding: 0 0.5rem;">...</span>`;
      }
      paginationHTML += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    // Next button
    paginationHTML += `
      <button class="pagination-btn" ${
        this.currentPage === totalPages ? "disabled" : ""
      } data-page="${this.currentPage + 1}">
        →
      </button>
    `;

    paginationContainer.innerHTML = paginationHTML;

    // Add event listeners to pagination buttons
    paginationContainer.querySelectorAll(".pagination-btn").forEach((btn) => {
      if (!btn.disabled) {
        btn.addEventListener("click", () => {
          this.currentPage = parseInt(btn.dataset.page);
          this.renderGames();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      }
    });
  }

  updateStats() {
    document.getElementById("total-games").textContent = this.allGames.length;
  }

  updateActiveFiltersCount() {
    const activeFilters = Object.values(this.filters).filter(
      (value) => value !== ""
    ).length;
    document.getElementById("active-filters").textContent = activeFilters;
  }

  updateResultsCount() {
    document.getElementById("results-count").textContent =
      this.filteredGames.length;
  }

  updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem("pixelVaultCart") || "[]");
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const cartCounter = document.querySelector(".cart-counter");
    if (cartCounter) {
      cartCounter.textContent = totalItems;
      cartCounter.style.display = totalItems > 0 ? "block" : "none";
    }
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
          ? "#28a745"
          : type === "error"
          ? "#dc3545"
          : "#17a2b8"
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

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  showErrorMessage(message) {
    this.showNotification(message, "error");
  }
}

// Initialize catalog manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new GameCatalogManager();
});
