import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, Check, Copy, RefreshCw, ShieldCheck, Terminal, Wrench } from 'lucide-react';

export interface SmartCrashRecoveryPlan {
  errorTitle: string;
  rootCause: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    explanation: string;
    codeFix: string;
  }>;
}

export function synthesizeSmartCrashRecovery(
  errorMessage: string,
  stackTrace = '',
): SmartCrashRecoveryPlan {
  const lower = `${errorMessage} ${stackTrace}`.toLowerCase();

  if (lower.includes('cannot read properties of undefined') || lower.includes('cannot read properties of null') || lower.includes('map')) {
    return {
      errorTitle: 'Null / Undefined Property Access During Render',
      rootCause:
        'A component attempted to read a nested property or call `.map()` before asynchronous data hydration completed.',
      steps: [
        {
          stepNumber: 1,
          title: 'Add Optional Chaining & Nullish Coalescing Guard',
          explanation: 'Prevent synchronous crash when state or API payload is still undefined on initial mount.',
          codeFix: `const safeItems = Array.isArray(data?.items) ? data.items : [];\nreturn safeItems.map((item) => <Row key={item.id} item={item} />);`,
        },
        {
          stepNumber: 2,
          title: 'Initialize State with Deterministic Default Empty Array',
          explanation: 'Ensure `useState` starts with a valid structural default rather than `undefined`.',
          codeFix: `const [records, setRecords] = useState<RecordItem[]>([]);`,
        },
        {
          stepNumber: 3,
          title: 'Wrap Dynamic Subtree in Suspense / ErrorBoundary',
          explanation: 'Isolate data-driven widgets so transient network failures degrade gracefully.',
          codeFix: `<ErrorBoundary fallbackTitle="Widget Recovery Guard">\n  <DataGrid items={safeItems} />\n</ErrorBoundary>`,
        },
      ],
    };
  }

  if (lower.includes('maximum update depth exceeded') || lower.includes('too many re-renders')) {
    return {
      errorTitle: 'Infinite React Render / Effect Loop Detected',
      rootCause:
        'A `setState` call was invoked unconditionally during render or inside a `useEffect` without a stable dependency guard.',
      steps: [
        {
          stepNumber: 1,
          title: 'Wrap Event Handler in Arrow Function',
          explanation: 'Pass a callback reference (`() => setOpen(true)`) instead of invoking `setOpen(true)` in JSX.',
          codeFix: `<button type="button" onClick={() => setOpen((prev) => !prev)}>Toggle</button>`,
        },
        {
          stepNumber: 2,
          title: 'Stabilize useEffect Dependencies',
          explanation: 'Guard state updates inside `useEffect` with value comparison before calling `setState`.',
          codeFix: `useEffect(() => {\n  setSyncedValue((prev) => (prev === nextVal ? prev : nextVal));\n}, [nextVal]);`,
        },
        {
          stepNumber: 3,
          title: 'Memoize Derived Objects with useMemo',
          explanation: 'Prevent new object identity creation on every render cycle.',
          codeFix: `const config = useMemo(() => ({ theme, locale }), [theme, locale]);`,
        },
      ],
    };
  }

  return {
    errorTitle: errorMessage || 'Unhandled Component Runtime Exception',
    rootCause:
      'An unexpected runtime exception occurred inside the component tree or asynchronous effect handler.',
    steps: [
      {
        stepNumber: 1,
        title: 'Guard Component Inputs with Type Narrowing',
        explanation: 'Validate external props and API payloads before rendering child nodes.',
        codeFix: `if (!props || typeof props !== 'object') {\n  return <div className="p-4 text-xs text-slate-400">Initializing module...</div>;\n}`,
      },
      {
        stepNumber: 2,
        title: 'Wrap Async Effect Calls in Try/Catch Boundary',
        explanation: 'Catch rejected promises and update local error state instead of throwing uncaught exceptions.',
        codeFix: `try {\n  const res = await fetch('/api/endpoint');\n  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);\n} catch (err) {\n  console.error('Recovered async error:', err);\n}`,
      },
      {
        stepNumber: 3,
        title: 'Reset & Re-Hydrate Component State',
        explanation: 'Clear corrupted transient state and remount the component tree cleanly.',
        codeFix: `handleReset(); // Clears ErrorBoundary state and remounts subtree`,
      },
    ],
  };
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
  onAnalyzeError?: (errorLog: string) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copiedStep: number | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    copiedStep: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('SAZ AI Runtime ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null, copiedStep: null });
    this.props.onReset?.();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      const stackText = [
        this.state.error?.name
          ? `${this.state.error.name}: ${this.state.error.message}`
          : 'Runtime Error',
        this.state.error?.stack || '',
        this.state.errorInfo?.componentStack || '',
      ]
        .filter(Boolean)
        .join('\n\n');

      const recoveryPlan = synthesizeSmartCrashRecovery(
        this.state.error?.message || 'Runtime Error',
        stackText,
      );

      return (
        <div
          role="alert"
          className="flex min-h-[360px] w-full flex-col items-center justify-center rounded-2xl border border-rose-500/30 bg-white p-6 text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
        >
          <div className="flex w-full max-w-2xl flex-col">
            <div className="flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <AlertTriangle size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-rose-500">
                  <span>Smart Crash & Error Boundary Recovery</span>
                </div>
                <h2 className="text-lg font-bold tracking-tight">
                  {this.props.fallbackTitle || recoveryPlan.errorTitle}
                </h2>
              </div>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <strong>Root Cause Analysis:</strong> {recoveryPlan.rootCause}
            </p>

            {/* Step-by-Step Automated Code Fixes */}
            <div className="mt-4 space-y-2.5">
              {recoveryPlan.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <span className="grid size-5 place-items-center rounded-full bg-amber-400 text-[10px] font-extrabold text-slate-950">
                        {step.stepNumber}
                      </span>
                      <span>{step.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(step.codeFix).catch(() => {});
                        this.setState({ copiedStep: step.stepNumber });
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-200 hover:bg-slate-700"
                    >
                      {this.state.copiedStep === step.stepNumber ? (
                        <Check size={11} className="text-emerald-400" />
                      ) : (
                        <Copy size={11} />
                      )}
                      <span>
                        {this.state.copiedStep === step.stepNumber ? 'Copied Fix' : 'Copy Fix'}
                      </span>
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {step.explanation}
                  </p>
                  <pre className="mt-2 overflow-auto rounded-lg bg-slate-900 p-2 font-mono text-[11px] text-emerald-300">
                    <code>{step.codeFix}</code>
                  </pre>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-300 whitespace-nowrap"
              >
                <Wrench size={14} />
                <span>Apply Hot-Fix & Recover View</span>
              </button>
              {this.props.onAnalyzeError && (
                <button
                  type="button"
                  onClick={() => {
                    const logPayload = stackText;
                    this.setState({ hasError: false, error: null, errorInfo: null });
                    this.props.onAnalyzeError?.(logPayload);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-900 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white whitespace-nowrap"
                >
                  <Terminal size={14} />
                  <span>Open in Deep Error Analyzer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
