// Variables globales
const postalInput = document.getElementById("postal-input");
const cityDropdown = document.getElementById("cityDropdown");
const submitBtn = document.getElementById("submitBtn");
const themeToggle = document.getElementById("themeToggle");
const dayBtns = document.querySelectorAll(".day-btn");

let selectedDays = 1;
let selectedCityCode = "";
let selectedCityName = "";

// Gestion du thème
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    themeToggle.textContent = isLight ? "🌙" : "☀️";
    localStorage.setItem("theme", isLight ? "light" : "dark");
});

// Charger le thème sauvegardé
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    themeToggle.textContent = "🌙";
}

// Gestion des boutons de jours
dayBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        dayBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedDays = parseInt(btn.dataset.days);
    });
});

// API Communes
async function getCitiesFromZip(zip) {
    try {
        const res = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${zip}`);
        return await res.json();
    } catch (err) {
        console.error("Erreur API Geo :", err);
        return [];
    }
}

function populateCityOptions(cities) {
    cityDropdown.innerHTML = "";
    if (cities.length > 0) {
        cities.forEach(city => {
            const opt = document.createElement("option");
            opt.value = city.code;
            opt.textContent = city.nom;
            cityDropdown.appendChild(opt);
        });
        cityDropdown.style.display = "block";
        submitBtn.style.display = "inline-block";
    } else {
        alert("Code postal invalide.");
        cityDropdown.style.display = "none";
        submitBtn.style.display = "none";
    }
}

postalInput.addEventListener("input", async () => {
    const zip = postalInput.value;
    if (/^\d{5}$/.test(zip)) {
        const cities = await getCitiesFromZip(zip);
        populateCityOptions(cities);
    } else {
        cityDropdown.style.display = "none";
        submitBtn.style.display = "none";
    }
});

// Soumission du formulaire
submitBtn.addEventListener("click", async () => {
    selectedCityCode = cityDropdown.value;
    selectedCityName = cityDropdown.options[cityDropdown.selectedIndex].text;
    
    if (!selectedCityCode) return;

    try {
        // Récupérer les données pour tous les jours sélectionnés
        const weatherPromises = [];
        for (let i = 0; i < selectedDays; i++) {
            weatherPromises.push(
                fetch(`https://api.meteo-concept.com/api/forecast/daily/${i}?token=30d71a74ad1c665d279168dca98378581270be4587da3ab13c51ffde8de4cbae&insee=${selectedCityCode}`)
                    .then(res => res.json())
            );
        }

        const weatherData = await Promise.all(weatherPromises);
        renderWeatherCards(weatherData);
        changeBackground(weatherData[0].forecast.weather);
        
    } catch (err) {
        console.error("Erreur API MétéoConcept :", err);
        alert("Erreur lors de la récupération des données météo.");
    }
});

function getWeatherIcon(code) {
    if (code === 0) return "☀️";
    if ([1, 2].includes(code)) return "🌤️";
    if ([3, 4, 5].includes(code)) return "☁️";
    if ([6, 7].includes(code)) return "🌫️";
    if ((code >= 10 && code <= 16) || (code >= 40 && code <= 48) || (code >= 210 && code <= 212)) return "🌧️";
    if ((code >= 20 && code <= 22) || (code >= 30 && code <= 32) || (code >= 60 && code <= 78) || (code >= 220 && code <= 232)) return "❄️";
    if ((code >= 100 && code <= 108) || (code >= 120 && code <= 142)) return "⛈️";
    if (code === 235) return "🌨️";
    return "🌈";
}

function getWeatherLabel(code) {
    if (code === 0) return "Soleil";
    if ([1, 2].includes(code)) return "Peu nuageux";
    if ([3, 4, 5].includes(code)) return "Nuageux";
    if ([6, 7].includes(code)) return "Brouillard";
    if ((code >= 10 && code <= 16) || (code >= 40 && code <= 48) || (code >= 210 && code <= 212)) return "Pluie";
    if ((code >= 20 && code <= 22) || (code >= 30 && code <= 32) || (code >= 60 && code <= 78) || (code >= 220 && code <= 232)) return "Neige";
    if ((code >= 100 && code <= 108) || (code >= 120 && code <= 142)) return "Orage";
    if (code === 235) return "Grêle";
    return "Variable";
}

function changeBackground(code) {
    const hero = document.querySelector('.hero');
    let background = "";

    if (code === 0) {
        background = "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')";
    } else if ([1, 2].includes(code)) {
        background = "url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')";
    } else if ([3, 4, 5].includes(code)) {
        background = "url('https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')";
    } else if ([6, 7].includes(code)) {
        background = "url('https://images.unsplash.com/photo-1487621167305-5d248087c724?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')";
    } else if ((code >= 10 && code <= 16) || (code >= 40 && code <= 48) || (code >= 210 && code <= 212)) {
        background = "url('https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')";
    } else if ((code >= 20 && code <= 22) || (code >= 30 && code <= 32) || (code >= 60 && code <= 78) || (code >= 220 && code <= 232)) {
        background = "url('https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')";
    } else if ((code >= 100 && code <= 108) || (code >= 120 && code <= 142)) {
        background = "url('https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')";
    } else {
        background = "url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')";
    }

    hero.style.backgroundImage = background;
}

function getWindDirection(degrees) {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

function renderWeatherCards(weatherDataArray) {
    const section = document.getElementById("weatherResult");
    section.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = `Prévisions météo pour ${selectedCityName}`;
    title.style.textAlign = "center";
    title.style.marginBottom = "2rem";
    title.style.color = "var(--primary-color)";
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "weather-grid";

    weatherDataArray.forEach((data, index) => {
        const card = document.createElement("div");
        card.className = "weather-card fade-in";
        card.style.animationDelay = `${index * 0.1}s`;

        const date = new Date();
        date.setDate(date.getDate() + index);
        const dateStr = date.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });

        const dayTitle = document.createElement("h3");
        dayTitle.innerHTML = `<span class="weather-icon">${getWeatherIcon(data.forecast.weather)}</span>${index === 0 ? "Aujourd'hui" : dateStr}`;
        card.appendChild(dayTitle);

        const weatherInfo = document.createElement("div");
        weatherInfo.className = "weather-info";

        // Informations de base
        weatherInfo.innerHTML = `
            <p><strong>Temps:</strong> <span>${getWeatherLabel(data.forecast.weather)}</span></p>
            <p><strong>Min:</strong> <span>${data.forecast.tmin}°C</span></p>
            <p><strong>Max:</strong> <span>${data.forecast.tmax}°C</span></p>
            <p><strong>Pluie:</strong> <span>${data.forecast.probarain}%</span></p>
            <p><strong>Soleil:</strong> <span>${data.forecast.sun_hours}h</span></p>
        `;

        // Options supplémentaires
        if (document.getElementById("coords").checked) {
            weatherInfo.innerHTML += `
                <p><strong>Latitude:</strong> <span>${data.city.latitude.toFixed(4)}°</span></p>
                <p><strong>Longitude:</strong> <span>${data.city.longitude.toFixed(4)}°</span></p>
            `;
        }

        if (document.getElementById("rain").checked) {
            weatherInfo.innerHTML += `<p><strong>Cumul pluie:</strong> <span>${data.forecast.rr10 || 0} mm</span></p>`;
        }

        if (document.getElementById("wind").checked) {
            weatherInfo.innerHTML += `<p><strong>Vent:</strong> <span>${data.forecast.wind10m || 0} km/h</span></p>`;
        }

        if (document.getElementById("windDir").checked) {
            const windDir = data.forecast.dirwind10m || 0;
            weatherInfo.innerHTML += `<p><strong>Direction vent:</strong> <span>${windDir}° (${getWindDirection(windDir)})</span></p>`;
        }

        card.appendChild(weatherInfo);
        grid.appendChild(card);
    });

    section.appendChild(grid);

    const retryBtn = document.createElement("button");
    retryBtn.textContent = "Nouvelle recherche";
    retryBtn.className = "reloadButton";
    retryBtn.onclick = () => location.reload();
    section.appendChild(retryBtn);

    section.style.display = "block";
    document.getElementById("locationForm").style.display = "none";
}