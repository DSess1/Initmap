
// console log the promise to see where to get the latitude and longitude values
// console.log(currentPos)
async function getCurrentCoords (){
    let currentPos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
    
// console log the promise to see where to get the latitude and longitude values
// console.log(currentPos)
    return [currentPos.coords.latitude, currentPos.coords.longitude]
}

// user location map object

const myMap = {
         coordinates: [],      //coordinates from the getcoords function. used to render map 
         displayMap: {},       //the display map object
         businessObject: {},   // object.. foursquare function
         businessInfo: [],     // business info to use for making the map markers

// Build the map function
    buildMap: function() {
         this.displayMap = L.map('userMap').setView([this.coordinates[0], this.coordinates[1]], 15);

          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 20,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
       }).addTo(this.displayMap);

         L.marker([this.coordinates[0], this.coordinates[1]]).addTo(this.displayMap).bindPopup('<p1><b>Your Location</b></p1>').openPopup();
    },

// creates an array of the 5 closest businesses and alo adds markers to the map. 
     addBusinessInfo: function(objectName) {
        for (i=0; i< objectName.length; i++) {
            this.businessInfo[i]= ({
                name: objectName[i].name,
                address: objectName[i].location.formatted_address,
                lat: objectName[i].geocodes.main.latitude,
                long: objectName[i].geocodes.main.longitude
            })
        }
        for (i=0; i< this.businessInfo.length; i++) {
            L.marker([this.businessInfo[i].lat, this.businessInfo[i].long])
                .addTo(this.displayMap)
                .bindPopup(`<p1><b>${this.businessInfo[i].name}</b></p1>`)
                .openPopup()
        }
        console.log("business info after addBusinessInfo function for loop: ", this.businessInfo)
    },

}

// makes current coordinates available to use in create map function/object and adds the map onto the page
// creates a map in the div using the users current location
window.onload = async () => {
    const coords = await getCurrentCoords()
          myMap.coordinates = coords
          myMap.buildMap()
   // console.log(myMap)
}

async function getBusinessMarkers (category,latLong){
    // uses foursquare function to get the 5 businesses of  selected category
    const businessData = await placeSearch(category,latLong) 
          myMap.businessObject = businessData // saves the businesses to an object

    // business object inside  object myMap.. (myMap.businessObject)
          myMap.addBusinessInfo(myMap.businessObject)
    
}

 // gives choice to selects category from the drop down menu
 // which calls the function that genrates the markers on the map. 
let selectCategoryElement = document.getElementById("location-category-select")
          selectCategoryElement.onchange = function() {
          getBusinessMarkers(this.value, myMap.coordinates)
        }

 // finds the 5 closest locations of  chosen category

 // function from foursquare... with 'try' and  'catch' allows to test block of code for errors
async function placeSearch (category,latLong) {
    try {
        const searchParams = new URLSearchParams({
            query: category,
            ll: latLong,
            open_now: 'true',
            sort: 'DISTANCE',
            limit: 5
        });
        const results = await fetch(
            `https://api.foursquare.com/v3/places/search?${searchParams}`,
            {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: 'fsq3YPQLlbVUcXXB0CK5p3Qv4jqzDO9M8F6l63w1iRNxplU=',
            }
            }
        );

// returns businesses
        const data = await results.json();
        console.log("data inside the foursquare function: " , data)
        const businesses = data.results      
        console.log("business info inside foursquare function: ", businesses) 
        return businesses; 
    } catch (err) {
        console.error(err);
    } 
}