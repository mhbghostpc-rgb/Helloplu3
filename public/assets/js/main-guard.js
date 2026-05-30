window.addEventListener("load", () => {
  const accessDenied = document.getElementById("access-denied");
  const root = document.getElementById("root");

  if (!window.Auth) {
    accessDenied.style.display = "block";
    return;
  }

  window.Auth.checkAccess({ requireAdmin: false }).then((result) => {
    if (!result.allowed) {
      accessDenied.style.display = "block";
      return;
    }

    root.style.display = "block";
  });
});
