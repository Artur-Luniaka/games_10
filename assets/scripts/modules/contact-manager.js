/**
 * Contact Manager Module
 * Handles contact form functionality, validation, and submission
 */

import { showNotification } from "./notification.js";

class ContactManager {
  constructor() {
    this.form = null;
    this.emailInput = null;
    this.emailError = null;
    this.isSubmitting = false;

    this.init();
  }

  init() {
    this.form = document.getElementById("contact-form");
    this.emailInput = document.getElementById("email");
    this.emailError = document.getElementById("email-error");

    if (this.form) {
      this.setupEventListeners();
      this.setupFormValidation();
    }
  }

  setupEventListeners() {
    // Email validation on input
    this.emailInput.addEventListener("input", () => {
      this.validateEmail();
    });

    // Email validation on blur
    this.emailInput.addEventListener("blur", () => {
      this.validateEmail();
    });

    // Form submission
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmission();
    });

    // Real-time validation for other fields
    const requiredFields = this.form.querySelectorAll(
      "input[required], select[required], textarea[required]"
    );
    requiredFields.forEach((field) => {
      field.addEventListener("blur", () => {
        this.validateField(field);
      });
    });
  }

  setupFormValidation() {
    // Add custom validation attributes
    this.emailInput.setAttribute("data-validation", "email");

    // Add visual feedback classes
    const formGroups = this.form.querySelectorAll(".form-group");
    formGroups.forEach((group) => {
      group.classList.add("validation-enabled");
    });
  }

  validateEmail() {
    const email = this.emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      this.showEmailError("Email address is required");
      return false;
    }

    if (!emailRegex.test(email)) {
      this.showEmailError("Please enter a valid email address");
      return false;
    }

    // Check for common email providers
    const validDomains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "icloud.com",
      "protonmail.com",
      "aol.com",
      "live.com",
    ];

    const domain = email.split("@")[1];
    if (domain && !validDomains.includes(domain.toLowerCase())) {
      this.showEmailError("Please use a valid email provider");
      return false;
    }

    this.clearEmailError();
    return true;
  }

  validateField(field) {
    const value = field.value.trim();
    const isRequired = field.hasAttribute("required");
    const fieldGroup = field.closest(".form-group");

    if (isRequired && !value) {
      this.showFieldError(field, "This field is required");
      return false;
    }

    // Special validation for specific fields
    if (field.type === "tel") {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (value && !phoneRegex.test(value.replace(/\s/g, ""))) {
        this.showFieldError(field, "Please enter a valid phone number");
        return false;
      }
    }

    this.clearFieldError(field);
    return true;
  }

  showEmailError(message) {
    this.emailError.textContent = message;
    this.emailError.style.display = "block";
    this.emailInput.classList.add("error");
  }

  clearEmailError() {
    this.emailError.textContent = "";
    this.emailError.style.display = "none";
    this.emailInput.classList.remove("error");
  }

  showFieldError(field, message) {
    const fieldGroup = field.closest(".form-group");
    let errorElement = fieldGroup.querySelector(".field-error");

    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "field-error";
      fieldGroup.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.style.display = "block";
    field.classList.add("error");
  }

  clearFieldError(field) {
    const fieldGroup = field.closest(".form-group");
    const errorElement = fieldGroup.querySelector(".field-error");

    if (errorElement) {
      errorElement.style.display = "none";
    }

    field.classList.remove("error");
  }

  validateForm() {
    let isValid = true;

    // Validate email
    if (!this.validateEmail()) {
      isValid = false;
    }

    // Validate all required fields
    const requiredFields = this.form.querySelectorAll(
      "input[required], select[required], textarea[required]"
    );
    requiredFields.forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  async handleFormSubmission() {
    if (this.isSubmitting) return;

    // Валидация только для визуала, не блокирует отправку
    this.validateForm();

    this.isSubmitting = true;
    this.showLoadingState();

    try {
      // Симуляция отправки
      await this.simulateSubmission();

      showNotification(
        "Message sent successfully! We'll get back to you soon.",
        "success"
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      this.resetForm();
    } catch (error) {
      showNotification("Failed to send message. Please try again.", "error");
    } finally {
      this.isSubmitting = false;
      this.hideLoadingState();
    }
  }

  async simulateSubmission() {
    // Simulate API call delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error("Network error"));
        }
      }, 2000);
    });
  }

  showLoadingState() {
    const submitBtn = this.form.querySelector(".btn-submit");
    const btnText = submitBtn.querySelector(".btn-text");
    const btnIcon = submitBtn.querySelector(".btn-icon");

    submitBtn.disabled = true;
    btnText.textContent = "Sending...";
    btnIcon.textContent = "⏳";
  }

  hideLoadingState() {
    const submitBtn = this.form.querySelector(".btn-submit");
    const btnText = submitBtn.querySelector(".btn-text");
    const btnIcon = submitBtn.querySelector(".btn-icon");

    submitBtn.disabled = false;
    btnText.textContent = "Send Message";
    btnIcon.textContent = "→";
  }

  resetForm() {
    this.form.reset();
    this.clearEmailError();

    // Clear any field errors
    const errorElements = this.form.querySelectorAll(".field-error");
    errorElements.forEach((error) => {
      error.style.display = "none";
    });

    // Remove error classes
    const errorFields = this.form.querySelectorAll(".error");
    errorFields.forEach((field) => {
      field.classList.remove("error");
    });
  }

  // Newsletter subscription handling
  setupNewsletterSubscription() {
    const newsletterForm = document.getElementById("newsletter-form");
    if (newsletterForm) {
      newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleNewsletterSubscription(newsletterForm);
      });
    }
  }

  async handleNewsletterSubscription(form) {
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput.value.trim();

    if (!this.validateEmail(email)) {
      this.showNotification("Please enter a valid email address", "error");
      return;
    }

    try {
      // Simulate newsletter subscription
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.showNotification(
        "Successfully subscribed to newsletter!",
        "success"
      );
      form.reset();
    } catch (error) {
      this.showNotification("Failed to subscribe. Please try again.", "error");
    }
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Initialize contact manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ContactManager();
});

export default ContactManager;
