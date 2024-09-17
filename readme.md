# 📍 Single File Image Annotation Tool

This project is a **Single File Image Annotation Tool** developed using **HTML**, **CSS**, and **JavaScript**. It provides a simple yet powerful interface for annotating images by adding points and bounding boxes. This tool is especially useful for tasks like object detection and semantic segmentation. With a lightweight, browser-based solution, it ensures complete privacy, as all data stays local on your device.

## 🔮 Stack

![HTML](https://img.shields.io/badge/html-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 🌐 Project Overview

This tool allows users to annotate images by adding positive/negative points or drawing bounding boxes. It features functionality for managing and saving annotations in JSON format, panning, zooming, and other customizable options. It is highly adaptable to various annotation workflows and comes with a range of features to improve the user experience.

### 🔧 Features

#### Visualization

- **Pan**: Drag with left click.
- **Zoom**: Scroll mouse wheel.
- **Reset View**: Click the "Reset View" button.
- **Next Image**: Click `Next` or press `RightArrow`.
- **Previous Image**: Click `Previous` or press `LeftArrow`.

#### Annotation

- **Switch Mode**: Switch between point annotation and bounding box annotation modes.
- **Box Annotation**: Use two left clicks per bounding box.
- **Point Annotation**: Use left click for positive points and right click for negative points.
- **Text Annotation**: Each annotation has its own text box for descriptions, with the text box color matching the annotation.
- **Delete Annotation**: Click `Undo` or use `CTRL+Z` to remove the last annotation, or click `Clear` to remove all annotations on the current image.
- **Save/Load**: Save your annotations to a file or load previous annotations using the `Save` and `Load` buttons.

#### QOL (Quality of Life)

- **Custom Text Input**: Each annotation (bounding box or point) has a custom text input field, allowing for personalized labels. Each annotation also includes a **delete button** for easy removal and a **hide button** for better visualisation when there is an important amount of annotations.
- **Bounding Box Colors**: Each bounding box is assigned a random color from a range of 30 hues for easy visual distinction. However, **colors are not exported**, and they are randomized again upon reloading the annotations.
- **Select Annotation from Canva**: Wheel Click on a point or a bounding box put the selected annotation in **focus**.
- **Fuchsia Highlight**: When clicking on a text input making you focused on an input field, the corresponding annotation is highlighted in fuchsia, providing clear feedback.
- **Per-Image Readability & Quality Control**: Each image’s annotations can now be assessed for **readability** and **quality** individually.

#### Privacy & Security

This tool is entirely **browser-based** with **no data sent to any server**. Your images and annotations remain local, ensuring complete privacy. You can run the tool offline, and you are welcome to inspect the source code if you'd like to verify its behavior.

## 💻 Installation

To use this tool, follow these simple steps:

1. **Download** the HTML file from the repository.
2. **Open** the file in your browser (no server required).
3. Begin annotating your images!

> This tool is fully offline and self-contained—no installation or external dependencies are required.

## 🌐 Use Cases

This tool is versatile and adaptable to a range of image annotation use cases, including object detection and semantic segmentation.

### 1. **Instance & Object Detection**

- **Bounding Boxes**: Draw bounding boxes around all objects of interest in the images.
- Train an object detection model based on these annotations.
- Iterate by refining the annotations using the model's predictions and converting correct ones into final annotations.
- Exhaustively label objects or flag an image as **ignored** if no exhaustive annotation is required.

### 2. **Weakly Supervised Semantic Segmentation**

- **Point Annotations**: Add positive and negative points to multiple images.
- Train a weakly supervised segmentation model based on these points.
- Iteratively predict and refine the annotations by adding more points.
- Continue the process until the segmentor's performance is satisfactory.

### 3. **Mask Annotation with Weak Supervision**

- When the segmentor produces satisfactory results for an image, it can be flagged as a **mask**.
- Train a fully supervised segmentation model over these mask annotations to improve performance.

### 4. **Interactive Image Segmentation**

- Similar to mask annotation, but points are added across all images.
- A segmentor capable of handling **point prompts** is used to generate masks.
- These masks are flagged as **accepted** and used for training a more robust segmentor.

## 🎨 How It Works

1. **Load Images**: Choose a folder with the images you wish to annotate.
2. **Annotate**:
   - Use **Point Mode** for placing positive and negative points.
   - Use **Bounding Box Mode** for drawing rectangular regions of interest.
   - Customize each annotation with text, and easily remove them with the delete button.
3. **Manage Annotations**:
   - Save the annotations locally in **JSON format**.
   - Reload previously saved annotations to continue working.
4. **Zoom & Pan**:
   - Zoom in/out using the mouse scroll.
   - Pan the image by dragging to adjust the view.
   - Reset the view when necessary.

## 📝 Annotation Protocols

The annotations made using this tool can be employed in various machine learning paradigms. Below are some key workflows that you can adopt based on your task:

1. **Train a Weak Semantic Segmentor**:

   - Add positive and negative points on many images.
   - Train a weakly supervised segmentor.
   - Predict on new images, add more points, and continue the process until satisfactory performance is achieved.

2. **Weak Semantic Segmentation for Mask Annotation**:

   - Follow the same process as above, but when the prediction is satisfactory, flag it as a **mask**.
   - You can then use these masks to train a fully-supervised segmentor for more precise results.

3. **Interactive Image Segmentation**:

   - Points are added in all images.
   - A segmentor that handles point prompts generates masks, which can be flagged as accepted.
   - These masks are later used to train the segmentation model.

4. **Object Detection**:
   - Draw bounding boxes exhaustively over all objects on the images.
   - If an image doesn't require exhaustive labeling, flag it as **ignore** (unseen images are ignored by default).

## ✉️ Feedback

For feedback and any advice for improvement, contact [Franco Marchesoni](mailto:fmarchesoni@slb.com), [Frederic Huang](mailto:fhuang5@slb.com) or [Anne-Maelle Barneche](mailto:abarneche@slb.com).
