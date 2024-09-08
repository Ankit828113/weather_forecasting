const apiKey = '724785edb4387339cd7acba86ce57758'; 
const currentWeatherEl = document.getElementById('currentWeather');
const forecastEl = document.getElementById('forecast');
const searchButton = document.getElementById('searchButton');
const locationButton = document.getElementById('locationButton');
const cityInput = document.getElementById('cityInput');
const recentCitiesDropdown = document.getElementById('recentCitiesDropdown');

let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];



// Function to fetch weather data
async function fetchWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
        const data = await response.json();
        if (response.ok) {
            updateCurrentWeather(data);
            fetchForecast(data.coord.lat, data.coord.lon);
            updateRecentCities(city);
        } else {
            alert('City not found. Please try again.');
        }
        recentCitiesDropdown.classList.add('hidden');
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('An error occurred. Please try again.');
    }
}

//fetch 5-day forecast
async function fetchForecast(lat, lon) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
    const data = await response.json();
    updateForecast(data.list);
}

//update current weather UI
function updateCurrentWeather(data) {
    currentWeatherEl.querySelector('.text-xl').textContent = `${data.name} (${new Date().toLocaleDateString()})`;
    currentWeatherEl.querySelector('.text-lg').textContent = `Temperature: ${data.main.temp}°C`;
    currentWeatherEl.querySelector('.text-lg').nextElementSibling.textContent = `Wind: ${data.wind.speed} M/S`;
    currentWeatherEl.querySelector('.text-lg').nextElementSibling.nextElementSibling.textContent = `Humidity: ${data.main.humidity}%`;
    currentWeatherEl.querySelector('#weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    currentWeatherEl.querySelector('#weatherDescription').textContent = data.weather[0].description;
}

//update 5-day forecast UI
function updateForecast(forecast) {
    forecastEl.innerHTML = '';
    for (let i = 0; i < forecast.length; i += 8) { 
        const day = forecast[i];
        const date = new Date(day.dt_txt).toLocaleDateString();
        const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;
        const temp = `${day.main.temp}°C`;
        const wind = `${day.wind.speed} M/S`;
        const humidity = `${day.main.humidity}%`;

        forecastEl.innerHTML += `
            <div class="bg-cyan-500 p-4 rounded-md shadow-md text-center ">
                <div class="text-lg font-semibold">${date}</div>
                <img src="${icon}" alt="Weather Icon" class="w-20 h-20 mx-auto mb-2 ">
                <div>Temp: ${temp}</div>
                <div>Wind: ${wind}</div>
                <div>Humidity: ${humidity}</div>
            </div>
        `;
    }
}

// update recent cities in localStorage and dropdown
function updateRecentCities(city) {
    recentCities = recentCities.filter(item => item.toLowerCase() !== city.toLowerCase());
    recentCities.unshift(city);

    if (recentCities.length > 5) {
        recentCities.pop();
    }

    localStorage.setItem('recentCities', JSON.stringify(recentCities));
    LoadRecentCitiesDropdown();
}


function deleteCityFromDropdown(city) {
    recentCities = recentCities.filter(item => item.toLowerCase() !== city.toLowerCase());
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
    LoadRecentCitiesDropdown(); 
}


function LoadRecentCitiesDropdown() {
    recentCitiesDropdown.innerHTML = '';

    if (recentCities.length === 0) {
        recentCitiesDropdown.classList.add('hidden');
        return;
    }

    recentCitiesDropdown.classList.remove('hidden');

    recentCities.forEach(city => {
        const cityOption = document.createElement('div');
        cityOption.className = 'p-2 flex justify-between cursor-pointer hover:bg-gray-100';

       
        const cityName = document.createElement('div');
        cityName.textContent = city;
        cityName.className = 'flex-grow';
        cityName.addEventListener('click', () => {
            fetchWeather(city); 
            cityInput.value = city; 
            recentCitiesDropdown.classList.add('hidden'); 
        });

      
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.className = 'text-red-500 text-3xl font-bold mr-2';
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            deleteCityFromDropdown(city);
        });

        cityOption.appendChild(cityName);
        cityOption.appendChild(deleteButton);
        recentCitiesDropdown.appendChild(cityOption);
    });
}


function fetchWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoords(lat, lon);
        }, () => {
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        const data = await response.json();
        if (response.ok) {
            updateCurrentWeather(data);
            fetchForecast(lat, lon);
            updateRecentCities(data.name);
        } else {
            alert('Location not found. Please try again.');
        }
        recentCitiesDropdown.classList.add('hidden'); 
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('An error occurred. Please try again.');
    }
}

searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    }
});

locationButton.addEventListener('click', fetchWeatherByLocation);


cityInput.addEventListener('input', () => {
    if (cityInput.value.trim() !== '') {
        LoadRecentCitiesDropdown(); 
    } else {
        recentCitiesDropdown.classList.add('hidden'); 
    }
});

cityInput.addEventListener('focusout', () => {

    recentCitiesDropdown.classList.add('hidden');
});


recentCitiesDropdown.addEventListener('mousedown', (event) => {
    event.preventDefault(); 
});


LoadRecentCitiesDropdown();



// Keep dropdown hidden initially
recentCitiesDropdown.classList.add('hidden');