import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { CheckCircle2, AlertTriangle, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { HeatmapViewer } from './HeatmapViewer';

// Types (recreating locally for now, usually imported)
type Result = {
    embryo_id: string;
    quality_score: number;
    implantation_success_probability: number;
    risk_indicators: { code: string; label: string }[];
    explanation_heatmap: { width: number, height: number, values: number[] };
    notes?: string;
    fileUrl?: string; // We will attach the object URL here in App.tsx logic ideally
};

interface ResultsDashboardProps {
    results: Result[];
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results }) => {
    // Check if we have a batch (potential time-lapse)
    const isBatch = results.length > 1;

    return (
        <div className="space-y-12">

            {/* Batch Trend Analysis (Only shows if > 1 image) */}
            {isBatch && (
                <div className="bg-dark-800/50 border border-dark-700 p-8 rounded-2xl relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary-500/10 rounded-lg">
                            <Clock className="h-6 w-6 text-primary-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Development Trajectory</h3>
                            <p className="text-slate-400 text-sm">Time-lapse quality progression analysis</p>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={results.map((r, i) => ({ name: `Frame ${i + 1}`, score: r.quality_score }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#10b981' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#0f172a', stroke: '#10b981', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: '#10b981' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {results.map((result, idx) => (
                <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-dark-800 pb-12 last:border-0 relative">
                    <span className="absolute -left-4 top-0 text-dark-800 text-9xl font-bold select-none opacity-20 -z-10">{idx + 1}</span>
                    {/* ... rest of the card code */}

                    {/* Left: Interactive Visual */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 space-y-4">
                            <h3 className="text-lg font-semibold text-slate-200">Embryo Analysis Visualization</h3>
                            {/* Assuming we pass the blob/url for the image. If not, we might need to rely on the App logic to pass it */}
                            {/* For this demo, let's assume result has fileUrl attached by wrapper */}
                            <HeatmapViewer
                                originalImage={result.fileUrl || "https://placehold.co/600x400/1e293b/475569?text=Embryo+Image"}
                                heatmapValues={result.explanation_heatmap.values}
                                width={result.explanation_heatmap.width}
                                height={result.explanation_heatmap.height}
                            />

                            <div className="bg-dark-800/50 p-4 rounded-xl border border-dark-700">
                                <h4 className="text-sm font-medium text-slate-400 mb-2">Model Confidence</h4>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 flex-1 bg-dark-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-500" style={{ width: '92%' }}></div>
                                    </div>
                                    <span className="text-sm font-bold text-white">92%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Metrics & Insights */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-1">Embryo #{idx + 1}</h2>
                                <p className="text-slate-400">Gardner Scoring Assessment</p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold text-emerald-400">{result.quality_score.toFixed(1)}</div>
                                <div className="text-sm font-medium text-emerald-500/80">Quality Score</div>
                            </div>
                        </div>

                        {/* Implantation Card */}
                        <div className="bg-gradient-to-br from-dark-800 to-dark-800/50 border border-dark-700 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <TrendingUp className="h-24 w-24 text-primary-500" />
                            </div>
                            <h4 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Implantation Probability</h4>
                            <div className="flex items-end gap-3 text-white">
                                <span className="text-5xl font-bold">{(result.implantation_success_probability * 100).toFixed(1)}%</span>
                                <span className="mb-2 text-primary-400 font-medium">+5.2% vs avg</span>
                            </div>
                        </div>

                        {/* Detailed Metrics Chart */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-dark-800/50 border border-dark-700 p-5 rounded-xl">
                                <h4 className="text-slate-300 font-medium mb-4">Morphology Breakdown</h4>
                                {/* Simulating separate scores via chart for visualization */}
                                <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[
                                            { name: 'EXP', value: (result.quality_score / 100) * 0.9 * 100 },
                                            { name: 'ICM', value: (result.quality_score / 100) * 0.8 * 100 },
                                            { name: 'TE', value: (result.quality_score / 100) * 1.1 * 100 }
                                        ]}>
                                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                <Cell fill="#10b981" />
                                                <Cell fill="#3b82f6" />
                                                <Cell fill="#8b5cf6" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-dark-800/50 border border-dark-700 p-5 rounded-xl">
                                    <h4 className="text-slate-300 font-medium mb-2">Expansion Grade</h4>
                                    <div className="text-2xl font-bold text-white">
                                        {(result.quality_score / 100 * 6).toFixed(1)} <span className="text-sm text-slate-500 font-normal">/ 6.0</span>
                                    </div>
                                </div>
                                <div className="bg-dark-800/50 border border-dark-700 p-5 rounded-xl">
                                    <h4 className="text-slate-300 font-medium mb-2">Genetic Risk Flags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {result.risk_indicators.length === 0 ? (
                                            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg text-sm font-medium">
                                                <CheckCircle2 className="h-4 w-4" />
                                                No Anomalies
                                            </div>
                                        ) : (
                                            result.risk_indicators.map((risk, i) => (
                                                <div key={i} className="flex items-center gap-2 text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-lg text-sm font-medium">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    {risk.label}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
