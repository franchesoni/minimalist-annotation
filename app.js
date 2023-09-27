document.addEventListener('DOMContentLoaded', () => {
    const canvasContainer = document.getElementById('canvas-container');
    const canvas = document.getElementById('zoomable-canvas');
    const uploadForm = document.getElementById('uploadForm');
    const imageInput = document.getElementById('imageInput');
    const coordinates = document.getElementById('coordinates');
    const saveCropButton = document.getElementById('save-crop')
    const mouseCoordinates = document.getElementById('mouse-coordinates');
    const ctx = canvas.getContext('2d');

    let image = new Image();
    let scale = 1;
    let maxScale = 0;
    let offsetX = 0;
    let offsetY = 0;
    let mouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let cropCoordonnates = 0;
    let pixelization = 0;

    async function sendImage(file) {
        const formData = new FormData();
        formData.append('file', file)
        const res = await fetch('http://localhost:8008/uploadImage', {
            method: 'POST',
            body: formData
        })
        const response = await res.json();
        console.log(response);
    }

    function pixelateImage(image, pixelSize) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = image.width;
        const height = image.height;

        // Définir les dimensions du canvas en fonction de la taille des pixels
        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image sur le canvas
        ctx.drawImage(image, 0, 0, width, height);

        // Effectuer la pixelisation
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(canvas, 0, 0, width / pixelSize, height / pixelSize);

        // Redimensionner l'image pour obtenir l'effet pixelisé
        ctx.drawImage(canvas, 0, 0, width / pixelSize, height / pixelSize, 0, 0, width, height);

        // Créer une nouvelle image avec l'effet de pixelisation
        const pixelatedImage = new Image();
        pixelatedImage.src = canvas.toDataURL('image/png');
        return pixelatedImage;
    }

    function drawImage() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, offsetX, offsetY, image.width * scale, image.height * scale);

        // Calculate the coordinates of the top-left point
        const topLeftX = -offsetX / scale;
        const topLeftY = -offsetY / scale;

        // Calculate the coordinates of the bottom-right point
        const bottomRightX = topLeftX + canvas.width / scale;
        const bottomRightY = topLeftY + canvas.height / scale;

        // Update the displayed coordinates
        cropCoordonnates = `${topLeftX.toFixed(0)}, ${topLeftY.toFixed(0)}, ${bottomRightX.toFixed(0)}, ${bottomRightY.toFixed(0)}`
        coordinates.textContent = `Top Left: (${topLeftX.toFixed(2)}, ${topLeftY.toFixed(2)}) | Bottom Right: (${bottomRightX.toFixed(2)}, ${bottomRightY.toFixed(2)})`;

    }

    function zoomToMouse(mouseX, mouseY, delta) {
        const newScale = scale - delta;
        const mouseCanvasX = (mouseX - offsetX) / scale;
        const mouseCanvasY = (mouseY - offsetY) / scale;
        const newOffsetX = mouseX - mouseCanvasX * newScale;
        const newOffsetY = mouseY - mouseCanvasY * newScale;

        if (newScale < maxScale) {
            return;
        }

        scale = newScale;
        offsetX = newOffsetX;
        offsetY = newOffsetY;

        const minX = Math.min(0, canvas.width - image.width * scale);
        const minY = Math.min(0, canvas.height - image.height * scale);
        offsetX = Math.max(minX, Math.min(offsetX, 0));
        offsetY = Math.max(minY, Math.min(offsetY, 0));

        drawImage();
    }



    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get the image file selected by the user
        const selectedImage = imageInput.files[0];

        if (!selectedImage) {
            alert('No image selected.');
            return;
        }
        sendImage(selectedImage)
        // Load the selected image into the canvas
        const reader = new FileReader();
        reader.onload = (event) => {
            image.src = event.target.result;

            image.onload = () => {
                // Calculate the maximum dimensions for the canvas
                const maxWidth = canvasContainer.clientWidth;
                const maxHeight = canvasContainer.clientHeight;

                // Calculate the initial maximum scale
                scale = Math.min(maxWidth / image.width, maxHeight / image.height);
                maxScale = scale;

                // Reset the offset parameters
                offsetX = 0;
                offsetY = 0;

                // Apply the dimensions to the canvas without changing the scale
                canvas.width = maxWidth;
                canvas.height = maxHeight;

                image = pixelateImage(image, pixelization);
                // Draw the image at the correct scale
                drawImage();
            };
        };

        reader.readAsDataURL(selectedImage);
    });

    canvas.addEventListener('mousedown', (e) => {
        mouseDown = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    canvas.addEventListener('mouseup', () => {
        mouseDown = false;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const deltaX = (mouseX - lastMouseX) / scale;
            const deltaY = (mouseY - lastMouseY) / scale;

            offsetX += deltaX;
            offsetY += deltaY;

            const minX = Math.min(0, canvas.width - image.width * scale);
            const minY = Math.min(0, canvas.height - image.height * scale);
            offsetX = Math.max(minX, Math.min(offsetX, 0));
            offsetY = Math.max(minY, Math.min(offsetY, 0));

            drawImage();

            lastMouseX = mouseX;
            lastMouseY = mouseY;
        }
        // Get the coordinates of the mouse pointer relative to the canvas
        const mouseCanvasX = e.clientX - canvas.getBoundingClientRect().left;
        const mouseCanvasY = e.clientY - canvas.getBoundingClientRect().top;

        // Calculate the real coordinates in the image, taking into account the scale and offsets
        const imageX = (mouseCanvasX - offsetX) / scale;
        const imageY = (mouseCanvasY - offsetY) / scale;

        // Display the coordinates in the console in real-time
        mouseCoordinates.textContent = `Mouse: (${imageX.toFixed(2)}, ${imageY.toFixed(2)})`;
    });

    canvas.addEventListener('wheel', (e) => {
        const zoomSpeed = 0.001; // Adjust the zoom speed as needed
        const zoomDelta = e.deltaY * zoomSpeed;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        zoomToMouse(mouseX, mouseY, zoomDelta);
    });

    // Add click event listener to display coordinates in the console
    canvas.addEventListener('click', (event) => {
        // Obtenez les coordonnées du clic par rapport au canvas
        const clickX = event.clientX - canvas.getBoundingClientRect().left;
        const clickY = event.clientY - canvas.getBoundingClientRect().top;

        // Calculez les coordonnées réelles dans l'image, en tenant compte de l'échelle et des offsets
        const imageX = (clickX - offsetX) / scale;
        const imageY = (clickY - offsetY) / scale;

        console.log(`Clic à (${imageX.toFixed(2)}, ${imageY.toFixed(2)})`);
    });
    saveCropButton.addEventListener('click', async (event) => {
        const res = await fetch('http://localhost:8008/saveCrop', {
            method: 'POST',
            body: JSON.stringify({
                crop: cropCoordonnates
            })
        })
        const response = await res.json();
        console.log(response);
    })
});
