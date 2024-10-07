import React, { useState, useEffect } from 'react';
import {
  Alert,
  LoadingSpinner,
  Input,
  Button,
  Flex,
  Text,
  Link,
  List,
  DateInput
} from '@hubspot/ui-extensions';
import { hubspot } from '@hubspot/ui-extensions';

// Define the extension to be run within the HubSpot CRM
hubspot.extend(({ runServerlessFunction, context }) => (
  <DealProperties runServerless={runServerlessFunction} portalId={context.portal.id} />
));

// Define the DealProperties component
const DealProperties = ({ runServerless, portalId }) => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [testName, setTestName] = useState('');
  const [testDate, setTestDate] = useState('');
  const [testFile1, setTestFile1] = useState(null);
  const [testFile2, setTestFile2] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({ test_file: "", test_file_2: "" });

  useEffect(() => {
    // Fetch properties from serverless function
    runServerless({
      name: 'getDealProperties',
      propertiesToSend: ['hs_object_id'],
    })
      .then((serverlessResponse) => {
        if (serverlessResponse.status === 'SUCCESS') {
          const { response } = serverlessResponse;
          setTestName(response.test_name);
          setTestDate(response.test_date);
          setUploadedFiles({
            test_file: response.test_file,
            test_file_2: response.test_file_2,
          });
        } else {
          setErrorMessage(serverlessResponse.message);
        }
      })
      .catch((error) => {
        setErrorMessage(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [runServerless, portalId]);

  const handleFileChange = (e, fileIndex) => {
    const file = e.target.files[0];
    if (fileIndex === 1) {
      setTestFile1(file);
    } else {
      setTestFile2(file);
    }
  };

  const handleFileUpload = async (file) => {
    // Implement a file upload function to upload the file to your server or storage
    // For example, use a serverless function or API to handle file upload
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/your-file-upload-api', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return data.fileUrl;  // Return the URL or ID of the uploaded file
    } catch (error) {
      console.error('File upload failed', error);
      return null;
    }
  };

  const handleUpdate = async () => {
    const updateData = {
      test_name: testName,
      test_date: testDate,
    };

    // Handle file uploads and get file URLs/IDs
    if (testFile1) {
      const fileUrl1 = await handleFileUpload(testFile1);
      updateData.test_file = fileUrl1;
    }

    if (testFile2) {
      const fileUrl2 = await handleFileUpload(testFile2);
      updateData.test_file_2 = fileUrl2;
    }

    // Now pass the file URLs and other data to the runServerless function
    runServerless({
      name: 'updateDealProperties',
      propertiesToSend: ['hs_object_id'],
      parameters: { updateData },
    }).then((response) => {
      if (response.success) {
        <Alert title="Success" variant="success">
          Properties updated successfully!
        </Alert>;
      } else {
        <Alert title="Danger" variant="danger">
          Failed to update properties.
        </Alert>;
      }
    });
  };

  const handleDeleteFile = async (fileProperty) => {
    runServerless({
      name: 'deleteFileProperty',
      propertiesToSend: ['hs_object_id'],
      parameters: { fileProperty },
    }).then((response) => {
      if (response.success) {
        <Alert title="Success" variant="success">
          File deleted successfully.
        </Alert>;
      } else {
        <Alert title="Danger" variant="danger">
          Failed to delete file.
        </Alert>;
      }
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  if (errorMessage) {
    return (
      <Alert title="Unable to load deal data" variant="warning">
        {errorMessage}
      </Alert>
    );
  }

  return (
    <Flex direction="column" gap="medium">
      <Text format={{ fontWeight: "bold" }}>Manage Deal Properties</Text>

      <Input
        label="Test Name"
        name="test_name"
        tooltip="Please enter a valid name"
        description="Please enter the test name"
        placeholder="Test Name"
        value={testName}
        onChange={(value) => {
          setTestName(value);
        }}
      />

      <DateInput
        label="Test Date"
        name="test_date"
        value={testDate}
        onChange={(date) => setTestDate(date)}
      />

      <List>
        <Text format={{ fontWeight: "bold" }}>Test File 1</Text>
        {uploadedFiles.test_file ? (
          <>
            <Link
              href={`https://app.hubspot.com/file-preview/${portalId}/file/${uploadedFiles.test_file}/`}
              target="_blank"
            >
              View File
            </Link>
            <Button onClick={() => handleDeleteFile("test_file")}>Delete File</Button>
          </>
        ) : (
          <Input
            type="file"
            onChange={(e) => handleFileChange(e, 1)}
          />
        )}

        <Text format={{ fontWeight: "bold" }}>Test File 2</Text>
        {uploadedFiles.test_file_2 ? (
          <>
            <Link
              href={`https://app.hubspot.com/file-preview/${portalId}/file/${uploadedFiles.test_file_2}/`}
              target="_blank"
            >
              View File
            </Link>
            <Button onClick={() => handleDeleteFile("test_file_2")}>Delete File</Button>
          </>
        ) : (
          <Input
            type="file"
            onChange={(e) => handleFileChange(e, 2)}
          />
        )}
      </List>

      <Button onClick={handleUpdate}>Update Properties</Button>
    </Flex>
  );
};
