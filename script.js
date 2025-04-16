// 🔹 Initialize the Leaflet map and configure basic settings 🔹
const map = L.map('map', {
    minZoom: 2,             
    maxZoom: 6              
  }).setView([20, 0], 2);   // Set initial center of the map (latitude, longitude) and zoom level limit
  
  // 🔹 Add a tile layer (Carto Light with country names), and disable map wrapping 🔹
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB, OpenStreetMap contributors',
    subdomains: 'abcd',
    maxZoom: 6,
    noWrap: true           
  }).addTo(map);
  
  // 🔹 Define the bounds of the map to prevent dragging too far outside the world 🔹
  map.setMaxBounds([
    [-85, -200],            // Southwest corner (latitude, longitude)
    [85, 200]               // Northeast corner (latitude, longitude)
  ]);
  
  // 🔹 Store fetched COVID-19 data for quick access by country name (converted to lowercase) 🔹
  const covidStats = {};
  
  
  // 🔹 Fetch COVID-19 statistics for all countries from RapidAPI 🔹
  async function fetchCovidData() {
    const res = await fetch('https://covid-193.p.rapidapi.com/statistics', {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'covid-193.p.rapidapi.com',
        'x-rapidapi-key': '7e48bfe591mshb66c96f89ff3ff7p17c20cjsnc40bfaceb909' // RapidAPI key
      }
    });
  
    const data = await res.json();
  
    // 🔹 Process each country's data and store it using lowercase country name as key 🔹
    for (const entry of data.response) {
      const name = entry.country;
      covidStats[name.toLowerCase()] = {
        cases: entry.cases?.total ?? 'N/A',
        recovered: entry.cases?.recovered ?? 'N/A',
        deaths: entry.deaths?.total ?? 'N/A'
      };
    }
  }
  
  
  //🔹 Load country boundaries (GeoJSON) and apply COVID data tooltips 🔹
   
  async function loadWorldMap() {
    await fetchCovidData(); // Step 1: Get COVID data before drawing map
  
    // Step 2: Load country boundary data (GeoJSON)
    const geoData = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
    const worldGeo = await geoData.json();
  
    // Step 3: Render the countries and apply interactivity
    const geoJsonLayer = L.geoJSON(worldGeo, {
      onEachFeature: (feature, layer) => {
        const countryName = feature.properties.name;
        let stats;
        
        //🔹 Individual checks for problematic countries 🔹
        if (countryName.toLowerCase() === "united states of america" || countryName.toLowerCase() === "united states") {
          stats = covidStats["usa"];
        } else if (countryName.toLowerCase() === "united kingdom") {
          stats = covidStats["uk"];
        } else if (countryName.toLowerCase() === "bosnia and herzegovina") {
          // Try multiple formats for Bosnia and Herzegovina
          if (covidStats["bosnia"]) {
            stats = covidStats["bosnia"];
          } else if (covidStats["bosnia-and-herzegovina"]) {
            stats = covidStats["bosnia-and-herzegovina"];
          } else {
            stats = covidStats["bosnia-herzegovina"];
          }
        } else if (countryName.toLowerCase() === "costa rica") {
          stats = covidStats["costa-rica"];
        } else if (countryName.toLowerCase() === "bahamas" || countryName.toLowerCase() === "the bahamas") {
          stats = covidStats["bahamas"];
        } else if (countryName.toLowerCase() === "new zealand") {
          stats = covidStats["new-zealand"];
        } else if (countryName.toLowerCase() === "papua new guinea") {
          stats = covidStats["papua-new-guinea"];
        } else if (countryName.toLowerCase() === "solomon islands") {
          stats = covidStats["solomon-islands"];
        } else if (countryName.toLowerCase() === "east timor" || countryName.toLowerCase() === "timor-leste") {
          stats = covidStats["timor-leste"];
        } else if (countryName.toLowerCase() === "south korea") {
          // Try multiple formats for South Korea
          if (covidStats["s-korea"]) {
            stats = covidStats["s-korea"];
          } else if (covidStats["south-korea"]) {
            stats = covidStats["south-korea"];
          } else {
            stats = covidStats["korea"];
          }
        } else if (countryName.toLowerCase() === "north korea") {
          // Try multiple formats for North Korea
          if (covidStats["n-korea"]) {
            stats = covidStats["n-korea"];
          } else if (covidStats["north-korea"]) {
            stats = covidStats["north-korea"];
          } else {
            stats = covidStats["dprk"];
          }
        } else if (countryName.toLowerCase() === "republic of serbia") {
          stats = covidStats["serbia"];
        } else if (countryName.toLowerCase() === "macedonia") {
          stats = covidStats["north-macedonia"];
        } else if (countryName.toLowerCase() === "czech republic") {
          stats = covidStats["czechia"];
        } else if (countryName.toLowerCase() === "united arab emirates") {
          stats = covidStats["uae"];
        } else if (countryName.toLowerCase() === "democratic republic of congo" || countryName.toLowerCase() === "democratic republic of the congo") {
          // Try multiple formats for Democratic of Congo
          if (covidStats["dr-congo"]) {
            stats = covidStats["dr-congo"];
          } else if (covidStats["drc"]) {
            stats = covidStats["drc"];
          } else if (covidStats["democratic-republic-of-congo"]) {
            stats = covidStats["democratic-republic-of-congo"];
          } else {
            stats = covidStats["congo-kinshasa"];
          }
        } else if (countryName.toLowerCase() === "west sahara" || countryName.toLowerCase() === "western sahara") {
          stats = covidStats["western-sahara"];
        } else if (countryName.toLowerCase() === "sierra leone") {
          stats = covidStats["sierra-leone"];
        } else if (countryName.toLowerCase() === "burkina faso") {
          stats = covidStats["burkina-faso"];
        } else if (countryName.toLowerCase() === "ivory coast" || countryName.toLowerCase() === "côte d'ivoire") {
          // Try multiple formats for Ivory Coast
          if (covidStats["ivory-coast"]) {
            stats = covidStats["ivory-coast"];
          } else if (covidStats["cote-divoire"]) {
            stats = covidStats["cote-divoire"];
          } else {
            stats = covidStats["cote-d'ivoire"];
          }
        } else if (countryName.toLowerCase() === "central african republic") {
          // Try multiple formats for Central African Republic
          if (covidStats["car"]) {
            stats = covidStats["car"];
          } else if (covidStats["central-african-rep"]) {
            stats = covidStats["central-african-rep"];
          } else {
            stats = covidStats["central-african-republic"];
          }
        } else if (countryName.toLowerCase() === "equatorial guinea") {
          stats = covidStats["equatorial-guinea"];
        } else if (countryName.toLowerCase() === "republic of congo" || countryName.toLowerCase() === "congo republic") {
          
          if (covidStats["republic-of-congo"]) {
            stats = covidStats["republic-of-congo"];
          } else if (covidStats["congo-brazzaville"]) {
            stats = covidStats["congo-brazzaville"];
          } else if (covidStats["congo-republic"]) {
            stats = covidStats["congo-republic"];
          } else if (covidStats["congo"]) {
            stats = covidStats["congo"];
          } else {
            // Last fallback for Republic of Congo
            stats = {
              cases: "Data unavailable",
              recovered: "Data unavailable",
              deaths: "Data unavailable"
            };
          }
        } else if (countryName.toLowerCase() === "guinea bissau") {
          // Try multiple formats for Guinea-Bissau
          if (covidStats["guinea-bissau"]) {
            stats = covidStats["guinea-bissau"];
          } else {
            stats = covidStats["guinea bissau"];
          }
        } else if (countryName.toLowerCase() === "south sudan") {
          stats = covidStats["south-sudan"];
        } else if (countryName.toLowerCase() === "somaliland") {
          stats = covidStats["somalia"];
        } else if (countryName.toLowerCase() === "swaziland") {
          stats = covidStats["eswatini"];
        } else if (countryName.toLowerCase() === "south africa") {
          stats = covidStats["south-africa"];
        } else if (countryName.toLowerCase() === "united republic of tanzania" || countryName.toLowerCase() === "tanzania") {
          stats = covidStats["tanzania"];
        } else if (countryName.toLowerCase() === "falkland islands") {
          stats = covidStats["falkland-islands"];
        } else if (countryName.toLowerCase() === "french guiana") {
          stats = covidStats["french-guiana"];
        } else if (countryName.toLowerCase() === "el salvador") {
          stats = covidStats["el-salvador"];
        } else if (countryName.toLowerCase() === "dominican republic") {
          stats = covidStats["dominican-republic"];
        } else if (countryName.toLowerCase() === "puerto rico") {
          // Try multiple variations for Puerto Rico
          if (covidStats["puerto-rico"]) {
            stats = covidStats["puerto-rico"];
          } else if (covidStats["puerto rico"]) {
            stats = covidStats["puerto rico"];
          } else {
            // Fallback to using USA stats as Puerto Rico may be grouped with the US
            stats = covidStats["usa"];
          }
        } else if (countryName.toLowerCase() === "saudi arabia") {
          stats = covidStats["saudi-arabia"];
        } else if (countryName.toLowerCase() === "kosovo") {
          // Try multiple formats for Kosovo
          if (covidStats["republic-of-kosovo"]) {
            stats = covidStats["republic-of-kosovo"];
          } else if (covidStats["kosovo"]) {
            stats = covidStats["kosovo"];
          } else {
            // If Kosovo isn't found, use Serbia stats as fallback
            stats = covidStats["serbia"];
          }
        } else if (countryName.toLowerCase() === "northern cyprus") {
          // Northern Cyprus may be listed under either Cyprus or Turkey
          if (covidStats["northern-cyprus"]) {
            stats = covidStats["northern-cyprus"];
          } else if (covidStats["north-cyprus"]) {
            stats = covidStats["north-cyprus"];
          } else {
            // Fallback to Cyprus
            stats = covidStats["cyprus"];
          }
        } else if (countryName.toLowerCase() === "west bank" || countryName.toLowerCase() === "gaza" || countryName.toLowerCase() === "palestine") {
          // Try various names for Palestinian territories
          if (covidStats["palestine"]) {
            stats = covidStats["palestine"];
          } else if (covidStats["palestinian-territory"]) {
            stats = covidStats["palestinian-territory"];
          } else if (covidStats["west-bank"]) {
            stats = covidStats["west-bank"];
          } else {
            stats = covidStats["palestine-state"];
          }
        } else if (countryName.toLowerCase() === "turkmenistan") {
          // Try multiple formats or fallback to a neighboring country if no data
          if (covidStats["turkmenistan"]) {
            stats = covidStats["turkmenistan"];
          } else {
            // If no data is available (Turkmenistan has reported very few cases), 
            // use placeholder
            stats = {
              cases: "Limited data",
              recovered: "Limited data",
              deaths: "Limited data"
            };
          }
        } else if (countryName.toLowerCase() === "new caledonia") {
          stats = covidStats["new-caledonia"];
        } else if (countryName.toLowerCase() === "sri lanka") {
          stats = covidStats["sri-lanka"];
        } else {
          // Default fallback to original method
          stats = covidStats[countryName.toLowerCase()];
        }
            
        // 🔹 Show tooltip for every country — even if data is missing 🔹
        layer.bindTooltip(() => {
          if (stats) {
            return `
              <div class="tooltip-content">
                <strong>${countryName}</strong><br />
                Cases: ${stats.cases}<br />
                Recovered: ${stats.recovered}<br />
                Deaths: ${stats.deaths}
              </div>
            `;
          } else {
            return `
              <div class="tooltip-content">
                <strong>${countryName}</strong><br />
                No COVID-19 data available.
              </div>
            `;
          }
        }, { sticky: true });
  
        // 🔹 Add consistent hover style for all countries 🔹
        layer.on({
          mouseover: () => layer.setStyle({ fillColor: '#ff8800', fillOpacity: 0.5 }),
          mouseout: () => layer.setStyle({ fillColor: '#0077b6', fillOpacity: 0.3 })
        });
      },
  
      // 🔹 Default country polygon style 🔹
      style: {
        color: '#666',          // Border color
        weight: 0.5,            // Border width
        fillColor: '#0077b6',   // Default fill color
        fillOpacity: 0.3        // Default transparency
      }
    }).addTo(map);
  
    // Step 4: Auto-fit map to show all country boundaries 
    map.fitBounds(geoJsonLayer.getBounds());
  }
  
  // 🔹 Entry point: load the map and data 🔹
  loadWorldMap();
  