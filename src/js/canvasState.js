export class CanvasState {
  constructor() {
    // Get references to canvas elements and their contexts
    this.canvasContainer = document.getElementById("canvasContainer");
    this.imageCanvas = document.getElementById("imageCanvas");
    this.maskCanvas = document.getElementById("maskCanvas");
    this.annCanvas = document.getElementById("annCanvas");
    this.tmpCanvas = document.getElementById("tmpCanvas");
    this.crosshairCanvas = document.getElementById("crosshairCanvas");

    this.imageCtx = this.imageCanvas.getContext("2d");
    this.maskCtx = this.maskCanvas.getContext("2d");
    this.annCtx = this.annCanvas.getContext("2d");
    this.tmpCtx = this.tmpCanvas.getContext("2d");
    this.crosshairCtx = this.crosshairCanvas.getContext("2d");
    this.maskCtx.globalAlpha = 0.3; // Set initial transparency for the mask canvas

    // Initialize view transformation parameters
    this.translateX = 0;
    this.translateY = 0;
    this.scale = 1;

    // Define constants for margins and point size
    this.margin = 20; // Margin around the canvas
    this.rc = 5; // Half-width of point marker squares

    // Elements for controlling transparency and text annotations
    this.sliderContainer = document.getElementById("sliderContainer");
    this.alphaSlider = document.getElementById("alphaSlider");
    this.imageTextAnnotationElement = document.getElementById("imageTextAnnotation");
  }

  // Show the canvas and annotation elements
  unhide() {
    this.canvasContainer.classList.remove("hidden");
    this.imageTextAnnotationElement.classList.remove("hidden");
  }

  // Initialize canvases with sizes matching the container and render content
  setupCanvases(annotations, currentFile, currentImage, maskImage, canvasContainer) {
    this.imageCanvas.width = this.maskCanvas.width = this.annCanvas.width = this.tmpCanvas.width = this.crosshairCanvas.width = canvasContainer.clientWidth;
    this.imageCanvas.height = this.maskCanvas.height = this.annCanvas.height = this.tmpCanvas.height = this.crosshairCanvas.height = canvasContainer.clientHeight;
    this.resetViewParams(currentImage);
    this.renderAll(annotations, currentFile, currentImage, maskImage);
  }

  // Reset view parameters to center and fit the image within the canvas
  resetViewParams(currentImage) {
    const maxCanvasWidth = this.imageCanvas.width - 2 * this.margin;
    const maxCanvasHeight = this.imageCanvas.height - 2 * this.margin;
    this.scale = Math.min(
      maxCanvasWidth / currentImage.width,
      maxCanvasHeight / currentImage.height
    );
    this.translateX = (this.imageCanvas.width - currentImage.width * this.scale) / 2;
    this.translateY = (this.imageCanvas.height - currentImage.height * this.scale) / 2;
  }

  // Clamp translations to prevent excessive panning
  applyClamping(currentImage) {
    this.translateX = Math.max(
      Math.min(this.imageCanvas.width - this.margin, this.translateX),
      this.margin - currentImage.width * this.scale
    );
    this.translateY = Math.max(
      Math.min(this.imageCanvas.height - this.margin, this.translateY),
      this.margin - currentImage.height * this.scale
    );
  }

  // Draw the main image on the canvas
  drawImageCanvas(currentImage) {
    this.imageCtx.clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height);
    this.applyClamping(currentImage);
    this.imageCtx.drawImage(
      currentImage,
      this.translateX,
      this.translateY,
      currentImage.width * this.scale,
      currentImage.height * this.scale
    );
  }

  // Draw a crosshair on the canvas
  drawCrosshair(x, y) {
    this.crosshairCtx.clearRect(
      0,
      0,
      this.crosshairCanvas.width,
      this.crosshairCanvas.height
    );

    const tolerance = 5; // Border tolerance to avoid drawing near edges

    if (
      x <= tolerance ||
      x >= this.crosshairCanvas.width - tolerance ||
      y <= tolerance ||
      y >= this.crosshairCanvas.height - tolerance
    ) {
      return; // Skip drawing if near the borders
    }

    this.crosshairCtx.strokeStyle = "red";
    this.crosshairCtx.beginPath();
    this.crosshairCtx.moveTo(x, 0);
    this.crosshairCtx.lineTo(x, this.crosshairCanvas.height);
    this.crosshairCtx.moveTo(0, y);
    this.crosshairCtx.lineTo(this.crosshairCanvas.width, y);
    this.crosshairCtx.stroke();
  }

  // Render all canvases, annotations, and optional mask
  renderAll(annotations, currentFile, currentImage, maskImage) {
    this.annCtx.clearRect(0, 0, this.annCanvas.width, this.annCanvas.height);
    this.tmpCtx.clearRect(0, 0, this.tmpCanvas.width, this.tmpCanvas.height);
    this.drawImageCanvas(currentImage);

    if (maskImage) {
      this.sliderContainer.classList.remove("hidden");
      this.maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
      this.maskCtx.globalAlpha = this.alphaSlider.value / 100;
      this.maskCtx.drawImage(
        maskImage,
        this.translateX,
        this.translateY,
        maskImage.width * this.scale,
        maskImage.height * this.scale
      );
    } else {
      this.sliderContainer.classList.add("hidden");
    }

    let deleteDescription = true; // Tracks if the text annotation should be cleared

    annotations[currentFile].forEach((ann) => {
      if (ann.type === "bbox") {
        this.annCtx.strokeStyle = "green";
        this.annCtx.lineWidth = 4;
        const x1 = ann.x1 * this.scale + this.translateX;
        const y1 = ann.y1 * this.scale + this.translateY;
        const x2 = ann.x2 * this.scale + this.translateX;
        const y2 = ann.y2 * this.scale + this.translateY;
        this.annCtx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      } else if (ann.type === "desc") {
        deleteDescription = false;
        this.imageTextAnnotationElement.value = ann.description;
      } else {
        this.annCtx.fillStyle = ann.type === "positive" ? "green" : "red";
        const x = ann.x * this.scale + this.translateX;
        const y = ann.y * this.scale + this.translateY;
        this.annCtx.fillRect(x - this.rc, y - this.rc, 2 * this.rc, 2 * this.rc);
      }
    });

    if (deleteDescription) {
      this.imageTextAnnotationElement.value = "";
    }
  }
}
