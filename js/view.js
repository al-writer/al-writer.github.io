function getParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

const file = getParam('file');
const title = getParam('title');

document.getElementById('story-title').textContent = title || 'Без названия';
document.getElementById('page-title').textContent = title || 'Рассказ';

if (!file) {
  document.getElementById('content').textContent = 'Файл не указан';
} else {
  fetch(`stories/${file}`)
    .then(response => {
      if (!response.ok) throw new Error('Файл не найден');
      return response.text();
    })
    .then(md => {
      document.getElementById('content').innerHTML = marked.parse(md);
    })
    .catch(error => {
      document.getElementById('content').textContent = 'Ошибка загрузки рассказа.';
      console.error(error);
    });
}
