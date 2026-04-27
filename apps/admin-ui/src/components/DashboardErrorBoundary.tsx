'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Dashboard Error Boundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 max-w-md w-full text-center space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Произошла ошибка</h2>
            <p className="text-sm text-gray-600">
              Что-то пошло не так. Попробуйте обновить страницу.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition-colors"
            >
              Обновить
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
