export class DataManager {
  constructor() {
    // Initialize properties for annotations, file lists, and current state
    this.annotations = {};
    this.imageFiles = [];
    this.currentIndex = 0;
    this.currentFile = null;
    this.currentImage = null;
    this.maskImage = null;
  }

  async decrementDataIndex() {
    // Move to the previous file in the list, if possible
    if (this.currentIndex > 0) {
      this.currentIndex--;
      await this.loadSample();
    }
  }

  async incrementDataIndex() {
    // Move to the next file in the list, if possible
    if (this.currentIndex < this.imageFiles.length - 1) {
      this.currentIndex++;
      await this.loadSample();
    }
  }

  async loadFiles(event) {
    // Load image files from the selected folder
    const files = event.target.files;
    this.imageFiles = [];
    this.annotations = {};

    for (const file of files) {
      if (file.type.startsWith("image")) {
        this.imageFiles.push(file);
      }
    }

    const numberOfFiles = this.imageFiles.length;
    if (numberOfFiles > 0) {
      await this.loadSample();
    }
    return numberOfFiles;
  }

  async loadAnnotations(event) {
    // Load annotations from a JSON file
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loadedAnnotations = JSON.parse(e.target.result);
          if (typeof loadedAnnotations === "object") {
            this.annotations = loadedAnnotations;
          } else {
            throw new Error("Invalid JSON format");
          }
        } catch (err) {
          alert("Failed to load annotations: " + err.message);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please select a valid JSON file.");
    }
  }

  clearAnnotations() {
    // Clear all annotations for the current file
    if (this.currentFile) {
      this.annotations[this.currentFile] = [];
    }
  }

  undoLastAnnotation() {
    // Remove the last annotation for the current file
    if (this.currentFile && this.annotations[this.currentFile]?.length > 0) {
      this.annotations[this.currentFile].pop();
    }
  }

  downloadAnnotations() {
    // Download annotations as a JSON file
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(this.annotations));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "annotations.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  addPoint(x, y, type) {
    // Add a point annotation for the current file
    if (this.currentFile) {
      this.annotations[this.currentFile].push({
        imgX: x,
        imgY: y,
        type: type,
      });
    }
  }

  addBoundingBox(start, end) {
    // Add a bounding box annotation for the current file
    if (this.currentFile) {
      const bbox = {
        x1: Math.min(start.x, end.x),
        y1: Math.min(start.y, end.y),
        x2: Math.max(start.x, end.x),
        y2: Math.max(start.y, end.y),
        type: "bbox",
      };
      this.annotations[this.currentFile].push(bbox);
    }
  }

  async loadSample() {
    // Load the current image and its optional mask
    if (this.currentIndex >= 0 && this.currentIndex < this.imageFiles.length) {
      this.currentFile = this.imageFiles[this.currentIndex].name;
      this.annotations[this.currentFile] = this.annotations[this.currentFile] || [];

      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        this.currentImage = new Image();
        this.currentImage.src = e.target.result;
      };
      fileReader.readAsDataURL(this.imageFiles[this.currentIndex]);

      const directory = this.currentFile.substring(0, this.currentFile.lastIndexOf("/") + 1);
      const baseName = this.currentFile.replace(/^.*[\\/]/, "").replace(/\.[^/.]+$/, "");
      const maskName = `${directory}${baseName}_mask.png`;
      const maskFile = this.imageFiles.find((file) => file.name === maskName);

      if (maskFile) {
        const maskReader = new FileReader();
        maskReader.onload = (e) => {
          const tempMaskImage = new Image();
          tempMaskImage.onload = () => {
            // Validate the mask dimensions before setting it
            if (
              tempMaskImage.width !== this.currentImage.width ||
              tempMaskImage.height !== this.currentImage.height
            ) {
              // Display an alert if dimensions do not match
              alert("Mask image size does not match the image size. Mask will not be displayed.");
              this.maskImage = null;
            } else {
              // Set the mask image if dimensions are valid
              this.maskImage = tempMaskImage;
            }
          };
          tempMaskImage.src = e.target.result; // Load the mask image source
        };
        maskReader.readAsDataURL(maskFile); // Read the mask file as a data URL
      } else {
        // No mask file found, reset the mask image
        this.maskImage = null;
      }
    } else {
      // Handle out-of-bounds index gracefully
      alert("Index out of bounds. This should not happen.");
    }
  }
}
