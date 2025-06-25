// Footer Injection Module
class FooterInjector {
  constructor() {
    this.footerContainer = document.getElementById("footer-container");
    this.footerTemplate = null;
    this.isInitialized = false;
  }

  async initializeFooter() {
    try {
      await this.fetchFooterTemplate();
      this.injectFooter();
      this.setupFooterFunctionality();
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize footer:", error);
    }
  }

  async fetchFooterTemplate() {
    const response = await fetch("/components/footer.html");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    this.footerTemplate = await response.text();
  }

  injectFooter() {
    if (this.footerContainer && this.footerTemplate) {
      this.footerContainer.innerHTML = this.footerTemplate;
    }
  }

  setupFooterFunctionality() {
    this.setupNewsletterForm();
    this.setupSocialLinks();
    this.setupFooterLinks();
  }

  setupNewsletterForm() {
    const newsletterForm = document.getElementById("newsletter-form");
    if (!newsletterForm) return;

    newsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.handleNewsletterSubmission(newsletterForm);
    });

    // Real-time email validation
    const emailInput = newsletterForm.querySelector(".newsletter-input");
    if (emailInput) {
      emailInput.addEventListener("input", () => {
        this.validateEmailInput(emailInput);
      });
    }
  }

  validateEmailInput(input) {
    const email = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    input.classList.remove("error", "success");

    if (email === "") {
      return;
    }

    if (emailRegex.test(email)) {
      input.classList.add("success");
    } else {
      input.classList.add("error");
    }
  }

  async handleNewsletterSubmission(form) {
    const emailInput = form.querySelector(".newsletter-input");
    const email = emailInput.value.trim();

    if (!this.isValidEmail(email)) {
      this.showNewsletterError("Please enter a valid email address");
      return;
    }

    try {
      // Simulate API call
      await this.simulateNewsletterSignup(email);
      this.showNewsletterSuccess("Thank you for subscribing!");
      form.reset();
      emailInput.classList.remove("error", "success");
    } catch (error) {
      this.showNewsletterError("Something went wrong. Please try again.");
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async simulateNewsletterSignup(email) {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Store in localStorage for demo purposes
        const subscribers = JSON.parse(
          localStorage.getItem("newsletter_subscribers") || "[]"
        );
        if (!subscribers.includes(email)) {
          subscribers.push(email);
          localStorage.setItem(
            "newsletter_subscribers",
            JSON.stringify(subscribers)
          );
        }
        resolve();
      }, 1000);
    });
  }

  showNewsletterSuccess(message) {
    this.showNewsletterMessage(message, "success");
  }

  showNewsletterError(message) {
    this.showNewsletterMessage(message, "error");
  }

  showNewsletterMessage(message, type) {
    const form = document.getElementById("newsletter-form");
    if (!form) return;

    // Remove existing message
    const existingMessage = form.querySelector(".newsletter-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create new message
    const messageElement = document.createElement("div");
    messageElement.className = `newsletter-message ${type}`;
    messageElement.textContent = message;

    if (type === "success") {
      messageElement.classList.add("newsletter-success");
    }

    form.appendChild(messageElement);

    // Remove message after 5 seconds
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, 5000);
  }

  setupSocialLinks() {
    const socialLinks = document.querySelectorAll(".social-link");

    socialLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        // Add tracking or analytics here
        console.log(`Social link clicked: ${link.getAttribute("aria-label")}`);
      });
    });
  }

  setupFooterLinks() {
    const footerLinks = document.querySelectorAll(".footer-links a");

    footerLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        // Add smooth scrolling for internal links
        const href = link.getAttribute("href");
        if (href.startsWith("#")) {
          event.preventDefault();
          this.smoothScrollTo(href);
        }
      });
    });
  }

  smoothScrollTo(targetId) {
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  // Utility method to get newsletter subscribers count
  getNewsletterSubscribersCount() {
    const subscribers = JSON.parse(
      localStorage.getItem("newsletter_subscribers") || "[]"
    );
    return subscribers.length;
  }

  // Method to clear newsletter data (for testing)
  clearNewsletterData() {
    localStorage.removeItem("newsletter_subscribers");
  }
}

// Initialize footer when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const footerInjector = new FooterInjector();
  footerInjector.initializeFooter();

  // Make it globally available
  window.footerInjector = footerInjector;
});

export default FooterInjector;
