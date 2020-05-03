// клиент:
import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.esm.browser.js'

Vue.component('loader', {
  template: `
    <div style="display: flex;justify-content: center;align-items: center;">
    <div class="spinner-border text-danger" role="status">
    <span class="sr-only">Loading...</span>
    </div>
    </div>
    `,
})
new Vue({
  el: '#app',
  data() {
    return {
      loading: false,
      message: '',
      text: '',
      form: {
        name: '',
        value: '',
      },
      contacts: [],
      filter: 'all',
    }
  },

  filters: {
    uppercase(value) {
      return value.toUpperCase()
    },
  },
  computed: {
    //валидация формы на клиенте (блокир. кнопку "создать" если не:)
    canCreate() {
      return (
        this.form.value.trim() &&
        this.form.name.trim() &&
        this.form.value.length < 100 &&
        this.form.name.length < 40
      )
    },
    //фильтрация списка данных (отмеченные/не отмеченные/все)
    filterData() {
      if (this.filter === 'all') {
        return this.contacts
      }
      if (this.filter === 'marked') {
        return this.contacts.filter((t) => t.marked)
      }
      if (this.filter === 'not marked') {
        return this.contacts.filter((t) => !t.marked)
      }
    },
  },
  methods: {
    //создаем контакт на клиенте
    async createContact() {
      const { ...contact } = this.form

      //получаем newContact с сервера
      const newContact = await request('/api/contacts', 'POST', contact)

      //кладем ее в массив контактов
      this.contacts.push(newContact)

      //очищаем форму
      this.form.name = this.form.value = ''
    },
    //меняем контакт на клиенте
    async markContact(id) {
      //находим текущий контакт
      const contact = this.contacts.find((c) => c.id === id)

      //получаем объект updated после ожидания, пока выполнится реквест, методом PUT, а в данных:
      const updated = await request(`/api/contacts/${id}`, 'PUT', {
        //разворачиваем текущий контакт и перетираем его поле "marked" на "true", добав. новый текст и отпр. на клиент
        ...contact,
        marked: true,
        text:
          'You have successfully marked this data on server with using HTTP method PUT. You can verify it by reloading this page. Now you can delete it from server (with using HTTP method DELETE).',
      })
      //синхронизируем флаг marked и текст на фронте и бэке
      contact.marked = updated.marked
      contact.text = updated.text
    },
    async removeContact(id) {
      //удаляем данные после получения подтверждения на запрос от сервера
      const message = await request(`/api/contacts/${id}`, 'DELETE')

      //выводим на 2 сек.
      this.message = message
      setTimeout(() => {
        this.message = ''
      }, 2000)

      //возвращаем массив без id введенного из формы элемента (с)
      this.contacts = this.contacts.filter((c) => c.id !== id)
    },
  },
  //асинх. метод, вызывается после окончания загрузки страницы (лоадер/вывод запроса)
  async mounted() {
    this.loading = true
    //т.к. клиент и сервер - на одном порту, "http://localhost:3000/" писать не надо, просто: /api/contacts -
    // тот же адрес, что указан в серверном методе "app.get" в стр.24
    this.contacts = await request('/api/contacts')
    this.loading = false
  },
})

// асинхронный метод request для запросов клиента на сервер
async function request(url, method = 'GET', data = null) {
  try {
    const headers = {}
    let body

    //если data не пуста
    if (data) {
      // определяем тип контента в хедере как json
      headers['Content-Type'] = 'application/json'

      //функция JSON.stringify() сериализует объект data в формат JSON (в строку),
      //  т.к. обычные объекты JS невозможно передавать по сети
      body = JSON.stringify(data)
    }

    //ответ сервера (ожидаем окончания метода fetch с параметрами)
    const response = await fetch(url, {
      method,
      headers,
      body,
    })

    //распарсиваем и возвращаем response
    return await response.json()
  } catch (e) {
    //вывод в случае ошибки в консоль
    console.warn('Error: ', e.message)
  }
}
