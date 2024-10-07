const hubspot = require('@hubspot/api-client');
const FormData = require('form-data');

exports.main = async (context = {}) => {
  const { dealId, files } = context.parameters;
  console.log("Received dealId:", dealId);

  if (!dealId || !files) {
    return { success: false, message: 'Missing dealId or files.' };
  }

  const hsClient = new hubspot.Client({ accessToken: process.env.HAPI_KEY });

  try {
    let uploadedFiles = [];

    // Iterate over files passed in FormData and upload each to HubSpot's file manager
    for (let key in files) {
      const file = files[key];  // FormData uses key-value pairs for files
      const fileUploadResponse = await hsClient.files.uploadFile({
        fileName: file.name,
        file,
        options: {
          access: 'PUBLIC_INDEXABLE' // Ensures the file is publicly accessible
        }
      });

      uploadedFiles.push({
        name: file.name,
        url: fileUploadResponse.body.url
      });
    }

    // Fetch the current deal property value
    const deal = await hsClient.crm.deals.basicApi.getById(dealId);
    const existingFiles = deal.properties.deal_file_urls
      ? JSON.parse(deal.properties.deal_file_urls)
      : [];

    // Combine with newly uploaded files
    const updatedFiles = [...existingFiles, ...uploadedFiles];

    // Update the custom deal property with the new file URLs
    await hsClient.crm.deals.basicApi.update(dealId, {
      properties: {
        deal_file_urls: JSON.stringify(updatedFiles)
      }
    });

    return { success: true, files: uploadedFiles };
  } catch (error) {
    console.error('Error uploading files: ', error);
    return { success: false, error: error.message };
  }
};
