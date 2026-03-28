// =========================================================================
// 1. XỬ LÝ ẢNH BANNER
// =========================================================================
function handleFullBannerError(imgElement) {
    if (imgElement.getAttribute('data-fallback') === 'true') return;
    imgElement.setAttribute('data-fallback', 'true');
    const parent = imgElement.parentNode;
    if (!parent) return;
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'img-fallback-full';
    fallbackDiv.innerHTML = `<i class="fas fa-futbol fa-4x"></i><h2>⚽ FPT Play | Ngoại Hạng Anh</h2><p>Trải nghiệm bóng đá đỉnh cao, 380 trận đấu mỗi mùa giải</p>`;
    parent.replaceChild(fallbackDiv, imgElement);
}

window.addEventListener('DOMContentLoaded', () => {
    const fullBannerImg = document.getElementById('fullWidthBannerImg');
    if (fullBannerImg && fullBannerImg.tagName === 'IMG') {
        if (fullBannerImg.complete && (fullBannerImg.naturalWidth === 0 || fullBannerImg.naturalHeight === 0)) {
            handleFullBannerError(fullBannerImg);
        } else {
            fullBannerImg.addEventListener('error', () => handleFullBannerError(fullBannerImg));
        }
    }
});

// =========================================================================
// 2. SLIDER - HÀM KHỞI TẠO CHUNG (ĐÃ SỬA LỖI SCROLL)
// =========================================================================
function initSlider(sliderId, prevId, nextId, scrollAmount = 340) {
    const slider = document.getElementById(sliderId);
    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    
    if (!slider) return;
    
    // Nút điều khiển
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
        nextBtn.addEventListener('click', () => slider.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
    }
    
    // Vuốt ngang KHÔNG ẢNH HƯỞNG SCROLL DỌC
    let startX = 0, startY = 0, scrollLeft = 0, isDragging = false, isHorizontal = false;
    
    slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX - slider.offsetLeft;
        startY = e.touches[0].pageY;
        scrollLeft = slider.scrollLeft;
        isDragging = true;
        isHorizontal = false;
    });
    
    slider.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const currentX = e.touches[0].pageX - slider.offsetLeft;
        const currentY = e.touches[0].pageY;
        const deltaX = Math.abs(currentX - startX);
        const deltaY = Math.abs(currentY - startY);
        
        // Xác định hướng vuốt (chỉ 1 lần)
        if (!isHorizontal && (deltaX > 8 || deltaY > 8)) {
            isHorizontal = deltaX > deltaY;
        }
        
        // CHỈ chặn sự kiện khi vuốt ngang
        if (isHorizontal) {
            e.preventDefault();
            const walk = (currentX - startX) * 1.2;
            slider.scrollLeft = scrollLeft - walk;
        }
        // Nếu vuốt dọc thì KHÔNG chặn, để scroll trang bình thường
    });
    
    slider.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    // Ẩn nút khi không cần
    function checkButtons() {
        if (prevBtn && nextBtn) {
            const show = slider.scrollWidth > slider.clientWidth;
            prevBtn.style.display = show ? 'flex' : 'none';
            nextBtn.style.display = show ? 'flex' : 'none';
        }
    }
    checkButtons();
    window.addEventListener('resize', checkButtons);
}

// =========================================================================
// 3. POPUP & GOOGLE SHEETS
// =========================================================================
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbz1vCJ1A6eQgEKGq11Up7cKGGl_KbItYwUjBAOeLLIuaNLu6U6YTpZ9TkRrv4JbXVDL/exec";

const popup = document.getElementById('registerPopup');
const closePopupBtn = document.getElementById('closePopup');
const productInput = document.getElementById('product');
const productNameDisplay = document.getElementById('productNameDisplay');
const registerForm = document.getElementById('registerForm');
const submitBtn = document.getElementById('submitBtn');
const toastMsg = document.getElementById('toastMsg');

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

if (closePopupBtn) closePopupBtn.addEventListener('click', closePopup);
if (popup) popup.addEventListener('click', (e) => { if (e.target === popup) closePopup(); });
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup?.classList.contains('active')) closePopup();
});

// =========================================================================
// 4. NÚT ĐĂNG KÝ - HÀM XỬ LÝ
// =========================================================================
function handleRegisterClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    let productName = this.getAttribute('data-package') || "";
    let productPrice = this.getAttribute('data-price') || "";
    
    if (!productName) {
        const parentCard = this.closest('.package-card');
        if (parentCard) {
            const nameElem = parentCard.querySelector('.package-name');
            if (nameElem) productName = nameElem.textContent.trim();
        }
        
        const speedxCard = this.closest('.speedx-card');
        if (speedxCard && !productName) {
            const nameElem = speedxCard.querySelector('.speedx-card-name');
            if (nameElem) productName = nameElem.textContent.trim();
        }
        
        const businessCard = this.closest('.business-card');
        if (businessCard && !productName) {
            const nameElem = businessCard.querySelector('.business-card-name');
            if (nameElem) productName = nameElem.textContent.trim();
        }
        
        const familyCard = this.closest('.family-card');
        if (familyCard && !productName) {
            const nameElem = familyCard.querySelector('.family-card-name');
            if (nameElem) productName = nameElem.textContent.trim();
        }
    }
    
    if (!productName) productName = "Gói cước FPT Telecom";
    if (productPrice) productName += " - " + productPrice;
    
    openPopup(productName);
}

function handleCTAClick(e) {
    e.preventDefault();
    const map = { dangkyBtn: "Combo Internet FPT + Ngoại Hạng Anh", nangcapBtn: "Nâng cấp Internet FPT + Ngoại Hạng Anh", voucherClick: "Voucher giảm 50K + Gói Internet" };
    openPopup(map[this.id] || "Gói cước FPT Telecom");
}

function bindAllRegisterButtons() {
     document.querySelectorAll('.btn-register, .btn-register-speedx, .btn-package').forEach(btn => {
        btn.removeEventListener('click', handleRegisterClick);
        btn.addEventListener('click', handleRegisterClick);
    });
    
    // Nút đăng ký Business section (màu xanh)
    document.querySelectorAll('.btn-register-business').forEach(btn => {
        btn.removeEventListener('click', handleRegisterClick);
        btn.addEventListener('click', handleRegisterClick);
    });
    
    // Các nút CTA chính
    ['dangkyBtn', 'nangcapBtn', 'voucherClick'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.removeEventListener('click', handleCTAClick);
            btn.addEventListener('click', handleCTAClick);
        }
    });
}

// =========================================================================
// 5. HIỆU ỨNG CLICK
// =========================================================================
function addClickEffect(el) {
    if (!el) return;
    el.addEventListener('click', function() {
        this.classList.add('click-effect');
        setTimeout(() => this.classList.remove('click-effect'), 120);
    });
}

// =========================================================================
// 6. SURVEY WIDGET
// =========================================================================
class SurveyWidget {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.userAnswers = { needs: [], devices: null, rooms: null };
        this.recommendedSpeed = 300;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateStepIndicator();
    }
    
    bindEvents() {
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', (e) => { e.stopPropagation(); this.handleOptionSelect(card); });
        });
        document.querySelectorAll('.btn-continue').forEach(btn => btn.addEventListener('click', () => this.nextStep()));
        document.querySelectorAll('.btn-back').forEach(btn => btn.addEventListener('click', () => this.prevStep()));
        const restartBtn = document.getElementById('btnRestart');
        if (restartBtn) restartBtn.addEventListener('click', () => this.restartSurvey());
    }
    
    handleOptionSelect(card) {
        const step = this.currentStep;
        const speedMap = { 25: 300, 28: 300, 31: 500, 34: 1000 };
        const deviceCodeMap = { '2-3': '1', '4-6': '2', '7-9': '3', '10+': '4' };
        const roomCodeMap = { '1': '1', '2': '2', '3+': '3' };
        
        if (step === 1) {
            const needCode = parseInt(card.getAttribute('data-option'));
            if (card.classList.contains('selected')) {
                card.classList.remove('selected');
                this.userAnswers.needs = this.userAnswers.needs.filter(n => n !== needCode);
            } else {
                card.classList.add('selected');
                this.userAnswers.needs.push(needCode);
            }
            let maxSpeed = 300;
            this.userAnswers.needs.forEach(need => { if (speedMap[need] > maxSpeed) maxSpeed = speedMap[need]; });
            this.recommendedSpeed = maxSpeed;
        } 
        else if (step === 2) {
            card.parentElement.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            this.userAnswers.devices = card.getAttribute('data-option');
            this.userAnswers.devicesCode = deviceCodeMap[this.userAnswers.devices] || '1';
            this.recommendedSpeed = Math.max(this.recommendedSpeed, parseInt(card.getAttribute('data-value')) || 300);
        } 
        else if (step === 3) {
            card.parentElement.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            this.userAnswers.rooms = card.getAttribute('data-option');
            this.userAnswers.roomsCode = roomCodeMap[this.userAnswers.rooms] || '1';
            this.recommendedSpeed = Math.max(this.recommendedSpeed, parseInt(card.getAttribute('data-value')) || 300);
        }
        this.updateRecommendedSpeed();
    }
    
    updateRecommendedSpeed() {
        const span = document.querySelector(`.step-content.active .recommended-speed`);
        if (span) span.textContent = `${this.recommendedSpeed} Mbps`;
    }
    
    validateCurrentStep() {
        if (this.currentStep === 1 && this.userAnswers.needs.length === 0) {
            showToast("Vui lòng chọn ít nhất một mục đích sử dụng", true);
            return false;
        }
        if (this.currentStep === 2 && !this.userAnswers.devices) {
            showToast("Vui lòng chọn số lượng thiết bị", true);
            return false;
        }
        if (this.currentStep === 3 && !this.userAnswers.rooms) {
            showToast("Vui lòng chọn số phòng", true);
            return false;
        }
        return true;
    }
    
    nextStep() {
        if (!this.validateCurrentStep()) return;
        this.currentStep < this.totalSteps ? this.goToStep(this.currentStep + 1) : this.showResults();
    }
    
    prevStep() { if (this.currentStep > 1) this.goToStep(this.currentStep - 1); }
    
    goToStep(step) {
        document.querySelectorAll('.step-content').forEach(c => c.classList.remove('active'));
        const target = document.querySelector(`.step-content[data-step="${step}"]`);
        if (target) {
            target.classList.add('active');
            this.currentStep = step;
            this.updateStepIndicator();
            if (step !== 4) {
                const span = target.querySelector('.recommended-speed');
                if (span) span.textContent = `${this.recommendedSpeed} Mbps`;
            }
        }
    }
    
    updateStepIndicator() {
        const stepNumber = document.getElementById('step-number');
        const progressRing = document.getElementById('progress-ring');
        if (stepNumber) stepNumber.textContent = this.currentStep;
        if (progressRing) {
            const radius = 31;
            const circumference = 2 * Math.PI * radius;
            progressRing.style.strokeDashoffset = circumference - (this.currentStep / this.totalSteps) * circumference;
        }
    }
    
    async showResults() {
        const container = document.getElementById('surveyPackageResults');
        const loading = document.querySelector('.loading-state');
        const results = document.querySelector('.package-results');
        if (loading) loading.style.display = 'flex';
        if (results) results.style.display = 'none';
        
        const packages = await this.fetchRecommendedPackages();
        
        if (loading) loading.style.display = 'none';
        if (results) results.style.display = 'flex';
        
        this.renderResults(packages, container);
        const finalSpan = document.getElementById('finalRecommendedSpeed');
        if (finalSpan) finalSpan.textContent = `${this.recommendedSpeed} Mbps`;
        this.goToStep(4);
    }
    
    async fetchRecommendedPackages() {
        const payload = {
            CategoryId: "1", SaleTeamId: "29", LocationId: "0", DistrictId: 1, WardId: 1,
            BuildingId: "0", Count: "6",
            specifications: {
                Needs: this.userAnswers.needs,
                Devices: this.userAnswers.devicesCode || "1",
                Rooms: this.userAnswers.roomsCode || "1"
            }
        };
        try {
            const res = await fetch("https://fpt.vn/api/v2/survey/suggest-packages", {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.data) return data.data;
            }
            throw new Error();
        } catch (error) {
            showToast('Không thể kết nối, hiển thị gợi ý mặc định', true);
            return this.getFallbackPackages();
        }
    }
    
    getFallbackPackages() {
        return [
            { displayName: "Internet Giga", price: "195.000", unit: "/tháng", downloadSpeed: "300 Mbps", uploadSpeed: "300 Mbps", features: ["Modem Wi-Fi 6", "Kết nối lên đến 10 thiết bị"], buyLink: "https://fpt.vn/shop/internet/register/goi-giga", detailLink: "https://fpt.vn/internet/goi-giga", image: "https://hi-static.fpt.vn/sys/shop/prod/2025-11-13/6915e660eff1b_Internet%20Giga.jpg", tag: { tag_name: "Phổ biến", bg_color: "#ff1a6a" } },
            { displayName: "FPT An Tâm", price: "195.000", unit: "/tháng", downloadSpeed: "300 Mbps", uploadSpeed: "300 Mbps", features: ["Modem Wi-Fi 6", "Bảo mật an toàn F-Safe", "Chặn trang web độc hại"], buyLink: "https://fpt.vn/shop/internet/register/goi-an-tam", detailLink: "https://fpt.vn/internet/goi-an-tam", image: "https://hi-static.fpt.vn/sys/shop/prod/2025-11-13/6915eeb9ad0b3_FPT%20an%20t%C3%A2m.jpg", tag: { tag_name: "Nổi bật", bg_color: "#3700ff" } },
            { displayName: "Internet F-Game", price: "225.000", unit: "/tháng", downloadSpeed: "1 Gbps", uploadSpeed: "300 Mbps", features: ["Modem Wi-Fi 6", "Tích hợp Ultra Fast hỗ trợ 50+ tựa game", "Giảm độ trễ tới 16ms"], buyLink: "https://fpt.vn/shop/internet/register/goi-f-game", detailLink: "https://fpt.vn/internet/goi-f-game", image: "https://hi-static.fpt.vn/sys/shop/prod/2025-11-13/6915ecfeb852d_G%C3%B3i%20FGame.jpg", tag: { tag_name: "Nổi bật", bg_color: "#3700ff" } }
        ];
    }
    
    renderResults(packages, container) {
        if (!container) return;
        if (!packages?.length) return container.innerHTML = '<p style="text-align:center; padding:2rem;">Không tìm thấy gói cước phù hợp.</p>';
        
        container.innerHTML = packages.map(pkg => {
            const tagColor = pkg.tag?.bg_color || '#ff5e1a';
            const tagText = pkg.tag?.tag_name || 'Ưu đãi';
            const price = pkg.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            return `
                <div class="package-card">
                    <div class="package-img-wrapper"><img src="${pkg.image}" class="package-img"><div class="popular-badge" style="background:${tagColor}">${tagText}</div></div>
                    <div class="package-content">
                        <h3 class="package-name">${pkg.displayName}</h3>
                        <p class="package-desc">Phù hợp với nhu cầu của bạn</p>
                        <div class="package-price">${price}đ <span class="price-period">${pkg.unit}</span></div>
                        <div class="speed"><div class="speed-label">Tốc độ (Download/Upload)</div><div class="speed-value"><span><i class="fas fa-arrow-down"></i> ${pkg.downloadSpeed}</span><span><i class="fas fa-arrow-up"></i> ${pkg.uploadSpeed}</span></div></div>
                        <ul class="features-list">${(pkg.features || []).map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('')}</ul>
                        <div class="card-buttons"><button class="btn-register" data-package="${pkg.displayName}" data-price="${price}đ">ĐĂNG KÝ NGAY <i class="fas fa-arrow-right"></i></button><a href="${pkg.detailLink}" class="btn-detail" target="_blank">Xem chi tiết <i class="fas fa-chevron-right"></i></a></div>
                    </div>
                </div>`;
        }).join('');
        bindAllRegisterButtons();
    }
    
    restartSurvey() {
        this.currentStep = 1;
        this.userAnswers = { needs: [], devices: null, rooms: null };
        this.recommendedSpeed = 300;
        document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        document.querySelectorAll('.recommended-speed').forEach(s => s.textContent = '300 Mbps');
        this.goToStep(1);
        this.updateStepIndicator();
    }
}

// =========================================================================
// 7. KHỞI TẠO TẤT CẢ
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo sliders
    initSlider('packagesSlider', 'slidePrev', 'slideNext');
    initSlider('comboPackagesSlider', 'comboSlidePrev', 'comboSlideNext');
    initSlider('speedxSlider', 'speedxPrev', 'speedxNext');
    
    // Khởi tạo nút đăng ký
    bindAllRegisterButtons();
    
    // Khởi tạo hiệu ứng click
    document.querySelectorAll('.btn-package, .btn-primary, .btn-secondary, .btn-register, .btn-register-speedx, #voucherClick, .nav-links span').forEach(addClickEffect);
    
    // Hotline
    const hotline = document.getElementById('hotlineBtn');
    if (hotline) {
        addClickEffect(hotline);
        hotline.addEventListener('click', () => window.location.href = "tel:0386655386");
    }
    
    // Nav links
    document.querySelectorAll('.nav-links span').forEach(link => {
        link.addEventListener('click', () => console.log('Điều hướng:', link.innerText));
    });
    
    // Khởi tạo survey
    new SurveyWidget();
});

// Observer cho nút đăng ký được thêm động
const observer = new MutationObserver(() => bindAllRegisterButtons());
observer.observe(document.body, { childList: true, subtree: true });
// ========== BUSINESS SLIDER ==========
const businessSlider = document.getElementById('businessSlider');
const businessPrev = document.getElementById('businessPrev');
const businessNext = document.getElementById('businessNext');

if (businessSlider && businessPrev && businessNext) {
    businessPrev.addEventListener('click', () => {
        businessSlider.scrollBy({ left: -360, behavior: 'smooth' });
    });
    
    businessNext.addEventListener('click', () => {
        businessSlider.scrollBy({ left: 360, behavior: 'smooth' });
    });
    
    // Hỗ trợ vuốt trên mobile
    let businessStartX = 0;
    let businessStartY = 0;
    let businessScrollLeft = 0;
    let businessIsDragging = false;
    let businessIsHorizontal = false;
    
    businessSlider.addEventListener('touchstart', (e) => {
        businessStartX = e.touches[0].pageX - businessSlider.offsetLeft;
        businessStartY = e.touches[0].pageY;
        businessScrollLeft = businessSlider.scrollLeft;
        businessIsDragging = true;
        businessIsHorizontal = false;
    });
    
    businessSlider.addEventListener('touchmove', (e) => {
        if (!businessIsDragging) return;
        
        const currentX = e.touches[0].pageX - businessSlider.offsetLeft;
        const currentY = e.touches[0].pageY;
        const deltaX = Math.abs(currentX - businessStartX);
        const deltaY = Math.abs(currentY - businessStartY);
        
        if (!businessIsHorizontal && (deltaX > 8 || deltaY > 8)) {
            businessIsHorizontal = deltaX > deltaY;
        }
        
        if (businessIsHorizontal) {
            e.preventDefault();
            const walk = (currentX - businessStartX) * 1.2;
            businessSlider.scrollLeft = businessScrollLeft - walk;
        }
    });
    
    businessSlider.addEventListener('touchend', () => {
        businessIsDragging = false;
    });
}
// ========== FOOTER LINKS ==========
document.querySelectorAll('.footer-column ul li a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const text = link.textContent;
        console.log('Footer link clicked:', text);
        
        // Có thể thêm xử lý chuyển hướng hoặc scroll tới section tương ứng
        if (text === 'Thanh toán hóa đơn') {
            window.open('https://fpt.vn/thanh-toan', '_blank');
        } else if (text === 'Tìm điểm giao dịch') {
            window.open('https://fpt.vn/diem-giao-dich', '_blank');
        } else if (text === 'Khuyến mãi') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Mặc định mở link FPT
            window.open('https://fpt.vn', '_blank');
        }
    });
});
// ========== FAMILY SLIDER ==========
const familySlider = document.getElementById('familySlider');
const familyPrev = document.getElementById('familyPrev');
const familyNext = document.getElementById('familyNext');

if (familySlider && familyPrev && familyNext) {
    familyPrev.addEventListener('click', () => {
        familySlider.scrollBy({ left: -360, behavior: 'smooth' });
    });
    
    familyNext.addEventListener('click', () => {
        familySlider.scrollBy({ left: 360, behavior: 'smooth' });
    });
    
    // Hỗ trợ vuốt trên mobile
    let familyStartX = 0, familyStartY = 0, familyScrollLeft = 0, familyIsDragging = false, familyIsHorizontal = false;
    
    familySlider.addEventListener('touchstart', (e) => {
        familyStartX = e.touches[0].pageX - familySlider.offsetLeft;
        familyStartY = e.touches[0].pageY;
        familyScrollLeft = familySlider.scrollLeft;
        familyIsDragging = true;
        familyIsHorizontal = false;
    });
    
    familySlider.addEventListener('touchmove', (e) => {
        if (!familyIsDragging) return;
        const currentX = e.touches[0].pageX - familySlider.offsetLeft;
        const currentY = e.touches[0].pageY;
        const deltaX = Math.abs(currentX - familyStartX);
        const deltaY = Math.abs(currentY - familyStartY);
        
        if (!familyIsHorizontal && (deltaX > 8 || deltaY > 8)) {
            familyIsHorizontal = deltaX > deltaY;
        }
        
        if (familyIsHorizontal) {
            e.preventDefault();
            familySlider.scrollLeft = familyScrollLeft - (currentX - familyStartX) * 1.2;
        }
    });
    
    familySlider.addEventListener('touchend', () => {
        familyIsDragging = false;
    });
}

// ========== SCROLL ĐẾN SECTION KHI CLICK LINK ==========
function scrollToFamilySection() {
    const familySection = document.getElementById('family-section');
    if (familySection) {
        familySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Gắn sự kiện click cho link "Xem gói Internet gia đình FPT"
document.querySelectorAll('.location-mobile, .highlight-blue, #location-mobile').forEach(link => {
    if (link && link.textContent.includes('Chọn vị trí') || link.classList.contains('highlight-blue')) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToFamilySection();
        });
    }
});

// Gắn sự kiện cho các nút đăng ký Family
document.querySelectorAll('.btn-register-family').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const packageName = btn.getAttribute('data-package') || "Gói Internet Gia Đình";
        const packagePrice = btn.getAttribute('data-price') || "";
        openPopup(packageName + (packagePrice ? " - " + packagePrice : ""));
    });
});

// Cập nhật hàm bindAllRegisterButtons để bao gồm family buttons
function bindAllRegisterButtons() {
    // Các nút cũ
    document.querySelectorAll('.btn-register, .btn-register-speedx, .btn-package, .btn-register-business').forEach(btn => {
        btn.removeEventListener('click', handleRegisterClick);
        btn.addEventListener('click', handleRegisterClick);
    });
    
    // Nút family
    document.querySelectorAll('.btn-register-family').forEach(btn => {
        btn.removeEventListener('click', handleRegisterClick);
        btn.addEventListener('click', handleRegisterClick);
    });
    
    // Các nút CTA chính
    ['dangkyBtn', 'nangcapBtn', 'voucherClick'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.removeEventListener('click', handleCTAClick);
            btn.addEventListener('click', handleCTAClick);
        }
    });
}
