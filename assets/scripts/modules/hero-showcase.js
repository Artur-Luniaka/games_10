// Hero Showcase Module
class HeroShowcase {
  constructor() {
    this.sliderContainer = document.querySelector(".hero-slider-track");
    this.slides = [];
    this.currentSlideIndex = 0;
    this.slideInterval = null;
    this.slideDuration = 5000; // 5 seconds
    this.isTransitioning = false;
    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  async initializeShowcase() {
    try {
      await this.loadSlidesData();
      this.createSlides();
      this.startAutoSlide();
      this.setupEventListeners();
      this.setupTouchEvents();
      this.showSlide(0);
    } catch (error) {
      console.error("Failed to initialize hero showcase:", error);
    }
  }

  async loadSlidesData() {
    const response = await fetch("assets/data/hero-slides.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    this.slides = data.heroSlides;
  }

  createSlides() {
    if (!this.sliderContainer || this.slides.length === 0) return;

    this.sliderContainer.innerHTML = "";

    this.slides.forEach((slide, index) => {
      const slideElement = this.createSlideElement(slide, index);
      this.sliderContainer.appendChild(slideElement);
    });
  }

  createSlideElement(slide, index) {
    const slideDiv = document.createElement("div");
    slideDiv.className = "hero-slide";
    slideDiv.setAttribute("data-slide-index", index);
    slideDiv.style.backgroundImage = `url(${slide.image})`;

    // Add error handling for background image
    const img = new Image();
    img.onload = () => {
      slideDiv.style.backgroundImage = `url(${slide.image})`;
    };
    img.onerror = () => {
      slideDiv.style.backgroundImage = `url(assets/images/placeholder-game.jpg)`;
    };
    img.src = slide.image;

    const contentDiv = document.createElement("div");
    contentDiv.className = "hero-slide-content";

    const title = document.createElement("h1");
    title.className = "hero-slide-title";
    title.textContent = slide.title;

    const description = document.createElement("p");
    description.className = "hero-slide-description";
    description.textContent = slide.description;

    contentDiv.appendChild(title);
    contentDiv.appendChild(description);
    slideDiv.appendChild(contentDiv);

    return slideDiv;
  }

  showSlide(index) {
    if (this.isTransitioning || index < 0 || index >= this.slides.length)
      return;

    this.isTransitioning = true;
    const currentSlide =
      this.sliderContainer.querySelector(".hero-slide.active");
    const nextSlide = this.sliderContainer.querySelector(
      `[data-slide-index="${index}"]`
    );

    if (currentSlide) {
      currentSlide.classList.remove("active");
    }

    if (nextSlide) {
      nextSlide.classList.add("active");
    }

    this.currentSlideIndex = index;

    // Reset transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, 800);
  }

  nextSlide() {
    const nextIndex = (this.currentSlideIndex + 1) % this.slides.length;
    this.showSlide(nextIndex);
  }

  previousSlide() {
    const prevIndex =
      this.currentSlideIndex === 0
        ? this.slides.length - 1
        : this.currentSlideIndex - 1;
    this.showSlide(prevIndex);
  }

  startAutoSlide() {
    this.stopAutoSlide(); // Clear any existing interval
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, this.slideDuration);
  }

  stopAutoSlide() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
  }

  setupEventListeners() {
    // Pause auto-slide on hover
    this.sliderContainer.addEventListener("mouseenter", () => {
      this.stopAutoSlide();
    });

    this.sliderContainer.addEventListener("mouseleave", () => {
      this.startAutoSlide();
    });

    // Keyboard navigation
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        this.previousSlide();
        this.restartAutoSlide();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        this.nextSlide();
        this.restartAutoSlide();
      }
    });

    // Action button handlers
    const actionButtons = document.querySelectorAll(".action-btn");
    actionButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const action = button.getAttribute("data-action");
        this.handleActionButton(action);
      });
    });
  }

  setupTouchEvents() {
    this.sliderContainer.addEventListener("touchstart", (event) => {
      this.touchStartX = event.changedTouches[0].screenX;
    });

    this.sliderContainer.addEventListener("touchend", (event) => {
      this.touchEndX = event.changedTouches[0].screenX;
      this.handleSwipe();
    });
  }

  handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next slide
        this.nextSlide();
      } else {
        // Swipe right - previous slide
        this.previousSlide();
      }
      this.restartAutoSlide();
    }
  }

  restartAutoSlide() {
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  handleActionButton(action) {
    switch (action) {
      case "explore":
        window.location.href = "catalog.html";
        break;
      case "newsletter":
        this.scrollToNewsletter();
        break;
      default:
        console.log("Unknown action:", action);
    }
  }

  scrollToNewsletter() {
    const footer = document.querySelector(".site-footer");
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" });

      // Focus on newsletter input after scroll
      setTimeout(() => {
        const newsletterInput = document.querySelector(".newsletter-input");
        if (newsletterInput) {
          newsletterInput.focus();
        }
      }, 1000);
    }
  }

  // Public method to manually change slide
  goToSlide(index) {
    this.showSlide(index);
    this.restartAutoSlide();
  }

  // Public method to get current slide info
  getCurrentSlide() {
    return this.slides[this.currentSlideIndex];
  }

  // Public method to get total slides count
  getTotalSlides() {
    return this.slides.length;
  }

  // Cleanup method
  destroy() {
    this.stopAutoSlide();
    // Remove event listeners if needed
  }
}

// Initialize hero showcase when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const heroShowcase = new HeroShowcase();
  heroShowcase.initializeShowcase();

  // Make it globally available
  window.heroShowcase = heroShowcase;
});

export default HeroShowcase;
