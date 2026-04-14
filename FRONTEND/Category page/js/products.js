document.addEventListener("DOMContentLoaded", () => {
    const productsContainer = document.getElementById("productsContainer");
    const priceFilter = document.getElementById("priceFilter");
    const priceValue = document.getElementById("priceValue");
    const categoryFilter = document.getElementById("categoryFilter");
    
    // Format price to Indian Rupees
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    // Update price display on slider move
    priceFilter.addEventListener('input', (e) => {
        priceValue.textContent = formatPrice(e.target.value);
    });

    // Re-render when filters change
    priceFilter.addEventListener('change', renderProducts);
    categoryFilter.addEventListener('change', renderProducts);

    // High quality watch images
    const products = [
        {
            id: 1,
            name: "Astral Tourbillon",
            description: "A masterclass in horology featuring an exposed tourbillon and sapphire crystal back.",
            price: 450000,
            category: "men",
            // Dark luxury watch aesthetic
            image: "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 2,
            name: "Celestial Rose",
            description: "18k rose gold casing with diamond-studded bezel and mother-of-pearl dial.",
            price: 280000,
            category: "women",
            image: "https://images.unsplash.com/photo-1585123334904-845d60e97b29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 3,
            name: "Oceanic Diver",
            description: "Professional grade diving watch rated up to 500m with Super-LumiNova markers.",
            price: 125000,
            category: "men",
            image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 4,
            name: "Minimalist Eclipse",
            description: "Ultra-thin profile with an obsidian dial and pure silver indicators.",
            price: 85000,
            category: "all",
            image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 5,
            name: "Chronos Sport",
            description: "Advanced chronograph precision with a lightweight titanium alloy chassis.",
            price: 195000,
            category: "men",
            image: "https://images.unsplash.com/photo-1614164185128-e4ec410f94ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 6,
            name: "Lumina Pearl",
            description: "Exquisite elegance featuring a slim profile and pure white ceramic strap.",
            price: 160000,
            category: "women",
            image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        }
    ];

    function renderProducts() {
        const selectedPrice = parseInt(priceFilter.value);
        const selectedCategory = categoryFilter.value;

        // Filter products based on price and category
        const filteredProducts = products.filter(product => {
            const matchesPrice = product.price <= selectedPrice;
            const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory || product.category === 'all';
            return matchesPrice && matchesCategory;
        });

        // Generate HTML
        if (filteredProducts.length === 0) {
            productsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--surface-color); border-radius: 20px; border: 1px dashed var(--border-color);">
                    <h3 style="margin-bottom: 0.5rem; font-weight: 500;">No timepieces match your criteria.</h3>
                    <p style="color: var(--text-secondary);">Try adjusting your category or price filter to explore our collection.</p>
                </div>
            `;
            return;
        }

        productsContainer.innerHTML = filteredProducts.map(product => `
            <article class="product">
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                <div class="product-info">
                    <h2>${product.name}</h2>
                    <p>${product.description}</p>
                    <div class="product-bottom">
                        <span class="product-price">${formatPrice(product.price)}</span>
                        <button class="buy-btn">Buy Now</button>
                    </div>
                </div>
            </article>
        `).join('');
    }

    // Initialize display with all data
    renderProducts();
});
