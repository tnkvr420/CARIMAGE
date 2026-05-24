
export enum Page {
  Welcome,
  Upload,
  SelectScene,
  Generating,
  Results,
  Edit,
  Gallery,
  GeneratingVideo,
  VideoResults,
  LiveAssistant,
}

export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

export interface GeneratedImage {
  id: string;
  src: string;
  prompt: string;
  alt: string;
}

export interface GeneratedVideo {
  id: string;
  src: string; // Blob URL
  prompt: string;
}

export interface Scene {
  id: string;
  name: string;
  imageUrl?: string;
  description: string;
}

export interface Angle {
  id: string;
  name: string;
  icon: string;
}

export interface AspectRatio {
  id: string;
  name: string;
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
}