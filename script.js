/* Mobile Menu Logic */
const navMenu = document.getElementById('nav-menu'),
    navToggle = document.getElementById('nav-toggle'),
    navClose = document.getElementById('nav-close');

/* Show Menu */
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
    });
}

/* Hide Menu */
if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
}

/* Remove Menu Mobile on Link Click */
const navLink = document.querySelectorAll('.nav-link');

function linkAction() {
    const navMenu = document.getElementById('nav-menu');
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show-menu');
}
navLink.forEach(n => n.addEventListener('click', linkAction));


/* Change Header Background on Scroll */
function scrollHeader() {
    const header = document.getElementById('header');
    // When the scroll is greater than 50 viewport height, add the scroll-header class (if we had specific scroll styles)
    // For now, the header is always blurred/fixed, but we could add a shadow here if desired.
    if (this.scrollY >= 50) header.classList.add('scroll-header'); else header.classList.remove('scroll-header');
}
window.addEventListener('scroll', scrollHeader);

/* ========================
   Shopping Cart Logic
   ======================== */

const cartSidebar = document.getElementById('cart-sidebar'),
    cartItemsContainer = document.getElementById('cart-items'),
    cartTotalElement = document.getElementById('cart-total'),
    cartBagBtn = document.querySelector('.shop-bag'),
    cartCloseBtn = document.getElementById('cart-close'),
    bagCountBadge = document.querySelector('.bag-count');

let cart = [];

// Open Cart
if (cartBagBtn) {
    cartBagBtn.addEventListener('click', (e) => {
        e.preventDefault();
        cartSidebar.classList.add('show-cart');
    });
}

// Close Cart
if (cartCloseBtn) {
    cartCloseBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('show-cart');
    });
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    displayProducts();

    // Check for search query in URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery && document.getElementById('search-input')) {
        document.getElementById('search-input').value = searchQuery;
        performSearch();
    }
});

function displayProducts() {
    const productGrid = document.getElementById('product-grid-main');
    if (!productGrid) return;

    productGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('article');
        productCard.classList.add('product-card', 'reveal');
        if (product.variant) productCard.classList.add(product.variant);

        productCard.innerHTML = `
            <div class="product-badge">${product.badge || 'New Arrival'}</div>
            <div class="product-img-wrapper" data-tilt>
                <img src="${product.image}" alt="${product.name}" class="product-img">
                <div class="product-actions">
                    <button class="action-btn" aria-label="Add to Cart" data-id="${product.id}"><i class="fas fa-shopping-cart"></i></button>
                    <button class="action-btn" aria-label="Add to Wishlist" data-id="${product.id}"><i class="fas fa-heart"></i></button>
                </div>
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <span class="product-category">${product.category}</span>
                <div class="price-wrapper">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                </div>
                <a href="details.html?id=${product.id}" class="btn btn-enroll">Details</a>
                <a href="#" class="btn btn-enroll enroll-now-btn" data-id="${product.id}">Enroll Now</a>
            </div>
        `;
        productGrid.appendChild(productCard);
    });

    // Re-initialize dynamic listeners
    initDynamicListeners();
    // Re-observe reveal elements
    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });
    // Re-initialize tilt
    initTiltEffect();
}

function initDynamicListeners() {
    // Add to Cart
    document.querySelectorAll('.action-btn[aria-label="Add to Cart"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            const product = products.find(p => p.id === id);
            if (product) {
                addToCart(product);
                if (cartSidebar) cartSidebar.classList.add('show-cart');
            }
        });
    });

    // Add to Wishlist
    document.querySelectorAll('.action-btn[aria-label="Add to Wishlist"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            const product = products.find(p => p.id === id);
            if (product) {
                toggleWishlist(product, btn);
            }
        });
    });

    // Enroll Now
    document.querySelectorAll('.enroll-now-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            const product = products.find(p => p.id === id);
            if (product) {
                const enrollProductName = document.getElementById('enrolled-product-name');
                const enrollModal = document.getElementById('enroll-modal');
                if (enrollProductName) enrollProductName.innerText = product.name;
                if (enrollModal) enrollModal.classList.add('show-modal');
            }
        });
    });

    // Sync Wishlist UI immediately
    syncWishlistUI();
}

function initTiltEffect() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const imgWrapper = card.querySelector('.product-img-wrapper');
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            imgWrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            const imgWrapper = card.querySelector('.product-img-wrapper');
            imgWrapper.style.transform = `rotateX(0deg) rotateY(0deg)`;
        });
    });
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        alert('Item is already in your bag!');
        return;
    }

    cart.push(product);
    renderCart();
    updateCartCount();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
    updateCartCount();
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="cart-empty-message">Your bag is empty.</div>';
    } else {
        cart.forEach(item => {
            total += item.price;
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                </div>
                <div class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash-alt"></i>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
    }

    cartTotalElement.innerText = '$' + total.toFixed(2);
    saveCart();
}

function saveCart() {
    localStorage.setItem('aurum_cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('aurum_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        renderCart();
        updateCartCount();
    }
}

// Checkout Button Navigation
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your bag is empty!');
            return;
        }
        window.location.href = 'checkout.html';
    });
}

// Initial Load
// Moved to displayProducts

function updateCartCount() {
    bagCountBadge.innerText = cart.length;
    // Animate badge
    bagCountBadge.style.transform = 'scale(1.3) rotate(10deg)';
    bagCountBadge.style.backgroundColor = 'var(--color-text-title)'; // Temporary "expensive" charcoal flash
    setTimeout(() => {
        bagCountBadge.style.transform = 'scale(1)';
        bagCountBadge.style.backgroundColor = 'var(--color-gold)';
    }, 400);
}

/* Newsletter Form Submission */
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = this.querySelector('input');
        if (input.value) {
            alert(`Thank you for subscribing, ${input.value}! Welcome to the inner circle.`);
            input.value = '';
        }
    });
}

/* Search Overlay Logic */
const searchIcon = document.getElementById('search-toggle');
const searchOverlay = document.getElementById('search-overlay');
const searchClose = document.getElementById('search-close');
const searchInput = document.getElementById('search-input');
const searchSubmitBtn = document.getElementById('search-submit-btn');

if (searchIcon && searchOverlay) {
    searchIcon.addEventListener('click', (e) => {
        e.preventDefault();
        searchOverlay.classList.add('show-search');
        if (searchInput) searchInput.focus();
    });
}

function closeSearch() {
    searchOverlay.classList.remove('show-search');
}

if (searchClose) {
    searchClose.addEventListener('click', closeSearch);
}

// Perform Search Function
function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    if (query === '') return;

    const productsCards = document.querySelectorAll('.product-card');

    // If we are not on a page with products (like About or Contact), redirect to Home with query
    if (productsCards.length === 0) {
        window.location.href = `index.html?search=${encodeURIComponent(query)}#products`;
        return;
    }

    let matchFound = false;

    productsCards.forEach(product => {
        const title = product.querySelector('.product-title').innerText.toLowerCase();
        const category = product.querySelector('.product-category').innerText.toLowerCase();

        if (title.includes(query) || category.includes(query)) {
            product.style.display = 'block';
            if (!matchFound) {
                product.scrollIntoView({ behavior: 'smooth', block: 'center' });
                matchFound = true;
            }
        } else {
            product.style.display = 'none';
        }
    });

    closeSearch();

    if (!matchFound) {
        alert("No items found for '" + query + "'");
        productsCards.forEach(p => p.style.display = 'block');
    }
}

if (searchSubmitBtn) {
    searchSubmitBtn.addEventListener('click', performSearch);
}

if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

/* ========================
   3D Tilt Effect
   ======================== */
const cards = document.querySelectorAll('.product-card');

cards.forEach(card => {
    card.addEventListener('mousemove', e => {
        const imgWrapper = card.querySelector('.product-img-wrapper');
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        imgWrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
        const imgWrapper = card.querySelector('.product-img-wrapper');
        imgWrapper.style.transform = `rotateX(0deg) rotateY(0deg)`;
    });
});

/* ========================
   Scroll Reveal Engine
   ======================== */
const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
};

const revealObserver = new IntersectionObserver(revealCallback, {
    threshold: 0.15
});

document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
});

/* ========================
   Wishlist Logic
   ======================== */
const wishlistSidebar = document.getElementById('wishlist-sidebar'),
    wishlistItemsContainer = document.getElementById('wishlist-items'),
    wishlistToggle = document.querySelector('.wishlist-toggle'),
    wishlistClose = document.getElementById('wishlist-close'),
    wishlistCountBadge = document.querySelector('.wishlist-count');

let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Open/Close Wishlist
if (wishlistToggle) {
    wishlistToggle.addEventListener('click', (e) => {
        e.preventDefault();
        wishlistSidebar.classList.add('show-wishlist');
    });
}
if (wishlistClose) {
    wishlistClose.addEventListener('click', () => {
        wishlistSidebar.classList.remove('show-wishlist');
    });
}

// Add/Remove from Wishlist
const wishlistBtns = document.querySelectorAll('.action-btn[aria-label="Add to Wishlist"]');

wishlistBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const productCard = btn.closest('.product-card');
        const product = {
            id: productCard.querySelector('.product-title').innerText,
            name: productCard.querySelector('.product-title').innerText,
            price: parseFloat(productCard.querySelector('.product-price').innerText.replace('$', '')),
            image: productCard.querySelector('.product-img').src
        };

        toggleWishlist(product, btn);
    });
});

function toggleWishlist(product, btn) {
    const index = wishlist.findIndex(item => item.id === product.id);
    if (index === -1) {
        wishlist.push(product);
        if (btn) btn.classList.add('wishlist-active');
    } else {
        wishlist.splice(index, 1);
        if (btn) btn.classList.remove('wishlist-active');
    }
    saveWishlist();
    renderWishlist();
    updateWishlistCount();
}

function saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function renderWishlist() {
    wishlistItemsContainer.innerHTML = '';
    if (wishlist.length === 0) {
        wishlistItemsContainer.innerHTML = '<div class="cart-empty-message">Your wishlist is empty.</div>';
    } else {
        wishlist.forEach(item => {
            const wishlistItem = document.createElement('div');
            wishlistItem.classList.add('cart-item');
            wishlistItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                </div>
                <div class="cart-item-actions" style="display:flex; gap:0.5rem">
                    <div class="cart-item-remove" onclick="moveToCartFromWishlist('${item.id}')" title="Move to Bag">
                        <i class="fas fa-shopping-bag"></i>
                    </div>
                    <div class="cart-item-remove" onclick="toggleWishlistById('${item.id}')" title="Remove">
                        <i class="fas fa-trash-alt"></i>
                    </div>
                </div>
            `;
            wishlistItemsContainer.appendChild(wishlistItem);
        });
    }
}

function updateWishlistCount() {
    wishlistCountBadge.innerText = wishlist.length;
}

function toggleWishlistById(id) {
    wishlist = wishlist.filter(item => item.id !== id);
    // Update UI buttons if they exist
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        if (card.querySelector('.product-title').innerText === id) {
            card.querySelector('[aria-label="Add to Wishlist"]').classList.remove('wishlist-active');
        }
    });
    saveWishlist();
    renderWishlist();
    updateWishlistCount();
}

function moveToCartFromWishlist(id) {
    const item = wishlist.find(i => i.id === id);
    if (item) {
        addToCart(item);
        toggleWishlistById(id);
        wishlistSidebar.classList.remove('show-wishlist');
    }
}

// Initial Sync
// Handled in initDynamicListeners
function syncWishlistUI() {
    const wishlistBtns = document.querySelectorAll('.action-btn[aria-label="Add to Wishlist"]');
    wishlistBtns.forEach(btn => {
        const id = btn.getAttribute('data-id');
        if (wishlist.some(item => item.id === id)) {
            btn.classList.add('wishlist-active');
        } else {
            btn.classList.remove('wishlist-active');
        }
    });
    renderWishlist();
    updateWishlistCount();
}

/* ========================
   Satin Trail Cursor
   ======================== */
const dots = document.querySelectorAll("[data-cursor-dot]");
const trailContainer = document.querySelector(".cursor-trail");

let mouseX = 0;
let mouseY = 0;

// Store positions for each dot
let dotPositions = Array.from({ length: dots.length }, () => ({ x: 0, y: 0 }));

window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateDots() {
    let leaderX = mouseX;
    let leaderY = mouseY;

    dotPositions.forEach((pos, index) => {
        // Each dot follows the point ahead of it (or the mouse for the first dot)
        let targetX = (index === 0) ? mouseX : dotPositions[index - 1].x;
        let targetY = (index === 0) ? mouseY : dotPositions[index - 1].y;

        // Smoothly interpolate towards the target
        pos.x += (targetX - pos.x) * 0.3; // Speed of each segment
        pos.y += (targetY - pos.y) * 0.3;

        dots[index].style.left = `${pos.x}px`;
        dots[index].style.top = `${pos.y}px`;
    });

    requestAnimationFrame(animateDots);
}
animateDots();

// Hover interactions
const interactiveElements = document.querySelectorAll('a, button, .product-card, .shop-bag, .wishlist-toggle');

interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        trailContainer.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        trailContainer.classList.remove('hover');
    });
});

/* ========================
   Parallax Scrolling Effect
   ======================== */
window.addEventListener('scroll', () => {
    const scroll = window.pageYOffset;
    const heroBg = document.querySelector('.hero-bg img');
    if (heroBg) {
        heroBg.style.transform = `translateY(${scroll * 0.4}px) scale(${1 + scroll * 0.0005})`;
    }
});

/* Review Section Logic */
const ratingStars = document.querySelectorAll('#rating-stars i');
const ratingInput = document.getElementById('review-rating');
const reviewForm = document.getElementById('review-form');

if (ratingStars && ratingInput) {
    ratingStars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const rating = star.getAttribute('data-rating');
            highlightStars(rating);
        });

        star.addEventListener('mouseout', () => {
            const currentRating = ratingInput.value;
            highlightStars(currentRating);
        });

        star.addEventListener('click', () => {
            const rating = star.getAttribute('data-rating');
            ratingInput.value = rating;
            highlightStars(rating);
        });
    });
}

function highlightStars(rating) {
    ratingStars.forEach(star => {
        if (star.getAttribute('data-rating') <= rating) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
}

if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = reviewForm.querySelector('button');
        const originalText = btn.innerText;

        btn.innerText = 'Publishing...';
        btn.disabled = true;

        setTimeout(() => {
            alert('Thank you for sharing your experience! Your review has been submitted for verification.');
            reviewForm.reset();
            highlightStars(0);
            ratingInput.value = 0;
            btn.innerText = originalText;
            btn.disabled = false;
        }, 1500);
    });
}

/* Contact Concierge Logic */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = contactForm.querySelector('button');
        const btnFront = btn.querySelector('.btn-3d-front');
        const originalText = btnFront.innerText;

        btnFront.innerText = 'Sending Inquiry...';
        btn.disabled = true;

        setTimeout(() => {
            alert('Your inquiry has been received by our Atelier. A concierge specialist will be in touch with you shortly.');
            contactForm.reset();
            btnFront.innerText = originalText;
            btn.disabled = false;
        }, 2000);
    });
}

/* Enrollment Modal Logic */
const enrollModal = document.getElementById('enroll-modal'),
    enrollClose = document.getElementById('enroll-modal-close'),
    enrollBtn = document.getElementById('enroll-modal-btn'),
    enrollProductName = document.getElementById('enrolled-product-name');

// Handled in initDynamicListeners

function closeEnrollModal() {
    if (enrollModal) enrollModal.classList.remove('show-modal');
}

if (enrollClose) {
    enrollClose.addEventListener('click', closeEnrollModal);
}

if (enrollBtn) {
    enrollBtn.addEventListener('click', closeEnrollModal);
}

// Close modal on outside click
window.addEventListener('click', (e) => {
    if (e.target === enrollModal) {
        closeEnrollModal();
    }
});

/* ========================
   Quantity Selector Logic
   ======================== */
document.addEventListener('click', (e) => {
    if (e.target.id === 'qty-plus') {
        const qtyVal = document.getElementById('qty-val');
        if (qtyVal) qtyVal.innerText = parseInt(qtyVal.innerText) + 1;
    }
    if (e.target.id === 'qty-minus') {
        const qtyVal = document.getElementById('qty-val');
        if (qtyVal && parseInt(qtyVal.innerText) > 1) {
            qtyVal.innerText = parseInt(qtyVal.innerText) - 1;
        }
    }
});
