
export interface History extends globalThis.History {
  url?: URL
}

interface HistoryEntry<S = unknown> {
  url: URL
  state?: S
}

interface MemoryHistoryInit {
  base?: string 
  entries?: string[]
}

export class MemoryHistory implements History {
  #entries: HistoryEntry[] = []
  #index = -1

  base: string
  scrollRestoration: ScrollRestoration = 'manual'

  constructor(init: MemoryHistoryInit = {}) {
    const { 
      base = typeof location !== 'undefined' ? location.origin : 'http://localhost', 
      entries = [base] 
    } = init
    
    this.base = base
    this.#entries = entries.map(entry => ({
      url: new URL(entry, this.base)
    }))
    this.#index = this.length - 1
  }

  get length() {
    return this.#entries.length
  }

  get url() {
    return this.#entries[this.#index].url
  }
  
  get state() {
    return this.#entries[this.#index].state
  }

  go(delta = 0) {
    this.#index += delta  
  }

  back() {
    this.go(-1)
  }

  forward() {
    this.go(1)
  }

  pushState(state: any, _: string, url?: string | URL | null): void {
    const nextIndex = this.#index + 1
    this.#entries.splice(nextIndex, Infinity, {
      url: url ? new URL(url, this.url) : this.url,
      state
    })
    this.#index = nextIndex
  }

  replaceState(state: any, _: string, url?: string | URL | null): void {
   this.#entries.splice(this.#index, 1, {
      url: url ? new URL(url, this.url) : this.url,
      state
    }) 
  }
}