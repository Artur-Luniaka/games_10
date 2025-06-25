// Header Injection Module
class NavigationInjector {
  constructor() {
    this.headerContainer = document.getElementById("header-container");
    this.headerTemplate = null;
    this.isInitialized = false;
  }

  async initializeNavigation() {
    try {
      await this.fetchHeaderTemplate();
      this.injectHeader();
      this.setupCartButton();
      this.setupScrollEffects();
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize header:", error);
    }
  }

  async fetchHeaderTemplate() {
    const response = await fetch("components/header.html");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    this.headerTemplate = await response.text();
  }

  injectHeader() {
    if (this.headerContainer && this.headerTemplate) {
      this.headerContainer.innerHTML = this.headerTemplate;
      window.dispatchEvent(new Event("header-ready"));
      this.syncCartCounter();
    }
  }

  setupCartButton() {
    const cartButton = document.getElementById("cart-btn");
    if (cartButton) {
      cartButton.addEventListener("click", () => {
        this.handleCartClick();
      });
    }
  }

  setupScrollEffects() {
    let lastScrollTop = 0;
    const header = document.querySelector(".site-header");
    if (!header) return;
    window.addEventListener("scroll", () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        header.style.transform = "translateY(-100%)";
      } else {
        header.style.transform = "translateY(0)";
      }
      lastScrollTop = scrollTop;
    });
  }

  handleCartClick() {
    window.location.href = "cart.html";
  }

  syncCartCounter() {
    const cart = JSON.parse(localStorage.getItem("pixelVaultCart") || "[]");
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCounter = document.querySelector(".cart-count, .cart-counter");
    if (cartCounter) {
      cartCounter.textContent = totalItems;
      cartCounter.style.display = totalItems > 0 ? "block" : "none";
    }
  }
}

// Initialize header when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const headerInjector = new NavigationInjector();
  headerInjector.initializeNavigation();

  // Make it globally available for cart updates
  window.headerInjector = headerInjector;
});

export default NavigationInjector;
