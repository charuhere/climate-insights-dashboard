
const API_URL = 'https://5vaw6kvmpk.execute-api.ap-south-1.amazonaws.com/prod/latest';
const ANOMALIES_API_URL = 'https://ksgmwb8pah.execute-api.ap-south-1.amazonaws.com/prod';

const CITIES = ['Chennai', 'Delhi', 'Mumbai', 'Bangalore'];

let temperatureChart, aqiChart, deviationChart;

// Tab switching function
function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Set active button
    event.target.classList.add('active');
    
    // Resize charts if comparison tab is shown
    if (tabName === 'comparison') {
        setTimeout(() => {
            if (temperatureChart) temperatureChart.resize();
            if (aqiChart) aqiChart.resize();
            if (deviationChart) deviationChart.resize();
        }, 100);
    }
}

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

function createTemperatureChart(data) {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    
    if (temperatureChart) {
        temperatureChart.destroy();
    }

    temperatureChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.city),
            datasets: [
                {
                    label: 'Current Temperature (°C)',
                    data: data.map(d => parseFloat(d.current_temp)),
                    backgroundColor: '#ef4444',
                    borderColor: '#991b1b',
                    borderWidth: 2,
                },
                {
                    label: 'Average Temperature (°C)',
                    data: data.map(d => parseFloat(d.avg_temp)),
                    backgroundColor: '#3b82f6',
                    borderColor: '#1e40af',
                    borderWidth: 2,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { size: 12, weight: 'bold' },
                        padding: 20,
                    }
                },
                title: {
                    display: true,
                    text: 'Temperature Comparison (Current vs Average)',
                    font: { size: 14, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
}

function createAQIChart(data) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    
    if (aqiChart) {
        aqiChart.destroy();
    }

    aqiChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.city),
            datasets: [
                {
                    label: 'Current AQI',
                    data: data.map(d => parseFloat(d.current_aqi)),
                    backgroundColor: '#f59e0b',
                    borderColor: '#b45309',
                    borderWidth: 2,
                },
                {
                    label: 'Average AQI',
                    data: data.map(d => parseFloat(d.avg_aqi)),
                    backgroundColor: '#10b981',
                    borderColor: '#065f46',
                    borderWidth: 2,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { size: 12, weight: 'bold' },
                        padding: 20,
                    }
                },
                title: {
                    display: true,
                    text: 'Air Quality Index Comparison (Current vs Average)',
                    font: { size: 14, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'AQI Value'
                    }
                }
            }
        }
    });
}

function createDeviationChart(data) {
    const ctx = document.getElementById('deviationChart').getContext('2d');
    
    if (deviationChart) {
        deviationChart.destroy();
    }

    const colors = data.map(d => ({
        temp: d.is_temp_anomaly ? '#ef4444' : '#10b981',
        aqi: d.is_aqi_anomaly ? '#ef4444' : '#10b981'
    }));

    deviationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.city),
            datasets: [
                {
                    label: 'Temperature Deviation (°C)',
                    data: data.map(d => parseFloat(d.temp_deviation)),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,
                    pointBackgroundColor: data.map(d => d.is_temp_anomaly ? '#991b1b' : '#10b981'),
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                },
                {
                    label: 'AQI Deviation',
                    data: data.map(d => parseFloat(d.aqi_deviation)),
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,
                    pointBackgroundColor: data.map(d => d.is_aqi_anomaly ? '#b45309' : '#10b981'),
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { size: 12, weight: 'bold' },
                        padding: 20,
                    }
                },
                title: {
                    display: true,
                    text: 'Deviation from Average (Red Points = Anomalies Detected)',
                    font: { size: 14, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Deviation Value'
                    }
                }
            }
        }
    });
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
        // Fetch anomalies data from the endpoint
        const response = await fetch(ANOMALIES_API_URL);
        const result = await response.json();
        
        // Parse the body if it's a string (AWS Lambda response)
        let anomaliesData = result;
        if (typeof result.body === 'string') {
            anomaliesData = JSON.parse(result.body);
        }
        
        const allData = anomaliesData.anomalies || anomaliesData;

        // Convert anomaly data to match city card format for display
        const cardData = allData.map(item => ({
            city: item.city,
            temperature: parseFloat(item.current_temp),
            humidity: '70', // Default value since not in API response
            aqi: parseFloat(item.current_aqi),
            weather: 'Partly Cloudy',
            description: item.is_temp_anomaly || item.is_aqi_anomaly ? 'Anomaly Detected ⚠️' : 'Normal',
            timestamp: item.timestamp
        }));

        // Populate city cards
        cityCardsEl.innerHTML = cardData.map(data => createCityCard(data)).join('');

        // Populate comparison stats
        comparisonEl.innerHTML = createComparison(cardData);

        // Create charts with the anomalies data
        createTemperatureChart(allData);
        createAQIChart(allData);
        createDeviationChart(allData);

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
