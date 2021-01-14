const express = require('express');
const { uuid, isUuid } = require('uuidv4')
const app = express();
const PORT = 3333;

app.use(express.json())

const projects = [];

function logRequests(request, response, next) {
    const { method, url } = request;

    const logLabel = `[${method.toUpperCase()}] ${url}`

    console.time(logLabel);

    next() //Proximo middleware

    console.timeEnd(logLabel)
}

function validateProjectId(request, response, next){

    const { id } = request.params;

    if(!isUuid(id)) {
        return response.statu(400).json({error: 'Invalid project ID.'});
    }
}

app.use(logRequests);

app.get("/projects", (req, res) => {
    
    const { title } = req.query;
    const results = title
    ? projects.filter(project => project.title.includes(title))
    : projects;

    res.json(results)
})

app.post("/projects", (req, res) => {

    const { title, owner } = req.body;

    const project = { id: uuid(), title, owner}

    projects.push(project);

    return res.json(project);
    
})

app.put("/projects/:id", validateProjectId, (req, res) => {

    const { id } = req.params;
    const { title, owner } = req.body;

    const projectIndex = projects.findIndex(project => project.id == id);

    if(projectIndex < 0){
        return res.status(400).json({error: 'Project not found.'})
    }

    const project = {
        id,
        title,
        owner,
    }

    projects[projectIndex] = project;

    res.json(project)
})

app.delete("/projects/:id", validateProjectId, (req, res) => {

    const { id } = req.params
    const projectIndex = projects.findIndex(project => project.id == id);

    if(projectIndex < 0){
        return res.status(400).json({ error: 'Project not found.'})
    }

    projects.splice(projectIndex)

    res.status(204).send()
})

app.listen(PORT, () => {console.log(`Server running port ${PORT}...`)});