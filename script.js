let map;
let marker;

const OW_KEY = "113b48090a3af60c1239db547baabd87";

// Initialize the map
function initMap() {
    // Default location: India
    const defaultLoc = { lat: 20.5937, lng: 78.9629 };

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 5,
        center: defaultLoc,
    });

    marker = new google.maps.Marker({
        position: defaultLoc,
        map: map,
    });

    // Load India weather on page load
    fetchWeatherByCity("India");
}

// Map OpenWeather conditions to Material Symbols
function getWeatherIcon(condition) {
    const iconMap = {
        "Clear": "sunny",
        "Clouds": "partly_cloudy_day",
        "Rain": "rainy",
        "Drizzle": "rainy",
        "Thunderstorm": "thunderstorm",
        "Snow": "cloudy_snowing",
        "Mist": "foggy",
        "Smoke": "foggy",
        "Haze": "foggy",
        "Dust": "foggy",
        "Fog": "foggy",
        "Sand": "foggy",
        "Ash": "foggy",
        "Squall": "storm",
        "Tornado": "tornado"
    };
    return iconMap[condition] || "cloud";
}

// MAIN FUNCTION — fetch everything using city name directly
async function fetchWeatherByCity(cityName) {
    try {
        const encodedCity = encodeURIComponent(cityName);

        // 1. Current Weather (Using metric for Celsius)
        const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${OW_KEY}&units=metric`
        );

        if (!weatherRes.ok) {
            throw new Error("City not found");
        }

        const w = await weatherRes.json();

        // Update current weather UI with Celsius
        const locationText = w.sys && w.sys.country ? `${w.name}, ${w.sys.country}` : w.name;
        document.querySelector(".location p").innerText = locationText;
        document.querySelector(".temprature .fera").innerText = `${Math.round(w.main.temp)}°C`;
        document.querySelector(".temprature .ferai").innerText = w.weather[0].main;
        document.querySelector(".humidity p").innerText = `Humidity: ${w.main.humidity}%`;
        
        // Display wind speed in km/h (OpenWeather metric returns m/s, so we multiply by 3.6)
        const windKmh = Math.round(w.wind.speed * 3.6);
        document.querySelector(".wind p").innerText = `Wind: ${windKmh}km/h`;
        
        document.querySelector("#forc .right p").innerText = `Feels like ${Math.round(w.main.feels_like)}°C`;

        // Move Google Map to this city
        if (w.coord && w.coord.lat !== undefined && w.coord.lon !== undefined) {
            const lat = w.coord.lat;
            const lng = w.coord.lon;
            const newPos = { lat, lng };
            map.panTo(newPos);
            map.setZoom(10); // Smooth zoom to the city level
            marker.setPosition(newPos);

            // 2. UV Index
            try {
                const uvRes = await fetch(
                    `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lng}&appid=${OW_KEY}`
                );
                if (uvRes.ok) {
                    const uvData = await uvRes.json();
                    const uvValue = Math.round(uvData.value);

                    const uvEl = document.getElementById("uvindex");
                    if (uvEl) uvEl.innerText = uvValue;

                    let uvState = "Low";
                    if (uvValue >= 3 && uvValue <= 5) uvState = "Moderate";
                    else if (uvValue >= 6 && uvValue <= 7) uvState = "High";
                    else if (uvValue >= 8 && uvValue <= 10) uvState = "Very High";
                    else if (uvValue >= 11) uvState = "Extreme";

                    const uvStateEl = document.getElementById("uvstate");
                    if (uvStateEl) uvStateEl.innerText = uvState;
                }
            } catch (e) {
                console.log("UV index skipped.");
            }
        }

        // 3. 5-Day Forecast (metric)
        const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodedCity}&appid=${OW_KEY}&units=metric`
        );
        if (!forecastRes.ok) throw new Error("Forecast fetch failed");
        const forecastData = await forecastRes.json();

        if (forecastData && forecastData.list) {
            const dailyMap = {};

            for (const item of forecastData.list) {
                const date = new Date(item.dt * 1000);
                const dayName = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();

                if (!dailyMap[dayName]) {
                    dailyMap[dayName] = {
                        dayName,
                        tempMax: item.main.temp_max,
                        tempMin: item.main.temp_min,
                        condition: item.weather[0].main,
                    };
                } else {
                    dailyMap[dayName].tempMax = Math.max(dailyMap[dayName].tempMax, item.main.temp_max);
                    dailyMap[dayName].tempMin = Math.min(dailyMap[dayName].tempMin, item.main.temp_min);
                }
            }

            const dailyData = Object.values(dailyMap).slice(0, 5);
            const forecastCards = document.querySelectorAll(".forecast-card");

            dailyData.forEach((dayInfo, index) => {
                if (forecastCards[index]) {
                    const card = forecastCards[index];
                    card.querySelector("h4").innerText = dayInfo.dayName;
                    card.querySelector("h3").innerText = `${Math.round(dayInfo.tempMax)}°C / ${Math.round(dayInfo.tempMin)}°C`;
                    card.querySelector("p").innerText = dayInfo.condition;
                    card.querySelector(".material-symbols-outlined").innerText = getWeatherIcon(dayInfo.condition);
                }
            });
        }

    } catch (error) {
        console.error("Weather fetch error:", error);
        alert("City not found");
    }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.querySelector(".search_box button");
    const searchInput = document.querySelector(".search_box input");

    if (searchButton && searchInput) {
        searchButton.addEventListener("click", () => {
            const city = searchInput.value.trim();
            if (!city) return;
            fetchWeatherByCity(city);
        });

        // Add Enter key support
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const city = searchInput.value.trim();
                if (!city) return;
                fetchWeatherByCity(city);
            }
        });
    }
});

window.initMap = initMap;