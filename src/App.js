import React, { useEffect, useState } from "react";
import ChoroplethMap from "./components/ChoroplethMap";
import Tableau from "./components/Tableau";
import "./App.css";
import DualBarChart from "./components/DualBarChart";

function App() {
  useEffect(() => {}, []);

  const [activeTab, setActiveTab] = useState("map");

  return (
    <>
      <header className="header">
        <h1>House Prices and Income Analysis</h1>
        <nav className="nav-bar">
          <button onClick={() => setActiveTab("map")}>Choropleth Map D3.JS</button>
          <button onClick={() => setActiveTab("dualchart")}>Bar Chart D3.JS</button>
          <button onClick={() => setActiveTab("tableau")}>Tableau</button>
        </nav>
      </header>
      <div className="tab-content">
        {activeTab === "map" && <ChoroplethMap />}
        {activeTab === "tableau" && <Tableau />}
        {activeTab === "Bar Chart" && <DualBarChart dataUrl={"https://gist.githubusercontent.com/chaithuchowdhary/66e91b9faf1a3b91bf9ac22131dbf7cc/raw/82af525e5694cc96f5b518e90bb07c0459cf264d/income.csv"}/>}
      </div>
    </>
  );
}

export default App;