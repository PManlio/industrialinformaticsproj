let getCityWeather = require("./provaUtility")


const cities = ['Catania', 'Palermo','Messina'];

const city_data_map = { };

// a infinite round-robin iterator over the city array
const next_city  = ((arr) => {
   let counter = arr.length;
   return function() {
      counter += 1;
      if (counter>=arr.length) {
        counter = 0;
      }
      return arr[counter];
   };
})(cities);

async function update_city_data(city) {

    try {
        city_data_map[city] =await getCityWeather(city);
    }
    catch(err) {
        console.log("error city",city , err);
        return ;
    }
}

// make a API call every 10 seconds
const interval = 10 * 1000;
setInterval(async () => {
     const city = next_city();
     console.log("updating city =",city);
     await update_city_data(city);
}, interval);

console.log(city_data_map);