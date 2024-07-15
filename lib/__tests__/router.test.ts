import { MemoryHistory } from '../history'
import Router, { NavigateAction } from '../router'

describe('Router', () => {
  it('createHref', () => {
    const router = new Router({ history })
    expect(router.createHref('/')).toEqual('/')
    expect(router.createHref(null, { search: '?a=b'  })).toEqual('?a=b')
    expect(router.createHref('/foo', { hash: "#bar" })).toEqual('/foo#bar')
    expect(router.createHref('/a/:b/:c/d', { params: { c: 1, b: 2 }, search: '?a=b', hash: '#c' })).toEqual('/a/2/1/d?a=b#c')
  })

  it('listen/unlisten', () => {
    const router = new Router({ history })
    const navigate1 = vi.fn()
    const navigate2 = vi.fn()
    
    // listen navigate1 and navigate2
    router.listen('navigate', navigate1)
    const unlistenNavigate2 = router.listen('navigate', navigate2)
    router.go(1)
    expect(navigate1).toBeCalledTimes(1)
    expect(navigate2).toBeCalledTimes(1)

    // unlisten navigate1 using router.unlisten()
    router.unlisten('navigate', navigate1)
    router.go(2)
    expect(navigate1).toBeCalledTimes(1)
    expect(navigate2).toBeCalledTimes(2)
    
    // unlisten navigate2 using returned unlisten function
    unlistenNavigate2()
    router.go(3)
    expect(navigate1).toBeCalledTimes(1)
    expect(navigate2).toBeCalledTimes(2)
  })

  it('location', () => {
    // browser location
    const browserRouter = new Router({ history })
    vi.spyOn(location, 'pathname', 'get').mockReturnValueOnce('/abc')
    vi.spyOn(history, 'state', 'get').mockReturnValueOnce({
      __router: {
        index: 0,
        state: 'foo bar'
      }
    })
    expect(browserRouter.location).toEqual({
      pathname: '/abc',
      hash: '',
      search: '',
      state: 'foo bar'
    })

    // memory location
    const memoryRouter = new Router({ 
      history: new MemoryHistory({ entries: ['/xyz?foo=bar#baz'] }) 
    })
    expect(memoryRouter.location).toEqual({
      pathname: '/xyz',
      hash: '#baz',
      search: '?foo=bar',
      state: undefined
    })
  })

  describe('navigate', () => {
    const history = new MemoryHistory()
    const router = new Router({ history })
    const navigate = vi.fn()

    beforeEach(() => {
      router.listen('navigate', navigate)
    })
    
    afterEach(() => {
      router.unlisten('navigate', navigate)
    })

    it('push', () => {
      router.push('/foo', { search: '?a=b' })
      expect(navigate).toHaveBeenLastCalledWith({
        action: NavigateAction.Push,
        delta: 1,
        location: {
          pathname: '/foo',
          hash: '',
          search: '?a=b',
          state: undefined
        }
      })

      router.push(null, { state: 'c' })
      expect(navigate).toHaveBeenLastCalledWith({
        action: NavigateAction.Push,
        delta: 1,
        location: {
          pathname: '/foo',
          hash: '',
          search: '?a=b',
          state: 'c'
        }
      })
    })

    it('replace', () => {
      router.replace('/:foo', { params: { foo: 'bar' }, hash: '#baz' })
      expect(navigate).toHaveBeenLastCalledWith({
        action: NavigateAction.Replace,
        delta: 0,
        location: {
          pathname: '/bar',
          hash: '#baz',
          search: '',
          state: undefined
        }
      })
    })

    it('go', () => {
      router.go(-2)
      expect(navigate).toHaveBeenLastCalledWith({
        action: NavigateAction.Pop,
        delta: -2,
        location: {
          pathname: '/',
          hash: '',
          search: '',
          state: undefined
        }
      })
    })

    it('forward', () => {
      router.forward()
      expect(navigate).toHaveBeenLastCalledWith({
        action: NavigateAction.Pop,
        delta: 1,
        location: {
          pathname: '/foo',
          hash: '',
          search: '?a=b',
          state: undefined
        }
      })
    })

    it('back', () => {
      router.back()
      expect(navigate).toHaveBeenLastCalledWith({
        action: NavigateAction.Pop,
        delta: -1,
        location: {
          pathname: '/',
          hash: '',
          search: '',
          state: undefined
        }
      })
    })

    it('popstate', () => {
      history.go(2)
      router.popstate()
      expect(navigate).toHaveBeenLastCalledWith({
        action: NavigateAction.Pop,
        delta: 2,
        location: {
          pathname: '/bar',
          hash: '#baz',
          search: '',
          state: undefined
        }
      })
    })
  })
})