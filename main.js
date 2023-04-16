document.addEventListener('DOMContentLoaded', async () => {
document.getElementById('toggleHighlight').addEventListener('click', toggleHighlight);
  const qagSelector = document.getElementById('qagSelector');
  const qagContent = document.getElementById('qagContent');  
  
  /**
 * Extracts the publication date of a QAG from the JSON object.
 * @param {Object} json - The JSON object containing the QAG data.
 * @returns {string} - The publication date as a string or "Unknown" if not found.
 */
    function extractDate(json) {
      let dateJO = 'Unknown';

      if (json.question.indexationAN.minAttribs &&
          json.question.indexationAN.minAttribs.minAttrib &&
          json.question.indexationAN.minAttribs.minAttrib.infoJO &&
          json.question.indexationAN.minAttribs.minAttrib.infoJO.dateJO) {
            dateJO = json.question.indexationAN.minAttribs.minAttrib.infoJO.dateJO;
          } else if (json.question.textesReponse.texteReponse.infoJO &&
                     json.question.textesReponse.texteReponse.infoJO.dateJO) {
            dateJO = json.question.textesReponse.texteReponse.infoJO.dateJO;
          }

          return dateJO;
    }
/**
 * Converts speaker names in the text to Wikipedia links.
 * @param {string} text - The QAG text with speaker names in <strong> tags.
 * @returns {string} - The updated text with speaker names linked to their Wikipedia pages.
 */
function convertSpeakerNameToWikipediaLink(text) {
  const regex = /<strong>([^<]+)<\/strong>/g;
  const wikipediaBaseURL = "https://fr.wikipedia.org/wiki/";

  function encodeSpeakerName(name) {
      name = name.replace('M. ', '')
      name = name.replace('Mme ', '')
      name = name.replaceAll('.', '')
      name = name.replaceAll(',', '')
    return encodeURIComponent(name.trim().replace(/\s+/g, "_"));
  }

  return text.replace(regex, (match, speakerName) => {
    if (speakerName.includes("la présidente")){
        return match 
    }
    const encodedName = encodeSpeakerName(speakerName);
    const wikipediaURL = `${wikipediaBaseURL}${encodedName}`;
    return `<strong><a href="${wikipediaURL}">${speakerName}</a></strong>`;
  });
}

let displayMode = 'wikipedia'; // Initialize the display mode

/**
 * Toggles the display mode between "highlight" and "wikipedia" and updates the QAG content.
 */
function toggleHighlight() {
    if (displayMode === 'highlight') {
      displayMode = 'wikipedia';
    } else {
      displayMode = 'highlight';
    }
    updateQAGContent();
  }

  async function updateQAGContent() {
    clearQAGContent();
    const selectedQAG = qagSelector.value;
    const json = await loadQAG(selectedQAG);
    jsonToHTML(json, displayMode);
  }


/**
 * Highlights the sentences in the QAG text based on the sentiment data.
 * @param {Object} json - The JSON object containing the QAG data and sentiment data.
 * @param {string} text - The QAG text to be highlighted.
 * @returns {string} - The updated text with highlighted sentences.
 */
function highlightSentences(json, text) {
  const sentimentData = json.question.textesReponse.texteReponse.sentiment_data;

  let highlightedText = "";
  let currentIndex = 0;

  sentimentData.forEach((data) => {
    const beginChar = data.begin_char;
    const endChar = data.end_char;
    const sentiment = data.sentiment;
    const score = data.score;

    const opacity = (score * 100).toFixed(2);

    // Add the text before the highlight
    highlightedText += text.slice(currentIndex, beginChar);

    // Determine the color based on sentiment
    let color;
    switch (sentiment) {
      case "1 star":
        color = "rgba(255, 0, 0, ";
        break;
      case "2 stars":
        color = "rgba(255, 165, 0, ";
        break;
      case "3 stars":
        color = "rgba(255, 255, 0, ";
        break;
      case "4 stars":
        color = "rgba(173, 255, 47, ";
        break;
      case "5 stars":
        color = "rgba(0, 255, 0, ";
        break;
      default:
        color = "";
    }
   
        // Add the highlighted text
    if (color) {
      const textColor = (sentiment === "1 star") ? "white" : "black";
      highlightedText += `<span style="background-color: ${color} ${opacity / 100}); color: ${textColor};">${text.slice(beginChar, endChar)}</span>`;
    } else {
      highlightedText += text.slice(beginChar, endChar);
    }


    // Update the current index
    currentIndex = endChar;
  });

  // Add the remaining text after the last highlight
  highlightedText += text.slice(currentIndex);

  return highlightedText;
}


/**
 * Converts a JSON object containing QAG data to HTML and appends it to the page.
 * @param {Object} json - The JSON object containing the QAG data.
 * @param {string} mode - The display mode, either "highlight" or "wikipedia".
 */
function jsonToHTML(json, mode) {
  const dateJO = extractDate(json);

  const qagDate = document.createElement('h3');
  qagDate.textContent = `Date of publication: ${dateJO === 'Unknown' ? dateJO : new Date(dateJO).toLocaleDateString()}`;
  qagContent.appendChild(qagDate);

  const qagTitle = document.createElement('h2');
  qagTitle.textContent = json.question.indexationAN.rubrique;
  qagContent.appendChild(qagTitle);

  const qagText = document.createElement('div');
    const rawText = json.question.textesReponse.texteReponse.texte;
    let processedText;

    if (mode === 'highlight') {
      processedText = highlightSentences(json, rawText);
    } else {
      processedText = convertSpeakerNameToWikipediaLink(rawText);
    }

    qagText.innerHTML = processedText;
    qagContent.appendChild(qagText);
}



/**
 * Compares two dates and returns a value to be used for sorting.
 * @param {string} a - The first date as a string.
 * @param {string} b - The second date as a string.
 * @returns {number} - A value to be used for sorting (-1, 0, or 1).
 */
function compareDates(a, b) {
  if (a === 'Unknown') {
    return 1;
  }
  if (b === 'Unknown') {
    return -1;
  }
  return a.localeCompare(b);
}

/**
 * Formats a date string to the format "YYYY-MM-DD".
 * @param {string} date - The date string to be formatted.
 * @returns {string} - The formatted date string.
 */
function formatDate(date) {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Fetches the QAG list by fetching filenames and loading their JSON files.
 * @returns {Promise<Array>} - A promise that resolves to an array of QAG objects.
 */
async function fetchQAGList() {
  const filenames = await fetchQAGFilenames();
  const qagListPromises = filenames.map(async (filename) => {
    const json = await loadQAG(`qag_json/${filename}`);
    const dateJO = extractDate(json);
    const formattedDate = dateJO === 'Unknown' ? dateJO : formatDate(dateJO);
    return {
      date: formattedDate,
      title: filename.slice(0, -5),
      filename,
      file: `qag_json/${filename}`,
      category: json.question.indexationAN.rubrique,
      newtitle: json.question.indexationAN.analyses.analyse,
    };
  });
  const qagList = await Promise.all(qagListPromises);
  qagList.sort((a, b) => compareDates(a.date, b.date));
  return qagList;
}


/**
 * Loads a QAG JSON file.
 * @param {string} file - The file path of the QAG JSON file.
 * @returns {Promise<Object>} - A promise that resolves to the QAG JSON object.
 */
  async function loadQAG(file) {
    const response = await fetch(file);
    const json = await response.json();
    return json;
  }
  
/**
 * Populates the QAG selector with options based on the QAG list.
 * @param {Array} qagList - The array of QAG objects.
 */
    function populateQAGSelector(qagList) {
      qagList.forEach(qag => {
        const option = document.createElement('option');
        option.value = qag.file;
        
        const newTitle = qag.newtitle;
        const category = qag.category;
        option.textContent = `${qag.date} - ${qag.category} - ${newTitle} - ${qag.filename}`;
        qagSelector.appendChild(option);
      });
    }

/**
 * Clears the current QAG content from the page.
 */
  function clearQAGContent() {
    qagContent.innerHTML = '';
  }
  
/**
 * Fetches the QAG filenames from the server.
 * @returns {Promise<Array>} - A promise that resolves to an array of QAG filenames.
 */
  async function fetchQAGFilenames() {
    const response = await fetch('qag_filenames.txt');
    const text = await response.text();
    const filenames = text.split(/\s+/).filter((filename) => filename.trim() !== '');
    return filenames;
  }

  const qagList = await fetchQAGList();
  populateQAGSelector(qagList);

 
  qagSelector.addEventListener('change', updateQAGContent);

});
