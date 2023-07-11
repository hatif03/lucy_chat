import React from 'react';
import { ReactMediaRecorder } from 'react-media-recorder';
import RecordIcon from './RecordIcon';

type Props = {
    handleStop: any;
}

const RecordMessage = ({handleStop}: Props) => {
  return (
    <ReactMediaRecorder
        audio
        onStop={handleStop}
        render={({ status, startRecording, stopRecording }) => (
        <div className=' mt-2'>
            <button onMouseDown={startRecording} onMouseUp={stopRecording} className=' bg-black shadow-lg p-5 rounded-full'>
                <RecordIcon classText={
                    status == "recording"? "animate-pulse text-red-900": "text-white"
                }/>
            </button>
            <p className=' text-white font-light mt-2'>{status}</p>
        </div>
        )}
    />
  )
};

export default RecordMessage;