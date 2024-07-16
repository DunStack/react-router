import { useContext } from "react";
import OutletContext from "../contexts/OutletContext";

export default function Outlet() {
  return useContext(OutletContext)
}