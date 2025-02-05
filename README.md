<img src="https://github.com/Nodysey/NemoHDS/blob/main/public/images/hdslogo_2024.png">
<h1>NemoHDS (Fork of FoxHDS, which is itself a fork of WeatherHDS)</h1>

![screenshot](https://github.com/user-attachments/assets/c016b619-7572-4565-8834-b4ad362c5ad4)

## Present continuous weather data on display screens, with easy deployment and free and open source software.
NemoHDS is a Node.JS app based on WeatherHDS that simplifies the presentation of modern and updated weather graphics on digital displays or other types of broadcasts. Designed with modularity and infinite customizability in mind, thanks to WeatherHDS' simplified underlying system completly built on standard web technologies.

## Installation
1. Install [Node.JS](https://nodejs.org)
2. Run `npm start` in the root directory

# Configuration
## Dependencies
- express

## Location
- Main presentation and LDL locations can be edited in config.js. Please reload the page once restarting the server.
- The system rotates between locations once the last slide of the presentation is reached, it should loop back on the next location.
- slides.js manages how the slides work. Currently, it switches between the HTML containers every 8 to 10 seconds.
- The alerts page will show an intro slide whenever there are no alerts in effect.

# Features
- Built and designed for developers to adapt and improve the system.
- Completly customizable locations, no automatic geolocation
- Switching between 4:3 (VGA), 16:9 (HDTV), 16:10 (Tablet), and 3:2 (NTSC DV) aspect ratios. Rendered at canvas sizes of 640x480, 854x480, and 768x480 respectively, and scaled to fit the viewport. This is controlled by `videoType` in the config file.
- LDL only mode. Displays a black screen with only the LDL, which you could superimpose onto programming with OBS Studio. This is controlled by `presentationType` in the config file.
- Switching between metric and imperial.
- Switching between static and animated weather icons.

# Plans
- Ad Crawl
- Air Quality Rework
- Extended Forecast Rework
- Sunrise / Sunset & Moon Phase
- Hourly Forecast
- Animation Rework
If you know HTML / CSS / JS, consider helping the project by making a pull request.


# Credits
- ScentedOrange - making the air quality and 7 day high and low pages. | https://github.com/ScentedOrangeDEV
- Dalk - writing TWC API weather fetching functions. | https://github.com/Dalk21
- LeWolfYT - providing solutions to issues regarding the 7 day highs and the LDL progress bars | https://github.com/LeWolfYT
- Weather icons (MIT): https://github.com/basmilius/weather-icons | Copy of license included in weather icon directory
- Google Material icons (APACHE 2.0): https://fonts.google.com/icons | https://www.apache.org/licenses/LICENSE-2.0
- weather videos (Pexels): https://www.pexels.com/license/
- Hainesnoids - the fork | https://github.com/nodysey

# Unresolved Issues
- Memory leak (accumulating memory usage as the program operates)
