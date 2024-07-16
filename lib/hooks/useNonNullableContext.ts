import { useContext } from "react";

export default function useNonNullableContext<T>(Context: React.Context<T | undefined>) {
  const context = useContext(Context)
  if (!context) throw 'Context not found'
  return context
}