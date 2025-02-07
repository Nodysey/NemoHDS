const express = require('express');
const path = require('path');
const fs = require('fs').promises
const app = express();

const serverConfig = {
  "twcApiKey": "", // Your The Weather Channel API Key Here.  
  "units": "e", // 'm' for Metric, 'e' for American / Imperial

  "webPort": 9001,

  "locationIndex": {
    "locations": [
      "Cherry Hill",
      "Mount Laurel",
      "Voorhees",
      "Camden NJ",
      "Mount Holly"
    ],
    "ldlLocations": [ // the last 4 characters of each location name are omitted, if you wanna keep it add 4 spaces to the end of the location name
      "Cherry Hill, NJ",
      "Mount Laurel, NJ",
      "Voorhees, NJ",
      "Camden, NJ",
      "Mount Holly, NJ",
      "Woodbury, NJ"
    ],
  },

  /* National LDL Locations:
      'Albuquerque, NM    ',
      'Atlanta    ',
      'Baltimore    ',
      'Bangor, ME    ',
      'Billings, MT    ',
      'Birmingham, AL    ',
      'Bismarck, ND    ',
      'Boise, ID    ',
      'Boston    ',
      'Buffalo, NY    ',
      'Burlington, VT    ',
      'Charlotte, NC    ',
      'Chicago    ',
      'Cincinnati    ',
      'Cleveland    ',
      'Dallas - Ft. Worth    ',
      'Denver    ',
      'Des Moines, IA    ',
      'Detroit    ',
      'Flagstaff, AZ    ',
      'Greenville, SC    ',
      'Hartford, CT    ',
      'Houston    ',
      'Indianapolis    ',
      'Jacksonville, FL    ',
      'Kansas City, MO    ',
      'Las Vegas    ',
      'Littlerock, AR    ',
      'Los Angeles    ',
      'Louisville, KY    ',
      'Memphis, TN    ',
      'Miami    ',
      'Milwaukee    ',
      'Minneapolis    ',
      'Nashville, TN    ',
      'New Orleans    ',
      'New York City    ',
      'Newark, NJ    ',
      'Norfolk, VA    ',
      'Oklahoma City    ',
      'Omaha, NE    ',
      'Orlando, FL    ',
      'Philadelphia    ',
      'Phoenix    ',
      'Pittsburgh    ',
      'Portland, ME    ',
      'Portland, OR    ',
      'Raleigh, NC    ',
      'Rapid City, SD    ',
      'Reno, NV    ',
      'Sacramento, CA    ',
      'Salt Lake City    ',
      'San Antonio    ',
      'San Diego    ',
      'San Francisco    ',
      'Seattle    ',
      'Spokane, WA    ',
      'St. Louis    ',
      'Tampa, FL    ',
      'Tulsa, OK    ',
      'Washington, DC    '
  */

  "seasons": {
    "winter": true,
    "spring": true
  }
}

let allWeather = {};
let ldlWeather = {};

async function getWeather(lat, lon, countryCode) { // credit to Dalk
  // theres definitely a better approach to this
  // its like 1 am and im way too lazy to think of that better approach
  const currentUrl = await fetch(`https://api.weather.com/v3/wx/observations/current?geocode=${lat},${lon}&units=${serverConfig.units}&language=en-US&format=json&apiKey=${serverConfig.twcApiKey}`);
  const weeklyUrl = await fetch(`https://api.weather.com/v3/wx/forecast/daily/7day?geocode=${lat},${lon}&format=json&units=${serverConfig.units}&language=en-US&apiKey=${serverConfig.twcApiKey}`);
  const hourlyUrl = await fetch(`https://api.weather.com/v3/wx/forecast/hourly/2day?geocode=${lat},${lon}&format=json&units=${serverConfig.units}&language=en-US&apiKey=${serverConfig.twcApiKey}`)
  const alertsUrl = await fetch(`https://api.weather.com/v3/alerts/headlines?geocode=${lat},${lon}&format=json&language=en-US&apiKey=${serverConfig.twcApiKey}`);
  const radarUrl = await fetch(`https://api.weather.com/v2/maps/dynamic?geocode=${lat.toFixed(1)}0,${lon.toFixed(1)}0&h=320&w=568&lod=8&product=twcRadarHcMosaic&map=dark&language=en-US&format=png&apiKey=${serverConfig.twcApiKey}&a=0`)
  const aqiUrl = await fetch(`https://api.weather.com/v3/wx/globalAirQuality?geocode=${lat},${lon}&language=en-US&scale=EPA&format=json&apiKey=${serverConfig.twcApiKey}`);
  const pollenUrl = await fetch(`https://api.weather.com/v2/indices/pollen/daypart/3day?geocode=${lat},${lon}&language=en-US&format=json&apiKey=${serverConfig.twcApiKey}`);
/*   const runningUrl = await fetch(`https://api.weather.com/v2/indices/runWeather/daypart/3day?geocode=${lat},${lon}&language=en-US&format=json&apiKey=${serverConfig.twcApiKey}`);
  const frostUrl = await fetch(`https://api.weather.com/v2/indices/frost/daypart/3day?geocode=${lat},${lon}&language=en-US&format=json&apiKey=${serverConfig.twcApiKey}`);
  const skiUrl = await fetch(`https://api.weather.com/v2/indices/ski/daypart/3day?geocode=${lat},${lon}&language=en-US&format=json&apiKey=${serverConfig.twcApiKey}`);
  const mosquitoUrl = await fetch(`https://api.weather.com/v2/indices/mosquito/daily/3day?geocode=${lat},${lon}&language=en-US&format=json&apiKey=${serverConfig.twcApiKey}`);
  const golfUrl = await fetch(`https://api.weather.com/v2/indices/golf/daypart/3day?geocode=${lat},${lon}&language=en-US&format=json&apiKey=${serverConfig.twcApiKey}`);
  const heatingUrl = await fetch(`https://api.weather.com/v2/indices/heatCool/daypart/3day?geocode=${lat},${lon}&language=en-US&format=json&apiKey=${serverConfig.twcApiKey}`); */
  const current = await currentUrl.json();
  const weekly = await weeklyUrl.json();

  let alerts = []
  let alertDetails = []

  try {
    if (alertsUrl.status === 204) {
      console.info(`No alerts in effect for ${lat}, ${lon}`);
      alerts = [];
    } else {
      alerts = await alertsUrl.json();
      console.info(`Fetched alerts for ${lat}, ${lon}:`);

      if (alerts.alerts && alerts.alerts.length > 0) {
        const alertId = alerts.alerts[0].detailKey;
        const alertDetailsUrl = await fetch(`https://api.weather.com/v3/alerts/detail?alertId=${alertId}&format=json&language=en-US&apiKey=${serverConfig.twcApiKey}`);
        
        if (alertDetailsUrl.ok) {
          alertDetails = await alertDetailsUrl.json();
        } else {
          console.error(`Failed to fetch alert details: ${alertDetailsUrl.status} ${alertDetailsUrl.statusText}`);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
  }
  const radar = radarUrl.url;
  const aqi = await aqiUrl.json();
  const pollen = await pollenUrl.json();
  /* const running = await runningUrl.json();
  const frost = await frostUrl.json();
  const ski = await skiUrl.json();
  const mosquito = await mosquitoUrl.json();
  const golf = await golfUrl.json();
  const heating = await heatingUrl.json(); */

  if(serverConfig.debugger) { console.log(`[server.js] | ${new Date().toLocaleString()} | Successfully saved current weather conditions`) }

  const weatherData = {
    current: current,
    weekly: weekly,
    alerts: alerts,
    alertDetails: alertDetails,
    radar: radar,
    special: { pollen: pollen },
/*     indices: { 
      spring: { running: running, mosquito: mosquito, golf: golf },
      winter: { heating: heating, frost: frost, ski: ski }
    } */
  };

  return weatherData;
}

async function getWeatherCoordinates(location) {
  const coordinatesUrl = await fetch(`https://api.weather.com/v3/location/search?query=${location}&language=en-US&format=json&apiKey=${serverConfig.twcApiKey}`);
  const coordinates = await coordinatesUrl.json();
  const locationData = coordinates.location;
  
  if (!locationData) {
    throw new Error(`Location data not found for ${location}`);
  }

  if(serverConfig.debugger) {
    console.log(`[server.js] | ${new Date().toLocaleString()} | Successfully retrieved weather coordinates for ${location}`);
  }

  return {
    lat: locationData.latitude[0], 
    lon: locationData.longitude[0], 
    country: locationData.countryCode[0], 
    adminDistrictCode: locationData.adminDistrictCode[0],
    postalKey: locationData.postalKey[0],
    ianaTimeZone: locationData.ianaTimeZone[0]
  };
}

let currentCity = 0

async function loadAllCities() {
  // hope this workies
  for (const location of serverConfig.locationIndex.locations) {
    try {
      const coordinates = await getWeatherCoordinates(location)

      allWeather[location] = {};
      allWeather[location][currentCity] = {};
      allWeather[location][currentCity].coordinates = coordinates;

      const weather = await getWeather(
        allWeather[location][currentCity].coordinates.lat,
        allWeather[location][currentCity].coordinates.lon,
        allWeather[location][currentCity].country
      );

      allWeather[location][currentCity].current = weather.current
      allWeather[location][currentCity].weekly = weather.weekly
      allWeather[location][currentCity].alerts = weather.alerts
      allWeather[location][currentCity].alertDetails = weather.alertDetails
      allWeather[location][currentCity].radar = weather.radar
      allWeather[location][currentCity].special = weather.special
      allWeather[location][currentCity].indices = weather.indices

      console.log(`Processed ${location} (${currentCity})`)

      currentCity++

    } catch (error) {
      if (serverConfig.twcApiKey == "") {
        console.error('\x1b[31mError:\x1b[0m try inputting an api key in 𝓈𝑒𝓇𝓋𝑒𝓇.𝒿𝓈 lmao');
        console.log('');
        process.exit();
      } else {
        console.error(`\x1b[31mError:\x1b[0m Could not process ${location}: ${error.message}`);
      }
    }  
  }
}

async function getLDLWeather(lat, lon, countryCode) { // credit to Dalk for the twc api stuff
  const ldlCurrentUrl = await fetch(`https://api.weather.com/v3/wx/observations/current?geocode=${lat},${lon}&units=${serverConfig.units}&language=en-US&format=json&apiKey=${serverConfig.twcApiKey}`);
  const ldlHourlyUrl = await fetch(`https://api.weather.com/v3/wx/forecast/hourly/2day?geocode=${lat},${lon}&format=json&units=${serverConfig.units}&language=en-US&apiKey=${serverConfig.twcApiKey}`);
  const ldlWeeklyUrl = await fetch(`https://api.weather.com/v3/wx/forecast/daily/7day?geocode=${lat},${lon}&format=json&units=${serverConfig.units}&language=en-US&apiKey=${serverConfig.twcApiKey}`);
  const ldlAlertsUrl = await fetch(`https://api.weather.com/v3/alerts/headlines?countryCode=${countryCode}&format=json&language=en-US&apiKey=${serverConfig.twcApiKey}`);
  const ldlAqiUrl = await fetch(`https://api.weather.com/v3/wx/globalAirQuality?geocode=${lat},${lon}&language=en-US&scale=EPA&format=json&apiKey=${serverConfig.twcApiKey}`);
  const ldlAlmanacUrl = await fetch(`https://api.weather.com/v3/wx/almanac/monthly/1month?geocode=${lat},${lon}&format=json&units=${serverConfig.units}&month=1&apiKey=${serverConfig.twcApiKey}`)
  const ldlCurrent = await ldlCurrentUrl.json();
  const ldlHourly = await ldlHourlyUrl.json();
  const ldlWeekly = await ldlWeeklyUrl.json();
  const ldlAlerts = await ldlAlertsUrl.json();
  const ldlAqi = await ldlAqiUrl.json();
  const ldlAlmanac = await ldlAlmanacUrl.json();
  if(serverConfig.debugger) { console.log(`[server.js] | ${new Date().toLocaleString()} | Saved data for display on LDL`) }

  return {
      ldlCurrent: ldlCurrent,
      ldlHourly: ldlHourly,
      ldlWeekly: ldlWeekly,
      ldlAlerts: ldlAlerts,
      ldlAqi: ldlAqi,
      ldlAlmanac: ldlAlmanac,
      }
}

async function getLDLWeatherCoordinates(location) {
const coordinatesUrl = await fetch(`https://api.weather.com/v3/location/search?query=${location}&language=en-US&format=json&apiKey=${serverConfig.twcApiKey}`);
const coordinates = await coordinatesUrl.json();
const locationData = coordinates.location;

if (!locationData) {
  throw new Error(`Location data not found for ${location}`);
}

if(serverConfig.debugger) {
  console.log(`[server.js] | ${new Date().toLocaleString()} | Successfully retrieved weather coordinates for ${location}`);
}

return {
  lat: locationData.latitude[0], 
  lon: locationData.longitude[0], 
  country: locationData.countryCode[0], 
  adminDistrictCode: locationData.adminDistrictCode[0]
};
}

let currentLDLCity = 0

async function loadAllLDLCities() {
// hope this workies
for (const location of serverConfig.locationIndex.ldlLocations) {
  try {
    const coordinates = await getLDLWeatherCoordinates(location)

    ldlWeather[location] = {};
    ldlWeather[location][currentLDLCity] = {};
    ldlWeather[location][currentLDLCity].coordinates = coordinates;

    const weather = await getLDLWeather(
      ldlWeather[location][currentLDLCity].coordinates.lat,
      ldlWeather[location][currentLDLCity].coordinates.lon,
      ldlWeather[location][currentLDLCity].country
    );

    ldlWeather[location][currentLDLCity].current = weather.ldlCurrent
    ldlWeather[location][currentLDLCity].alerts = weather.ldlAlerts
    ldlWeather[location][currentLDLCity].hourly = weather.ldlHourly
    ldlWeather[location][currentLDLCity].forecast = weather.ldlWeekly
    ldlWeather[location][currentLDLCity].aqi = weather.ldlAqi
    ldlWeather[location][currentLDLCity].almanac = weather.ldlAlmanac

    console.log(`Processed ${location} (${currentLDLCity})`)

    currentLDLCity++

  } catch (error) {
    console.error(`\x1b[31mError:\x1b[0m Could not process ${location}: ${error.message}`);
  }
   
}
}

async function saveDataToJson() {
  const jsonFile = path.join(__dirname, 'public/wxData.json')
  const ldlFile = path.join(__dirname, 'public/ldlData.json')

  await fs.writeFile(jsonFile, JSON.stringify(allWeather, null, 2))
  await fs.writeFile(ldlFile, JSON.stringify(ldlWeather, null, 2))

}

async function runDataInterval() {
  await loadAllCities()
  await loadAllLDLCities()
  saveDataToJson()
  console.log("Ran data and text generation intervals.")
  console.log("============================================")
  console.log(`### Nemo HTML DISPLAY SYSTEM ###`);
  console.log(`Modified by Hainesnoids`);
  console.log(`Derivative of WeatherHDS by SSPWXR, ScentedOrange, and LeWolfYT`);
  console.log(`Server is running on http://localhost:${serverConfig.webPort}`);
}

runDataInterval()
setInterval(runDataInterval, 480000)

app.use(express.static(path.join(__dirname, 'public')));

app.listen(serverConfig.webPort, () => {});

app.get('/locations', (req, res) => {
  res.json({
    locationIndex: serverConfig.locationIndex,
    units: serverConfig.units
    })
})

process.on('SIGINT', () => {console.log("Exiting WeatherHDS daemon"); process.exit();});
process.on('SIGUSR2', () => {console.log("Exiting WeatherHDS daemon"); process.exit();});
