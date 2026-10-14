document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contact-form");
  const successMessage = document.getElementById("success-message");
  const errorMessage = document.getElementById("error-message");
  const submitButton = contactForm?.querySelector("button[type='submit']");

  if (!contactForm || !successMessage || !errorMessage || !submitButton) return;

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Hide any previous messages
    successMessage.style.display = "none";
    errorMessage.style.display = "none";
    submitButton.disabled = true;
    submitButton.textContent = "Sending…";

    // Get form data
    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      subject: document.getElementById("subject").value,
      message: document.getElementById("message").value,
      website: document.getElementById("website").value,
      submissionId: crypto.randomUUID(),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`Contact API error: ${response.status}`);

      successMessage.style.display = "block";
      contactForm.reset();
    } catch (error) {
      errorMessage.style.display = "block";
      console.error("Contact form error:", error);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send Message";
    }
  });
});
