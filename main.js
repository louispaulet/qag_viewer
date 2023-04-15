document.addEventListener('DOMContentLoaded', async () => {
  const qagSelector = document.getElementById('qagSelector');
  const qagContent = document.getElementById('qagContent');
  
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

function highlightSentences(json, text) {
  //const text = json.question.textesReponse.texteReponse.texte;
  const sentimentData = json.question.textesReponse.texteReponse.sentiment_data;
  
  // If sentimentData is not available, return the input text without highlighting
  if (!sentimentData) {
    return text;
  }

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

    // Add the highlighted text
    if (sentiment < 3) {
      highlightedText += `<span style="background-color: rgba(255, 0, 0, ${opacity / 100});">${text.slice(beginChar, endChar)}</span>`;
    } else if (sentiment >= 3) {
      highlightedText += `<span style="background-color: rgba(0, 255, 0, ${opacity / 100});">${text.slice(beginChar, endChar)}</span>`;
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


function jsonToHTML(json) {
  const dateJO = extractDate(json);

  const qagDate = document.createElement('h3');
  qagDate.textContent = `Date of publication: ${dateJO === 'Unknown' ? dateJO : new Date(dateJO).toLocaleDateString()}`;
  qagContent.appendChild(qagDate);

  const qagTitle = document.createElement('h2');
  qagTitle.textContent = json.question.indexationAN.rubrique;
  qagContent.appendChild(qagTitle);

  const qagText = document.createElement('div');
  const rawText = json.question.textesReponse.texteReponse.texte;
  const highlightedText = highlightSentences(json, rawText);
  const convertedText = convertSpeakerNameToWikipediaLink(highlightedText);

  qagText.innerHTML = convertedText;
  qagContent.appendChild(qagText);
}




function compareDates(a, b) {
  if (a === 'Unknown') {
    return 1;
  }
  if (b === 'Unknown') {
    return -1;
  }
  return a.localeCompare(b);
}

function formatDate(date) {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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



  async function loadQAG(file) {
    const response = await fetch(file);
    const json = await response.json();
    return json;
  }

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

  function clearQAGContent() {
    qagContent.innerHTML = '';
  }

  async function fetchQAGFilenames() {
    const response = await fetch('qag_filenames.txt');
    const text = await response.text();
    const filenames = text.split(/\s+/).filter((filename) => filename.trim() !== '');
    return filenames;
  }

  const qagList = await fetchQAGList();
  populateQAGSelector(qagList);

  qagSelector.addEventListener('change', async (event) => {
    clearQAGContent();
    const selectedQAG = event.target.value;
    const json = await loadQAG(selectedQAG);
    jsonToHTML(json);
  });
});
