export interface Command {
  type: string;
}

export interface Handler<TCommand extends Command, TResult> {
  handle(command: TCommand): Promise<TResult>;
}

export class Mediator {
  private readonly handlers = new Map<string, Handler<Command, unknown>>();

  register<TCommand extends Command, TResult>(
    type: TCommand['type'],
    handler: Handler<TCommand, TResult>,
  ): void {
    this.handlers.set(type, handler as Handler<Command, unknown>);
  }

  async send<TCommand extends Command, TResult>(command: TCommand): Promise<TResult> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`No mediator handler registered for command: ${command.type}`);
    }
    return handler.handle(command) as Promise<TResult>;
  }
}
