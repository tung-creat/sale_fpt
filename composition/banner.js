// banner.js
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