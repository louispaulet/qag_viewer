document.addEventListener('DOMContentLoaded', async () => {
  const qagSelector = document.getElementById('qagSelector');
  const qagContent = document.getElementById('qagContent');

  async function loadQAG(file) {
    const response = await fetch(file);
    const json = await response.json();
    return json;
  }

  function populateQAGSelector(qagList) {
    qagList.forEach(qag => {
      const option = document.createElement('option');
      option.value = qag.file;
      option.textContent = qag.title;
      qagSelector.appendChild(option);
    });
  }

  function jsonToHTML(json) {
    const qagTitle = document.createElement('h2');
    qagTitle.textContent = json.question.indexationAN.rubrique;
    qagContent.appendChild(qagTitle);

    const qagText = document.createElement('div');
    qagText.innerHTML = json.question.textesReponse.texteReponse.texte;
    qagContent.appendChild(qagText);
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

  async function fetchQAGList() {
    const filenames = await fetchQAGFilenames();
    const qagList = filenames.map((filename) => ({
      title: filename.slice(0, -5),
      file: `qag_json/${filename}`,
    }));
    return qagList;
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
