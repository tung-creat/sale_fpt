// popup.js
const popup = document.getElementById('registerPopup');
const closePopupBtn = document.getElementById('closePopup');
const productInput = document.getElementById('product');
const productNameDisplay = document.getElementById('productNameDisplay');
const registerForm = document.getElementById('registerForm');
const submitBtn = document.getElementById('submitBtn');
const toastMsg = document.getElementById('toastMsg');

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbz1vCJ1A6eQgEKGq11Up7cKGGl_KbItYwUjBAOeLLIuaNLu6U6YTpZ9TkRrv4JbXVDL/exec";

function showToast(message, isError = false) {
    if (!toastMsg) return console.log(message);
    toastMsg.textContent = isError ? "❌ " + message : "✅ " + message;
    toastMsg.style.display = "block";
    setTimeout(() => { toastMsg.style.display = "none"; }, 3000);
}

function openPopup(productName) {
    if (productInput) productInput.value = productName;
    if (productNameDisplay) productNameDisplay.textContent = productName;
    if (popup) popup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePopup() {
    if (popup) popup.classList.remove('active');
    if (registerForm) registerForm.reset();
    if (productInput) productInput.value = "";
    document.body.style.overflow = '';
}

async function submitToGoogleSheet(formData) {
    try {
        await fetch(GOOGLE_SHEET_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        return true;
    } catch (error) {
        console.error('Lỗi gửi:', error);
        return false;
    }
}

// Form submit
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            product: document.getElementById('product')?.value || "",
            fullname: document.getElementById('fullname')?.value.trim() || "",
            phone: document.getElementById('phone')?.value.trim() || "",
            province: document.getElementById('province')?.value.trim() || "",
            address: document.getElementById('address')?.value.trim() || "",
            notes: document.getElementById('notes')?.value.trim() || ""
        };
        
        if (!formData.fullname || !formData.phone || !formData.province || !formData.address) {
            return showToast("Vui lòng điền đầy đủ thông tin (*)", true);
        }
        if (!/^[0-9]{10,11}$/.test(formData.phone)) {
            return showToast("Số điện thoại không hợp lệ (10-11 số)", true);
        }
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Đang gửi...';
        }
        
        const success = await submitToGoogleSheet(formData);
        
        if (success) {
            showToast("Đăng ký thành công! Nhân viên sẽ liên hệ trong 24h");
            closePopup();
        } else {
            showToast("Có lỗi xảy ra, vui lòng thử lại sau", true);
        }
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> GỬI ĐĂNG KÝ';
        }
    });
}

// Đóng popup
if (closePopupBtn) closePopupBtn.addEventListener('click', closePopup);
if (popup) popup.addEventListener('click', (e) => { if (e.target === popup) closePopup(); });
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup?.classList.contains('active')) closePopup();
});