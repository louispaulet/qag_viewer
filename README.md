# 🎉 QAG Selector 🎉

Welcome to the QAG Selector repository! This project helps you populate a dropdown menu with JSON files and display them in a user-friendly format. ✨

QAG source: https://data.assemblee-nationale.fr/travaux-parlementaires/questions/questions-au-gouvernement  

## 🚀 Features

- Populates a dropdown selector with JSON files
- Formats the displayed JSON file titles
- Easy to integrate into your web application

## 🔧 Setup

1. Clone the repository

```
git clone https://github.com/louispaulet/qag_viewer.git
```

2. Navigate to the project folder

```
cd qag_viewer
```

3. Open the `index.html` file in your browser

## 📄 Usage

To use the QAG Selector, update your JSON files according to this structure:


```json
{
  "indexationAN": {
    "rubrique": "entreprises",
    "teteAnalyse": null,
    "analyses": {
      "analyse": "\"Uber files\""
    }
  }
}
```

The final selector item will be displayed as: `yyyy-mm-dd - Uber files - QANR5L16QG3.json`

Enjoy using the QAG Selector! 😃

