const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
// const fileUpload = require('express-fileupload');
const iconv = require('iconv-lite');
const fs = require("fs");
const cheerio = require('cheerio');
const mimeTypes = require('mime-types');
const multer = require('multer');
const bodyParser = require('body-parser');

// default options
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json({ limit: '50mb' }));
// app.use(fileUpload(
//     {
//         uriDecodeFileNames: false
//     }
// ));

app.use(bodyParser.text({ type: '/' }));

// Создаем хранилище multer для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Указываем папку, куда сохранять файлы
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Используем оригинальное имя файла
    },
  });

function fileFilter(req, file, cb) {
    const fileExtension = mimeTypes.extension(file.mimetype);
    if (fileExtension === 'html') {
        // Разрешаем загрузку только HTML файлов
        cb(null, true);
    } else {
        // Отклоняем загрузку файлов с другим расширением
        cb(new Error('Загружать можно только HTML файлы'));
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB
    }
});



app.get('/ping', function (req, res) {
    res.send('pong');
});

app.post('/upload', upload.single('sampleFile'), function (req, res) {
    if (!req.file) {
      return res.status(400).send('No file was uploaded.');
    }
  
    const sampleFile = req.file;
    const decodedFileName = iconv.decode(Buffer.from(sampleFile.originalname, 'binary'), 'utf-8');
    const uploadPath = __dirname + '/uploads/' + decodedFileName;
  
    fs.rename(sampleFile.path, uploadPath, function (err) {
      if (err) {
        return res.status(500).send(err);
      }
  
      // Читаем содержимое файла для редактирования
      fs.readFile(uploadPath, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          // Пропустить отправку файла, если чтение не удалось
          return res.status(500).send('Ошибка при чтении файла.');
        }
  
        // Создаем редактируемый HTML
        const $ = cheerio.load(data);
        $('body').attr('contenteditable', 'true');
  
        // Пишем обратно изменения в файл
        fs.writeFile(uploadPath, $.html(), 'utf8', (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при записи файла.');
          }
  
          // Отправляем HTML с редактируемым iframe
          res.send(`
            <iframe class="myIframe w-full h-full bg-white " src="/uploads/${encodeURIComponent(decodedFileName)}" frameborder="0"></iframe>
          `);
        });
      });
    });
  });

// app.post('/upload', upload.single('sampleFile'), function (req, res) {
//     if (!req.files || Object.keys(req.files).length === 0) {
//         return res.status(400).send('No files were uploaded.');
//     }

//     const sampleFile = req.files.sampleFile;
//     const decodedFileName = iconv.decode(Buffer.from(sampleFile.name, 'binary'), 'utf-8');
//     const uploadPath = __dirname + '/uploads/' + decodedFileName;

//     sampleFile.mv(uploadPath, function (err) {
//         if (err) {
//             return res.status(500).send(err);
//         }

//         // Читаем содержимое файла для редактирования
//         fs.readFile(uploadPath, 'utf8', (err, data) => {
//             if (err) {
//                 console.error(err);
//                 // Пропустить отправку файла, если чтение не удалось
//                 return res.status(500).send('Ошибка при чтении файла.');
//             }

//             // Создаем редактируемый HTML
//             const $ = cheerio.load(data);
//             $('body').attr('contenteditable', 'true');

//             // Пишем обратно изменения в файл
//             fs.writeFile(uploadPath, $.html(), 'utf8', (err) => {
//                 if (err) {
//                     console.error(err);
//                     return res.status(500).send('Ошибка при записи файла.');
//                 }

//                 // Отправляем HTML с редактируемым iframe
//                 res.send(`
//                         <iframe class="myIframe w-full h-full bg-white " src="/uploads/${encodeURIComponent(decodedFileName)}" frameborder="0"></iframe>
//                 `);
//             });
//         });
//     });
// });

app.post('/save', function (req, res) {
    const { content, fileName } = req.body;
    const editedFileName = 'edited_' + fileName; // добавляем префикс "edited_"
    const filePath = __dirname + '/uploads_edited/' + editedFileName; // сохраняем измененный файл с новым именем

    fs.writeFile(filePath, content, 'utf8', function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при сохранении файла.');
        }
    });
});


app.listen(port, function () {
    console.log('Express server listening on port ', port); // eslint-disable-line
});
