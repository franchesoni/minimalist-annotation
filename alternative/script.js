document.getElementById('folderInput').addEventListener('change', function(event) {
    const files = event.target.files;
    imageFiles = [];

    for (const file of files) {
        if (file.type.startsWith('image/')) {
            imageFiles.push(file);
        }
    }

    // Start at the first image instead of before the first image
    currentIndex = 0; // Change this line
    if(imageFiles.length > 0) {
        showImage(); // Directly show the first image
    } else {
        document.getElementById('imageDisplay').src = ''; // Clear the image display if no images are selected
        alert('No images found in the folder.');
    }
});

// Consolidated image display function for both next and previous
function showImage() {
    if (currentIndex >= 0 && currentIndex < imageFiles.length) {
        const fileReader = new FileReader();
        fileReader.onload = function(e) {
            document.getElementById('imageDisplay').src = e.target.result;
        };
        fileReader.readAsDataURL(imageFiles[currentIndex]);
    } else if(currentIndex >= imageFiles.length) {
        alert('No more images.');
        currentIndex = imageFiles.length - 1; // Keep the index within bounds
    } else {
        alert('This is the first image.');
        currentIndex = 0; // Ensure index is set for the first image
    }
}

document.getElementById('nextButton').addEventListener('click', function() {
    currentIndex++;
    showImage();
});

document.getElementById('prevButton').addEventListener('click', function() {
    currentIndex--;
    showImage();
});
