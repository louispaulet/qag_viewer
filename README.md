# 🎉 QAG Viewer 🎉

Welcome to the QAG Viewer repository! This project helps you visualize French parliamentary questions and answers from the National Assembly in a user-friendly format. ✨

QAG source: https://data.assemblee-nationale.fr/travaux-parlementaires/questions/questions-au-gouvernement  

## 🚀 Features

- Populates a dropdown selector with JSON files containing questions and answers
- Displays the selected QAG with proper formatting
- Allows you to toggle between two display modes:
  - Highlighting sentences based on sentiment analysis
  - Converting speaker names to their respective Wikipedia links
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

To use the QAG Viewer, update your JSON files according to this structure:

```json
{
  "question": {
    "indexationAN": {
      "rubrique": "entreprises",
      "teteAnalyse": null,
      "analyses": {
        "analyse": "\"Uber files\""
      },
      "minAttribs": {
        "minAttrib": {
          "infoJO": {
            "dateJO": "2023-04-10"
          }
        }
      }
    },
    "textesReponse": {
      "texteReponse": {
        "texte": "Here goes the text of the question and answer...",
        "sentiment_data": [
          {
            "begin_char": 0,
            "end_char": 100,
            "sentiment": "4 stars",
            "score": 0.8
          }
        ],
        "infoJO": {
          "dateJO": "2023-04-10"
        }
      }
    }
  }
}
```

The final selector item will be displayed as: `yyyy-mm-dd - Uber files - QANR5L16QG3.json`

Enjoy using the QAG Selector! 😃

