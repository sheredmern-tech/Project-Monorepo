// ============================================================================
// FILE: components/shared/error-boundary.tsx
// ============================================================================
"use client";

import { Component, ReactNode, ErrorInfo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>Terjadi Kesalahan</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Maaf, terjadi kesalahan yang tidak terduga. Silakan muat ulang halaman atau hubungi administrator.
              </p>
              {this.state.error && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-mono">{this.state.error.message}</p>
                </div>
              )}
              <Button onClick={() => window.location.reload()} className="w-full">
                Muat Ulang Halaman
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}