import { useContext } from "react";
import { OutletContext } from "./contexts";

export default function Outlet() {
  return useContext(OutletContext)
}