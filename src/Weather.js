import React, { useState, useEffect } from 'react';
import './Weather.css';
import search from './assets/search.png'; // Ensure this path is correct

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    // Fetch weather based on geolocation when component mounts
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchLocalWeather(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setError('Geolocation error: Unable to retrieve your location');
      }
    );
  });

  // Function to fetch weather data based on city name
  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=707ce6558afd6ec907e3eab8d7a7adf2`
      );
      const weatherData = await weatherResponse.json();
      if (weatherData.cod === 200) {
        setWeather(weatherData);
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=707ce6558afd6ec907e3eab8d7a7adf2`
        );
        const forecastData = await forecastResponse.json();
        setForecast(forecastData);

        // Fetch country based on coordinates from weather data
        if (weatherData.coord) {
          const countryResponse = await fetchCountry(weatherData.coord.lat, weatherData.coord.lon);
          setCountry(countryResponse);
        }

        // Fetch date and time based on coordinates from weather data
        const datetimeResponse = await fetchDateTime(weatherData.coord.lat, weatherData.coord.lon);
        setCurrentDateTime(datetimeResponse);
      } else {
        setError(`Error: ${weatherData.message}`);
        setWeather(null);
        setForecast(null);
        setCountry('');
      }
    } catch (error) {
      setError('Network error: Unable to fetch the weather data');
      setWeather(null);
      setForecast(null);
      setCountry('');
    }
    setLoading(false);
  };

  // Function to fetch date and time based on geographic coordinates
  const fetchDateTime = async (lat, lon) => {
    try {
      const timezoneResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=707ce6558afd6ec907e3eab8d7a7adf2`
      );
      const timezoneData = await timezoneResponse.json();
      if (timezoneData.dt) {
        const localDateTime = new Date(timezoneData.dt * 1000).toLocaleString();
        return localDateTime;
      } else {
        return 'Unknown';
      }
    } catch (error) {
      console.error('Error fetching date and time:', error);
      return 'Unknown';
    }
  };

  // Function to fetch country based on geographic coordinates
  const fetchCountry = async (lat, lon) => {
    try {
      const countryResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=707ce6558afd6ec907e3eab8d7a7adf2`
      );
      const countryData = await countryResponse.json();
      if (countryData.sys && countryData.sys.country) {
        return countryData.sys.country;
      } else {
        return 'Unknown';
      }
    } catch (error) {
      console.error('Error fetching country:', error);
      return 'Unknown';
    }
  };

  // Function to fetch weather data based on geolocation
  const fetchLocalWeather = async (lat, lon) => {
    setLoading(true);
    setError('');
    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=707ce6558afd6ec907e3eab8d7a7adf2`
      );
      const weatherData = await weatherResponse.json();
      if (weatherData.cod === 200) {
        setWeather(weatherData);
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=707ce6558afd6ec907e3eab8d7a7adf2`
        );
        const forecastData = await forecastResponse.json();
        setForecast(forecastData);

        // Fetch country based on coordinates from weather data
        const countryResponse = await fetchCountry(lat, lon);
        setCountry(countryResponse);

        // Fetch date and time based on coordinates from weather data
        const datetimeResponse = await fetchDateTime(lat, lon);
        setCurrentDateTime(datetimeResponse);
      } else {
        setError(`Error: ${weatherData.message}`);
        setWeather(null);
        setForecast(null);
        setCountry('');
      }
    } catch (error) {
      setError('Network error: Unable to fetch the weather data');
      setWeather(null);
      setForecast(null);
      setCountry('');
    }
    setLoading(false);
  };

  // Handler for input change (city name)
  const handleChange = (e) => {
    setCity(e.target.value);
  };

  // Handler for form submission (search button click or Enter key press)
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather();
  };

  return (
    <div className="weather-container">
      <form onSubmit={handleSubmit} className="weather-form">
        <input
          type="text"
          value={city}
          onChange={handleChange}
          placeholder="Enter city name"
        />
        <button type="submit">
          <img src={search} alt="Search" />
        </button>
      </form>
      {/* Loading indicator */}
      {loading && <p className="loading">Loading...</p>}
      {/* Error message */}
      {error && <p className="error">{error}</p>}
      {/* Display weather information */}
      {weather && (
        <div className="weather-info">
          <h2>{weather.name}, {country}</h2>
          <p>{weather.weather[0].description}</p>
          <p>{weather.main.temp}°C</p>
          <p>{currentDateTime}</p> {/* Display current date and time */}
        </div>
      )}
      {/* Display forecast information */}
      {forecast && (
        <div className="forecast-info">
          <h2>Forecast</h2>
          <div className="forecast-grid">
            {forecast.list.slice(0, 5).map((item) => (
              <div key={item.dt} className="forecast-item">
                <p>{new Date(item.dt * 1000).toLocaleDateString()}</p>
                <p>{item.weather[0].description}</p>
                <p>{item.main.temp}°C</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
