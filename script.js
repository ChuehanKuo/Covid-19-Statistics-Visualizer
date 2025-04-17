// 🔹 Initialize the Leaflet map and configure basic settings 🔹
const map = L.map('map', { //creates leaflet map inside 'map' in html
    minZoom: 2.49, //limit the minimum and maximum zoom level
    maxZoom: 6              
  }).setView([35, 0], 2); //center the map




// 🔹 Add the base map(country names, borders, etc) the non-interactive parts, from OpenStreetMap 🔹
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB, OpenStreetMap contributors', //credit the creators
    subdomains: 'abcd', //for faster loading, request rotate across abcd
    maxZoom: 6,
    noWrap: true //stop map wrapping, so map won't repeat at the edges      
  }).addTo(map);


  

// 🔹 Define the bounds of the map to prevent dragging too far outside the world 🔹
map.setMaxBounds([
  [-85, -180],            // Southwest corner (latitude, longitude)
  [85, 180]               // Northeast corner (latitude, longitude)
]);

 
  
// 🔹 Store fetched COVID-19 data for quick access by country name (converted to lowercase) 🔹 
  const covidStats = {};




// 🔹 Function to update global statistics 🔹
function updateGlobalStats() {
  let totalCases = 0;
  let totalRecovered = 0;
  let totalDeaths = 0;
  
  for (const country in covidStats) {    
    const stats = covidStats[country];    
    if (typeof stats.cases === 'number') totalCases += stats.cases;
    if (typeof stats.recovered === 'number') totalRecovered += stats.recovered;
    if (typeof stats.deaths === 'number') totalDeaths += stats.deaths;
  }
  const formatNumber = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  document.getElementById('global-cases').textContent = formatNumber(totalCases);
  document.getElementById('global-recovered').textContent = formatNumber(totalRecovered);
  document.getElementById('global-deaths').textContent = formatNumber(totalDeaths);
  document.getElementById('last-updated').textContent = new Date().toLocaleString();
}




// 🔹 Fetch COVID-19 statistics for all countries from disease.sh 🔹
async function fetchCovidData() {
  const res = await fetch('https://disease.sh/v3/covid-19/countries');
  const data = await res.json(); //turn json data into js data

  data.forEach(entry => {
    const name = entry.country;
    covidStats[name.toLowerCase()] = { //store data in lower case for easier matching
      cases: entry.cases ?? 'N/A', //if there is data, show. If there isn't show N/A
      recovered: entry.recovered ?? 'N/A',
      deaths: entry.deaths ?? 'N/A',
      flag: entry.countryInfo?.flag ?? null //shows the flag
    };
  });
}




// 🔹 Load country flags faster 🔹
function preloadFlags() {
  //loop through all countries we have data for
  for (const country in covidStats) {
    //if the country has a flag URL
    if (covidStats[country].flag) {
      //create an image element to preload it
      const img = new Image();
      img.src = covidStats[country].flag;
    }
  }
}




//🔹 Load country boundaries (GeoJSON) and apply COVID data tooltips 🔹   
  async function loadWorldMap() {
    await fetchCovidData(); // Step 1: Get COVID data before drawing map
    updateTopCountries();

    preloadFlags(); //call the preload flag function
  
    // Step 2: Load country boundary data (GeoJSON) //using premade GeoJSON data from github
    const geoData = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
    const worldGeo = await geoData.json();
  
    // Step 3: Render the countries and apply interactivity
    const geoJsonLayer = L.geoJSON(worldGeo, {
      onEachFeature: (feature, layer) => {
      
      const countryName = feature.properties.name;
      let stats;




//🔹 Individual checks for problematic countries 🔹
    
    /*
    Due to some countries having different id names for the api and GeoJSON(map). This if-tree goes through all possible
    id names, trying to link the api and map. If not found, fallback to most possible country, or else, 
    use placeholder showing limited info.
    */

        //Check USA
        if (countryName.toLowerCase() === "united states of america" || countryName.toLowerCase() === "united states") {
          stats = covidStats["usa"];
        
        //Check UK
        }else if (countryName.toLowerCase() === "united kingdom") {
          stats = covidStats["uk"];

        //Check Bosnia and Herzegovina
        }else if (countryName.toLowerCase() === "bosnia and herzegovina") {          
          if (covidStats["bosnia"]) {
            stats = covidStats["bosnia"];
          }else if (covidStats["bosnia-and-herzegovina"]) {
            stats = covidStats["bosnia-and-herzegovina"];
          }else {
            stats = covidStats["bosnia-herzegovina"];
          }

        //Check Costa Rica
        }else if (countryName.toLowerCase() === "costa rica") {
          if (covidStats["costa-rica"]) {
            stats = covidStats["costa-rica"];
          } else if (covidStats["costa rica"]) {
            stats = covidStats["costa rica"];
          } else if (covidStats["costarica"]) {
            stats = covidStats["costarica"];
          } else {          
            stats = covidStats["cri"]; 
          }

        //Check The Bahamas
        }else if (countryName.toLowerCase() === "bahamas" || countryName.toLowerCase() === "the bahamas") {
          stats = covidStats["bahamas"];

        //Check New Zealand
        }else if (countryName.toLowerCase() === "new zealand") {
          if (covidStats["new-zealand"]) {
            stats = covidStats["new-zealand"];
          }else if (covidStats["new zealand"]) {
            stats = covidStats["new zealand"];
          }

        //Check Papua New Guinea
        }else if (countryName.toLowerCase() === "papua new guinea") {          
          if (covidStats["papua-new-guinea"]) {
            stats = covidStats["papua-new-guinea"];
          } else if (covidStats["papua new guinea"]) {
            stats = covidStats["papua new guinea"];
          }

        //Check Solomon Islands
        } else if (countryName.toLowerCase() === "solomon islands") {
          if (covidStats["solomon-islands"]) {
            stats = covidStats["solomon-islands"];
          } else if (covidStats["solomon islands"]) {
            stats = covidStats["solomon islands"];
          }
        
        //Check East Timor
        } else if (countryName.toLowerCase() === "east timor" || countryName.toLowerCase() === "timor-leste") {
          stats = covidStats["timor-leste"];

        //Check Republic of Serbia
        } else if (countryName.toLowerCase() === "republic of serbia") {
          stats = covidStats["serbia"];

        //Check Macedonia
        } else if (countryName.toLowerCase() === "macedonia") {
          if (covidStats["north-macedonia"]) {
            stats = covidStats["north-macedonia"];
          } else if (covidStats["macedonia"]) {
            stats = covidStats["macedonia"];
          } else if (covidStats["republic of north macedonia"]) {
            stats = covidStats["republic of north macedonia"];
          }
        
        //Check Czech Republic
        } else if (countryName.toLowerCase() === "czech republic") {
          stats = covidStats["czechia"];

        //Check United Arab Emirates
        } else if (countryName.toLowerCase() === "united arab emirates") {
          stats = covidStats["uae"];

        //Check Democratic Republic of Congo
        } else if (countryName.toLowerCase() === "democratic republic of congo" || countryName.toLowerCase() === "democratic republic of the congo") {
          if (covidStats["dr-congo"]) {
            stats = covidStats["dr-congo"];
          } else if (covidStats["drc"]) {
            stats = covidStats["drc"];
          } else if (covidStats["democratic-republic-of-congo"]) {
            stats = covidStats["democratic-republic-of-congo"];
          } else {
            stats = covidStats["congo-kinshasa"];
          }

        //Check West Sahara
        } else if (countryName.toLowerCase() === "west sahara" || countryName.toLowerCase() === "western sahara") {
          if (covidStats["western-sahara"]) {
            stats = covidStats["western-sahara"];
          } else if (covidStats["western sahara"]) {
            stats = covidStats["western sahara"];
          } else if (covidStats["west-sahara"]) {
            stats = covidStats["west-sahara"];
          } else if (covidStats["w-sahara"]) {
            stats = covidStats["w-sahara"];
          } else if (covidStats["sahrawi"]) {
            stats = covidStats["sahrawi"];
          } else {
            stats = covidStats["esh"];
          }

        //Check Sierra Leone
        } else if (countryName.toLowerCase() === "sierra leone") {
          if (covidStats["sierra-leone"]) {
            stats = covidStats["sierra-leone"];
          } else if (covidStats["sierra leone"]) {
            stats = covidStats["sierra leone"];
          } else if (covidStats["sierraleone"]) {
            stats = covidStats["sierraleone"];
          } else {
            stats = covidStats["sle"];
          }

        //Check Burkina Faso
        } else if (countryName.toLowerCase() === "burkina faso") {
          if (covidStats["burkina-faso"]) {
            stats = covidStats["burkina-faso"];
          } else if (covidStats["burkina faso"]) {
            stats = covidStats["burkina faso"];
          } else if (covidStats["burkinafaso"]) {
            stats = covidStats["burkinafaso"];
          } else if (covidStats["burkina"]) {
            stats = covidStats["burkina"];
          } else {
            stats = covidStats["bfa"];
          }

        //Check Ivory Coast
        } else if (countryName.toLowerCase() === "ivory coast" || countryName.toLowerCase() === "côte d'ivoire") {
          if (covidStats["ivory-coast"]) {
            stats = covidStats["ivory-coast"];
          } else if (covidStats["cote-divoire"]) {
            stats = covidStats["cote-divoire"];
          } else if (covidStats["cote-d'ivoire"]) {
            stats = covidStats["cote-d'ivoire"];
          } else if (covidStats["ivory coast"]) {
            stats = covidStats["ivory coast"];
          } else if (covidStats["côte d'ivoire"]) {
            stats = covidStats["côte d'ivoire"];
          } else if (covidStats["cote divoire"]) {
            stats = covidStats["cote divoire"];
          } else if (covidStats["ivorycoast"]) {
            stats = covidStats["ivorycoast"];
          } else {
            stats = covidStats["civ"];
          }

        //Check Central African Republic
        } else if (countryName.toLowerCase() === "central african republic") {
          if (covidStats["car"]) {
            stats = covidStats["car"];
          } else if (covidStats["central-african-rep"]) {
            stats = covidStats["central-african-rep"];
          } else if (covidStats["central-african-republic"]) {
            stats = covidStats["central-african-republic"];
          } else if (covidStats["central african republic"]) {
            stats = covidStats["central african republic"];
          } else {
            stats = covidStats["caf"];
          }

        //Check Equatorial Guinea
        } else if (countryName.toLowerCase() === "equatorial guinea") {
          if (covidStats["equatorial-guinea"]) {
            stats = covidStats["equatorial-guinea"];
          } else if (covidStats["equatorial guinea"]) {
            stats = covidStats["equatorial guinea"];
          } else if (covidStats["equatorialguinea"]) {
            stats = covidStats["equatorialguinea"];
          } else if (covidStats["eq-guinea"]) {
            stats = covidStats["eq-guinea"];
          } else {
            stats = covidStats["gnq"];
          }

        //Check Guinea Bissau
        } else if (countryName.toLowerCase() === "guinea bissau") {
          if (covidStats["guinea-bissau"]) {
            stats = covidStats["guinea-bissau"];
          } else {
            stats = covidStats["guinea bissau"];
          }

        //Check South Sudan
        } else if (countryName.toLowerCase() === "south sudan") {
          if (covidStats["south-sudan"]) {
            stats = covidStats["south-sudan"];
          } else if (covidStats["south sudan"]) {
            stats = covidStats["south sudan"];
          } else if (covidStats["s-sudan"]) {
            stats = covidStats["s-sudan"];
          } else if (covidStats["southsudan"]) {
            stats = covidStats["southsudan"];
          } else {
            stats = covidStats["ssd"];
          }

        //Check Somaliland --> data merged with somalia
        } else if (countryName.toLowerCase() === "somaliland") {
          stats = covidStats["somalia"];
        } else if (countryName.toLowerCase() === "swaziland") {
          if (covidStats["eswatini"]) {
            stats = covidStats["eswatini"];
          } else if (covidStats["swaziland"]) {
            stats = covidStats["swaziland"];
          } else if (covidStats["kingdom of eswatini"]) {
            stats = covidStats["kingdom of eswatini"];
          } else if (covidStats["kingdom-of-eswatini"]) {
            stats = covidStats["kingdom-of-eswatini"];
          } else {
            stats = covidStats["swz"];
          }

        //Check South Africa
        } else if (countryName.toLowerCase() === "south africa") {
          if (covidStats["south-africa"]) {
            stats = covidStats["south-africa"];
          } else if (covidStats["south africa"]) {
            stats = covidStats["south africa"];
          } else if (covidStats["s-africa"]) {
            stats = covidStats["s-africa"];
          } else if (covidStats["southafrica"]) {
            stats = covidStats["southafrica"];
          } else {
            stats = covidStats["zaf"];
          }

        //Check Republic of Tanzania
        } else if (countryName.toLowerCase() === "united republic of tanzania" || countryName.toLowerCase() === "tanzania") {
          stats = covidStats["tanzania"];

        //Check French Southern and Antarctic Lands --> found no data
        } else if (countryName.toLowerCase() === "french southern and antarctic lands") {
          if (covidStats["french southern territories"]) {
            stats = covidStats["french southern territories"];
          } else if (covidStats["french southern and antarctic lands"]) {
            stats = covidStats["french southern and antarctic lands"];
          } else {
            stats = covidStats["french southern territories"];
          }
        
        //Check Falkland Islands
        } else if (countryName.toLowerCase() === "falkland islands") {
          if (covidStats["falkland-islands"]) {
            stats = covidStats["falkland-islands"];
          } else if (covidStats["falkland islands"]) {
            stats = covidStats["falkland islands"];
          } else if (covidStats["falkland islands (malvinas)"]) {
            stats = covidStats["falkland islands (malvinas)"];
          }
        
        //Check French Guiana
        } else if (countryName.toLowerCase() === "french guiana") {
          if (covidStats["french-guiana"]) {
            stats = covidStats["french-guiana"];
          } else if (covidStats["french guiana"]) {
            stats = covidStats["french guiana"];
          }
        
        //Check El Salvador
        } else if (countryName.toLowerCase() === "el salvador") {
          if (covidStats["el-salvador"]) {
            stats = covidStats["el-salvador"];
          } else if (covidStats["el salvador"]) {
            stats = covidStats["el salvador"];
          }
        
        //Check Dominican Republic
        } else if (countryName.toLowerCase() === "dominican republic") {
          if (covidStats["dominican-republic"]) {
            stats = covidStats["dominican-republic"];
          } else if (covidStats["dominican republic"]) {
            stats = covidStats["dominican republic"];
          }

        //Check Puerto Rico --> territory of the US, merged with US data
        } else if (countryName.toLowerCase() === "puerto rico") {
          if (covidStats["puerto-rico"]) {
            stats = covidStats["puerto-rico"];
          } else if (covidStats["puerto rico"]) {
            stats = covidStats["puerto rico"];
          } else {
            // If Puerto Rico isn't found, fallback to USA
            stats = covidStats["usa"]; //--> true
          }

        //Check Saudi Arabia
        } else if (countryName.toLowerCase() === "saudi arabia") {
          if (covidStats["saudi-arabia"]) {
            stats = covidStats["saudi-arabia"];
          } else if (covidStats["saudi arabia"]) {
            stats = covidStats["saudi arabia"];
          } else if (covidStats["ksa"]) {
            stats = covidStats["ksa"];
          }

        //Check Kosovo
        } else if (countryName.toLowerCase() === "kosovo") {
          if (covidStats["republic-of-kosovo"]) {
            stats = covidStats["republic-of-kosovo"];
          } else if (covidStats["kosovo"]) {
            stats = covidStats["kosovo"];
          } else {
            // If Kosovo isn't found, use Serbia stats as fallback
            stats = covidStats["serbia"]; //--> false
          }

        //Check Northern Cyprus
        } else if (countryName.toLowerCase() === "northern cyprus") {
          // Northern Cyprus may be listed under either Cyprus or Turkey
          if (covidStats["northern-cyprus"]) {
            stats = covidStats["northern-cyprus"];
          } else if (covidStats["north-cyprus"]) {
            stats = covidStats["north-cyprus"];
          } else {
            // Fallback to Cyprus
            stats = covidStats["cyprus"]; //--> true
          }

        //Check West Bank
        } else if (countryName.toLowerCase() === "west bank" || countryName.toLowerCase() === "gaza" || countryName.toLowerCase() === "palestine") {
          if (covidStats["palestine"]) {
            stats = covidStats["palestine"];
          } else if (covidStats["palestinian-territory"]) {
            stats = covidStats["palestinian-territory"];
          } else if (covidStats["west-bank"]) {
            stats = covidStats["west-bank"];
          } else {
            stats = covidStats["palestine-state"];
          }

        //Check Libya
        } else if (countryName.toLowerCase() === "libya") {
          if (covidStats["libya"]) {
            stats = covidStats["libya"];
          } else if (covidStats["libyan arab jamahiriya"]) {
            stats = covidStats["libyan arab jamahiriya"];
          }

        //Check Syria
        } else if (countryName.toLowerCase() === "syria") {
          if (covidStats["syria"]) {
            stats = covidStats["syria"];
          } else if (covidStats["syrian arab republic"]) {
            stats = covidStats["syrian arab republic"];
          } else {
            stats = covidStats["syrian-arab-republic"];
          }

        //Check Turkmenistan
        } else if (countryName.toLowerCase() === "turkmenistan") {
          if (covidStats["turkmenistan"]) {
            stats = covidStats["turkmenistan"];
          } else {
            // If no data is available (Turkmenistan has reported very few cases), 
            // use placeholder limited data
            stats = { //--> true
              cases: "Limited data",
              recovered: "Limited data",
              deaths: "Limited data"
            }
          }

        //Check Laos
        } else if (countryName.toLowerCase() === "laos") {
          if (covidStats["laos"]) {
            stats = covidStats["laos"];
          } else if (covidStats["lao"]) {
            stats = covidStats["lao"];
          } else if (covidStats["lao people's democratic republic"]) {
            stats = covidStats["lao people's democratic republic"];
          }

        //Check New Caledonia
        } else if (countryName.toLowerCase() === "new caledonia") {
          if (covidStats["new-caledonia"]) {
            stats = covidStats["new-caledonia"];
          } else if (covidStats["new caledonia"]) {
            stats = covidStats["new caledonia"];
          }

        //Check Sri Lanka
        } else if (countryName.toLowerCase() === "sri lanka") {
          if (covidStats["sri-lanka"]) {
            stats = covidStats["sri-lanka"];
          } else if (covidStats["sri lanka"]) {
            stats = covidStats["sri lanka"];          
          }

        //Check Antarctica
        }else if (countryName.toLowerCase() === "antarctica") {
          if (covidStats["antarctica"]) {
            stats = covidStats["antarctica"];
          }else {
            stats = { //--> true
              cases: "Limited data",
              recovered: "Limited data",
              deaths: "Limited data"
            };
          }

        //Check Republic of Congo --> Still can't find the right id. Show no covid19 data.
        }else if (countryName.toLowerCase() === "republic of congo" || 
        countryName.toLowerCase() === "congo republic" || 
        countryName.toLowerCase() === "congo-brazzaville" ||
        countryName.toLowerCase() === "congo brazzaville") {
        if (covidStats["republic-of-congo"]) {
        stats = covidStats["republic-of-congo"];
        } else if (covidStats["congo-brazzaville"]) {
        stats = covidStats["congo-brazzaville"];
        } else if (covidStats["congo-republic"]) {
        stats = covidStats["congo-republic"];
        } else if (covidStats["congo"]) {
        stats = covidStats["congo"];
        } else if (covidStats["republic of congo"]) {
        stats = covidStats["republic of congo"];
        } else if (covidStats["republicofcongo"]) {
        stats = covidStats["republicofcongo"];
        } else if (covidStats["rep of congo"]) {
        stats = covidStats["rep of congo"];
        } else if (covidStats["republic congo"]) {
        stats = covidStats["republic congo"];
        } else if (covidStats["r.o.c."]) {
        stats = covidStats["r.o.c."];
        } else if (covidStats["roc"]) {
        stats = covidStats["roc"];
        } else if (covidStats["brazzaville"]) {
        stats = covidStats["brazzaville"];
        } else if (covidStats["people's republic of congo"]) {
        stats = covidStats["people's republic of congo"];
        } else if (covidStats["peoples republic of congo"]) {
        stats = covidStats["peoples republic of congo"];
        } else if (covidStats["rep. congo"]) {
        stats = covidStats["rep. congo"];
        } else if (covidStats["rep.congo"]) {
        stats = covidStats["rep.congo"];
        } else if (covidStats["republic-congo"]) {
        stats = covidStats["republic-congo"];
        } else if (covidStats["congo (brazzaville)"]) {
        stats = covidStats["congo (brazzaville)"];
        } else if (covidStats["congo(brazzaville)"]) {
        stats = covidStats["congo(brazzaville)"];
        } else {
        stats = covidStats["cog"];}

        //Check South Korea
        }else if (countryName.toLowerCase() === "south korea" || 
        countryName.toLowerCase() === "republic of korea" ||
        countryName.toLowerCase() === "korea, republic of") {
        if (covidStats["s-korea"]) {
        stats = covidStats["s-korea"];
        } else if (covidStats["south-korea"]) {
        stats = covidStats["south-korea"];
        } else if (covidStats["korea, south"]) {
        stats = covidStats["korea, south"];
        } else if (covidStats["south korea"]) {
        stats = covidStats["south korea"];
        } else if (covidStats["korea"]) {
        stats = covidStats["korea"];
        } else if (covidStats["republic of korea"]) {
        stats = covidStats["republic of korea"];
        } else if (covidStats["republic-of-korea"]) {
        stats = covidStats["republic-of-korea"];
        } else if (covidStats["southkorea"]) {
        stats = covidStats["southkorea"];
        } else if (covidStats["skorea"]) {
        stats = covidStats["skorea"];
        } else if (covidStats["kor. south"]) {
        stats = covidStats["kor. south"];
        } else if (covidStats["korea south"]) {
        stats = covidStats["korea south"];
        } else if (covidStats["korea(south)"]) {
        stats = covidStats["korea(south)"];
        } else if (covidStats["korea (south)"]) {
        stats = covidStats["korea (south)"];
        } else if (covidStats["rok"]) {
        stats = covidStats["rok"];
        } else if (covidStats["korea, rep."]) {
        stats = covidStats["korea, rep."];
        } else if (covidStats["korea,rep"]) {
        stats = covidStats["korea,rep"];
        } else if (covidStats["korea, republic of"]) {
        stats = covidStats["korea, republic of"];
        } else if (covidStats["korea republic"]) {
        stats = covidStats["korea republic"];
        } else if (covidStats["korea, rep"]) {
        stats = covidStats["korea, rep"];
        } else if (covidStats["korea rep"]) {
        stats = covidStats["korea rep"];
        } else if (covidStats["republic korea"]) {
        stats = covidStats["republic korea"];
        } else if (covidStats["s. korea"]) {
        stats = covidStats["s. korea"];
        } else if (covidStats["s.korea"]) {
        stats = covidStats["s.korea"];
        } else {
        stats = covidStats["kor"];
        }
        
        //Check North Korea
        }else if (countryName.toLowerCase() === "north korea" || 
        countryName.toLowerCase() === "democratic people's republic of korea" || 
        countryName.toLowerCase() === "democratic peoples republic of korea") {
        if (covidStats["n-korea"]) {
        stats = covidStats["n-korea"];
        } else if (covidStats["north-korea"]) {
        stats = covidStats["north-korea"];
        } else if (covidStats["korea, north"]) {
        stats = covidStats["korea, north"];
        } else if (covidStats["north korea"]) {
        stats = covidStats["north korea"];
        } else if (covidStats["dprk"]) {
        stats = covidStats["dprk"];
        } else if (covidStats["democratic people's republic of korea"]) {
        stats = covidStats["democratic people's republic of korea"];
        } else if (covidStats["democratic peoples republic of korea"]) {
        stats = covidStats["democratic peoples republic of korea"];
        } else if (covidStats["democratic-peoples-republic-of-korea"]) {
        stats = covidStats["democratic-peoples-republic-of-korea"];
        } else if (covidStats["democratic-people's-republic-of-korea"]) {
        stats = covidStats["democratic-people's-republic-of-korea"];
        } else if (covidStats["northkorea"]) {
        stats = covidStats["northkorea"];
        } else if (covidStats["nkorea"]) {
        stats = covidStats["nkorea"];
        } else if (covidStats["korea(north)"]) {
        stats = covidStats["korea(north)"];
        } else if (covidStats["korea (north)"]) {
        stats = covidStats["korea (north)"];
        } else if (covidStats["korea north"]) {
        stats = covidStats["korea north"];
        } else if (covidStats["kor. north"]) {
        stats = covidStats["kor. north"];
        } else if (covidStats["democratic korea"]) {
        stats = covidStats["democratic korea"];
        } else if (covidStats["n. korea"]) {
        stats = covidStats["n. korea"];
        } else if (covidStats["n.korea"]) {
        stats = covidStats["n.korea"];
        } else if (covidStats["korea dem. rep."]) {
        stats = covidStats["korea dem. rep."];
        } else if (covidStats["korea, dem. rep."]) {
        stats = covidStats["korea, dem. rep."];
        } else if (covidStats["korea, dem. people's rep."]) {
        stats = covidStats["korea, dem. people's rep."];
        } else if (covidStats["korea, democratic people's republic of"]) {
        stats = covidStats["korea, democratic people's republic of"];
        } else {
        stats = covidStats["prk"];}
          /*
          !!This line is important. Default fallback if none of the if and if-else statements work.
          If none work, change geoJSON id to lowercase to match API id.
          */
        }else {  
          stats = covidStats[countryName.toLowerCase()];
        }

          /*
        Country check summary: Republic of Congo, South Korea, North Korea took a lot more effort,
        but still couldn't find Republic of Congo's corresponding id.
        */

      


//🔹 Global statistics on the top bar 🔹
        updateGlobalStats();

        


// 🔹 Show tooltip for every country — even if data is missing 🔹  !!!Important (show data part)
        //tooltip is the box that shows up when hovered over
        layer.bindTooltip(() => { //attach tooltip to country layer(GeoJSON)
          if (stats) { //if there is stats, stats=true, then continue
            return `
              <div class="tooltip-content">
                <strong>${countryName}</strong><br />
                ${stats.flag ? `<img src="${stats.flag}" alt="${countryName} flag" width="30"><br />` : ''}
                Cases: ${stats.cases}<br />
                Recovered: ${stats.recovered}<br />
                Deaths: ${stats.deaths}
              </div>
            `;
          } else { //if data is missing show this
            return `
              <div class="tooltip-content">
                <strong>${countryName}</strong><br />
                No COVID-19 data available.
              </div>
            `;
          }
        }, { sticky: true }); //!!Important. Makes tooltip follow cursor.
  



// 🔹 Hover Style, When hovered over--> show orange, when default --> light blue 🔹
        layer.on({
          mouseover: () => layer.setStyle({ fillColor: '#ff8800', fillOpacity: 0.5 }), //orange
          mouseout: () => layer.setStyle({ fillColor: '#0077b6', fillOpacity: 0.3 }) //light blue
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

    //map.fitBounds(geoJsonLayer.getBounds()); //removed
  }




  // 🔹 Update top countries list(left sidebar) 🔹

function updateTopCountries() {
  // Create an array from the covidStats object
  const countriesArray = Object.entries(covidStats).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize country's first letter
    cases: typeof data.cases === 'number' ? data.cases : 0
  }));
  
  // Sort by cases (highest first)
  countriesArray.sort((a, b) => b.cases - a.cases);
  
  // Get top 5
  const topFive = countriesArray.slice(0, 5);
  
  // Update the HTML
  const listElement = document.getElementById('top-countries-list');
  listElement.innerHTML = '';
  
  topFive.forEach(country => {
    const item = document.createElement('div');
    item.className = 'country-item';
    item.innerHTML = `<strong>${country.name}</strong>: ${country.cases.toLocaleString()}`;
    listElement.appendChild(item);
  });
}



  // 🔹 Load the map and data 🔹
loadWorldMap();




// 🔹 Automatically updates the Covid-19 data, so user see up-to-date info 🔹
//!!!Important
setInterval(async () => {
  await fetchCovidData();
  updateGlobalStats();
  updateTopCountries(); 
}, 300000); // Refresh every 5 minutes



// About Modal functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get the modal elements
  const modal = document.getElementById('about-modal');
  const aboutBtn = document.getElementById('about-btn');
  const closeBtn = document.querySelector('.close-btn');
  
  // Open modal when About button is clicked
  aboutBtn.addEventListener('click', function() {
    modal.style.display = 'block';
  });
  
  // Close modal when X is clicked
  closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
  });
  
  // Close modal when clicking outside the modal content
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
});
