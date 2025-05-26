fetch('stories.json')
  .then(response => response.json())
  .then(data => {
    const list = document.getElementById('story-list');
    list.innerHTML = ''; // очищаем "Загрузка..."
    data.forEach(story => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `view.html?file=${encodeURIComponent(story.file)}&title=${encodeURIComponent(story.title)}`;
      a.textContent = story.title;
      li.appendChild(a);
      list.appendChild(li);
    });
  })
  .catch(error => {
    document.getElementById('story-list').innerHTML = 'Ошибка загрузки списка.';
    console.error(error);
  });
