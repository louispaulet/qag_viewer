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

function jsonToHTML(json) {
  const dateJO = extractDate(json);

  const qagDate = document.createElement('h3');
  qagDate.textContent = `Date of publication: ${dateJO === 'Unknown' ? dateJO : new Date(dateJO).toLocaleDateString()}`;
  qagContent.appendChild(qagDate);

  const qagTitle = document.createElement('h2');
  qagTitle.textContent = json.question.indexationAN.rubrique;
  qagContent.appendChild(qagTitle);

  const qagText = document.createElement('div');
  qagText.innerHTML = json.question.textesReponse.texteReponse.texte;
  qagContent.appendChild(qagText);
}

async function fetchQAGList() {
  const filenames = await fetchQAGFilenames();
  const qagListPromises = filenames.map(async (filename) => {
    const json = await loadQAG(`qag_json/${filename}`);
    const dateJO = extractDate(json);
    return {
      date: dateJO === 'Unknown' ? dateJO : new Date(dateJO).toLocaleDateString(),
      title: filename.slice(0, -5),
      filename,
      file: `qag_json/${filename}`,
    };
  });
  const qagList = await Promise.all(qagListPromises);
  qagList.sort((a, b) => a.date === 'Unknown' ? 1 : b.date === 'Unknown' ? -1 : new Date(a.date) - new Date(b.date));
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
