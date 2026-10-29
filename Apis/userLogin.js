// user-login.js

const mockDatabase = ["9876543210", "9123456789"]; // Mocked valid phone numbers
let generatedOtp = "";

// Redirect if already logged in
if (localStorage.getItem("user")) {
  window.location.href = "UserTypeApplicationform.html";
}

// Phone input validation
document.getElementById("phoneNumber").addEventListener("input", function () {
  const number = this.value.trim();
  const errorDiv = document.getElementById("phoneError");
  const otpBtn = document.getElementById("getOtpBtn");

  if (number.length === 10) {
    if (!number.match(/^\d{10}$/)) {
      errorDiv.textContent = "Please enter only numeric digits.";
      otpBtn.disabled = true;
    } else if (!mockDatabase.includes(number)) {
      errorDiv.textContent = "You are not a registered user. Please contact admin.";
      otpBtn.disabled = true;
    } else {
      errorDiv.textContent = "";
      otpBtn.disabled = false;
    }
  } else {
    errorDiv.textContent = number.length > 0 ? "Enter a 10-digit number." : "";
    otpBtn.disabled = true;
  }
});

// Send OTP (mock)
function sendOtp() {
  generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  alert("Mock OTP sent: " + generatedOtp); // Replace with Fast2SMS API
  new bootstrap.Modal(document.getElementById("otpModal")).show();
}

// Verify OTP
function verifyOtp() {
  const enteredOtp = document.getElementById("otpInput").value.trim();
  if (enteredOtp === generatedOtp) {
    const phone = document.getElementById("phoneNumber").value.trim();
    localStorage.setItem("user", phone);
    localStorage.setItem("usertype", "User"); // <-- Add this line
    sessionStorage.setItem("user", phone);
    window.location.href = "UserTypeApplicationform.html";
  } else {
    alert("Incorrect OTP. Try again.");
  }
}

