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

    const prevButton = document.getElementById('previous-button');
    const nextButton = document.getElementById('next-button');

    const transparencySlider = document.getElementById('transparency');
    const imgCtx = imgCanvas.getContext('2d');
    const annCtx = annCanvas.getContext('2d');
    // create a new canvas that will hold the full annotation and we'll use similarly to the `image` variable
    const annHolderCanvas = document.createElement('canvas');
    const annHolderCtx = annHolderCanvas.getContext('2d');
    const maxWidth = 800
    const maxHeight = 800
    const apiAddress = 'http://127.0.0.1:8008'

    // initialization of variables    
    let image = new Image();
    let scale = 1;
    let maxScale = 0;
    let offsetX = 0;
    let offsetY = 0;
    let isPadding = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let cropCoordinates = 0;
    let imageIndex = 0
    let numImages = 0
    let filepath = ''
    let annotation = {
        'bboxes': [],
        'clicks': [],
        'text': ''
    };




    // <<<<<<<<<<<<<<<<<< IMAGE LOADING >>>>>>>>>>>>>>>>>>>>>>
    async function handleGetImageResponse(res) {
        if (res.ok) {
            // Get the image URL from the response
            const imageUrl = URL.createObjectURL(await res.blob());
            imageIndex = res.headers.get('imageIndex')
            numImages = res.headers.get('numImages')
            annotation = JSON.parse(res.headers.get('ann').replace(/'/g, '"'));
            window.annotation = annotation
            filepath = res.headers.get('filepath')
            console.log('>>>--------------')
            console.log('filepath:', filepath)
            console.log('annotation:', annotation)
            console.log('imageIndex:', imageIndex)
            console.log('numImages:', numImages)
            console.log('--------------<<<')
            return imageUrl;
        } else {
            // Handle errors, for example, return null in case of an error
            return null;
        }
    }



    async function getFirstImageURL() {
        const res = await fetch(`${apiAddress}/getFirstImage`, {
            headers: {
                'Cache-Control': 'no-cache',
            },
        });
        return handleGetImageResponse(res)
    }

    async function getNextImageURL() {
        const res = await fetch(`${apiAddress}/getNextImage`, {
            headers: {
                'Cache-Control': 'no-cache',
            },
        });
        return handleGetImageResponse(res)
    }

    async function getPrevImageURL() {
        const res = await fetch(`${apiAddress}/getPrevImage`, {
            headers: {
                'Cache-Control': 'no-cache',
            },
        });
        return handleGetImageResponse(res)
    }

    async function loadFirstImage() {
        const firstImageURL = await getFirstImageURL();
        if (firstImageURL) {
            loadImage(firstImageURL)
            // The rest of the code to load and display the image
        } else {
            // Handle the case where no image is available
            console.log("No image available.");
        }
    }

    function loadImage(imageURL) {
        image.src = imageURL;
        console.log(image.src)
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
    }




    // <<<<<<<<<<<<<<<<<<<<< UPLOAD/SAVECROP button >>>>>>>>>>>>>>>>>>>



    async function sendImage(file) {
        const formData = new FormData();
        formData.append('file', file)
        const res = await fetch('http://127.0.0.1:8008/uploadImage', {
            method: 'POST',
            body: formData
        })
        const response = await res.json();
        console.log(response);
    }
    async function saveCrop(coords) {
        const res = await fetch('http://127.0.0.1:8008/saveCrop', {
            method: 'POST',
            body: JSON.stringify({
                crop: coords
            })
        })
        const response = await res.json();
        console.log(response);
    }

    saveCropButton.addEventListener('click', async (event) => {
        saveCrop(cropCoordinates)
    })





    // <<<<<<<<<<<<<<<<<< DISPLAY functions >>>>>>>>>>>>>>>>>>>>>>
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



    // <<<<<<<< INTERACTIONS (zoom, pad, ann) >>>>>>>>
    annCanvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    annCanvas.addEventListener('mousedown', (e) => {
        if (e.button = 1) {
            isPadding = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }

        annMouseDown(e)
        drawAnnotation();
    });

    annCanvas.addEventListener('mouseup', (e) => {
        if (e.button = 1) {
            isPadding = false;
        }
        annMouseUp(e)
        drawAnnotation();
    });


    annCanvas.addEventListener('mousemove', (e) => {
        if (isPadding) {
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

        annMouseMove(e)
        drawAnnotation();
    });

    annCanvas.addEventListener('wheel', (e) => {
        e.preventDefault()
        const zoomSpeed = 0.001; // Adjust the zoom speed as needed
        const zoomDelta = e.deltaY * zoomSpeed;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        zoomToMouse(mouseX, mouseY, zoomDelta);
        drawImage();
        drawAnnotation();
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

    }

    function annMouseDown(event) {
        // Add a click event listener to display coordinates in the console
        if (event.button == 0 || event.button == 2) {
            // Get the click coordinates relative to the canvas
            const clickX = event.clientX - imgCanvas.getBoundingClientRect().left;
            const clickY = event.clientY - imgCanvas.getBoundingClientRect().top;

            // Calculate the real coordinates in the image, taking into account the scale and offsets
            const imageX = (clickX - offsetX) / scale;
            const imageY = (clickY - offsetY) / scale;

            console.log(`Click at (${imageX.toFixed(2)}, ${imageY.toFixed(2)})`);
            annotation.clicks.push([imageX, imageY, event.button==0])
            console.log('Annotation after:', annotation);
        }
    }

    function annMouseUp(event) {
    }

    function annMouseMove(event) {
    }



    saveCropButton.addEventListener('click', async (event) => {
        const res = await fetch(`${apiAddress}/saveCrop`, {
            method: 'POST',
            body: JSON.stringify({
                crop: cropCoordinates
            })
        })
        const response = await res.json();
        console.log(response);
    })

    prevButton.addEventListener('click', () => {
        if (imageIndex == 0) {
            alert("No previous image")
            return
        }
        async function loadPrevImage() {
            const prevImageUrl = await getPrevImageURL()
            if (prevImageUrl) {
                loadImage(prevImageUrl)
                // The rest of the code to load and display the image
            } else {
                // Handle the case where no image is available
                console.log("No image available.");
            }
        }
        sendAnnotation()
        loadPrevImage()
        imageIndex -= 1
    })

    nextButton.addEventListener('click', () => {
        if (imageIndex == numImages - 1) {
            alert("No next image")
            return
        }
        async function loadNextImage() {
            const nextImageUrl = await getNextImageURL()
            if (nextImageUrl) {
                loadImage(nextImageUrl)
                // The rest of the code to load and display the image
            } else {
                // Handle the case where no image is available
                console.log("No image available.");
            }
        }
        sendAnnotation()
        loadNextImage()
        imageIndex += 1
    })

    async function sendAnnotation() {
        const res = await fetch(`${apiAddress}/saveAnnotation`, {
            method: 'POST',
            body: JSON.stringify({
                annotation: annotation,
                filepath: filepath,
                imageIndex: imageIndex
            })
        })
        const response = await res.json();
        console.log(response);
    }




    loadFirstImage();
});

