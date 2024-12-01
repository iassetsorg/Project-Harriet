type EventCallback = () => void;

class EventService {
  private static instance: EventService;
  private listeners: Map<string, Set<EventCallback>>;

  private constructor() {
    this.listeners = new Map();
  }

  static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  subscribe(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string) {
    this.listeners.get(event)?.forEach((callback) => callback());
  }
}

export default EventService.getInstance();
