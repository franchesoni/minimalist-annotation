
# 📍 Single File Image Annotation Tool

**We created something easy to install and use... [give it a try!](https://franchesoni.github.io/single_file_annotation_tool/)**

Please ⭐ if you find it useful.

## About
A simple yet powerful interface for annotating images by adding points and bounding boxes. This tool is useful for annotating bounding boxes and points for tasks like object detection and semantic segmentation. It is a single `.html` file, that you can open in your browser. It ensures complete privacy, as all data stays local on your device.

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
- **Text Annotation**: Each image has its own text box for descriptions.
- **Delete Annotation**: Click `Undo` or use `CTRL+Z` to remove the last annotation, or click `Clear` to remove all annotations on the current image.
- **Save/Load**: Save your annotations to a file or load previous annotations using the `Save` and `Load` buttons.

#### QOL (Quality of Life)
- Each annotation also includes a **delete button** for easy removal and a **hide button** for better visualisation when there is an important amount of annotations.
- **Select Annotation from Canva**: Wheel Click on a point or a bounding box put the selected annotation in **focus**.
#### Privacy & Security

This tool is entirely **browser-based** with **no data sent to any server**. Your images and annotations remain local, ensuring complete privacy. You can run the tool offline, and you are welcome to inspect the source code if you'd like to verify its behavior.

:warning: Only trust the `.html` file if it comes from this repository or you have checked the source code, as it is easy to create a very similar app that steals your data.

## 💻 Installation

To use this tool, follow these simple steps:

1. **Download** the HTML file from the repository.
2. **Open** the file in your browser (no server required).
3. Begin annotating your images!

> This tool is fully offline and self-contained—no installation or external dependencies are required.

## 🌐 Use Cases

This tool is versatile and adaptable to a range of image annotation use cases, including object detection and semantic segmentation. There is a folder in the repo with an OCR annotation version contributed by [Frederic Huang](https://github.com/Huang-Frederic) in the repository.

## ✉️ Feedback

Open an issue in the repository or contact [Franco Marchesoni](mailto:marchesoniacland@gmail.com), [Frederic Huang](mailto:fhuang5@slb.com) or [Anne-Maelle Barneche](mailto:abarneche@slb.com).

# Change log
## 2024-10-11
- integrate features from Fred in main script (mask removal with wheel click)
- update this readme for future features
- approve pull request from Frederic Huang 
## Initial commits
- add help
- add load annotations button
- add textbox
- implement bounding box code
- add undo button
- create annotation tool for clicks
    - allows for downloads
    - positive / negative clicks
    - panning
    - zooming
- display jpg images on a folder locally
- open a folder locally

# Roadmap
- allow to load bbox predictions
- allow to load masks (imgname_mask_pred.png)
- allow to validate masks
- add transparency slider for mask visualization
- allow to flag masks as correct

