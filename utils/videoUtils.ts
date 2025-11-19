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

const captureFrame = (video: HTMLVideoElement): string => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.9);
};

const seekToPromise = (video: HTMLVideoElement, time: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      resolve();
    };
    const onError = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      reject(new Error('Error seeking video'));
    };

    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    video.currentTime = time;
  });
};

export const extractFramesFromVideo = async (file: File): Promise<{ frames: FrameData; metadata: VideoMetadata }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadeddata = async () => {
      try {
        const duration = video.duration;
        const width = video.videoWidth;
        const height = video.videoHeight;

        // 1. Capture First Frame (at 0s)
        await seekToPromise(video, 0);
        const firstFrame = captureFrame(video);

        // 2. Capture Last Frame
        // Seek very close to the end.
        // 60fps frame duration is ~0.016s. 
        // Using 0.001s (1ms) buffer ensures we are well within the last frame for any standard frame rate (up to ~1000fps).
        const seekTime = Math.max(0, duration - 0.001);
        await seekToPromise(video, seekTime);
        const lastFrame = captureFrame(video);

        const metadata: VideoMetadata = {
          name: file.name,
          size: file.size,
          duration,
          width,
          height
        };

        resolve({
          frames: { firstFrame, lastFrame },
          metadata
        });

      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objectUrl);
        video.remove();
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      video.remove();
      reject(new Error('Failed to load video file.'));
    };
  });
};