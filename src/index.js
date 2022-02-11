const express = require('express');
const {
	v4: uuidv4
} = require('uuid');

const app = express();

app.use(express.json());


const users = [];

function checksExistsUserAccount(req, res, next) {
	const { username } = req.headers;
	const user = users.find((users) => users.username === username);

	if (!user) {
		return res.status(400).json({
			error: 'user not found'
		})
	}

	req.user = user;

	return next();
}

function checksCreateTodosUserAvailability(req, res, next) {
	const { username } = req.headers;

	const user = users.find((users) => users.username === username);
	if ((!user.hasProPlan && user.todos.length < 10) || (user.hasProPlan)) {
		return next();
	} else {
		return res.json({
			message: "O usuário não pode mais criar tarefas."
		})
	}
}

function checksTodoExists (req, res, next) {
	const { username } = req.headers;
	const { id } = req.params;

	const user = users.find((users) => users.username === username);
	if (!user) {
		return res.status(400).json({
			error: 'user not found'
		})
	} //validando usuário
	const todo = user.todos.find((todo) => todo.id === id);

	req.user = user;
	req.todo = todo;

	return next();

}

app.post('/users', (req, res) => {
	const { name, username } = req.body;

	const userAlreadyExist = users.find((users) =>
		users.username === username);

	if (userAlreadyExist) {
		return res.status(400).json({
			error: "Usuário já existe!"
		})
	}
	const user = {
		name,
		username,
		hasProPlan: false,
		id: uuidv4(),
		todos: []
	};

	users.push(user);

	return res.status(201).send();

});

app.get('/user', checksExistsUserAccount, (req, res) => {
	const {
		user
	} = req;
	return res.json(user);
});


app.post('/todos', checksExistsUserAccount, checksCreateTodosUserAvailability, (req, res) => {
	const { user } = req;
	const {
		title,
		deadline
	} = req.body;

	const todo = {
		id: uuidv4(),
		title,
		done: false,
		deadline: new Date(deadline),
		created_at: new Date()
	};

	user.todos.push(todo)

	return res.status(201).send(todo);
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
	const {
		user
	} = req;

	return res.json(user.todos);
});
app.put('/todos/:id', checksTodoExists, (req, res) => {
	const { user, todo} = req;
	const { title, deadline } = req.body;
	// const { id } = req.params;
	// const todo = user.todos.find((todo) => todo.id === id);
	todo.title = title;
	todo.deadline = new Date(deadline);

	return res.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
	const {
		user
	} = req;
	const {
		done
	} = req.body;
	const {
		id
	} = req.params;

	const todo = user.todos.find((todo) => todo.id === id);
	console.log(user)
	console.log(todo)
	todo.done = done

	return res.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
	const {
		user
	} = req;
	const {
		id
	} = req.params;

	const todo = user.todos.find((todo) => todo.id === id);
	try {
		todo.delete()
		return res.status(200).send({
			message: "Excluído com sucesso"
		})
	} catch {
		return res.status(400).send({
			error: "Falha ao excluir"
		})
	}
});


app.listen(3030);