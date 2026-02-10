import React, { useState } from "react";
import axios from "axios";
import { Navbar } from "./components/Navbar";
import { UploadZone } from "./components/UploadZone";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { ResourcesPage } from "./components/ResourcesPage";
import { AlertCircle, AlertTriangle } from "lucide-react";

// Types
type RiskIndicator = {
  code: string;
  label: string;
};

type HeatmapExplanation = {
  width: number;
  height: number;
  values: number[];
};

type EmbryoAnalysisResponse = {
  embryo_id: string;
  quality_score: number;
  implantation_success_probability: number;
  risk_indicators: RiskIndicator[];
  explanation_heatmap: HeatmapExplanation;
  notes?: string;
  fileUrl?: string; // Client-side addition
};

const API_BASE = "http://localhost:8000";

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<'dashboard' | 'resources'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<EmbryoAnalysisResponse[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setError(null);
    setLoading(true);
    setResults([]);

    try {
      const formData = new FormData();
      const fileUrls: string[] = [];

      Array.from(files).forEach((file) => {
        formData.append("files", file);
        fileUrls.push(URL.createObjectURL(file));
      });

      // Optional metadata (hardcoded for demo, could be expanding form later)
      formData.append("maternal_age", "30");
      formData.append("fertilization_method", "ICSI");

      const response = await axios.post<EmbryoAnalysisResponse[]>(
        `${API_BASE}/api/v1/analyze`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Attach local file URLs to results for visualization
      const mergedResults = response.data.map((res, index) => ({
        ...res,
        fileUrl: fileUrls[index] || ""
      }));

      setResults(mergedResults);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ??
        "Failed to analyze embryos. Ensure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 selection:bg-primary-500/30 flex flex-col">
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-sm text-amber-200/90 font-medium animate-in slide-in-from-top duration-500">
        <span className="flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Disclaimer: This tool is for Research Use Only. Not approved for clinical diagnosis.
        </span>
      </div>

      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">

        {activePage === 'resources' ? (
          <ResourcesPage />
        ) : (
          <>
            {/* Hero / Upload Section */}
            {results.length === 0 && (
              <div className="max-w-3xl mx-auto text-center space-y-12">
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                    Precision Embryo Selection <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                      Powered by AI
                    </span>
                  </h1>
                  <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                    Upload Blastocyst images to get instant, objective Gardner grading and implantation predictions.
                  </p>
                </div>

                <UploadZone
                  onFileSelect={handleFileSelect}
                  isDragging={isDragging}
                  setIsDragging={setIsDragging}
                  loading={loading}
                />

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center justify-center gap-2 text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}

            {/* Results Section */}
            {results.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">Analysis Report</h2>
                  <button
                    onClick={() => setResults([])}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Analyze New Batch
                  </button>
                </div>

                <ResultsDashboard results={results} />
              </div>
            )}
          </>
        )}

      </main>

      <footer className="border-t border-dark-700 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p className="mb-2">© 2026 EMBRYO-XAI Research Project.</p>
          <p className="max-w-2xl mx-auto">
            All analysis is computer-generated based on morphological feature extraction (Transfer Learning on ResNet50).
            Results correlate with standard Gardner scoring but do not replace human expert assessment.
          </p>
        </div>
      </footer>
    </div>
  );
};
