import { Subject } from '../../Subject.js';
import { Subscriber, Observable, Subscription, operate } from '../../Observable.js';
import { ReplaySubject } from '../../ReplaySubject.js';
import { Observer, NextObserver } from '../../types.js';

/**
 * WebSocketSubjectConfig is a plain Object that allows us to make our
 * webSocket configurable.
 *
 * <span class="informal">Provides flexibility to {@link webSocket}</span>
 *
 * It defines a set of properties to provide custom behavior in specific
 * moments of the socket's lifecycle. When the connection opens we can
 * use `openObserver`, when the connection is closed `closeObserver`, if we
 * are interested in listening for data coming from server: `deserializer`,
 * which allows us to customize the deserialization strategy of data before passing it
 * to the socket client. By default, `deserializer` is going to apply `JSON.parse` to each message coming
 * from the Server.
 *
 * ## Examples
 *
 * **deserializer**, the default for this property is `JSON.parse` but since there are just two options
 * for incoming data, either be text or binary data. We can apply a custom deserialization strategy
 * or just simply skip the default behaviour.
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const wsSubject = webSocket({
 *   url: 'ws://localhost:8081',
 *   //Apply any transformation of your choice.
 *   deserializer: ({ data }) => data
 * });
 *
 * wsSubject.subscribe(console.log);
 *
 * // Let's suppose we have this on the Server: ws.send('This is a msg from the server')
 * //output
 * //
 * // This is a msg from the server
 * ```
 *
 * **serializer** allows us to apply custom serialization strategy but for the outgoing messages.
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const wsSubject = webSocket({
 *   url: 'ws://localhost:8081',
 *   // Apply any transformation of your choice.
 *   serializer: msg => JSON.stringify({ channel: 'webDevelopment', msg: msg })
 * });
 *
 * wsSubject.subscribe(() => subject.next('msg to the server'));
 *
 * // Let's suppose we have this on the Server:
 * //   ws.on('message', msg => console.log);
 * //   ws.send('This is a msg from the server');
 * // output at server side:
 * //
 * // {"channel":"webDevelopment","msg":"msg to the server"}
 * ```
 *
 * **closeObserver** allows us to set a custom error when an error raises up.
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const wsSubject = webSocket({
 *   url: 'ws://localhost:8081',
 *   closeObserver: {
 *     next() {
 *       const customError = { code: 6666, reason: 'Custom evil reason' }
 *       console.log(`code: ${ customError.code }, reason: ${ customError.reason }`);
 *     }
 *   }
 * });
 *
 * // output
 * // code: 6666, reason: Custom evil reason
 * ```
 *
 * **openObserver**, Let's say we need to make some kind of init task before sending/receiving msgs to the
 * webSocket or sending notification that the connection was successful, this is when
 * openObserver is useful for.
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const wsSubject = webSocket({
 *   url: 'ws://localhost:8081',
 *   openObserver: {
 *     next: () => {
 *       console.log('Connection ok');
 *     }
 *   }
 * });
 *
 * // output
 * // Connection ok
 * ```
 */
export interface WebSocketSubjectConfig<T> {
  /** The url of the socket server to connect to */
  url: string;
  /** The protocol to use to connect */
  protocol?: string | Array<string>;
  /** @deprecated Will be removed in v8. Use {@link deserializer} instead. */
  resultSelector?: (e: MessageEvent) => T;
  /**
   * A serializer used to create messages from passed values before the
   * messages are sent to the server. Defaults to JSON.stringify.
   */
  serializer?: (value: T) => WebSocketMessage;
  /**
   * A deserializer used for messages arriving on the socket from the
   * server. Defaults to JSON.parse.
   */
  deserializer?: (e: MessageEvent) => T;
  /**
   * An Observer that watches when open events occur on the underlying web socket.
   */
  openObserver?: NextObserver<Event>;
  /**
   * An Observer that watches when close events occur on the underlying web socket
   */
  closeObserver?: NextObserver<CloseEvent>;
  /**
   * An Observer that watches when a close is about to occur due to
   * unsubscription.
   */
  closingObserver?: NextObserver<void>;
  /**
   * A WebSocket constructor to use. This is useful for situations like using a
   * WebSocket impl in Node (WebSocket is a DOM API), or for mocking a WebSocket
   * for testing purposes
   */
  WebSocketCtor?: { new (url: string, protocols?: string | string[]): WebSocket };
  /** Sets the `binaryType` property of the underlying WebSocket. */
  binaryType?: 'blob' | 'arraybuffer';
}

const DEFAULT_WEBSOCKET_CONFIG: WebSocketSubjectConfig<any> = {
  url: '',
  deserializer: (e: MessageEvent) => JSON.parse(e.data),
  serializer: (value: any) => JSON.stringify(value),
};

const WEBSOCKETSUBJECT_INVALID_ERROR_OBJECT =
  'WebSocketSubject.error must be called with an object with an error code, and an optional reason: { code: number, reason: string }';

export type WebSocketMessage = string | ArrayBuffer | Blob | ArrayBufferView;

export class WebSocketSubject<T> extends Subject<T> {
  private _config!: WebSocketSubjectConfig<T>;

  /** @internal */
  _output!: Subject<T>;

  private _socket: WebSocket | null = null;

  private destination: Observer<T> | undefined = undefined;

  private _source: Observable<T> | undefined = undefined;

  constructor(urlConfigOrSource: string | WebSocketSubjectConfig<T> | Observable<T>, destination?: Observer<T>) {
    super();
    if (urlConfigOrSource instanceof Observable) {
      this.destination = destination;
      this._source = urlConfigOrSource as Observable<T>;
    } else {
      const userConfig = typeof urlConfigOrSource === 'string' ? { url: urlConfigOrSource } : urlConfigOrSource;
      this._config = {
        ...DEFAULT_WEBSOCKET_CONFIG,
        // Setting this here because a previous version of this allowed
        // WebSocket to be polyfilled later than DEFAULT_WEBSOCKET_CONFIG
        // was defined.
        WebSocketCtor: WebSocket,
        ...userConfig,
      };

      if (!this._config.WebSocketCtor) {
        throw new Error('no WebSocket constructor can be found');
      }

      this._output = new Subject<T>();
      this.destination = new ReplaySubject();
    }
  }

  private _resetState() {
    this._socket = null;
    if (!this._source) {
      this.destination = new ReplaySubject();
    }
    this._output = new Subject<T>();
  }

  /**
   * Creates an {@link Observable}, that when subscribed to, sends a message,
   * defined by the `subMsg` function, to the server over the socket to begin a
   * subscription to data over that socket. Once data arrives, the
   * `messageFilter` argument will be used to select the appropriate data for
   * the resulting Observable. When finalization occurs, either due to
   * unsubscription, completion, or error, a message defined by the `unsubMsg`
   * argument will be sent to the server over the WebSocketSubject.
   *
   * @param subMsg A function to generate the subscription message to be sent to
   * the server. This will still be processed by the serializer in the
   * WebSocketSubject's config. (Which defaults to JSON serialization)
   * @param unsubMsg A function to generate the unsubscription message to be
   * sent to the server at finalization. This will still be processed by the
   * serializer in the WebSocketSubject's config.
   * @param messageFilter A predicate for selecting the appropriate messages
   * from the server for the output stream.
   */
  multiplex(subMsg: () => any, unsubMsg: () => any, messageFilter: (value: T) => boolean) {
    return new Observable<T>((destination) => {
      this.next(subMsg());
      destination.add(() => {
        this.next(unsubMsg());
      });
      this.subscribe(
        operate({
          destination,
          next: (x) => {
            if (messageFilter(x)) {
              destination.next(x);
            }
          },
        })
      );
    });
  }

  private _connectSocket() {
    const { WebSocketCtor, protocol, url, binaryType } = this._config;
    const observer = this._output;

    let socket: WebSocket | null = null;
    try {
      socket = protocol ? new WebSocketCtor!(url, protocol) : new WebSocketCtor!(url);
      this._socket = socket;
      if (binaryType) {
        this._socket.binaryType = binaryType;
      }
    } catch (e) {
      observer.error(e);
      return;
    }

    const subscription = new Subscription(() => {
      this._socket = null;
      if (socket && socket.readyState === 1) {
        socket.close();
      }
    });

    socket.onopen = (evt: Event) => {
      const { _socket } = this;
      if (!_socket) {
        socket!.close();
        this._resetState();
        return;
      }
      const { openObserver } = this._config;
      if (openObserver) {
        openObserver.next(evt);
      }

      const queue = this.destination;

      this.destination = new Subscriber({
        next: (x: T) => {
          if (socket!.readyState === 1) {
            try {
              const { serializer } = this._config;
              socket!.send(serializer!(x!));
            } catch (e) {
              this.destination!.error(e);
            }
          }
        },
        error: (err: any) => {
          const { closingObserver } = this._config;
          if (closingObserver) {
            closingObserver.next(undefined);
          }
          if (err && err.code) {
            socket!.close(err.code, err.reason);
          } else {
            observer.error(new TypeError(WEBSOCKETSUBJECT_INVALID_ERROR_OBJECT));
          }
          this._resetState();
        },
        complete: () => {
          const { closingObserver } = this._config;
          if (closingObserver) {
            closingObserver.next(undefined);
          }
          socket!.close();
          this._resetState();
        },
      });

      if (queue && queue instanceof ReplaySubject) {
        subscription.add((queue as ReplaySubject<T>).subscribe(this.destination));
      }
    };

    socket.onerror = (e: Event) => {
      this._resetState();
      observer.error(e);
    };

    socket.onclose = (e: CloseEvent) => {
      if (socket === this._socket) {
        this._resetState();
      }
      const { closeObserver } = this._config;
      if (closeObserver) {
        closeObserver.next(e);
      }
      if (e.wasClean) {
        observer.complete();
      } else {
        observer.error(e);
      }
    };

    socket.onmessage = (e: MessageEvent) => {
      try {
        const { deserializer } = this._config;
        observer.next(deserializer!(e));
      } catch (err) {
        observer.error(err);
      }
    };
  }

  next(value: T) {
    this.destination?.next?.(value);
  }

  error(err: any) {
    this.destination?.error?.(err);
  }

  complete() {
    this.destination?.complete?.();
  }

  /** @internal */
  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    const { _source } = this;
    if (_source) {
      return _source.subscribe(subscriber);
    }
    if (!this._socket) {
      this._connectSocket();
    }
    this._output.subscribe(subscriber);
    subscriber.add(() => {
      const { _socket } = this;
      if (this._output.observers.length === 0) {
        if (_socket && (_socket.readyState === 1 || _socket.readyState === 0)) {
          _socket.close();
        }
        this._resetState();
      }
    });
    return subscriber;
  }

  unsubscribe() {
    const { _socket } = this;
    if (_socket && (_socket.readyState === 1 || _socket.readyState === 0)) {
      _socket.close();
    }
    this._resetState();
    super.unsubscribe();
  }
}
