window.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById("calc-form");
  if (form) {
    setupIntialValues();
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      update();
    });
  }
});

function getCurrentUIValues() {
  return {
    amount: +(document.getElementById("loan-amount").value),
    years: +(document.getElementById("loan-years").value),
    rate: +(document.getElementById("loan-rate").value),
  }
}

// Get the inputs from the DOM.
// Put some default values in the inputs
// Call a function to calculate the current monthly payment
function setupIntialValues() {
    document.getElementById("loan-amount").value = 15000;
    document.getElementById("loan-years").value = 15;
    document.getElementById("loan-rate").value = 1.05;
}

// Get the current values from the UI
// Update the monthly payment
function update() {
    const values = getCurrentUIValues();

    try {
        updateMonthly(calculateMonthlyPayment(values));
    } catch (e) {
        alert(e.message);
    }
}

// Given an object of values (a value has amount, years and rate ),
// calculate the monthly payment.  The output should be a string
// that always has 2 decimal places.
function calculateMonthlyPayment(values) {
    if (values.years <= 0)
        throw Error(`"Term in Years" must be greater than 0.`);
    if (values.rate <= 0)
        throw Error(`"Yearly Rate" must be greater than 0.`);

    const i = values.rate / 12;
    const n = values.years * 12;

    const payment = (values.amount * i) / (1 - Math.pow(1 + i, -n));
    return payment.toFixed(2);
}

// Given a string representing the monthly payment value,
// update the UI to show the value.
function updateMonthly(monthly) {
    document.getElementById("monthly-payment").innerText = `$${monthly}`;
}
