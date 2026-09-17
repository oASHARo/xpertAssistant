import { EventEmitter } from 'node:events';
export interface DomainEvent { type: string }
type Listener<T extends DomainEvent> = (event: T) => void | Promise<void>;
export class EventBus {
  private readonly emitter = new EventEmitter();
  subscribe<T extends DomainEvent>(type: T['type'], listener: Listener<T>) { this.emitter.on(type, listener as Listener<DomainEvent>); }
  publish<T extends DomainEvent>(event: T) { this.emitter.emit(event.type, event); }
}
export const eventBus = new EventBus();
