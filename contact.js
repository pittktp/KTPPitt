// Initialize EmailJS with your public key
emailjs.init("CNHh5KZ4bbNil_Ano"); // Public key provided by user

document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contact-form");
  const successMessage = document.getElementById("success-message");
  const errorMessage = document.getElementById("error-message");

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

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
    emailjs
      .send("service_2plmwok", "template_ndc7jbq", {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
      })
      .then(function (response) {
        // Show success message
        successMessage.style.display = "block";
        contactForm.reset();
      })
      .catch(function (error) {
        // Show error message
        errorMessage.style.display = "block";
        console.error("EmailJS error:", error);
      });
  });
});
