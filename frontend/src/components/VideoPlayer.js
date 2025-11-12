import React from "react";
import { detectVideoPlatform, getVideoEmbedUrl, getVideoUrlError } from "../utils/videoUtils";
import { AlertCircle } from "lucide-react";

function VideoPlayer({ url, title = "Video Content" }) {
  if (!url) {
    return (
      <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No video URL provided</p>
      </div>
    );
  }

  // Validate the URL
  const errorMessage = getVideoUrlError(url);
  if (errorMessage) {
    return (
      <div className="w-full p-6 bg-red-900/20 border border-red-700 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-400 font-medium mb-1">Invalid Video URL</p>
            <p className="text-red-300 text-sm">{errorMessage}</p>
            <p className="text-gray-400 text-xs mt-2">URL: {url}</p>
          </div>
        </div>
      </div>
    );
  }

  const platform = detectVideoPlatform(url);
  const embedUrl = getVideoEmbedUrl(url);

  // Render based on platform
  if (platform === 'youtube' || platform === 'vimeo') {
    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (platform === 'direct') {
    return (
      <video
        controls
        className="w-full rounded-lg shadow-lg"
        style={{ maxHeight: '500px' }}
      >
        <source src={url} type="video/mp4" />
        <source src={url} type="video/webm" />
        <source src={url} type="video/ogg" />
        Your browser does not support the video tag.
      </video>
    );
  }

  // Fallback for unknown platforms
  return (
    <div className="w-full p-4 bg-gray-800 rounded-lg">
      <p className="text-gray-300 mb-2">Video URL:</p>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 break-all"
      >
        {url}
      </a>
    </div>
  );
}

export default VideoPlayer;