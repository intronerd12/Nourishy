import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.error('Section crashed:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger" style={{ margin: '16px' }}>
          <strong>Something went wrong.</strong>
          <div className="small mt-1">{String(this.state.error?.message || 'Unknown error')}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;