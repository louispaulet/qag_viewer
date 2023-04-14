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
      console.log(name)
      name = name.replace('M. ', '')
      name = name.replace('Mme ', '')
      name = name.replaceAll('.', '')
      name = name.replaceAll(',', '')
      console.log(name)
    return encodeURIComponent(name.trim().replace(/\s+/g, "_"));
  }

  return text.replace(regex, (match, speakerName) => {
    const encodedName = encodeSpeakerName(speakerName);
    const wikipediaURL = `${wikipediaBaseURL}${encodedName}`;
    return `<strong><a href="${wikipediaURL}">${speakerName}</a></strong>`;
  });
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
  const convertedText = convertSpeakerNameToWikipediaLink(rawText);
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
      option.textContent = `${qag.date} - ${qag.title} - ${qag.filename}`;
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
