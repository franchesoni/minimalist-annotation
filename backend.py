from fastapi import FastAPI, UploadFile, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.responses import JSONResponse

from PIL import Image
import json
import shutil
import numpy as np
from pathlib import Path
import io
import os
import argparse

class State:
    def __init__(self):
        self.image = None
        self.pilimg = None
        self.nb_cropped_images_saved = 0
        self.imageFiles = []
        self.imageIndex = 0
        self.annotations = {}
        # the format of annotations is {image_filename: {'bboxes': [[leftcol, toprow, width, height], ...], 'clicks': [(col, row, label), ...]}, 'text': 'some text'}, ...}


state = State()

app = FastAPI(
    title="AnnotationApp",
)


def load_images_from_folder(folder_path):
    extensions = (".png", ".jpg", ".jpeg", ".bmp")
    image_files = [
        os.path.join(folder_path, filename)
        for filename in os.listdir(folder_path)
        if filename.lower().endswith(extensions)
    ]
    return image_files


@app.get("/test")
def test():
    print("test")


@app.get("/getFirstImage")
async def get_first_image():
    state.imageIndex = 0
    return get_image()


@app.get("/getNextImage")
async def getNextImage():
    state.imageIndex += 1
    return get_image()


@app.get("/getPrevImage")
async def getPrevImage():
    state.imageIndex -= 1
    return get_image()


def get_image():
    print("getting image number", state.imageIndex)
    if (
        state.imageFiles
        and state.imageIndex >= 0
        and state.imageIndex < len(state.imageFiles)
    ):
        filepath = state.imageFiles[state.imageIndex]
        return FileResponse(
            filepath,
            headers={
                "imageIndex": str(state.imageIndex),
                "filepath": filepath,
                "ann": str(state.annotations[filepath]),
                "numImages": str(len(state.imageFiles)),
            },
        )
    else:
        return JSONResponse(content={"error": "No image available"}, status_code=404)


@app.post("/uploadImage")
async def uploadImage(file: UploadFile):
    content = await file.read()
    file_obj = io.BytesIO(content)
    state.pilimg = Image.open(file_obj)
    state.image = np.array(state.pilimg)
    return


@app.post("/saveCrop")
async def saveCrop(request: Request):
    body = await request.json()
    crop = str(body["crop"])
    coord_list = crop.split(",")
    x1 = int(coord_list[0])
    y1 = int(coord_list[1])
    x2 = int(coord_list[2])
    y2 = int(coord_list[3])
    cropped_image = state.pilimg.crop((x1, y1, x2, y2))
    file_name = f"saved_crop/cropped_image_{state.nb_cropped_images_saved}.jpg"
    cropped_image.save(file_name)
    state.nb_cropped_images_saved += 1


@app.post("/saveAnnotation")
async def saveAnnotation(request: Request):
    body = await request.json()
    filepath = body['filepath']
    ann = body['annotation']
    imageIndex = int(body['imageIndex'])
    assert imageIndex == state.imageIndex
    assert filepath == state.imageFiles[state.imageIndex]
    state.annotations[state.imageFiles[state.imageIndex]] = ann
    print('great success!')
    print('annotation:', state.annotations)
    return {"message": "Data received successfully!"}



app.mount("/", StaticFiles(directory=".", html=True))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="FastAPI Image Server")
    parser.add_argument("image_folder", help="Path to the image folder")
    parser.add_argument(
        "dst", help="Path to the destination folder of the annotation campaign"
    )
    # reset argument that defaults to false
    parser.add_argument("--reset", action="store_true", help="Reset the campaign")
    args = parser.parse_args()

    # initialize dst folder
    if args.reset:
        shutil.rmtree(args.dst, ignore_errors=True)
    os.makedirs(args.dst, exist_ok=True)

    # initialize state
    state.imageFiles = load_images_from_folder(args.image_folder)
    if (Path(args.dst) / "annotations.json").exists():
        with open(Path(args.dst) / "annotations.json", "r") as f:
            state.annotations = json.load(f)
    else:
        state.annotations = {
            img_file: {"bboxes": [], "clicks": [], "text": ""}
            for img_file in state.imageFiles
        }
    print(state.imageFiles)

    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8008)
