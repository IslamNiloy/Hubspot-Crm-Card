import React, { useState } from "react";
import {
  Input,
  Button,
  Flex,
  Form,
  LoadingSpinner,
  Alert,
  List,
} from "@hubspot/ui-extensions";
import { hubspot } from "@hubspot/ui-extensions";

// Main Address component
hubspot.extend(({ runServerlessFunction, context }) => (
  <AddressForm runServerless={runServerlessFunction} context={context} />
));

// Address Form Component
const AddressForm = ({ runServerless, context }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);

  // Handle address auto-completion (Call the serverless function)
  const handleAddressInput = async (value) => {
    setStreetAddress(value);
    // setLoading(true);
    setErrorMessage("");
    setSuccessMessage("")

    try {
      const response = await runServerless({
        name: "getAddressSuggestions",
        parameters: { addressInput: value },
      });

      // Access the suggestions from the response
      if (response.status === "SUCCESS" && response.response.suggestions) {
        setAddressSuggestions(response.response.suggestions);
      } else {
        setErrorMessage("Failed to fetch address suggestions.");
      }
    } catch (error) {
      setErrorMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle address selection and auto-fill details
  const handleAddressSelect = async (suggestion) => {
    // setLoading(true);
    
    try {
      // Call serverless function to get address details by place_id
      const serverlessResponse = await runServerless({
        name: "getAddressDetails",
        parameters: { placeId: suggestion.place_id },
      });
      
      // console.log("serverlessResponse:", serverlessResponse);
  
      // Access the details from the serverless response
      if (serverlessResponse.status === "SUCCESS" && serverlessResponse.response.success) {
        const { street, city, state, zip } = serverlessResponse.response.details;
        
        // Update the fields with the fetched address details
        setStreetAddress(street);
        setCity(city);
        setState(state);
        setZipCode(zip);
      } else {
        setErrorMessage("Failed to fetch address details.");
      }
    } catch (error) {
      setErrorMessage("Error: " + error.message);
    } finally {
      setLoading(false);
      setAddressSuggestions([]); // Clear suggestions after selection
    }
  };
  

  // Handle form submission to update contact properties in HubSpot
  const handleUpdateContact = async () => {
    setLoading(true);
    setErrorMessage("");
  
    const updateData = {
      phoneNumber,
      streetAddress,
      city,
      state,
      zipCode,
    };
  
    try {
      const response = await runServerless({
        name: "updateContactInfo",
        propertiesToSend: ["hs_object_id"],
        parameters: updateData,
      });
  
      console.log("Serverless response:", response);
  
      // Check the success status from the correct part of the response
      if (response.status === "SUCCESS" && response.response.success) {
        setSuccessMessage("Contact updated successfully!")
      } else {
        setErrorMessage("Failed to update contact.");
      }
    } catch (error) {
      setErrorMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Flex direction="column" gap="medium">
      {loading && <LoadingSpinner />}

      {errorMessage && (
        <Alert title="Error" variant="danger">
          {errorMessage}
        </Alert>
      )}
       {successMessage && (
        <Alert title="Success" variant="success">
          {successMessage}
        </Alert>
      )}

      <Form>
        <Input
          label="Phone Number"
          name="phone_number"
          value={phoneNumber}
          onChange={(value) => setPhoneNumber(value)}
        />

        <Input
          label="Street Address"
          name="street_address"
          value={streetAddress}
          placeholder="Start typing the address..."
          onInput={(value) => handleAddressInput(value)}
        />

        {/* Dynamic Address Suggestions using List */}
        {addressSuggestions.length > 0 && (
          <List>
            {addressSuggestions.map((suggestion) => (
              <Button
                key={suggestion.place_id}
                onClick={() => handleAddressSelect(suggestion)}
                variant="secondary"
                size="sm"
              >
                {suggestion.description}
              </Button>
            ))}
          </List>
        )}

        <Input
          label="City"
          name="city"
          value={city}
          onChange={(value) => setCity(value)}
        />

        <Input
          label="State"
          name="state"
          value={state}
          onChange={(value) => setState(value)}
        />

        <Input
          label="ZIP Code"
          name="zip_code"
          value={zipCode}
          onChange={(value) => setZipCode(value)}
        />

        <Button onClick={handleUpdateContact}>Update Contact</Button>
      </Form>
    </Flex>
  );
};
