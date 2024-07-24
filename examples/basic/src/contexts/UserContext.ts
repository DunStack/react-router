import { createContext } from "react"

const UserContext = createContext<StateTuple<string | undefined>>([undefined, () => {}])

export default UserContext