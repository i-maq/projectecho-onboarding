declare module 'recordrtc' {
  export default RecordRTC;
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

  export class RecordRTC {
    constructor(stream: MediaStream, options?: RecordRTCOptions);
    startRecording(): void;
    stopRecording(callback?: (url: string) => void): void;
    pauseRecording(): void;
    resumeRecording(): void;
    getBlob(): Blob;
    getDataURL(callback: (dataURL: string) => void): void;
    toURL(): string;
    getSize(): number;
    destroy(): void;
    reset(): void;
  }

  export class RecordRTCPromisesHandler {
    constructor(stream: MediaStream, options?: RecordRTCOptions);
    startRecording(): Promise<void>;
    stopRecording(): Promise<void>;
    pauseRecording(): Promise<void>;
    resumeRecording(): Promise<void>;
    getBlob(): Promise<Blob>;
    getDataURL(): Promise<string>;
    toURL(): string;
    getSize(): number;
    destroy(): void;
    reset(): void;
  }
}