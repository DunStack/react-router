import { Children, createContext, useContext, useEffect, useMemo, useState } from "react";
import { matchPath, useNonNullableContext } from "./utils";
import type { Location, RouterHistory } from "./history";

interface RouteMetadata {
  path: string
  index: string
}

interface ParsedRoutes {
  metadata: RouteMetadata[]
  element: React.ReactNode
}

interface ProviderProps {
  history: RouterHistory
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

export default function createRouter() {
  const LocationContext = createContext<Location | undefined>(undefined)
  const OutletContext = createContext<React.ReactNode>(undefined)
  const RouteIndexContext = createContext<string | undefined>(undefined)
  const ParamsContext = createContext<Record<string, string> | undefined>(undefined)

  const useLocation = () => useNonNullableContext(LocationContext)
  const useParams = () => useContext(ParamsContext)

  function Provider({ history, children }: ProviderProps) {
    const [location, setLocation] = useState(history.location)
    
    useEffect(() => history.listen('navigate', ({ location }) => setLocation(location)), [history])

    useEffect(() => {
      addEventListener('popstate', history.popstate)
      return () => removeEventListener('popstate', history.popstate)
    }, [history])

    return (
      <LocationContext.Provider value={location}>
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

const DefaultRouter = createRouter()

export const RouterProvider = DefaultRouter.Provider
export const Routes = DefaultRouter.Routes
export const Route = DefaultRouter.Route
export const Outlet = DefaultRouter.Outlet

export const useLocation = DefaultRouter.useLocation
export const useParams = DefaultRouter.useParams

export { createBrowserHistory } from './history'