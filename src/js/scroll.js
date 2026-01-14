export function initLenisScroll() {
    if (typeof Lenis === 'undefined') {
        console.warn('Lenis scroll library not found. Falling back to default scroll.');
        return null;
    }
    
    const lenis = new Lenis({
        duration: 0.8,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.8,
        smoothTouch: false,
        touchMultiplier: 1.5,
        infinite: false,
        lerp: 0.1
    });

    function raf(time) {
        if (lenis) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
    }

    requestAnimationFrame(raf);
    return lenis;
}
