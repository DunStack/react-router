import React from "react"
import Outlet from "./outlet"

interface RouteProps {
  path?: string
  Component?: React.ElementType
  children?: RouteNode
}

export type RouteNode = 
  | React.ReactElement<RouteProps>
  | readonly React.ReactElement<RouteProps>[]

export default function Route({ Component = Outlet }: RouteProps) {
  return <Component />
}