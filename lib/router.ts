import type { History } from "./history"

export enum NavigateAction {
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

export interface Location<State = unknown> {
  pathname: string
  hash?: string
  search?: string
  state?: State
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

type RouterEventListenerMap = {
  [T in RouterEventType]: Set<RouterEventListener<T>>
}

interface RouterState<State = unknown> {
  index: number
  state?: State
}

type HistoryState<Name extends string, State = unknown> = Record<`__${Name}`, RouterState<State>>

interface RouterInit<N> {
  history: History
  name?: N
}

export default class Router<Name extends string = 'router'> {
  history: History
  name: Name 

  #prevIndex: number = 0
  #listenerMap: RouterEventListenerMap = {
    navigate: new Set([])
  }

  constructor({ history, name }: RouterInit<Name>) {
    this.history = history
    this.name = name || 'router' as Name
  }
  
  get #stateName() {
    return `__${this.name}` as const
  }
  
  get #routerState() {
    return this.#getRouterState(this.history.state)
  }
  
  get #index() {
    return this.#routerState?.index || 0
  }

  #getRouterState = <State>(historyState?: HistoryState<Name, State> | null): RouterState<State> | undefined => {
    return historyState?.[this.#stateName]
  }

  #navigateNotify = (action: NavigateAction, delta: number) => {
    this.#listenerMap.navigate.forEach(listener => listener({
      action,
      delta,
      location: this.location
    }))
    
    this.#prevIndex = this.#index
  }

  #navigate = <To extends string, S>(type: keyof typeof NavigateActionMap, to: To | null, ...[options]: NavigateOptions<To, S>) => {
    const { delta, action } = NavigateActionMap[type]
    const routerState: RouterState<S> = {
      index: this.#index + delta,
      state: options?.state
    }
    
    this.history[type](
      { [this.#stateName]: routerState }, 
      "", 
      this.createHref(to, ...[options] as NavigateOptions<To, S>)
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

  createHref = <To extends string, S>(to: To | null, ...[options]: NavigateOptions<To, S>) => {
    let pathname = to || ""
    const { search = "", hash = "" } = options || {}
    
    if (hasParams<To, S>(options)) {
      pathname = pathname.replace(/\/:[^/]+/g, segment => {
        return '/' + options.params[segment.substring(2) as keyof PathParams<To>]
      })
    }

    return pathname + search + hash
  }

  listen = <T extends RouterEventType>(type: T, listener: RouterEventListener<T>) => {
    this.#listenerMap[type].add(listener)
    return () => this.unlisten(type, listener)
  }

  unlisten = <T extends RouterEventType>(type: T, listener: RouterEventListener<T>) => {
    this.#listenerMap[type].delete(listener)
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

  push = <To extends string, S>(to: To | null, ...[options]: NavigateOptions<To, S>) => {
    return this.#navigate('pushState', to, ...[options] as NavigateOptions<To, S>)
  }

  replace = <To extends string, S>(to: To | null, ...[options]: NavigateOptions<To, S>) => {
    return this.#navigate('replaceState', to, ...[options] as NavigateOptions<To, S>)
  }

  popstate = () => {
    const delta = this.#index - this.#prevIndex
    this.#navigateNotify(NavigateAction.Pop, delta)
  }
}

type PathParamKey<P> = P extends `${infer _}/:${infer S}` 
  ? S extends `${infer S1}/${infer S2}`
    ? S1 | PathParamKey<`/${S2}`>
    : S
  : never

type PathParams<To> = To extends string 
  ? PathParamKey<To> extends never
    ? never
    : Record<PathParamKey<To>, string | number>
  : never

type NavigateOptions<To, S> = To extends string
  ? PathParams<To> extends never 
    ? [] | [CommonNavigateOptions<S>]
    : [NavigateOptionsWithParams<To, S>]
  : [] | [CommonNavigateOptions<S>]

interface CommonNavigateOptions<S> {
  hash?: `#${string}`
  search?: `?${string}`
  state?: S
}

interface NavigateOptionsWithParams<To, S> extends CommonNavigateOptions<S> {
  params: PathParams<To>
}

function hasParams<To, S>(options: CommonNavigateOptions<S> | NavigateOptionsWithParams<To, S> | undefined): options is NavigateOptionsWithParams<To, S> {
  return options ? 'params' in options : false
}
