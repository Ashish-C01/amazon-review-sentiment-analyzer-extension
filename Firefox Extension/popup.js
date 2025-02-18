import { DistilBertTokenizer } from './transformers.min.js';

let tokenizer = null;
let session = null;
let myChart = null;

function showSpinner() {
  document.getElementById("spinner-container").style.display = "flex";
}

function hideSpinner() {
  document.getElementById("spinner-container").style.display = "none";
}


function drawChart(data) {
  hideSpinner();
  const canvas = document.getElementById('piechart');
  if (data.length > 0) {
    canvas.style.display = "block";
  } else {
    canvas.style.display = "none";
    return;
  }
  if (!canvas) {
    return;
  }
  canvas.width = canvas.width;
  if (window.myChart) {
    window.myChart.destroy();
  }

  const ctx = canvas.getContext('2d');

  const onesCount = data.filter(x => x === 1).length;
  const zerosCount = data.filter(x => x === 0).length;

  window.myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Positive', 'Negative'],
      datasets: [{
        data: [onesCount, zerosCount],
        backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.raw;  // Get actual value
              const total = onesCount + zerosCount;
              const percentage = ((value / total) * 100).toFixed(1) + '%';
              return `${label}: ${value} (${percentage})`;
            }
          }
        }
      }
    }
  });
}


async function loadONNXRuntime() {
  return new Promise((resolve, reject) => {
    let script = document.createElement("script");
    script.src = chrome.runtime.getURL("ort.min.js");
    script.onload = () => {
      if (typeof ort !== "undefined") {
        resolve(ort);
      } else {
        reject(new Error("ONNX Runtime not loaded"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load ONNX Runtime"));
    document.head.appendChild(script);
  });
}
async function loadModel() {
  try {
    const ort = await loadONNXRuntime();
    session = await ort.InferenceSession.create('distilbertmodel_quantized.onnx');

    return session;
  } catch (error) {
    throw error;
  }
}

async function loadTokenizer() {
  tokenizer = await DistilBertTokenizer.from_pretrained("ashish-001/DistilBert-Amazon-review-sentiment-classifier");
}


async function initialize() {
  await Promise.all([loadTokenizer(), loadModel()]);
}


async function runInference(inputText) {
  if (!session || !tokenizer) {
    return;
  }
  const tokens = await tokenizer(inputText, { padding: true, truncation: true });

  const inputTensor = new ort.Tensor("int64", tokens.input_ids.data, [1, tokens.input_ids.size]);
  const attentionMaskTensor = new ort.Tensor("int64", tokens.attention_mask.data, [1, tokens.attention_mask.size]);

  const feeds = { 'input_ids': inputTensor, 'attention_mask': attentionMaskTensor }
  const result = await session.run(feeds);
  let predicted_class = result.logits.cpuData.indexOf(Math.max(...result.logits.cpuData));
  return predicted_class;
}


async function processReviews(reviews) {
  let output_classes = []
  for (let review of reviews) {
    review = review.replace(/[^a-zA-Z\s]/g, "").replace(/\s+/g, " ").trim();
    let output = await runInference(review);
    output_classes.push(output);
  }
  drawChart(output_classes);
}

document.getElementById("fetchReviews").addEventListener("click", async () => {
  showSpinner();

  let queryFunction = typeof browser !== "undefined" ? browser.tabs.query : chrome.tabs.query;
    
  let tabs = await queryFunction({ active: true, currentWindow: true });
  if (!tabs || tabs.length === 0) {
      console.error("No active tab found.");
      return;
  }
  
  let tabId = tabs[0].id;

  // Detect Firefox and use appropriate script execution method
  if (typeof browser !== "undefined") {
      browser.tabs.executeScript(tabId, { file: "content.js" })
          .then(() => {
              return browser.tabs.sendMessage(tabId, { action: "getReviews" });
          })
          .then(response => {
              if (response && response.reviews.length > 0) {
                  processReviews(response.reviews);
              } else {
                  hideSpinner();
                  document.getElementById("reviews").innerText = "No reviews found.";
                  
              }
          })
          .catch(err => {
              console.error("Error:", err);
              hideSpinner();
          });
  } else {
      chrome.scripting.executeScript(
          {
              target: { tabId: tabId },
              files: ["content.js"]
          },
          () => {
              if (chrome.runtime.lastError) {
                  console.error(chrome.runtime.lastError.message);
                  hideSpinner();
                  return;
              }

              chrome.tabs.sendMessage(tabId, { action: "getReviews" }, (response) => {
                  if (chrome.runtime.lastError) {
                      hideSpinner();
                      return;
                  }

                  if (response && response.reviews.length > 0) {
                      processReviews(response.reviews);
                  } else {
                      hideSpinner();
                      document.getElementById("reviews").innerText = "No reviews found.";
  
                  }
              });
          }
      );
  }

});
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("spinner-container").style.display = "none";
  initialize();
});
