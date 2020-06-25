var apiKey = '04ca4740a12eec5578603b1b53763759';
var userFormEl = document.querySelector('#user-form');
var cityInputEl = document.querySelector('#city-name');
var citiesListEl = document.querySelector('#cities-container ul');
var citySearchedEl = document.querySelector('#city-searched');
var currentWeatherContainerEl = document.querySelector('#current-weather-container');
var cities = [];                         // array to store search history
var today = moment().format('MM/DD/YY'); // today's date

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

 // function to handle submit button or enter input city
var formSubmitHandler = function(event) {
    event.preventDefault();
    // get value from input element
    var city = titleCase(cityInputEl.value.trim());
    console.log('formSubmitHandler', city);

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
    // make request to the url
    fetch(apiURL)
    .then(response => response.json())
    .then(data => {
        displayCurrentWeather(data, cityName);
        return data.coord;
    })
    .then(coord => {
        getUVindex(coord.lat, coord.lon);
        get5dayForecast(coord.lat, coord.lon);
    })
    .catch(error => {
        alert('Uh-ho, something went wrong... Please check for any misspelling. There could also be a problem with the connection, or there is no weather data available for this city.');
    });
};

var displayCurrentWeather = (data, cityName) => {
    // clear old content
    currentWeatherContainerEl.innerHTML = '';
    citySearchedEl.textContent = cityName;

    // display city name in search history if not already there
    if (!cities.includes(cityName)) {
        cities.push(cityName);
        cities.sort();
        searchHistory();
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

var getUVindex = (lat, lon) => {
    // format the OpenWeather api url for current UV index, one location
    var apiURL = `http://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`;
    fetch(apiURL)
    .then(response => response.json())
    .then(data => {
        var index = parseFloat(data.value)
        displayUVindex(index);
    })
    .catch(error => alert('Error fetching the UV index'));
}

// Function to display UV index with different class depending on UV index value
var displayUVindex = index => {
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
};

// Function to fetch 5-day forecast for a given city
var get5dayForecast = (lat, lon) => {
    // format the OpenWeather api url for 5-day forecast, one location
    var apiURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
    // make request to the url
    fetch(apiURL)
    .then(response => response.json())
    .then(data => display5dayForecast(data))
    .catch(error => alert('Error fetching the 5-day forecast for this city'));
};

// Function to display the 5-day forecast for a given city
var display5dayForecast = data => {
    console.log('display5dayForecast', data);
    // set a date string for tomorrow's date at noon with format 'YYYY-MM-DD 12:00:00'
    var tomorrowNoon = moment().add(1, 'd').format('YYYY-MM-DD') + ' 12:00:00';
    var arrDays = data.list;
    var startIndex;
    // get the index for tomorrow noon in the arrays of days
    arrDays.forEach( day => {
        if (day.dt_txt === tomorrowNoon) {
            startIndex = arrDays.indexOf(day);
            return;
        }
    });
    for (i=startIndex; i<arrDays.length; i+=8) {
        
    };
}

// Function to populate the search history and save to local storage
var searchHistory = () => {
    // clear previous search history
    citiesListEl.innerHTML = '';
    cities.forEach(function (city){
        var cityEl = document.createElement('li');
        cityEl.setAttribute('class', 'list-item');
        cityEl.textContent = city;
        citiesListEl.appendChild(cityEl);
    });
};

userFormEl.addEventListener('submit', formSubmitHandler);