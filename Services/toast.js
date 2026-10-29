function showToast(message, type = "info") {
    const toastEl = document.getElementById("toastMessage");
    const toastText = document.getElementById("toastText");
  
    toastText.textContent = message;
  
    // Change color based on type
    const toastClassMap = {
      success: "bg-success",
      error: "bg-danger",
      info: "bg-primary",
    };
  
    toastEl.className = `toast align-items-center text-white ${toastClassMap[type] || "bg-primary"} border-0`;
  
    const bsToast = new bootstrap.Toast(toastEl);
    bsToast.show();
  }
  