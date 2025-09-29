const express = require('express')
const app = express()
app.set('view engine', 'ejs')

app.use(express.static('views'))

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', (req, res) => {
  res.render("home")
  console.log('the home page is loaded')
})

app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', function() {
  console.log("Server is running... YAYYYY!");
})