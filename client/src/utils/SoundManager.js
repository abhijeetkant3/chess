// Initialize the browser's audio engine
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Function to mathematically generate a musical note
function playSynthNote(frequency, type = 'sine', duration = 0.15, volume = 1) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type; // 'sine' (smooth piano-ish), 'square' (retro 8-bit), 'triangle' (guitar-ish)
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    // Fade out the sound naturally like a real instrument
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

export const playSound = (action) => {
    try {
        if (action === 'move') {
            // A clean, tech-sounding electric piano chord (A4 + E5)
            playSynthNote(440.00, 'sine', 0.2, 0.5); 
            playSynthNote(659.25, 'triangle', 0.2, 0.2); 
        } 
        else if (action === 'capture') {
            // A slightly lower, chunkier sound for taking a piece
            playSynthNote(220.00, 'triangle', 0.25, 0.6);
            playSynthNote(261.63, 'square', 0.15, 0.1);
        }
    } catch (error) {
        console.warn("Audio playback blocked by browser policy until user interacts with the page.");
    }
};