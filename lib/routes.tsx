import React, { Children, useContext, useMemo, useRef } from 'react'
import { LocationContext, OutletContext, RouteMatchContext } from './contexts'
import { RouteNode } from './route'
import { matchPath } from './utils'

interface RoutesProps {
  children: RouteNode
}

export default function Routes({ children }: RoutesProps) {
  const { pathname } = useContext(LocationContext)!
  const { routesChildren, routesMetadata } = parseRoutes(children)
  const prevRoutesMetadataRef = useRef(routesMetadata)
  
  const memoRoutesMetadata = useMemo(() => {
    if (JSON.stringify(prevRoutesMetadataRef.current) !== JSON.stringify(routesMetadata)) {
      prevRoutesMetadataRef.current = routesMetadata
    }
    return prevRoutesMetadataRef.current
  }, [routesMetadata])

  const routeMatch = useMemo(() => {
    for (const { fullPath, index } of memoRoutesMetadata) {
      const pathMatch = matchPath(fullPath, pathname)
      if (!pathMatch) continue
      return {
        index,
        params: pathMatch.params
      }
    }
  }, [memoRoutesMetadata, pathname])

  return (
    <RouteMatchContext.Provider value={routeMatch}>
      {routesChildren}
    </RouteMatchContext.Provider>
  )
}

interface RouteMetadata {
  fullPath: string
  index: string
}

interface ParsedRoutes {
  routesMetadata: RouteMetadata[]
  routesChildren: React.ReactNode
}

function parseRoutes(routes: RouteNode, parentIndex?: string): ParsedRoutes {
  const routesMetadata: RouteMetadata[] = []

  const routesChildren = Children.map(routes, (route, currentIndex) => {
    const { path = "", children } = route.props
    const index = parentIndex ? `${parentIndex}.${currentIndex}` : `${currentIndex}`

    if (children) {
      const parsedSubRoutes = parseRoutes(children, index)

      parsedSubRoutes.routesMetadata.forEach(subRouteMetadata => {
        routesMetadata.push({
          fullPath: [path, subRouteMetadata.fullPath].filter(Boolean).join('/'),
          index: subRouteMetadata.index
        })
      })

      return (
        <RouteMatchContext.Consumer>
          {routeMatch => routeMatch?.index?.startsWith(index) && (
            <OutletContext.Provider value={parsedSubRoutes.routesChildren}>
              {route}
            </OutletContext.Provider>
          )}
        </RouteMatchContext.Consumer>
      )
    }

    routesMetadata.push({
      fullPath: path,
      index
    })

    return (
      <RouteMatchContext.Consumer>
        {routeMatch => routeMatch?.index === index && (
          <OutletContext.Provider value={null}>
            {route}
          </OutletContext.Provider>
  )}
      </RouteMatchContext.Consumer>
    )
  })

  return {
    routesMetadata,
    routesChildren
  }
}
