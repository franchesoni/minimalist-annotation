from fastapi import FastAPI, UploadFile, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from PIL import Image
import numpy as np
import io
import json


class State:
    def __init__(self):
        self.image = None
        self.pilimg = None
        self.nb_cropped_images_saved = 0


state = State()

app = FastAPI(
    title="zoomApp",
)


@app.get("/test")
def test():
    print("test")


@app.post("/uploadImage")
async def get_image(file: UploadFile):
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
    print(coord_list)
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

    uvicorn.run(app, host="localhost", port=8008)
