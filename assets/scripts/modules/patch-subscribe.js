document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("patch-subscribe-btn");
  const form = document.getElementById("patch-subscribe-form");
  const email = document.getElementById("patch-email");
  const submit = document.getElementById("patch-subscribe-submit");
  const success = document.getElementById("patch-subscribe-success");

  if (btn && form) {
    btn.addEventListener("click", () => {
      btn.style.display = "none";
      form.style.display = "flex";
      email.focus();
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submit.disabled = true;
      success.style.display = "inline";
      setTimeout(() => {
        success.style.display = "none";
        submit.disabled = false;
        email.value = "";
      }, 2500);
    });
  }
});
