import { createContext } from "react";

interface RoutesContextType {
  activeIndex: string | undefined
}

const RoutesContext = createContext<RoutesContextType>({
  activeIndex: undefined
})

export default RoutesContext