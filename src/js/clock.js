export function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (!dateElement) return;
    
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
}

export function startLiveClock() {
    const timeElement = document.getElementById('currentTime');
    if (!timeElement) return;
    
    function update() {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: true 
        });
    }
    
    update();
    setInterval(update, 1000);
}
