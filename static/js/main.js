// 1. DATA PRODUK
const products = [
    { id: 1, name: "Banner", price: 20000, description: "Banner kualitas tinggi untuk promosi.", image: "/static/img/banner.jpg" },
    { id: 2, name: "Buku Yasin", price: 8500, description: "Buku Yasin desain eksklusif.", image: "/static/img/buku-yasin.jpg" },
    { id: 3, name: "Undangan", price: 1500, description: "Undangan mulai dari Rp 1.500.", image: "/static/img/undangan.jpg" },
    { id: 4, name: "Stempel Kayu", price: 40000, description: "Stempel kayu tajam & awet.", image: "/static/img/stempel-kayu.jpg" },
    { id: 5, name: "Stempel Flash", price: 90000, description: "Stempel otomatis tanpa bantalan.", image: "/static/img/stempel-flash.jpg" },
    { id: 6, name: "Nota", price: 150000, description: "Nota NCR 1-3 ply berkualitas.", image: "/static/img/nota.jpg" }
];

// 2. DOM ELEMENTS & STATE
const productsGrid = document.getElementById('products-grid');
const productModal = document.getElementById('product-modal');
const closeModal = document.getElementById('close-modal');
const modalBody = document.getElementById('modal-body');
let cart = []; 

// 3. API: SAVE ORDER (MULTIPART FOR FILE UPLOAD)
async function saveOrderToDatabase(formData) {
    try {
        const response = await fetch('/api/order', {
            method: 'POST',
            body: formData 
        });
        return response.ok;
    } catch (error) { 
        console.error("Database Error:", error); 
        return false;
    }
}

// 4. LOAD PRODUCTS TO GRID
function loadProducts(productsArray) {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';
    productsArray.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='/static/img/logo.png';">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price-tag">Rp ${product.price.toLocaleString('id-ID')}</p>
            </div>
        `;
        productCard.onclick = () => showProductDetail(product);
        productsGrid.appendChild(productCard);
    });
}

// 5. UPDATE MODAL FIELDS (DYNAMIC NOTES)
function updateModalFields(productName) {
    const labelNote = document.getElementById('label-note');
    const noteArea = document.getElementById('modal-note');
    const name = productName.toLowerCase();

    if (name.includes('banner')) {
        labelNote.innerHTML = 'Detail Ukuran & Finishing <span style="color:red">*</span>';
        noteArea.placeholder = "Contoh: Ukuran 2x1 meter, finishing mata ayam di pojok-pojok.";
    } 
    else if (name.includes('yasin')) {
        labelNote.innerHTML = 'Data Almarhum/ah & Model Cover <span style="color:red">*</span>';
        noteArea.placeholder = "Contoh: Nama Almarhum/ah, tgl lahir & wafat, model cover hijau emas.";
    } 
    else if (name.includes('undangan')) {
        labelNote.innerHTML = 'Detail Acara (Genduren/Tahlil/Syukuran) <span style="color:red">*</span>';
        noteArea.placeholder = "Contoh: Acara Genduren/Tahlil 100 hari, Hari/Tgl, Jam, Alamat Lokasi, & Nama yang mengundang.";
    } 
    else if (name.includes('stempel')) {
        labelNote.innerHTML = 'Tulisan & Warna Tinta <span style="color:red">*</span>';
        noteArea.placeholder = "Contoh: Tulisan 'LUNAS', Tinta warna Biru.";
    } 
    else if (name.includes('nota')) {
        labelNote.innerHTML = 'Nama Toko & Data Nota <span style="color:red">*</span>';
        noteArea.placeholder = "Contoh: Nama Toko, No. HP/Alamat, mulai nomor 001.";
    } 
    else {
        labelNote.innerText = "Catatan Tambahan";
        noteArea.placeholder = "Tambahkan instruksi khusus untuk pesanan Anda...";
    }
}

// 6. SHOW PRODUCT DETAIL (MODAL)
function showProductDetail(product) {
    if (!modalBody) return;

    modalBody.innerHTML = `
        <div class="modal-pro-wrapper">
            <div class="modal-image-section">
                <div class="product-info-badge">
                    <h2>${product.name}</h2>
                    <p class="product-price-tag">Rp ${product.price.toLocaleString('id-ID')} <span class="price-unit">/pcs</span></p>
                </div>
                <img src="${product.image}" alt="${product.name}" onerror="this.src='/static/img/logo.png';">
            </div>

            <div class="modal-form-section">
                <div class="pro-form-group">
                    <label>Nama Pemesan</label>
                    <input type="text" id="modal-name" placeholder="Nama lengkap Anda" required>
                </div>

                <div class="form-row">
                    <div class="pro-form-group">
                        <label>WhatsApp</label>
                        <input type="tel" id="modal-phone" placeholder="0812xxxx" required>
                    </div>
                    <div class="pro-form-group">
                        <label>Jumlah</label>
                        <input type="number" id="modal-qty" value="1" min="1">
                    </div>
                </div>

                <div class="pro-form-group">
                    <label id="label-note">Catatan Tambahan</label>
                    <textarea id="modal-note" rows="3"></textarea>
                </div>

                <div class="pro-form-group">
                    <label>Upload Desain (Opsional)</label>
                    <input type="file" id="modal-file" accept=".jpg,.png,.pdf,.zip">
                </div>

                <div class="pro-form-group">
                    <label>Metode Pengiriman</label>
                    <select id="delivery-select">
                        <option value="pickup">Ambil di Toko</option>
                        <option value="delivery">Kirim ke Alamat</option>
                    </select>
                </div>

                <div id="address-wrapper" style="display:none;" class="field-animate">
                    <div class="pro-form-group">
                        <label>Alamat Lengkap</label>
                        <textarea id="modal-address" placeholder="Masukkan alamat lengkap..."></textarea>
                    </div>
                </div>

                <div class="pro-form-group">
                    <label>Metode Bayar</label>
                    <div class="payment-selector">
                        <label class="pay-option">
                            <input type="radio" name="pay" value="cod" checked>
                            <div class="pay-box">COD</div>
                        </label>
                        <label class="pay-option">
                            <input type="radio" name="pay" value="transfer">
                            <div class="pay-box">Transfer</div>
                        </label>
                    </div>
                </div>

                <div id="bank-wrapper" style="display:none;" class="field-animate">
                    <div class="pro-form-group">
                        <label>Pilih Bank</label>
                        <select id="modal-bank">
                            <option value="BCA">BCA - 1234567 (A/N Citra Abadi)</option>
                            <option value="BRI">BRI - 7654321 (A/N Citra Abadi)</option>
                        </select>
                    </div>
                </div>

                <div class="modal-footer-btns">
                    <button class="btn-outline" id="btn-add-cart" type="button">+ Keranjang</button>
                    <button class="btn-main" id="btn-buy-now" type="button">Pesan Sekarang</button>
                </div>
            </div>
        </div>
    `;

    productModal.style.display = 'flex';
    updateModalFields(product.name);

    // --- LOGIKA TOGGLE (YANG TADI HILANG) ---
    
    // 1. Toggle Alamat vs Pengambilan
    const deliverySelect = document.getElementById('delivery-select');
    deliverySelect.onchange = (e) => {
        const isDelivery = e.target.value === 'delivery';
        document.getElementById('address-wrapper').style.display = isDelivery ? 'block' : 'none';
    };

    // 2. Toggle Info Bank
    const payOptions = document.getElementsByName('pay');
    payOptions.forEach(opt => {
        opt.onchange = (e) => {
            document.getElementById('bank-wrapper').style.display = e.target.value === 'transfer' ? 'block' : 'none';
        };
    });

    // Button Actions
    document.getElementById('btn-add-cart').onclick = () => addToCart(product);
    document.getElementById('btn-buy-now').onclick = () => handleOrder(product);
}

// 7. HANDLE ORDER
async function handleOrder(product) {
    const name = document.getElementById('modal-name').value;
    const phone = document.getElementById('modal-phone').value;
    const qty = document.getElementById('modal-qty').value;
    const note = document.getElementById('modal-note').value;
    const payment = document.querySelector('input[name="pay"]:checked').value;
    const delivery = document.getElementById('delivery-select').value;
    const address = document.getElementById('modal-address') ? document.getElementById('modal-address').value : '';
    const fileInput = document.getElementById('modal-file');

    if (!name || !phone) {
        showNotification("Lengkapi Nama dan Nomor WhatsApp!", "error");
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('whatsapp', phone);
    formData.append('product', product.name);
    formData.append('amount', qty);
    formData.append('payment', payment);
    formData.append('note', `[${delivery.toUpperCase()}] ${note} ${address ? '- Alamat: ' + address : ''}`);
    
    if (fileInput.files[0]) {
        formData.append('design_file', fileInput.files[0]);
    }

    const success = await saveOrderToDatabase(formData);

    if (success) {
        showNotification("✨ Pesanan Berhasil! Admin akan menghubungi Anda untuk konfirmasi desain.");
        productModal.style.display = 'none';
    } else {
        showNotification("⚠️ Terjadi kendala teknis. Silakan coba lagi.", "error");
    }
}

// 8. CART SYSTEM
function addToCart(product) {
    const qty = parseInt(document.getElementById('modal-qty').value) || 1;
    const existing = cart.find(item => item.id === product.id);
    if (existing) { existing.qty += qty; } 
    else { cart.push({ ...product, qty: qty }); }
    updateCartUI();
    showNotification(`🛒 ${product.name} ditambahkan ke keranjang`);
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCount.innerText = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// 9. NOTIFICATION SYSTEM
function showNotification(message, type = "success") {
    let notifyBox = document.getElementById('dynamic-notification');
    if (!notifyBox) {
        notifyBox = document.createElement('div');
        notifyBox.id = 'dynamic-notification';
        document.body.appendChild(notifyBox);
    }
    notifyBox.innerText = message;
    notifyBox.className = `notification show ${type === "error" ? "error" : ""}`;
    setTimeout(() => { notifyBox.className = 'notification'; }, 3000);
}

// 10. INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
    loadProducts(products);
    if (closeModal) { closeModal.onclick = () => productModal.style.display = 'none'; }
    window.onclick = (e) => { if (e.target == productModal) productModal.style.display = 'none'; };

    // === TAMBAHKAN LOGIKA FORM KONTAK DI BAWAH INI ===
    const contactForm = document.getElementById('contact-form'); // Pastikan <form id="contact-form"> di HTML kamu
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Mengambil input dari file contact.html
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        message: message // Dikirim sebagai 'message' sesuai kebutuhan app.py data['message']
                    })
                });

                const result = await response.json();

                if (response.status === 201) {
                    showNotification("✨ Ulasan berhasil dikirim! Terima kasih.");
                    contactForm.reset(); // Kosongkan form setelah sukses
                } else {
                    showNotification(`⚠️ Gagal: ${result.message}`, "error");
                }
            } catch (error) {
                console.error("Contact Error:", error);
                showNotification("⚠️ Terjadi kesalahan jaringan.", "error");
            }
        });
    }
});

// === LOGIKA KHUSUS FORM ULASAN KONTAK ===
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    // Mengecek apakah elemen form ada (agar tidak error di halaman lain)
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Mencegah reload halaman

            // Mengambil data dari input di contact.html
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            // Mengirim ke Flask API
            fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    message: message
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert("✨ Terima kasih! Ulasan Anda berhasil terkirim.");
                    contactForm.reset(); // Mengosongkan form
                } else {
                    alert("Gagal: " + data.message);
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Terjadi kesalahan saat menghubungi server.");
            });
        });
    }
});

// === LOGIKA PEMBUKA & PENUTUP KERANJANG (DIPERBAIKI) ===
document.addEventListener('DOMContentLoaded', function() {
    const cartToggle = document.getElementById('cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCart = document.getElementById('close-cart');

    if (cartToggle && cartSidebar) {
        cartToggle.addEventListener('click', function(e) {
            e.preventDefault();
            cartSidebar.classList.add('active');
            
            // PENTING: Panggil fungsi update UI agar barangnya muncul
            if (typeof updateCartUI === "function") {
                updateCartUI(); 
            }
        });
    }

    if (closeCart && cartSidebar) {
        closeCart.addEventListener('click', function() {
            cartSidebar.classList.remove('active');
        });
    }
});