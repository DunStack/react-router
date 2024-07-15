import { MemoryHistory } from "../history"

describe('MemoryHistory', () => {
  it('init', () => {
    const history1 = new MemoryHistory()
    expect(history1.scrollRestoration).toEqual('manual')
    expect(history1.url.toString()).toEqual(location.origin + '/')
    
    const history2 = new MemoryHistory({ base: 'https://foo.bar' })
    expect(history2.url.toString()).toEqual('https://foo.bar/')

    const history3 = new MemoryHistory({ entries: ['/foo', '/foo/bar'] })
    expect(history3.url.toString()).toEqual(location.origin + '/foo/bar')
  })

  it('navigate', () => {
    const history = new MemoryHistory()
    expect(history.length).toBe(1)
    
    history.pushState("state", "", "foo")
    expect(history.url.toString()).toEqual(location.origin + '/foo')
    expect(history.state).toEqual("state")
    expect(history.length).toBe(2)
    
    history.pushState("another state", "")
    expect(history.url.toString()).toEqual(location.origin + '/foo')
    expect(history.state).toEqual("another state")
    expect(history.length).toBe(3)
    
    history.replaceState(null, "", "?a=b")
    expect(history.url.toString()).toEqual(location.origin + '/foo?a=b')
    expect(history.state).toBeNull()
    expect(history.length).toBe(3)
    
    history.go(-2)
    expect(history.url.toString()).toEqual(location.origin + "/")
    expect(history.state).toBeUndefined()
    expect(history.length).toBe(3)
    
    history.forward()
    expect(history.url.toString()).toEqual(location.origin + "/foo")
    expect(history.state).toEqual("state")
    expect(history.length).toBe(3)
    
    history.back()
    expect(history.url.toString()).toEqual(location.origin + "/")
    expect(history.state).toBeUndefined()
    expect(history.length).toBe(3)
    
    history.pushState(null, "", "#abc")
    expect(history.url.toString()).toEqual(location.origin + "/#abc")
    expect(history.state).toBeNull()
    expect(history.length).toBe(2)
  })
})