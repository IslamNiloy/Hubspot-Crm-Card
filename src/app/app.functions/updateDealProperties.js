const hubspot = require('@hubspot/api-client');

exports.main = async (context = {}) => {
  console.log(context);

  const { hs_object_id } = context.propertiesToSend;
  const { updateData, files } = context.parameters;
  const hsClient = new hubspot.Client({ accessToken: process.env.PRIVATE_APP_ACCESS_TOKEN });

  // Fix test_date format: Construct a valid Date object from the provided date values and normalize to midnight UTC
  if (updateData.test_date && typeof updateData.test_date === 'object') {
    const { year, month, date } = updateData.test_date;

    // Ensure all necessary values are present and valid
    if (year && typeof month === 'number' && date) {
      // Create a Date object with the format month-day-year and set the time to midnight UTC
      const formattedDate = new Date(Date.UTC(year, month - 1, date, 0, 0, 0)); // Month is 0-indexed in JavaScript
      if (!isNaN(formattedDate.getTime())) {
        updateData.test_date = formattedDate.getTime(); // Send as a timestamp (milliseconds since epoch)
      } else {
        console.warn('Invalid test_date value:', updateData.test_date);
        delete updateData.test_date; // Remove the invalid date
      }
    } else {
      console.warn('Incomplete test_date values:', updateData.test_date);
      delete updateData.test_date; // Remove incomplete or invalid date
    }
  }

  // Handle file uploads (if any files were passed)
  let uploadedFiles = {};
  if (files) {
    for (let key in files) {
      const file = files[key];
      const fileUploadResponse = await hsClient.files.uploadFile({
        fileName: file.name,
        file,
        options: { access: 'PUBLIC_INDEXABLE' },
      });
      uploadedFiles[key] = fileUploadResponse.body.url;
    }
  }

  // Merge the uploaded file URLs with the updateData
  const updatedProperties = { ...updateData, ...uploadedFiles };

  // Update deal properties in HubSpot
  await hsClient.crm.deals.basicApi.update(hs_object_id, {
    properties: updatedProperties,
  });

  return { success: true };
};
