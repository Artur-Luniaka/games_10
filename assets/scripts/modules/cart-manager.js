// Cart Manager Module
class CartManager {
  constructor() {
    this.cart = [];
    this.allGames = [];
    this.taxRate = 0.08; // 8% tax rate

    this.init();
  }

  async init() {
    await this.loadGamesData();
    this.loadCart();
    this.setupEventListeners();
    this.renderCart();
    this.loadRecommendedGames();
  }

  async loadGamesData() {
    try {
      const response = await fetch("assets/data/games.json");
      const data = await response.json();
      this.allGames = data.games || [];
    } catch (error) {
      console.error("Error loading games data:", error);
      this.showError("Failed to load games data");
    }
  }

  loadCart() {
    const cartData = localStorage.getItem("pixelVaultCart");
    this.cart = cartData ? JSON.parse(cartData) : [];
  }

  saveCart() {
    localStorage.setItem("pixelVaultCart", JSON.stringify(this.cart));
    this.updateCartCounter();
    if (
      window.headerInjector &&
      typeof window.headerInjector.syncCartCounter === "function"
    ) {
      window.headerInjector.syncCartCounter();
    }
  }

  setupEventListeners() {
    // Clear cart button
    document.getElementById("btn-clear-cart").addEventListener("click", () => {
      this.clearCart();
    });

    // Checkout button
    document.getElementById("btn-checkout").addEventListener("click", () => {
      this.proceedToCheckout();
    });
  }

  renderCart() {
    const container = document.getElementById("cart-items-container");
    const itemsCount = document.getElementById("items-count");
    const checkoutBtn = document.getElementById("btn-checkout");

    if (this.cart.length === 0) {
      container.innerHTML = this.getEmptyCartHTML();
      itemsCount.textContent = "0 items";
      checkoutBtn.disabled = true;
      this.updateSummary();
      return;
    }

    itemsCount.textContent = `${this.cart.length} item${
      this.cart.length !== 1 ? "s" : ""
    }`;
    checkoutBtn.disabled = false;

    container.innerHTML = this.cart
      .map((item, index) => this.createCartItemHTML(item, index))
      .join("");

    this.attachCartItemEventListeners();
    this.updateSummary();
  }

  createCartItemHTML(item, index) {
    const game = this.allGames.find((g) => g.id === item.id);
    if (!game) return "";

    return `
      <div class="cart-item" data-index="${index}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.title}" loading="lazy">
        </div>
        <div class="cart-item-details">
          <h3 class="cart-item-title">${item.title}</h3>
          <div class="cart-item-price">$${item.price}</div>
        </div>
        <div class="cart-item-quantity">
          <div class="quantity-controls">
            <button class="quantity-btn" data-action="decrease" ${
              item.quantity <= 1 ? "disabled" : ""
            }>-</button>
            <input type="number" class="quantity-input" value="${
              item.quantity
            }" min="1" max="99">
            <button class="quantity-btn" data-action="increase">+</button>
          </div>
        </div>
        <div class="cart-item-total">$${(item.price * item.quantity).toFixed(
          2
        )}</div>
        <button class="cart-item-remove" data-index="${index}">×</button>
      </div>
    `;
  }

  getEmptyCartHTML() {
    return `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3 class="empty-cart-title">Your cart is empty</h3>
        <p class="empty-cart-text">Looks like you haven't added any games to your cart yet.</p>
        <button class="btn-start-shopping" onclick="window.location.href='catalog.html'">
          Start Shopping
        </button>
      </div>
    `;
  }

  attachCartItemEventListeners() {
    // Quantity buttons
    document.querySelectorAll(".quantity-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = e.target.dataset.action;
        const itemIndex = parseInt(
          e.target.closest(".cart-item").dataset.index
        );
        this.updateQuantity(itemIndex, action);
      });
    });

    // Quantity input
    document.querySelectorAll(".quantity-input").forEach((input) => {
      input.addEventListener("change", (e) => {
        const itemIndex = parseInt(
          e.target.closest(".cart-item").dataset.index
        );
        const newQuantity = parseInt(e.target.value);
        this.setQuantity(itemIndex, newQuantity);
      });
    });

    // Remove buttons
    document.querySelectorAll(".cart-item-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemIndex = parseInt(e.target.dataset.index);
        this.removeItem(itemIndex);
      });
    });
  }

  updateQuantity(itemIndex, action) {
    if (itemIndex < 0 || itemIndex >= this.cart.length) return;

    const item = this.cart[itemIndex];

    if (action === "increase") {
      item.quantity = Math.min(99, item.quantity + 1);
    } else if (action === "decrease") {
      item.quantity = Math.max(1, item.quantity - 1);
    }

    this.saveCart();
    this.renderCart();
  }

  setQuantity(itemIndex, quantity) {
    if (itemIndex < 0 || itemIndex >= this.cart.length) return;
    if (quantity < 1 || quantity > 99) return;

    this.cart[itemIndex].quantity = quantity;
    this.saveCart();
    this.renderCart();
  }

  removeItem(itemIndex) {
    if (itemIndex < 0 || itemIndex >= this.cart.length) return;

    const removedItem = this.cart[itemIndex];
    this.cart.splice(itemIndex, 1);
    this.saveCart();
    this.renderCart();

    this.showNotification(`Removed ${removedItem.title} from cart`, "info");
  }

  clearCart() {
    if (this.cart.length === 0) return;

    this.cart = [];
    this.saveCart();
    this.renderCart();
    this.showNotification("Cart cleared", "info");
  }

  updateSummary() {
    const summaryItems = document.getElementById("summary-items");
    const subtotalEl = document.getElementById("subtotal");
    const taxEl = document.getElementById("tax");
    const totalEl = document.getElementById("total");

    if (this.cart.length === 0) {
      summaryItems.innerHTML =
        '<div class="summary-item"><span class="summary-item-label">No items</span><span class="summary-item-value">$0.00</span></div>';
      subtotalEl.textContent = "$0.00";
      taxEl.textContent = "$0.00";
      totalEl.textContent = "$0.00";
      return;
    }

    // Calculate totals
    const subtotal = this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * this.taxRate;
    const total = subtotal + tax;

    // Update summary items
    summaryItems.innerHTML = this.cart
      .map(
        (item) => `
      <div class="summary-item">
        <span class="summary-item-label">${item.title} (${item.quantity})</span>
        <span class="summary-item-value">$${(
          item.price * item.quantity
        ).toFixed(2)}</span>
      </div>
    `
      )
      .join("");

    // Update totals
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
  }

  updateCartCounter() {
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);

    const cartCounter = document.querySelector(".cart-counter");
    if (cartCounter) {
      cartCounter.textContent = totalItems;
      cartCounter.style.display = totalItems > 0 ? "block" : "none";
    }
  }

  proceedToCheckout() {
    if (this.cart.length === 0) {
      this.showError("Cart is empty");
      return;
    }

    // Store cart data for checkout page
    sessionStorage.setItem("checkoutCart", JSON.stringify(this.cart));
    window.location.href = "checkout.html";
  }

  async loadRecommendedGames() {
    try {
      // Get games that are not in the cart
      const cartGameIds = this.cart.map((item) => item.id);
      const availableGames = this.allGames.filter(
        (game) => !cartGameIds.includes(game.id)
      );

      // Randomly select 4 games for recommendations
      const recommendedGames = this.shuffleArray(availableGames).slice(0, 4);

      this.renderRecommendedGames(recommendedGames);
    } catch (error) {
      console.error("Error loading recommended games:", error);
    }
  }

  renderRecommendedGames(games) {
    const container = document.getElementById("recommended-grid");

    if (games.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; color: #6c757d; grid-column: 1 / -1;">No recommendations available</p>';
      return;
    }

    container.innerHTML = games
      .map(
        (game) => `
      <div class="recommended-item" onclick="window.location.href='game-detail.html?id=${
        game.id
      }'">
        <div class="recommended-image">
          <img src="${game.image}" alt="${game.title}" loading="lazy">
        </div>
        <h4 class="recommended-title">${game.title}</h4>
        <div class="recommended-price">$${
          game.discountPrice || game.price
        }</div>
      </div>
    `
      )
      .join("");
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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

  showError(message) {
    this.showNotification(message, "error");
  }
}

// Initialize cart manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new CartManager();
});
