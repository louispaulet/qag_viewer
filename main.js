document.addEventListener('DOMContentLoaded', async () => {
  const qagSelector = document.getElementById('qagSelector');
  const qagContent = document.getElementById('qagContent');
  
  // Load the JSON file
  async function loadQAG(file) {
    const response = await fetch(file);
    const json = await response.json();
    return json;
  }

  // Populate the QAG selector
  function populateQAGSelector(qagList) {
    qagList.forEach(qag => {
      const option = document.createElement('option');
      option.value = qag.file;
      option.textContent = qag.title;
      qagSelector.appendChild(option);
    });
  }

  // Convert JSON to HTML
  function jsonToHTML(json) {
    // Here, you can create the HTML structure based on the JSON content
    const qagTitle = document.createElement('h2');
    qagTitle.textContent = json.question.indexationAN.rubrique;
    qagContent.appendChild(qagTitle);

    const qagText = document.createElement('div');
    qagText.innerHTML = json.question.textesReponse.texteReponse.texte;
    qagContent.appendChild(qagText);
  }

  // Clear the QAG content
  function clearQAGContent() {
    qagContent.innerHTML = '';
  }

  // Load QAG list (replace this with your own list of QAG files)
  const qagList = [
    {
      title: 'QAG Example',
      file: 'qag_json/QANR5L16QG6.json',
    },
  ];

  populateQAGSelector(qagList);

  qagSelector.addEventListener('change', async (event) => {
    clearQAGContent();
    const selectedQAG = event.target.value;
    const json = await loadQAG(selectedQAG);
    jsonToHTML(json);
  });
});
