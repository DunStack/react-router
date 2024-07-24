import React, { useMemo, useState, useEffect } from "react";
import Router from "./router";
import { LocationContext, RouterContext } from "./contexts";

type RouterProps = {
  children: React.ReactNode
  history: History
}

export function RouterProvider({ history, children }: RouterProps) {
  const router = useMemo(() => new Router({ history }), [history])
  const [location, setLocation] = useState(router.location)

  useEffect(() => router.listen('navigate', ({ location }) => setLocation(location)), [router])

  useEffect(() => {
    window.addEventListener('popstate', router.popstate)
    return () => window.removeEventListener('popstate', router.popstate)
  }, [router])

  return (
    <RouterContext.Provider value={router}>
      <LocationContext.Provider value={location}>
        {children}
      </LocationContext.Provider>
    </RouterContext.Provider>
  )
}
