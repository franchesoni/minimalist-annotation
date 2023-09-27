document.addEventListener('DOMContentLoaded', () => {
    // <<<<<<<<<<<<<<<<<< INITIALIZATION >>>>>>>>>>>>>>>>>>>>>>
    // initialization of elements
    const imgCanvas = document.getElementById('imgCanvas');
    const annCanvas = document.getElementById('annCanvas');
    const uploadForm = document.getElementById('uploadForm');
    const imageInput = document.getElementById('imageInput');
    const coordinates = document.getElementById('coordinates');
    const saveCropButton = document.getElementById('save-crop')
    const mouseCoordinates = document.getElementById('mouse-coordinates');
    const transparencySlider = document.getElementById('transparency');
    const imgCtx = imgCanvas.getContext('2d');
    const annCtx = annCanvas.getContext('2d');
    // create a new canvas that will hold the full annotation and we'll use similarly to the `image` variable
    const annHolderCanvas = document.createElement('canvas');
    const annHolderCtx = annHolderCanvas.getContext('2d');
    const maxWidth = 800
    const maxHeight = 800

    // initialization of variables
    let image = new Image();
    let scale = 1;
    let maxScale = 0;
    let offsetX = 0;
    let offsetY = 0;
    let mouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let cropCoordinates = 0;


    // <<<<<<<<<<<<<<<<<< API functions >>>>>>>>>>>>>>>>>>>>>>
    // frontend sends image to backend
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
    async function saveCrop(coords) {
        const res = await fetch('http://localhost:8008/saveCrop', {
            method: 'POST',
            body: JSON.stringify({
                crop: coords
            })
        })
        const response = await res.json();
        console.log(response);
    }



    // <<<<<<<<<<<<<<<<<<<<< UPLOAD/SAVECROP button >>>>>>>>>>>>>>>>>>>
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
                // Calculate the initial maximum scale
                scale = Math.min(maxWidth / image.width, maxHeight / image.height);
                maxScale = scale;

                // Reset the offset parameters
                offsetX = 0;
                offsetY = 0;

                // Apply the dimensions to the canvas without changing the scale
                imgCanvas.width = maxWidth;
                imgCanvas.height = maxHeight;
                annCanvas.width = maxWidth;
                annCanvas.height = maxHeight;
                annHolderCanvas.width = image.width;
                annHolderCanvas.height = image.height;

                // Draw the image at the correct scale
                drawImage();
                drawAnnotation();
            };
        };

        reader.readAsDataURL(selectedImage);
    });

    saveCropButton.addEventListener('click', async (event) => {
        saveCrop(cropCoordinates)
    })





    // <<<<<<<<<<<<<<<<<< DISPLAY function >>>>>>>>>>>>>>>>>>>>>>
    function drawImage() {
        imgCtx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
        imgCtx.drawImage(image, offsetX, offsetY, image.width * scale, image.height * scale);

        // Calculate the coordinates of the top-left point
        const topLeftX = -offsetX / scale;
        const topLeftY = -offsetY / scale;

        // Calculate the coordinates of the bottom-right point
        const bottomRightX = topLeftX + imgCanvas.width / scale;
        const bottomRightY = topLeftY + imgCanvas.height / scale;

        // Update the displayed coordinates
        cropCoordinates = `${topLeftX.toFixed(0)}, ${topLeftY.toFixed(0)}, ${bottomRightX.toFixed(0)}, ${bottomRightY.toFixed(0)}`
        coordinates.textContent = `Top Left: (${topLeftX.toFixed(2)}, ${topLeftY.toFixed(2)}) | Bottom Right: (${bottomRightX.toFixed(2)}, ${bottomRightY.toFixed(2)})`;

    }

    function drawAnnotation() {
        annCtx.clearRect(0, 0, annCanvas.width, annCanvas.height);
        annCtx.globalAlpha = transparencySlider.value;
        annCtx.drawImage(annHolderCanvas, offsetX, offsetY, image.width * scale, image.height * scale);
        annCtx.globalAlpha = 1;
    }


    transparencySlider.addEventListener('input', function () {
        drawAnnotation();
    });

    // <<<<<<<<<<<<<<<<<< INTERACTIONS, ZOOM and PAD >>>>>>>>>>>>>>>>>>>>>>
    annCanvas.addEventListener('mousedown', (e) => {
        mouseDown = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    annCanvas.addEventListener('mouseup', () => {
        mouseDown = false;
    });

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

        const minX = Math.min(0, imgCanvas.width - image.width * scale);
        const minY = Math.min(0, imgCanvas.height - image.height * scale);
        offsetX = Math.max(minX, Math.min(offsetX, 0));
        offsetY = Math.max(minY, Math.min(offsetY, 0));

        drawImage();
        drawAnnotation();
    }





    annCanvas.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const deltaX = (mouseX - lastMouseX) / scale;
            const deltaY = (mouseY - lastMouseY) / scale;

            offsetX += deltaX;
            offsetY += deltaY;

            const minX = Math.min(0, imgCanvas.width - image.width * scale);
            const minY = Math.min(0, imgCanvas.height - image.height * scale);
            offsetX = Math.max(minX, Math.min(offsetX, 0));
            offsetY = Math.max(minY, Math.min(offsetY, 0));

            drawImage();
            drawAnnotation();

            lastMouseX = mouseX;
            lastMouseY = mouseY;
        }
        // Get the coordinates of the mouse pointer relative to the canvas
        const mouseCanvasX = e.clientX - imgCanvas.getBoundingClientRect().left;
        const mouseCanvasY = e.clientY - imgCanvas.getBoundingClientRect().top;

        // Calculate the real coordinates in the image, taking into account the scale and offsets
        const imageX = (mouseCanvasX - offsetX) / scale;
        const imageY = (mouseCanvasY - offsetY) / scale;

        // Display the coordinates in the console in real-time
        mouseCoordinates.textContent = `Mouse: (${imageX.toFixed(2)}, ${imageY.toFixed(2)})`;
    });

    annCanvas.addEventListener('wheel', (e) => {
        const zoomSpeed = 0.001; // Adjust the zoom speed as needed
        const zoomDelta = e.deltaY * zoomSpeed;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        zoomToMouse(mouseX, mouseY, zoomDelta);
    });

    // Add click event listener to display coordinates in the console
    annCanvas.addEventListener('mousedown', (event) => {
        // Obtenez les coordonnées du clic par rapport au canvas
        const clickX = event.clientX - imgCanvas.getBoundingClientRect().left;
        const clickY = event.clientY - imgCanvas.getBoundingClientRect().top;

        // Calculez les coordonnées réelles dans l'image, en tenant compte de l'échelle et des offsets
        const imageX = (clickX - offsetX) / scale;
        const imageY = (clickY - offsetY) / scale;

        console.log(`Clic à (${imageX.toFixed(2)}, ${imageY.toFixed(2)})`);
        if (event.button === 0) {
            // Drawing an annotation on the annotation canvas
            annHolderCtx.strokeStyle = 'red';
            annHolderCtx.strokeRect(imageX, imageY, 50, 50);
        } else if (event.button === 2) {
            // Removing an annotation from the annotation canvas
            annHolderCtx.clearRect(0, 0, annHolderCanvas.width, annHolderCanvas.height);
        }
        drawAnnotation()

    });
    annCanvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

});

