const shoes = [
    { id: 1, type: 'shoe', name: "Urban Runner X1", price: "₱2,499", image: "https://picsum.photos/id/201/600/600", desc: "Lightweight daily trainer with excellent breathability and responsive cushioning." },
    { id: 2, type: 'shoe', name: "Trail Master Pro", price: "₱3,299", image: "https://picsum.photos/id/237/600/600", desc: "Built for rugged terrain. Waterproof upper and aggressive outsole grip." },
    { id: 3, type: 'shoe', name: "Gibson Classic", price: "₱2,899", image: "https://picsum.photos/id/180/600/600", desc: "Timeless design with modern comfort technology. Perfect for casual wear." },
    { id: 4, type: 'shoe', name: "Velocity Boost", price: "₱3,799", image: "https://picsum.photos/id/1015/600/600", desc: "Maximum energy return. Carbon plate technology for serious athletes." },

    { id: 5, type: 'shoe', name: "Urban Runner X2", price: "₱2,599", image: "https://picsum.photos/id/202/600/600", desc: "", },
    { id: 6, type: 'shoe', name: "Trail Master Pro X2", price: "₱3,399", image: "https://picsum.photos/id/238/600/600", desc: "", },
    { id: 7, type: 'shoe', name: "Gibson Classic X2", price: "₱2,999", image: "https://picsum.photos/id/181/600/600", desc: "", },
    { id: 8, type: 'shoe', name: "Velocity Boost X2", price: "₱3,899", image: "https://picsum.photos/id/1016/600/600", desc: "", },
    { id: 9, type: 'shoe', name: "Street Glide Runner", price: "₱2,699", image: "https://picsum.photos/id/203/600/600", desc: "", },
    { id: 10, type: 'shoe', name: "Summit Trail Guard", price: "₱3,499", image: "https://picsum.photos/id/239/600/600", desc: "", },
    { id: 11, type: 'shoe', name: "Heritage Walk Classic", price: "₱2,999", image: "https://picsum.photos/id/182/600/600", desc: "", },
    { id: 12, type: 'shoe', name: "Sprint Carbon Lite", price: "₱3,999", image: "https://picsum.photos/id/1017/600/600", desc: "", }
];

const techProducts = [
    { id: 'tech-1', type: 'technology', name: "AirFlex Cushioning", price: "₱999", image: "https://picsum.photos/id/180/600/400", desc: "Adaptive pressure technology that reduces fatigue and improves comfort." },
    { id: 'tech-2', type: 'technology', name: "GripTech Outsole", price: "₱1,199", image: "https://picsum.photos/id/201/600/400", desc: "High-traction compound designed for stable grip on any surface." },

    { id: 'tech-3', type: 'technology', name: "FlexGrid Support", price: "₱1,099", image: "https://picsum.photos/id/183/600/400", desc: "" },
    { id: 'tech-4', type: 'technology', name: "ShockLock Heel", price: "₱1,249", image: "https://picsum.photos/id/184/600/400", desc: "" },
    { id: 'tech-5', type: 'technology', name: "VentCore Mesh", price: "₱899", image: "https://picsum.photos/id/185/600/400", desc: "" },
    { id: 'tech-6', type: 'technology', name: "TurboFoam Midsole", price: "₱1,399", image: "https://picsum.photos/id/186/600/400", desc: "" }
];

const otherProducts = [
    { id: 'other-1', type: 'product', name: "Performance Socks", price: "₱399", image: "https://picsum.photos/id/60/600/400", desc: "Moisture-wicking socks with targeted arch support." },
    { id: 'other-2', type: 'product', name: "Care Kit Pro", price: "₱749", image: "https://picsum.photos/id/133/600/400", desc: "Complete cleaner and protector set for premium shoe care." },
    { id: 'other-3', type: 'product', name: "Travel Shoe Bag", price: "₱549", image: "https://picsum.photos/id/201/600/400", desc: "Waterproof, ventilated shoe bag built for travel convenience." }
];

let customerRegistry = [];

let currentUser = null;
let selectedItem = null;
let targetedOrderId = null; // Tracks order selected for cancellation
let pendingRegistration = null; // Stores temp registration data
let verificationCode = null; // Email verification code

function loadCustomerRegistry() {
    const saved = localStorage.getItem('resourceManCustomerRegistry');
    if (saved) {
        try {
            customerRegistry = JSON.parse(saved);
        } catch (error) {
            console.warn('Failed to parse saved customers:', error);
            customerRegistry = [];
        }
    }

    if (!customerRegistry.length) {
        // No demo users by default.
        // Users must be created via the registration flow.
        customerRegistry = [];
        saveCustomerRegistry();
    }
}

function saveCustomerRegistry() {
    localStorage.setItem('resourceManCustomerRegistry', JSON.stringify(customerRegistry));
}

function deleteCustomer(email) {
    const clientIndex = customerRegistry.findIndex(c => c.email.toLowerCase() === email.toLowerCase());
    if (clientIndex === -1) return;

    const confirmed = confirm(`Delete customer ${customerRegistry[clientIndex].name} (${customerRegistry[clientIndex].email})? This action cannot be undone.`);
    if (!confirmed) return;

    customerRegistry.splice(clientIndex, 1);
    saveCustomerRegistry();
    buildAdminTerminalData();
    showToast('Customer profile removed from the database.');
}

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${page}`);
    if (activeNav) activeNav.classList.add('active');
}

// EmailJS credentials (can be updated at runtime via the live-test flow)
// Load persisted EmailJS credentials (if any) so live tests can run without re-prompting
let EMAIL_JS_USER_ID = localStorage.getItem('emailjs_user') || "etEscMwlpKLKSYMJu";
let EMAIL_JS_SERVICE_ID = localStorage.getItem('emailjs_service') || "service_9kbqvrg";
let EMAIL_JS_TEMPLATE_ID = localStorage.getItem('emailjs_template') || "template_3vuepya";
const EMAIL_SUPPORT_EMAIL = localStorage.getItem('email_support') || "zhiausse@gmail.com";

function isEmailJsEnabled() {
    return EMAIL_JS_USER_ID !== "YOUR_EMAILJS_USER_ID" && EMAIL_JS_SERVICE_ID !== "YOUR_SERVICE_ID" && EMAIL_JS_TEMPLATE_ID !== "YOUR_TEMPLATE_ID";
}

function initEmailJS() {
    if (window.emailjs && isEmailJsEnabled()) {
        try { emailjs.init(EMAIL_JS_USER_ID); } catch (e) { console.warn('emailjs.init failed', e); }
    }
}

function saveEmailJsCredentials(uid, sid, tid, supportEmail) {
    if (uid) { EMAIL_JS_USER_ID = uid; localStorage.setItem('emailjs_user', uid); }
    if (sid) { EMAIL_JS_SERVICE_ID = sid; localStorage.setItem('emailjs_service', sid); }
    if (tid) { EMAIL_JS_TEMPLATE_ID = tid; localStorage.setItem('emailjs_template', tid); }
    if (supportEmail) { localStorage.setItem('email_support', supportEmail); }
    initEmailJS();
}

function configureEmailJs() {
    const uid = prompt('EmailJS user ID:', EMAIL_JS_USER_ID === 'YOUR_EMAILJS_USER_ID' ? '' : EMAIL_JS_USER_ID);
    if (!uid) return false;
    const sid = prompt('EmailJS service ID:', EMAIL_JS_SERVICE_ID === 'YOUR_SERVICE_ID' ? '' : EMAIL_JS_SERVICE_ID);
    if (!sid) return false;
    const tid = prompt('EmailJS template ID:', EMAIL_JS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' ? '' : EMAIL_JS_TEMPLATE_ID);
    if (!tid) return false;
    const support = prompt('Admin/support email (receives notifications):', localStorage.getItem('email_support') || EMAIL_SUPPORT_EMAIL);
    saveEmailJsCredentials(uid.trim(), sid.trim(), tid.trim(), support ? support.trim() : null);
    showToast('EmailJS credentials saved for this browser.');
    return true;
}

function sendVerificationEmail(email) {
    const statusEl = document.getElementById('verify-status');
    if (!statusEl) return Promise.resolve();

    if (!window.emailjs || !isEmailJsEnabled()) {
        statusEl.innerHTML = `
            <p style="margin:0;">Email sending is not configured. Replace the EmailJS IDs in r4.js with your actual service settings to enable real verification emails.</p>
            <p style="margin: 10px 0 0; color: var(--success-color); font-weight: 600;">Dev fallback code: ${verificationCode}</p>
        `;
        return Promise.resolve();
    }

    statusEl.innerHTML = `<p style="margin:0;">Sending verification code to ${email}...</p>`;

const templateParams = {
        // Keys required by your EmailJS template_3vuepya
        passcode: verificationCode,
        time: new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

        // Also include other common variants (harmless if unused)
        email: email,
        to_email: email,
        verification_code: verificationCode,
        otp: verificationCode,
        one_time_password: verificationCode,
        code: verificationCode,

        from_name: "ResourceMan",
        subject: "ResourceMan Account Verification",
        message: `Your ResourceMan verification code is ${verificationCode}. Enter it on the site to complete registration.`,
        reply_to: EMAIL_SUPPORT_EMAIL
    };

    return emailjs.send(EMAIL_JS_SERVICE_ID, EMAIL_JS_TEMPLATE_ID, templateParams)
        .then(() => {
            statusEl.innerHTML = `<p style="margin:0;">Verification code sent to ${email}. Check your inbox (and spam folder).</p>`;
        })
        .catch(error => {
            console.error('EmailJS error', error);
            statusEl.innerHTML = `<p style="margin:0;color:var(--danger);">Email sending failed. Check EmailJS configuration and your EmailJS template variables.</p>`;
            return Promise.reject(error);
        });
}

function sendAdminNotification(subject, message, replyEmail) {
    if (!window.emailjs || !isEmailJsEnabled()) {
        console.log('Admin email notification disabled:', subject, message);
        return Promise.resolve();
    }

    const templateParams = {
        from_name: "ResourceMan System",
        to_email: EMAIL_SUPPORT_EMAIL,
        subject,
        message,
        reply_to: replyEmail || EMAIL_SUPPORT_EMAIL
    };

    return emailjs.send(EMAIL_JS_SERVICE_ID, EMAIL_JS_TEMPLATE_ID, templateParams)
        .then(() => {
            console.log('Admin notification sent:', subject);
        })
        .catch(error => {
            console.error('Admin email error', error);
        });
}

function renderShoes() {
    const container = document.getElementById('shoes-grid');
    container.innerHTML = '';
    renderItemCards(shoes, container);
}

function renderTechProducts() {
    const container = document.getElementById('tech-grid');
    container.innerHTML = '';
    renderItemCards(techProducts, container);
}

function renderOtherProducts() {
    const container = document.getElementById('other-grid');
    container.innerHTML = '';
    renderItemCards(otherProducts, container);
}

function renderItemCards(items, container) {
    const isPriceUnlocked = (currentUser && !currentUser.isAdmin && !currentUser.isBlocked);

    items.forEach(item => {
        const displayedPrice = isPriceUnlocked ? item.price : "₱?,???";

        const div = document.createElement('div');
        div.className = "shoe-card";
        div.innerHTML = `
            <img src="${item.image}">
            <div class="shoe-card-body">
                <h3>${item.name}</h3>
                <p style="font-size: 14px; color: var(--text-muted); margin-top: 8px;">${item.desc}</p>
                <div class="shoe-card-meta" style="margin-top: 16px;">
                    <p class="price-text ${isPriceUnlocked ? 'price-unlocked-text' : 'price-locked-text'}">${displayedPrice}</p>
                    ${!isPriceUnlocked ? '<span class="lock-badge"><i class="fas fa-lock" style="font-size: 9px; margin-right: 4px;"></i>Sign in</span>' : ''}
                </div>
            </div>
        `;
        div.onclick = () => viewItem(item);
        container.appendChild(div);
    });
}

function viewItem(item) {
    selectedItem = item;

    document.getElementById('modal-shoe-image').src = item.image;
    document.getElementById('modal-shoe-name').textContent = item.name;
    document.getElementById('modal-shoe-desc').textContent = item.desc;

    const priceEl = document.getElementById('modal-shoe-price');
    const badgeEl = document.getElementById('price-status-badge');
    const buyBtn = document.getElementById('modal-buy-btn');

    if (currentUser && !currentUser.isAdmin && !currentUser.isBlocked) {
        priceEl.textContent = item.price;
        priceEl.className = "modal-price-val price-unlocked-text";

        badgeEl.textContent = "Member Price Unlocked";
        badgeEl.className = "badge-status badge-unlocked";

        // Show separate actions
        buyBtn.textContent = `Buy - ${item.price}`;
        buyBtn.disabled = false;
        buyBtn.className = "btn-action";

        // For the modal: keep the existing single button as "Buy";
        // cart is still done via addToCart() from the "Add to Cart" button in the purchase section.
        // (UI change in r4.html may add a separate cart button.)
    } else {
        priceEl.textContent = "₱?,???";
        priceEl.className = "modal-price-val price-locked-text";

        badgeEl.textContent = "Price Locked";
        badgeEl.className = "badge-status badge-locked";

        buyBtn.textContent = "Login to Unlock Price";
        buyBtn.className = "btn-action btn-disabled";
        buyBtn.disabled = true;
    }

    document.getElementById('modal-quantity').value = 1;
    document.getElementById('shoe-modal').classList.remove('hidden');
}

function closeShoeModal() {
    document.getElementById('shoe-modal').classList.add('hidden');
    selectedItem = null;
}

function handleProfileWidgetClick() {
    if (currentUser) {
        if (currentUser.isAdmin) {
            navigateTo(11);
        } else {
            navigateTo(10);
        }
    } else {
        navigateTo(10);
    }
}

function login() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;

    if (!email || !pass) {
        showToast("Please enter both email and password");
        return;
    }

    // Admin access is controlled only via the secret key sequence.
    // (Removed admin email/password login to prevent bypass.)

    const clientMatch = customerRegistry.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (clientMatch) {
        if (clientMatch.isBlocked) {
            showToast("⛔ Access Denied: Account restricted by admin.");
            return;
        }

        if (clientMatch.password === pass) {
            currentUser = clientMatch;
            updateUserUI();
            renderShoes();
            document.getElementById('login-email').value = '';
            document.getElementById('login-pass').value = '';
            showToast("Logged in. Real prices unlocked!");
            navigateTo(10);
        } else {
            showToast("Password incorrect. Access Denied.");
        }
    } else {
        showToast("Account missing. Please register first.");
    }
}

function register() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const phone = document.getElementById('reg-phone').value.trim();
    const address = document.getElementById('reg-address').value.trim();

    if (!name || !email || !pass) {
        showToast("Please fill out all required fields.");
        return;
    }

    const accountExists = customerRegistry.some(c => c.email.toLowerCase() === email.toLowerCase()) || email === "admin@resourceman.com";
    if (accountExists) {
        showToast("Error: Account email already taken!");
        return;
    }

    verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    pendingRegistration = {
        name: name,
        email: email,
        password: pass,
        phone: phone,
        address: address,
        isBlocked: false,
        cartHistory: [],
        purchaseHistory: []
    };

    document.getElementById('reg-name').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-pass').value = '';
    document.getElementById('reg-phone').value = '';
    document.getElementById('reg-address').value = '';

    document.getElementById('verify-email-display').textContent = email;
    document.getElementById('verify-code-input').value = '';
    document.getElementById('verify-status').innerHTML = `<p style="margin:0;">Preparing to send verification email...</p>`;

    sendVerificationEmail(email).catch(() => {
        // continue to verification page even if EmailJS is not set up yet
    });

    showToast("Verification code process started for " + email);
    navigateTo(22);
}

function verifyEmail() {
    const enteredCode = document.getElementById('verify-code-input').value.trim();

    if (!enteredCode) {
        showToast("Please enter the verification code.");
        return;
    }

    if (enteredCode !== verificationCode) {
        showToast("Incorrect code. Please try again.");
        return;
    }

    customerRegistry.push(pendingRegistration);
    saveCustomerRegistry();
    currentUser = pendingRegistration;

    document.getElementById('verify-code-input').value = '';
    pendingRegistration = null;
    verificationCode = null;

    updateUserUI();
    renderShoes();
    showToast("Email verified! Account created successfully.");
    sendAdminNotification(
        "New ResourceMan account created",
        `A new account was verified for ${currentUser.name} <${currentUser.email}>.\nPhone: ${currentUser.phone || 'not provided'}\nAddress: ${currentUser.address || 'not provided'}`,
        currentUser.email
    );
    navigateTo(10);
}

function cancelVerification() {
    pendingRegistration = null;
    verificationCode = null;
    document.getElementById('verify-code-input').value = '';
    navigateTo(21);
}

function logout() {
    // Reset client state so the UI returns to guest/quest mode.
    currentUser = null;
    selectedItem = null;
    targetedOrderId = null;

    // Hide profile hub and show guest message.
    updateUserUI();

    // Re-render catalog with locked prices.
    renderShoes();
    renderTechProducts();
    renderOtherProducts();

    showToast("Session disconnected.");
    navigateTo(1);
}

function toggleBlockCustomer(email) {
    const client = customerRegistry.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (!client) return;

    // If admin toggles, admin access is enforced by UI state (currentUser.isAdmin).
    // Keep this function safe anyway.
    if (!currentUser || !currentUser.isAdmin) {
        showToast('Admin only.');
        return;
    }

    client.isBlocked = !client.isBlocked;
    saveCustomerRegistry();

    // If the blocked user is currently logged in, kick them out.
    if (client.isBlocked && currentUser && currentUser.email === client.email) {
        currentUser = null;
        updateUserUI();
        renderShoes();
    }

    showToast(`${client.name} has been ${client.isBlocked ? '⚠️ RESTRICTED' : '✅ REINSTATED'}`);
    buildAdminTerminalData();
}

function updateUserUI() {
    const customerView = document.getElementById('customer-view');
    const customerEmptyView = document.getElementById('customer-empty-view');
    const adminView = document.getElementById('admin-view');
    const navPortalText = document.getElementById('nav-portal-text'); // may be null if nav removed
    const adminNavButton = document.getElementById('nav-11');

    customerView.classList.add('hidden');
    customerEmptyView.classList.add('hidden');
    adminView.classList.add('hidden');
    adminNavButton.classList.add('hidden-admin-nav');

    if (currentUser) {

        if (currentUser.isAdmin) {
            adminView.classList.remove('hidden');
            adminNavButton.classList.remove('hidden-admin-nav');
            if (navPortalText) navPortalText.textContent = "Admin Control";
            buildAdminTerminalData();
        } else {
            customerView.classList.remove('hidden');
            if (navPortalText) navPortalText.textContent = "Profile";

            document.getElementById('customer-profile-title').textContent = `Hi, ${currentUser.name}!`;
            document.getElementById('customer-profile-subtitle').textContent = currentUser.email;
            document.getElementById('profile-name-text').textContent = currentUser.name;
            document.getElementById('profile-email-text').textContent = currentUser.email;
            document.getElementById('profile-phone-text').textContent = currentUser.phone || 'Not set';
            document.getElementById('profile-address-text').textContent = currentUser.address || 'Not set';
            document.getElementById('profile-status-text').textContent = currentUser.isBlocked ? 'Blocked' : 'Active';
            const cartCount = currentUser.cartHistory ? currentUser.cartHistory.length : 0;
            const purchaseCount = currentUser.purchaseHistory ? currentUser.purchaseHistory.length : 0;
            document.getElementById('profile-orders-count').textContent = purchaseCount || 0;


            document.getElementById('contact-phone').value = currentUser.phone || '';
            document.getElementById('contact-address').value = currentUser.address || '';

            if (typeof buildCustomerCartTable === 'function') buildCustomerCartTable();
            if (typeof buildCustomerPurchaseTable === 'function') buildCustomerPurchaseTable();
        }
    } else {
        if (navPortalText) navPortalText.textContent = "Profile";
        customerEmptyView.classList.remove('hidden');
    }

    renderShoes();
    renderTechProducts();
    renderOtherProducts();
}

function saveProfile() {
    if (!currentUser || currentUser.isAdmin) return;
    currentUser.phone = document.getElementById('contact-phone').value.trim();
    currentUser.address = document.getElementById('contact-address').value.trim();
    showToast("Shipping metrics updated successfully.");
}

function buildCustomerPurchaseTable() {
    const container = document.getElementById('customer-purchase-rows');
    if (!container) return;
    container.innerHTML = '';

    const purchase = currentUser?.purchaseHistory || [];

    if (purchase.length === 0) {
        container.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--text-muted); font-style: italic;">No purchases found.</td></tr>`;
        return;
    }

    purchase.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="mono-id">${order.id}</td>
            <td style="font-weight: 500; color: #ffffff;">${order.item}</td>
            <td>${order.cost}</td>
            <td>
                <span class="pill-status ${order.status === 'Delivered' ? 'pill-delivered' : 'pill-transit'}">
                    ${order.status}
                </span>
            </td>
            <td style="text-align: right;">
                <button onclick="askCancelOrder('${order.id}')" class="btn-cancel">Cancel Order</button>
            </td>
        `;
        container.appendChild(tr);
    });
}

function buildCustomerCartTable() {
    const container = document.getElementById('customer-cart-rows');
    if (!container) return;
    container.innerHTML = '';

            const cart = currentUser?.cartHistory || [];

    if (cart.length === 0) {
        container.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--text-muted); font-style: italic;">No items in cart yet.</td></tr>`;
        return;
    }

    cart.forEach(order => {

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="mono-id">${order.id}</td>
            <td style="font-weight: 500; color: #ffffff;">${order.item}</td>
            <td>${order.cost}</td>
            <td>
                <span class="pill-status ${order.status === 'Delivered' ? 'pill-delivered' : 'pill-transit'}">
                    ${order.status}
                </span>
            </td>
            <td style="text-align: right;">
                <button onclick="askCancelOrder('${order.id}')" class="btn-cancel">Cancel Order</button>
            </td>
        `;
        container.appendChild(tr);
    });
}

function askCancelOrder(orderId) {
    targetedOrderId = orderId;
    document.getElementById('cancel-reason-modal').classList.remove('hidden');
}

function closeCancelModal() {
    document.getElementById('cancel-reason-modal').classList.add('hidden');
    targetedOrderId = null;
}

function confirmCancelOrder() {
    if (!targetedOrderId || !currentUser) return;

    const selectedReasonEl = document.querySelector('input[name="cancel-reason"]:checked');
    const cancellationReason = selectedReasonEl ? selectedReasonEl.value : "No reason provided";

    const cart = currentUser.cartHistory || [];
    const purchase = currentUser.purchaseHistory || [];

    if (cart.some(o => o.id === targetedOrderId)) {
        currentUser.cartHistory = cart.filter(order => order.id !== targetedOrderId);
    }
    if (purchase.some(o => o.id === targetedOrderId)) {
        currentUser.purchaseHistory = purchase.filter(order => order.id !== targetedOrderId);
    }

    showToast(`Order ${targetedOrderId} cancelled. Reason: "${cancellationReason}"`);
    sendAdminNotification(

        "ResourceMan order cancellation",
        `Customer ${currentUser.name} <${currentUser.email}> cancelled order ${targetedOrderId}.\nReason: ${cancellationReason}`,
        currentUser.email
    );

    saveCustomerRegistry();
    closeCancelModal();
    if (typeof buildCustomerCartTable === 'function') buildCustomerCartTable();
    if (typeof buildCustomerPurchaseTable === 'function') buildCustomerPurchaseTable();
}


function buildAdminTerminalData() {
    document.getElementById('stat-profiles').textContent = customerRegistry.length;

    let totalOrdersCount = 0;
    let blockedCount = 0;

    customerRegistry.forEach(c => {
        totalOrdersCount += (c.purchaseHistory || []).length;

        if (c.isBlocked) blockedCount++;
    });

    document.getElementById('stat-orders').textContent = totalOrdersCount;
    document.getElementById('stat-blocked').textContent = blockedCount;

    const container = document.getElementById('admin-customer-rows');
    container.innerHTML = '';

    customerRegistry.forEach(client => {
        const tr = document.createElement('tr');
        if (client.isBlocked) tr.className = "row-blocked";

        let ordersSummary = (client.purchaseHistory || [])

            .map(h => `<div style="font-size: 12px; color: #a1a1aa;">${h.id}: ${h.item}</div>`)
            .join('') || '<span style="font-size: 12px; color: #52525b; font-style: italic;">No orders</span>';

        let contactBlock = `<div style="font-size: 12px; color: #e4e4e7;">${client.phone || 'No Phone'}</div><div style="font-size: 11px; color: var(--text-muted); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${client.address || 'No Address'}</div>`;

        tr.innerHTML = `
            <td>
                <div class="inline-block-tag" style="font-weight: 600; color: #ffffff;">
                    ${client.name}
                    ${client.isBlocked ? '<span class="badge-blocked-alert">Blocked</span>' : ''}
                </div>
            </td>
            <td style="font-family: monospace; font-size: 12px; color: #a1a1aa;">${client.email}</td>
            <td style="font-family: monospace; font-size: 12px; color: #eab308; font-weight: 700;">${client.password}</td>
            <td>${contactBlock}</td>
            <td>${ordersSummary}</td>
            <td style="text-align: center;">
                <button onclick="deleteCustomer('${client.email}')" class="btn-delete">Delete Customer</button>
            </td>
        `;

        container.appendChild(tr);
    });
}

function addToCart() {
    if (!selectedItem) return;

    const item = selectedItem;
    const quantityInput = parseInt(document.getElementById('modal-quantity').value, 10);
    const quantity = Number.isInteger(quantityInput) && quantityInput > 0 ? quantityInput : 1;

    if (!currentUser) {
        showToast("Please sign in to make a purchase.");
        closeShoeModal();
        navigateTo(10);
        return;
    }

    if (currentUser.isAdmin) {
        showToast("Admin profiles cannot issue checkout transactions.");
        closeShoeModal();
        return;
    }

    const rawPrice = item.price.replace(/[^0-9\.]/g, '').replace(/,/g, '');
    const baseValue = parseFloat(rawPrice) || 0;
    const totalValue = baseValue * quantity;
    const formattedTotal = `₱${totalValue.toLocaleString('en-US')}`;
    const displayName = quantity > 1 ? `${item.name} x${quantity}` : item.name;

    const txId = "TX-" + Math.floor(1000 + Math.random() * 9000);

    (currentUser.cartHistory || (currentUser.cartHistory = [])).unshift({

        id: txId,
        item: displayName,
        cost: formattedTotal,
        status: "In Transit"
    });

    saveCustomerRegistry();
    showToast(`Success! ${displayName} added to cart.`);
    if (typeof buildCustomerCartTable === 'function') buildCustomerCartTable();

    sendAdminNotification(
        "New ResourceMan purchase recorded",
        `Customer ${currentUser.name} <${currentUser.email}> purchased ${displayName} for ${formattedTotal}.\nOrder ID: ${txId}`,
        currentUser.email
    );
    closeShoeModal();
}

function sendTestEmail() {
    // generate a fresh code and attempt to send a verification email to admin
    verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        showToast('Preparing test verification...');
        // Try to send verification email to support/admin address
        sendVerificationEmail(EMAIL_SUPPORT_EMAIL)
            .then(() => {
                showToast('Test verification triggered (check fallback or inbox).');
            })
            .catch(() => {
                showToast('Test send failed. Check console for details.');
            });

        // Also send an admin notification (will use fallback if EmailJS unset)
        sendAdminNotification(
            'Test notification from ResourceMan',
            `This is a system test. Verification code: ${verificationCode}`,
            EMAIL_SUPPORT_EMAIL
        );
        // If EmailJS isn't configured, surface the code locally for quick testing
        if (!isEmailJsEnabled() || !window.emailjs) {
            console.log('Dev test verification code:', verificationCode);
            alert('Dev test verification code: ' + verificationCode);
        }
    } catch (err) {
        console.error('Test email error', err);
        showToast('Error while attempting test send.');
    }
}

function sendLiveTest() {
    if (!window.emailjs) {
        alert('EmailJS library not loaded. Make sure r4.html includes the EmailJS script.');
        return;
    }

    // If credentials not set, open a single configure prompt (saves to localStorage)
    if (!isEmailJsEnabled()) {
        const ok = configureEmailJs();
        if (!ok) { showToast('Live test cancelled'); return; }
    }

    // generate verification code and attempt a live send
    verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    sendVerificationEmail(EMAIL_SUPPORT_EMAIL)
        .then(() => {
            showToast('Live verification sent to ' + EMAIL_SUPPORT_EMAIL);
        })
        .catch(() => {
            showToast('Live send failed. Check console for details.');
        });

    sendAdminNotification('Live test notification', `Live test code: ${verificationCode}`, EMAIL_SUPPORT_EMAIL);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => toast.classList.add('hidden'), 2500);
}

window.onload = function () {
    loadCustomerRegistry();
    initEmailJS();
    renderShoes();
    renderTechProducts();
    renderOtherProducts();
    // Avoid showing/hiding profile-related DOM on initial load before any login
    currentUser = null;
    pendingRegistration = null;
    verificationCode = null;
    updateUserUI();
    navigateTo(1);


    const SECRET_SEQUENCE = 'qwerty';
    let secretBuffer = '';

    function tryUnlockAdminBySecretSequence() {
        const target = SECRET_SEQUENCE;
        const buf = secretBuffer.toLowerCase();
        if (buf.endsWith(target)) {
            // Unlock admin session via secret key sequence
            currentUser = { name: "System Admin", email: "admin@resourceman.com", isAdmin: true };
            secretBuffer = '';
            updateUserUI();
            renderShoes();
            showToast('Admin Terminal unlocked.');
            navigateTo(11);
        }
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === "Escape") {
            closeShoeModal();
            closeCancelModal();
            return;
        }

        // Ignore modifier combos
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        // Ignore keys with no actual character input
        if (e.key.length !== 1) return;

        // Buffer only letters (keeps it stable with other keys)
        if (!/[a-zA-Z]/.test(e.key)) {
            secretBuffer = '';
            return;
        }

        secretBuffer += e.key;
        if (secretBuffer.length > SECRET_SEQUENCE.length) {
            secretBuffer = secretBuffer.slice(-SECRET_SEQUENCE.length);
        }

        tryUnlockAdminBySecretSequence();
    });
};

