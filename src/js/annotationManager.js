export class AnnotationManager {
    constructor(dataManager, canvasState) {
        this.dataManager = dataManager; // Handles annotation data and file management
        this.canvasState = canvasState; // Manages canvas rendering and interactions
        this.annotationMode = "point"; // Tracks the current annotation mode ("point" or "bbox")
        this.writingTextAnnotation = false; // Tracks whether a text annotation is being edited
        this.clicking = false; // Tracks if the mouse is clicking
        this.drawingBbox = false; // Tracks if a bounding box is being drawn
        this.dragging = false; // Tracks if the canvas is being dragged
        this.bboxStart = null; // Starting point of a bounding box
        this.lastX = 0; // Last X position for dragging
        this.lastY = 0; // Last Y position for dragging
    }

    setupEventHandlers() {
        // Handles input for text annotations
        this.canvasState.imageTextAnnotationElement.addEventListener("input", () => {
            this.writingTextAnnotation = true;
            this.dataManager.annotations[this.dataManager.currentFile] = this.dataManager.annotations[this.dataManager.currentFile].filter(
                (ann) => ann.type !== "desc"
            );
            this.dataManager.annotations[this.dataManager.currentFile].push({
                type: "desc",
                description: this.canvasState.imageTextAnnotationElement.value,
            });
            this.reRender();
            this.writingTextAnnotation = false;
        });

        // Debounces frequent updates when interacting with the slider
        const debouncedUpdate = debounce(this.reRender.bind(this), 100);
        this.canvasState.alphaSlider.addEventListener("input", () => {
            debouncedUpdate();
        });

        // Disables the context menu to allow custom mouse actions
        window.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });

        // Handles mouse movement over the canvas
        this.canvasState.crosshairCanvas.addEventListener("mousemove", (event) => {
            this.canvasState.drawCrosshair(event.offsetX, event.offsetY); // Draws a crosshair on the canvas

            this.clicking = false; // Reset clicking state if the mouse moves
            if (this.drawingBbox) {
                // Updates the temporary bounding box during drawing
                this.canvasState.tmpCtx.clearRect(0, 0, this.canvasState.tmpCanvas.width, this.canvasState.tmpCanvas.height);
                this.canvasState.tmpCtx.strokeStyle = "violet";
                this.canvasState.tmpCtx.lineWidth = 4;
                const x1 = Math.min(event.offsetX, this.bboxStart.x * this.canvasState.scale + this.canvasState.translateX);
                const y1 = Math.min(event.offsetY, this.bboxStart.y * this.canvasState.scale + this.canvasState.translateY);
                const x2 = Math.max(event.offsetX, this.bboxStart.x * this.canvasState.scale + this.canvasState.translateX);
                const y2 = Math.max(event.offsetY, this.bboxStart.y * this.canvasState.scale + this.canvasState.translateY);
                this.canvasState.tmpCtx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            }
            if (this.dragging) {
                // Handles canvas dragging
                const dx = event.offsetX - this.lastX;
                const dy = event.offsetY - this.lastY;
                this.canvasState.translateX += dx;
                this.canvasState.translateY += dy;
                this.lastX = event.offsetX;
                this.lastY = event.offsetY;
                this.reRender();
            }
        });

        // Tracks mouse down events for dragging and annotation
        this.canvasState.crosshairCanvas.addEventListener("mousedown", (event) => {
            this.clicking = true;
            if (event.button === 0) {
                this.dragging = true;
                this.lastX = event.offsetX;
                this.lastY = event.offsetY;
            }
        });

        // Handles mouse up events for annotations and resetting states
        this.canvasState.crosshairCanvas.addEventListener("mouseup", (event) => {
            if (this.clicking) {
                if (event.button === 0) {
                    // Left mouse button: adds annotations
                    if (this.annotationMode === "point") {
                        this.dataManager.addPoint(
                            (event.offsetX - this.canvasState.translateX) / this.canvasState.scale,
                            (event.offsetY - this.canvasState.translateY) / this.canvasState.scale,
                            "positive"
                        );
                        this.reRender();
                    } else if (this.annotationMode === "bbox") {
                        if (!this.bboxStart) {
                            // Starts a new bounding box
                            this.bboxStart = {
                                x: (event.offsetX - this.canvasState.translateX) / this.canvasState.scale,
                                y: (event.offsetY - this.canvasState.translateY) / this.canvasState.scale,
                            };
                            this.drawingBbox = true;
                        } else {
                            // Completes the bounding box and adds it to annotations
                            this.dataManager.addBoundingBox(this.bboxStart, {
                                x: (event.offsetX - this.canvasState.translateX) / this.canvasState.scale,
                                y: (event.offsetY - this.canvasState.translateY) / this.canvasState.scale,
                            });
                            this.bboxStart = null;
                            this.drawingBbox = false;
                            this.reRender();
                        }
                    }
                } else if (event.button === 1) {
                    // Middle mouse button: deletes annotations
                    const indexToDelete = this.getAnnotationIndex(event.offsetX, event.offsetY);
                    if (indexToDelete !== -1) {
                        this.dataManager.annotations[this.dataManager.currentFile].splice(indexToDelete, 1);
                        this.reRender();
                    }
                } else if (event.button === 2) {
                    // Right mouse button: adds negative annotations
                    if (this.annotationMode === "point") {
                        this.dataManager.addPoint(
                            (event.offsetX - this.canvasState.translateX) / this.canvasState.scale,
                            (event.offsetY - this.canvasState.translateY) / this.canvasState.scale,
                            "negative"
                        );
                        this.reRender();
                    } else if (this.annotationMode === "bbox") {
                        // Cancels the bounding box drawing
                        this.bboxStart = null;
                        this.drawingBbox = false;
                        this.canvasState.tmpCtx.clearRect(0, 0, this.canvasState.tmpCanvas.width, this.canvasState.tmpCanvas.height);
                    }
                }
                this.clicking = false;
            }
        });

        // Stops dragging when the mouse is released anywhere
        window.addEventListener("mouseup", (event) => {
            if (event.button === 0) {
                this.dragging = false;
            }
        });

        // Handles zooming with the mouse wheel
        this.canvasState.crosshairCanvas.addEventListener("wheel", (event) => {
            event.preventDefault();
            const zoomSpeed = 0.1;
            const delta = -Math.sign(event.deltaY) * zoomSpeed;
            const zoomFactor = Math.exp(delta);
            this.canvasState.scale *= zoomFactor;

            this.canvasState.translateX = (this.canvasState.translateX - event.offsetX) * zoomFactor + event.offsetX;
            this.canvasState.translateY = (this.canvasState.translateY - event.offsetY) * zoomFactor + event.offsetY;
            this.reRender();
        });
    }

    // Placeholder for finding an annotation index (to be implemented)
    getAnnotationIndex(x, y) {
        return -1;
    }

    // Re-renders the canvas with current annotations and settings
    reRender() {
        this.canvasState.renderAll(
            this.dataManager.annotations,
            this.dataManager.currentFile,
            this.dataManager.currentImage,
            this.dataManager.maskImage
        );
    }
}

// Utility function to debounce frequent function calls
function debounce(fn, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}
