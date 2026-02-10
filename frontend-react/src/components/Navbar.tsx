import React from 'react';
import { Microscope, Activity, FileText, LayoutDashboard } from 'lucide-react';
import { clsx } from 'clsx';

interface NavbarProps {
    activePage: 'dashboard' | 'resources';
    setActivePage: (page: 'dashboard' | 'resources') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage }) => {
    return (
        <nav className="w-full border-b border-dark-700 bg-dark-900/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => setActivePage('dashboard')}
                    >
                        <div className="bg-primary-500/10 p-2 rounded-lg group-hover:bg-primary-500/20 transition-colors">
                            <Microscope className="h-6 w-6 text-primary-500" />
                        </div>
                        <div>
                            <span className="text-xl font-bold tracking-tight text-white">EMBRYO-XAI</span>
                            <span className="ml-2 text-xs font-medium text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full">BETA</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-1 bg-dark-800/50 p-1 rounded-lg border border-dark-700">
                        <button
                            onClick={() => setActivePage('dashboard')}
                            className={clsx(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                activePage === 'dashboard' ? "bg-dark-700 text-white shadow-sm" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActivePage('resources')}
                            className={clsx(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                activePage === 'resources' ? "bg-dark-700 text-white shadow-sm" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <FileText className="h-4 w-4" />
                            Resources
                        </button>
                    </div>

                    {/* Status */}
                    <div className="hidden md:flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            <span>Model Status: <span className="text-emerald-400">Online</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};
