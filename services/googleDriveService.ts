import { getApp, getApps, initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App safely (especially under HMR/development reloads)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Add required Google Drive scope
provider.addScope('https://www.googleapis.com/auth/drive');

// In-memory authentication state variables
let isSigningIn = false;
let cachedAccessToken: string | null = null;

/**
 * Initialize Firebase authentication state listener.
 * This is run on application load.
 */
export const initAuth = (
  onAuthSuccess: (user: User, token: string) => void,
  onAuthFailure: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If there is signed in user but no cached token, we can clear this or prompt
        onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure();
    }
  });
};

/**
 * Initiates the Google login flow and retrieves the token.
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Retrieves the cached access token in memory.
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Log out from Firebase.
 */
export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// --- Google Drive API REST Client Logic ---

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
}

/**
 * Fetch image files from the user's Google Drive.
 */
export const fetchDriveFiles = async (pageSize: number = 30): Promise<DriveFile[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google Workspace');
  }

  // Filter for common image types or videos
  const mimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic"
  ];
  const queryParts = mimeTypes.map(type => `mimeType = '${type}'`);
  const q = `(${queryParts.join(' or ')}) and trashed = false`;

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&pageSize=${pageSize}&fields=files(id,name,mimeType,thumbnailLink,webContentLink)&orderBy=modifiedTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Error fetching drive files:', text);
    throw new Error(`Failed to list Google Drive files: ${response.statusText}`);
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * Downloads a file from Google Drive as a File/Blob representation.
 */
export const downloadDriveFile = async (
  fileId: string, 
  fileName: string, 
  mimeType: string
): Promise<File> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google Workspace');
  }

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to download file from Google Drive: ${response.statusText}`);
  }

  const blob = await response.blob();
  return new File([blob], fileName, { type: mimeType });
};

/**
 * Gets or creates a folder on Google Drive.
 */
export const getOrCreateFolder = async (folderName: string): Promise<string | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  // Search if folder exists
  const q = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`;
  
  try {
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
      }
    }

    // Create folder
    const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: "application/vnd.google-apps.folder"
      })
    });

    if (createRes.ok) {
      const folder = await createRes.json();
      return folder.id;
    }
  } catch (error) {
    console.error("Error creating folder in Drive:", error);
  }
  return null;
};

/**
 * Uploads a base64 DataURL or a standard Blob/File to a custom folder in Google Drive.
 */
export const uploadBlobToDrive = async (
  blobOrDataUrl: Blob | string,
  fileName: string,
  mimeType: string,
  folderName: string = "Cadillac Photoshoots"
): Promise<{ id: string; webViewLink?: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google Workspace');
  }

  let finalBlob: Blob;
  if (typeof blobOrDataUrl === 'string') {
    // If it is a data URI/ObjectURL, we convert it to Blob
    if (blobOrDataUrl.startsWith('data:')) {
      const response = await fetch(blobOrDataUrl);
      finalBlob = await response.blob();
    } else if (blobOrDataUrl.startsWith('blob:') || blobOrDataUrl.startsWith('http')) {
      // It is a blob URL or remote URL, fetch it
      const response = await fetch(blobOrDataUrl);
      finalBlob = await response.blob();
    } else {
      throw new Error('Unsupported image URL string format for upload');
    }
  } else {
    finalBlob = blobOrDataUrl;
  }

  // Get or create parent folder
  const folderId = await getOrCreateFolder(folderName);

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    parents: folderId ? [folderId] : []
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', finalBlob);

  const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error uploading file to Drive:', errorText);
    throw new Error(`Failed to upload to Google Drive: ${response.statusText}`);
  }

  return await response.json();
};
