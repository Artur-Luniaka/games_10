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
      this.showError("No cart data found. Please return to your cart.");
      return;
    }

    this.cart = JSON.parse(cartData);
    if (this.cart.length === 0) {
      this.showError("Cart is empty. Please return to your cart.");
      return;
    }
  }

  setupEventListeners() {
    // Payment method radio buttons
    document.querySelectorAll(".payment-radio").forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.togglePaymentForm(e.target.value);
      });
    });

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

    // Card number formatting
    const cardNumberInput = document.getElementById("card-number");
    cardNumberInput.addEventListener("input", (e) => {
      this.formatCardNumber(e.target);
    });

    // Expiry date formatting
    const expiryInput = document.getElementById("expiry");
    expiryInput.addEventListener("input", (e) => {
      this.formatExpiryDate(e.target);
    });

    // CVV validation
    const cvvInput = document.getElementById("cvv");
    cvvInput.addEventListener("input", (e) => {
      this.validateCVV(e.target);
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

  formatCardNumber(input) {
    let value = input.value.replace(/\D/g, "");
    value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    input.value = value;
  }

  formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    input.value = value;
  }

  validateCVV(input) {
    let value = input.value.replace(/\D/g, "");
    input.value = value;
  }

  togglePaymentForm(paymentMethod) {
    const creditCardForm = document.getElementById("credit-card-form");

    if (paymentMethod === "credit-card") {
      creditCardForm.style.display = "block";
    } else {
      creditCardForm.style.display = "none";
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
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "address",
      "city",
      "state",
      "zip",
      "country",
    ];

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

    // Payment method validation
    const paymentMethod = formData.get("paymentMethod");
    if (paymentMethod === "credit-card") {
      const cardFields = ["cardNumber", "expiry", "cvv", "cardName"];
      cardFields.forEach((field) => {
        const value = formData.get(field);
        if (!value || value.trim() === "") {
          errors.push(
            `${field.replace(/([A-Z])/g, " $1").toLowerCase()} is required`
          );
        }
      });

      // Card number validation
      const cardNumber = formData.get("cardNumber").replace(/\s/g, "");
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        errors.push("Please enter a valid card number");
      }

      // Expiry date validation
      const expiry = formData.get("expiry");
      if (expiry && !this.validateExpiryDate(expiry)) {
        errors.push("Please enter a valid expiry date");
      }

      // CVV validation
      const cvv = formData.get("cvv");
      if (cvv && (cvv.length < 3 || cvv.length > 4)) {
        errors.push("Please enter a valid CVV");
      }
    }

    // Terms agreement validation
    const terms = formData.get("terms");
    if (!terms) {
      errors.push("You must agree to the Terms of Service and Privacy Policy");
    }

    return errors;
  }

  validateExpiryDate(expiry) {
    const [month, year] = expiry.split("/");
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expMonth = parseInt(month);
    const expYear = parseInt(year);

    if (expMonth < 1 || expMonth > 12) return false;
    if (
      expYear < currentYear ||
      (expYear === currentYear && expMonth < currentMonth)
    )
      return false;

    return true;
  }

  async processOrder() {
    const errors = this.validateForm();

    if (errors.length > 0) {
      this.showError(errors.join("\n"));
      return;
    }

    const orderButton = document.getElementById("btn-place-order");
    orderButton.disabled = true;
    orderButton.classList.add("loading");
    orderButton.querySelector(".btn-text").textContent = "Processing...";

    try {
      // Simulate payment processing
      await this.simulatePaymentProcessing();

      // Generate order confirmation
      const orderNumber = this.generateOrderNumber();
      const orderData = this.collectOrderData(orderNumber);

      // Store order data
      this.saveOrderData(orderData);

      // Clear cart
      this.clearCart();

      // Show success and redirect
      this.showSuccess("Order placed successfully!");
      setTimeout(() => {
        window.location.href = `order-confirmation.html?order=${orderNumber}`;
      }, 2000);
    } catch (error) {
      this.showError("Payment processing failed. Please try again.");
      orderButton.disabled = false;
      orderButton.classList.remove("loading");
      orderButton.querySelector(".btn-text").textContent = "Place Order";
    }
  }

  async simulatePaymentProcessing() {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        // Simulate 95% success rate
        if (Math.random() > 0.05) {
          resolve();
        } else {
          reject(new Error("Payment failed"));
        }
      }, 2000);
    });
  }

  generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `PV-${timestamp}-${random}`;
  }

  collectOrderData(orderNumber) {
    const form = document.getElementById("checkout-form");
    const formData = new FormData(form);

    const orderData = {
      orderNumber: orderNumber,
      orderDate: new Date().toISOString(),
      customer: {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        address: {
          street: formData.get("address"),
          city: formData.get("city"),
          state: formData.get("state"),
          zip: formData.get("zip"),
          country: formData.get("country"),
        },
      },
      payment: {
        method: formData.get("paymentMethod"),
        cardNumber: formData.get("cardNumber")
          ? formData.get("cardNumber").replace(/\s/g, "").slice(-4)
          : null,
        cardName: formData.get("cardName"),
      },
      items: this.cart,
      subtotal: this.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      tax:
        this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0) *
        this.taxRate,
      total:
        this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0) *
        (1 + this.taxRate),
      notes: formData.get("notes"),
      newsletter: formData.get("newsletter") === "on",
    };

    return orderData;
  }

  saveOrderData(orderData) {
    // Store order in localStorage (in a real app, this would be sent to a server)
    const orders = JSON.parse(localStorage.getItem("pixelVaultOrders") || "[]");
    orders.push(orderData);
    localStorage.setItem("pixelVaultOrders", JSON.stringify(orders));
  }

  clearCart() {
    localStorage.removeItem("pixelVaultCart");
    sessionStorage.removeItem("checkoutCart");
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
      max-width: 400px;
      white-space: pre-line;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Remove after 5 seconds for errors, 3 seconds for others
    const duration = type === "error" ? 5000 : 3000;
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, duration);
  }

  showError(message) {
    this.showNotification(message, "error");
  }

  showSuccess(message) {
    this.showNotification(message, "success");
  }
}

// Initialize checkout manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new CheckoutManager();
});
