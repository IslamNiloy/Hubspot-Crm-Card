const hubspot = require('@hubspot/api-client');

exports.main = async (context = {}) => {
    const { hs_object_id } = context.propertiesToSend;
  const {fileProperty } = context.parameters;  // Ensure dealId and fileProperty are passed
  if (!hs_object_id) {
    throw new Error('Missing dealId');
  }

  const hsClient = new hubspot.Client({ accessToken: process.env.PRIVATE_APP_ACCESS_TOKEN });

  try {
    // Update the deal property to clear the file URL
    await hsClient.crm.deals.basicApi.update(hs_object_id, {
      properties: {
        [fileProperty]: ""
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting file: ', error);
    return { success: false, error: error.message };
  }
};
