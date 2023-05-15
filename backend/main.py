# uvicorn main:app
# uvicorn main:app --reload

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from decouple import config
import openai

from functions.ai_requests import convert_audio_to_text, get_chat_response
from functions.db import store_messages, reset_messages
from functions.text_to_speech import convert_text_to_speech

app = FastAPI()

origins = [
    "http://localhost:5173",
    "https://localhost:5174",
    "http://localhost:4173",
    "http://localhost:3000",
    "http://localhost:4174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def check_health():
    return {"message": "healthy"}


@app.get("/reset")
async def reset_conversation():
    reset_messages()
    return {"response": "conversation reset"}



@app.post("/post-audio")
async def post_audio(file: UploadFile= File(...)):

    with open(file.filename, "wb") as buffer:
        buffer.write(file.file.read())
    audio_input = open(file.filename, "rb")

    decoded_message = convert_audio_to_text(audio_input)
    print(decoded_message)
    if not decoded_message:
        return HTTPException(status_code=400, detail="Failed to decode audio")
    
    chat_response = get_chat_response(decoded_message)
    print(chat_response)

    store_messages(decoded_message, chat_response)
    
    audio_output = convert_text_to_speech(chat_response)

    if not audio_output:
        return HTTPException(status_code=400, detail="Failed to get eleven labs audio response")
    
    def iterfile():
        yield audio_output


    return StreamingResponse(iterfile(), media_type="application/octet-stream")



