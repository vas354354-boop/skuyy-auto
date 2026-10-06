import { AlertTriangle, Loader2 } from 'lucide-react';

export function LoadingBlock({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      <p className="font-medium">{label}</p>
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="col-span-full mx-auto max-w-md rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
      <AlertTriangle className="mx-auto mb-3 w-8 h-8 text-red-500" />
      <p className="font-semibold text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 rounded-full bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-500 transition-colors">
          Coba lagi
        </button>
      )}
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{message}</div>;
}
