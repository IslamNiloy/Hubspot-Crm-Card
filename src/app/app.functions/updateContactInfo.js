const hubspot = require('@hubspot/api-client');

exports.main = async (context = {}) => {
  const { phoneNumber, streetAddress, city, state, zipCode } = context.parameters;
  const hsClient = new hubspot.Client({ accessToken: process.env.PRIVATE_APP_ACCESS_TOKEN });

  const contactId = context.propertiesToSend.hs_object_id; // Retrieve contact ID

  // Update the contact properties in HubSpot
  await hsClient.crm.contacts.basicApi.update(contactId, {
    properties: {
      phone: phoneNumber,
      address: streetAddress,
      city: city,
      state: state,
      zip: zipCode,
    },
  });

  return { success: true };
};
