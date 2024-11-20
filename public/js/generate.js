import { generateImage } from './imageGenerator.js';

document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('promptInput');
    const generateButton = document.getElementById('generateButton');
    const imagesTimeline = document.querySelector('.images-timeline');
    const promptChips = document.querySelectorAll('.prompt-chip');

    // Handle prompt chip clicks
    promptChips.forEach(chip => {
        chip.addEventListener('click', () => {
            promptInput.value = chip.textContent;
            generateButton.click();
        });
    });

    generateButton.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) return;

        try {
            generateButton.disabled = true;
            generateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

            const imageUrl = await generateImage(prompt);
            
            // Create new timeline item
            const timelineItem = document.createElement('div');
            timelineItem.className = 'generated-item';
            
            // Add loading state
            timelineItem.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
            `;
            
            // Insert at the top of the timeline
            imagesTimeline.insertBefore(timelineItem, imagesTimeline.firstChild);
            
            // Load the image
            const img = new Image();
            img.onload = () => {
                timelineItem.innerHTML = `
                    <img src="${imageUrl}" alt="${prompt}">
                    <div class="prompt-text">${prompt}</div>
                    <div class="timestamp">${new Date().toLocaleString()}</div>
                `;
            };
            img.onerror = () => {
                timelineItem.innerHTML = '<div class="error-message">Failed to load image</div>';
            };
            img.src = imageUrl;

        } catch (error) {
            console.error('Failed to generate image:', error);
            alert('Failed to generate image. Please try again.');
        } finally {
            generateButton.disabled = false;
            generateButton.innerHTML = '<i class="fas fa-magic"></i> Generate';
        }
    });
});