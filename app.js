document.addEventListener('DOMContentLoaded', () => {
    const canvasContainer = document.getElementById('canvas-container');
    const canvas = document.getElementById('zoomable-canvas');
    const coordinates = document.getElementById('coordinates');
    const saveCropButton = document.getElementById('save-crop')
    const mouseCoordinates = document.getElementById('mouse-coordinates');

    const prevButton = document.getElementById('previous-button');
    const nextButton = document.getElementById('next-button');

    const ctx = canvas.getContext('2d');
    
    const apiAddress = 'http://localhost:8008'
    let image = new Image();
    let scale = 1;
    let maxScale = 0;
    let offsetX = 0;
    let offsetY = 0;
    let mouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let cropCoordonnates = 0;
    let indexImage = 0
    let nbImages = 0
    
    async function getFirstImageURL() {
        const res = await fetch(`${apiAddress}/getFirstImage`, {
            headers: {
              'Cache-Control': 'no-cache',
            },
          });
        // Ensure the response is successful before proceeding
        if (res.ok) {
            // Get the image URL from the response
            const imageUrl = URL.createObjectURL(await res.blob());
            nbImages = res.headers.get('nbImages')
            console.log(nbImages)
            return imageUrl;
        } else {
            // Handle errors, for example, return null in case of an error
            return null;
        }
    }

    async function getNextImageURL() {
        const res = await fetch(`${apiAddress}/getNextImage`, {
            headers: {
              'Cache-Control': 'no-cache',
            },
          });
        // Ensure the response is successful before proceeding
        if (res.ok) {
            // Get the image URL from the response
            const imageUrl = URL.createObjectURL(await res.blob());
            return imageUrl;
        } else {
            // Handle errors, for example, return null in case of an error
            return null;
        }
    }

    async function getPrevImageURL() {
        const res = await fetch(`${apiAddress}/getPrevImage`, {
            headers: {
              'Cache-Control': 'no-cache',
            },
          });
        // Ensure the response is successful before proceeding
        if (res.ok) {
            // Get the image URL from the response
            const imageUrl = URL.createObjectURL(await res.blob());
            return imageUrl;
        } else {
            // Handle errors, for example, return null in case of an error
            return null;
        }
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

                // Draw the image at the correct scale
                drawImage();
            };
    }
    
    async function sendImage(file) {
        const formData = new FormData();
        formData.append('file',file)
        const res = await fetch (`${apiAddress}/uploadImage`, {
            method: 'POST',
            body: formData
        })
        const response = await res.json();
        console.log(response);
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
        coordinates.textContent = `Top Left: (${topLeftX.toFixed(0)}, ${topLeftY.toFixed(0)}) | Bottom Right: (${bottomRightX.toFixed(0)}, ${bottomRightY.toFixed(0)})`;
        
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

    loadFirstImage();

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
        e.preventDefault()
        const zoomSpeed = 0.001; // Adjust the zoom speed as needed
        const zoomDelta = e.deltaY * zoomSpeed;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        zoomToMouse(mouseX, mouseY, zoomDelta);
    });

    // Add a click event listener to display coordinates in the console
    canvas.addEventListener('click', (event) => {
        if (event.button == 0) {
            // Get the click coordinates relative to the canvas
            const clickX = event.clientX - canvas.getBoundingClientRect().left;
            const clickY = event.clientY - canvas.getBoundingClientRect().top;

            // Calculate the real coordinates in the image, taking into account the scale and offsets
            const imageX = (clickX - offsetX) / scale;
            const imageY = (clickY - offsetY) / scale;

            console.log(`Click at (${imageX.toFixed(2)}, ${imageY.toFixed(2)})`);
        }
        
    });

    saveCropButton.addEventListener('click', async (event)  => {
        const res = await fetch (`${apiAddress}/saveCrop`, {
            method: 'POST',
            body: JSON.stringify({
                crop : cropCoordonnates
            })
        })
        const response = await res.json();
        console.log(response);
    })

    prevButton.addEventListener('click', () => {
        if (indexImage==0) {
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
        loadPrevImage()
        indexImage -=1
    })

    nextButton.addEventListener('click', () => {
        if (indexImage==nbImages-1) {
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
        loadNextImage()
        indexImage +=1
    })
});
