import { createContext } from "react";
import Router from "../router";

const RouterContext = createContext<Router | undefined>(undefined)

export default RouterContext