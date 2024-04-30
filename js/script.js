
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// Function to generate a random hexadecimal color
const randomColour = () => {
    const chars = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += chars[Math.floor(Math.random() * 16)];
    }
    return color;
};

// Function to generate an array of random colors
const generateRandomColors = (numColors) => {
    return Array.from({ length: numColors }, () => randomColour());
};

// Flag to check if the mouse has moved
let mouseMoved = false;

// Object to keep track of the mouse pointer's current position
const pointer = {
    x: 0.5 * window.innerWidth,
    y: 0.5 * window.innerHeight,
};

// Configuration parameters for the trail effect
const params = {
    pointsNumber: 30,
    widthFactor: 6,
    mouseThreshold: 0.5,
    spring: 0.25,
    friction: 0.6,
};

// Array of neon colors initialized with random colors
let neonColors = generateRandomColors(20);  // Generates 20 random colors initially

// Initialize the trail array to store trail segments
const trail = new Array(params.pointsNumber).fill(null).map(() => ({
    x: pointer.x,
    y: pointer.y,
    dx: 0,
    dy: 0,
    opacity: 1.0,
}));

// Event listeners for mouse and touch movements
window.addEventListener("click", (e) => {
    updateMousePosition(e.pageX, e.pageY);
});
window.addEventListener("mousemove", (e) => {
    mouseMoved = true;
    updateMousePosition(e.pageX, e.pageY);
});
window.addEventListener("touchmove", (e) => {
    mouseMoved = true;
    updateMousePosition(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
});

// Function to update the pointer's position
function updateMousePosition(eX, eY) {
    pointer.x = eX;
    pointer.y = eY;
}

// Setup the canvas size
function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateGradient();  // Update gradient on resize to adjust to new dimensions
}

// Function to update and apply a new gradient
function updateGradient() {
    var gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    neonColors.forEach((color, index) => {
        gradient.addColorStop(index / (neonColors.length - 1), color);
    });
    ctx.strokeStyle = gradient;
}

// Function to refresh colors and gradient every minute
setInterval(() => {
    neonColors = generateRandomColors(20);  // Refresh colors
    updateGradient();  // Update the gradient with new colors
}, 600);  

// Animation update function, called once per frame
function update(t) {
    if (!mouseMoved) {
        // Calculate a new position based on time for some automatic movement
        pointer.x = (0.5 + 0.8 * Math.cos(0.002 * t) * Math.sin(0.005 * t)) * window.innerWidth;
        pointer.y = (0.5 + 0.2 * Math.cos(0.005 * t) + 0.1 * Math.cos(0.001 * t)) * window.innerHeight;
    }

    // Clear the canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update trail segment positions
    trail.forEach((p, pIdx) => {
        const prev = pIdx === 0 ? pointer : trail[pIdx - 1];
        const spring = pIdx === 0 ? 0.4 * params.spring : params.spring;
        p.dx += (prev.x - p.x) * spring;
        p.dy += (prev.y - p.y) * spring;
        p.dx *= params.friction;
        p.dy *= params.friction;
        p.x += p.dx;
        p.y += p.dy;
    });

    // Start drawing the trail
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    for (let i = 1; i < trail.length - 1; i++) {
        const xc = 0.5 * (trail[i].x + trail[i + 1].x);
        const yc = 0.5 * (trail[i].y + trail[i + 1].y);
        ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
        ctx.lineWidth = params.widthFactor * (params.pointsNumber - i);
        ctx.stroke();
    }
    ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
    ctx.stroke();

    // Request the next frame for animation
    window.requestAnimationFrame(update);
}

// Initial setup and first update call
setupCanvas();
update(0);
window.addEventListener("resize", setupCanvas);
