const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())

//app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
morgan.token('body', req => {
	return JSON.stringify(req.body)
})
app.use(morgan(function (tokens, req, res) {
	//console.log(req.body)
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
		tokens.body(req)
  ].join(' ')
}))
let persons = 
	[
    {
      name: "Arto Hellas",
      number: "42342525234",
      id: 1
    },
    {
      name: "Matti Nykänen",
      number: "43214523245",
      id: 2
    },
    {
      name: "Dan Abramov",
      number: "12-43-234345",
      id: 3
    }
  ]



app.get('/', (req,res) => {
	res.send('<h1>Hello World!</h1>')
})
app.get('/info', (req,res) => {

	let reply = `<p>Phonebook has info for ${persons.length} people</p>`
	reply += `<p>${Date(Date.now).toString()} </p>`
	//console.log(req)
	res.send(reply)
	//res.send('<p></p>')
})
app.get('/api/persons', (req,res) => {
	//console.log(persons)
	res.json(persons)
})

app.delete('/api/persons/:id', (req,res) => {
	const id = Number(req.params.id)
	persons = persons.filter(p => p.id !== id)
	res.status(204).end()
})

app.post('/api/persons', (req,res) => {
	const body = req.body;

	if (!body.name) {
		return res.status(400).json({
			error: 'Name needed'
		})
	} else if (!body.number) {
		return res.status(400).json({
			error: 'Number needed'
		})
	} 
	else if (persons.find(p => p.name === body.name)) {
		return res.status(400).json({
			error: 'Name must be unique'
		})
	}
	let person = {
		name: body.name,
		number: body.number,
		id: Math.floor(Math.random()*10000)
	}
	persons = persons.concat(person)
	//console.log(person)
	res.send(persons)
})

app.get('/api/persons/:id', (req,res) => {
	let id = Number(req.params.id)

	const person = persons.find(p => {
		return p.id === id
	})
	if (person) {
		res.json(person)
	} else {
		res.status(404).end()
	}
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
