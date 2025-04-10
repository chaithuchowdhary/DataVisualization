import React, { useEffect, useState } from "react";
import ChoroplethMap from "./components/ChoroplethMap";
import Tableau from "./components/Tableau";
import "./App.css";
import DualBarChart from "./components/DualBarChart";
import HtmlViewer from "./components/Python";
import Python from "./components/Python";
import indexLine from './data/indexed_line.json'
import gantt from './data/gantt_chart.json'
import coxcomb from './data/coxcomb_chart.json'

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
          <button onClick={() => setActiveTab("python")}>Python Plots</button>
        </nav>
      </header>
      <div className="tab-content">
        {activeTab === "map" && <ChoroplethMap />}
        {activeTab === "tableau" && <Tableau />}
        {activeTab === "dualchart" && <DualBarChart dataUrl={"https://gist.githubusercontent.com/chaithuchowdhary/66e91b9faf1a3b91bf9ac22131dbf7cc/raw/82af525e5694cc96f5b518e90bb07c0459cf264d/income.csv"}/>}
        {activeTab === "python" && (
          <div>
            <h2>Python Plots</h2>
            <div>
            <Python data={indexLine} />
            </div>
            <div>
            <Python data={gantt} />
            </div>
            <div>
              <Python data={coxcomb} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;