function detectMobile() {
    let isMobile = /iPhone|iPad|iPod|Android|Mobile/.test(navigator.userAgent);
    
    return isMobile;
}