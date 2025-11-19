import React, { ErrorInfo, ReactNode } from "react";
import { Bug } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cyber-black flex items-center justify-center p-4 relative overflow-hidden">
           <div className="scanlines fixed inset-0 pointer-events-none z-50 opacity-30"></div>
           <div className="max-w-md w-full bg-black border border-neon-red p-8 shadow-[0_0_40px_rgba(255,42,42,0.3)] relative z-10">
             <div className="text-neon-red flex justify-center mb-4">
               <Bug size={64} />
             </div>
             <h1 className="text-2xl font-display font-bold text-white uppercase tracking-widest mb-2 text-center">System Malfunction</h1>
             <p className="text-gray-400 font-mono text-sm mb-6 text-center">
               A critical runtime error has occurred. The interface has been suspended to protect data integrity.
             </p>
             
             <div className="bg-red-900/20 p-4 border border-red-900/50 mb-6 overflow-auto max-h-32">
               <code className="text-xs text-neon-red font-mono block whitespace-pre-wrap">
                 {this.state.error?.toString()}
               </code>
             </div>

             <button 
               onClick={() => window.location.reload()}
               className="w-full bg-neon-red text-black font-display font-bold uppercase py-3 hover:bg-white transition-colors skew-x-[-10deg] group relative overflow-hidden"
             >
               <span className="block skew-x-[10deg] relative z-10 font-bold">Reboot System</span>
             </button>
           </div>
        </div>
      );
    }

    return this.props.children;
  }
}