interface EndpointParameter {
  readonly description: string;
  readonly in: 'body' | 'path' | 'query';
  readonly name: string;
  readonly required: boolean;
  readonly type: string;
}

interface EndpointInfo {
  readonly agentProhibited?: true;
  readonly category: string;
  readonly free: boolean;
  readonly method: string;
  readonly mpp?: { readonly intent: string; readonly price: string };
  readonly parameters?: readonly EndpointParameter[];
  readonly path: string;
  readonly responseShape?: string;
  readonly sensitive?: true;
  readonly summary: string;
}

interface RequestOptions {
  readonly body?: unknown;
  readonly method?: string;
  readonly query?: Readonly<Record<string, string>>;
}

type RequestFunction = (path: string, options?: Readonly<RequestOptions>) => Promise<unknown>;

type FetchFunction = typeof fetch;

interface ExploreParams {
  readonly category?: string;
  readonly free?: boolean;
  readonly limit?: number;
  readonly method?: string;
  readonly mpp?: boolean;
  readonly path?: string;
  readonly query?: string;
}

interface TweetclawParams {
  readonly body?: unknown;
  readonly method?: string;
  readonly path: string;
  readonly query?: Readonly<Record<string, boolean | number | string>>;
}

interface ToolResult {
  readonly content: ReadonlyArray<{ readonly text: string; readonly type: 'text' }>;
  readonly isError?: true;
}

interface PluginConfig {
  readonly apiKey?: string;
  readonly baseUrl?: string;
  readonly pollingEnabled?: boolean;
  readonly pollingInterval?: number;
  readonly tempoSigningKey?: string;
}

interface EventPollerOptions {
  readonly intervalSeconds: number;
  readonly onEvents: (events: ReadonlyArray<Readonly<Record<string, unknown>>>) => void;
  readonly request: RequestFunction;
}

export type {
  EndpointInfo,
  EndpointParameter,
  EventPollerOptions,
  ExploreParams,
  FetchFunction,
  PluginConfig,
  RequestFunction,
  RequestOptions,
  TweetclawParams,
  ToolResult,
};
