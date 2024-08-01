import { Children, createContext, forwardRef, useContext, useEffect, useMemo, useState } from "react";
import { matchPath, useNonNullableContext } from "./utils";
import { hasNavigateParams, type DynamicPath, type Location, type NavigateOptions, type NavigateTo, type RouterHistory } from "./history";

type PopLinkProps = {
  to: number
}

type NavigateLinkProps<To extends NavigateTo, State> = {
  to?: To | string
  replace?: boolean
} & NavigateOptions<To, State>

type LinkProps<To extends NavigateTo, State> = React.ComponentProps<'a'> & (PopLinkProps | NavigateLinkProps<To, State>)

function isPopLink<To extends NavigateTo, State>(props: PopLinkProps | NavigateLinkProps<To, State>): props is PopLinkProps {
  return typeof props.to === 'number'
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

function createRouter() {
  const HistoryContext = createContext<RouterHistory | undefined>(undefined)
  const LocationContext = createContext<Location | undefined>(undefined)
  const OutletContext = createContext<React.ReactNode>(undefined)
  const RouteIndexContext = createContext<string | undefined>(undefined)
  const ParamsContext = createContext<Record<string, string> | undefined>(undefined)

  const useHistory = () => useNonNullableContext(HistoryContext)
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
      <HistoryContext.Provider value={history}>
        <LocationContext.Provider value={location}>
          {children}
        </LocationContext.Provider>
      </HistoryContext.Provider>
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
  
  function Link<To extends NavigateTo, State>(props: LinkProps<To, State>, ref: React.ForwardedRef<HTMLAnchorElement>) {
    const history = useHistory()
    
    let href: string, 
    restProps: React.ComponentProps<'a'>,
    navigate: () => void
    
    if (isPopLink(props)) {
      const { to, ...rest } = props
      href = ""
      navigate = () => history.go(to)
      restProps = rest
    } else {
      const { to = "", replace, ...otherProps } = props
      const navigateType = replace ? 'replace' : 'push'
      if (hasNavigateParams(to, otherProps)) {
        const { hash, search, state, params, ...rest } = otherProps
        const options: NavigateOptions<DynamicPath, State> = { hash, search, state, params }
        href = history.createHref(to, options)
        restProps = rest
        navigate = () => history[navigateType](to, options)
      } else {
        const { hash, search, state, ...rest } = otherProps
        const options: NavigateOptions<string, State> = { hash, search, state }
        href = history.createHref(to, options)
        restProps = rest
        navigate = () => history[navigateType](to, options)
      }
    }
  
    return (
      <a 
        ref={ref} 
        href={href} 
        onClick={e => {
          e.preventDefault()
          navigate()
        }}
        {...restProps} 
      />
    )
  }

  return {
    Provider,
    Routes,
    Route,
    Outlet,
    Link: forwardRef(Link) as typeof Link,
    useHistory,
    useLocation,
    useParams,
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
export const Link = DefaultRouter.Link

export const useHistory = DefaultRouter.useHistory
export const useLocation = DefaultRouter.useLocation
export const useParams = DefaultRouter.useParams

export { createBrowserHistory } from './history'