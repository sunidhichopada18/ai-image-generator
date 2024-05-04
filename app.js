const generateForm = document.querySelector(".generate-form");
const generateBtn = generateForm.querySelector(".generate-btn");
const imageGallery = document.querySelector(".image-gallery");

import { config } from "dotenv";
config();

const { OPENAI_KEY } = process.env;
const OPENAI_API_KEY = `${OPENAI_KEY}`;
let isImageGenerating = false;

//function to update image cards with generated images
const updateImageCard = (imgDataArray) => {
  // Loop through each image data object
  imgDataArray.forEach((imgObject, index) => {
    const imgCard = imageGallery.querySelectorAll(".img-card")[index];
    const imgElement = imgCard.querySelector("img");
    const downloadBtn = imgCard.querySelector(".download-btn");

    // Set the image source to the AI-generated image data
    const aiGeneratedImage = `data:image/jpeg;base64,${imgObject.b64_json}`;
    imgElement.src = aiGeneratedImage;

    // When the image is loaded, remove the loading class and set download attributes
    imgElement.onload = () => {
      imgCard.classList.remove("loading");
      downloadBtn.setAttribute("href", aiGeneratedImage);
      downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
    };
  });
};

// function to generate AI images using OpenAI API
const generateAiImages = async (userPrompt, userImgQuantity) => {
  try {
    // Send a request to the OpenAI API to generate images based on user inputs
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST", //to create,update or delete by sending data to the API
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: userPrompt,
          n: userImgQuantity,
          size: "512x512",
          response_format: "b64_json",
        }),
      }
    );

    // Throw an error message if the API response is unsuccessful
    if (!response.ok)
      throw new Error(
        "Failed to generate AI images. Make sure your API key is valid."
      );

    //extract the image data from the response
    const { data } = await response.json(); // Get data from the response

    //update the image cards with the generated data
    updateImageCard([...data]);
  } catch (error) {
    alert(error.message);
  } finally {
    //re-enable the generate button and reset its state
    generateBtn.removeAttribute("disabled");
    generateBtn.innerText = "Generate";
    isImageGenerating = false;
  }
};

//function to handle form submission and image generation
const handleImageGeneration = (e) => {
  e.preventDefault();

  // prevent generating images if already in progress
  if (isImageGenerating) return;

  // Get user input and image quantity values
  const userPrompt = e.srcElement[0].value;
  const userImgQuantity = parseInt(e.srcElement[1].value);

  // Disable the generate button, update its text, and set the flag
  generateBtn.setAttribute("disabled", true);
  generateBtn.innerText = "Generating";
  isImageGenerating = true;

  // Creating HTML markup for image cards with loading state
  const imgCardMarkup = Array.from(
    { length: userImgQuantity },
    () =>
      `<div class="img-card loading">
        <img src="./assets/loader.svg" alt="AI generated image">
        <a class="download-btn" href="#">
          <img src="./assets/download.svg" alt="download icon">
        </a>
      </div>`
  ).join(""); // concatenating the elements, it is basicalle for(let i = 0; i < userImageQuantity; i++) and for each the download and loader.

  // update the image gallery with the loading markup
  imageGallery.innerHTML = imgCardMarkup;

  // start the image generation process using the user input
  generateAiImages(userPrompt, userImgQuantity);
};

// Add event listener to the form for submission
generateForm.addEventListener("submit", handleImageGeneration);
