import { Component, ErrorInfo, ReactNode } from 'react';
import { Warning, ArrowClockwise, Trash } from '@phosphor-icons/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Yuumotion Uncaught Application Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.removeItem('yuumotion_workspaces_list');
      localStorage.removeItem('yuumotion_active_workspace_id');
      localStorage.removeItem('yuumotion_preferences');
      localStorage.removeItem('yuumotion_board');
      localStorage.removeItem('yuumotion_auth_user');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-bg p-6 font-sans text-text select-none">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-5">
              <Warning className="h-6 w-6" />
            </div>

            <h1 className="font-display font-bold text-lg text-text mb-2">
              Terjadi Kendala Memuat Ruang Kerja
            </h1>
            <p className="text-xs text-muted leading-relaxed mb-4">
              Aplikasi mendeteksi error saat merender antarmuka, biasanya disebabkan oleh cache data lokal dari versi sebelumnya yang tidak kompatibel.
            </p>

            {this.state.error && (
              <div className="rounded-xl border border-border bg-bg/80 p-3 mb-6 font-mono text-[11px] text-muted overflow-x-auto max-h-28">
                {this.state.error.message || 'Unknown error'}
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-project-solid px-4 text-xs font-semibold text-white shadow-xs hover:opacity-95 transition-all cursor-pointer"
              >
                <ArrowClockwise className="h-4 w-4" />
                Muat Ulang Halaman
              </button>

              <button
                type="button"
                onClick={this.handleResetStorage}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-hover/50 px-4 text-xs font-medium text-text hover:bg-hover transition-all cursor-pointer"
              >
                <Trash className="h-4 w-4 text-muted" />
                Bersihkan Cache & Reset Data Lokal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
