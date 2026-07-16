import os
import warnings
import pickle
import numpy as np
import pandas as pd
import xgboost as xgb

from collections import Counter

from sklearn.model_selection import (
    train_test_split,
    RandomizedSearchCV
)

from sklearn.preprocessing import (
    StandardScaler,
    LabelEncoder
)

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.metrics import (
    accuracy_score,
    classification_report
)

from imblearn.over_sampling import SMOTE

warnings.filterwarnings("ignore")

# =========================================================
# CONFIG
# =========================================================

RANDOM_STATE = 42
TEST_SIZE = 0.2

DASS_DATA_PATH = r"C:\Users\CHIKITHA\Downloads\DASS.csv"
SURVEY_DATA_PATH = r"C:\Users\CHIKITHA\Downloads\set-3.csv"
LIFESTYLE_DATA_PATH = r"C:\Users\CHIKITHA\Downloads\lifestyle_mental_health.csv"

OUTPUT_DIR = "model_artifacts"

CLASS_NAMES = [
    "Low Risk",
    "Moderate Risk",
    "High Risk"
]

os.makedirs(OUTPUT_DIR, exist_ok=True)

# =========================================================
# HELPER FUNCTION
# =========================================================

def train_and_evaluate_models(
    X_train,
    y_train,
    X_test,
    y_test
):

    models_config = {

        "Logistic Regression": (

            LogisticRegression(
                random_state=RANDOM_STATE,
                max_iter=3000
            ),

            {
                'C': [0.01, 0.1, 1, 10],
                'class_weight': ['balanced', None],
                'solver': ['liblinear', 'lbfgs']
            }
        ),

        "Random Forest": (

            RandomForestClassifier(
                random_state=RANDOM_STATE
            ),

            {
                'n_estimators': [100, 200],
                'max_depth': [None, 10, 20],
                'min_samples_split': [2, 5],
                'min_samples_leaf': [1, 2],
                'class_weight': ['balanced', None]
            }
        ),

        "SVM": (

            LinearSVC(
                random_state=RANDOM_STATE,
                max_iter=5000
            ),

            {
                'C': [0.01, 0.1, 1.0, 10.0],
                'class_weight': ['balanced', None]
            }
        ),

        "XGBoost": (

            xgb.XGBClassifier(

                random_state=RANDOM_STATE,

                objective='multi:softmax',

                eval_metric='mlogloss',

                learning_rate=0.03,

                n_estimators=500,

                max_depth=8,

                min_child_weight=1,

                subsample=0.9,

                colsample_bytree=0.9,

                gamma=0.1,

                reg_alpha=0.1,

                reg_lambda=1,

                tree_method='hist',

                verbosity=0
            ),

            {
                'learning_rate': [0.01, 0.03, 0.05],
                'max_depth': [5, 7, 8],
                'n_estimators': [300, 500],
                'subsample': [0.8, 0.9, 1.0]
            }
        )
    }

    results = {}

    best_model = None
    best_accuracy = 0

    print("\n--- Training and Evaluating Models ---")

    for name, (base_model, param_grid) in models_config.items():

        print(f"\nTraining: {name}")

        # =====================================================
        # XGBOOST LABEL ENCODING
        # =====================================================

        if name == "XGBoost":

            encoder = LabelEncoder()

            y_train_fit = encoder.fit_transform(y_train)
            y_test_eval = encoder.transform(y_test)

            base_model.set_params(
                num_class=len(np.unique(y_train_fit))
            )

        else:

            y_train_fit = y_train
            y_test_eval = y_test

        # =====================================================
        # RANDOM SEARCH
        # =====================================================

        gs = RandomizedSearchCV(

            estimator=base_model,

            param_distributions=param_grid,

            cv=3,

            scoring='accuracy',

            n_iter=20,

            n_jobs=-1,

            random_state=RANDOM_STATE
        )

        gs.fit(X_train, y_train_fit)

        best_estimator = gs.best_estimator_

        y_pred = best_estimator.predict(X_test)

        # =====================================================
        # XGBOOST DECODE
        # =====================================================

        if name == "XGBoost":

            y_pred = encoder.inverse_transform(y_pred)

            y_test_eval = encoder.inverse_transform(
                y_test_eval
            )

        accuracy = accuracy_score(
            y_test_eval,
            y_pred
        )

        unique_classes = sorted(
            np.unique(y_test_eval)
        )

        target_names = [

            CLASS_NAMES[int(i)]

            if int(i) < len(CLASS_NAMES)

            else str(i)

            for i in unique_classes
        ]

        print(f"Best Params: {gs.best_params_}")
        print(f"Accuracy: {accuracy:.4f}")

        print(

            classification_report(

                y_test_eval,

                y_pred,

                target_names=target_names
            )
        )

        results[name] = {

            "model": best_estimator,

            "accuracy": accuracy
        }

        if accuracy > best_accuracy:

            best_accuracy = accuracy

            best_model = name

    print("\n================================================")
    print(f"BEST MODEL: {best_model}")
    print(f"BEST ACCURACY: {best_accuracy:.4f}")
    print("================================================")

    return (

        results[best_model]["model"],

        best_model,

        best_accuracy
    )

# =========================================================
# SAVE MODEL
# =========================================================

def save_artifacts(

    model,
    scaler,
    feature_cols,
    model_name,
    accuracy,
    file_path
):

    payload = {

        "model": model,

        "scaler": scaler,

        "feature_cols": feature_cols,

        "class_names": CLASS_NAMES,

        "model_name": model_name,

        "test_accuracy": accuracy
    }

    with open(file_path, "wb") as f:

        pickle.dump(payload, f)

    print(f"\nArtifacts saved to: {file_path}")

# =========================================================
# PIPELINE 1 : DASS DATASET
# =========================================================

def process_dass_dataset():

    print("\n" + "=" * 60)
    print("PIPELINE 1 : DASS DATASET")
    print("=" * 60)

    df = pd.read_csv(

        DASS_DATA_PATH,

        sep="\t",

        on_bad_lines='skip'
    )

    if df.empty:
        raise ValueError("DASS dataset is empty.")

    answer_cols = [

        c for c in df.columns

        if c.endswith("A")
    ]

    df_ans = df[answer_cols].apply(
        pd.to_numeric,
        errors="coerce"
    )

    df_ans.dropna(

        thresh=int(0.8 * len(answer_cols)),

        inplace=True
    )

    df_ans.fillna(

        df_ans.median(),

        inplace=True
    )

    valid_mask = (

        (df_ans >= 0).all(axis=1)

        &

        (df_ans <= 3).all(axis=1)
    )

    df_ans = df_ans[valid_mask]

    depression_cols = [

        "Q3A",
        "Q5A",
        "Q10A",
        "Q13A",
        "Q16A",
        "Q17A",
        "Q21A"
    ]

    df_ans["depression_score"] = (

        df_ans[depression_cols].sum(axis=1) * 2
    )

    def classify_depression(score):

        if score < 10:
            return 0

        elif score <= 20:
            return 1

        else:
            return 2

    df_ans["mental_state"] = (

        df_ans["depression_score"]

        .apply(classify_depression)
    )

    feature_cols = [

        c for c in df_ans.columns

        if c not in depression_cols
        + ["depression_score", "mental_state"]
    ]

    X = df_ans[feature_cols].values

    y = df_ans["mental_state"].values

    print(f"Shape: {X.shape}")
    print(f"Class Distribution: {Counter(y)}")

    X_train, X_test, y_train, y_test = train_test_split(

        X,
        y,

        test_size=TEST_SIZE,

        random_state=RANDOM_STATE,

        stratify=y
    )

    scaler = StandardScaler()

    X_train_sc = scaler.fit_transform(X_train)

    X_test_sc = scaler.transform(X_test)

    # =====================================================
    # SMOTE
    # =====================================================

    smote = SMOTE(random_state=42)

    X_train_sc, y_train = smote.fit_resample(
        X_train_sc,
        y_train
    )

    best_model, model_name, accuracy = (

        train_and_evaluate_models(

            X_train_sc,

            y_train,

            X_test_sc,

            y_test
        )
    )

    save_artifacts(

        best_model,

        scaler,

        feature_cols,

        model_name,

        accuracy,

        os.path.join(
            OUTPUT_DIR,
            "dass_model.pkl"
        )
    )

    return model_name, accuracy

# =========================================================
# PIPELINE 2 : SURVEY DATASET
# =========================================================

def process_survey_dataset():

    print("\n" + "=" * 60)
    print("PIPELINE 2 : SURVEY DATASET")
    print("=" * 60)

    df = pd.read_csv(

        SURVEY_DATA_PATH,

        on_bad_lines='skip'
    )

    if df.empty:
        raise ValueError("Survey dataset is empty.")

    df.columns = (

        df.columns

        .str.strip()

        .str.lower()
    )

    print("\nSurvey Dataset Columns:")
    print(df.columns.tolist())

    # =====================================================
    # HANDLE MISSING VALUES
    # =====================================================

    for col in df.columns:

        if df[col].dtype == 'object':

            if not df[col].mode().empty:

                df[col].fillna(

                    df[col].mode()[0],

                    inplace=True
                )

        else:

            df[col].fillna(

                df[col].median(),

                inplace=True
            )

    # =====================================================
    # GENDER CLEANING
    # =====================================================

    gender_map = {

        'male': 'Male',
        'm': 'Male',
        'cis male': 'Male',

        'female': 'Female',
        'f': 'Female',
        'cis female': 'Female'
    }

    if 'gender' in df.columns:

        df['gender'] = (

            df['gender']

            .astype(str)

            .str.lower()

            .str.strip()

            .map(gender_map)

            .fillna('Other')
        )

    # =====================================================
    # TARGET CREATION
    # =====================================================

    total_score = (

        df['anxiety_score']

        +

        df['depression_score']

        +

        df['stress_level']
    )

    def classify_mental_state(score):

        if score < 12:
            return 0

        elif score < 22:
            return 1

        else:
            return 2

    df['mental_state'] = (

        total_score.apply(
            classify_mental_state
        )
    )

    # =====================================================
    # FEATURE ENGINEERING
    # =====================================================

    df['combined_stress'] = (

        df['financial_stress']

        +

        df['work_stress']
    )

    df['mental_health_index'] = (

        df['anxiety_score']

        +

        df['depression_score']

        +

        df['loneliness_score']
    )

    df['wellbeing_score'] = (

        df['self_esteem_score']

        +

        df['life_satisfaction_score']
    )

    # =====================================================
    # ENCODING
    # =====================================================

    X_categorical = pd.get_dummies(

        df.drop('mental_state', axis=1),

        drop_first=True
    )

    feature_cols = X_categorical.columns.tolist()

    X = X_categorical.values

    y = df['mental_state'].values

    print(f"Shape: {X.shape}")
    print(f"Class Distribution: {Counter(y)}")

    # =====================================================
    # SPLIT
    # =====================================================

    X_train, X_test, y_train, y_test = train_test_split(

        X,
        y,

        test_size=TEST_SIZE,

        random_state=RANDOM_STATE,

        stratify=y
    )

    # =====================================================
    # SCALE
    # =====================================================

    scaler = StandardScaler()

    X_train_sc = scaler.fit_transform(X_train)

    X_test_sc = scaler.transform(X_test)

    # =====================================================
    # SMOTE
    # =====================================================

    smote = SMOTE(random_state=42)

    X_train_sc, y_train = smote.fit_resample(
        X_train_sc,
        y_train
    )

    # =====================================================
    # TRAIN
    # =====================================================

    best_model, model_name, accuracy = (

        train_and_evaluate_models(

            X_train_sc,

            y_train,

            X_test_sc,

            y_test
        )
    )

    # =====================================================
    # SAVE
    # =====================================================

    model_path = os.path.join(

        OUTPUT_DIR,

        "survey_model.pkl"
    )

    save_artifacts(

        best_model,

        scaler,

        feature_cols,

        model_name,

        accuracy,

        model_path
    )

    return model_name, accuracy

# =========================================================
# PIPELINE 3 : LIFESTYLE DATASET
# =========================================================

def process_lifestyle_dataset():

    print("\n" + "=" * 60)
    print("PIPELINE 3 : LIFESTYLE DATASET")
    print("=" * 60)

    df = pd.read_csv(

        LIFESTYLE_DATA_PATH,

        on_bad_lines='skip'
    )

    if df.empty:
        raise ValueError(
            "Lifestyle dataset is empty."
        )

    df.columns = (

        df.columns

        .str.strip()

        .str.lower()
    )

    if 'risk_level' not in df.columns:

        raise ValueError(
            "'risk_level' column missing."
        )

    df.dropna(inplace=True)

    risk_mapping = {

        'Low': 0,

        'Moderate': 1,

        'High': 2
    }

    df['mental_state'] = (

        df['risk_level']

        .astype(str)

        .str.strip()

        .str.title()

        .map(risk_mapping)
    )

    df.drop(

        'risk_level',

        axis=1,

        inplace=True
    )

    df.dropna(
        subset=['mental_state'],
        inplace=True
    )

    categorical_cols = (

        df.select_dtypes(
            include=['object']
        )

        .columns.tolist()
    )

    X_categorical = pd.get_dummies(

        df.drop('mental_state', axis=1),

        columns=categorical_cols,

        drop_first=True
    )

    feature_cols = X_categorical.columns.tolist()

    X = X_categorical.values

    y = df['mental_state'].values

    print(f"Shape: {X.shape}")
    print(f"Class Distribution: {Counter(y)}")

    X_train, X_test, y_train, y_test = train_test_split(

        X,
        y,

        test_size=TEST_SIZE,

        random_state=RANDOM_STATE,

        stratify=y
    )

    scaler = StandardScaler()

    X_train_sc = scaler.fit_transform(X_train)

    X_test_sc = scaler.transform(X_test)

    # =====================================================
    # SMOTE
    # =====================================================

    smote = SMOTE(random_state=42)

    X_train_sc, y_train = smote.fit_resample(
        X_train_sc,
        y_train
    )

    best_model, model_name, accuracy = (

        train_and_evaluate_models(

            X_train_sc,

            y_train,

            X_test_sc,

            y_test
        )
    )

    model_path = os.path.join(

        OUTPUT_DIR,

        "lifestyle_model.pkl"
    )

    save_artifacts(

        best_model,

        scaler,

        feature_cols,

        model_name,

        accuracy,

        model_path
    )

    return model_name, accuracy

# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":

    dass_model, dass_acc = process_dass_dataset()

    survey_model, survey_acc = (
        process_survey_dataset()
    )

    lifestyle_model, lifestyle_acc = (
        process_lifestyle_dataset()
    )

    print("\n" + "=" * 60)
    print("FINAL SUMMARY")
    print("=" * 60)

    print(
        f"\n1. DASS MODEL\n"
        f"Best Model: {dass_model}\n"
        f"Accuracy: {dass_acc:.2%}"
    )

    print(
        f"\n2. SURVEY MODEL\n"
        f"Best Model: {survey_model}\n"
        f"Accuracy: {survey_acc:.2%}"
    )

    print(
        f"\n3. LIFESTYLE MODEL\n"
        f"Best Model: {lifestyle_model}\n"
        f"Accuracy: {lifestyle_acc:.2%}"
    )

    print("\nAll models trained and saved successfully.")