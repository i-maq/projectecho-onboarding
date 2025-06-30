declare module 'recordrtc' {
  // Stubbed default export to any to avoid duplicate identifier errors
  const RecordRTC: any;
  export default RecordRTC;

  // Retain options interface if needed elsewhere
  export interface RecordRTCOptions {
    type?: 'video' | 'audio' | 'gif' | 'canvas';
    mimeType?: string;
    recorderType?: any;
    disableLogs?: boolean;
    timeSlice?: number;
    canvas?: {
      width?: number;
      height?: number;
    };
    video?: HTMLVideoElement;
    audio?: boolean | MediaTrackConstraints;
    videoBitsPerSecond?: number;
    audioBitsPerSecond?: number;
    frameRate?: number;
  }
}