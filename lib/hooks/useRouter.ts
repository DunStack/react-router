import RouterContext from "../contexts/RouterContext";
import useNonNullableContext from "./useNonNullableContext";

export default function useRouter() {
  return useNonNullableContext(RouterContext)
}