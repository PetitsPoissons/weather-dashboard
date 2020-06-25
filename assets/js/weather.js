var apiKey = '04ca4740a12eec5578603b1b53763759';
var userFormEl = document.querySelector('#user-form');
var cityInputEl = document.querySelector('#city-name');
var citiesListEl = document.querySelector('#cities-container ul');
var citySearchedEl = document.querySelector('#city-searched');
var currentWeatherContainerEl = document.querySelector('#current-weather-container');
var cities = [];

// utility function to check is an object is empty
var isEmpty = function(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

// utility function to capitalize the letter of each word in a string
function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1).toLowerCase();     
    }
    // directly return the joined string
    return splitStr.join(' '); 
 }

var formSubmitHandler = function(event) {
    event.preventDefault();
    // get value from input element
    var city = titleCase(cityInputEl.value.trim());

    if (city) {
        getCurrentWeather(city);
        cityInputEl.value = '';
    } else {
        alert('Please enter a city');
    }
};

var getCurrentWeather = function(cityName) {
    // format the OpenWeather api url for current weather, one location
    var apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=${apiKey}`;

    // make a request to the url
    fetch(apiURL)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        displayCurrentWeather(data, cityName);
        return data.coord;
    })
    .then(function(coord) {
        getUVindex(coord.lat, coord.lon);
    })
    .catch(function(error) {
        alert('Unable to find weather conditions for this city');
    });
};

var displayCurrentWeather = function(data, cityName) {
    // clear old content
    currentWeatherContainerEl.textContent = '';
    citySearchedEl.textContent = cityName;

    // get today's date
    var today = moment().format('MM/DD/YY');

    // display city name in search history if not already there
    if (!cities.includes(cityName)) {
        searchHistory(cityName);
    }

    // check if api returned an empty weather data object
    if (isEmpty(data)) {
        currentWeatherContainerEl.textContent = 'No weather data found for this city.';
        return;
    }

    // extract weather icon & display title including city, today's date and weather icon
    var iconId = data.weather[0].icon;
    citySearchedEl.innerHTML = `${cityName} (${today}) <span id="weather-icon"><img src="http://openweathermap.org/img/wn/${iconId}@2x.png"/></span>`;

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
}

var getUVindex = function(lat, lon) {
    // format the OpenWeather api url for current UV index, one location
    var apiURL = `http://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`;
    fetch(apiURL)
    .then(function(response) {
        return response.json();
    })
    .then(function (data) {
        var index = parseFloat(data.value)
        displayUVindex(index);
    })
    .catch(function(error) {
        alert(`Error fetching the UV index: ${response.statusText}`);
    });
}

// Function to display UV index with different class depending on UV index value
var displayUVindex = function(index) {
    var indexId;
    if (index < 3) {
        indexId = 'uv-fav';
    }
    else if (index < 6) {
        indexId = 'uv-mod';
    }
    else {
        indexId = 'uv-bad';
    }
    var UVindexEl = document.createElement('p');
    UVindexEl.innerHTML = `UV index: <span id=${indexId}>${index}</span>`;
    currentWeatherContainerEl.appendChild(UVindexEl);
}

// Function to populate the search history and save to local storage
var searchHistory = function(cityName) {
    cities.push(cityName);
    cities.sort().forEach(function (){
        var cityEl = document.createElement('li').addClass('list-item');
        citiesListEl.appendChild(cityEl);
    });
};

userFormEl.addEventListener('submit', formSubmitHandler);