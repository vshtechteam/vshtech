const form = document.getElementById("signing-form");
const statusBox = document.getElementById("status");
const passwordInput = document.getElementById("p12-pass");
const toggleButton = document.querySelector(".toggle-pass");
const ipaSourceRadios = document.querySelectorAll('input[name="ipa-source"]');
const ipaUploadBlock = document.getElementById("ipa-upload-block");
const ipaFileInput = document.getElementById("ipa-file");
const ipaPanelInfo = document.getElementById("ipa-panel-info");
const panelDownloadLink = document.getElementById("panel-download");
const installAction = document.getElementById("install-action");
const installButton = document.getElementById("install-button");
const installNote = document.getElementById("install-note");
let uploadInstallUrl;

toggleButton.addEventListener("click", () => {
  const visible = passwordInput.type === "text";
  passwordInput.type = visible ? "password" : "text";
  toggleButton.dataset.visible = (!visible).toString();
});

ipaSourceRadios.forEach((radio) => {
  radio.addEventListener("change", handleIpaSourceChange);
});

function handleIpaSourceChange() {
  const selected = document.querySelector('input[name="ipa-source"]:checked').value;
  if (selected === "upload") {
    ipaUploadBlock.hidden = false;
    ipaFileInput.required = true;
    ipaPanelInfo.hidden = true;
  } else {
    ipaUploadBlock.hidden = true;
    ipaFileInput.required = false;
    ipaPanelInfo.hidden = false;
  }
  resetInstallAction();
}

handleIpaSourceChange();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const p12File = document.getElementById("p12-file").files[0];
  const mobileFile = document.getElementById("mobileprovision-file").files[0];
  const ipaSource = document.querySelector('input[name="ipa-source"]:checked').value;
  const ipaFile = ipaSource === "upload" ? ipaFileInput.files[0] : null;
  const password = passwordInput.value.trim();

  if (!p12File || !mobileFile || !password) {
    showStatus("Vui lòng hoàn thành đủ các bước.", "error");
    return;
  }

  if (ipaSource === "upload" && !ipaFile) {
    showStatus("Chọn tệp IPA cần ký.", "error");
    return;
  }

  const ipaName = ipaSource === "upload" ? ipaFile.name : "paneliosv1.ipa";
  showStatus(`Đã sẵn sàng ký ứng dụng "${ipaName}" với chứng chỉ ${p12File.name}.`);

  if (ipaSource === "panel") {
    configurePanelInstall();
  } else if (ipaFile) {
    configureUploadInstall(ipaFile);
  }
});

function showStatus(message, state = "success") {
  statusBox.textContent = message;
  statusBox.dataset.state = state;
}

function configurePanelInstall() {
  if (!panelDownloadLink) return;
  installButton.disabled = false;
  installButton.textContent = "Install PANEL IOS V1";
  installButton.onclick = () => panelDownloadLink.click();
  installNote.textContent =
    "Thiết bị iOS sẽ cài đặt trực tiếp từ nguồn PANEL IOS V1 sau khi xác nhận.";
  installAction.hidden = false;
}

function configureUploadInstall(file) {
  if (uploadInstallUrl) {
    URL.revokeObjectURL(uploadInstallUrl);
  }
  uploadInstallUrl = URL.createObjectURL(file);
  installButton.disabled = false;
  installButton.textContent = "Install IPA đã tải lên";
  installButton.onclick = () => {
    window.location.href = uploadInstallUrl;
  };
  installNote.textContent =
    "Cài đặt trực tiếp tệp IPA vừa ký. Hãy mở trang này trên Safari của thiết bị iOS để bắt đầu.";
  installAction.hidden = false;
}

function resetInstallAction() {
  if (uploadInstallUrl) {
    URL.revokeObjectURL(uploadInstallUrl);
    uploadInstallUrl = null;
  }
  installAction.hidden = true;
  installButton.onclick = null;
}
