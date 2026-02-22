import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  isAnalyzing: boolean;
}

export function ImageUploader({ onImageSelected, isAnalyzing }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageSelected(result);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    disabled: isAnalyzing
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            {...getRootProps()}
            className={cn(
              "relative group cursor-pointer overflow-hidden rounded-3xl border-3 border-dashed border-border bg-background p-12 text-center transition-all duration-300 hover:border-primary/50 hover:bg-primary/5",
              isDragActive && "border-primary bg-primary/10 scale-[1.02]",
              isAnalyzing && "pointer-events-none opacity-50"
            )}
          >
            <input {...getInputProps()} />
            <div className="relative z-10 flex flex-col items-center justify-center gap-4">
              <div className="rounded-full bg-primary/10 p-4 ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-300">
                <UploadCloud className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {isDragActive ? "Drop it here!" : "Upload Product Image"}
                </h3>
                <p className="mt-2 text-muted-foreground text-sm max-w-xs mx-auto">
                  Drag & drop or click to select a photo of the product you want to verify.
                </p>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl border bg-card shadow-2xl ring-1 ring-black/5"
          >
            <div className="aspect-video w-full bg-black/5 relative">
              <img 
                src={preview} 
                alt="Preview" 
                className="h-full w-full object-contain mx-auto" 
              />
              
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    <div className="bg-background rounded-full p-4 shadow-xl border border-border relative z-10">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-foreground animate-pulse">Analyzing Product...</h3>
                  <p className="text-muted-foreground mt-2">Checking against database & market prices</p>
                </div>
              )}
            </div>
            
            {!isAnalyzing && (
              <div className="absolute top-4 right-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(null);
                  }}
                  className="bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md transition-colors"
                >
                  Change Image
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
