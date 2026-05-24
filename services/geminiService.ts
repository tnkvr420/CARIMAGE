
// DO NOT use global API_KEY constant; obtain directly from process.env.API_KEY in the constructor.
import { GoogleGenAI, GenerateContentResponse, ThinkingLevel } from "@google/genai";
import { ImageFile } from '../types';

async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file or file is empty"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type || 'image/jpeg' },
  };
}

async function getBase64FromSource(source: string | File): Promise<{ data: string, mimeType: string }> {
  if (typeof source === 'string') {
    if (!source) throw new Error("Source string is empty");
    const parts = source.split(',');
    const base64Data = parts.length > 1 ? parts[1] : parts[0];
    const mimeType = source.match(/data:(.*);base64,/)?.[1] || 'image/png';
    return { data: base64Data, mimeType };
  } else {
    const part = await fileToGenerativePart(source);
    return { data: part.inlineData.data, mimeType: part.inlineData.mimeType };
  }
}

export async function generateImage(
  userImages: ImageFile[],
  sceneDescription: string,
  angleName: string,
  addPerson: boolean,
  personImage: File | null,
  aspectRatio: string,
  styleDescription: string,
  backgroundImage: File | null = null,
  imageSize: '1K' | '2K' | '4K' = '1K',
  logoImage: File | null = null
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  
  // Intelligently select whether to use the front or rear reference based on the requested angle
  const angleLower = angleName.toLowerCase();
  const requestWantsRear = angleLower.includes('rear') || angleLower.includes('back');
  const referenceImage = (requestWantsRear && userImages.length > 1) ? userImages[1] : userImages[0];

  const carImagePart = await fileToGenerativePart(referenceImage.file);

  let textPrompt = '';
  const finalParts = [carImagePart];
  
  const realismInstructions = `The final image must be an ultra-realistic, professional automotive photograph, indistinguishable from a real photo. Pay meticulous attention to lighting, shadows, reflections, and material textures to achieve maximum photorealism. Ensure the car's appearance is perfectly consistent with the provided car image, capturing every detail accurately.`;

  let personPartIndex = -1;
  let bgPartIndex = -1;
  let logoPartIndex = -1;

  if (personImage) {
    const personImagePart = await fileToGenerativePart(personImage);
    finalParts.push(personImagePart);
    personPartIndex = finalParts.length - 1;
  }

  if (backgroundImage) {
    const bgImagePart = await fileToGenerativePart(backgroundImage);
    finalParts.push(bgImagePart);
    bgPartIndex = finalParts.length - 1;
  }

  if (logoImage) {
    const logoImagePart = await fileToGenerativePart(logoImage);
    finalParts.push(logoImagePart);
    logoPartIndex = finalParts.length - 1;
  }

  const baseInstruction = `Create a single image with a ${aspectRatio} aspect ratio featuring the EXACT car from the provided reference image. The camera angle should be: "${angleName}". ${styleDescription} ${realismInstructions}`;

  if (bgPartIndex !== -1) {
    textPrompt = `${baseInstruction} Use the background from the LAST image provided as a virtual background. Place the car realistically into this virtual background, matching the lighting, environment, and shadows perfectly.`;
    if (personPartIndex !== -1) {
      textPrompt += ` Also include the person from image index ${personPartIndex} into the same scene. CRITICAL: You MUST pose the person in a whole new, natural pose that fits the scene. They must look hyper-realistic, flawed but natural, with perfect human proportions and lighting integration. They must look like a real photograph, not stylized, and looking at the camera.`;
    } else if (addPerson) {
      textPrompt += ' Include a hyper-realistic, photorealistic person in the scene, interacting naturally in a dynamic pose and looking directly at the camera. The person must look flawlessly real, not AI-generated.';
    }
  } else {
    textPrompt = `${baseInstruction} Render this car seamlessly into the following virtual background environment: "${sceneDescription}". Ensure the reflections on the car match this specific environment flawlessly.`;
    if (personPartIndex !== -1) {
      textPrompt += ` Also include the person from the image at index ${personPartIndex} into this scene. CRITICAL: You MUST pose the person in a whole new, natural pose that fits the scene. They must look hyper-realistic, flawed but natural, with perfect human proportions and lighting integration. They must look like a real photograph, not stylized, and looking at the camera.`;
    } else if (addPerson) {
      textPrompt += ' Include a hyper-realistic, photorealistic person in the scene, interacting naturally in a dynamic pose and looking directly at the camera. The person must look flawlessly real, not AI-generated.';
    }
  }

  if (logoPartIndex !== -1) {
    textPrompt += ` CRITICAL: Please also seamlessly and cleanly incorporate the dealership logo from image index ${logoPartIndex} into the scene's environment (for instance, on a showroom wall plaque, window decal, backdrop graphic, outdoor dealership sign, or billboard). The logo must look like it is physically part of the environment, respecting the perspective, lighting, shadows, and focus of the scene. Do NOT place it as a simple floating digital watermark overlay.`;
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [...finalParts, { text: textPrompt }] },
    config: {
        imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: imageSize
        }
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
      for (const part of parts) {
          if (part.inlineData) {
              const base64ImageBytes: string = part.inlineData.data;
              return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
          }
      }
  }

  if (response.promptFeedback?.blockReason) {
    throw new Error(`Image generation failed due to: ${response.promptFeedback.blockReason}.`);
  }
  
  throw new Error("Image generation failed to produce an image.");
}

export async function editImage(
    base64Image: string, 
    userPrompt: string, 
    editReferenceImage?: File
): Promise<string> {
    if (!base64Image) throw new Error("Base64 image is required for editing");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const imageParts = base64Image.split(',');
    const base64Data = imageParts.length > 1 ? imageParts[1] : imageParts[0];
    const mimeType = base64Image.match(/data:(.*);base64,/)?.[1] || 'image/jpeg';
    
    const imagePart = {
      inlineData: { data: base64Data, mimeType: mimeType },
    };

    const textPart = { text: userPrompt };
    
    const parts = [imagePart, textPart];

    if (editReferenceImage) {
        const referenceImagePart = await fileToGenerativePart(editReferenceImage);
        parts.splice(1, 0, referenceImagePart); 
    }
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: { parts: parts },
    });

    const responseParts = response.candidates?.[0]?.content?.parts;
    if (responseParts) {
        for (const part of responseParts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
    }
    
    if (response.promptFeedback?.blockReason) {
        throw new Error(`Image editing failed due to: ${response.promptFeedback.blockReason}.`);
    }

    throw new Error("Image editing failed to produce an image.");
}

export async function generateVideo(
  referenceImages: (string | File)[],
  prompt: string,
  aspectRatio: '16:9' | '9:16'
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  
  const numImages = referenceImages.length;
  let model = 'veo-3.1-lite-generate-preview';
  let config: any = {
    numberOfVideos: 1,
    resolution: '720p',
    aspectRatio: aspectRatio,
  };
  let requestPayload: any = {
    prompt: prompt,
  };

  if (numImages === 1) {
    const { data, mimeType } = await getBase64FromSource(referenceImages[0]);
    requestPayload.image = { imageBytes: data, mimeType };
    requestPayload.prompt = `Using the provided image of a car as a reference, generate a short video. The car in the video MUST be the EXACT same car as in the image. ${prompt}`;
  } else if (numImages > 1) {
    // For multiple images, we use the standard model which supports referenceImages payload
    model = 'veo-3.1-generate-preview';
    const refs = await Promise.all(referenceImages.slice(0, 3).map(async (img) => {
        const { data, mimeType } = await getBase64FromSource(img);
        return {
            image: { imageBytes: data, mimeType },
            referenceType: 'ASSET'
        };
    }));
    config.referenceImages = refs;
    // Multi-reference requires 16:9 and 720p usually
    config.aspectRatio = '16:9';
    requestPayload.prompt = `Generate a video incorporating these assets. ${prompt}`;
  }

  let requestOptions: any = {
    model: model,
    prompt: requestPayload.prompt,
    config: config
  };
  if (requestPayload.image) {
    requestOptions.image = requestPayload.image;
  }

  let operation = await ai.models.generateVideos(requestOptions);

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    const errorDetails = (operation.error as any)?.message || '';
    if (errorDetails.includes('Requested entity was not found')) {
      throw new Error('API_KEY_NOT_FOUND');
    }
    throw new Error("Video generation failed to produce a download link.");
  }
  
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`);
  }

  const videoBlob = await response.blob();
  return URL.createObjectURL(videoBlob);
}

export async function enhanceSceneDescription(shortDescription: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite-preview',
    contents: `Expand this short description into a detailed, atmospheric scene description suitable for a professional automotive photoshoot. Keep it under 50 words. Description: "${shortDescription}"`,
  });

  return response.text || shortDescription;
}

export async function analyzeCarAndSuggestScene(carImage: File): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  const carImagePart = await fileToGenerativePart(carImage);
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: {
      parts: [
        carImagePart, 
        { text: 'Analyze this car meticulously. Think deeply about its design language, target demographic, color, and vibe. Based on this complex reasoning, write a 30-word ultra-detailed virtual background prompt (lighting, environment, mood) that would flawlessly complement this exact vehicle for a high-end luxury advertisement layout.' }
      ]
    },
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  return response.text || 'A luxurious environment tailored for the vehicle.';
}

export async function chatWithConcierge(
  history: { role: 'user' | 'model'; text: string }[],
  latestMessage: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  
  const systemInstruction = `You are a sophisticated, bespoke virtual concierge for Cadillac of Pasadena. Your persona is highly professional, articulate, elegant, and deeply knowledgeable about luxury automotive staging, fine arts, lighting, and cinematic environments.
Your goal is to converse with the client and help them craft a breathtaking, specific virtual background prompt for a professional photo shoot of their vehicle.
- Be encouraging, detailed, and write in the style of an elite lifestyle curator.
- Keep responses relatively brief (around 40-60 words).
- When you describe a final curated environment, end your response or embed a special bracketed prompt starting with [PROMPT] ... [/PROMPT] containing a pristine, detailed 30-word prompt that describes the virtual background (e.g. lighting, pavement reflections, background, colors, mood). This prompt will be parsed and injected into the setup automatically.`;

  const contents = [
    ...history.map(item => ({
      role: item.role,
      parts: [{ text: item.text }]
    })),
    {
      role: 'user',
      parts: [{ text: latestMessage }]
    }
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: contents,
    config: {
      systemInstruction: systemInstruction,
    }
  });

  return response.text || "I was unable to formulate a response. Let us try another angle.";
}

