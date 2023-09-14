from fastapi import FastAPI, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="zoomApp",
)


app.mount("/", StaticFiles(directory=".", html=True))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8008)