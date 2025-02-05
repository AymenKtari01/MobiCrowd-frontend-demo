import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-encoder',
  standalone: true,
  imports: [FormsModule, CommonModule, JsonPipe, HttpClientModule], 
  templateUrl: './encoder.component.html',
  styleUrls: ['./encoder.component.css']
})

export class EncoderComponent implements OnInit {
  model!: tf.LayersModel;
  selectedImage: HTMLImageElement | null = null;
  metadataInputs: string[] = Array(8).fill(''); // Holds the 8 pieces of input metadata
  imageUrl: string | null = null; // Holds the image URL
  metadata: number[] = []; // Holds the reconstructed metadata
  predictedClass: string | null = null; // Holds the predicted class
  classNames: string[] = ['Flood', 'Fire', 'Others']; // List of class names
  predictedClassName: string | null = null; // Holds the predicted class name
  image : any ; 


  constructor(private cdr: ChangeDetectorRef, private http: HttpClient) {}

  async ngOnInit() {
    try {
      const modelUrl = './assets/model.json';
      console.log('Loading model from:', modelUrl);
      this.model = await tf.loadLayersModel(modelUrl);
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          this.selectedImage = img;
        };
      };
      reader.readAsDataURL(file);
    }
  }

  
  preprocessImage(image: HTMLImageElement): tf.Tensor {


      // Create a canvas with the same size as the original image
  const originalCanvas = document.createElement('canvas');
  originalCanvas.width = image.width;
  originalCanvas.height = image.height;
  const originalCtx = originalCanvas.getContext('2d');

  if (!originalCtx) {
    throw new Error('Failed to get original canvas context');
  }

  // Draw the original image onto the original-sized canvas
  originalCtx.drawImage(image, 0, 0, image.width, image.height);

  // Get the original image data before resizing
  const originalImageData = originalCtx.getImageData(0, 0, image.width, image.height);
  console.log('Original Image Dimensions:', image.width, image.height);
  console.log('Original Image Data:', originalImageData.data); // Log original image array
    
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.drawImage(image, 0, 0, 64, 64);

    const imageData = ctx.getImageData(0, 0, 64, 64);
    const data = imageData.data;
    const normalizedData: number[] = [];
    for (let i = 0; i < data.length; i += 4) {

      normalizedData.push( data[i] / 255 , data[i + 1] / 255 , data[i + 2] / 255 );

    }

    this.image= canvas.toDataURL()
    return tf.tensor3d(normalizedData, [64, 64, 3]); 

    
  }




  resizeAndNormalizeImage(image: HTMLImageElement): Promise<number[][][]> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      // Set the canvas dimensions to 64x64
      canvas.width = 64;
      canvas.height = 64;
  
      // Check if ctx (context) is null
      if (ctx) {
        // Draw the image on the canvas and resize it to 64x64
        ctx.drawImage(image, 0, 0, 64, 64);
  
        // Extract the pixel data from the canvas (RGBA)
        const imgData = ctx.getImageData(0, 0, 64, 64).data;
        const resizedImage: number[][] = []; // Changed to 2D array
  
        // Iterate through the pixel data and normalize each RGB value to [0, 1]
        for (let i = 0; i < imgData.length; i += 4) {
          const r = parseFloat((imgData[i] / 255).toFixed(6));   // Red
          const g = parseFloat((imgData[i + 1] / 255).toFixed(6)); // Green
          const b = parseFloat((imgData[i + 2] / 255).toFixed(6)); // Blue
          // Ignore the alpha channel and push the RGB values as an array
          resizedImage.push([r, g, b]);
        }
  
        // Reshape the array into 64x64x3 format
        const reshapedImage: number[][][] = [];
        for (let i = 0; i < 64; i++) {
          const row: number[][] = []; // Each row will contain 64 RGB values
          for (let j = 0; j < 64; j++) {
            const index = i * 64 + j;
            row.push(resizedImage[index]); // Push the RGB array
          }
          reshapedImage.push(row); // Push the row to reshapedImage
        }
  
        console.log("Preprocessed Image Tensor (Angular):", reshapedImage);
        resolve(reshapedImage);
      } else {
        reject(new Error("Failed to get 2D context for the canvas."));
      }
    });
  }
  
  
  convertMetadata(inputs: string[]): number[][] {
    const metadata: number[][] = [];  // Explicitly type metadata
    for (let i = 0; i < 8; i++) {
      const value = parseFloat(inputs[i]);
      for (let j = 0; j < 3; j++) {
        metadata.push([isNaN(value) ? 0 : value, isNaN(value) ? 0 : value, isNaN(value) ? 0 : value]);
      }
    }
    return metadata;
  }
  
  

  concatenateMetadata(imageTensor: tf.Tensor, metadata: number[][]): tf.Tensor {
    // Verify metadata shape
    if (!Array.isArray(metadata) || metadata.length !== 24 || !metadata.every(row => Array.isArray(row) && row.length === 3)) {
      throw new Error('Metadata must be a 2D array with 24 rows and 3 columns.');
    }
  
    // Convert metadata to tensor with shape [24, 3]
    const metadataTensor = tf.tensor2d(metadata, [24, 3]);
    console.log('metadataTensor shape:', metadataTensor.shape); // Debug
    console.log('metadata :', metadata); // Debug
  
    // Repeat metadata tensor 64 times along the rows to create a tensor with shape [64, 24, 3]
    const repeatedMetadataTensor = tf.tile(metadataTensor, [64, 1]);
    console.log('repeatedMetadataTensor shape:', repeatedMetadataTensor.shape); // Debug
  
    // Ensure the image tensor has the correct shape
    if (imageTensor.shape.toString() !== [64, 64, 3].toString()) {
      throw new Error(`Image tensor shape is incorrect: ${imageTensor.shape}`);
    }
  
    // Reshape repeated metadata tensor to [64, 24, 3]
    const reshapedMetadataTensor = tf.reshape(repeatedMetadataTensor, [64, 24, 3]);
    // console.log('reshapedMetadataTensor shape:', reshapedMetadataTensor.shape); // Debug
  
    // Convert reshapedMetadataTensor to array and log it
    reshapedMetadataTensor.array().then(array => {
      console.log('reshapedMetadataTensor array:', array); // Debug
    });
    
    tf.concat([imageTensor, reshapedMetadataTensor], 1).array().then(all => {
      console.log('Image + Metadata :', all); // Debug
    });
    // Concatenate along axis 1
    return tf.concat([imageTensor, reshapedMetadataTensor], 1);
  }
  
  async predict(): Promise<void> {
    if (this.selectedImage) {
      if (this.metadataInputs.some(input => input.trim() === '')) {
        console.error('All metadata fields must be filled.');
        alert('Please fill all metadata fields.');
        return;
      }

      // *************************************************************************************
      // const test =this.resizeAndNormalizeImage(this.selectedImage);
      // console.log('64x64 test image :', test );
      // *************************************************************************************


      const imageTensor = this.preprocessImage(this.selectedImage);
      this.image= imageTensor; 
      const imageArray = await imageTensor.array();
      console.log('64x64 image:', imageArray);

      console.log('64x64 image :', imageTensor.array() );
      const metadata = this.convertMetadata(this.metadataInputs);
  
      if (metadata) {
        const concatenatedTensor = this.concatenateMetadata(imageTensor, metadata);
        const inputTensor = concatenatedTensor.expandDims(0);

        const predictions = this.model.predict(inputTensor) as tf.Tensor;
        const embedding = await predictions.array();
        console.log('Embedding:', embedding);
  
        this.sendEmbedding(embedding);
  
        // this.cdr.detectChanges();
  
      } else {
        console.error('Invalid metadata input.');
      }
    } else {
      console.error('No image selected.');
    }
  }
  

  sendEmbedding(embedding: any): void {
    console.log('Sending embedding:', embedding); // Check the structure here
    console.log(typeof embedding)
    this.http.post('http://localhost:8000/embedding/', { encoded: embedding }, {
      headers: { 'Content-Type': 'application/json' }
    })
    .subscribe(
      (response: any) => {
        console.log('Successfully sent embedding to backend:', response);
        // this.imageUrl = `data:image/png;base64,${response.image_base64}`;
        // this.metadata = response.metadata;
        this.predictedClass = response.predicted_class; // Set the predicted class index
  
        // Map the index to the corresponding class name
        if (this.predictedClass !== null ) {
          this.predictedClassName = this.predictedClass;
        } else {
          this.predictedClassName = 'Unknown';
        }
      },
      error => {
        console.error('Error sending embedding to backend:', error);
      }
    );
  }
}
