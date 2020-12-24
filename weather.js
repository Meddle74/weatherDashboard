var city = '';
var searchCity = $('#search-city');
var searchButton = $('#search-button');
var clearButton = $('#clear-history');
var currentCity = $('#current-city');
var currentTemperature = $('#temperature');
var currentHumidty = $('#humidity');
var currentWSpeed = $('#wind-speed');
var currentUvindex = $('#uv-index');
var Cities = [];

function find(location) {
  for (var i = 0; i < Cities.length; i++) {
    if (location.toUpperCase() === Cities[i]) {
      return -1;
    }
  }
  return 1;
}

var APIKey = '71ca48a145c1e2fcc01d2affe81d6050';

function displayWeather(event) {
  event.preventDefault();
  if (searchCity.val().trim() !== '') {
    city = searchCity.val().trim();
    currentWeather(city);
  }
}
function currentWeather(city) {
  var queryURL =
    'https://api.openweathermap.org/data/2.5/weather?q=' +
    city +
    '&APPID=' +
    APIKey;
  $.ajax({
    url: queryURL,
    method: 'GET',
  }).then(function (response) {
    var weathericon = response.weather[0].icon;
    var iconurl =
      'https://openweathermap.org/img/wn/' + weathericon + '@2x.png';
    var date = new Date(response.dt * 1000).toLocaleDateString();
    $(currentCity).html(
      response.name + '(' + date + ')' + '<img src=' + iconurl + '>'
    );
    console.log(weathericon);
    var tempF = (response.main.temp - 273.15) * 1.8 + 32;
    $(currentTemperature).html(tempF.toFixed(0) + '&#8457');
    $(currentHumidty).html(response.main.humidity + '%');
    var ws = response.wind.speed;
    var wind = (ws * 2.237).toFixed(0);
    $(currentWSpeed).html(wind + 'MPH');
    uVIndex(response.coord.lon, response.coord.lat);
    forecast(response.id);
    if (response.cod == 200) {
      Cities = JSON.parse(localStorage.getItem('cityname'));
      if (Cities == null) {
        Cities = [];
        Cities.push(city.toUpperCase());
        localStorage.setItem('cityname', JSON.stringify(Cities));
        addToList(city);
      } else {
        if (find(city) > 0) {
          Cities.push(city.toUpperCase());
          localStorage.setItem('cityname', JSON.stringify(Cities));
          addToList(city);
        }
      }
    }
  });
}
function uVIndex(ln, lt) {
  var uvqURL =
    'https://api.openweathermap.org/data/2.5/uvi?appid=' +
    APIKey +
    '&lat=' +
    lt +
    '&lon=' +
    ln;
  $.ajax({
    url: uvqURL,
    method: 'GET',
  }).then(function (response) {
    $(currentUvindex).html(response.value);
  });
}

function forecast(cityid) {
  var dayover = false;
  var queryforcastURL =
    'https://api.openweathermap.org/data/2.5/forecast?id=' +
    cityid +
    '&appid=' +
    APIKey;
  $.ajax({
    url: queryforcastURL,
    method: 'GET',
  }).then(function (response) {
    for (i = 0; i < 5; i++) {
      var date = new Date(
        response.list[(i + 1) * 8 - 1].dt * 1000
      ).toLocaleDateString();
      var iconcode = response.list[(i + 1) * 8 - 1].weather[0].icon;
      var iconurl = 'https://openweathermap.org/img/wn/' + iconcode + '.png';
      var tempK = response.list[(i + 1) * 8 - 1].main.temp;
      var tempF = ((tempK - 273.5) * 1.8 + 32).toFixed(0);
      var humidity = response.list[(i + 1) * 8 - 1].main.humidity;

      $('#forecastDate' + i).html(date);
      $('#forecastImg' + i).html('<img src=' + iconurl + '>');
      $('#forecastTemp' + i).html(tempF + '&#8457');
      $('#forecastHumidity' + i).html(humidity + '%');
    }
  });
}

function addToList(location) {
  var listEl = $('<li>' + location.toUpperCase() + '</li>');
  $(listEl).attr('class', 'list-group-item');
  $(listEl).attr('data-value', location.toUpperCase());
  $('.list-group').append(listEl);
}
function searchHistory(event) {
  var liEl = event.target;
  if (event.target.matches('li')) {
    city = liEl.textContent.trim();
    currentWeather(city);
  }
}

function loadlastCity() {
  $('ul').empty();
  var Cities = JSON.parse(localStorage.getItem('cityname'));
  if (Cities !== null) {
    Cities = JSON.parse(localStorage.getItem('cityname'));
    for (i = 0; i < Cities.length; i++) {
      addToList(Cities[i]);
    }
    city = Cities[i - 1];
    currentWeather(city);
  }
}
function clearHistory(event) {
  event.preventDefault();
  Cities = [];
  localStorage.removeItem('cityname');
  document.location.reload();
}
$('#search-button').on('click', displayWeather);
$(document).on('click', searchHistory);
$(window).on('load', loadlastCity);
$('#clear-history').on('click', clearHistory);
