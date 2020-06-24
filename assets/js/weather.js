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
    // format the OpenWeather api url for current weather, one location
    var apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=${apiKey}`;

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

var getUVindex = function(lat, lon) {
    var indexValue;
    // format the OpenWeather api url for current UV index, one location
    var apiURL = `http://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`;
    fetch(apiURL).then(function(response) {
        if (response.ok) {
            response.json().then(function (data) {
                console.log(data);
                indexValue = data.value;
                console.log(indexValue);
            });
        } else {
            indexValue = 'Error fetching the UV index: ' + response.statusText;
        }
    })
    .catch(function(error) {
        indexValue = 'Unable to connect to OpenWeather for UV data';
    });
    console.log(indexValue);
    return indexValue;
}

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

    // extract & display temperature from the data object
    var temperatureEl = document.createElement('p');
    temperatureEl.textContent = 'Temperature: ' + data.main.temp + ' °F';
    currentWeatherContainerEl.appendChild(temperatureEl);

    // extract & display humidity from the data object
    var humidityEl = document.createElement('p');
    humidityEl.textContent = 'Humidity: ' + data.main.humidity + '%';
    currentWeatherContainerEl.appendChild(humidityEl);

    // extract & display wind speed from the data object
    var windSpeedEl = document.createElement('p');
    windSpeedEl.textContent = 'Wind Speed: ' + data.wind.speed + ' MPH';
    currentWeatherContainerEl.appendChild(windSpeedEl);

    // extract latitude and longitude from the data object to fetch for UV index
    var cityLat = data.coord.lat;
    var cityLon = data.coord.lon;
    var UVindex = getUVindex(cityLat, cityLon);
    console.log('UVindex', UVindex);
    // display UV index with different class depending on UV index value
    var UVindexEl = document.createElement('p');
    if (UVindex.split()[0] === 'E') {
        UVindexEl.textContent = UVindex;
    }
    else if (parseFloat(UVindex) < 3) {
        UVindexEl.innerHTML = `UV index: <span id="uv-fav">${UVindex}</span>`;
    }
    else if (parseFloat(UVindex) < 6) {
        UVindexEl.innerHTML = `UV index: <span id="uv-mod">${UVindex}</span>`;
    }
    else {
        UVindexEl.innerHTML = `UV index: <span id="uv-bad">${UVindex}</span>`;
    }
    currentWeatherContainerEl.appendChild(UVindexEl);
}

// Function to populate the search history and save to local storage

getCurrentWeather('Los Angeles');