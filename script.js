let map;
let marker;

const OW_KEY = "113b48090a3af60c1239db547baabd87";

// Initialize the map
function initMap() {
    // Default location: Mumbai, Maharashtra, India
    const defaultLoc = { lat: 19.0760, lng: 72.8777 };

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: defaultLoc,
    });

    marker = new google.maps.Marker({
        position: defaultLoc,
        map: map,
    });

    // Handle map loading and mobile resizing
    google.maps.event.addListenerOnce(map, 'idle', function(){
        const loader = document.getElementById('map-loader');
        if (loader) loader.style.display = 'none';
        
        // Force resize to fix blank map issues on mobile
        google.maps.event.trigger(map, 'resize');
        map.setCenter(defaultLoc);
    });

    // Handle window resize to ensure map is responsive
    window.addEventListener('resize', () => {
        if (map) {
            google.maps.event.trigger(map, 'resize');
            if (marker) map.setCenter(marker.getPosition());
        }
    });

    // Load Mumbai weather on page load
    fetchWeatherByCity("Mumbai, Maharashtra, India");
}

// Fallback if Google Maps fails to load
setTimeout(() => {
    if (!window.google || !window.google.maps) {
        const loader = document.getElementById('map-loader');
        if (loader) {
            loader.innerHTML = '<p style="color: red; font-weight: bold; font-size: 1.2rem;">Failed to load map. Please check your connection.</p>';
        }
    }
}, 10000);

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

        // Update box1 background dynamically based on temperature range
        const temp = Math.round(w.main.temp);
        const box1 = document.querySelector(".box1");
        if (box1) {
            let bgUrl = "";
            if (temp < 5) {
                bgUrl = "https://images.unsplash.com/photo-1516820208784-270b250306e3?q=90&w=1920"; // Very Cold: Snowy/Icy
            } else if (temp >= 5 && temp < 15) {
                bgUrl = "https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?q=90&w=1920"; // Cold: Foggy/Winter
            } else if (temp >= 15 && temp < 22) {
                bgUrl = "https://images.unsplash.com/photo-1561553873-e8491a564fd0?q=90&w=1920"; // Cool: Cloudy/Soft blue sky
            } else if (temp >= 22 && temp < 30) {
                bgUrl = "https://images.unsplash.com/photo-1601297183305-6df142704ea2?q=90&w=1920"; // Warm: Sunny pleasant
            } else if (temp >= 30 && temp < 38) {
                bgUrl = "https://images.unsplash.com/photo-1504386106331-3e4e71712b38?q=90&w=1920"; // Hot: Bright summer/Sunlight
            } else {
                bgUrl = "https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=90&w=1920"; // Extreme Heat: Desert
            }
            box1.style.backgroundImage = `url('${bgUrl}')`;
        }

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

    // Hamburger menu logic
    const hamburger = document.getElementById('hamburger-menu');
    const overlayMenu = document.getElementById('overlay_menu');
    if (hamburger && overlayMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            overlayMenu.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        const menuLinks = overlayMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                overlayMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!hamburger.contains(event.target) && !overlayMenu.contains(event.target) && overlayMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                overlayMenu.classList.remove('active');
            }
        });
    }

    // Smooth scroll to top when clicking logo on home page
    const navLeft = document.querySelector('.nav-left');
    if (navLeft) {
        navLeft.addEventListener('click', (e) => {
            const path = window.location.pathname;
            if (path.endsWith('index.html') || path.endsWith('/') || path === '') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
});

window.initMap = initMap;

// for install app

let deferredPrompt;

const installBox = document.querySelector(".installbtn");
const installBtn = document.getElementById("installBtn");

// Default hidden
installBox.style.display = "none";

// Install prompt available
window.addEventListener("beforeinstallprompt", (e) => {

    e.preventDefault();

    deferredPrompt = e;

    // Agar app pehle se install nahi hai
    if(localStorage.getItem("appInstalled") !== "true"){
        installBox.style.display = "flex";
    }

});

// Install button click
installBtn.addEventListener("click", async () => {

    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {

        console.log("App Installed");

        // Hide install box
        installBox.style.display = "none";

        // Save installed status
        localStorage.setItem("appInstalled", "true");
    }

    deferredPrompt = null;

});

// App installed successfully
window.addEventListener("appinstalled", () => {

    console.log("PWA Installed");

    installBox.style.display = "none";

    localStorage.setItem("appInstalled", "true");

});