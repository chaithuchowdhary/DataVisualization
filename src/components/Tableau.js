import React, { useRef, useEffect } from 'react';

const Tableau = () => {
  
  const containerRef = useRef(null);
  const htmlContent = `
    <div class='tableauPlaceholder' id='viz1744229295000' style='position: relative'>
      <noscript>
        <a href='#'>
          <img alt='Analysis of House Prices and How income affecting purchasing power'
               src='https://public.tableau.com/static/images/An/AnalysisofHousePrice_17441589744680/AnalysisofHousePricesandHowincomeaffectingpurchasingpower/1_rss.png'
               style='border: none' />
        </a>
      </noscript>
      <object class='tableauViz' style='display:none;'>
        <param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' />
        <param name='embed_code_version' value='3' />
        <param name='site_root' value='' />
        <param name='name' value='AnalysisofHousePrice_17441589744680/AnalysisofHousePricesandHowincomeaffectingpurchasingpower' />
        <param name='tabs' value='no' />
        <param name='toolbar' value='yes' />
        <param name='static_image'
               value='https://public.tableau.com/static/images/An/AnalysisofHousePrice_17441589744680/AnalysisofHousePricesandHowincomeaffectingpurchasingpower/1.png' />
        <param name='animate_transition' value='yes' />
        <param name='display_static_image' value='yes' />
        <param name='display_spinner' value='yes' />
        <param name='display_overlay' value='yes' />
        <param name='display_count' value='yes' />
        <param name='language' value='en-US' />
      </object>
    </div>
  `;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const divElement = container.querySelector('#viz1744229295000');
    if (!divElement) return;

    const vizElement = divElement.getElementsByTagName('object')[0];
    if (vizElement) {
      vizElement.style.width = '100%';
      vizElement.style.height = (divElement.offsetWidth * 0.75) + 'px';

      
      const scriptElement = document.createElement('script');
      scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
      vizElement.parentNode.insertBefore(scriptElement, vizElement);
    }
  }, []);

  return (
    <div ref={containerRef} dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
};

export default Tableau;
