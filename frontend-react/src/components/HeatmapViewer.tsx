import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';

interface HeatmapViewerProps {
    originalImage: string; // Base64 or URL
    heatmapValues: number[];
    width: number;
    height: number;
}

export const HeatmapViewer: React.FC<HeatmapViewerProps> = ({ originalImage, heatmapValues, width, height }) => {
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [opacity, setOpacity] = useState(0.6);

    // Generate heatmap CSS gradient or canvas
    // For simplicity/performance in this demo, let's render a canvas overlaid
    // But strictly based on the provided "values" array from backend

    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imgData = ctx.createImageData(width, height);
        // Fill
        for (let i = 0; i < heatmapValues.length; i++) {
            const val = heatmapValues[i];
            // Jet-like colormap (Simplified)
            // val 0 -> Blue, 0.5 -> Green, 1 -> Red
            const r = Math.min(255, Math.max(0, 1.5 - Math.abs(1 - 4 * (val - 0.5))) * 255);
            const g = Math.min(255, Math.max(0, 1.5 - Math.abs(1 - 4 * (val - 0.25))) * 255);
            const b = Math.min(255, Math.max(0, 1.5 - Math.abs(1 - 4 * val)) * 255);

            // Alpha based on value (thresholding low values for visibility)
            const a = val < 0.2 ? 0 : 255;

            imgData.data[i * 4 + 0] = r; // R
            imgData.data[i * 4 + 1] = g; // G
            imgData.data[i * 4 + 2] = b; // B
            imgData.data[i * 4 + 3] = a; // A
        }
        ctx.putImageData(imgData, 0, 0);

    }, [heatmapValues, width, height]);


    return (
        <div className="relative group rounded-xl overflow-hidden border border-dark-700 bg-black aspect-square">
            {/* Original Image */}
            <img
                src={originalImage}
                alt="Embryo"
                className="w-full h-full object-contain"
            />

            {/* Heatmap Overlay */}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className={clsx(
                    "absolute inset-0 w-full h-full object-contain transition-opacity duration-300 pointer-events-none",
                    !showHeatmap && "opacity-0"
                )}
                style={{ opacity: showHeatmap ? opacity : 0, imageRendering: 'pixelated' }}
            />

            {/* Controls */}
            <div className="absolute bottom-4 left-4 right-4 bg-dark-900/80 backdrop-blur-md p-3 rounded-lg border border-dark-700 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className="p-2 hover:bg-dark-700 rounded-md text-slate-300 transition-colors"
                    title="Toggle Heatmap"
                >
                    {showHeatmap ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>

                <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Opacity</span>
                        <span>{Math.round(opacity * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={opacity}
                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        className="w-full h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                </div>

                <div className="text-xs font-semibold text-primary-400 px-2 py-1 bg-primary-500/10 rounded">
                    Grad-CAM
                </div>
            </div>
        </div>
    );
};
