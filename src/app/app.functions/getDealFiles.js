const hubspot = require('@hubspot/api-client');

exports.main = async (context = {}) => {
  const { dealId } = context.parameters;

  const hsClient = new hubspot.Client({ accessToken: process.env['PRIVATE_APP_ACCESS_TOKEN'] });

  try {
    // Get the deal object and retrieve the file URLs from the custom property
    const deal = await hsClient.crm.deals.basicApi.getById(dealId);
    const fileUrls = deal.properties.deal_file_urls
      ? JSON.parse(deal.properties.deal_file_urls)
      : [];

    return { files: fileUrls };
  } catch (error) {
    console.error('Error retrieving files: ', error);
    return { success: false, error: error.message };
  }
};
