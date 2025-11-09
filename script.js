// REPLACE WITH YOUR API GATEWAY URL
const API_URL = 'https://5vaw6kvmpk.execute-api.ap-south-1.amazonaws.com/prod/latest';

const CITIES = ['Chennai', 'Delhi', 'Mumbai', 'Bangalore'];

function getWeatherIcon(weather) {
    const icons = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Smoke': '🌫️',
        'Haze': '🌫️',
        'Fog': '🌫️'
    };
    return icons[weather] || '🌤️';
}

function getAQIClass(aqi) {
    if (aqi <= 50) return 'aqi-good';
    if (aqi <= 100) return 'aqi-fair';
    if (aqi <= 150) return 'aqi-moderate';
    if (aqi <= 200) return 'aqi-poor';
    return 'aqi-very-poor';
}

function getAQILabel(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Fair';
    if (aqi <= 150) return 'Moderate';
    if (aqi <= 200) return 'Poor';
    return 'Very Poor';
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

function createCityCard(data) {
    return `
        <div class="card">
            <div class="card-header">
                <div class="city-name">${data.city}</div>
                <div class="aqi-badge ${getAQIClass(data.aqi)}">${getAQILabel(data.aqi)}</div>
            </div>
            <div class="weather-icon">${getWeatherIcon(data.weather)}</div>
            <div class="card-body">
                <div class="metric-row">
                    <span class="metric-label">Temperature</span>
                    <span class="metric-value">${data.temperature}°C</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Humidity</span>
                    <span class="metric-value">${data.humidity}%</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">AQI</span>
                    <span class="metric-value">${data.aqi}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Weather</span>
                    <span class="metric-value" style="font-size: 1em;">${data.description}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Last Updated</span>
                    <span class="metric-value" style="font-size: 0.8em;">${formatDate(data.timestamp)}</span>
                </div>
            </div>
        </div>
    `;
}

function createComparison(allData) {
    
    const hottestCity = allData.reduce((prev, curr) => 
        prev.temperature > curr.temperature ? prev : curr
    );
    const coldestCity = allData.reduce((prev, curr) => 
        prev.temperature < curr.temperature ? prev : curr
    );
    const mostPolluted = allData.reduce((prev, curr) => 
        prev.aqi > curr.aqi ? prev : curr
    );
    const leastPolluted = allData.reduce((prev, curr) => 
        prev.aqi < curr.aqi ? prev : curr
    );

    return `
        <div class="comparison-item">
            <h3>🌡️ Hottest</h3>
            <div class="value">${hottestCity.city}</div>
            <div style="color: #666; font-size: 0.9em;">${hottestCity.temperature}°C</div>
        </div>
        <div class="comparison-item">
            <h3>❄️ Coolest</h3>
            <div class="value">${coldestCity.city}</div>
            <div style="color: #666; font-size: 0.9em;">${coldestCity.temperature}°C</div>
        </div>
        <div class="comparison-item">
            <h3>😷 Most Polluted</h3>
            <div class="value">${mostPolluted.city}</div>
            <div style="color: #666; font-size: 0.9em;">AQI ${mostPolluted.aqi}</div>
        </div>
        <div class="comparison-item">
            <h3>🌿 Cleanest Air</h3>
            <div class="value">${leastPolluted.city}</div>
            <div style="color: #666; font-size: 0.9em;">AQI ${leastPolluted.aqi}</div>
        </div>
    `;
}

async function fetchWeatherData() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const contentEl = document.getElementById('content');
    const cityCardsEl = document.getElementById('city-cards');
    const comparisonEl = document.getElementById('comparison-grid');

    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';
    contentEl.style.display = 'none';

    try {
        // Fetch data for all cities
        const promises = CITIES.map(city => 
            fetch(`${API_URL}?city=${city}`)
                .then(res => res.json())
                .then(result => result.data || result)
        );

        const allData = await Promise.all(promises);

        // Create city cards
        cityCardsEl.innerHTML = allData.map(data => createCityCard(data)).join('');

        
        comparisonEl.innerHTML = createComparison(allData);

        document.getElementById('last-fetch').textContent = 
            `Last updated: ${new Date().toLocaleTimeString('en-IN')}`;

        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';

    } catch (error) {
        console.error('Error fetching weather data:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.textContent = `Error: ${error.message}. Please check your API configuration and try again.`;
    }
}


window.addEventListener('load', fetchWeatherData);

setInterval(fetchWeatherData, 300000);
