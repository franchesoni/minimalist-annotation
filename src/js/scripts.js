import { CanvasState } from './canvasState.js';
import { DataManager } from './dataManager.js';
import { AnnotationManager } from './annotationManager.js';
import { ButtonManager } from './buttonManager.js';

// Main application logic
document.addEventListener('DOMContentLoaded', () => {
  canvasState = new CanvasState();
  dataManager = new DataManager();
  annotationManager = new AnnotationManager(dataManager, canvasState);
  buttonManager = new ButtonManager(dataManager, canvasState, annotationManager);
  canvasState.setupCanvases();
  annotationManager.setupEventHandlers();
  buttonManager.setupEventHandlers();

  // Extra canvas and context (non overlapping)
  let extraCanvasContainer = document.getElementById("extraCanvasContainer");
  let extraCanvas = document.getElementById("extraCanvas");
  let extraCtx = extraCanvas.getContext("2d");

});


// to do:
// - maybe change the text of select folder to loading while we can
// - ensure you don't modify canvases if not through the CanvasState