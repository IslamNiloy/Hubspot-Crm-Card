const axios = require('axios');

exports.main = async (context = {}) => {
  const { addressInput } = context.parameters;
  const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

  try {
    // console.log("i'm here")
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        addressInput
      )}&key=${GOOGLE_PLACES_API_KEY}`
    );

    const suggestions = response.data.predictions;

    return { success: true, suggestions };
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    return { success: false, message: error.message };
  }
};

// const axios = require('axios');

// exports.main = async (context = {}) => {
//   const { addressInput } = context.parameters;
//   const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

//   try {
//     const response = await axios.get(
//       `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
//         addressInput
//       )}&key=${GOOGLE_PLACES_API_KEY}`
//     );

//     const suggestions = response.data.predictions;

//     return { success: true, suggestions };
//   } catch (error) {
//     console.error('Error fetching address suggestions:', error);
//     return { success: false, message: error.message };
//   }
// };
