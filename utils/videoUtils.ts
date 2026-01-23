import { FrameData, VideoMetadata } from '../types';

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const captureFrame = (video: HTMLVideoElement, logger: (msg: string) => void): string => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Draw the current frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Check if the frame is empty (black) - optional debug check could go here
    // const pixel = ctx.getImageData(0, 0, 1, 1).data;
    // logger(`Captured frame pixel at 0,0: rgba(${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]})`);

    return canvas.toDataURL('image/jpeg', 0.9);
  } catch (e: any) {
    logger(`Error capturing frame: ${e.message}`);
    throw e;
  }
};

const seekToPromise = (video: HTMLVideoElement, time: number, logger: (msg: string) => void): Promise<void> => {
  return new Promise((resolve, reject) => {
    logger(`Seeking to ${time.toFixed(4)}s...`);
    
    const onSeeked = () => {
      logger(`Event: 'seeked' fired for ${time.toFixed(4)}s`);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      resolve();
    };
    
    const onError = (e: Event) => {
      logger(`Error during seek: ${(e as any).message || 'Unknown error'}`);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      reject(new Error('Error seeking video'));
    };

    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    
    video.currentTime = time;
  });
};

export type LogCallback = (message: string) => void;

export const extractFramesFromVideo = async (
  file: File, 
  logger: LogCallback = console.log
): Promise<{ frames: FrameData; metadata: VideoMetadata }> => {
  return new Promise((resolve, reject) => {
    logger(`Starting process for: ${file.name} (${file.type}, ${formatBytes(file.size)})`);
    
    // 1. Create Video Element
    const video = document.createElement('video');
    
    // Important attributes for iOS
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.muted = true;
    video.preload = 'auto'; // 'auto' helps iOS buffer faster than 'metadata'
    
    // 2. Append to DOM (Crucial for iOS Safari)
    // iOS often suspends media loading if the element is not in the DOM.
    video.style.position = 'fixed';
    video.style.top = '-9999px';
    video.style.left = '-9999px';
    video.style.width = '10px';
    video.style.height = '10px';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);
    logger('Video element created and appended to DOM (hidden).');

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    logger(`Blob URL created: ${objectUrl}`);

    // Cleanup function
    const cleanup = () => {
      logger('Cleaning up resources...');
      if (video.parentNode) {
        document.body.removeChild(video);
      }
      video.removeAttribute('src');
      video.load(); // Reset
      URL.revokeObjectURL(objectUrl);
    };

    // Error handling
    video.onerror = (e) => {
      const err = video.error;
      const msg = err ? `Code ${err.code}: ${err.message}` : 'Unknown video error';
      logger(`Video Error: ${msg}`);
      cleanup();
      reject(new Error(`Failed to load video: ${msg}`));
    };

    // 3. Wait for Metadata
    video.onloadedmetadata = async () => {
      logger('Event: loadedmetadata fired.');
      
      try {
        const duration = video.duration;
        const width = video.videoWidth;
        const height = video.videoHeight;
        
        logger(`Metadata: Duration=${duration.toFixed(3)}s, Size=${width}x${height}`);

        if (!Number.isFinite(duration) || duration === 0) {
            throw new Error('Invalid video duration (0 or Infinity).');
        }

        // --- Extract First Frame ---
        // Even though currentTime is 0, we explicitly seek to ensure 'seeked' fires and frame is ready.
        await seekToPromise(video, 0, logger);
        
        // Small delay to ensure rendering on some devices
        // await new Promise(r => setTimeout(r, 50)); 
        
        const firstFrame = captureFrame(video, logger);
        logger('First frame captured.');

        // --- Extract Last Frame ---
        // 1ms buffer from the end
        const seekTime = Math.max(0, duration - 0.001);
        await seekToPromise(video, seekTime, logger);
        
        const lastFrame = captureFrame(video, logger);
        logger('Last frame captured.');

        const metadata: VideoMetadata = {
          name: file.name,
          size: file.size,
          duration,
          width,
          height
        };

        cleanup();
        logger('Processing complete. Resolving promise.');
        resolve({
          frames: { firstFrame, lastFrame },
          metadata
        });

      } catch (error: any) {
        logger(`Exception during processing: ${error.message}`);
        cleanup();
        reject(error);
      }
    };

    // 4. Trigger Load
    logger('Calling video.load() to start buffering...');
    video.load();

    // Safety Timeout for iOS hanging
    setTimeout(() => {
        if (video.readyState < 1) { // HAVE_METADATA = 1
            const msg = 'Timeout waiting for video metadata. iOS Safari might be blocking the load.';
            logger(`Error: ${msg}`);
            // Don't auto-reject here immediately to allow very slow networks, 
            // but usually 15s is enough for local blobs.
            // reject(new Error(msg)); // Optional: strict timeout
        }
    }, 15000);
  });
};
