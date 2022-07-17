import { useState } from "react";
import MinterWhiteList from "./MinterWhiteList";
import MinterSupply from "./MinterSupply";
import MinterFree from "./MinterFree";
import MinterOne from "./MinterOne";

const project = "mintersupply";

function App() {
  if (project === "minterwhitelist") {
    return <MinterWhiteList />;
  } else if (project === "mintersupply") {
    return <MinterSupply />;
  } else if (project === "minterfree") {
    return <MinterFree />;
  } else {
    return <MinterOne />;
  }
}

export default App;
