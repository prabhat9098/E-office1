
document.getElementById("loginModeSwitch").addEventListener("change", function () {
    const isUser = this.checked;
    document.getElementById("adminLogin").style.display = isUser ? "none" : "block";
    document.getElementById("userLogin").style.display = isUser ? "block" : "none";
  
    const loginHeader = document.getElementById("loginHeader");
    const switchLabel = document.getElementById("switchLabel");
  
    loginHeader.textContent = isUser ? "Office Management Login" : "Admin Management Login";
    switchLabel.textContent = isUser ? "Switch to Admin Login" : "Switch to User Login";
  });
  