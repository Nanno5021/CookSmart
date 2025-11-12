// videoUtils.js - Utility functions for video embedding

/**
 * Extracts video ID from YouTube URL
 * Supports formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 */
export function getYouTubeVideoId(url) {
  if (!url) return null;
  
  // Pattern for youtube.com/watch?v=
  let match = url.match(/[?&]v=([^&#]*)/);
  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }
  
  // Pattern for youtu.be/
  match = url.match(/youtu\.be\/([^?&#]*)/);
  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }
  
  // Pattern for youtube.com/embed/
  match = url.match(/youtube\.com\/embed\/([^?&#]*)/);
  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }
  
  // Pattern for youtube.com/shorts/
  match = url.match(/youtube\.com\/shorts\/([^?&#]*)/);
  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }
  
  // Pattern for youtube.com/v/
  match = url.match(/youtube\.com\/v\/([^?&#]*)/);
  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }
  
  return null;
}

/**
 * Extracts video ID from Vimeo URL
 * Supports formats:
 * - https://vimeo.com/VIDEO_ID
 * - https://player.vimeo.com/video/VIDEO_ID
 */
export function getVimeoVideoId(url) {
  const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

/**
 * Detects video platform from URL
 * @returns 'youtube' | 'vimeo' | 'direct' | null
 */
export function detectVideoPlatform(url) {
  if (!url) return null;
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  
  if (url.includes('vimeo.com')) {
    return 'vimeo';
  }
  
  // Check if it's a direct video file
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return 'direct';
  }
  
  return null;
}

/**
 * Gets the embed URL for a video
 */
export function getVideoEmbedUrl(url) {
  const platform = detectVideoPlatform(url);
  
  switch (platform) {
    case 'youtube': {
      const videoId = getYouTubeVideoId(url);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    
    case 'vimeo': {
      const videoId = getVimeoVideoId(url);
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    
    case 'direct':
      return url;
      
    default:
      return url;
  }
}

/**
 * Validates if a URL is a valid video URL
 */
export function isValidVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Trim whitespace
  url = url.trim();
  
  // Must be a valid URL
  try {
    new URL(url);
  } catch {
    return false;
  }
  
  const platform = detectVideoPlatform(url);
  
  if (platform === 'youtube') {
    const videoId = getYouTubeVideoId(url);
    return videoId !== null && videoId.length === 11;
  }
  
  if (platform === 'vimeo') {
    const videoId = getVimeoVideoId(url);
    return videoId !== null && /^\d+$/.test(videoId);
  }
  
  if (platform === 'direct') {
    return true;
  }
  
  return false;
}

/**
 * Gets a user-friendly error message for invalid video URLs
 */
export function getVideoUrlError(url) {
  if (!url || url.trim() === '') {
    return 'Please enter a video URL';
  }
  
  try {
    new URL(url);
  } catch {
    return 'Please enter a valid URL';
  }
  
  const platform = detectVideoPlatform(url);
  
  if (!platform) {
    return 'Unsupported video platform. Please use YouTube, Vimeo, or a direct video link';
  }
  
  if (platform === 'youtube') {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) {
      return 'Invalid YouTube URL. Please use a link to a specific video (e.g., https://www.youtube.com/watch?v=...)';
    }
  }
  
  if (platform === 'vimeo') {
    const videoId = getVimeoVideoId(url);
    if (!videoId) {
      return 'Invalid Vimeo URL. Please use a link to a specific video (e.g., https://vimeo.com/123456789)';
    }
  }
  
  return null;
}