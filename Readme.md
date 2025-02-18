# Amazon Review Sentiment Analyzer ([Firefox extension](https://addons.mozilla.org/addon/amazon-review-analyzer/))

## Overview
The **Amazon Review Sentiment Analyzer** is a browser extension that reads product reviews from the current Amazon page and analyzes their sentiment. It then generates a bar chart to visually represent the sentiment distribution. The extension supports **Amazon.com, Amazon.in, Amazon.co.uk, and Amazon.ca** domains.

## Features
- Extracts reviews from the currently open Amazon product page.
- Analyzes the sentiment of the reviews using a **fine-tuned DistilBERT model**.
- Generates a bar chart to display the sentiment distribution.
- Supports multiple Amazon domains (**Amazon.com, Amazon.in, Amazon.co.uk & Amazon.ca**).
- Optimized using **ONNX quantization** for better performance and efficiency.

## Technologies Used
- **DistilBERT** (Fine-tuned for sentiment analysis)
- **ONNX Runtime** (Quantized model for faster inference)
- **JavaScript (Chrome & Firefox Extensions API)**
- **HTML/CSS** (Popup UI & Styling)
- **Chart.js** (For sentiment visualization)

## Model Performance
- **Train Accuracy**: 90%
- **Test Accuracy**: 90%
- **Classification Report for test data**

![Image](<classification_report_test_data.png>)

## Screenshots
![Image1](<Before Review.png>)
![Image2](<After Review.png>)


