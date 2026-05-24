
import React, { useState, useEffect } from 'react';
import { Page, ImageFile } from './types';
import { SCENES, ALL_ANGLES_FOR_GENERATION, ASPECT_RATIOS, STYLE_PRESETS } from './constants';
import { generateImage, generateVideo, editImage, chatWithConcierge, analyzeCarAndSuggestScene } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ArrowLeft, Crown, Menu, Car, Wrench, Calendar, ArrowRight, MapPin, 
    X, ImagePlus, UserPlus, Check, Info, Sparkles, Film, Download, 
    RefreshCw, Home, Mic, Edit, Send, Volume2, Cloud
} from 'lucide-react';
// Google Drive integration removed

// --- Constants ---
const WELCOME_BG_URL = "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1280";

// --- Helper Functions ---
const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- Shared UI Components ---

const Header: React.FC<{ title: string; onBack?: () => void; rightElement?: React.ReactNode; logoUrl?: string | null }> = ({ title, onBack, rightElement, logoUrl }) => (
    <header className="flex items-center p-6 pb-4 justify-between sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        {onBack ? (
            <button onClick={onBack} className="text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/5 transition-colors">
                <ArrowLeft className="size-6" />
            </button>
        ) : <div className="size-10"></div>}
        <h1 className="text-white text-base font-black tracking-[0.1em] uppercase flex-1 text-center">{title}</h1>
        <div className="flex items-center justify-center min-w-[40px]">
            {rightElement || (
                logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-7 w-auto object-contain max-w-[80px] rounded border border-white/10" />
                ) : (
                    <Crown className="text-primary size-5" />
                )
            )}
        </div>
    </header>
);

const LuxuryButton: React.FC<{ 
    onClick: () => void; 
    disabled?: boolean; 
    variant?: 'primary' | 'outline' | 'ghost'; 
    children: React.ReactNode; 
    icon?: React.ReactNode;
    className?: string;
}> = ({ onClick, disabled, variant = 'primary', children, icon, className }) => {
    const base = "flex w-full items-center justify-center gap-3 h-16 rounded-xl font-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm";
    const styles = {
        primary: "bg-primary text-black hover:bg-primary-dark shadow-xl shadow-primary/10",
        outline: "border border-white/10 bg-white/5 backdrop-blur-md text-white hover:bg-white/10",
        ghost: "text-white/60 hover:text-white hover:bg-white/5"
    };

    return (
        <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>
            {children}
            {icon && <span className="flex items-center justify-center">{icon}</span>}
        </button>
    );
};

// --- Screens ---

const WelcomeScreen: React.FC<{ onGetStarted: () => void; onStartLive: () => void; logoUrl?: string | null }> = ({ onGetStarted, onStartLive, logoUrl }) => (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="relative min-h-screen flex flex-col w-full overflow-hidden bg-black"
    >
        <div 
            className="absolute inset-0 bg-cover bg-center z-0 scale-110 blur-[1px]" 
            style={{ backgroundImage: `url("${WELCOME_BG_URL}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 z-0" />
        
        <header className="relative z-10 flex justify-between items-center p-6 pt-10">
            <div className="flex items-center gap-3">
                {logoUrl ? (
                    <img src={logoUrl} alt="Dealership Logo" className="h-10 w-auto object-contain max-w-[120px] rounded" />
                ) : (
                    <>
                        <Crown className="text-primary size-8" />
                        <span className="text-white tracking-[0.25em] text-lg font-bold">CADILLAC</span>
                    </>
                )}
            </div>
            <button onClick={onStartLive} className="size-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition-all">
                <Menu className="size-6" />
            </button>
        </header>

        <main className="relative z-10 flex flex-col flex-grow items-center justify-center px-6 text-center">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-12 h-1 bg-primary rounded-full mb-8" />
            
            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-white text-5xl font-extrabold tracking-tight mb-2 leading-[1.1]">
                Welcome to<br />
                Cadillac<br />
                <span className="text-primary">of Pasadena</span>
            </motion.h1>
            
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-gray-400 text-lg max-w-xs mt-4 mb-12 font-medium">
                Experience the standard of the world in luxury and performance.
            </motion.p>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="grid grid-cols-3 gap-8 mb-16">
                <div className="flex flex-col items-center gap-3 group cursor-pointer">
                    <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                        <Car className="size-7" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-white/60 uppercase">Inventory</span>
                </div>
                <div className="flex flex-col items-center gap-3 group cursor-pointer">
                    <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                        <Wrench className="size-7" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-white/60 uppercase">Service</span>
                </div>
                <div className="flex flex-col items-center gap-3 group cursor-pointer">
                    <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                        <Calendar className="size-7" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-white/60 uppercase">Schedule</span>
                </div>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="w-full max-w-sm space-y-4">
                <LuxuryButton onClick={onGetStarted} icon={<ArrowRight className="size-5" />}>
                    GET STARTED
                </LuxuryButton>
                <LuxuryButton onClick={() => {}} variant="outline">
                    SIGN IN
                </LuxuryButton>
            </motion.div>
        </main>

        <footer className="relative z-10 p-10 flex flex-col items-center">
            <div className="flex items-center gap-2 text-white/40 font-bold text-xs tracking-widest uppercase">
                <MapPin className="size-4" />
                Pasadena, California
            </div>
            <div className="w-32 h-1 bg-white/10 rounded-full mt-6" />
        </footer>
    </motion.div>
);

const generateUUID = () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const UploadScreen: React.FC<{ 
    onFilesReady: (front: ImageFile, rear: ImageFile | null, person: File | null, logo: File | null) => void; 
    onBack: () => void;
    logoUrl?: string | null;
}> = ({ onFilesReady, onBack, logoUrl }) => {
    const [frontImage, setFrontImage] = useState<ImageFile | null>(null);
    const [rearImage, setRearImage] = useState<ImageFile | null>(null);
    const [personFile, setPersonFile] = useState<File | null>(null);
    const [personPreview, setPersonPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(logoUrl || null);

    const frontInputRef = React.useRef<HTMLInputElement>(null);
    const rearInputRef = React.useRef<HTMLInputElement>(null);
    const personInputRef = React.useRef<HTMLInputElement>(null);
    const logoInputRef = React.useRef<HTMLInputElement>(null);

    const handleCarFile = (event: React.ChangeEvent<HTMLInputElement>, isFront: boolean) => {
        console.log(`handleCarFile triggered: isFront=${isFront}`);
        const file = event.target.files?.[0];
        if (file) {
            console.log(`File selected: ${file.name}, size=${file.size}`);
            try {
                const newImage: ImageFile = {
                    id: generateUUID(),
                    file,
                    previewUrl: URL.createObjectURL(file)
                };
                if (isFront) {
                    setFrontImage(newImage);
                } else {
                    setRearImage(newImage);
                }
            } catch (err) {
                console.error("Error creating image preview:", err);
                alert("Failed to read image: " + (err as Error).message);
            }
        }
    };

    const handlePersonFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPersonFile(file);
            setPersonPreview(URL.createObjectURL(file));
        }
    };

    const handleLogoFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    // Authentication handlers removed

    return (
        <motion.div 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            className="relative flex min-h-screen w-full flex-col bg-background-dark"
        >
            <Header 
                title="Assets Selection" 
                onBack={onBack} 
                logoUrl={logoPreview}
            />
            <main className="flex-1 px-6 py-8 space-y-12 overflow-y-auto pb-32">
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">The Vehicle</h2>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Upload 1-2 distinct angles</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        {frontImage ? (
                            <div className="relative group aspect-square rounded-2xl overflow-hidden border border-primary/50 shadow-2xl bg-cadillac-black">
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${frontImage.previewUrl})` }} />
                                <button 
                                    onClick={() => setFrontImage(null)} 
                                    className="absolute top-3 right-3 size-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                    <X className="size-4" />
                                </button>
                                <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/70 backdrop-blur text-primary text-[8px] font-black uppercase tracking-widest">Front View</div>
                            </div>
                        ) : (
                            <div 
                                onClick={() => {
                                    console.log("Clicking frontInputRef");
                                    frontInputRef.current?.click();
                                }} 
                                className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-primary/30 relative bg-white/5 hover:bg-white/10 transition-all text-gray-500 group cursor-pointer"
                            >
                                <ImagePlus className="size-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Front View</span>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-primary mt-1">Required</span>
                            </div>
                        )}

                        {rearImage ? (
                            <div className="relative group aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-cadillac-black">
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${rearImage.previewUrl})` }} />
                                <button 
                                    onClick={() => setRearImage(null)} 
                                    className="absolute top-3 right-3 size-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                    <X className="size-4" />
                                </button>
                                <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/70 backdrop-blur text-white text-[8px] font-black uppercase tracking-widest">Rear/Side</div>
                            </div>
                        ) : (
                            <div 
                                onClick={() => {
                                    console.log("Clicking rearInputRef");
                                    if (rearInputRef.current) {
                                        rearInputRef.current.click();
                                    } else {
                                        console.error("rearInputRef is null");
                                    }
                                }} 
                                className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-all text-gray-500 group cursor-pointer"
                            >
                                <ImagePlus className="size-10 group-hover:text-white transition-colors mb-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Rear / Side</span>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-white/30 mt-1">Optional</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">The Talent</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Optional: Consistent human presence</p>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        {personPreview ? (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative group aspect-square rounded-2xl overflow-hidden border border-primary/20 shadow-2xl bg-cadillac-black">
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${personPreview})` }} />
                                <button 
                                    onClick={() => { setPersonFile(null); setPersonPreview(null); }} 
                                    className="absolute top-3 right-3 size-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                    <X className="size-4" />
                                </button>
                                <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-primary text-black text-[8px] font-black uppercase tracking-widest">Active Talent</div>
                            </motion.div>
                        ) : (
                            <div 
                                onClick={() => personInputRef.current?.click()} 
                                className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-all text-gray-500 group cursor-pointer"
                            >
                                <UserPlus className="size-10 group-hover:text-primary transition-colors mb-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Add Person</span>
                            </div>
                        )}
                        <div className="flex flex-col justify-center">
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
                                Upload a photo of a person to have them appear consistently in every shot of your shoot.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Dealership Logo</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Optional: Add custom branding to mockups</p>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        {logoPreview ? (
                            <div className="relative group aspect-square rounded-2xl overflow-hidden border border-primary/20 shadow-2xl bg-cadillac-black">
                                <div className="absolute inset-0 bg-contain bg-center bg-no-repeat p-4" style={{ backgroundImage: `url(${logoPreview})` }} />
                                <button 
                                    onClick={() => { setLogoFile(null); setLogoPreview(null); }} 
                                    className="absolute top-3 right-3 size-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                    <X className="size-4" />
                                </button>
                                <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-primary text-black text-[8px] font-black uppercase tracking-widest">Active Logo</div>
                            </div>
                        ) : (
                            <div 
                                onClick={() => logoInputRef.current?.click()} 
                                className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-all text-gray-500 group cursor-pointer"
                            >
                                <Crown className="size-10 group-hover:text-primary transition-colors mb-2 text-white/30" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Add Logo</span>
                            </div>
                        )}
                        <div className="flex flex-col justify-center">
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
                                Upload your dealership's logo (PNG/SVG) to display it in the header and have it rendered directly into the AI scene.
                            </p>
                        </div>
                    </div>
                </div>

                <input type="file" ref={frontInputRef} onChange={(e) => handleCarFile(e, true)} accept="image/*" className="hidden" />
                <input type="file" ref={rearInputRef} onChange={(e) => handleCarFile(e, false)} accept="image/*" className="hidden" />
                <input type="file" ref={personInputRef} onChange={handlePersonFile} accept="image/*" className="hidden" />
                <input type="file" ref={logoInputRef} onChange={handleLogoFile} accept="image/*" className="hidden" />
            </main>

            {/* Google Drive Picker removed */}

            <div className="fixed bottom-0 left-0 right-0 p-6 pb-12 bg-gradient-to-t from-background-dark via-background-dark/95 to-transparent z-40 max-w-md mx-auto">
                <LuxuryButton onClick={() => onFilesReady(frontImage!, rearImage, personFile, logoFile)} disabled={!frontImage} icon={<ArrowRight className="size-5" />}>
                    Design Environment
                </LuxuryButton>
            </div>
        </motion.div>
    );
};

const SelectSceneScreen: React.FC<{ 
    uploadedImages: ImageFile[];
    personImage: File | null;
    onGenerate: (desc: string, count: number, ratio: string, sceneBgUrl: string, imageSize: '1K' | '2K' | '4K', styleDescription: string, bgFile: File | null) => void;
    onGenerateVideo: (images: (string | File)[], prompt: string, ratio: '16:9' | '16:9') => void;
    onBack: () => void;
    conciergeSuggestedPrompt: string | null;
    clearConciergePrompt: () => void;
    logoUrl?: string | null;
}> = ({ uploadedImages, personImage, onGenerate, onGenerateVideo, onBack, conciergeSuggestedPrompt, clearConciergePrompt, logoUrl }) => {
     const [mode, setMode] = useState<'image' | 'video'>('image');
    const [scene, setScene] = useState(SCENES[0]);
    const [customDesc, setCustomDesc] = useState(SCENES[0].description);
    const [ratio, setRatio] = useState('16:9');
    const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('2K');
    const [imageCount, setImageCount] = useState(4);
    const [videoPrompt, setVideoPrompt] = useState('The car driving smoothly along a scenic highway at sunset.');
    const [selectedStyleId, setSelectedStyleId] = useState<string>(STYLE_PRESETS[0].id);
    const [customBgFile, setCustomBgFile] = useState<File | null>(null);
    // Google Drive state removed

    // Load concierge suggestions
    useEffect(() => {
        if (conciergeSuggestedPrompt) {
            setCustomDesc(conciergeSuggestedPrompt);
            setScene({ id: 'concierge', name: 'Concierge Curated', description: conciergeSuggestedPrompt });
            clearConciergePrompt();
        }
    }, [conciergeSuggestedPrompt]);
    
    const allRefs = React.useMemo(() => {
        const refs = [...uploadedImages];
        if (personImage) {
            refs.push({ id: 'person', previewUrl: URL.createObjectURL(personImage), file: personImage });
        }
        return refs;
    }, [uploadedImages, personImage]);

    const [selectedRefs, setSelectedRefs] = useState<string[]>(allRefs.length > 0 ? [allRefs[0].id] : []);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const customBgInputRef = React.useRef<HTMLInputElement>(null);
    const [customSceneBg, setCustomSceneBg] = useState<string | null>(null);

    const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setCustomSceneBg(url);
            setCustomBgFile(file);
            setScene({ id: 'custom', name: 'Custom Upload', imageUrl: url, description: 'User uploaded background' });
            setCustomDesc('A car seamlessly integrated into the uploaded environment, matching lighting and shadows.');
        }
    };

    // Auth handlers removed

    const handleAutoSuggest = async () => {
        if (!uploadedImages.length) return;
        setIsAnalyzing(true);
        try {
            const suggestion = await analyzeCarAndSuggestScene(uploadedImages[0].file);
            setCustomDesc(suggestion);
        } catch (e) {
            console.error("Analysis failed", e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const toggleRef = (id: string) => {
        setSelectedRefs(prev => {
            if (prev.includes(id)) {
                return prev.filter(i => i !== id);
            }
            if (prev.length >= 3) return prev; // Max 3 for multi-ref
            return [...prev, id];
        });
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            className="relative flex min-h-screen w-full flex-col bg-background-dark"
        >
            <Header 
                title="Creative Studio" 
                onBack={onBack} 
                logoUrl={logoUrl}
            />
            <main className="flex-1 px-6 py-8 space-y-10 overflow-y-auto pb-32">
                {/* Mode Selector */}
                <div className="flex p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5">
                    <button 
                        onClick={() => setMode('image')} 
                        className={`flex-1 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${mode === 'image' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-gray-500'}`}
                    >
                        Photography
                    </button>
                    <button 
                        onClick={() => setMode('video')} 
                        className={`flex-1 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${mode === 'video' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-gray-500'}`}
                    >
                        Cinematography
                    </button>
                </div>

                {mode === 'image' ? (
                    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-300">
                        {personImage && (
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                                <div className="size-12 rounded-full overflow-hidden border border-primary/20 bg-cadillac-black shrink-0">
                                    <img src={URL.createObjectURL(personImage)} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Talent Integration Active</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Person will be synthesized into every generated shot.</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-5">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Virtual Backgrounds</h3>
                            <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
                                <div 
                                    onClick={() => customBgInputRef.current?.click()}
                                    className={`relative shrink-0 w-36 aspect-[4/5] rounded-2xl overflow-hidden border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center hover:bg-white/10 transition-all cursor-pointer ${scene.id === 'custom' ? 'border-primary shadow-2xl shadow-primary/20' : ''}`}
                                >
                                    {customSceneBg ? (
                                        <>
                                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${customSceneBg})` }} />
                                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                                <p className="text-white text-[10px] font-black tracking-widest uppercase truncate font-sans">Custom</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <ImagePlus className="size-8 text-gray-500 mb-1" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Upload<br/>Background</span>
                                        </>
                                    )}
                                </div>
                                <input type="file" ref={customBgInputRef} className="hidden" accept="image/*" onChange={handleCustomBgUpload} />
                                {SCENES.map(s => (
                                    <button 
                                        key={s.id} 
                                        onClick={() => { setScene(s); setCustomDesc(s.description); }} 
                                        className={`relative shrink-0 w-36 aspect-[4/5] rounded-2xl overflow-hidden border-2 transition-all ${scene.id === s.id ? 'border-primary shadow-2xl shadow-primary/20' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                    >
                                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${s.imageUrl})` }} />
                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                            <p className="text-white text-[10px] font-black tracking-widest uppercase truncate">{s.name}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Aesthetic style presets selection */}
                        <div className="space-y-4 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Aesthetic Style Presets</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {STYLE_PRESETS.map(s => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setSelectedStyleId(s.id)}
                                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all text-left h-24 ${selectedStyleId === s.id ? 'bg-primary/15 border-primary text-white shadow-lg' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-wider block text-white">{s.name}</span>
                                        <span className="text-[8px] text-gray-500 font-medium leading-relaxed block mt-1.5 line-clamp-2">{s.description}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Adjustment Settings</h3>
                                <button 
                                    onClick={handleAutoSuggest} 
                                    disabled={isAnalyzing}
                                    className="text-[9px] font-bold uppercase tracking-widest text-primary flex items-center gap-1 hover:text-white transition-colors"
                                >
                                    {isAnalyzing ? <RefreshCw className="size-3 animate-spin"/> : <Sparkles className="size-3"/>}
                                    {isAnalyzing ? 'Analyzing...' : 'Auto-Suggest Scene'}
                                </button>
                            </div>
                            <textarea 
                                value={customDesc} 
                                onChange={(e) => setCustomDesc(e.target.value)} 
                                className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none h-32 resize-none transition-all placeholder:text-gray-600 font-medium"
                                placeholder="Tweak the scene lighting or details..."
                            />
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Output Quantity</h3>
                                <span className="text-primary font-black">{imageCount} Shots</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="8" 
                                value={imageCount} 
                                onChange={(e) => setImageCount(parseInt(e.target.value))} 
                                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Aspect Ratio</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {ASPECT_RATIOS.map(r => (
                                        <button 
                                            key={r.id} 
                                            onClick={() => setRatio(r.id)} 
                                            className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${ratio === r.id ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'}`}
                                        >
                                            {r.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Resolution</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {(['1K', '2K', '4K'] as const).map(size => (
                                        <button 
                                            key={size} 
                                            onClick={() => setImageSize(size)} 
                                            className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${imageSize === size ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Select Reference Assets</h3>
                                <span className="text-[10px] text-gray-600 font-bold">{selectedRefs.length}/3 Selected</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {allRefs.map(img => (
                                    <button 
                                        key={img.id} 
                                        onClick={() => toggleRef(img.id)}
                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedRefs.includes(img.id) ? 'border-primary' : 'border-transparent opacity-40'}`}
                                    >
                                        <img src={img.previewUrl} className="w-full h-full object-cover" />
                                        {selectedRefs.includes(img.id) && (
                                            <div className="absolute top-1 right-1 size-5 rounded-full bg-primary text-black flex items-center justify-center">
                                                <Check className="size-3" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Cinematic Script</h3>
                            <textarea 
                                value={videoPrompt} 
                                onChange={(e) => setVideoPrompt(e.target.value)} 
                                placeholder="Describe the action sequence (e.g. drifting through neon streets)..." 
                                className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none h-40 resize-none font-medium transition-all"
                            />
                        </div>

                        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                            <Info className="text-blue-400 size-5 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-[10px] text-blue-300 font-black uppercase tracking-widest">Multi-Asset Generation</p>
                                <p className="text-[10px] text-blue-300/60 font-medium leading-relaxed">Selecting multiple images uses standard rendering for higher consistency. Generation takes ~2 minutes.</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Google Drive Picker Modal removed */}
            
            <div className="fixed bottom-0 left-0 right-0 p-6 pb-12 bg-gradient-to-t from-background-dark via-background-dark/95 to-transparent z-40 max-w-md mx-auto">
                <LuxuryButton 
                    onClick={() => {
                        if (mode === 'image') {
                            const selectedStyle = STYLE_PRESETS.find(s => s.id === selectedStyleId) || STYLE_PRESETS[0];
                            onGenerate(
                                customDesc, 
                                imageCount, 
                                ratio, 
                                scene.imageUrl || "", 
                                imageSize, 
                                selectedStyle.description, 
                                scene.id === 'custom' ? customBgFile : null
                            );
                        } else {
                            const refs = allRefs.filter(img => selectedRefs.includes(img.id)).map(img => img.file);
                            onGenerateVideo(refs, videoPrompt, selectedRefs.length > 1 ? '16:9' : ratio as any);
                        }
                    }}
                >
                    {mode === 'image' ? `Execute ${imageCount} Shot${imageCount > 1 ? 's' : ''}` : 'Generate Cinema'}
                </LuxuryButton>
            </div>
        </motion.div>
    );
};

const GeneratingScreen: React.FC<{ mode: 'image' | 'video' }> = ({ mode }) => {
    const [msgIdx, setMsgIdx] = useState(0);
    const [progress, setProgress] = useState(0);

    const messages = mode === 'image' ? 
        ["Synthesizing Talent...", "Refining Refractions...", "Processing Textures...", "Optimizing Global Illumination..."] : 
        ["Calibrating Keyframes...", "Processing Motion Vectors...", "Enhancing Neural Detail...", "Finalizing Cinematic Export..."];
    
    useEffect(() => {
        const msgInterval = setInterval(() => setMsgIdx(p => (p + 1) % messages.length), 3000);
        return () => clearInterval(msgInterval);
    }, [messages.length]);

    useEffect(() => {
        // Mock progression up to ~99% before generation completes
        const maxTime = mode === 'image' ? 15000 : 90000; // ms
        const intervalTime = 100;
        const baseIncrement = 100 / (maxTime / intervalTime);

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                let increment = baseIncrement;
                if (prev > 95) increment *= 0.05;
                else if (prev > 85) increment *= 0.2;
                else if (prev > 70) increment *= 0.5;
                return Math.min(prev + increment, 99.9);
            });
        }, intervalTime);

        return () => clearInterval(progressInterval);
    }, [mode]);

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen bg-background-dark p-10 text-center w-full"
        >
            <div className="relative size-40 mb-12">
                <div className="absolute inset-0 rounded-full border border-white/5" />
                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin duration-[2s]" />
                <div className="absolute inset-6 rounded-full bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                    {mode === 'video' ? <Film className="size-12 animate-pulse" /> : <Sparkles className="size-12 animate-pulse" />}
                </div>
            </div>
            
            <h2 className="text-3xl font-black text-white tracking-tight mb-4 uppercase italic">Generating</h2>
            
            <div className="w-full max-w-xs mb-8 space-y-3">
                <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Progress</span>
                    <span className="text-[10px] text-primary font-black">{Math.floor(progress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-primary rounded-full relative overflow-hidden"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear", duration: 0.1 }}
                    >
                        <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_1.5s_infinite]" style={{ transform: 'translateX(-100%)' }} />
                    </motion.div>
                </div>
            </div>

            <div className="h-6 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.p 
                        key={msgIdx}
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -15, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-primary font-black uppercase tracking-[0.2em] text-[10px]"
                    >
                        {messages[msgIdx]}
                    </motion.p>
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const ResultsScreen: React.FC<{ 
    images: string[]; 
    onBack: () => void;
    onAnimate: (img: string) => void;
    onEdit: (img: string) => void;
    logoUrl?: string | null;
}> = ({ images, onBack, onAnimate, onEdit, logoUrl }) => (
    <motion.div 
        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
        className="relative flex min-h-screen w-full flex-col bg-background-dark"
    >
        <Header title="Photoshoot Results" onBack={onBack} logoUrl={logoUrl} />
        <main className="flex-1 p-6 grid grid-cols-1 gap-8 overflow-y-auto pb-32">
            {images.map((src, i) => (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                    key={i} className="group relative rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-cadillac-black"
                >
                    <img src={src} alt="Result" className="w-full object-cover" />
                    
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/20 to-transparent flex gap-2 items-center translate-y-2 group-hover:translate-y-0 transition-all flex-wrap">
                        <LuxuryButton 
                            onClick={() => onAnimate(src)} 
                            variant="primary" 
                            className="h-10 px-4 text-[10px] w-auto flex-1"
                            icon={<Film className="size-4" />}
                        >
                            Animate
                        </LuxuryButton>
                        <LuxuryButton 
                            onClick={() => onEdit(src)} 
                            variant="outline" 
                            className="h-10 px-4 text-[10px] w-auto flex-1 border border-white/20"
                            icon={<Edit className="size-4" />}
                        >
                            Edit
                        </LuxuryButton>
                        <button 
                            onClick={() => downloadFile(src, `car-photo-${i + 1}.png`)}
                            className="size-10 shrink-0 rounded-xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary hover:text-black transition-all"
                        >
                            <Download className="size-5" />
                        </button>
                    </div>
                </motion.div>
            ))}
        </main>
        <div className="fixed bottom-0 left-0 right-0 p-6 pb-12 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-40 max-w-md mx-auto flex gap-4">
            <LuxuryButton onClick={onBack} variant="outline" icon={<RefreshCw className="size-5" />}>
                New
            </LuxuryButton>
            <LuxuryButton onClick={() => onEdit("")} variant="outline" icon={<ImagePlus className="size-5" />}>
                Upload & Edit
            </LuxuryButton>
        </div>
    </motion.div>
);

const EditImageScreen: React.FC<{ 
    initialImage: string; 
    uploadedImages: ImageFile[];
    onBack: () => void;
    onEditComplete: (newImg: string) => void;
    logoUrl?: string | null;
}> = ({ initialImage, uploadedImages, onBack, onEditComplete, logoUrl }) => {
    const [baseImage, setBaseImage] = useState<string>(initialImage);
    const [prompt, setPrompt] = useState("");
    const [refImage, setRefImage] = useState<File | string | null>(null);
    const [refPreview, setRefPreview] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const baseInputRef = React.useRef<HTMLInputElement>(null);
    const refInputRef = React.useRef<HTMLInputElement>(null);

    const handleBaseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setBaseImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleRefUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setRefImage(file);
            setRefPreview(URL.createObjectURL(file));
        }
    };

    const handleEdit = async () => {
        if (!baseImage || !prompt) return;
        setIsEditing(true);
        try {
            // If refImage is a string (existing preview), we need to handle it or just use it as ref
            // Actually editImage expects File or undefined for the special ref part.
            // Let's refine editImage to handle string/File for ref.
            let refFile: File | undefined = undefined;
            if (refImage instanceof File) {
                refFile = refImage;
            } else if (typeof refImage === 'string') {
                // If it's a string, it's one of our existing uploaded images. 
                // We should find the File in uploadedImages
                const found = uploadedImages.find(img => img.previewUrl === refImage);
                if (found) refFile = found.file;
            }

            const result = await editImage(baseImage, prompt, refFile);
            onEditComplete(result);
        } catch (e) {
            console.error(e);
            alert("Editing failed. Please try a different prompt.");
        } finally {
            setIsEditing(false);
        }
    };

    if (isEditing) return <GeneratingScreen mode="image" />;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative flex min-h-screen w-full flex-col bg-background-dark"
        >
            <Header title="AI Post-Production" onBack={onBack} logoUrl={logoUrl} />
            <main className="flex-1 p-6 space-y-8 overflow-y-auto pb-40">
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Base Image</h3>
                    {baseImage ? (
                        <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 group bg-cadillac-black">
                            <img src={baseImage} className="w-full h-full object-cover" />
                            <button 
                                onClick={() => baseInputRef.current?.click()}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white"
                            >
                                <RefreshCw className="size-8 mb-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Replace Base</span>
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => baseInputRef.current?.click()}
                            className="w-full aspect-video rounded-3xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center group hover:bg-white/10 transition-all"
                        >
                            <ImagePlus className="size-12 text-gray-600 group-hover:text-primary transition-colors" />
                            <span className="text-xs font-black uppercase tracking-widest mt-4 text-gray-500">Upload Base Image</span>
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Edit Instructions</h3>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. 'Add a chrome finish to the wheels' or 'Change the car color to Pearl White'..."
                        className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none h-32 resize-none font-medium transition-all"
                    />
                </div>

                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Style Reference (Optional)</h3>
                    <div className="flex gap-4 items-start">
                        {refPreview ? (
                            <div className="relative size-32 rounded-2xl overflow-hidden border-2 border-primary bg-cadillac-black shrink-0">
                                <img src={refPreview} className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => { setRefImage(null); setRefPreview(null); }}
                                    className="absolute top-2 right-2 size-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                    <X className="size-3" />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => refInputRef.current?.click()}
                                className="size-32 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center group hover:bg-white/10 transition-all shrink-0"
                            >
                                <ImagePlus className="size-6 text-gray-600 group-hover:text-primary transition-colors" />
                                <span className="text-[8px] font-black uppercase tracking-widest mt-2 text-gray-500">Upload Ref</span>
                            </button>
                        )}

                        <div className="flex-1 space-y-3">
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
                                Quick Pick from Project:
                            </p>
                            <div className="flex gap-2 flex-wrap">
                                {uploadedImages.map(img => (
                                    <button 
                                        key={img.id}
                                        onClick={() => { setRefImage(img.previewUrl); setRefPreview(img.previewUrl); }}
                                        className={`size-12 rounded-lg overflow-hidden border-2 transition-all ${refPreview === img.previewUrl ? 'border-primary scale-110' : 'border-transparent opacity-60 hover:opacity-100 scale-100'}`}
                                    >
                                        <img src={img.previewUrl} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <input type="file" ref={baseInputRef} onChange={handleBaseUpload} accept="image/*" className="hidden" />
                <input type="file" ref={refInputRef} onChange={handleRefUpload} accept="image/*" className="hidden" />
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-6 pb-12 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-40 max-w-md mx-auto">
                <LuxuryButton 
                    onClick={handleEdit} 
                    disabled={!baseImage || !prompt || isEditing} 
                    icon={<Sparkles className="size-5" />}
                >
                    Apply AI Enhancement
                </LuxuryButton>
            </div>
        </motion.div>
    );
};

const VideoResultsScreen: React.FC<{ videoSrc: string; onBack: () => void; logoUrl?: string | null }> = ({ videoSrc, onBack, logoUrl }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative flex min-h-screen w-full flex-col bg-background-dark"
    >
        <Header title="Cinema View" onBack={onBack} logoUrl={logoUrl} />
        <main className="flex-1 p-6 flex flex-col items-center justify-center">
            <div className="w-full aspect-[16/9] max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black animate-in zoom-in duration-700">
                <video src={videoSrc} autoPlay loop controls className="w-full h-full object-cover" />
            </div>
            
            <div className="flex gap-3 mt-6 items-center w-full max-w-sm justify-center">
                <LuxuryButton 
                    onClick={() => downloadFile(videoSrc, `car-cinema.mp4`)}
                    variant="ghost" 
                    className="h-12 w-auto flex-1 px-6 border border-white/5"
                    icon={<Download className="size-5" />}
                >
                    Download Video
                </LuxuryButton>
            </div>
        </main>
        <div className="p-6 pb-12">
            <LuxuryButton onClick={onBack} variant="primary" icon={<Home className="size-5" />}>
                Return to Showroom
            </LuxuryButton>
        </div>
    </motion.div>
);

// --- Concierge Assistant Component ---
interface ConciergeMessage {
    role: 'user' | 'model';
    text: string;
}

const ConciergeAssistantScreen: React.FC<{
    onBack: () => void;
    onApplySuggestion: (suggestion: string) => void;
}> = ({ onBack, onApplySuggestion }) => {
    const [messages, setMessages] = useState<ConciergeMessage[]>([
        { role: 'model', text: "Welcome back, distinguished guest. I am your Cadillac Digital Concierge. Tell me, what kind of atmosphere do you envision for your vehicle's photoshoot today? A high-tech Tokyo neon street at midnight? A minimalist concrete architectural showroom? Tell me your vision, and I will craft the perfect virtual environment." }
    ]);
    const [inputText, setInputText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceActive, setVoiceActive] = useState(true);
    const chatEndRef = React.useRef<HTMLDivElement>(null);

    // Browser Speech Recognition Setup
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        const SpeechReg = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechReg) {
            const rec = new SpeechReg();
            rec.continuous = false;
            rec.interimResults = false;
            rec.lang = 'en-US';

            rec.onstart = () => setIsListening(true);
            rec.onend = () => setIsListening(false);
            rec.onerror = () => setIsListening(false);
            rec.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                if (text) {
                    setInputText(text);
                }
            };
            setRecognition(rec);
        }
    }, []);

    const toggleListening = () => {
        if (!recognition) {
            alert("Speech recognition is not supported in this browser version. Feel free to type your vision!");
            return;
        }
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    // Auto scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isGenerating]);

    // Parse prompt bracket helper
    const extractPrompt = (text: string) => {
        const match = text.match(/\[PROMPT\]([\s\S]*?)\[\/PROMPT\]/);
        return match ? match[1].trim() : null;
    };

    const cleanText = (text: string) => {
        return text.replace(/\[PROMPT\][\s\S]*?\[\/PROMPT\]/g, '').trim();
    };

    // Text to Speech
    const speakText = (text: string) => {
        if (!voiceActive) return;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(cleanText(text));
            utterance.rate = 1.05;
            utterance.pitch = 0.95;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            
            // Try choosing a high-quality luxury voice if available
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha") || v.lang === "en-US");
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSendMessage = async () => {
        const query = inputText.trim();
        if (!query) return;

        setInputText("");
        const newMsgList: ConciergeMessage[] = [...messages, { role: 'user', text: query }];
        setMessages(newMsgList);
        setIsGenerating(true);

        try {
            // Drop bracket prompts from past items to keep assistant history pristine and focus only on conversation context
            const sanitizedHistory = messages.map(m => ({
                role: m.role,
                text: cleanText(m.text)
            }));

            const responseText = await chatWithConcierge(sanitizedHistory, query);
            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
            speakText(responseText);
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'model', text: "Forgive me, my connection to the styling database is slightly interrupted. Could you restate that style instruction?" }]);
        } finally {
            setIsGenerating(false);
        }
    };

    // Auto speak initial message one-time
    useEffect(() => {
        const timer = setTimeout(() => {
            speakText(messages[0].text);
        }, 800);
        return () => {
            clearTimeout(timer);
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col h-screen bg-background-dark select-none"
        >
            <header className="flex items-center p-6 justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl z-20">
                <button onClick={onBack} className="text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/5 transition-colors">
                    <ArrowLeft className="size-6" />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-white text-xs font-black tracking-[0.2em] uppercase">Concierge AI</h1>
                    <span className="text-[8px] text-primary font-bold tracking-widest uppercase mt-0.5">Cadillac Virtual Stylist</span>
                </div>
                <button 
                    onClick={() => {
                        setVoiceActive(!voiceActive);
                        if (voiceActive) window.speechSynthesis.cancel();
                    }}
                    className={`size-10 border rounded-full flex items-center justify-center transition-all ${voiceActive ? 'border-primary text-primary bg-primary/5' : 'border-white/10 text-gray-500'}`}
                >
                    <Volume2 className="size-5" />
                </button>
            </header>

            {/* Pulsing Center Sphere visualizer while assistant speaks/listens */}
            <div className="relative h-44 shrink-0 bg-gradient-to-b from-black/20 to-transparent flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-primary/5 to-transparent pointer-events-none" />
                <motion.div 
                    animate={{ 
                        scale: isSpeaking ? [1, 1.15, 1] : isListening ? [1, 1.25, 1] : 1,
                        boxShadow: isSpeaking 
                            ? ["0 0 20px rgba(245,197,66,0.1)", "0 0 50px rgba(245,197,66,0.25)", "0 0 20px rgba(245,197,66,0.1)"]
                            : isListening 
                            ? ["0 0 20px rgba(239,68,68,0.15)", "0 0 60px rgba(239,68,68,0.3)", "0 0 20px rgba(239,68,68,0.15)"]
                            : "0 0 20px rgba(245,197,66,0.02)"
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`size-24 rounded-full border flex items-center justify-center overflow-hidden transition-all duration-500 ${isListening ? 'border-red-500/30 bg-red-500/5' : 'border-primary/20 bg-primary/5'}`}
                >
                    <AnimatePresence mode="wait">
                        {isListening ? (
                            <motion.div key="listening" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex flex-col items-center text-red-500">
                                <Mic className="size-8 animate-pulse" />
                                <span className="text-[7px] uppercase font-black tracking-widest mt-1">Listening</span>
                            </motion.div>
                        ) : isSpeaking ? (
                            <motion.div key="speaking" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex flex-col items-center text-primary">
                                <Sparkles className="size-8 animate-spin-slow" />
                                <span className="text-[7px] uppercase font-black tracking-widest mt-1">Speaking</span>
                            </motion.div>
                        ) : (
                            <motion.div key="idle" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex flex-col items-center text-gray-500">
                                <Crown className="size-8 text-primary/40" />
                                <span className="text-[7px] uppercase font-black tracking-widest mt-1">Concierge</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Chat list */}
            <main className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin">
                {messages.map((m, i) => {
                    const extracted = extractPrompt(m.text);
                    const parsedText = cleanText(m.text);
                    const isModel = m.role === 'model';
                    
                    return (
                        <div key={i} className={`flex flex-col ${isModel ? 'items-start' : 'items-end'} space-y-2`}>
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }}
                                className={`max-w-[85%] rounded-2xl px-5 py-4 leading-relaxed text-sm shadow-xl ${isModel ? 'bg-white/5 border border-white/5 text-white' : 'bg-primary text-black font-semibold'}`}
                            >
                                {parsedText}
                            </motion.div>

                            {extracted && (
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3 w-[85%] mt-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="size-4 text-primary shrink-0 animate-pulse" />
                                        <span className="text-[10px] uppercase font-black tracking-wider text-primary">Curated Environment Design</span>
                                    </div>
                                    <p className="text-xs text-gray-300 italic font-medium leading-relaxed">
                                        "{extracted}"
                                    </p>
                                    <LuxuryButton 
                                        onClick={() => onApplySuggestion(extracted)}
                                        variant="primary" 
                                        className="h-10 text-[10px] rounded-lg tracking-widest"
                                    >
                                        Inject Environment into Setup
                                    </LuxuryButton>
                                </motion.div>
                            )}
                        </div>
                    );
                })}
                {isGenerating && (
                    <div className="flex items-center gap-2 text-gray-600 font-bold text-xs uppercase tracking-widest p-4">
                        <RefreshCw className="size-3.5 animate-spin text-primary" />
                        Stylist reasoning...
                    </div>
                )}
                <div ref={chatEndRef} />
            </main>

            {/* Quick Inspiration Options */}
            <div className="px-6 py-3 shrink-0 border-t border-white/5 bg-black/10 flex gap-2.5 overflow-x-auto no-scrollbar">
                {[
                    { label: "Tokyo Midnight", prompt: "Explain a concept for a Tokyo neon street photo shoot at midnight, dark moody vibe." },
                    { label: "Malibu Beachfront", prompt: "I would love a beachfront shoot in Malibu at golden hour sunset." },
                    { label: "Concrete Studio", prompt: "Let's do a brutalist concrete showroom with dramatic contrast." }
                ].map((item, idx) => (
                    <button 
                        key={idx}
                        onClick={() => { setInputText(item.prompt); }}
                        className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[9px] font-black tracking-widest text-white/70 uppercase hover:bg-white/10 hover:border-white/20 hover:text-white transition-all"
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Footer Input */}
            <footer className="p-6 shrink-0 border-t border-white/5 bg-black/40 backdrop-blur-md pb-12 flex gap-3 items-center">
                <button 
                    onClick={toggleListening}
                    className={`size-14 rounded-full border flex items-center justify-center transition-all ${isListening ? 'border-red-500 bg-red-500/10 text-red-500 shadow-lg shadow-red-500/10' : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                >
                    <Mic className="size-6" />
                </button>
                <div className="flex-1 flex gap-2 bg-white/5 border border-white/5 rounded-full items-center px-4 h-14">
                    <input 
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendMessage();
                        }}
                        placeholder="Talk or type your visual vision..."
                        className="bg-transparent border-none text-white outline-none flex-1 text-sm font-medium placeholder:text-gray-600"
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!inputText.trim() || isGenerating}
                        className="size-10 rounded-full bg-primary text-black disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0"
                    >
                        <Send className="size-4" />
                    </button>
                </div>
            </footer>
        </motion.div>
    );
};

// --- Main App Component ---

const App: React.FC = () => {
    const [page, setPage] = useState<Page>(Page.Welcome);
    const [uploadedImages, setUploadedImages] = useState<{ front: ImageFile | null, rear: ImageFile | null }>({ front: null, rear: null });
    const [personImage, setPersonImage] = useState<File | null>(null);
    const [dealershipLogo, setDealershipLogo] = useState<File | null>(null);
    const [dealershipLogoPreview, setDealershipLogoPreview] = useState<string | null>(null);
    const [genImages, setGenImages] = useState<string[]>([]);
    const [genVideo, setGenVideo] = useState<string | null>(null);
    const [editingImage, setEditingImage] = useState<string>("");
    const [conciergeSuggestedPrompt, setConciergeSuggestedPrompt] = useState<string | null>(null);

    const handleGenerateImages = async (
        desc: string, 
        count: number, 
        ratio: string, 
        sceneBgUrl: string, 
        imageSize: '1K'|'2K'|'4K', 
        styleDescription: string, 
        bgFile: File | null
    ) => {
        setPage(Page.Generating);
        try {
            const requestedAngles = ALL_ANGLES_FOR_GENERATION.slice(0, Math.min(count, ALL_ANGLES_FOR_GENERATION.length));
            const imageRefs = [uploadedImages.front, uploadedImages.rear].filter(Boolean) as ImageFile[];

            const results: string[] = [];
            for (const angle of requestedAngles) {
                const result = await generateImage(imageRefs, desc, angle.name, !!personImage, personImage, ratio, styleDescription, bgFile, imageSize, dealershipLogo);
                results.push(result);
            }
            
            setGenImages(results);
            setPage(Page.Results);
        } catch (e) {
            console.error(e);
            alert("Luxury processing encountered an issue.");
            setPage(Page.SelectScene);
        }
    };

    const handleGenerateVideo = async (references: (string | File | null)[], prompt: string, ratio: '16:9' | '9:16') => {
        if (typeof window !== 'undefined' && (window as any).aistudio) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await (window as any).aistudio.openSelectKey();
            }
        }
        
        setPage(Page.GeneratingVideo);
        try {
            // Filter out nulls
            const validRefs = references.filter(r => r !== null) as (string | File)[];
            const videoUrl = await generateVideo(validRefs, prompt, ratio);
            setGenVideo(videoUrl);
            setPage(Page.VideoResults);
        } catch (error: any) {
            if (error.message === 'API_KEY_NOT_FOUND') {
                alert("Please select a valid paid API key for video generation.");
                if (typeof window !== 'undefined' && (window as any).aistudio) {
                    await (window as any).aistudio.openSelectKey();
                }
            } else {
                console.error(error);
                alert("Cinematic generation failed.");
            }
            setPage(Page.SelectScene);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-background-dark min-h-screen shadow-2xl relative overflow-x-hidden">
            <AnimatePresence mode="wait">
                {page === Page.Welcome && <WelcomeScreen key="welcome" onGetStarted={() => setPage(Page.Upload)} onStartLive={() => setPage(Page.LiveAssistant)} logoUrl={dealershipLogoPreview} />}
                {page === Page.Upload && (
                    <UploadScreen 
                        key="upload"
                        logoUrl={dealershipLogoPreview}
                        onFilesReady={(front, rear, person, logo) => { 
                            setUploadedImages({ front, rear }); 
                            setPersonImage(person);
                            if (logo) {
                                setDealershipLogo(logo);
                                setDealershipLogoPreview(URL.createObjectURL(logo));
                            } else {
                                setDealershipLogo(null);
                                setDealershipLogoPreview(null);
                            }
                            setPage(Page.SelectScene); 
                        }} 
                        onBack={() => setPage(Page.Welcome)} 
                    />
                )}
                {page === Page.SelectScene && (
                    <SelectSceneScreen 
                        key="select"
                        uploadedImages={[uploadedImages.front, uploadedImages.rear].filter(Boolean) as ImageFile[]} 
                        personImage={personImage}
                        onGenerate={handleGenerateImages} 
                        onGenerateVideo={handleGenerateVideo} 
                        onBack={() => setPage(Page.Upload)} 
                        conciergeSuggestedPrompt={conciergeSuggestedPrompt}
                        clearConciergePrompt={() => setConciergeSuggestedPrompt(null)}
                        logoUrl={dealershipLogoPreview}
                    />
                )}
                {page === Page.Generating && <GeneratingScreen key="gen-img" mode="image" />}
                {page === Page.GeneratingVideo && <GeneratingScreen key="gen-vid" mode="video" />}
                {page === Page.Results && (
                    <ResultsScreen 
                        key="res-img" 
                        images={genImages} 
                        onBack={() => setPage(Page.Welcome)} 
                        onAnimate={(img) => handleGenerateVideo([img], "Cinematic panning shot of the car as lights play across its sleek body, slow motion.", "9:16")} 
                        onEdit={(img) => { setEditingImage(img); setPage(Page.Edit); }}
                        logoUrl={dealershipLogoPreview}
                    />
                )}
                {page === Page.Edit && (
                    <EditImageScreen 
                        key="edit"
                        initialImage={editingImage}
                        uploadedImages={[uploadedImages.front, uploadedImages.rear].filter(Boolean) as ImageFile[]}
                        onBack={() => setPage(Page.Results)}
                        onEditComplete={(newImg) => {
                            setGenImages(prev => [newImg, ...prev]);
                            setPage(Page.Results);
                        }}
                        logoUrl={dealershipLogoPreview}
                    />
                )}
                {page === Page.VideoResults && <VideoResultsScreen key="res-vid" videoSrc={genVideo!} onBack={() => setPage(Page.Welcome)} logoUrl={dealershipLogoPreview} />}
                
                {page === Page.LiveAssistant && (
                    <ConciergeAssistantScreen 
                        key="live"
                        onBack={() => setPage(Page.Welcome)}
                        onApplySuggestion={(suggestion) => {
                            setConciergeSuggestedPrompt(suggestion);
                            if (uploadedImages.front) {
                                setPage(Page.SelectScene);
                            } else {
                                setPage(Page.Upload);
                            }
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default App;
