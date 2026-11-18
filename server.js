const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const PROJECTS_FILE = path.join(__dirname, 'data', 'projects.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const USERS = [
    { id: 1, login: 'admin', password: '123', name: 'Администратор' },
    { id: 2, login: 'arseniy', password: '123', name: 'Арсений' }
];

const getProjects = () => JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8') || '[]');
const saveProjects = (data) => fs.writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2), 'utf8');

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    const user = USERS.find(u => u.login === login && u.password === password);
    
    if (user) {
        res.json({ success: true, user: { id: user.id, name: user.name } });
    } else {
        res.status(401).json({ error: 'Неверный логин или пароль' });
    }
});

app.get('/api/projects', (req, res) => {
    res.json(getProjects());
});

app.get('/api/my-projects/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const projects = getProjects();
    const myProjects = projects.filter(p => p.userId === userId);
    res.json(myProjects);
});

app.post('/api/projects', (req, res) => {
    const { title, description, link, userId, authorName } = req.body;
    const projects = getProjects();

    const newProject = {
        id: Date.now(),
        userId: userId,
        authorName: authorName,
        title,
        description,
        link: link || '#'
    };

    projects.push(newProject);
    saveProjects(projects);
    res.status(201).json(newProject);
});

app.delete('/api/projects/:id', (req, res) => {
    const projectId = parseInt(req.params.id);
    const userId = parseInt(req.query.userId);

    let projects = getProjects();
    const project = projects.find(p => p.id === projectId);

    if (!project) return res.status(404).json({ error: 'Проект не найден' });
    

    if (project.userId !== userId) {
        return res.status(403).json({ error: 'Вы не можете удалить чужой проект' });
    }

    projects = projects.filter(p => p.id !== projectId);
    saveProjects(projects);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));