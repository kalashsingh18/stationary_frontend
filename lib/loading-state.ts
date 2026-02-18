type Listener = (isLoading: boolean) => void;

class LoadingState {
  private activeRequests = 0;
  private listeners: Set<Listener> = new Set();

  startLoading() {
    this.activeRequests++;
    this.notify();
  }

  stopLoading() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.notify();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const isLoading = this.activeRequests > 0;
    this.listeners.forEach((listener) => listener(isLoading));
  }
}

export const loadingState = new LoadingState();
