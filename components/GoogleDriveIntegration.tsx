import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cloud, 
  Check, 
  X, 
  Loader2, 
  FolderOpen, 
  User, 
  LogOut, 
  AlertTriangle, 
  Search,
  Eye,
  FileImage,
  ArrowRight,
  Download
} from 'lucide-react';
import { 
  googleSignIn, 
  logout, 
  fetchDriveFiles, 
  downloadDriveFile, 
  uploadBlobToDrive, 
  getAccessToken,
  DriveFile,
  auth
} from '../services/googleDriveService';
import { User as FirebaseUser } from 'firebase/auth';

// Official styled Google sign-in button HTML-equivalent React Component
export const GoogleSignInButton: React.FC<{ onClick: () => void; label?: string; isLoading?: boolean }> = ({ onClick, label = "Sign in with Google", isLoading }) => {
  return (
    <button 
      onClick={onClick} 
      disabled={isLoading}
      className="gsi-material-button relative flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 h-14 rounded-xl border border-gray-300 w-full active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader2 className="animate-spin size-5 text-gray-500" />
      ) : (
        <div className="gsi-material-button-icon flex items-center justify-center size-5 shrink-0">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
        </div>
      )}
      <span className="text-sm font-black text-[#1f2937] tracking-wider uppercase font-sans">
        {isLoading ? "Authenticating..." : label}
      </span>
    </button>
  );
};

// User Google Auth Header/Badge Helper
export const GoogleUserBadge: React.FC<{ 
  user: FirebaseUser | null; 
  onSignIn: () => void;
  onSignOut: () => void;
}> = ({ user, onSignIn, onSignOut }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative z-30">
      {user ? (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full py-1.5 pl-2 pr-3.5 transition-all active:scale-95"
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || "User"} referrerPolicy="no-referrer" className="size-6 rounded-full border border-primary/20" />
            ) : (
              <div className="size-6 rounded-full bg-primary/25 border border-primary/20 flex items-center justify-center text-primary text-xs">
                <User className="size-3.5" />
              </div>
            )}
            <span className="text-[10px] font-black tracking-widest text-white uppercase truncate max-w-[80px]">
              {user.displayName?.split(' ')[0] || 'Drive Connected'}
            </span>
          </button>

          <AnimatePresence>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowDropdown(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-black/95 backdrop-blur-xl p-3 shadow-2xl z-30 space-y-3"
                >
                  <div className="px-2 py-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Connected Developer Account</p>
                    <p className="text-xs text-white truncate font-medium mt-1">{user.displayName || 'Google User'}</p>
                    <p className="text-[10px] text-gray-500 truncate font-mono mt-0.5">{user.email}</p>
                  </div>
                  <div className="h-px bg-white/10" />
                  <button 
                    onClick={() => {
                      onSignOut();
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-black text-red-400 hover:bg-white/5 rounded-lg transition-colors uppercase tracking-widest"
                  >
                    <LogOut className="size-4" />
                    Disconnect Drive
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <button 
          onClick={onSignIn}
          className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-full py-1.5 px-3 text-[9px] font-black tracking-widest uppercase transition-all"
        >
          <Cloud className="size-3.5" />
          Connect Drive
        </button>
      )}
    </div>
  );
};

// --- Beautiful Google Drive Custom File Picker Modal ---
export interface GoogleDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelected: (file: File) => void;
  title?: string;
}

export const GoogleDrivePickerModal: React.FC<GoogleDrivePickerModalProps> = ({
  isOpen,
  onClose,
  onFileSelected,
  title = "Select from Google Drive"
}) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync auth state
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      const token = await getAccessToken();
      setIsAuthenticated(!!firebaseUser && !!token);
    });
    return () => unsub();
  }, []);

  // Fetch file list when authenticated & open
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadFiles();
    }
  }, [isOpen, isAuthenticated]);

  const loadFiles = async () => {
    setIsLoadingFiles(true);
    setErrorMsg(null);
    try {
      const driveFiles = await fetchDriveFiles(40);
      setFiles(driveFiles);
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Failed to list Google Drive photos. Verify app permissions.");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setIsAuthenticated(true);
        setUser(res.user);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Google Drive authentication failed.");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleFileClick = async (driveFile: DriveFile) => {
    setDownloadingFileId(driveFile.id);
    setErrorMsg(null);
    try {
      // Step 1: Download from Google Drive API
      const downloadedFile = await downloadDriveFile(
        driveFile.id, 
        driveFile.name, 
        driveFile.mimeType
      );
      // Step 2: Push back up
      onFileSelected(downloadedFile);
      onClose();
    } catch (e: any) {
      console.error(e);
      setErrorMsg(`Failed to import file "${driveFile.name}". Please try again.`);
    } finally {
      setDownloadingFileId(null);
    }
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md" 
          onClick={onClose} 
        />

        {/* Modal Panel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] z-10"
        >
          {/* Header */}
          <header className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cloud className="text-primary size-5 shrink-0" />
              <div>
                <h3 className="text-white text-xs font-black uppercase tracking-[0.15em]">{title}</h3>
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Cloud Assets Portal</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="size-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all hover:bg-white/10"
            >
              <X className="size-4" />
            </button>
          </header>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin flex flex-col min-h-[300px]">
            {errorMsg && (
              <div className="mb-5 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-start gap-3">
                <AlertTriangle className="text-red-400 size-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] text-red-300 font-black uppercase tracking-widest">Authentication / Drive Error</p>
                  <p className="text-[10px] text-red-300/75 font-medium leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            {!isAuthenticated ? (
              // Sign-in Required Screen
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 space-y-8">
                <div className="size-16 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(245,197,66,0.05)]">
                  <FolderOpen className="size-8" />
                </div>
                <div className="space-y-2 max-w-xs">
                  <h4 className="text-white text-base font-black uppercase tracking-widest leading-normal">Google Cloud Studio</h4>
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed uppercase tracking-widest">
                    Unlock instant vehicle image sourcing from your personal Google Drive account.
                  </p>
                </div>
                <div className="w-full pt-4">
                  <GoogleSignInButton onClick={handleSignIn} isLoading={isLoadingAuth} label="Link Google Account" />
                </div>
              </div>
            ) : isLoadingFiles ? (
              // Loading Files
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16 space-y-4">
                <Loader2 className="animate-spin text-primary size-10" />
                <p className="text-[9px] uppercase font-black text-gray-500 tracking-widest italic animate-pulse">Sourcing Drive Directory...</p>
              </div>
            ) : (
              // File Browser Grid
              <div className="space-y-5 flex-1 flex flex-col">
                {/* Search Bar */}
                <div className="relative flex items-center bg-white/5 border border-white/5 rounded-xl px-3 h-11 shrink-0">
                  <Search className="size-4 text-gray-500 shrink-0" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search image filename..."
                    className="placeholder:text-gray-600 bg-transparent border-none text-white text-xs outline-none pl-2.5 flex-1 font-semibold"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-gray-500 hover:text-white">
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {filteredFiles.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {filteredFiles.map((f) => {
                      const isDownloading = downloadingFileId === f.id;
                      return (
                        <button
                          key={f.id}
                          disabled={downloadingFileId !== null}
                          onClick={() => handleFileClick(f)}
                          className="relative aspect-square rounded-2xl border border-white/5 overflow-hidden hover:border-primary active:scale-95 transition-all text-left flex flex-col group disabled:opacity-50"
                        >
                          {f.thumbnailLink ? (
                            <img src={f.thumbnailLink.replace(/=s\d+$/, '=s300')} alt={f.name} className="w-full h-full object-cover shrink-0" />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-400">
                              <FileImage className="size-8" />
                            </div>
                          )}
                          
                          {/* Dark Overlays & Title */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 flex flex-col justify-end p-2.5">
                            <p className="text-white text-[8px] font-bold line-clamp-1 break-all tracking-wider text-center">{f.name}</p>
                          </div>

                          {/* Hover Eye indicator */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {isDownloading ? (
                              <Loader2 className="animate-spin text-primary size-6" />
                            ) : (
                              <Eye className="text-primary size-5" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-4">
                    <div className="size-12 rounded-full border border-dashed border-white/10 flex items-center justify-center text-gray-500">
                      <FileImage className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-wider">No matching photos found</p>
                      <p className="text-[9px] text-gray-600 py-2 max-w-[200px] leading-relaxed mx-auto uppercase font-bold tracking-widest">
                        We scan Drive JPEG, PNG, HEIC and WEBP files. Ensure you have imagery uploaded on Drive!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer User Profile Sync */}
          {isAuthenticated && user && (
            <footer className="px-6 py-4 bg-white/5 border-t border-white/5 flex justify-between items-center text-xs shrink-0">
              <div className="flex items-center gap-2">
                {user.photoURL && <img src={user.photoURL} className="size-5 rounded-full" />}
                <span className="text-[10px] text-gray-400 font-black tracking-widest truncate uppercase max-w-[150px]">{user.displayName || "Google User"}</span>
              </div>
              <button 
                onClick={async () => {
                  await logout();
                  setIsAuthenticated(false);
                  setUser(null);
                  setFiles([]);
                }}
                className="text-[9px] text-red-400 hover:text-red-300 font-extrabold tracking-widest uppercase transition-all"
              >
                Disconnect
              </button>
            </footer>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- Beautiful, Satisfying "Save to Google Drive" Action Button Component ---
interface SaveToDriveButtonProps {
  fileUrl: string; // The local Blob or blob URL of the generated asset (image or video)
  fileName: string; // The generated target filename
  mimeType?: string; // e.g. "image/png" or "video/mp4"
}

export const SaveToDriveButton: React.FC<SaveToDriveButtonProps> = ({
  fileUrl,
  fileName,
  mimeType = "image/png"
}) => {
  const [authState, setAuthState] = useState<{ user: FirebaseUser | null; isAuth: boolean }>({ user: null, isAuth: false });
  const [status, setStatus] = useState<'idle' | 'auth_needed' | 'uploading' | 'success' | 'error'>('idle');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      const token = await getAccessToken();
      setAuthState({ user, isAuth: !!user && !!token });
    });
    return () => unsub();
  }, []);

  const handleSaveToDrive = async () => {
    if (!authState.isAuth) {
      setStatus('auth_needed');
      return;
    }

    setStatus('uploading');
    setErrorDetails(null);

    try {
      // Execute upload service call
      const res = await uploadBlobToDrive(fileUrl, fileName, mimeType);
      console.log("Uploaded successfully to Drive!", res);
      setStatus('success');
      
      // Clear status after delay
      setTimeout(() => setStatus('idle'), 3500);
    } catch (e: any) {
      console.error(e);
      setStatus('error');
      setErrorDetails(e.message || "Failed to transfer file.");
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleSignIn = async () => {
    setStatus('uploading');
    try {
      const res = await googleSignIn();
      if (res) {
        setAuthState({ user: res.user, isAuth: true });
        // Auto resume saving!
        const uploadRes = await uploadBlobToDrive(fileUrl, fileName, mimeType);
        console.log("Uploaded successfully to Drive!", uploadRes);
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3500);
      } else {
        setStatus('idle');
      }
    } catch (e: any) {
      console.error(e);
      setStatus('error');
      setErrorDetails("Google login was interrupted.");
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.button 
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            onClick={handleSaveToDrive}
            className="size-10 rounded-xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary hover:text-black transition-all font-black tracking-widest text-xs"
            title="Save output to Google Drive"
          >
            <Cloud className="size-5 shrink-0" />
          </motion.button>
        )}

        {status === 'auth_needed' && (
          <motion.div 
            key="auth"
            initial={{ opacity: 0, scale: 0.95, y: -10 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-12 right-0 w-64 bg-black border border-white/10 p-4 rounded-2xl z-40 shadow-2xl space-y-3.5"
          >
            <div className="space-y-1">
              <h5 className="text-[10px] uppercase font-black tracking-wider text-primary">Authenticate Google Storage</h5>
              <p className="text-[10px] text-gray-500 font-bold leading-normal uppercase">We need to link Google Drive to save photos into "Cadillac Photoshoots" folder.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setStatus('idle')}
                className="flex-1 text-[9px] font-black uppercase text-gray-500 hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={handleSignIn}
                className="flex-1 bg-primary text-black font-extrabold text-[9px] h-8 rounded-lg uppercase tracking-wider hover:bg-primary-dark transition-colors"
              >
                Link Now
              </button>
            </div>
          </motion.div>
        )}

        {status === 'uploading' && (
          <motion.div 
            key="uploading"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="h-10 px-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest shrink-0 shadow-lg"
          >
            <Loader2 className="animate-spin size-4" />
            Transferring...
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            className="h-10 px-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-black uppercase text-[10px] tracking-widest shrink-0 flex items-center gap-2 shadow-lg"
          >
            <Check className="size-4" />
            Saved to Drive!
          </motion.div>
        )}

        {status === 'error' && (
          <motion.button 
            key="error"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setStatus('idle')}
            className="h-10 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-black uppercase text-[10px] tracking-widest shrink-0 flex items-center gap-2 shadow-lg"
            title={errorDetails || "Error occurred"}
          >
            <AlertTriangle className="size-4" />
            Error - Retry
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
