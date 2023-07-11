import {useState} from "react";
import Title from "./Title";
import RecordMessage from "./RecordMessage";
import axios from "axios";

function Controller() {
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<any []>([]);

    const createBlobUrl = (data: any) => {
      const blob = new Blob([data], {type:"audio/mpeg"});
      const url = window.URL.createObjectURL(blob);
      return url;
    };
    const handleStop = async (blobUrl: string) => {
      setIsLoading(true);
      const myMessage = {sender: "me", blobUrl};
      const arrMessage = [...messages, myMessage];
      fetch(blobUrl)
        .then(res => res.blob())
        .then(async (blob) => {
        const formData = new FormData();
        formData.append("file", blob, "myFile.wav");

        await axios
          .post("http://127.0.0.1:8000/post-audio", formData, {
            headers: {"Content-Type": "audio/mpeg"},
            responseType: "arraybuffer"
          })
          .then((res: any) => {
            const blob = res.data;
            const audio = new Audio();
            audio.src = createBlobUrl(blob);

            const lucyMessage = {sender:"lucy", blobUrl: audio.src};
            arrMessage.push(lucyMessage);
            setMessages(arrMessage);


            setIsLoading(false);
            audio.play;
          })
          .catch((err) => {
            console.error(err);
            setIsLoading(false);
          });
      });
      setIsLoading(false);
    };
  return (
    <div className=" h-screen overflow-y-hidden">
        <Title setMessages={setMessages}/>
        <div className=" flex flex-col justify-between h-full overflow-y-scroll pb-96 ">
            {/* Conversation */}
            <div className=" mt-5 p-8">
              {messages.map((audio, index) => {
                return (
                  <div
                    key={index + audio.sender}
                    className={
                    "flex flex-col " +
                    (audio.sender == "lucy" && "flex items-end")
                    }
                  >
                    {/* Sender */}
                      <div className="mt-4 ">
                        <p
                          className={
                            audio.sender == "rachel"
                              ? "text-right mr-2 italic text-white"
                              : "ml-2 italic text-black"
                          }
                        >
                          {audio.sender}
                        </p>
                      {/* Message */}
                        <audio
                          src={audio.blobUrl}
                          className="appearance-none"
                          controls
                        />
                      </div>
                  </div>);
              })}
              {messages.length == 0 && !isLoading && (
                <div className="text-center font-light italic mt-10">
                  Send Lucy a message...
                </div>
              )}

              {isLoading && (
                <div className="text-center font-light italic mt-10 animate-pulse">
                  Gimme a few seconds...
                </div>
              )}
            </div>
            <div className=" fixed bottom-0 w-full text-center py-6 ">
              <div className=" flex items-center justify-center w-full">
                <RecordMessage handleStop={handleStop}/>
              </div>
            </div>
        </div>
    </div>
  );
}

export default Controller;