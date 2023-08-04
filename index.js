const API_KEY = "bdfdfd232a42fc04669a3bda79b8ecc3"

const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]


const getCurrentWeather = async (lat, lon) => {
    response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
    return response.json()
}

const getCityDetails = async (city) => {
    let url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`
    response = await fetch(url)
    return response.json()
}

const showCitiesOptions = async (event) => {
    let city_entry = event.target.value

    if (city_entry) {
        cityDetails = await getCityDetails(city_entry)
        options = ""
        cityDetails.map(city => {
            options += `<option value="${city.name}, ${city.state}, ${city.country}" data-city-lat-lon="${city.lat} ${city.lon}"></option>`
        })
        city_datalist = document.querySelector("#cities")
        city_datalist.innerHTML = options
    }

}

const loadCurrentWeather = ({ name: city, main: { temp, temp_min, temp_max }, weather: [{ description }] }) => {
    currentweatherChilds = document.querySelectorAll(".current-weather>*")
    currentweatherChilds[0].textContent = city;
    currentweatherChilds[1].textContent = `${temp}°`;
    currentweatherChilds[2].textContent = description;
    currentweatherChilds[3].textContent = `H:${temp_max}°   L:${temp_min}°`;

}

const get5day4hrforecast = async (lat, lon) => {
    response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
    return response.json()
}

const getIcon = (icon) => {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`
}

const formatAMPM = (date) => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

const loadHourlyForecast = ({ main: { temp }, weather: [{ icon }] }, forecast) => {
    // "2023-05-25 06:00:00" - get current time in this format 

    current_time = new Date().toTimeString().split(" ")[0]
    // current date 
    let [month, date, year] = new Date().toLocaleDateString().split("/")
    month = month.length == 2 ? month : "0" + month
    current_date = `${year}-${month}-${date}`
    current_date_time = current_date + " " + current_time

    let starting_index;
    next_forecast = forecast.list.find((forecast_ele, index) => {
        starting_index = index
        return forecast_ele.dt_txt > current_date_time
    })

    hourlyforecast = document.querySelector(".hourly-forecast-container>article");
    hourlyforecast_childs = `<section class="hourly-forecast">
    <p class="text-lg">Now</p>
    <img src="${getIcon(icon)}" alt="weather-img" class="w-24 h-24 mt-9 mb-4">
    <p>${temp}°</p>
</section>`

    forecast.list.slice(starting_index).map(forecast_ele => {
        hourlyforecast_childs += `<section class="hourly-forecast space-y-2 w-[100px]">
    <p class="text-lg">${new Date(forecast_ele.dt_txt).toDateString().split(" ").slice(1, 3).join(" ")}</p>
    <p class="text-lg">${formatAMPM(new Date(forecast_ele.dt_txt))}</p>
    <img src="${getIcon(forecast_ele.weather[0].icon)}" alt="weather-img" class="w-24 h-24">
    <p>${forecast_ele.main.temp}°</p >
</section > `
    })
    hourlyforecast.innerHTML = hourlyforecast_childs

}
const dateText = (date_num) => {
    if (date_num == 0) {
        return 'Today'
    }
    return days[(new Date().getDay() + date_num) % 7]
}

const loadfivedayForecast = (forecast) => {
    current_day_i = 0
    let weather_img;
    let mint = 1000, maxt = -1000;
    day_date = forecast.list[0].dt_txt.split(" ")[0]
    day_weather_icon = forecast.list[0].weather[0].icon
    fivedayForecastHTML = ""

    for (let hourlyf of forecast.list) {
        if (day_date == hourlyf.dt_txt.split(" ")[0]) {
            mint = Math.min(mint, hourlyf.main.temp_min)
            maxt = Math.max(maxt, hourlyf.main.temp_max)
        }
        else {
            fivedayForecastHTML += `
            <section class="five-day-forecast grid grid-cols-4 justify-between gap-2  items-center">
                    <p class="text-lg">${dateText(current_day_i)}</p>
                    <img src="${getIcon(day_weather_icon)}" alt="weather-img">
                    <p class="opacity-40">${mint}°</p>
                    <p>${maxt}°</p>
                </section>`

            day_date = hourlyf.dt_txt.split(" ")[0]
            day_weather_icon = hourlyf.weather[0].icon
            mint = hourlyf.main.temp_min
            maxt = hourlyf.main.temp_max
            current_day_i += 1
        }
    }

    fivedayForecastHTML += `
    <section class="five-day-forecast grid grid-cols-4 justify-between gap-2  items-center">
    <p class="text-lg">${dateText(current_day_i)}</p>
    <img src="${getIcon(day_weather_icon)}" alt="weather-img">
    <p class="opacity-40">${mint}</p>
    <p>${maxt}</p>
</section>`

    document.querySelector(".five-day-forecast-container>article").innerHTML = fivedayForecastHTML


}

const loadFeelsLike = ({ main: { feels_like } }) => {
    document.querySelector(".feels-like .feels-like-temp").textContent = `${feels_like}°`
}
const loadHumidity = ({ main: { humidity } }) => {
    document.querySelector(".humidity .humid-value").textContent = `${humidity}%`
}

const loadData = async (lat, lon) => {
    currentWeather = await getCurrentWeather(lat, lon);

    loadCurrentWeather(currentWeather)
    forecast = await get5day4hrforecast(lat, lon)
    loadHourlyForecast(currentWeather, forecast)
    // console.log(forecast);


    loadfivedayForecast(forecast)
    loadFeelsLike(currentWeather)
    loadHumidity(currentWeather)
}
const handleCitySelection = () => {
    let citytext = event.target.value
    // console.log(citytext); // eg : Pune, Maharashtra, IN
    matchingnode = Array.from(document.querySelector("#cities").childNodes).find(citynode => citynode.value == citytext);
    let cityCoordinates = matchingnode?.dataset.cityLatLon;
    if (cityCoordinates) {
        [lat, lon] = cityCoordinates.split(" ");
        loadData(lat, lon)
    }




}

const loadWeatherDetailsCurrentLoc = () => {
    navigator.geolocation.getCurrentPosition((postion) => {
        loadData(postion.coords.latitude, postion.coords.longitude)
    })
}

function debounce(fun) {
    let timer;
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            fun.apply(this, args)
        }, 500)
    }
}

const debouceSearch = debounce((event) => showCitiesOptions(event))

document.addEventListener("DOMContentLoaded", () => {

    // show data based on current location 
    loadWeatherDetailsCurrentLoc()


    search = document.querySelector("#search")
    // search.addEventListener("input", showCitiesOptions)
    search.addEventListener("input", debouceSearch)
    search.addEventListener("change", handleCitySelection)


})