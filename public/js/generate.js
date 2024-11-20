import { generateImage } from './imageGenerator.js';

document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('promptInput');
    const generateButton = document.getElementById('generateButton');
    const suggestionsGrid = document.querySelector('.suggestions-grid');

    generateButton.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) return;

        try {
            generateButton.disabled = true;
            generateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

            const imageUrl = await generateImage(prompt);
            
            // Create a new suggestion item with the generated image
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item generated';
            
            // Add loading state while image loads
            suggestionItem.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
            
            // Create and load the image
            const img = new Image();
            img.onload = () => {
                suggestionItem.innerHTML = ''; // Remove loading spinner
                suggestionItem.style.backgroundImage = `url(${imageUrl})`;
                suggestionItem.style.backgroundSize = 'cover';
                suggestionItem.style.backgroundPosition = 'center';
            };
            img.onerror = () => {
                suggestionItem.innerHTML = '<div class="error-message">Failed to load image</div>';
            };
            img.src = imageUrl;

            // Add the new image to the grid
            const firstItem = suggestionsGrid.firstChild;
            suggestionsGrid.insertBefore(suggestionItem, firstItem);

        } catch (error) {
            console.error('Failed to generate image:', error);
            alert('Failed to generate image. Please try again.');
        } finally {
            generateButton.disabled = false;
            generateButton.innerHTML = '<i class="fas fa-magic"></i> Generate';
        }
    });
});