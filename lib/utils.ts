import { useContext } from "react"

export function useNonNullableContext<T>(Context: React.Context<T>) {
  const context = useContext(Context)
  
  if (context === undefined || context === null) {
    throw `Cannot get ${Context.displayName || 'Context'} outside Provider`
  }
  
  return context
}

export function matchPath(path: string, pathname: string) {  
  const regex = new RegExp(`^/?${
    path
      .replace(/\*/, '.*')
      .replace(/:[^/]+/g, match => `(?<${match.substring(1)}>[^/]*)`)
  }$`)
  
  const match = pathname.match(regex)
  
  if (!match) return null
  
  return {
    path,
    pathname,
    params: match.groups
  }
}