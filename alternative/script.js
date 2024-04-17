let imageFiles = [];
let currentIndex = 0; // Initialize to the first image index
let annotations = []; // Array to store annotations for each image

document.getElementById('folderInput').addEventListener('change', function(event) {
    const files = event.target.files;
    imageFiles = [];
    annotations = [];

    for (const file of files) {
        if (file.type.startsWith('image/')) {
            imageFiles.push(file);
            annotations.push([]); // Initialize an empty array for each image's annotations
        }
    }
    console.log("images to load:");
    console.log(imageFiles);

    // Proceed only if there are images
    if(imageFiles.length > 0) {
        document.getElementById('folderInput').style.display = 'none'; // Hide folder input
        document.getElementById('prevButton').classList.remove('hidden');
        document.getElementById('nextButton').classList.remove('hidden');
        document.getElementById('imageDisplay').classList.remove('hidden');
        // document.getElementById('downloadButton').classList.remove('hidden'); // Ensure the download button is also shown
        showImage(); // Display the first image
    } else {
        alert('No images found in the folder.');
    }
});

document.getElementById('nextButton').addEventListener('click', function() {
    if(currentIndex < imageFiles.length - 1) {
        currentIndex++;
        showImage();
    }
});

document.getElementById('prevButton').addEventListener('click', function() {
    if(currentIndex > 0) {
        currentIndex--;
        showImage();
    }
});

document.getElementById('imageDisplay').addEventListener('click', function(event) {
    const rect = this.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    annotations[currentIndex].push({x: x, y: y}); // Record click annotation for the current image
});

// document.getElementById('downloadButton').addEventListener('click', function() {
//     const annotationData = JSON.stringify(annotations);
//     const blob = new Blob([annotationData], {type: "application/json"});
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "annotations.json";
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
// });

function showImage() {
    if (currentIndex >= 0 && currentIndex < imageFiles.length) {
        const fileReader = new FileReader();
        fileReader.onload = function(e) {
            document.getElementById('imageDisplay').src = e.target.result;
        };
        fileReader.readAsDataURL(imageFiles[currentIndex]);
    } else {
        alert('Index out of bounds. This should not happen.');
    }
}

