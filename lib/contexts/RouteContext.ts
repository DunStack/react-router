import { createContext } from "react";

interface RouteContextType {
  index: string
}

const RouteContext = createContext<RouteContextType | undefined>(undefined)

export default RouteContext