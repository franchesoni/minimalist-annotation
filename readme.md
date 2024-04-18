
# Image annotation app

This image annotation app is simple.
It allows to draw bounding boxes and points.

Depending on the problem, you will follow one of the annotation protocols below. For instance, for object detection, you start drawing bounding boxes, you train an object detector, you use them to predict other images, you remove some predictions, convert the rest to annotations, annotate a few more, and like that until you complete the annotation of your dataset. A text box is available for you to write annotation instructions.

Another example is semantic segmentation. For each image you add a few points, train a weakly supervised segmentor, add more points considering the output of it, and so on until you find the predictions of the segmentor are correct (you should keep a few test images at hand). 


## Annotation details
The bounding boxes and points are referred to one image, class and object. They also are of either annotation type or prediction type. The text inputs are referred to one image. 
Predictions can be accepted and be converted into annotation type. This enables one to run human-in-the-loop learning.
Mask predictions are only used for visualization, there is no interactive behavior (more on human-in-the-loop learning later). They can however be accepted and converted into annotations.

## Current version
This version is binary, i.e. at most one class is allowed.
For points, at most one object per image is allowed.
This restricts the applications to binary object detection and binary semantic segmentation.

## How are annotations used? Annotation protocols
We consider a few learning paradigms to be run from the annotations.

1. *train weak semantic segmentor:* add positive and negative points on many images, train a weakly supervised segmentor, predict, add more points, train, predict, add more points, and so on, until performance is sufficient.
2. *weak semantic segmentation for annotation of masks:* Same process as 1., but when a prediction is satisfactory, it can be flagged as mask. Then one can train a fully-supervised segmentor over the masks.
3. *interactive image segmentation for annotation of masks:* similar to 2., but points should be added in all images. A segmentor that can handle point prompts is used to generate masks. Masks are flagged as accepted and later used for training a segmentor.
4. *object detection:* draw your bounding boxes exhaustively over all objects on all the images you see. If you saw an image and don't want to label exhaustively, flag it as "ignore" (all unseen images are ignored by default). 

Catches:
- if you don't draw exhaustive bounding boxes, you're introducing noise to the training of the object detector. 
- if you think about using IIS later, you need to annotate each and every image you want to include in your training set

# Change log
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
- allow to load masks (imgname_mask_pred.png)
- add transparency slider for mask visualization
- allow to flag masks as correct
