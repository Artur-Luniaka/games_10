// Game Detail Loader Module
class GameDetailLoader {
  constructor() {
    this.gameId = null;
    this.gameData = null;
    this.allGames = [];
    this.currentReviewsPage = 1;
    this.reviewsPerPage = 5;

    this.init();
  }

  async init() {
    this.gameId = this.getGameIdFromUrl();
    if (!this.gameId) {
      this.showError("Game ID not found");
      return;
    }

    await this.loadGamesData();
    await this.loadGameDetails();
    this.setupEventListeners();
    this.loadReviews();
  }

  getGameIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  async loadGamesData() {
    try {
      const response = await fetch("assets/data/games.json");
      this.allGames = await response.json();
    } catch (error) {
      console.error("Error loading games data:", error);
      this.showError("Failed to load games data");
    }
  }

  async loadGameDetails() {
    this.gameData = this.allGames.find((game) => game.id === this.gameId);

    if (!this.gameData) {
      this.showError("Game not found");
      return;
    }

    this.updatePageTitle();
    this.updateBreadcrumb();
    this.updateGameInfo();
    this.updatePurchaseSection();
    this.loadScreenshots();
    this.loadSystemRequirements();
    this.checkWishlistStatus();
  }

  updatePageTitle() {
    document.title = `${this.gameData.title} - PixelVault`;
    document.getElementById("game-title").textContent = this.gameData.title;
  }

  updateBreadcrumb() {
    document.getElementById("game-title").textContent = this.gameData.title;
  }

  updateGameInfo() {
    // Main game info
    document.getElementById("game-detail-title").textContent =
      this.gameData.title;
    document.getElementById("game-main-image").src = this.gameData.image;
    document.getElementById("game-main-image").alt = this.gameData.title;

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
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
    document.getElementById("game-release-date").textContent = releaseDate;

    // Description
    document.getElementById("game-description").textContent =
      this.gameData.description;

    // Game details
    document.getElementById("game-genre").textContent = this.gameData.genre;
    document.getElementById("game-platforms").textContent =
      this.gameData.platforms.join(", ");
    document.getElementById("game-developer").textContent =
      this.gameData.developer;
    document.getElementById("game-publisher").textContent =
      this.gameData.publisher;
    document.getElementById("game-release").textContent = new Date(
      this.gameData.releaseDate
    ).getFullYear();
    document.getElementById("game-esrb").textContent =
      this.gameData.esrbRating || "T";

    // Features
    const featuresList = document.getElementById("game-features");
    featuresList.innerHTML = this.gameData.features
      .map((feature) => `<li>${feature}</li>`)
      .join("");
  }

  updatePurchaseSection() {
    const hasDiscount =
      this.gameData.discountPrice &&
      this.gameData.discountPrice < this.gameData.price;
    const currentPrice = this.gameData.discountPrice || this.gameData.price;
    const discountPercentage = hasDiscount
      ? Math.round(
          ((this.gameData.price - this.gameData.discountPrice) /
            this.gameData.price) *
            100
        )
      : 0;

    // Price display
    document.getElementById("current-price").textContent = `$${currentPrice}`;

    if (hasDiscount) {
      document.getElementById(
        "original-price"
      ).textContent = `$${this.gameData.price}`;
      document.getElementById(
        "discount-badge"
      ).textContent = `-${discountPercentage}%`;
      document.getElementById(
        "game-badge"
      ).textContent = `-${discountPercentage}%`;
    } else {
      document.getElementById("original-price").textContent = "";
      document.getElementById("discount-badge").textContent = "";
      document.getElementById("game-badge").textContent = "";
    }
  }

  loadScreenshots() {
    const screenshotsGrid = document.getElementById("screenshots-grid");

    // Generate placeholder screenshots (in a real app, these would come from the game data)
    const screenshots = this.generateScreenshots();

    screenshotsGrid.innerHTML = screenshots
      .map(
        (screenshot, index) => `
      <div class="screenshot-item" onclick="this.openScreenshotModal('${screenshot}', ${index})">
        <img src="${screenshot}" alt="Screenshot ${index + 1}" loading="lazy">
      </div>
    `
      )
      .join("");
  }

  generateScreenshots() {
    // Generate placeholder screenshots based on game genre
    const baseUrl = "https://via.placeholder.com/400x300";
    const colors = ["ff6b35", "f7931e", "ffd23f", "28a745", "17a2b8"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    return [
      `${baseUrl}/${randomColor}/ffffff?text=Screenshot+1`,
      `${baseUrl}/${randomColor}/ffffff?text=Screenshot+2`,
      `${baseUrl}/${randomColor}/ffffff?text=Screenshot+3`,
      `${baseUrl}/${randomColor}/ffffff?text=Screenshot+4`,
    ];
  }

  loadSystemRequirements() {
    const minimumReqs = document.getElementById("minimum-requirements");
    const recommendedReqs = document.getElementById("recommended-requirements");

    // Generate placeholder requirements (in a real app, these would come from the game data)
    const requirements = this.generateSystemRequirements();

    minimumReqs.innerHTML = this.renderRequirements(requirements.minimum);
    recommendedReqs.innerHTML = this.renderRequirements(
      requirements.recommended
    );
  }

  generateSystemRequirements() {
    return {
      minimum: {
        OS: "Windows 10 64-bit",
        Processor: "Intel Core i5-4460 / AMD FX-8350",
        Memory: "8 GB RAM",
        Graphics: "NVIDIA GTX 760 / AMD Radeon R7 260x",
        DirectX: "Version 11",
        Storage: "50 GB available space",
      },
      recommended: {
        OS: "Windows 10 64-bit",
        Processor: "Intel Core i7-4790 / AMD Ryzen 5 1600",
        Memory: "16 GB RAM",
        Graphics: "NVIDIA GTX 1060 / AMD RX 580",
        DirectX: "Version 12",
        Storage: "50 GB available space",
      },
    };
  }

  renderRequirements(requirements) {
    return `<ul>${Object.entries(requirements)
      .map(
        ([key, value]) =>
          `<li><span class="req-label">${key}</span><span class="req-value">${value}</span></li>`
      )
      .join("")}</ul>`;
  }

  checkWishlistStatus() {
    const wishlist = JSON.parse(
      localStorage.getItem("pixelVaultWishlist") || "[]"
    );
    const isInWishlist = wishlist.includes(this.gameId);

    const wishlistBtn = document.getElementById("btn-wishlist");
    if (isInWishlist) {
      wishlistBtn.classList.add("active");
    }
  }

  setupEventListeners() {
    // Purchase button
    document.getElementById("btn-purchase").addEventListener("click", () => {
      this.addToCart();
    });

    // Wishlist button
    document.getElementById("btn-wishlist").addEventListener("click", () => {
      this.toggleWishlist();
    });

    // Requirements tabs
    document.querySelectorAll(".req-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        this.switchRequirementsTab(e.target.dataset.tab);
      });
    });

    // Load more reviews button
    document
      .getElementById("load-more-reviews")
      .addEventListener("click", () => {
        this.loadMoreReviews();
      });
  }

  addToCart() {
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem("pixelVaultCart") || "[]");

    // Check if game is already in cart
    const existingItem = cart.find((item) => item.id === this.gameId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: this.gameId,
        title: this.gameData.title,
        price: this.gameData.discountPrice || this.gameData.price,
        image: this.gameData.image,
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

  toggleWishlist() {
    // Get current wishlist from localStorage
    let wishlist = JSON.parse(
      localStorage.getItem("pixelVaultWishlist") || "[]"
    );

    const isInWishlist = wishlist.includes(this.gameId);
    const wishlistBtn = document.getElementById("btn-wishlist");

    if (isInWishlist) {
      wishlist = wishlist.filter((id) => id !== this.gameId);
      wishlistBtn.classList.remove("active");
      this.showNotification("Removed from wishlist", "info");
    } else {
      wishlist.push(this.gameId);
      wishlistBtn.classList.add("active");
      this.showNotification("Added to wishlist!", "success");
    }

    localStorage.setItem("pixelVaultWishlist", JSON.stringify(wishlist));
  }

  switchRequirementsTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".req-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === tabName);
    });

    // Update panels
    document.querySelectorAll(".req-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `${tabName}-requirements`);
    });
  }

  async loadReviews() {
    try {
      // Generate mock reviews (in a real app, these would come from an API)
      const reviews = this.generateMockReviews();

      this.renderReviews(reviews);
      this.updateReviewsSummary(reviews);
    } catch (error) {
      console.error("Error loading reviews:", error);
    }
  }

  generateMockReviews() {
    const reviewers = [
      "Alex Gamer",
      "Sarah Player",
      "Mike Console",
      "Emma Digital",
      "John Retro",
      "Lisa Pro",
      "David Casual",
      "Anna Hardcore",
      "Tom Streamer",
      "Kate Reviewer",
    ];

    const reviewTexts = [
      "Amazing game! The graphics are stunning and the gameplay is incredibly smooth.",
      "Great value for money. I've spent hours playing and still discovering new things.",
      "Solid game with good mechanics. Would definitely recommend to friends.",
      "The story is engaging and the controls are intuitive. Really enjoying it!",
      "Excellent game design and attention to detail. Worth every penny.",
      "Fun gameplay with lots of replayability. The multiplayer is especially good.",
      "Beautiful art style and great soundtrack. A must-play for fans of the genre.",
      "Well-polished game with few bugs. The developers clearly care about quality.",
      "Innovative mechanics that keep the game fresh. Highly recommended!",
      "Great performance and optimization. Runs smoothly on my system.",
    ];

    const reviews = [];
    for (let i = 0; i < 15; i++) {
      const rating = 3 + Math.random() * 2; // 3-5 stars
      reviews.push({
        id: i + 1,
        reviewer: reviewers[i % reviewers.length],
        rating: Math.round(rating * 10) / 10,
        text: reviewTexts[i % reviewTexts.length],
        date: new Date(
          Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
        helpful: Math.floor(Math.random() * 50),
      });
    }

    return reviews.sort((a, b) => b.rating - a.rating);
  }

  renderReviews(reviews) {
    const startIndex = (this.currentReviewsPage - 1) * this.reviewsPerPage;
    const endIndex = startIndex + this.reviewsPerPage;
    const reviewsToShow = reviews.slice(startIndex, endIndex);

    const reviewsGrid = document.getElementById("reviews-grid");

    if (this.currentReviewsPage === 1) {
      reviewsGrid.innerHTML = "";
    }

    reviewsGrid.innerHTML += reviewsToShow
      .map(
        (review) => `
      <div class="review-item">
        <div class="review-header">
          <div class="reviewer-info">
            <div class="reviewer-avatar">${review.reviewer.charAt(0)}</div>
            <div>
              <div class="reviewer-name">${review.reviewer}</div>
              <div class="review-date">${review.date}</div>
            </div>
          </div>
          <div class="review-rating">
            <div class="rating-stars">${this.generateStars(review.rating)}</div>
            <span class="rating-text">${review.rating}/5</span>
          </div>
        </div>
        <div class="review-text">${review.text}</div>
      </div>
    `
      )
      .join("");

    // Update load more button
    const loadMoreBtn = document.getElementById("load-more-reviews");
    if (endIndex >= reviews.length) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "block";
    }
  }

  updateReviewsSummary(reviews) {
    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    document.getElementById("overall-rating").textContent =
      averageRating.toFixed(1);
    document.getElementById("overall-stars").innerHTML =
      this.generateStars(averageRating);
    document.getElementById(
      "total-reviews"
    ).textContent = `(${reviews.length} reviews)`;
  }

  loadMoreReviews() {
    this.currentReviewsPage++;
    this.loadReviews();
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

  showError(message) {
    this.showNotification(message, "error");
  }
}

// Initialize game detail loader when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new GameDetailLoader();
});
