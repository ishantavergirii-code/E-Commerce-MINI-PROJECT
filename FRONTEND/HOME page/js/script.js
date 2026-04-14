// Select core elements
const canvas = document.getElementById('hero-lightpass');
const context = canvas.getContext('2d');
const scrollContainer = document.getElementById('scroll-container');

// Text overlay elements
const text1 = document.getElementById('text1');
const text2 = document.getElementById('text2');
const text3 = document.getElementById('text3');

// Frame Details
const frameCount = 192;
const currentFrame = index => (
  `New folder/${index.toString().padStart(5, '0')}.png`
);

// Preload Images
const images = [];
const imageObj = new Image();

// Set up the first frame immediately before preloading the rest to ensure it shows up right away.
imageObj.src = currentFrame(1);
imageObj.onload = () => {
  context.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
};

// Start preloading the entire sequence
for (let i = 1; i <= frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  images.push(img);
}

// Variables for smooth scrolling (Linear Interpolation)
let targetProgress = 0; // Pure progress based on wheel [0, 1]
let currentProgress = 0; // Smoothed progress

// Helper block that interpolates our values smoothly
function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function resizeCanvas() {
    // Making it cover the screen like CSS object-fit: cover for canvas requires some logic,
    // or we can simply set its width/height to match window and draw images stretched or fitted.
    // For simplicity, typically we set the canvas internal resolution to the image's resolution.
    // Assuming 1920x1080 or similar.
    // Let's set standard 1080p, and CSS width:100%, height:100%, object-fit: cover will handle it.
    canvas.width = 1920; 
    canvas.height = 1080;
    requestAnimationFrame(() => updateCanvas(Math.floor(currentProgress * (frameCount - 1))));
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function updateCanvas(frameIndex) {
    if (images[frameIndex] && images[frameIndex].complete) {
        context.drawImage(images[frameIndex], 0, 0, canvas.width, canvas.height);
    } else {
       // if still loading, fallback to imageObj if it's the first frame
       if (frameIndex === 0 && imageObj.complete) {
          context.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
       }
    }
}

// Core animation loop
function updateAnimation() {
    // Only run if scrollContainer exists
    if (!scrollContainer) return;

    // Determine our scroll distance relative to the scroll container
    const containerRect = scrollContainer.getBoundingClientRect();
    
    const scrollStart = containerRect.top;
    const scrollRange = containerRect.height - window.innerHeight;
    
    let rawProgress = -scrollStart / scrollRange;
    
    // Clamp
    if(rawProgress < 0) rawProgress = 0;
    if(rawProgress > 1) rawProgress = 1;
    
    // Smooth progress
    targetProgress = rawProgress;
    currentProgress = lerp(currentProgress, targetProgress, 0.08); 
    
    // Map to frame index
    let frameIndex = Math.floor(currentProgress * (frameCount - 1));
    
    // Only update canvas if we are somewhat within or near the section
    if (containerRect.top < window.innerHeight && containerRect.bottom > 0) {
        updateCanvas(frameIndex);
    }

    // --- Handle Text Visibility Toggles based on Progress --- 
    if(text1 && text2 && text3) {
        if (currentProgress > 0.08 && currentProgress < 0.28) {
            text1.classList.add('active');
        } else {
            text1.classList.remove('active');
        }

        if (currentProgress > 0.42 && currentProgress < 0.62) {
            text2.classList.add('active');
        } else {
            text2.classList.remove('active');
        }

        if (currentProgress > 0.75 && currentProgress < 0.95) {
            text3.classList.add('active');
        } else {
            text3.classList.remove('active');
        }
    }

    requestAnimationFrame(updateAnimation);
}

// Start loop
requestAnimationFrame(updateAnimation);
