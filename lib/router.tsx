import { Children, createContext, useContext, useMemo } from "react";
import { matchPath, useNonNullableContext } from "./utils";

interface Location<State = unknown> extends Pick<globalThis.Location, 'pathname' | 'hash' | 'search'> {
  state?: State
}

interface RouteMetadata {
  path: string
  index: string
}

interface ParsedRoutes {
  metadata: RouteMetadata[]
  element: React.ReactNode
}

interface ProviderProps {
  children: React.ReactNode
}

interface RoutesProps {
  children: RouteNode
}

interface RouteProps {
  path?: string
  Component?: React.ComponentType
  children?: RouteNode
}

type RouteNode =
  | React.ReactElement<RouteProps>
  | readonly React.ReactElement<RouteProps>[]

export function createRouter() {
  const LocationContext = createContext<Location | undefined>(undefined)
  const OutletContext = createContext<React.ReactNode>(undefined)
  const RouteIndexContext = createContext<string | undefined>(undefined)
  const ParamsContext = createContext<Record<string, string> | undefined>(undefined)

  const useLocation = () => useNonNullableContext(LocationContext)
  const useParams = () => useContext(ParamsContext)

  function Provider({ children }: ProviderProps) {
    return (
      <LocationContext.Provider value={window.location}>
        {children}
      </LocationContext.Provider>
    )
  }

  function Routes({ children }: RoutesProps) {
    const { pathname } = useLocation()
    const { element, metadata } = parseRoutes(children)
    
    const { index, params } = useMemo(() => {
      for (const { path, index } of metadata) {
        const match = matchPath(path, pathname)
       
        if (match) return {
          index,
          params: match.params
        }
      }
      
      return {}
    }, [pathname, metadata])
    
    return (
      <RouteIndexContext.Provider value={index}>
        <ParamsContext.Provider value={params}>
          {element}
        </ParamsContext.Provider>
      </RouteIndexContext.Provider>
    )
  }
 
  function Route({ Component = Outlet }: RouteProps) {
    return <Component />
  }

  function Outlet() {
    return useContext(OutletContext)
  }

  return {
    Provider,
    Routes,
    Route,
    Outlet,
    useLocation,
    useParams
  }

  function parseRoutes(routes: RouteNode, parentIndex?: string): ParsedRoutes {
    const metadata: RouteMetadata[] = []
  
    const element = Children.map(routes, (route, currentIndex) => {
      const { path = "", children } = route.props
      const index = parentIndex ? `${parentIndex}.${currentIndex}` : `${currentIndex}`
  
      if (children) {
        const { metadata: childrenMetadata, element: childrenElement }= parseRoutes(children, index)
  
        childrenMetadata.forEach(childMetadata => {
          metadata.push({
            path: [path, childMetadata.path].filter(Boolean).join('/'),
            index: childMetadata.index
          })
        })
  
        return (
          <RouteIndexContext.Consumer>
            {routeIndex => routeIndex?.startsWith(index) && (
              <OutletContext.Provider value={childrenElement}>
                {route}
              </OutletContext.Provider>
            )}
          </RouteIndexContext.Consumer>
        )
      }
  
      metadata.push({ path, index })
  
      return (
        <RouteIndexContext.Consumer>
          {routeIndex => routeIndex === index && (
            <OutletContext.Provider value={null}>
              {route}
            </OutletContext.Provider>
          )}
        </RouteIndexContext.Consumer>
      )
    })
  
    return {
      metadata,
      element
    }
  }
}
