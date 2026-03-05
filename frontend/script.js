const API = "http://127.0.0.1:5000";

fetch(API + "/top-product")
.then(res => res.json())
.then(data => {
document.getElementById("topProduct").innerText =
data.product + " ($" + data.sales + ")";
});


fetch(API + "/revenue-region")
.then(res => res.json())
.then(data => {

new Chart(document.getElementById("regionChart"), {
type: "bar",
data: {
labels: Object.keys(data),
datasets: [{
label: "Revenue",
data: Object.values(data)
}]
}
});

});

fetch(API + "/monthly-trend")
.then(res => res.json())
.then(data => {

new Chart(document.getElementById("monthlyChart"), {
type: "line",
data: {
labels: Object.keys(data),
datasets: [{
label: "Monthly Sales",
data: Object.values(data)
}]
}
});

});

function predictSales(){

const dateValue =
document.getElementById("orderDate").value;

if(!dateValue){
alert("Please select Order Date");
return;
}

let date = dateValue.split("-");

const payload = {

Ship_Mode:
document.getElementById("shipMode").value,

Segment:
document.getElementById("segment").value,

Category:
document.getElementById("category").value,

Sub_Category:
document.getElementById("subCategory").value,

Region:
document.getElementById("region").value,

Quantity:Number(
document.getElementById("quantity").value),

Discount:Number(
document.getElementById("discount").value),

Order_Year:Number(date[0]),
Order_Month:Number(date[1]),
Order_Day:Number(date[2]),

Shipping_Days:Number(
document.getElementById("shipping").value)
};

console.log("Sending Data:", payload);

fetch(API + "/predict", {
method: "POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => {

console.log("Response:", data);

if(data.predicted_sales){
document.getElementById("prediction").innerHTML =
"💰 Predicted Sales: $" +
data.predicted_sales;
}
else{
document.getElementById("prediction").innerText =
data.error || "Prediction Failed";
}

})
.catch(err=>{
console.error(err);
document.getElementById("prediction").innerText =
"Server Error";
});

}