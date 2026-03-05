from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)

 
model = pickle.load(open("sales_model.pkl", "rb"))
model_columns = pickle.load(open("model_columns.pkl", "rb"))
df = pd.read_csv("train.csv")


@app.route("/")
def home():
    return "✅ AI Sales Insight Backend Running"


@app.route("/top-product")
def top_product():

    top = df.groupby("Product Name")["Sales"].sum()

    return jsonify({
        "product": top.idxmax(),
        "sales": float(top.max())
    })



@app.route("/revenue-region")
def revenue_region():

    revenue = df.groupby("Region")["Sales"].sum()

    return jsonify(revenue.to_dict())

 

@app.route("/monthly-trend")
def monthly_trend():

    df["Order Date"] = pd.to_datetime(
        df["Order Date"],
        dayfirst=True
    )

    monthly = df.groupby(
        df["Order Date"].dt.to_period("M")
    )["Sales"].sum()

    return jsonify({
        str(k): float(v)
        for k, v in monthly.items()
    })



@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.json

        input_df = pd.DataFrame([{
            "Ship Mode": data["Ship_Mode"],
            "Segment": data["Segment"],
            "Category": data["Category"],
            "Sub-Category": data["Sub_Category"],
            "Region": data["Region"],

            "Quantity": float(data["Quantity"]),
            "Discount": float(data["Discount"]),

            "Order_Year": int(data["Order_Year"]),
            "Order_Month": int(data["Order_Month"]),
            "Order_Day": int(data["Order_Day"]),
            "Shipping_Days": int(data["Shipping_Days"])
        }])

        input_df = pd.get_dummies(input_df)

        for col in model_columns:
            if col not in input_df.columns:
                input_df[col] = 0

        input_df = input_df[model_columns]

        pred_log = model.predict(input_df)[0]

        predicted_sales = np.expm1(pred_log)

        return jsonify({
            "predicted_sales": round(float(predicted_sales), 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)