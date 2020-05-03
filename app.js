//сервер:
const express = require('express') //подкл. фреймворк express
const path = require('path') //подкл. встроенныый в NODE.JS модуль path для работы с путями
const { v4 } = require('uuid') //библиотека для генерации разных id (через функцию "v4")
const app = express() //создаем объект приложения

//наша "БД", где храним данные с клиента
let CONTACTS = [
  {
    id: v4(),
    name: 'Default name',
    value: 'Default data',
    marked: false,
    text:
      'This default data has been received from server by HTTP method GET (you can see it in DevTools). Now you can mark it on server (with using HTTP method PUT), delete it from server (with using HTTP method DELETE) or send to server some new data (with using HTTP method POST).',
  },
]

//учим объект POST-запроса request работать с реквестами (.json)
app.use(express.json())

//метод GET- получение с сервера (через таймаут - чтобы видеть лоадер)
//создаем endpoint - URL, по кот. будем получать данные на клиенте: /api/contacts
app.get('/api/contacts', (req, res) => {
  setTimeout(() => {
    res.status(200).json(CONTACTS)
  }, 1500)
})

//метод POST - отправка на сервер
app.post('/api/contacts', (req, res) => {
  //создаем переменную contact- данные с клиента (из формы)
  const contact = {
    ...req.body,
    id: v4(),
    marked: false,
    text:
      'You have successfully created this data on server with using HTTP method POST. You can verify it by reloading this page. Now you can mark it on server (with using HTTP method PUT) or delete it from server (with using HTTP method DELETE).',
  } //здесь должна быть еще и серверная валидация
  //добавляем в CONTACTS (в "б.д.") наш контакт
  CONTACTS.push(contact)
  //возвращаем контакт в качестве json-а (201-статус ответа - "создано")
  res.status(201).json(contact)
})

//метод DELETE (определяем :id удаляемого эл-та)
app.delete('/api/contacts/:id', (req, res) => {
  //возвращаем массив без id введенного из формы элемента (с)
  CONTACTS = CONTACTS.filter((c) => c.id !== req.params.id)

  //ответ сервера (статус 200, формат json ...)
  res.status(200).json('Data has been deleted from server.')
})

//метод PUT (определяем :id изменяемого эл-та)
app.put('/api/contacts/:id', (req, res) => {
  //находим его индекс (=idx)
  const idx = CONTACTS.findIndex((c) => c.id === req.params.id)

  //меняем этот контакт в б.д. на тело запроса
  CONTACTS[idx] = req.body

  //возвращаем измененный контакт (статус 200 здесь уже есть по-умолчанию)
  res.json(CONTACTS[idx])
})

//делаем папку "client" статической, чтобы отдавать статич. файлы из клиента
app.use(express.static(path.resolve(__dirname, 'client')))

//express будет смотреть за любыми  гет-запросами
app.get('*', (req, res) => {
  //отправляем запрос на сервер и получаем в ответ наш файл "индекс", он подтягивает остальные файлы
  res.sendFile(path.resolve(__dirname, 'client', 'index.html'))
})

app.listen(3000, () => console.log('server started on port 3000...'))
