document.addEventListener('DOMContentLoaded', async () => {
    const greeting = document.getElementById('greeting');
    const libraryGrid = document.getElementById('libraryGrid');
    const recentList = document.getElementById('recentList');
    const modal = document.getElementById('modal');
    const gitStatus = document.getElementById('gitStatus');
    const newProjectBtn = document.getElementById('newProjectBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const createBtn = document.getElementById('createBtn');
    const useGit = document.getElementById('useGit');

    try {
        const res = await fetch('/api/user');
        const data = await res.json();
        greeting.textContent = `Привет, ${data.username}!`;
    } catch {
        greeting.textContent = 'Привет, NoNameUser!';
    }

    try {
        const res = await fetch('/api/git');
        const data = await res.json();
        if (data.installed) {
            gitStatus.textContent = 'доступен';
            gitStatus.style.color = '#4CAF50';
        } else {
            gitStatus.textContent = 'не установлен';
            gitStatus.style.color = '#F44336';
            useGit.disabled = true;
        }
    } catch {
        gitStatus.textContent = 'ошибка';
    }

    async function loadProjects() {
        try {
            const res = await fetch('/api/projects');
            const projects = await res.json();
            
            libraryGrid.innerHTML = '';
            recentList.innerHTML = '';

            if (projects.length === 0) {
                libraryGrid.innerHTML = '<p style="color:#666">Проектов пока нет. Создайте свой первый проект!</p>';
                return;
            }

            projects.forEach((proj, idx) => {
                if (idx < 3) {
                    const li = document.createElement('li');
                    li.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg> ${proj.name}`;
                    li.onclick = () => window.location.href = `/editor/?project=${encodeURIComponent(proj.name)}`;
                    recentList.appendChild(li);
                }

                const card = document.createElement('div');
                card.className = 'project-card fade-in-up';
                const previewStyle = proj.preview ? `background-image: url(${proj.preview})` : '';
                card.innerHTML = `
                    <div class="card-preview" style="${previewStyle}">
                        ${!proj.preview ? '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' : ''}
                    </div>
                    <div class="card-info">
                        <div class="card-title">${proj.name}</div>
                        <div class="card-date">${new Date(proj.updatedAt).toLocaleDateString()}</div>
                    </div>
                `;
                card.onclick = () => window.location.href = `/editor/?project=${encodeURIComponent(proj.name)}`;
                libraryGrid.appendChild(card);
            });
        } catch (e) {
            libraryGrid.innerHTML = '<p style="color:#F44336">Ошибка загрузки проектов</p>';
        }
    }

    loadProjects();

    newProjectBtn.onclick = () => modal.classList.remove('hidden');
    cancelBtn.onclick = () => modal.classList.add('hidden');

    createBtn.onclick = async () => {
        const nameInput = document.getElementById('projectName');
        const descInput = document.getElementById('projectDesc');
        const name = nameInput.value.trim();
        if (!name) return;

        document.getElementById('createBtnText').textContent = 'Создание...';
        document.getElementById('createSpinner').classList.remove('hidden');
        createBtn.disabled = true;

        const res = await fetch('/api/project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description: descInput.value, useGit: useGit.checked })
        });
        const data = await res.json();

        if (data.success) {
            window.location.href = `/editor/?project=${encodeURIComponent(name)}`;
        }
    };
});