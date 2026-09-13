import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 sm:mt-12 border-t border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                NTRO · Problem Statement 26163
              </div>
              <div className="text-[11px] text-slate-500">
                Smart India Hackathon 2026 · Security Assessment Suite
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <a
              href="https://github.com/yuvaadhika"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-600 flex items-center gap-1.5 transition-colors font-medium"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>yuvaadhika</span>
            </a>

            <span>•</span>

            <a
              href="https://vercel.com/yuvaadhika"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-700 flex items-center gap-1 transition-colors font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Vercel Deploy</span>
            </a>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-500">
          <p>
            Authorized Security Assessment for NTRO. Proof-of-concept testing conducted strictly in safe, isolated harnesses without affecting production users.
          </p>
        </div>
      </div>
    </footer>
  );
};
