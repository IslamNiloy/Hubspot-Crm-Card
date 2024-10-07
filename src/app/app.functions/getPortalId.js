const hubspot = require('@hubspot/api-client');

exports.main = async (context = {}) => {
  const hsClient = new hubspot.Client({ accessToken: process.env.PRIVATE_APP_ACCESS_TOKEN });

  try {
    // Use the `getById` endpoint to retrieve portal details
    const portalInfo = await hsClient.crm.properties.coreApi.getAll('deals');
    console.log(portalInfo.id)
    return { portalId: context.portalId || portalInfo.portalId };
  } catch (error) {
    console.error('Error fetching portal info:', error);
    return { success: false, error: error.message };
  }
};
