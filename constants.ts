
import { Scene, Angle, AspectRatio, StylePreset } from './types';

export const SCENES: Scene[] = [
  {
    id: 'studio',
    name: 'Studio',
    imageUrl: 'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'A clean studio shot with perfect, controlled lighting, dramatic reflections, and a minimalist solid dark background.'
  },
  {
    id: 'cityscape',
    name: 'Cityscape',
    imageUrl: 'https://images.pexels.com/photos/2330137/pexels-photo-2330137.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'A glowing neon-lit cityscape at night with illuminated skyscrapers, light trails in the background, and reflective wet pavement.'
  },
  {
    id: 'scenic_landscape',
    name: 'Scenic Landscape',
    imageUrl: 'https://images.pexels.com/photos/1638459/pexels-photo-1638459.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'A breathtaking scenic landscape at sunset with majestic mountains in the distance, dramatic clouds, and a cinematic golden hour glow.'
  },
  {
    id: 'highway_coast',
    name: 'Coastal Drive',
    imageUrl: 'https://images.pexels.com/photos/2303797/pexels-photo-2303797.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'A scenic coastal highway with the ocean stretching out to the horizon under a bright blue sky.'
  }
];

export const ALL_ANGLES_FOR_GENERATION: Angle[] = [
  { id: 'front_quarter_view', name: 'Front Quarter View', icon: '' },
  { id: 'side_profile', name: 'Side Profile', icon: '' },
  { id: 'rear_three_quarter_view', name: 'Rear Three-Quarter View', icon: '' },
  { id: 'close_up_headlight', name: 'Close up of a headlight', icon: '' },
  { id: 'high_angle_shot', name: 'High-angle shot', icon: '' },
  { id: 'low_angle_shot', name: 'Low-angle shot', icon: '' },
  { id: 'on_a_winding_road', name: 'On a winding road', icon: '' },
  { id: 'in_a_modern_garage', name: 'In a modern garage', icon: '' },
];

export const ASPECT_RATIOS: AspectRatio[] = [
  { id: '16:9', name: 'Landscape' },
  { id: '1:1', name: 'Square' },
  { id: '9:16', name: 'Portrait' },
];

export const STYLE_PRESETS: StylePreset[] = [
  { 
    id: 'photorealistic', 
    name: 'Photorealistic', 
    description: 'The style should be professional, high-resolution automotive photography with clean, natural lighting.' 
  },
  { 
    id: 'cinematic', 
    name: 'Cinematic', 
    description: 'The style should be cinematic, with dramatic lighting, a shallow depth of field, and a moody atmosphere.' 
  },
  { 
    id: 'studio', 
    name: 'Studio', 
    description: 'The style should be a clean studio shot with perfect, controlled lighting, sharp focus, and a minimalist background.' 
  },
];