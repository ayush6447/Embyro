import React, { useRef } from 'react';
import { Upload, FileUp, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface UploadZoneProps {
    onFileSelect: (files: FileList) => void;
    isDragging: boolean;
    setIsDragging: (v: boolean) => void;
    loading: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, isDragging, setIsDragging, loading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(e.dataTransfer.files);
        }
    };

    return (
        <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={clsx(
                "relative group cursor-pointer border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ease-in-out",
                "flex flex-col items-center justify-center text-center",
                isDragging
                    ? "border-primary-500 bg-primary-500/5 scale-[1.02]"
                    : "border-dark-700 bg-dark-800/50 hover:border-dark-600 hover:bg-dark-800",
                loading && "opacity-50 pointer-events-none"
            )}
        >
            <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => e.target.files && onFileSelect(e.target.files)}
            />

            <div className={clsx(
                "p-4 rounded-full mb-4 transition-colors",
                isDragging ? "bg-primary-500/20 text-primary-400" : "bg-dark-700 text-slate-400 group-hover:bg-dark-600 group-hover:text-primary-400"
            )}>
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
            </div>

            <h3 className="text-lg font-medium text-white mb-2">
                {loading ? "Analyzing Embryos..." : "Upload Embryo Images"}
            </h3>
            <p className="text-sm text-slate-400 max-w-xs">
                Drag and drop your Day 5 Blastocyst images here, or click to browse.
            </p>
        </div>
    );
};
