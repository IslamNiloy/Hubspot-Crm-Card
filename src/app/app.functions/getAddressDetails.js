const axios = require("axios");

exports.main = async (context = {}) => {
  const { placeId } = context.parameters;

  try {
    // Call Google Places API to get address details
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;  // Your Google API key
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;
    console.log("i'm here")
    const response = await axios.get(detailsUrl);
    // console.log(response)
    if (response.data.status === "OK") {
      const result = response.data.result;

      const addressComponents = result.address_components;
      const street = addressComponents.find(comp => comp.types.includes("route"))?.long_name || "";
      const city = addressComponents.find(comp => comp.types.includes("locality"))?.long_name || "";
      const state = addressComponents.find(comp => comp.types.includes("administrative_area_level_1"))?.long_name || "";
      const zip = addressComponents.find(comp => comp.types.includes("postal_code"))?.long_name || "";
    // console.log(street)
    // console.log(city)
    // console.log(state)
    // console.log(zip)
      return { success: true, details: { street, city, state, zip } };
    } else {
      return { success: false, message: "Failed to fetch address details." };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};
