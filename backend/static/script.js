const API = "";

/* ── Live date badges ── */
(function () {
  const fmt = { month: "short", day: "numeric", year: "numeric" };
  const now = new Date();
  const str = now.toLocaleDateString("en-US", fmt);
  const badge = document.getElementById("liveDateBadge");
  const footer = document.getElementById("footerDate");
  if (badge) badge.textContent = str;
  if (footer) footer.textContent = str;
})();

/* ── Chart.js global defaults ── */
Chart.defaults.color = "rgba(148,163,184,0.5)";
Chart.defaults.font.family = "'Geist Mono', monospace";
Chart.defaults.font.size = 11;

const gridStyle = {
  color: "rgba(255,255,255,0.04)",
  drawBorder: false
};

const tickStyle = { color: "rgba(148,163,184,0.45)" };

/* ── Top Product ── */
fetch(API + "/top-product")
  .then(r => r.json())
  .then(data => {
    document.getElementById("topProduct").textContent =
      data.product + "  ($" + Number(data.sales).toLocaleString() + ")";
  })
  .catch(() => {
    document.getElementById("topProduct").textContent = "Canon imageCLASS";
  });

/* ── Revenue by Region ── */
fetch(API + "/revenue-region")
  .then(r => r.json())
  .then(data => buildRegionChart(Object.keys(data), Object.values(data)))
  .catch(() => buildRegionChart(
    ["West", "East", "Central", "South"],
    [82000, 74000, 55000, 41000]
  ));

function buildRegionChart(labels, values) {
  const ctx = document.getElementById("regionChart");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Revenue ($)",
        data: values,
        backgroundColor: [
          "rgba(16,185,129,0.7)",
          "rgba(16,185,129,0.45)",
          "rgba(245,158,11,0.6)",
          "rgba(245,158,11,0.35)"
        ],
        hoverBackgroundColor: [
          "rgba(16,185,129,0.9)",
          "rgba(16,185,129,0.65)",
          "rgba(245,158,11,0.8)",
          "rgba(245,158,11,0.55)"
        ],
        borderRadius: 7,
        borderSkipped: false,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#111827",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          titleColor: "#94A3B8",
          bodyColor: "#F1F5F9",
          padding: 10,
          callbacks: {
            label: ctx => " $" + ctx.parsed.y.toLocaleString()
          }
        }
      },
      scales: {
        x: { grid: gridStyle, ticks: tickStyle, border: { display: false } },
        y: {
          grid: gridStyle,
          ticks: {
            ...tickStyle,
            callback: v => "$" + (v / 1000).toFixed(0) + "k"
          },
          border: { display: false }
        }
      }
    }
  });
}

/* ── Monthly Trend ── */
fetch(API + "/monthly-trend")
  .then(r => r.json())
  .then(data => buildMonthlyChart(Object.keys(data), Object.values(data)))
  .catch(() => buildMonthlyChart(
    ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    [38000,42000,39000,51000,47000,58000,62000,57000,70000,66000,74000,80000]
  ));

function buildMonthlyChart(labels, values) {
  const canvas = document.getElementById("monthlyChart");
  const gCtx = canvas.getContext("2d");
  const grad = gCtx.createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, "rgba(16,185,129,0.18)");
  grad.addColorStop(1, "rgba(16,185,129,0.00)");

  new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Revenue",
        data: values,
        borderColor: "#10B981",
        borderWidth: 2,
        pointBackgroundColor: "#10B981",
        pointBorderColor: "#080B10",
        pointBorderWidth: 2,
        pointRadius: 3.5,
        pointHoverRadius: 5,
        fill: true,
        backgroundColor: grad,
        tension: 0.45
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#111827",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          titleColor: "#94A3B8",
          bodyColor: "#F1F5F9",
          padding: 10,
          callbacks: {
            label: ctx => " $" + ctx.parsed.y.toLocaleString()
          }
        }
      },
      scales: {
        x: { grid: gridStyle, ticks: tickStyle, border: { display: false } },
        y: {
          grid: gridStyle,
          ticks: {
            ...tickStyle,
            callback: v => "$" + (v / 1000).toFixed(0) + "k"
          },
          border: { display: false }
        }
      }
    }
  });
}

/* ── Predict Sales ── */
function predictSales() {
  const dateValue = document.getElementById("orderDate").value;
  if (!dateValue) {
    showError("Please select an Order Date to continue.");
    return;
  }

  const qty  = Number(document.getElementById("quantity").value);
  const disc = Number(document.getElementById("discount").value);

  if (!qty || qty <= 0) {
    showError("Please enter a valid Quantity.");
    return;
  }

  const btn = document.querySelector(".predict-btn");
  const box = document.getElementById("predictionBox");

  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="animation:spin 0.9s linear infinite">
      <path d="M14 8A6 6 0 1 1 8 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
    Predicting…
  `;
  btn.disabled = true;
  box.className = "result-box";
  box.innerHTML = `<div class="result-idle">
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="animation:spin 0.9s linear infinite"><path d="M14 8A6 6 0 1 1 8 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    <span>Running model inference…</span>
  </div>`;

  const [year, month, day] = dateValue.split("-").map(Number);

  const payload = {
    Ship_Mode:     document.getElementById("shipMode").value,
    Segment:       document.getElementById("segment").value,
    Category:      document.getElementById("category").value,
    Sub_Category:  document.getElementById("subCategory").value,
    Region:        document.getElementById("region").value,
    Quantity:      qty,
    Discount:      disc,
    Order_Year:    year,
    Order_Month:   month,
    Order_Day:     day,
    Shipping_Days: Number(document.getElementById("shipping").value)
  };

  fetch(API + "/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(r => r.json())
    .then(data => {
      if (data.predicted_sales) {
        const val = Number(data.predicted_sales).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        box.className = "result-box has-result";
        box.innerHTML = `💰 Predicted Revenue — $${val}`;
      } else {
        showError(data.error || "Prediction failed. Check server logs.");
      }
    })
    .catch(() => {
      showError("Server unavailable. Ensure Flask is running on port 5000.");
    })
    .finally(() => {
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1L15 8L8 15M1 8H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Run Prediction
      `;
      btn.disabled = false;
    });
}

function showError(msg) {
  const box = document.getElementById("predictionBox");
  box.className = "result-box has-error";
  box.innerHTML = `<span>⚠️ ${msg}</span>`;
}

/* ── Spin keyframe injected via JS ── */
const style = document.createElement("style");
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);