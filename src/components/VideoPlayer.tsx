import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const campaignVideoMap: Record<string, string> = {
  '001': 'https://generative-ai-video.s3.ap-south-1.amazonaws.com/Activ+One+Plan+_+No+Limit+on+Hospitalization+Expenses+_+100%25+Health.+100%25+Health+Insurance..mp4',
  '002': 'https://generative-ai-video.s3.ap-south-1.amazonaws.com/Lost+Medicaid+or+CHIP+Coverage++HealthCare.gov+is+Here+For+You.mp4',
  // Add more campaignId: videoURL pairs here
};

interface VideoPlayerProps {
  poster?: string;
  onWatchTimeUpdate?: (seconds: number) => void; // <-- add this
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ poster, onWatchTimeUpdate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const campaignId = urlParams.get('id');
    const url = campaignVideoMap[campaignId || ''];
    if (url) {
      setVideoSrc(url);
    } else {
      alert('Invalid campaign ID');
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Add this handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const seconds = Math.floor(videoRef.current.currentTime);
      setWatchedSeconds(seconds);
      if (onWatchTimeUpdate) {
        onWatchTimeUpdate(seconds);
      }
    }
  };

  return (
    <div className="relative h-full flex flex-col glass-card rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 border-opacity-20">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-[#7E57C2] to-[#00A3FF] bg-clip-text text-transparent">
          Comprehensive Health Insurance
        </h2>
        <p className="text-sm text-gray-600 mt-1">No Limit on Hospitalisation Expenses</p>
      </div>
      
      <div className="relative flex-grow">
              {videoSrc && (
                <video
        ref={videoRef}
        className="w-full h-full object-cover"
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate} // <-- add this
      >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-16 h-16 flex items-center justify-center bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
          >
            {isPlaying ? (
              <Pause className="text-blue-600" size={32} />
            ) : (
              <Play className="text-blue-600 ml-1" size={32} />
            )}
          </button>
        </div>
      </div>

      
      <div className="p-4 bg-white bg-opacity-5 backdrop-blur-sm flex items-center justify-between border-t border-white border-opacity-10">
        <button
          onClick={togglePlay}
          className="text-gray-700 hover:text-blue-600 transition-colors"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <button
          onClick={toggleMute}
          className="text-gray-700 hover:text-blue-600 transition-colors"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;

