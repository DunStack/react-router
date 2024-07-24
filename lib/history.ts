export interface Location<State = unknown> extends Pick<globalThis.Location, 'pathname' | 'search' | 'hash'> {
  state?: State
}

export interface History extends globalThis.History {
  url?: URL
}