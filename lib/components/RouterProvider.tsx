import React, { useEffect, useMemo, useState } from "react"
import Router from "../router"
import RouterContext from "../contexts/RouterContext"
import LocationContext from "../contexts/LocationContext"
import { MemoryHistory } from "../history"

type RouterProviderProps = React.PropsWithChildren<{
  history: History
}>

export default function RouterProvider({ children, history }: RouterProviderProps) {
  const router = useMemo(() => new Router({ history }), [history])
  const [location, setLocation] = useState(router.location)

  useEffect(() => {
    if (router.history instanceof MemoryHistory) return
  
    window.addEventListener('popstate', router.popstate)
    return () => window.addEventListener('popstate', router.popstate)
  }, [])

  useEffect(() => router.listen('navigate', ({ location }) => setLocation(location)), [router])

  return (
    <RouterContext.Provider value={router}>
      <LocationContext.Provider value={location}>
        {children}
      </LocationContext.Provider>
    </RouterContext.Provider>
  )
}
