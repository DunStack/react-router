export function matchPath(path: string, pathname: string) {  
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