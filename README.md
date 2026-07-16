# 🧠 NeuroGuard – AI-Powered Mental Health Prediction System

> An AI-powered web application that predicts an individual's mental health status using machine learning and provides instant insights through an intuitive user interface.

---

## 📖 Overview

Mental health disorders often go unnoticed due to the lack of early assessment tools. **NeuroGuard** is an intelligent mental health prediction system that leverages machine learning to analyze user responses and predict potential mental health conditions.

The system aims to assist individuals by providing quick, data-driven insights based on psychological assessment questionnaires. It is designed as an educational and research-oriented application and is **not intended to replace professional medical diagnosis**.

---

## ✨ Features

- 🧠 AI-powered mental health prediction
- 📊 Machine Learning-based classification
- 📋 Interactive questionnaire interface
- ⚡ Instant prediction results
- 📈 User-friendly dashboard
- 🎯 High prediction accuracy using XGBoost
- 🔄 Data preprocessing and feature engineering
- 💻 Responsive web interface
- 📑 Easy-to-understand prediction report

---


#🏗️ System Architecture
Here is the updated System Architecture diagram reflecting the addition of the dashboard and exercise provisions.

You can copy and paste this markdown block directly into your `README.md` file:

```markdown
🏗️ System Architecture


```

```
                User
                  │
                  ▼
       Web Application (Node.js/JS)
                  │
                  ▼
      Data Preprocessing Pipeline
                  │
                  ▼
     Trained Machine Learning Models
        (DASS, Lifestyle, Survey)
                  │
                  ▼
       Mental Health Prediction
                  │
                  ▼
      Dashboard & Analysis Display
                  │
                  ▼
  Personalized Exercises & Recommendations

```

```

```

---

# 🛠️ Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript

## Backend

- Python
- Flask

## Machine Learning

- Scikit-learn
- XGBoost
- Pandas
- NumPy
- Joblib

## Data Visualization

- Matplotlib
- Seaborn

## Development Tools

- VS Code
- Git
- GitHub

---

# 📂 Project Structure

```
## 📂 Project Structure

```text
NEUROGUARD-MENTAL-HEALTH-PREDICTION-SYSTEM/
│
├── Datasets/
│   ├── DASS.csv
│   ├── lifestyle_mental_health.csv
│   └── set-3.csv
│
├── ML_Model/
│   ├── model_artifacts/
│   │   ├── dass_model.pkl
│   │   ├── lifestyle_model.pkl
│   │   └── survey_model.pkl
│   └── ML.py
│
├── app.js
├── check.py
├── firebase-config.js
├── index.html
├── modify.py
├── README.md
├── requirements.txt
├── styles_full.css
├── styles_utf8.css
└── styles.css
``

---
## 📝 Assessment Parameters

NeuroGuard evaluates an individual's mental well-being using a set of carefully selected psychological and behavioral parameters. Each parameter represents an important aspect of mental health and helps the machine learning model understand the user's emotional and cognitive state. The responses collected through these parameters are transformed into numerical features and analyzed to predict the user's mental health condition.

| Parameter | Description |
|------------|-------------|
| **Emotional State** | Evaluates the user's emotional well-being and ability to regulate emotions in daily life. |
| **Stress Levels** | Measures the level of stress experienced due to academic, professional, or personal responsibilities. |
| **Overthinking** | Identifies repetitive or excessive worrying that may affect mental health. |
| **Thought Patterns** | Analyzes the presence of persistent negative or repetitive thoughts. |
| **Energy & Exhaustion** | Assesses mental and physical fatigue that may indicate emotional burnout. |
| **Sleep Behavior** | Evaluates sleep quality, including difficulty falling asleep or maintaining healthy sleep patterns. |
| **Social Interaction** | Measures the level of social engagement and feelings of isolation or loneliness. |
| **Focus & Concentration** | Determines the user's ability to stay focused on important daily activities. |
| **Daily Habits** | Examines consistency in maintaining healthy routines such as eating, exercising, and self-care. |
| **Anxiety** | Assesses the frequency and intensity of anxious feelings or nervousness. |
| **Motivation** | Evaluates enthusiasm, interest, and willingness to perform daily tasks and achieve goals. |

---

## 📋 Questionnaire

The assessment consists of a series of simple, non-invasive questions designed to evaluate different aspects of an individual's mental well-being. Users respond using a rating scale (e.g., **Never**, **Rarely**, **Sometimes**, **Often**, **Always**), allowing the system to quantify behavioral and emotional patterns.

The questionnaire includes the following questions:

1. **How often do you feel overwhelmed by your emotions?**
2. **How often do you feel under extreme stress or pressure?**
3. **Do you find yourself caught in loops of repetitive or worrying thoughts?**
4. **Do you struggle to control or dismiss negative thoughts?**
5. **How often do you feel mentally or emotionally drained?**
6. **Do you have difficulty falling or staying asleep?**
7. **Do you feel isolated or disconnected from people around you?**
8. **How well are you able to concentrate on tasks that matter to you?**
9. **Do you find it difficult to maintain healthy daily routines such as eating, exercising, or self-care?**
10. **How often do you experience feelings of anxiety or nervousness?**
11. **How motivated do you feel to complete your daily tasks and pursue your personal goals?**

---

## ⚙️ How the Assessment Works

1. The user completes the mental health questionnaire.
2. Each response is converted into a numerical value based on the selected rating.
3. The collected responses are preprocessed and transformed into machine learning features.
4. The trained XGBoost model analyzes the user's psychological and behavioral patterns.
5. The system predicts the user's mental health status and displays the result through an interactive dashboard.

> **Note:** This assessment is intended for educational and awareness purposes only. It is not a substitute for professional psychological or medical diagnosis.

# 📊 Machine Learning Pipeline

```
Dataset Collection
        │
        ▼
Data Cleaning
        │
        ▼
Feature Engineering
        │
        ▼
Encoding & Scaling
        │
        ▼
Train-Test Split
        │
        ▼
Model Training
        │
        ▼
Model Evaluation
        │
        ▼
Prediction
```

---

# 🤖 Machine Learning Models

The following machine learning algorithms were experimented with:

- Logistic Regression
- Support Vector Machine (SVM)
- Decision Tree
- Random Forest
- XGBoost

Among all models, **XGBoost** produced the best overall performance.

# 📊 Evaluation Metrics

The project evaluates model performance using:

- Accuracy
- Precision
- Recall
- F1-Score
- Confusion Matrix

---

# 📋 Dataset

The dataset contains psychological and lifestyle-related information used to predict mental health conditions.

Typical features include:

- Age
- Gender
- Academic Pressure
- Work Pressure
- Sleep Duration
- Financial Stress
- Family History
- Lifestyle Habits
- Anxiety Indicators
- Depression Indicators

The dataset is preprocessed before model training using feature engineering and scaling techniques.

---

# 🚀 Installation

## Clone the Repository

```bash
git clone https://github.com/Riteshh22/NeuroGuard-Mental-Health-Prediction-System.git
```

---

## Navigate to Project Folder

```bash
cd NeuroGuard-Mental-Health-Prediction-System
```

---

## Create Virtual Environment

Windows

```bash
python -m venv venv
venv\Scripts\activate
```

Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Run the Application

```bash
python app.py
```

Open your browser and visit:

```
http://127.0.0.1:5000
```

---

# 💡 How It Works

1. User opens the application.
2. Completes the mental health questionnaire.
3. Responses are preprocessed.
4. The trained XGBoost model analyzes the responses.
5. The prediction is generated instantly.
6. Results are displayed on the dashboard.

---

# 🎯 Key Highlights

- Early mental health assessment
- AI-assisted prediction
- Fast response time
- Easy-to-use interface
- Accurate machine learning model
- Educational and research-focused application

---

# 🔮 Future Improvements

- AI Chatbot for mental health guidance
- Explainable AI (SHAP/LIME)
- Personalized wellness recommendations
- Mobile application
- Cloud deployment
- Real-time analytics dashboard
- Multi-language support
- Doctor/Admin portal
- User authentication and secure profiles

---

# ⚠️ Disclaimer

This project is developed for **educational and research purposes only**.

The predictions generated by NeuroGuard should **not be considered a medical diagnosis**. Users are encouraged to consult licensed mental health professionals for clinical advice.

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Added new feature"
```

4. Push the branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---



**Bhanavath Ritesh Naik**

🎓 B.Tech – Data Science

📧 Email: bhanavathriteshnaik@gmail.com

 GitHub: https://github.com/Riteshh22

