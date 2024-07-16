import React, { useMemo, useRef } from "react";
import type { RouteNode } from "./Route";
import RoutesContext from "../contexts/RoutesContext";
import LocationContext from "../contexts/LocationContext";
import useNonNullableContext from "../hooks/useNonNullableContext";

interface RoutesProps {
  children: RouteNode
}

export default function Routes({ children }: RoutesProps) {
  const routesData = getRoutesData(children)
  const prevMetadataRef = useRef(routesData.metadata)
  const metadata = useMemo(() => {
    if (JSON.stringify(prevMetadataRef.current) !== JSON.stringify(routesData.metadata)) {
      prevMetadataRef.current = routesData.metadata
    }
    return prevMetadataRef.current
  }, [routesData.metadata])

  return (
    <RoutesProvider metadata={metadata}>
      {routesData.elements}
    </RoutesProvider>
  )
}

interface RoutesProviderProps {
  metadata: RouteMetadata[]
  children: React.ReactNode
}

function RoutesProvider({ metadata, children }: RoutesProviderProps) {
  const { pathname } = useNonNullableContext(LocationContext)
  const activeIndex = useMemo(() => metadata.find(({ path }) => matchPath(path, pathname))?.index, [pathname, metadata])

  return (
    <RoutesContext.Provider value={{ activeIndex }}>
      {children}
    </RoutesContext.Provider>
  )
}

interface RouteMetadata {
  path: string
  index: string
}

interface RoutesData {
  metadata: RouteMetadata[]
  elements: RouteNode
}

function getRoutesData(children: RouteNode, parentIndex?: string): RoutesData {
  const metadata: RouteMetadata[] = []

  const elements = React.Children.map(children, (child, currentIndex) => {
    const { path = "", children } = child.props

    const index = parentIndex ? `${parentIndex}.${currentIndex}` : `${currentIndex}`

    if (children) {
      const subRoutesData = getRoutesData(children, index)

      subRoutesData.metadata.forEach(subRouteMetadata => {
        metadata.push({
          path: [path, subRouteMetadata.path].filter(Boolean).join('/'),
          index: subRouteMetadata.index
        })
      })

      return (
        <RoutesContext.Consumer>
          {({ activeIndex }) => activeIndex?.startsWith(index) && React.cloneElement(child, { children: subRoutesData.elements })}
        </RoutesContext.Consumer>
      )
    }

    metadata.push({
      path,
      index
    })

    return (
      <RoutesContext.Consumer>
        {({ activeIndex }) => activeIndex === index && child}
      </RoutesContext.Consumer>
    )
  })

  return { metadata, elements }
}

function matchPath(path: string, pathname: string) {  
  const pattern = path
    .replace(/\*/, '.*')
    .replace(/:[^/]+/g, match => `(?<${match.substring(1)}>[^/]*)`)
  
  const result = new RegExp(`^/?${pattern}$`).exec(pathname)
  
  if (!result) return null
  
  return {
    path,
    pathname,
    params: result.groups
  }
}
