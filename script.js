
// DOM Elements
const countryInput = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const results = document.getElementById('results');
const loading = document.getElementById('loading');
const error = document.getElementById('error');

// Country Info Elements
const countryName = document.getElementById('country-name');
const countryFlag = document.getElementById('country-flag');
const countryCapital = document.getElementById('country-capital');
const countryPopulation = document.getElementById('country-population');
const countryLanguage = document.getElementById('country-language');

// Info Sections
const weatherInfo = document.getElementById('weather-info');
const culturalInfo = document.getElementById('cultural-info');

const festivalsInfo = document.getElementById('festivals-info');
const quizArea = document.getElementById('quiz-area');

// Event Listeners
searchBtn.addEventListener('click', searchCountry);
countryInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') searchCountry();
});

// Main search function
async function searchCountry() {
    const country = countryInput.value.trim();
    if (!country) {
        showError("Please enter a country name");
        return;
    }

    // Show loading, hide results and error
    loading.style.display = 'block';
    results.style.display = 'none';
    error.style.display = 'none';

    try {
        // 1. Get basic country info from RestCountries
        const countryData = await getCountryData(country);

        // 2. Get weather data
        const weatherData = await getWeatherData(countryData.capital, countryData.countryCode);

        // 3. Get cultural info from Wikipedia
        const cultureData = await getCultureData(country);

        // 4. Get country image


        // 5. Get festivals (using mock data since no free API available)
        const festivals = getFestivals(country);

        // 6. Generate quiz
        const quiz = generateQuiz(country);

        // Display all the data
        displayCountryInfo(countryData);
        displayWeather(weatherData);
        displayCulture(cultureData);
        displayFestivals(festivals);
        displayQuiz(quiz);

        // Show results
        results.style.display = 'block';

    } catch (err) {
        console.error("Error:", err);
        showError("Failed to get country data. Please try another country.");
    } finally {
        loading.style.display = 'none';
    }
}

// Get country data from RestCountries
async function getCountryData(country) {
    const response = await fetch(`https://restcountries.com/v3.1/name/${country}`);
    if (!response.ok) throw new Error("Country not found");

    const data = await response.json();
    const countryInfo = data[0];

    return {
        name: countryInfo.name.common,
        capital: countryInfo.capital?.[0] || "Not available",
        population: countryInfo.population.toLocaleString(),
        languages: countryInfo.languages ? Object.values(countryInfo.languages).join(", ") : "Not available",
        flag: countryInfo.flags.png,
        countryCode: countryInfo.cca2
    };
}

// Get weather data from OpenWeatherMap (free tier)
async function getWeatherData(city, countryCode) {
    if (!city) return null;

    try {
        // Note: In a real app, you'd need to sign up for a free API key
        // This is a simulated response to avoid requiring API keys
        const weatherConditions = ["Sunny", "Rainy", "Cloudy", "Snowy"];
        const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

        return {
            temp: Math.floor(Math.random() * 30) + 10, // 10-40°C
            condition: randomCondition,
            humidity: Math.floor(Math.random() * 50) + 30 // 30-80%
        };

        // Real API call would look like:
        // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},${countryCode}&units=metric&appid=YOUR_API_KEY`);
        // const data = await response.json();
        // return {
        //     temp: data.main.temp,
        //     condition: data.weather[0].main,
        //     humidity: data.main.humidity
        // };

    } catch (err) {
        console.error("Weather API error:", err);
        return {
            temp: 20,
            condition: "Sunny",
            humidity: 50
        };
    }
}

// Get cultural info from Wikipedia API
async function getCultureData(country) {
    try {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${country}`);
        const data = await response.json();

        // Extract the most relevant cultural information
        let culturalText = data.extract || "Cultural information not available";

        // Shorten if too long
        if (culturalText.length > 500) {
            culturalText = culturalText.substring(0, 500) + "...";
        }

        return culturalText;
    } catch (err) {
        console.error("Wikipedia API error:", err);
        return "Cultural information not available at this time.";
    }
}



// Get festivals (mock data)
function getFestivals(country) {
    const normalizedCountry = country.toLowerCase();
    const festivalData = {
        "japan": [
            "Cherry Blossom Festival (March-April)",
            "Gion Matsuri (July)",
            "Tanabata (July)"
        ],
        "france": [
            "Bastille Day (July 14)",
            "Cannes Film Festival (May)",
            "Nice Carnival (February)"
        ],
        "india": [
            "Diwali (October-November)",
            "Holi (March)",
            "Durga Puja (September-October)"
        ],
        "default": [
            "New Year's Day (January 1)",
            "National Day (varies by country)",
            "Harvest Festival (varies by region)"
        ]
    };

    return festivalData[normalizedCountry] || festivalData.default;
}

// Generate quiz (mock data)
function generateQuiz(country) {
    const normalizedCountry = country.toLowerCase();
    const quizData = {
        "japan": {
            question: "What is considered rude when eating in Japan?",
            options: ["Slurping noodles", "Sticking chopsticks upright in rice", "Eating sushi with hands", "Sharing food"],
            answer: 1
        },
        "france": {
            question: "How many kisses are typical when greeting in France?",
            options: ["1", "2", "3", "4"],
            answer: 1
        },
        "india": {
            question: "What should you avoid doing with your left hand in India?",
            options: ["Writing", "Eating", "Waving", "All of the above"],
            answer: 1
        },
        "default": {
            question: "What is the traditional greeting in this country?",
            options: ["Handshake", "Bow", "Kiss on the cheek", "Namaste"],
            answer: 0
        }
    };

    return quizData[normalizedCountry] || quizData.default;
}

// Display functions
function displayCountryInfo(data) {
    countryName.textContent = data.name;
    countryFlag.src = data.flag;
    countryFlag.alt = `Flag of ${data.name}`;
    countryCapital.textContent = `Capital: ${data.capital}`;
    countryPopulation.textContent = `Population: ${data.population}`;
    countryLanguage.textContent = `Languages: ${data.languages}`;
}

function displayWeather(data) {
    const weatherIcon = getWeatherIcon(data.condition);
    weatherInfo.innerHTML = `
                <i class="fas ${weatherIcon} weather-icon"></i>
                <div>
                    <div class="weather-temp">${data.temp}°C</div>
                    <div class="weather-details">${data.condition} • Humidity: ${data.humidity}%</div>
                </div>
            `;
}

function displayCulture(text) {
    culturalInfo.innerHTML = `<p>${text}</p>`;
}



function displayFestivals(festivals) {
    festivalsInfo.innerHTML = `
                <ul>
                    ${festivals.map(fest => `<li>${fest}</li>`).join('')}
                </ul>
            `;
}

function displayQuiz(quiz) {
    quizArea.innerHTML = `
                <p class="quiz-question">${quiz.question}</p>
                <div class="quiz-options">
                    ${quiz.options.map((opt, i) => `
                        <div class="quiz-option" onclick="checkAnswer(${i}, ${quiz.answer})">${opt}</div>
                    `).join('')}
                </div>
            `;
}

// Helper functions
function getWeatherIcon(condition) {
    const icons = {
        "Sunny": "fa-sun",
        "Rainy": "fa-cloud-rain",
        "Cloudy": "fa-cloud",
        "Snowy": "fa-snowflake"
    };
    return icons[condition] || "fa-cloud-sun";
}

function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
}

// Quiz answer checking
window.checkAnswer = function (selected, correct) {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((opt, i) => {
        if (i === correct) {
            opt.style.backgroundColor = '#4caf50';
            opt.style.color = 'white';
        } else if (i === selected && selected !== correct) {
            opt.style.backgroundColor = '#f44336';
            opt.style.color = 'white';
        }
        opt.style.pointerEvents = 'none';
    });
};