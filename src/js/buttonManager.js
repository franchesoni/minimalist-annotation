export class ButtonManager {
  constructor(dataManager, canvasState, annotationManager) {
    this.dataManager = dataManager; // Manages image and annotation data
    this.canvasState = canvasState; // Controls canvas rendering and interactions
    this.annotationManager = annotationManager; // Manages annotation modes and events

    // Initialize DOM elements for buttons and inputs
    this.selectFolderButton = document.getElementById("selectFolderButton");
    this.folderInput = document.getElementById("folderInput");
    this.loadAnnotationsButton = document.getElementById("loadAnnotationsButton");
    this.loadFileInput = document.getElementById("loadFileInput");
    this.prevButton = document.getElementById("prevButton");
    this.nextButton = document.getElementById("nextButton");
    this.toggleModeButton = document.getElementById("toggleModeButton");
    this.resetViewButton = document.getElementById("resetViewButton");
    this.clearButton = document.getElementById("clearButton");
    this.undoButton = document.getElementById("undoButton");
    this.downloadButton = document.getElementById("downloadButton");
    this.helpModal = document.getElementById("helpModal");
    this.helpButton = document.getElementById("helpButton");
    this.modalCloseSpan = document.getElementsByClassName("close")[0];
  }

  hideUnhide() {
    // Hide initial selection elements and show main app controls
    this.selectFolderButton.style.display = "none";
    if (this.privacyText) {
      this.privacyText.style.display = "none";
    }

    // Unhide annotation and navigation controls
    this.loadAnnotationsButton.classList.remove("hidden");
    this.prevButton.classList.remove("hidden");
    this.nextButton.classList.remove("hidden");
    this.toggleModeButton.classList.remove("hidden");
    this.resetViewButton.classList.remove("hidden");
    this.clearButton.classList.remove("hidden");
    this.undoButton.classList.remove("hidden");
    this.downloadButton.classList.remove("hidden");
    this.helpButton.classList.remove("hidden");

    // Unhide canvas container and any extra canvas elements
    if (this.canvasState.canvasContainer) {
      this.canvasState.canvasContainer.classList.remove("hidden");
    }
    const extraCanvasContainer = document.getElementById("extraCanvasContainer");
    if (extraCanvasContainer) {
      extraCanvasContainer.classList.remove("hidden");
    }
  }

  setupEventHandlers() {
    // Trigger folder input when the folder button is clicked
    this.selectFolderButton.addEventListener("click", () => {
      this.folderInput.click();
    });

    // Handle folder input changes, load files, and transition to main app
    this.folderInput.addEventListener("change", async (event) => {
      const numberOfFiles = await this.dataManager.loadFiles(event);
      if (numberOfFiles > 0) {
        this.hideUnhide();
      } else {
        alert("No images found in the selected folder.");
      }
    });

    // Show help modal on clicking the help button
    this.helpButton.addEventListener("click", () => {
      this.helpModal.style.display = "block";
    });

    // Close the help modal when the close button is clicked
    this.modalCloseSpan.addEventListener("click", () => {
      this.helpModal.style.display = "none";
    });

    // Close the help modal if clicking outside of it
    window.addEventListener("click", (event) => {
      if (event.target === this.helpModal) {
        this.helpModal.style.display = "none";
      }
    });

    // Navigate images using keyboard shortcuts
    document.addEventListener("keydown", (event) => {
      if (!this.annotationManager.writingTextAnnotation) {
        if (event.key === "a" || event.key === "ArrowLeft") {
          this.prevButton.click();
        } else if (event.key === "d" || event.key === "ArrowRight") {
          this.nextButton.click();
        }
      }
    });

    // Navigate to the previous image
    this.prevButton.addEventListener("click", () => {
      this.dataManager.decrementDataIndex();
    });

    // Navigate to the next image
    this.nextButton.addEventListener("click", () => {
      this.dataManager.incrementDataIndex();
    });

    // Trigger file input for loading annotations
    this.loadAnnotationsButton.addEventListener("click", () => {
      this.loadFileInput.click();
    });

    // Load annotations and re-render canvas when a file is selected
    this.loadFileInput.addEventListener("change", async (event) => {
      await this.dataManager.loadAnnotations(event);
      this.canvasState.renderAll(
        this.dataManager.annotations,
        this.dataManager.currentFile,
        this.dataManager.currentImage,
        this.dataManager.maskImage
      );
      this.loadFileInput.value = "";
    });

    // Toggle between point and bounding box annotation modes
    this.toggleModeButton.addEventListener("click", () => {
      if (this.annotationManager.annotationMode === "point") {
        this.annotationManager.annotationMode = "bbox";
        this.toggleModeButton.textContent = "Switch to Point Mode";
      } else {
        this.annotationManager.annotationMode = "point";
        this.toggleModeButton.textContent = "Switch to Bounding Box Mode";
      }
    });

    // Reset the canvas view to the default state
    this.resetViewButton.addEventListener("click", () => {
      this.canvasState.resetViewParams(this.dataManager.currentImage);
      this.canvasState.renderAll(
        this.dataManager.annotations,
        this.dataManager.currentFile,
        this.dataManager.currentImage,
        this.dataManager.maskImage
      );
    });

    // Clear all annotations for the current image
    this.clearButton.addEventListener("click", () => {
      this.dataManager.clearAnnotations();
      this.canvasState.renderAll(
        this.dataManager.annotations,
        this.dataManager.currentFile,
        this.dataManager.currentImage,
        this.dataManager.maskImage
      );
    });

    // Undo the last annotation with Ctrl+Z
    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key === "z") {
        this.undoButton.click();
      }
    });

    // Undo the last annotation when undo button is clicked
    this.undoButton.addEventListener("click", () => {
      this.dataManager.undoLastAnnotation();
      this.canvasState.renderAll(
        this.dataManager.annotations,
        this.dataManager.currentFile,
        this.dataManager.currentImage,
        this.dataManager.maskImage
      );
    });

    // Download annotations as a JSON file
    this.downloadButton.addEventListener("click", () => {
      this.dataManager.downloadAnnotations();
    });
  }
}