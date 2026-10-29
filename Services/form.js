<script>
  document.addEventListener("DOMContentLoaded", () => {
    const randomId = 'APP' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('appId').value = randomId;
  });

  document.getElementById('appForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Get data from form
    const application = {
      id: document.getElementById("appId").value,
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      name: document.querySelector('input[placeholder="Name of Applicant"]')?.value || "",
      phone: document.querySelector('input[type="tel"]')?.value || "",
      subject: document.querySelector('input[placeholder="Subject"]')?.value || "",
      address: document.querySelector('textarea')?.value || "",
      category: document.querySelectorAll("select")[0]?.value,
      department: document.querySelectorAll("select")[1]?.value,
      applicationType: document.querySelector('input[placeholder="e.g., Online/Offline"]')?.value || "",
      stage: "Received",
      createdAt: new Date().toLocaleString(),
      updatedBy: "",
      updatedAt: ""
    };

    // Get existing applications or create new array
    const applications = JSON.parse(localStorage.getItem("applications") || "[]");

    // Add new application
    applications.push(application);

    // Save back to localStorage
    localStorage.setItem("applications", JSON.stringify(applications));

    alert("Application submitted successfully!");

    // Reset form
    this.reset();

    // Generate new App ID
    const newId = 'APP' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('appId').value = newId;
  });
</script>
