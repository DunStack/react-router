import { useContext } from "react";
import { LocationContext, RouteMatchContext, RouterContext } from "./contexts";
import { Location } from "./history";

function useNonNullableContext<T>(Context: React.Context<T | undefined>) {
  const context = useContext(Context)
  if (!context) throw `${Context.displayName || 'Context'} is undefined` 
  return context
}

export const useRouter = () => useNonNullableContext(RouterContext)

export function useLocation<State>() {
  return useNonNullableContext(LocationContext) as Location<State>
}

export function useParams() {
  return useNonNullableContext(RouteMatchContext).params
}