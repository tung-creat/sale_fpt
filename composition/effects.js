// effects.js
function addClickEffect(element) {
    if (!element) return;
    element.addEventListener('click', function() {
        this.classList.add('click-effect');
        setTimeout(() => this.classList.remove('click-effect'), 120);
    });
}

// Gắn hiệu ứng click
document.querySelectorAll('.btn-package, .btn-primary, .btn-secondary, .btn-register, .btn-register-speedx, #voucherClick, .nav-links span').forEach(addClickEffect);

// Hotline
const hotlineBtn = document.getElementById('hotlineBtn');
if (hotlineBtn) {
    addClickEffect(hotlineBtn);
    hotlineBtn.addEventListener('click', () => window.location.href = "tel:0386655386");
}

// Nav links
document.querySelectorAll('.nav-links span').forEach(link => {
    link.addEventListener('click', () => console.log('Điều hướng:', link.innerText));
});