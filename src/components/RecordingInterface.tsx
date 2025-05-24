import React, { useState, useRef, useEffect } from 'react';
import { Camera, StopCircle } from 'lucide-react';
import { RecordingStatus } from '../types';
import axios from 'axios';

interface RecordingInterfaceProps {
  onStartRecording: () => void;
  onStopRecording: () => void;
  recordingStatus: RecordingStatus;
  watchedDuration: number; // <-- add this
}

const RecordingInterface: React.FC<RecordingInterfaceProps> = ({
  onStartRecording,
  onStopRecording,
  recordingStatus,
  watchedDuration, // <-- add this
}) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (recordingStatus === 'recording') {
      startCameraAndRecording();
      startTimer();
    } else {
      stopTimer();
      if (recordingStatus === 'completed') {
        stopCamera();
      }
    }

    return () => {
      stopTimer();
      stopCamera();
    };
  }, [recordingStatus]);

  useEffect(() => {
    if (timeLeft === 0 && recordingStatus === 'recording') {
      stopRecording();
      onStopRecording();
    }
  }, [timeLeft, recordingStatus]);

  const startCameraAndRecording = async () => {
    try {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoRef.current.srcObject = stream;

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        recordedChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          await uploadToS3(blob); // Upload when recording stops
        };

        mediaRecorder.start();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startTimer = () => {
    setTimeLeft(30);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const uploadToS3 = async (videoBlob: Blob) => {
    const formData = new FormData();
    formData.append('video', videoBlob, 'recording.webm');
    formData.append('campaignNumber', campaignValue);
    formData.append('watchedDuration', watchedDuration.toString()); // <-- add this

    try {
      const response = await axios.post('http://localhost:4000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Uploaded successfully:', response.data.url);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const urlParams = new URLSearchParams(window.location.search);
  const campaignValue = urlParams.get('id') || '001'; // default to '001' if not present

  return (
    <div className="animate-fadeIn">
      <div className="relative rounded-lg overflow-hidden bg-black aspect-video mb-4">
        {recordingStatus !== 'completed' && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {recordingStatus === 'recording' && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md flex items-center text-sm font-medium">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            {formatTime(timeLeft)}
          </div>
        )}

        {recordingStatus === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <Camera className="text-white" size={48} />
          </div>
        )}

        {recordingStatus === 'completed' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-white text-center">
              <p className="text-2xl font-medium mb-2">Recording Complete</p>
              <p className="text-sm opacity-80">Thank you for your consent</p>
            </div>
          </div>
        )}
      </div>

      {recordingStatus === 'idle' && (
        <button
          onClick={onStartRecording}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center transition-colors"
        >
          Start Recording
        </button>
      )}

      {recordingStatus === 'recording' && (
        <button
          onClick={() => {
            stopRecording();
            onStopRecording();
          }}
          className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium flex items-center justify-center transition-colors"
        >
          <StopCircle className="mr-2" size={20} />
          Stop Recording
        </button>
      )}
    </div>
  );
};

export default RecordingInterface;
