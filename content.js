(() => {
  if (globalThis.__autofillGuardLoaded) return;
  globalThis.__autofillGuardLoaded = true;

  const fieldSelector = "input:not([type=hidden]), textarea, select";

  function protectField(field) {
    if (!(field instanceof HTMLElement)) return;

    if (field.getAttribute("autocomplete") !== "off") {
      field.setAttribute("autocomplete", "off");
    }
  }

  function protectTree(root) {
    if (!(root instanceof Element || root instanceof Document)) return;
    if (root instanceof HTMLFormElement) root.setAttribute("autocomplete", "off");
    if (root.matches?.(fieldSelector)) protectField(root);
    root.querySelectorAll?.("form").forEach((form) => form.setAttribute("autocomplete", "off"));
    root.querySelectorAll?.(fieldSelector).forEach(protectField);
  }

  function clearAutofilledField(event) {
    if (event.animationName !== "autofill-guard-detected") return;
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;

    field.value = "";
    field.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward" }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  }

  document.addEventListener("animationstart", clearAutofilledField, true);
  protectTree(document);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        protectTree(node);
      }
    }
  });
  observer.observe(document, { childList: true, subtree: true });
})();

