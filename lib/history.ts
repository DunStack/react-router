export interface Location<State = unknown> extends Pick<globalThis.Location, 'pathname' | 'hash' | 'search'> {
  state?: State
}

export interface History extends globalThis.History {
  url?: URL
}

export type DynamicPath = `${string}:${string}`

export type NavigateTo = string

export function hasNavigateParams<To extends NavigateTo, State>(to: To, _options: NavigateOptions<NavigateTo, State>): _options is NavigateOptions<DynamicPath, State> {
  return to.includes(":")
}

type PathParamKey<Path extends string> = Path extends `${string}:${infer P}` 
  ? P extends `${infer P1}/${infer P2}`
    ? P1 | PathParamKey<`/${P2}`>
    : P
  : never

export type PathParams<To extends NavigateTo> = To extends DynamicPath
  ? Record<PathParamKey<To>, string | number>
  : never

export type NavigateOptions<To extends NavigateTo, State> = {
  hash?: `#${string}`
  search?: `?${string}`
  state?: State
} & (
  To extends DynamicPath
    ? { params: PathParams<To> }
    : {}
)

type NavigateArgs<To extends NavigateTo, State> = To extends DynamicPath 
  ? [NavigateOptions<To, State>] 
  : [NavigateOptions<To, State>?]

enum NavigateAction {
  Push = "PUSH",
  Replace = "REPLACE",
  Pop = "POP",
}

const NavigateActionMap = {
  pushState: {
    delta: 1,
    action: NavigateAction.Push
  }, 
  replaceState: {
    delta: 0,
    action: NavigateAction.Replace
  }
}

interface NavigateEvent {
  action: NavigateAction
  location: Location
  delta: number
}

interface RouterEventMap {
  navigate: NavigateEvent
}

type RouterEventType = keyof RouterEventMap

type RouterEventListener<T extends RouterEventType> = (event: RouterEventMap[T]) => void

interface RouterState<State = unknown> {
  index: number
  state?: State
}

type HistoryState<State = unknown> = Record<string, RouterState<State>>

interface RouterInit {
  history: History
  name?: string
}

export class RouterHistory {
  history: History
  name: string

  #prevIndex: number = 0
  #listeners: { [T in RouterEventType]: Set<RouterEventListener<T>> } = {
    navigate: new Set()
  }

  constructor({ history, name = 'router' }: RouterInit) {
    this.history = history
    this.name = name
  }
  
  get #stateName() {
    return `__${this.name}__`
  }

  get #routerState() {
    return this.#getRouterState(this.history.state)
  }
  
  get #index() {
    return this.#routerState?.index || 0
  }
    
  #getRouterState = (historyState?: HistoryState | null): RouterState | undefined => {
    return historyState?.[this.#stateName]
  }

  #navigateNotify = (action: NavigateAction, delta: number) => {
    this.#listeners.navigate.forEach(listener => listener({
      action,
      delta,
      location: this.location
    }))
    
    this.#prevIndex = this.#index
  }

  #navigate = <To extends NavigateTo, State>(type: keyof typeof NavigateActionMap, to: To, ...[options]: NavigateArgs<To, State>) => {
    const { delta, action } = NavigateActionMap[type]
    const routerState: RouterState<State> = {
      index: this.#index + delta,
      state: options?.state
    }
    
    this.history[type](
      { [this.#stateName]: routerState }, 
      "", 
      this.createHref(to, ...[options] as NavigateArgs<To, State>)
    )
    
    this.#navigateNotify(action, delta)
  }

  get location(): Location {
    const { pathname, hash, search } = this.history.url || location
    
    return {
      pathname,
      hash,
      search,
      state: this.#getRouterState(this.history.state)?.state
    }
  }

  createHref = <To extends NavigateTo, State>(to: To, ...[options]: NavigateArgs<To, State>) => {
    let pathname: string = to
    if (!options) return pathname
    
    const { search = "", hash = "" } = options
    
    if ('params' in options) {
      pathname = pathname.replace(/:[^/]+/g, segment => {
        return `${options.params[segment.substring(1)]}`
      })
    }

    if (pathname && !pathname.startsWith('/')) {
      pathname = this.location.pathname + '/' + pathname
    }

    return pathname + search + hash
  }

  listen = <T extends RouterEventType>(type: T, listener: RouterEventListener<T>) => {
    this.#listeners[type].add(listener)
    return () => this.unlisten(type, listener)
  }

  unlisten = <T extends RouterEventType>(type: T, listener: RouterEventListener<T>) => {
    this.#listeners[type].delete(listener)
  }

  go = (delta: number = 0) => {
    this.history.go(delta)
    this.#navigateNotify(NavigateAction.Pop, delta)
  }

  back = () => {
    this.go(-1)
  }

  forward = () => {
    this.go(1)
  }

  push = <To extends NavigateTo, State>(to: To, ...[options]: NavigateArgs<To, State>) => {
    return this.#navigate('pushState', to, ...[options] as NavigateArgs<To, State>)
  }

  replace = <To extends NavigateTo, State>(to: To, ...[options]: NavigateArgs<To, State>) => {
    return this.#navigate('replaceState', to, ...[options] as NavigateArgs<To, State>)
  }

  popstate = () => {
    const delta = this.#index - this.#prevIndex
    this.#navigateNotify(NavigateAction.Pop, delta)
  }
}
