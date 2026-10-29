// Api/applicationFormsubapi.js

async function submitApplication(formData) {
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error submitting application:", error);
      throw error;
    }
  }
  