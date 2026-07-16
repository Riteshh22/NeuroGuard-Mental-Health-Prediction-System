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

# 🏗️ System Architecture

This diagram reflects the application flow and the addition of dashboard and exercise recommendation features.

```text
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
```

---

# 📝 Assessment Parameters

NeuroGuard evaluates an individual's mental well-being through carefully selected psychological and behavioral indicators. These parameters help the machine learning model understand the user's emotional, cognitive, and lifestyle patterns before generating a prediction.

### Parameters

🧠 **Emotional State**
- Evaluates emotional stability and mood regulation.

😣 **Stress Levels**
- Measures stress caused by academic, professional, or personal responsibilities.

💭 **Overthinking**
- Detects repetitive worrying and excessive thinking patterns.

🧩 **Thought Patterns**
- Identifies persistent negative or repetitive thoughts.

⚡ **Energy & Exhaustion**
- Measures mental and physical fatigue.

😴 **Sleep Behavior**
- Evaluates sleep quality and sleeping habits.

👥 **Social Interaction**
- Assesses social engagement and feelings of isolation.

🎯 **Focus & Concentration**
- Measures the ability to stay focused on important tasks.

🏃 **Daily Habits**
- Evaluates consistency in healthy routines like eating, exercising, and self-care.

😟 **Anxiety**
- Measures anxious feelings and nervousness.

🚀 **Motivation**
- Assesses enthusiasm and willingness to complete daily activities.

---

# 📋 Assessment Questionnaire

The user answers the following questions before the prediction is generated.

- How often do you feel overwhelmed by your emotions?
- How often do you feel under extreme stress or pressure?
- Do you find yourself caught in repetitive or worrying thoughts?
- Do you struggle to control or dismiss negative thoughts?
- How often do you feel mentally or emotionally drained?
- Do you have difficulty falling or staying asleep?
- Do you feel isolated or disconnected from people around you?
- How well are you concentrate on tasks that matter to you?
- Do you find it difficult to maintain healthy daily routines?
- How often do you experience anxiety or nervousness?
- How motivated do you feel to complete your daily tasks?

---

# ⚙️ How It Works

```
User Questionnaire
        │
        ▼
 Response Encoding
        │
        ▼
 Data Preprocessing
        │
        ▼
 XGBoost Prediction Model
        │
        ▼
 Mental Health Prediction
        │
        ▼
 Interactive Dashboard
```

---

# 🤖 Machine Learning Models

The following algorithms were trained and evaluated:

- Logistic Regression
- Decision Tree
- Random Forest
- Support Vector Machine (SVM)
- XGBoost ✅ (Best Performing Model)


# 📂 Dataset

The dataset contains psychological and lifestyle-related information, including:

- Age
- Gender
- Academic Pressure
- Work Pressure
- Financial Stress
- Sleep Duration
- Family History
- Lifestyle Habits
- Anxiety Indicators
- Depression Indicators

---

# 💡 Workflow

```
Questionnaire
      │
      ▼
Preprocessing
      │
      ▼
Feature Engineering
      │
      ▼
Model Prediction
      │
      ▼
Result Generation
      │
      ▼
Dashboard Visualization
```

Among all models, **XGBoost** produced the best overall performance.

---

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

## Navigate to Project Folder

```bash
cd NeuroGuard-Mental-Health-Prediction-System
```

## Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run the Application

```bash
python app.py
```

Open your browser and visit:


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

