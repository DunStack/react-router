import { createContext } from "react";
import { Location } from "../router";

const LocationContext = createContext<Location | undefined>(undefined);

export default LocationContext