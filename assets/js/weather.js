var apiKey = '04ca4740a12eec5578603b1b53763759';
var userFormEl = document.querySelector('#user-form');
var cityInputEl = document.querySelector('#city-name');
var citiesListEl = document.querySelector('#cities-container ul');
var citySearchedEl = document.querySelector('#city-searched');
var currentWeatherContainerEl = document.querySelector('#current-weather-container');
var forecastContainerEl = document.querySelector('#forecast-container');
var clearBtn = document.querySelector('#clear-btn');
// retrieve search history
var cities = JSON.parse(localStorage.getItem('citiesSearched')) || [];
// variable for local day and time of city searched
var dtCitySearched;

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
        cities.push(cityName);      // add new city name
        cities.sort();              // sort alphabetically
        localStorage.setItem('citiesSearched', JSON.stringify(cities)); // save updated array 
        searchHistory();            // display updated search history
    }

    // check if api returned an empty weather data object
    if (isEmpty(data)) {
        currentWeatherContainerEl.textContent = 'No weather data found for this city.';
        return;
    }

    // calculate the searched city local day and time
    dtCitySearched = moment.unix(data.dt + data.timezone).utc().format('M/DD/YY, h:mm a');

    // extract weather icon & display title including city, today's date and weather icon
    var iconId = data.weather[0].icon;
    console.log('current weather icon:', iconId);
    citySearchedEl.innerHTML = `${cityName} (${dtCitySearched}) <span id="weather-icon"><img src="http://openweathermap.org/img/wn/${iconId}@2x.png"/></span>`;

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
    var indexClass;
    if (index < 3) {
        indexClass = 'bg-success';
    }
    else if (index < 6) {
        indexClass = 'bg-warning';
    }
    else {
        indexClass = 'bg-danger';
    }
    var UVindexEl = document.createElement('p');
    UVindexEl.innerHTML = `UV index: <span class="${indexClass} p-2 text-white rounded">${index}</span>`;
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
    console.log(data);
    // prepare the forecast container
    forecastContainerEl.innerHTML = '<h4 class="d-block pt-4 pb-2">5-Day Forecast <span id="time-forecast">[expected weather conditions at noon each day]</span></h4>';
    var cardsContainerEl = document.createElement('div');
    cardsContainerEl.setAttribute('class', 'row');

    // set a date string for first forecast date at noon with format 'YYYY-MM-DD 12:00:00'
    console.log('dtCitySearched: ', dtCitySearched);
    var firstForecast;
    var todayStartOfHour = moment(dtCitySearched, 'M/DD/YY, h:mm a').startOf('hour').format('YYYY-MM-DD HH:mm:ss');
    console.log('todayStartOfHour:', todayStartOfHour);
    var todayNineAM = moment(dtCitySearched, 'M/DD/YY, h:mm a').format('YYYY-MM-DD') + ' 09:00:00';
    console.log('todayNineAM:', todayNineAM);
    if (todayStartOfHour > todayNineAM) {   // check if current time if more than 9 am, then our first forecast will be next day at noon
        firstForecast = moment(dtCitySearched, 'M/DD/YY, h:mm a').add(1, 'd').format('YYYY-MM-DD') + ' 12:00:00';
    } else {                                // otherwise our first forecast will be same day at noon
        firstForecast = moment(dtCitySearched, 'M/DD/YY, h:mm a').format('YYYY-MM-DD') + ' 12:00:00';
    }
    console.log('firstForecast:', firstForecast);
    var arrDays = data.list;
    var startIndex;
    // get the index for first forecast day in the arrays of d
    arrDays.forEach( day => {
        if (day.dt_txt === firstForecast) {
            startIndex = arrDays.indexOf(day);
            return;
        }
    });
    console.log('startIndex:', startIndex);

    // loop through array of forecasts and create each of the five days forecast (the forecast at 9am is extracted)
    for (i=startIndex; i<arrDays.length; i+=8) {
        console.log(arrDays[i]);
        var dayForecastContainerEl = document.createElement('div');
        dayForecastContainerEl.setAttribute('class', 'mx-auto');
        //dayForecastContainerEl.classList = 'col-12';
        var cardEl = document.createElement('div');
        cardEl.setAttribute('class', 'card bg-primary text-white');
        var cardBodyEl = document.createElement('div');
        cardBodyEl.setAttribute('class', 'card-body');

        // extract & display forecast date
        var date = moment(arrDays[i].dt_txt.split(' ')[0], 'YYYY-MM-DD').format('M/DD/YY');
        var dateEl = document.createElement('h5');
        dateEl.setAttribute('class', 'card-title');
        dateEl.textContent = `${date}`;
        cardBodyEl.appendChild(dateEl);

        // extract & display forecast icon
        var iconId = arrDays[i].weather[0].icon;
        console.log('forecastIconId:', iconId);
        if (iconId[iconId.length-1] === 'n') {
            iconId = iconId.slice(0, -1) + 'd';
            console.log(iconId);
        }
        var iconEl = document.createElement('i');
        iconEl.innerHTML = `<img src="http://openweathermap.org/img/wn/${iconId}.png"/>`;
        cardBodyEl.appendChild(iconEl);

        // extract & display forecasted temp
        var tempEl = document.createElement('p');
        tempEl.setAttribute('class', 'card-text');
        tempEl.textContent = `Temp: ${arrDays[i].main.temp} °F`;
        cardBodyEl.appendChild(tempEl);

        // extract & display forecasted humidity
        var humidityEl = document.createElement('p');
        humidityEl.setAttribute('class', 'card-text');
        humidityEl.textContent = `Humidity: ${arrDays[i].main.humidity} %`;
        cardBodyEl.appendChild(humidityEl);

        cardEl.appendChild(cardBodyEl);
        dayForecastContainerEl.appendChild(cardEl);
        cardsContainerEl.appendChild(dayForecastContainerEl);
    };

    forecastContainerEl.appendChild(cardsContainerEl);
}

// Function to populate the search history and save to local storage
var searchHistory = () => {
    // clear previous search history
    citiesListEl.innerHTML = '';

    // loop through cities array to display search history
    cities.forEach(function (city){
        var cityEl = document.createElement('li');
        cityEl.setAttribute('class', 'list-group-item');
        cityEl.textContent = city;
        citiesListEl.appendChild(cityEl);
    });
};

var cityClickHandler = event => {
    var cityName = event.target.textContent;
    getCurrentWeather(cityName);
}

var clearSearchHistory = () => {
    cities = [];
    localStorage.setItem('citiesSearched', JSON.stringify(cities));
    searchHistory();
}

// event listeners
userFormEl.addEventListener('submit', formSubmitHandler);
citiesListEl.addEventListener('click', cityClickHandler);
clearBtn.addEventListener('click', clearSearchHistory);

// display search history stored in local storage upon opening the app
searchHistory();