import React from "react"
import OutletContext from "../contexts/OutletContext"

export type RouteNode = React.ReactElement<RouteProps> | readonly React.ReactElement<RouteProps>[]

export interface RouteProps {
  path?: string
  element?: React.ReactNode
  children?: RouteNode
}

export default function Route({ element, children }: RouteProps) {
  return (
    <OutletContext.Provider value={children}>
      {element}
    </OutletContext.Provider>
  )
}