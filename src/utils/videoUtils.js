/**
 * Video utility functions for handling different video sources
 */

/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if not found
 */
export const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Convert YouTube URL to embed URL for web viewing
 * @param {string} url - YouTube URL
 * @returns {string|null} - Embed URL or null if invalid
 */
export const getYouTubeEmbedUrl = (url) => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  
  return `https://www.youtube.com/embed/${videoId}`;
};

/**
 * Get YouTube thumbnail URL
 * @param {string} url - YouTube URL
 * @param {string} quality - Thumbnail quality (default, mqdefault, hqdefault, sddefault, maxresdefault)
 * @returns {string|null} - Thumbnail URL or null if invalid
 */
export const getYouTubeThumbnail = (url, quality = 'hqdefault') => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

/**
 * Check if URL is a YouTube URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if YouTube URL
 */
export const isYouTubeUrl = (url) => {
  if (!url) return false;
  
  return /(?:youtube\.com|youtu\.be)/.test(url);
};

/**
 * Check if URL is a direct video URL (playable in React Native Video)
 * @param {string} url - URL to check
 * @returns {boolean} - True if direct video URL
 */
export const isDirectVideoUrl = (url) => {
  if (!url) return false;
  
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
  const lowerUrl = url.toLowerCase();
  
  return videoExtensions.some(ext => lowerUrl.includes(ext)) || 
         lowerUrl.includes('commondatastorage.googleapis.com') ||
         lowerUrl.includes('sample-videos.com');
};

/**
 * Get video info object with type and playable URL
 * @param {string} url - Video URL
 * @returns {object} - Video info object
 */
export const getVideoInfo = (url) => {
  if (!url) {
    return {
      type: 'unknown',
      url: null,
      playable: false,
      thumbnailUrl: null,
      embedUrl: null
    };
  }
  
  if (isYouTubeUrl(url)) {
    return {
      type: 'youtube',
      url: url,
      playable: false, // YouTube URLs are not directly playable in React Native Video
      thumbnailUrl: getYouTubeThumbnail(url),
      embedUrl: getYouTubeEmbedUrl(url),
      videoId: extractYouTubeVideoId(url)
    };
  }
  
  if (isDirectVideoUrl(url)) {
    return {
      type: 'direct',
      url: url,
      playable: true,
      thumbnailUrl: null,
      embedUrl: null
    };
  }
  
  return {
    type: 'unknown',
    url: url,
    playable: false,
    thumbnailUrl: null,
    embedUrl: null
  };
};

/**
 * Sample video URLs for testing
 */
export const SAMPLE_VIDEOS = {
  bigBuckBunny: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  elephantsDream: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  forBiggerBlazes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  forBiggerEscapes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  forBiggerFun: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  forBiggerJoyrides: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  forBiggerMeltdowns: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  sintel: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  subaru: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  tearsOfSteel: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  volvo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  weBareBearsEpisode: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
};
