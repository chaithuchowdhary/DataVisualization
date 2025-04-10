import React from 'react';
import Plot from 'react-plotly.js';

const Python = ({ data }) => {
  return (
    <>
      {data ? (
        <Plot
          data={data.data}
          layout={data.layout}
          config={data.config || {}}
        />
      ) : (
        <p>Loading chart...</p>
      )}
    </>
  );
};

export default Python;
