import { useState, useEffect } from 'react'
import personsService from './services/persons'
import './style.css'


const Notification = ({message, type}) => {
	if (message === null) {
		return null;
	}
	else if (type === "error" ){
		return (
			<div className="error">
				{message}
			</div>
		)
	} else if (type === "added" ){
		return (
			<div className="added">
				{message}
			</div>
		)
	} else if (type === "deleted" ){
		return (
			<div className="deleted">
				{message}
			</div>
		)
	} else if (type === "updated" ){
		console.log("toimii")
		return (
			<div className="updated">
				{message}
			</div>
		)
	}

}
const Filter = ({value, onChange}) => {
	return <div> filter: <input value={value} onChange={onChange}/> </div>
}
const PersonForm = ({addEntry, newName,handleNameChange,newNumber,handleNumberChange}) => {
	return (
		<form onSubmit={addEntry}>
      <div> name: <input value={newName} onChange={handleNameChange}/> </div>
      <div> number: <input value={newNumber} onChange={handleNumberChange}/> </div>
      <div> <button type="submit">add</button> </div>
    </form>
	)
}
const Persons = ({persons, handleDelete}) => {
		return persons.map((person) => 
			<div key={person.name}>
			<p> {person.name} : {person.number} <button onClick={() => handleDelete(person.id)}>delete</button> </p>
			</div>
		)

}
const App = () => {
	//Lomakkeen kenttien kontrollointiin
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
	//Haku kenttä
  const [search, setSearch] = useState('')
  const [persons, setPersons] = useState([])
	const [notificationMessage, setNotificationMessage] = useState('')
	const [notificationType, setNotificationType] = useState('')

	useEffect(() => {
		personsService
			.getAll()
			.then(initialPersons => {
				setPersons(initialPersons)
			})
	}, [])

	const handleDelete = id => {
		const deletedPerson = persons.find(p => p.id === id).name
		if(window.confirm(`Do you want to delete ${deletedPerson}`)){
			personsService
				.remove(id)
				.then(result => {
					const newPersons = persons.filter(p => p.id !== id)
					console.log("New persons")
					console.log(newPersons)
					setPersons(newPersons)	
					console.log(result)

					setNotificationMessage(`${deletedPerson} deleted from phonebook`)
					setNotificationType("deleted")
					setTimeout(() => {
						setNotificationMessage(null)
						setNotificationType(null)
					}, 5000)
				})
		}
	}

	const addEntry = (event) => {
		event.preventDefault()
		const person = {name: newName, number: newNumber}

		const check = persons.find(p => p.name === newName)
		if (check === undefined) {
			personsService
				.create(person)
				.then(returnedPerson => {
					setNotificationType("added")
					setNotificationMessage(`${person.name} added to phonebook`)

					setPersons(persons.concat(returnedPerson))
					setNewName("")
					setNewNumber("")

					setTimeout(() => {
						setNotificationMessage(null)
						setNotificationType(null)
					}, 5000)
				})
		} 
		else if (window.confirm(`${person.name} already exists. Do you want to replace the number?`)){
			const updatedPerson = {...check, number: newNumber}
			console.log(updatedPerson)
			personsService
				.update(check.id, updatedPerson)
				.then(returnedPerson => {
					setNotificationType("updated")
					setNotificationMessage(`${person.name}s number updated`)
					setPersons(persons.map(person => person.id !== check.id ? person : returnedPerson))
					setNewName("")
					setNewNumber("")

					setTimeout(() => {
						setNotificationMessage(null)
						setNotificationType(null)
					}, 5000)
				}).catch(error => {
					console.log('fail',error)

					setNotificationType("error")
					setNotificationMessage(`Information of ${person.name} has already been removed from server`)

					setTimeout(() => {
						setNotificationMessage(null)
						setNotificationType(null)
					}, 5000)

				})
		}
	}

	const personsToShow = persons.filter(person => 
		person.name.toLowerCase().includes(search.toLowerCase()))

	//Input eventhandlers 
	const handleNameChange = (event) => { setNewName(event.target.value) }
	const handleNumberChange = (event) => { setNewNumber(event.target.value) }
	const handleSearch = (event) => { setSearch(event.target.value) }

  return (
    <div>
      <h2>Phonebook</h2>
			<Notification message={notificationMessage} type={notificationType} />
			<Filter value={search} onChange={handleSearch}/>
			<h2>Add a new </h2>
				<PersonForm 
					addEntry={addEntry} 
					handleNameChange={handleNameChange} 
					handleNumberChange={handleNumberChange}
					newName={newName}
					newNumber={newNumber}
				/>
      <h2>Numbers</h2>
				<Persons persons={personsToShow} handleDelete={handleDelete}/>	
    </div>
  )

}

export default App
