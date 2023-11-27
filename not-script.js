// $(document).ready(function() {
//     // Получаем элемент выбора файла
//     const fileInput = document.getElementById('sampleFile');
  
//     // Добавляем обработчик события change
//     fileInput.addEventListener('change', function() {
//       // Получаем выбранный файл
//       const selectedFile = fileInput.files[0];
      
//       // Проверяем, что файл был выбран
//       if (selectedFile) {
//         // Отображаем название файла в отдельном блоке
//         const fileNameBlock = document.getElementById('fileNameBlock');
//         fileNameBlock.innerHTML = selectedFile.name;
//         const markerColor = document.getElementsByClassName('name-f__marker')[0];
//         markerColor.style.backgroundColor = 'green';
//       } else {
//         // Если файл не был выбран, очищаем отображение названия файла
//         const fileNameBlock = document.getElementById('fileNameBlock');
//         fileNameBlock.innerHTML = "";
//       }
//     });
  
//     $('#uploadForm').on('submit', function(e) {
//       e.preventDefault(); // Предотвращаем обычную отправку формы
  
//       let formData = new FormData(this);
  
//       $.ajax({
//         url: '/upload',
//         type: 'POST',
//         data: formData,
//         success: function(data) {
//           // Обрабатываем успешную загрузку
//           $('#iframe__container').html(data); // Показываем iframe с загруженным файлом
//         },
//         cache: false,
//         contentType: false,
//         processData: false
//       });
//     });
//   });

document.addEventListener('DOMContentLoaded', function() {
  // Получаем элемент выбора файла
  const fileInput = document.getElementById('sampleFile');
  
  // Добавляем обработчик события change
  fileInput.addEventListener('change', function() {
    // Получаем выбранный файл
    const selectedFile = fileInput.files[0];
    
    // Проверяем, что файл был выбран
    if (selectedFile) {
      // Отображаем название файла в отдельном блоке
      const fileNameBlock = document.getElementById('fileNameBlock');
      fileNameBlock.textContent = selectedFile.name;
      const markerColor = document.getElementsByClassName('name-f__marker')[0];
      markerColor.style.backgroundColor = 'green';
    } else {
      // Если файл не был выбран, очищаем отображение названия файла
      const fileNameBlock = document.getElementById('fileNameBlock');
      fileNameBlock.textContent = "";
    }
  });
  
  document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Предотвращаем обычную отправку формы

    let formData = new FormData(this);

    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.text())
    .then(data => {
      // Обрабатываем успешную загрузку
      document.getElementById('iframe__container').innerHTML = data; // Показываем iframe с загруженным файлом
    })
    .catch(error => console.log(error));
  });
});

function saveChanges() {
    const iframeDocument = document.querySelector('iframe').contentDocument;
    const content = iframeDocument.documentElement.outerHTML;


    const fileName = 'имя_вашего_файла.html'; // Измените это на актуальное имя файла

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 60 * 1000); // Освободить память через минуту

    // Отправить данные на сервер для сохранения
    fetch('/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, fileName })
    })
        .then(response => response.text())
        .then(data => {
            alert(data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

