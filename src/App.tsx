import { useState } from 'react'
import { BookOpen, Layers, ShieldCheck, Sparkles, Server, ArrowRight } from 'lucide-react'

export default function App() {
  const [count, setCount] = useState<number>(0)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              IZEON Books
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              React + TS + Tailwind
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900 text-xs text-slate-400 mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Tailwind CSS v4 & Lucide Icons Integrated</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
          Modern Book Management{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
            Frontend
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-xl">
          Powered by Vite, React 19, TypeScript, Tailwind CSS, and Lucide Icons.
        </p>

        {/* Counter Button */}
        <div className="mt-8">
          <button
            onClick={() => setCount((c) => c + 1)}
            className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Clicks: {count}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">React & TypeScript</h3>
            <p className="text-sm text-slate-400 mt-1">
              Fully type-safe UI built with Vite for ultra-fast Hot Module Replacement (HMR).
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Tailwind & Lucide</h3>
            <p className="text-sm text-slate-400 mt-1">
              Tailwind utility classes and beautiful icons from <code className="text-xs text-sky-300">lucide-react</code>.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Backend Ready</h3>
            <p className="text-sm text-slate-400 mt-1">
              Ready to connect with your Express & Prisma backend running on port 5000.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
