const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(express.json({ limit: '50mb' }));

app.use('/home', express.static(path.join(__dirname, 'public/home')));
app.use('/editor', express.static(path.join(__dirname, 'public/editor')));

app.get('/', (req, res) => res.redirect('/home/'));

app.get('/api/user', (req, res) => {
    res.json({ username: os.userInfo().username || 'NoNameUser' });
});

app.get('/api/git', (req, res) => {
    exec('git --version', (err) => {
        res.json({ installed: !err });
    });
});

app.get('/api/projects', (req, res) => {
    const projectsDir = path.join(os.homedir(), 'Desktop', 'Ligma', 'Projects');
    if (!fs.existsSync(projectsDir)) {
        return res.json([]);
    }
    const folders = fs.readdirSync(projectsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => {
            const configPath = path.join(projectsDir, dirent.name, 'project.ligma');
            let meta = { name: dirent.name, updatedAt: new Date() };
            if (fs.existsSync(configPath)) {
                try { meta = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (e) {}
            }
            return meta;
        });
    res.json(folders);
});

app.post('/api/project', (req, res) => {
    const { name, useGit, description } = req.body;
    const targetPath = path.join(os.homedir(), 'Desktop', 'Ligma', 'Projects', name);
    
    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
    }
    
    if (useGit) {
        exec('git init', { cwd: targetPath });
    }

    const projectData = {
        name,
        description: description || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        canvasData: null
    };

    fs.writeFileSync(path.join(targetPath, 'project.ligma'), JSON.stringify(projectData, null, 2));
    res.json({ success: true, path: targetPath, name });
});

app.get('/api/project/:name', (req, res) => {
    const projectPath = path.join(os.homedir(), 'Desktop', 'Ligma', 'Projects', req.params.name, 'project.ligma');
    if (!fs.existsSync(projectPath)) {
        return res.status(404).json({ error: 'Проект не найден' });
    }
    res.json(JSON.parse(fs.readFileSync(projectPath, 'utf8')));
});

app.post('/api/project/:name/save', (req, res) => {
    const projectPath = path.join(os.homedir(), 'Desktop', 'Ligma', 'Projects', req.params.name, 'project.ligma');
    if (!fs.existsSync(projectPath)) {
        return res.status(404).json({ error: 'Проект не найден' });
    }
    const currentData = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
    currentData.canvasData = req.body.canvasData;
    currentData.preview = req.body.preview;
    currentData.updatedAt = new Date();

    fs.writeFileSync(projectPath, JSON.stringify(currentData, null, 2));
    res.json({ success: true });
});

app.listen(3000, () => console.log('Ligma server running at http://localhost:3000/'));