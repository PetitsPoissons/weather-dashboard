var apiKey = '04ca4740a12eec5578603b1b53763759';
var cityInputEl = document.querySelector('#city-name');
var currentWeatherContainerEl = document.querySelector('#current-weather-container');
var citySearchedEl = document.querySelector('#city-searched');
var cities = [];

// utility function to check is an object is empty
var isEmpty = function(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

var getCurrentWeather = function(cityName) {
    // format the OpenWeather api url
    var apiURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&units=imperial&appid=' + apiKey;

    // make a request to the url
    fetch(apiURL).then(function(response) {
        // request was successful
        if (response.ok) {
            response.json().then(function(data) {
                displayCurrentWeather(data, cityName);
            });
        } else {
            alert('Error: ' + response.statusText);
        }
    })
    .catch(function(error) {
        alert('Unable to connect to OpenWeather');
    });
};

var displayCurrentWeather = function(data, cityName) {
    // clear old content
    currentWeatherContainerEl.textContent = '';
    citySearchedEl.textContent = cityName;

    // display city name in search history if not already there
    console.log(cityName);

    // check if api returned an empty weather data object
    if (isEmpty(data)) {
        currentWeatherContainerEl.textContent = 'No weather data found for this city.';
        return;
    }

    // extract temperature, humidity, wind speed, and UV index from the data object
    var temperatureEl = document.createElement('p');
    temperatureEl.textContent = 'Temperature: ' + data.main.temp + '°F';
    currentWeatherContainerEl.appendChild(temperatureEl);
}

getCurrentWeather('Los Angeles');