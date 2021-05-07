const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  //Buscar no array users se já existe um username cadastrado
  const user = users.find(user=> user.username===username);
  // se  user for falso retorna um status 400 com a mensagem de que o usuário não foi encntrado
  if(!user){
    return response.status(404).json({error:"User not found"})
  }

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  // Buscar no array users se já existe um username cadastrado
  //  usando o método some() que irá retornar um valor true ou false 
  const userExists = users.find(
    (user) => user.username===username 
  );
  // Se já existir um username cadastrado,
  //  o sistema retornara um erro 400 informando que o username já existe
  if(userExists){
    return response.status(400).json({error: "username already exists"});
  }
  
  const user = {
    id:uuidv4(),
    name,
    username,
    todos:[]
  }
  // Add um novo usuário
  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  // retorna os todos
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;

  // criação do objeto 
  const totoIncrement = {
    id:uuidv4(),
    title,
    done: false,
    deadline:new Date(deadline) ,
    created_at: new Date()
  }
  // Add um elemento no array
  user.todos.push(totoIncrement);

  return response.status(201).json(totoIncrement);


});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {title, deadline} = request.body;
  const {user} = request;
  // pega o id do todo buscando no array para ver se existe
  const todo = user.todos.find(todo => todo.id===id)
  // se todo for false ou seja se não retornar nada, exibir o error "tod not found"
  if(!todo){
    return response.status(404).json({error:"Todo not found"})
  }
  // recebe as atualizações
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;

  // se todo for false ou seja se não retornar nada, exibir o error "tod not found"
  const todo = user.todos.find(todo => todo.id===id)
  if(!todo){
    return response.status(404).json({error:"Todo not found"})
  }
  todo.done = true;
  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  // pega o id do todo e o index 
  const todoIndex = user.todos.findIndex(todo => todo.id===id)
  if(todoIndex===-1){
    return response.status(404).json({error:"Todo not found"})
  }
  user.todos.splice(todoIndex, 1);
  return response.status(204).json();

});

module.exports = app;