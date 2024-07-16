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
    let pathname = to || ""
    if (!options) return pathname
    
    const { search = "", hash = "" } = options
    
    if ('params' in options) {
      pathname = pathname.replace(/\/:[^/]+/g, segment => {
        return '/' + (options.params)[segment.substring(2)]
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

export type DynamicPath = `${string}/:${string}`

type PathParamKey<P> = P extends `${infer _}/:${infer S}` 
  ? S extends `${infer S1}/${infer S2}`
    ? S1 | PathParamKey<`/${S2}`>
    : S
  : never

export type PathParams<To> = To extends DynamicPath 
  ? Record<PathParamKey<To>, string | number>
  : never

export type NavigateOptions<To, State> = {
  hash?: `#${string}`
  search?: `?${string}`
  state?: State
} & (
  To extends DynamicPath
    ? { params: PathParams<To> }
    : {}
)

export type NavigateArgs<To, State> = To extends DynamicPath 
  ? [NavigateOptions<To, State>] 
  : [NavigateOptions<To, State>?]

export type NavigateTo = string | null | undefined
