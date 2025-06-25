/**
 * Cookie Consent Manager
 * Handles cookie consent banner with localStorage persistence
 */
export class CookieConsentManager {
  constructor() {
    this.cookieBar = document.getElementById("cookie-consent");
    this.acceptBtn = document.getElementById("cookie-accept");
    this.storageKey = "playthestackedthrill_cookie_consent";

    this.init();
  }

  init() {
    // Check if user has already accepted cookies
    if (this.hasUserConsented()) {
      return;
    }

    // Show cookie bar after a short delay
    setTimeout(() => {
      this.showCookieBar();
    }, 1000);

    // Add event listener to accept button
    if (this.acceptBtn) {
      this.acceptBtn.addEventListener("click", () => {
        this.acceptCookies();
      });
    }
  }

  hasUserConsented() {
    try {
      return localStorage.getItem(this.storageKey) === "accepted";
    } catch (error) {
      console.warn("Could not access localStorage:", error);
      return false;
    }
  }

  showCookieBar() {
    if (this.cookieBar) {
      this.cookieBar.classList.add("show");
    }
  }

  hideCookieBar() {
    if (this.cookieBar) {
      this.cookieBar.classList.remove("show");
    }
  }

  acceptCookies() {
    try {
      // Save consent to localStorage
      localStorage.setItem(this.storageKey, "accepted");

      // Hide cookie bar with animation
      this.hideCookieBar();

      // Remove from DOM after animation
      setTimeout(() => {
        if (this.cookieBar && this.cookieBar.parentNode) {
          this.cookieBar.parentNode.removeChild(this.cookieBar);
        }
      }, 300);
    } catch (error) {
      console.warn("Could not save cookie consent:", error);
      // Still hide the bar even if localStorage fails
      this.hideCookieBar();
    }
  }
}
