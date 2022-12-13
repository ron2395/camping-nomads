const mailChangeControl = document.getElementById('mail-change-handler');
const mailChangeButton = document.getElementById('mail-change-button');

mailChangeButton.addEventListener('click', () => {
    mailChangeControl.classList.toggle('d-none');
  });