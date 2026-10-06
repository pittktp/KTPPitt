// Initialize EmailJS with your public key
emailjs.init("CNHh5KZ4bbNil_Ano");

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contact-form");
  const successMessage = document.getElementById("success-message");
  const errorMessage = document.getElementById("error-message");

  if (!contactForm || !successMessage || !errorMessage) return;

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Hide any previous messages
    successMessage.style.display = "none";
    errorMessage.style.display = "none";

    // Get form data
    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      subject: document.getElementById("subject").value,
      message: document.getElementById("message").value,
    };

    // Send email using EmailJS
    // Send email using your EmailJS service and template
    try {
      await emailjs.send("service_2plmwok", "template_ndc7jbq", {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      successMessage.style.display = "block";
      contactForm.reset();
    } catch (error) {
      errorMessage.style.display = "block";
      console.error("EmailJS error:", error);
    }
  });
});
