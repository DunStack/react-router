import React, { createContext } from "react";
import { Location } from "./history";
import Router from "./router";

export const RouterContext = createContext<Router | undefined>(undefined)

export const LocationContext = createContext<Location | undefined>(undefined)

interface RouteMatchContext {
  index: string
  params?: Record<string, string>
}

export const RouteMatchContext = createContext<RouteMatchContext | undefined>(undefined)

export const OutletContext = createContext<React.ReactNode>(undefined)
