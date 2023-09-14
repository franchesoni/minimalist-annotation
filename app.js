// script.js

document.addEventListener('DOMContentLoaded', () => {
    const canvasContainer = document.getElementById('canvas-container');
    const canvas = document.getElementById('zoomable-canvas');
    const coordinatesElement = document.getElementById('coordinates');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = 'images/paysage.jpg'; // Remplacez par le chemin de votre image

    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let startX, startY;

    function updateCoordinates() {
        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;
    
        // Calculez les coordonnées du coin supérieur gauche de la zone visible
        const topLeftX = (-offsetX / scale);
        const topLeftY = (-offsetY / scale);
    
        // Calculez les coordonnées du coin inférieur droit de la zone visible
        const bottomRightX = topLeftX + (canvas.width / scale);
        const bottomRightY = topLeftY + (canvas.height / scale);
    
        coordinatesElement.textContent = `Coordonnées : (${topLeftX.toFixed(2)}, ${topLeftY.toFixed(2)}) - (${bottomRightX.toFixed(2)}, ${bottomRightY.toFixed(2)})`;
    }

    image.onload = () => {
        // Dessinez l'image d'origine sur le canvas
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        canvasContainer.addEventListener('wheel', (event) => {
            event.preventDefault();

            scale += event.deltaY * -0.01;
            scale = Math.min(Math.max(0.5, scale), 10000); // Limiter l'échelle entre 0.5x et 3x

            // Effacez le canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Redessinez l'image avec l'échelle actuelle
            const scaledWidth = image.width * scale;
            const scaledHeight = image.height * scale;

            // Mettez à jour les offsets pour conserver la position pendant le zoom
            offsetX = Math.min(Math.max(offsetX, canvas.width - scaledWidth), 0);
            offsetY = Math.min(Math.max(offsetY, canvas.height - scaledHeight), 0);

            ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

            updateCoordinates();
        });

        canvasContainer.addEventListener('mousedown', (event) => {
            isDragging = true;
            startX = event.clientX - canvasContainer.getBoundingClientRect().left;
            startY = event.clientY - canvasContainer.getBoundingClientRect().top;
        });

        canvasContainer.addEventListener('mousemove', (event) => {
            if (isDragging) {
                const currentX = event.clientX - canvasContainer.getBoundingClientRect().left;
                const currentY = event.clientY - canvasContainer.getBoundingClientRect().top;
                const dx = currentX - startX;
                const dy = currentY - startY;
                offsetX += dx;
                offsetY += dy;

                // Effacez le canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Redessinez l'image avec l'échelle actuelle et les nouveaux offsets
                const scaledWidth = image.width * scale;
                const scaledHeight = image.height * scale;
                offsetX = Math.min(Math.max(offsetX, canvas.width - scaledWidth), 0);
                offsetY = Math.min(Math.max(offsetY, canvas.height - scaledHeight), 0);
                ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

                startX = currentX;
                startY = currentY;

                updateCoordinates();
            }
        });

        canvasContainer.addEventListener('mouseup', () => {
            isDragging = false;
        });

        canvasContainer.addEventListener('mouseleave', () => {
            isDragging = false;
        });

        canvas.addEventListener('click', (event) => {
            // Obtenez les coordonnées du clic par rapport au canvas
            const clickX = event.clientX - canvas.getBoundingClientRect().left;
            const clickY = event.clientY - canvas.getBoundingClientRect().top;

            // Calculez les coordonnées réelles dans l'image, en tenant compte de l'échelle et des offsets
            const imageX = (clickX - offsetX) / scale;
            const imageY = (clickY - offsetY) / scale;

            console.log(`Clic à (${imageX}, ${imageY})`);
        });
    };
});