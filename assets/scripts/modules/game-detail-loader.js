import { showNotification } from "./notification.js";
// Game Detail Loader - Minimal Version
class GameDetailLoader {
  constructor() {
    this.gameId = null;
    this.gameData = null;
    this.allGames = [];
    this.init();
  }

  async init() {
    this.gameId = this.getGameIdFromUrl();
    if (!this.gameId) {
      this.showError("Game ID not found");
      return;
    }
    await this.loadGamesData();
    this.loadGameDetails();
    this.setupEventListeners();
  }

  getGameIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  async loadGamesData() {
    try {
      const response = await fetch("assets/data/games.json");
      const data = await response.json();
      this.allGames = data.games;
    } catch (error) {
      this.showError("Failed to load games data");
    }
  }

  loadGameDetails() {
    this.gameData = this.allGames.find((game) => game.id === this.gameId);
    if (!this.gameData) {
      this.showError("Game not found");
      return;
    }
    // Title & Breadcrumb
    document.title = `${this.gameData.title} - PixelVault`;
    document.getElementById("game-title").textContent = this.gameData.title;
    document.getElementById("game-detail-title").textContent =
      this.gameData.title;
    // Image
    const img = document.getElementById("game-main-image");
    img.src = this.gameData.image;
    img.alt = this.gameData.alt || this.gameData.title;
    // Rating
    document.getElementById("game-rating-stars").innerHTML = this.generateStars(
      this.gameData.rating
    );
    document.getElementById(
      "game-rating-text"
    ).textContent = `${this.gameData.rating}/5`;
    // Release date
    const releaseDate = new Date(this.gameData.releaseDate).toLocaleDateString(
      "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );
    document.getElementById("game-release-date").textContent = releaseDate;
    // Description
    document.getElementById("game-description").textContent =
      this.gameData.description;
    // Genre & Platforms
    document.getElementById("game-genre").textContent = this.gameData.genre;
    document.getElementById("game-platforms").textContent =
      this.gameData.platforms.join(", ");
    // Price, discount
    const price = this.gameData.price;
    const original = this.gameData.originalPrice;
    const discount = this.gameData.discount;
    document.getElementById("current-price").textContent = `$${price.toFixed(
      2
    )}`;
    if (discount && original > price) {
      document.getElementById(
        "original-price"
      ).textContent = `$${original.toFixed(2)}`;
      document.getElementById("discount-badge").textContent = `-${discount}%`;
      document.getElementById("discount-badge").style.display = "inline-block";
      document.getElementById("game-badge").textContent = `-${discount}%`;
      document.getElementById("game-badge").style.display = "block";
    } else {
      document.getElementById("original-price").textContent = "";
      document.getElementById("discount-badge").textContent = "";
      document.getElementById("discount-badge").style.display = "none";
      document.getElementById("game-badge").textContent = "";
      document.getElementById("game-badge").style.display = "none";
    }
  }

  setupEventListeners() {
    document.getElementById("btn-purchase").addEventListener("click", () => {
      this.addToCart();
    });
  }

  addToCart() {
    let cart = JSON.parse(localStorage.getItem("pixelVaultCart") || "[]");
    const existingItem = cart.find((item) => item.id === this.gameData.id);
    const price =
      this.gameData.discount && this.gameData.discount > 0
        ? (this.gameData.price * (1 - this.gameData.discount / 100)).toFixed(
            2
          ) * 1
        : this.gameData.price;
    if (existingItem) {
      if (existingItem.quantity < 99) {
        existingItem.quantity += 1;
        showNotification("Game already in cart! Quantity increased.", "info");
      } else {
        showNotification("Maximum quantity reached in cart!", "info");
      }
    } else {
      cart.push({
        id: this.gameData.id,
        title: this.gameData.title,
        price: price,
        image: this.gameData.image,
        quantity: 1,
      });
      showNotification("Game added to cart!", "success");
    }
    localStorage.setItem("pixelVaultCart", JSON.stringify(cart));
    // Обновить счетчик корзины через headerInjector
    if (
      window.headerInjector &&
      typeof window.headerInjector.syncCartCounter === "function"
    ) {
      window.headerInjector.syncCartCounter();
    }
  }

  generateStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      '<span class="star full">★</span>'.repeat(full) +
      '<span class="star half">★</span>'.repeat(half) +
      '<span class="star empty">★</span>'.repeat(empty)
    );
  }

  showError(message) {
    alert(message);
  }
}

window.addEventListener("DOMContentLoaded", () => new GameDetailLoader());
