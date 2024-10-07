const hubspot = require('@hubspot/api-client');

exports.main = async (context = {}) => {
  const { hs_object_id } = context.propertiesToSend;

  const hsClient = new hubspot.Client({ accessToken: process.env.PRIVATE_APP_ACCESS_TOKEN});
  const deal = await hsClient.crm.deals.basicApi.getById(hs_object_id,
    properties=[
    'test_name',
    'test_file',
    'test_file_2',
    'test_date'
  ]);

  return {
    test_name: deal.properties.test_name || "",
    test_date: deal.properties.test_date || "",
    test_file: deal.properties.test_file || "",
    test_file_2: deal.properties.test_file_2 || ""
  };
};
