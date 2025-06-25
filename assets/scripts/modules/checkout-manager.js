import { showNotification } from "./notification.js";

// Checkout Manager Module
class CheckoutManager {
  constructor() {
    this.cart = [];
    this.taxRate = 0.08; // 8% tax rate
    this.formData = {};

    this.init();
  }

  async init() {
    this.loadCartData();
    this.setupEventListeners();
    this.renderOrderSummary();
    this.setupFormValidation();
  }

  loadCartData() {
    const cartData = sessionStorage.getItem("checkoutCart");
    if (!cartData) {
      this.showNotification(
        "No cart data found. Please return to your cart.",
        "error"
      );
      return;
    }

    this.cart = JSON.parse(cartData);
    if (this.cart.length === 0) {
      this.showNotification(
        "Cart is empty. Please return to your cart.",
        "error"
      );
      return;
    }
  }

  setupEventListeners() {
    // Place order button
    document
      .getElementById("btn-place-order")
      .addEventListener("click", (e) => {
        e.preventDefault();
        this.processOrder();
      });

    // Form input validation
    this.setupInputValidation();
  }

  setupInputValidation() {
    // Email validation
    const emailInput = document.getElementById("email");
    emailInput.addEventListener("blur", () => {
      this.validateEmail(emailInput.value);
    });
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailError = document.getElementById("email-error");
    const emailInput = document.getElementById("email");

    if (!emailRegex.test(email)) {
      emailError.textContent = "Please enter a valid email address";
      emailInput.classList.add("error");
      emailInput.classList.remove("success");
      return false;
    } else {
      emailError.textContent = "";
      emailInput.classList.remove("error");
      emailInput.classList.add("success");
      return true;
    }
  }

  renderOrderSummary() {
    const orderItems = document.getElementById("order-items");
    const subtotalEl = document.getElementById("subtotal");
    const taxEl = document.getElementById("tax");
    const totalEl = document.getElementById("total");

    // Render order items
    orderItems.innerHTML = this.cart
      .map(
        (item) => `
      <div class="order-item">
        <div class="order-item-info">
          <div class="order-item-image">
            <img src="${item.image}" alt="${item.title}" loading="lazy">
          </div>
          <div class="order-item-details">
            <div class="order-item-title">${item.title}</div>
            <div class="order-item-quantity">Quantity: ${item.quantity}</div>
          </div>
        </div>
        <div class="order-item-price">$${(item.price * item.quantity).toFixed(
          2
        )}</div>
      </div>
    `
      )
      .join("");

    // Calculate totals
    const subtotal = this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * this.taxRate;
    const total = subtotal + tax;

    // Update totals
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
  }

  validateForm() {
    const form = document.getElementById("checkout-form");
    const formData = new FormData(form);
    const errors = [];

    // Required fields validation
    const requiredFields = ["firstName", "lastName", "email"];

    requiredFields.forEach((field) => {
      const value = formData.get(field);
      if (!value || value.trim() === "") {
        errors.push(
          `${field.replace(/([A-Z])/g, " $1").toLowerCase()} is required`
        );
      }
    });

    // Email validation
    const email = formData.get("email");
    if (email && !this.validateEmail(email)) {
      errors.push("Please enter a valid email address");
    }

    return errors;
  }

  async processOrder() {
    const errors = this.validateForm();
    if (errors.length > 0) {
      showNotification(errors.join("\n"), "error");
      return;
    }

    // Show loading state
    const orderButton = document.getElementById("btn-place-order");
    orderButton.disabled = true;
    orderButton.querySelector(".btn-text").textContent = "Processing...";

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Success notification (как при добавлении в корзину)
      showNotification(
        "Order placed successfully! Thank you for your purchase.",
        "success"
      );
      this.clearCart();

      setTimeout(() => {
        window.location.href = "./";
      }, 1400);
    } catch (error) {
      showNotification("Order processing failed. Please try again.", "error");
      orderButton.disabled = false;
      orderButton.querySelector(".btn-text").textContent = "Place Order";
    }
  }

  clearCart() {
    localStorage.removeItem("pixelVaultCart");
    sessionStorage.removeItem("checkoutCart");
  }
}

// Initialize checkout manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new CheckoutManager();
});

export default CheckoutManager;
