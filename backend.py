from fastapi import FastAPI, UploadFile, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.responses import JSONResponse

from PIL import Image
import numpy as np
import io
import os
import argparse


class State:
    def __init__(self):
        self.image = None
        self.pilimg = None
        self.nb_cropped_images_saved = 0
        self.imageFiles = []
        self.indexImage = 0


state = State()

app = FastAPI(
    title="zoomApp",
)

def load_images_from_folder(folder_path):
    extensions = ('.png', '.jpg', '.jpeg', '.gif', '.bmp')
    image_files = [os.path.join(folder_path, filename) for filename in os.listdir(folder_path) if filename.lower().endswith(extensions)]
    return image_files


@app.get("/test")
def test():
    print("test")


@app.get("/getFirstImage")
async def get_first_image():
    if state.imageFiles:
        first_image_path = state.imageFiles[0]  # Chemin du premier fichier image
        return FileResponse(first_image_path, headers={"nbImages" : str(len(state.imageFiles))})
    else:
        # Gérez le cas où aucune image n'est disponible
        return JSONResponse(content={"error": "Aucune image disponible"}, status_code=404)

@app.get("/getNextImage")
async def getNextImage():
    state.indexImage += 1
    if state.imageFiles:
        first_image_path = state.imageFiles[state.indexImage]  # Chemin du premier fichier image
        return FileResponse(first_image_path)
    else:
        # Gérez le cas où aucune image n'est disponible
        return JSONResponse(content={"error": "Aucune image disponible"}, status_code=404)

@app.get("/getPrevImage")
async def getPrevImage():
    state.indexImage -= 1 
    print(state.indexImage)
    if state.imageFiles:
        first_image_path = state.imageFiles[state.indexImage]  # Chemin du premier fichier image
        return FileResponse(first_image_path)
    else:
        # Gérez le cas où aucune image n'est disponible
        return JSONResponse(content={"error": "Aucune image disponible"}, status_code=404)

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
    crop = str(body['crop'])
    coord_list = crop.split(',')
    x1 = int(coord_list[0])
    y1 = int(coord_list[1])
    x2 = int(coord_list[2])
    y2 = int(coord_list[3])
    cropped_image = state.pilimg.crop((x1, y1, x2, y2))
    file_name = f"saved_crop/cropped_image_{state.nb_cropped_images_saved}.jpg"
    cropped_image.save(file_name)
    state.nb_cropped_images_saved += 1


app.mount("/", StaticFiles(directory=".", html=True))

if __name__ == "__main__":
    import uvicorn
    parser = argparse.ArgumentParser(description="FastAPI Image Server")
    parser.add_argument("image_folder", help="Path to the image folder")
    args = parser.parse_args()
    state.imageFiles = load_images_from_folder(args.image_folder)
    print(state.imageFiles)
    uvicorn.run(app, host="127.0.0.1", port=8008)
