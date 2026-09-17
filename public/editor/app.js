document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectName = urlParams.get('project');

    if (!projectName) {
        window.location.href = '/home/';
        return;
    }

    document.getElementById('projectTitle').textContent = projectName;

    const googleFonts = [
        'Inter', 'Roboto', 'Montserrat', 'Open Sans', 'Playfair Display',
        'Oswald', 'JetBrains Mono', 'Fira Code', 'Pacifico', 'Lobster'
    ];

    function loadGoogleFont(fontName) {
        if (!fontName) return;
        const fontId = `gfont-${fontName.replace(/\s+/g, '-')}`;
        if (!document.getElementById(fontId)) {
            const link = document.createElement('link');
            link.id = fontId;
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;700&display=swap`;
            document.head.appendChild(link);
        }
    }

    const wrapper = document.getElementById('canvasWrapper');
    const canvas = new fabric.Canvas('ligmaCanvas', {
        width: wrapper.clientWidth,
        height: wrapper.clientHeight,
        backgroundColor: '#141414',
        selection: true,
        stopContextMenu: true
    });

    window.addEventListener('resize', () => {
        canvas.setWidth(wrapper.clientWidth);
        canvas.setHeight(wrapper.clientHeight);
    });

    const toast = document.getElementById('toast');
    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2500);
    }

    const saveStatus = document.getElementById('saveStatus');
    let saveTimeout = null;

    function triggerAutoSave() {
        saveStatus.textContent = 'Сохранение...';
        saveStatus.classList.add('saving');
        clearTimeout(saveTimeout);
        
        saveTimeout = setTimeout(async () => {
            const canvasData = canvas.toJSON(['id', 'locked']);
            const preview = canvas.toDataURL({ format: 'png', quality: 0.3 });

            await fetch(`/api/project/${encodeURIComponent(projectName)}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ canvasData, preview })
            });

            saveStatus.textContent = 'Сохранено';
            saveStatus.classList.remove('saving');
        }, 800);
    }

    async function loadProjectData() {
        try {
            const res = await fetch(`/api/project/${encodeURIComponent(projectName)}`);
            const data = await res.json();
            if (data.canvasData) {
                canvas.loadFromJSON(data.canvasData, () => {
                    canvas.getObjects().forEach(o => {
                        if (o.fontFamily) loadGoogleFont(o.fontFamily);
                    });
                    canvas.renderAll();
                    updateLayersList();
                });
            }
        } catch (e) {
            showToast('Ошибка загрузки данных');
        }
    }
    loadProjectData();

    // Загрузка и вставка картинок
    const imageInput = document.getElementById('imageInput');
    
    function addImageToCanvas(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            fabric.Image.fromURL(e.target.result, (img) => {
                if (img.width > 400) {
                    img.scaleToWidth(400);
                }
                img.set({
                    left: (canvas.width / 2) - ((img.width * img.scaleX) / 2),
                    top: (canvas.height / 2) - ((img.height * img.scaleY) / 2)
                });
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
                updateLayersList();
                triggerAutoSave();
                showToast('Изображение добавлено');
            });
        };
        reader.readAsDataURL(file);
    }

    document.getElementById('tool-image').onclick = () => imageInput.click();
    document.getElementById('ctxUploadImg').onclick = () => imageInput.click();
    imageInput.onchange = (e) => {
        if (e.target.files.length > 0) addImageToCanvas(e.target.files[0]);
    };

    // Drag and Drop картинок прямо на Canvas
    const dropOverlay = document.getElementById('dropOverlay');

    wrapper.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropOverlay.classList.remove('hidden');
    });

    wrapper.addEventListener('dragleave', (e) => {
        if (e.relatedTarget === null || !wrapper.contains(e.relatedTarget)) {
            dropOverlay.classList.add('hidden');
        }
    });

    wrapper.addEventListener('drop', (e) => {
        e.preventDefault();
        dropOverlay.classList.add('hidden');
        if (e.dataTransfer.files.length > 0) {
            addImageToCanvas(e.dataTransfer.files[0]);
        }
    });

    // Вставка из буфера обмена (Ctrl+V)
    window.addEventListener('paste', (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                addImageToCanvas(file);
                break;
            }
        }
    });

    // Инструменты рисования
    let activeTool = 'select';
    const toolBtns = {
        select: document.getElementById('tool-select'),
        rect: document.getElementById('tool-rect'),
        circle: document.getElementById('tool-circle'),
        line: document.getElementById('tool-line'),
        pencil: document.getElementById('tool-pencil'),
        text: document.getElementById('tool-text')
    };

    function setTool(tool) {
        activeTool = tool;
        Object.keys(toolBtns).forEach(k => toolBtns[k].classList.remove('active'));
        if (toolBtns[tool]) toolBtns[tool].classList.add('active');
        
        canvas.isDrawingMode = (tool === 'pencil');
        if (canvas.isDrawingMode) {
            canvas.freeDrawingBrush.color = '#0D99FF';
            canvas.freeDrawingBrush.width = 3;
        }
        canvas.selection = (tool === 'select');
    }

    Object.keys(toolBtns).forEach(k => {
        toolBtns[k].onclick = () => setTool(k);
    });

    let isDrawingLine = false;
    let currentLine = null;

    canvas.on('mouse:down', (opt) => {
        if (activeTool === 'select' || activeTool === 'pencil') return;

        const pointer = canvas.getPointer(opt.e);

        if (activeTool === 'rect') {
            const shape = new fabric.Rect({
                left: pointer.x, top: pointer.y,
                width: 120, height: 80,
                fill: '#0D99FF', rx: 6, ry: 6
            });
            canvas.add(shape);
            canvas.setActiveObject(shape);
            setTool('select');
        } else if (activeTool === 'circle') {
            const shape = new fabric.Circle({
                left: pointer.x, top: pointer.y,
                radius: 50, fill: '#2ECC71'
            });
            canvas.add(shape);
            canvas.setActiveObject(shape);
            setTool('select');
        } else if (activeTool === 'text') {
            loadGoogleFont('Inter');
            const shape = new fabric.IText('Новый текст', {
                left: pointer.x, top: pointer.y,
                fill: '#ffffff', fontSize: 28,
                fontFamily: 'Inter'
            });
            canvas.add(shape);
            canvas.setActiveObject(shape);
            setTool('select');
        } else if (activeTool === 'line') {
            isDrawingLine = true;
            currentLine = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                stroke: '#0D99FF', strokeWidth: 3
            });
            canvas.add(currentLine);
        }

        updateLayersList();
        triggerAutoSave();
    });

    canvas.on('mouse:move', (opt) => {
        if (!isDrawingLine || !currentLine) return;
        const pointer = canvas.getPointer(opt.e);
        currentLine.set({ x2: pointer.x, y2: pointer.y });
        canvas.renderAll();
    });

    canvas.on('mouse:up', () => {
        if (isDrawingLine) {
            isDrawingLine = false;
            currentLine = null;
            setTool('select');
            updateLayersList();
            triggerAutoSave();
        }
    });

    // Масштабирование
    let currentZoom = 1;
    function setZoom(zoom) {
        currentZoom = Math.min(Math.max(0.2, zoom), 3);
        canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, currentZoom);
        document.getElementById('zoomLevel').textContent = `${Math.round(currentZoom * 100)}%`;
    }

    document.getElementById('zoomInBtn').onclick = () => setZoom(currentZoom + 0.15);
    document.getElementById('zoomOutBtn').onclick = () => setZoom(currentZoom - 0.15);
    document.getElementById('zoomResetBtn').onclick = () => setZoom(1);

    canvas.on('mouse:wheel', (opt) => {
        if (opt.e.ctrlKey || opt.e.altKey) {
            const delta = opt.e.deltaY;
            let zoom = canvas.getZoom();
            zoom *= 0.999 ** delta;
            setZoom(zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        }
    });

    // Управление Слоями с Drag-and-Drop перетаскиванием и кнопками перемещения
    const layersList = document.getElementById('layersList');
    let draggedLayerIdx = null;

    function updateLayersList() {
        layersList.innerHTML = '';
        const objects = canvas.getObjects();

        // Отображаем верхний слой первым (реверс)
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            const realIndex = i;

            const li = document.createElement('li');
            li.draggable = true;
            li.dataset.index = realIndex;

            let iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
            let name = 'Элемент';
            if (obj.type === 'rect') name = 'Прямоугольник';
            else if (obj.type === 'circle') { name = 'Окружность'; iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>'; }
            else if (obj.type === 'i-text') { name = `Текст: "${obj.text.substring(0, 10)}"`; iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'; }
            else if (obj.type === 'line') { name = 'Линия'; iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="19" x2="19" y2="5"/></svg>'; }
            else if (obj.type === 'image') { name = 'Изображение'; iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>'; }
            else if (obj.type === 'path') { name = 'Кисть'; }

            li.innerHTML = `
                ${iconSvg}
                <span class="layer-title">${name}</span>
                <div class="layer-actions">
                    <button class="layer-btn btn-up" title="Переместить выше">▲</button>
                    <button class="layer-btn btn-down" title="Переместить ниже">▼</button>
                </div>
            `;

            if (canvas.getActiveObject() === obj) li.classList.add('selected');

            // Выбор слоя
            li.onclick = (e) => {
                if (e.target.classList.contains('layer-btn')) return;
                canvas.setActiveObject(obj);
                canvas.renderAll();
                updateLayersList();
                updateInspector();
            };

            // Кнопки перемещения слоев
            li.querySelector('.btn-up').onclick = (e) => {
                e.stopPropagation();
                canvas.bringForward(obj);
                canvas.renderAll();
                updateLayersList();
                triggerAutoSave();
            };

            li.querySelector('.btn-down').onclick = (e) => {
                e.stopPropagation();
                canvas.sendBackwards(obj);
                canvas.renderAll();
                updateLayersList();
                triggerAutoSave();
            };

            // HTML5 Drag-and-Drop перетаскивание слоев
            li.ondragstart = () => { draggedLayerIdx = realIndex; };
            li.ondragover = (e) => { e.preventDefault(); li.classList.add('drag-over'); };
            li.ondragleave = () => { li.classList.remove('drag-over'); };
            li.ondrop = (e) => {
                e.preventDefault();
                li.classList.remove('drag-over');
                if (draggedLayerIdx !== null && draggedLayerIdx !== realIndex) {
                    canvas.moveTo(objects[draggedLayerIdx], realIndex);
                    canvas.renderAll();
                    updateLayersList();
                    triggerAutoSave();
                }
            };

            layersList.appendChild(li);
        }
    }

    // Инспектор свойств
    const inspectorContent = document.getElementById('inspectorContent');
    function updateInspector() {
        const obj = canvas.getActiveObject();
        if (!obj) {
            inspectorContent.innerHTML = '<div class="empty-state">Выберите элемент на холсте</div>';
            return;
        }

        let fontOptions = googleFonts.map(f => `<option value="${f}" ${obj.fontFamily === f ? 'selected' : ''}>${f}</option>`).join('');

        inspectorContent.innerHTML = `
            <div class="prop-group">
                <div class="prop-title">Размеры и Позиция</div>
                <div class="prop-row">
                    <label>X</label>
                    <input type="number" id="propX" value="${Math.round(obj.left)}">
                    <label>Y</label>
                    <input type="number" id="propY" value="${Math.round(obj.top)}">
                </div>
                <div class="prop-row">
                    <label>W</label>
                    <input type="number" id="propWidth" value="${Math.round(obj.width * obj.scaleX)}">
                    <label>H</label>
                    <input type="number" id="propHeight" value="${Math.round(obj.height * obj.scaleY)}">
                </div>
            </div>

            <div class="prop-group">
                <div class="prop-title">Стиль</div>
                ${obj.type !== 'image' ? `
                <div class="prop-row">
                    <label>Заливка</label>
                    <input type="color" id="propFill" value="${obj.fill && obj.fill.startsWith('#') ? obj.fill : '#0d99ff'}">
                </div>` : ''}
                <div class="prop-row">
                    <label>Обводка</label>
                    <input type="color" id="propStroke" value="${obj.stroke && obj.stroke.startsWith('#') ? obj.stroke : '#000000'}">
                    <input type="number" id="propStrokeWidth" value="${obj.strokeWidth || 0}" min="0">
                </div>
            </div>

            ${obj.type === 'i-text' ? `
            <div class="prop-group">
                <div class="prop-title">Типографика (Google Fonts)</div>
                <div class="prop-row">
                    <select id="propFontFamily">${fontOptions}</select>
                </div>
                <div class="prop-row">
                    <label>Размер</label>
                    <input type="number" id="propFontSize" value="${obj.fontSize}">
                </div>
            </div>
            ` : ''}
        `;

        const bindInput = (id, prop, transform = v => v) => {
            const el = document.getElementById(id);
            if (el) el.oninput = (e) => {
                obj.set(prop, transform(e.target.value));
                canvas.renderAll();
                triggerAutoSave();
            };
        };

        bindInput('propX', 'left', Number);
        bindInput('propY', 'top', Number);
        bindInput('propFill', 'fill');
        bindInput('propStroke', 'stroke');
        bindInput('propStrokeWidth', 'strokeWidth', Number);

        if (obj.type === 'i-text') {
            bindInput('propFontSize', 'fontSize', Number);
            const fontSelect = document.getElementById('propFontFamily');
            fontSelect.onchange = (e) => {
                const font = e.target.value;
                loadGoogleFont(font);
                obj.set('fontFamily', font);
                canvas.renderAll();
                triggerAutoSave();
            };
        }
    }

    canvas.on('selection:created', () => { updateInspector(); updateLayersList(); });
    canvas.on('selection:updated', () => { updateInspector(); updateLayersList(); });
    canvas.on('selection:cleared', () => { updateInspector(); updateLayersList(); });
    canvas.on('object:modified', () => { updateInspector(); triggerAutoSave(); });

    // Кастомное контекстное меню (ПКМ)
    const contextMenu = document.getElementById('contextMenu');

    canvas.on('mouse:down', (opt) => {
        if (opt.e.button === 2) {
            contextMenu.style.left = `${opt.e.clientX}px`;
            contextMenu.style.top = `${opt.e.clientY}px`;
            contextMenu.classList.remove('hidden');

            const target = opt.target;
            if (target) canvas.setActiveObject(target);
            updateInspector();
        } else {
            contextMenu.classList.add('hidden');
        }
    });

    document.addEventListener('click', () => contextMenu.classList.add('hidden'));

    document.getElementById('ctxDuplicate').onclick = () => {
        const active = canvas.getActiveObject();
        if (active) {
            active.clone((cloned) => {
                cloned.set({ left: active.left + 20, top: active.top + 20 });
                canvas.add(cloned);
                canvas.setActiveObject(cloned);
                updateLayersList();
                triggerAutoSave();
                showToast('Элемент продублирован');
            });
        }
    };

    document.getElementById('ctxBringFront').onclick = () => {
        const active = canvas.getActiveObject();
        if (active) { canvas.bringToFront(active); updateLayersList(); triggerAutoSave(); }
    };

    document.getElementById('ctxSendBack').onclick = () => {
        const active = canvas.getActiveObject();
        if (active) { canvas.sendToBack(active); updateLayersList(); triggerAutoSave(); }
    };

    document.getElementById('ctxDelete').onclick = () => {
        document.getElementById('deleteBtn').click();
    };

    // Удаление
    document.getElementById('deleteBtn').onclick = () => {
        const active = canvas.getActiveObjects();
        active.forEach(o => canvas.remove(o));
        canvas.discardActiveObject();
        updateLayersList();
        updateInspector();
        triggerAutoSave();
        showToast('Удалено');
    };

    // Умный экспорт PNG без фона и с обрезкой по контенту (в стиле Figma)
    document.getElementById('exportBtn').onclick = () => {
        const objects = canvas.getObjects();
        if (objects.length === 0) {
            showToast('На холсте нет объектов для экспорта');
            return;
        }

        // Сохраняем и временно убираем задний фон холста
        const originalBg = canvas.backgroundColor;
        canvas.backgroundColor = null;

        // Вычисляем общие границы всех элементов (Bounding Box)
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        objects.forEach(obj => {
            const bound = obj.getBoundingRect(true);
            if (bound.left < minX) minX = bound.left;
            if (bound.top < minY) minY = bound.top;
            if (bound.left + bound.width > maxX) maxX = bound.left + bound.width;
            if (bound.top + bound.height > maxY) maxY = bound.top + bound.height;
        });

        const padding = 20;
        const cropLeft = Math.max(0, minX - padding);
        const cropTop = Math.max(0, minY - padding);
        const cropWidth = (maxX - minX) + (padding * 2);
        const cropHeight = (maxY - minY) + (padding * 2);

        canvas.renderAll();

        const dataURL = canvas.toDataURL({
            format: 'png',
            left: cropLeft,
            top: cropTop,
            width: cropWidth,
            height: cropHeight,
            multiplier: 2
        });

        // Возвращаем фон назад
        canvas.backgroundColor = originalBg;
        canvas.renderAll();

        const link = document.createElement('a');
        link.download = `${projectName}.png`;
        link.href = dataURL;
        link.click();

        showToast('Экспортировано проект');
    };

    // Горячие клавиши
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'v' || e.key === 'V') setTool('select');
        if (e.key === 'r' || e.key === 'R') setTool('rect');
        if (e.key === 'o' || e.key === 'O') setTool('circle');
        if (e.key === 'l' || e.key === 'L') setTool('line');
        if (e.key === 'p' || e.key === 'P') setTool('pencil');
        if (e.key === 't' || e.key === 'T') setTool('text');
        if (e.key === 'i' || e.key === 'I') imageInput.click();
        if (e.key === 'Delete' || e.key === 'Backspace') document.getElementById('deleteBtn').click();
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            document.getElementById('ctxDuplicate').click();
        }
    });
});