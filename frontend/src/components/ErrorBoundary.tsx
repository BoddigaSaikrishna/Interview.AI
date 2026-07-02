import React from 'react';
import { Button } from '@/components/ui/button';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error | null };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Log to console for now; could send to remote logging
    console.error('Uncaught error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleDashboard = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (!this.state.hasError) return this.props.children as React.ReactElement;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-2xl w-full bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-4">An unexpected error occurred. You can reload the page or go back to the dashboard.</p>
          <div className="flex gap-3 mb-4">
            <Button onClick={this.handleReload}>Reload</Button>
            <Button variant="ghost" onClick={this.handleDashboard}>Dashboard</Button>
          </div>
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">Error details</summary>
            <pre className="whitespace-pre-wrap mt-2 text-xs">{this.state.error?.message}</pre>
          </details>
        </div>
      </div>
    );
  }
}
