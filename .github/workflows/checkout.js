/* Checkout Logic */

document.addEventListener('DOMContentLoaded', () => {
    loadOrderSummary();
});

function loadOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('aurum_cart')) || [];
    const itemsContainer = document.getElementById('order-items');
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');

    itemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p class="empty-cart-text">Your cart is empty.</p>';
        // Correctly redirect if empty? Or just show empty.
    } else {
        cart.forEach(item => {
            total += item.price;
            const itemEl = document.createElement('div');
            itemEl.classList.add('order-item');
            itemEl.innerHTML = `
                <div class="order-item-info">
                    <img src="${item.image}" alt="${item.name}">
                    <div>
                        <span class="order-item-name">${item.name}</span>
                        <span class="order-item-price">$${item.price.toFixed(2)}</span>
                    </div>
                </div>
            `;
            itemsContainer.appendChild(itemEl);
        });
    }

    subtotalEl.innerText = '$' + total.toFixed(2);
    totalEl.innerText = '$' + total.toFixed(2);
}

const checkoutForm = document.getElementById('checkout-form');
checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Simulate processing
    const btn = checkoutForm.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = 'Processing...';
    btn.disabled = true;

    setTimeout(() => {
        // Success
        alert('Order Placed Successfully! Thank you for choosing Aurum Beauté.');
        localStorage.removeItem('aurum_cart'); // Clear cart
        window.location.href = 'index.html'; // Redirect home
    }, 2000);
});
