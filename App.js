import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { View, Text, Button, Alert, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import * as Location from "expo-location";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDM9Wtm4RE60vTxsaxvR1bO-Q1eKXaD-iA",
  authDomain: "mcpp-w11.firebaseapp.com",
  projectId: "mcpp-w11",
  storageBucket: "mcpp-w11.appspot.com",
  messagingSenderId: "876803939647",
  appId: "1:876803939647:web:e7047149adb19b0677478a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ImagePickerComponent = () => {
  const [uri, setUri] = useState("");
  const [location, setLocation] = useState(null);

  // Function to open gallery
  const openImagePicker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "You need to enable permission to access the photo library."
      );
      return;
    }
    const response = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: true, // Include base64 encoding
    });
    handleResponse(response);
  };

  // Function to open camera
  const handleCameraLaunch = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "You need to enable permission to access the camera."
      );
      return;
    }
    const response = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: true, // Include base64 encoding
    });
    handleResponse(response);
  };

  // Handle image response
  const handleResponse = (response) => {
    if (response.canceled) {
      console.log("User cancelled image picker");
    } else if (response.assets && response.assets.length > 0) {
      setUri(response.assets[0].base64); // Set base64-encoded image
    } else {
      Alert.alert("Error", "Failed to retrieve image.");
    }
  };

  // Function to get geolocation
  const getGeolocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permission is required.");
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    });

    Alert.alert(
      "Location Captured",
      `Latitude: ${currentLocation.coords.latitude}, Longitude: ${currentLocation.coords.longitude}`
    );
  };

  // Function to save photo and location to Firestore
  const savePhotoAndLocation = async () => {
    if (!uri || !location) {
      Alert.alert("Error", "Please take a photo and capture location first.");
      return;
    }

    try {
      console.log("Starting savePhotoAndLocation...");

      // Save the base64-encoded image and location to Firestore
      await addDoc(collection(db, "Tugas"), {
        photo_base64: uri, // Save the Base64 image
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        timestamp: new Date().toISOString(),
      });
      console.log("Data saved to Firestore successfully");

      Alert.alert("Success", "Photo and location saved to Firestore!");
    } catch (err) {
      console.error("Error saving data to Firestore: ", err);
      Alert.alert("Error", `Failed to save data to Firestore: ${err.message}`);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        backgroundColor: "white",
      }}
    >
      <Text>Beverly Vladislav Tan - 00000074964</Text>

      {/* Button to take photo */}
      <Button title="Open Camera" onPress={handleCameraLaunch} color="#1E90FF" />

      {/* Button to open gallery */}
      <Button
        title="Open Gallery"
        onPress={openImagePicker}
        color="#1E90FF"
      />

      {/* Display the selected image */}
      {uri ? (
        <Image
          source={{ uri: `data:image/jpeg;base64,${uri}` }}
          style={{
            width: 200,
            height: 200,
            marginTop: 20,
            borderRadius: 10,
          }}
        />
      ) : (
        <Text style={{ marginTop: 20 }}>No image selected</Text>
      )}

      {/* Button to get geolocation */}
      <Button title="Get Geolocation" onPress={getGeolocation} color="#1E90FF" />

      {/* Display location */}
      {location && (
        <Text style={{ marginTop: 20 }}>
          Location: Latitude {location.latitude}, Longitude {location.longitude}
        </Text>
      )}

      {/* Button to save photo and location to Firestore */}
      <Button
        title="Save Photo and Location"
        onPress={savePhotoAndLocation}
        color="#32CD32"
      />

      <StatusBar style="auto" />
    </View>
  );
};

export default ImagePickerComponent;
