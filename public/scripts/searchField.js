const searchButton = document.getElementById('search-button');
const searchFieldControl = document.getElementById('search-field');

searchButton.addEventListener('click', () => {
    searchFieldControl.classList.toggle('d-none');
  });