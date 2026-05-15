// Получаем элементы DOM для автоматического режима
const totalObjectsInput = document.getElementById('totalObjects');
const groupSizeInput = document.getElementById('groupSize');
const calculateBtn = document.getElementById('calculateBtn');
const expressionSpan = document.getElementById('expression');
const explanationP = document.getElementById('explanation');
const objectsContainer = document.getElementById('objectsContainer');
const groupCountSpan = document.getElementById('groupCount');
const remainderSpan = document.getElementById('remainder');

// Получаем элементы DOM для интерактивного режима
const autoModeBtn = document.getElementById('autoModeBtn');
const interactiveModeBtn = document.getElementById('interactiveModeBtn');
const autoMode = document.getElementById('autoMode');
const interactiveMode = document.getElementById('interactiveMode');

// Элементы интерактивного режима
const interactiveTotalObjectsInput = document.getElementById('interactiveTotalObjects');
const interactiveGroupCountInput = document.getElementById('interactiveGroupCount');
const createObjectsBtn = document.getElementById('createObjectsBtn');
const updateGroupsBtn = document.getElementById('updateGroupsBtn');
const resetBtn = document.getElementById('resetBtn');
const checkResultBtn = document.getElementById('checkResultBtn');
const freeObjectsContainer = document.getElementById('freeObjectsContainer');
const groupsContainer = document.getElementById('groupsContainer');
const interactiveResult = document.getElementById('interactiveResult');
const interactiveExpression = document.getElementById('interactiveExpression');
const interactiveExplanation = document.getElementById('interactiveExplanation');

// Элементы панели состояния
const totalObjectsCount = document.getElementById('totalObjectsCount');
const groupedObjectsCount = document.getElementById('groupedObjectsCount');
const freeObjectsCount = document.getElementById('freeObjectsCount');
const interactiveGroupCount = document.getElementById('interactiveGroupCount');
const targetGroupCount = document.getElementById('targetGroupCount');

// Элементы для статистики
const statTotalObjects = document.getElementById('statTotalObjects');
const statCreatedGroups = document.getElementById('statCreatedGroups');
const statTargetGroups = document.getElementById('statTargetGroups');
const statFreeObjects = document.getElementById('statFreeObjects');
const groupAnalysisContent = document.getElementById('groupAnalysisContent');
const hintsContent = document.getElementById('hintsContent');
const recommendationsContent = document.getElementById('recommendationsContent');

// Переменные для интерактивного режима
let freeObjects = [];
let groups = [];
let draggedElement = null;

// Переключение режимов
autoModeBtn.addEventListener('click', () => switchMode('auto'));
interactiveModeBtn.addEventListener('click', () => switchMode('interactive'));

function switchMode(mode) {
    if (mode === 'auto') {
        autoModeBtn.classList.add('active');
        interactiveModeBtn.classList.remove('active');
        autoMode.classList.add('active');
        interactiveMode.classList.remove('active');
    } else {
        interactiveModeBtn.classList.add('active');
        autoModeBtn.classList.remove('active');
        interactiveMode.classList.add('active');
        autoMode.classList.remove('active');
    }
}

// ========== АВТОМАТИЧЕСКИЙ РЕЖИМ ==========

// Функция для создания объекта
function createObject(number) {
    const object = document.createElement('div');
    object.className = 'object';
    object.textContent = number;
    return object;
}

// Функция для создания разделителя групп
function createGroupDivider() {
    const divider = document.createElement('div');
    divider.className = 'group-divider';
    return divider;
}

// Функция для очистки контейнера объектов
function clearObjectsContainer() {
    objectsContainer.innerHTML = '';
}

// Функция для визуализации деления
function visualizeDivision(totalObjects, groupSize) {
    clearObjectsContainer();
    
    const groups = Math.floor(totalObjects / groupSize);
    const remainder = totalObjects % groupSize;
    
    let objectNumber = 1;
    
    // Создаем группы
    for (let i = 0; i < groups; i++) {
        const groupContainer = document.createElement('div');
        groupContainer.style.display = 'flex';
        groupContainer.style.gap = '10px';
        groupContainer.style.marginBottom = '15px';
        groupContainer.style.justifyContent = 'center';
        
        // Добавляем объекты в группу
        for (let j = 0; j < groupSize; j++) {
            const object = createObject(objectNumber++);
            groupContainer.appendChild(object);
        }
        
        objectsContainer.appendChild(groupContainer);
        
        // Добавляем разделитель между группами (кроме последней)
        if (i < groups - 1 || remainder > 0) {
            objectsContainer.appendChild(createGroupDivider());
        }
    }
    
    // Добавляем остаток, если есть
    if (remainder > 0) {
        const remainderContainer = document.createElement('div');
        remainderContainer.style.display = 'flex';
        remainderContainer.style.gap = '10px';
        remainderContainer.style.justifyContent = 'center';
        remainderContainer.style.marginTop = '15px';
        
        for (let k = 0; k < remainder; k++) {
            const object = createObject(objectNumber++);
            object.style.background = 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)';
            remainderContainer.appendChild(object);
        }
        
        objectsContainer.appendChild(remainderContainer);
    }
}

// Функция для обновления математического выражения
function updateExpression(totalObjects, groupSize) {
    const groups = Math.floor(totalObjects / groupSize);
    const remainder = totalObjects % groupSize;
    if (remainder === 0) {
        expressionSpan.textContent = `${totalObjects} ÷ ${groupSize} = ${groups}`;
    } else {
        expressionSpan.textContent = `${totalObjects} ÷ ${groupSize} = ${groups} (remainder ${remainder})`;
    }
}

// Функция для обновления объяснения
function updateExplanation(totalObjects, groupSize) {
    const groups = Math.floor(totalObjects / groupSize);
    const remainder = totalObjects % groupSize;
    if (remainder === 0) {
        explanationP.textContent = `Let's divide ${totalObjects} objects into groups of ${groupSize}. We get ${groups} equal groups.`;
    } else {
        explanationP.textContent = `Let's divide ${totalObjects} objects into groups of ${groupSize}. We get ${groups} full groups and ${remainder} object(s) will remain.`;
    }
}

// Функция для обновления информации о группах
function updateGroupsInfo(totalObjects, groupSize) {
    const groups = Math.floor(totalObjects / groupSize);
    const remainder = totalObjects % groupSize;
    
    groupCountSpan.textContent = groups;
    remainderSpan.textContent = remainder;
}

// Функция для выполнения всех обновлений в автоматическом режиме
function performDivision() {
    const totalObjects = parseInt(totalObjectsInput.value);
    const groupSize = parseInt(groupSizeInput.value);
    
    // Проверка валидности входных данных
    if (totalObjects <= 0 || groupSize <= 0) {
        alert('Please enter positive numbers!');
        return;
    }
    
    if (groupSize > totalObjects) {
        alert('Group size cannot be greater than the total number of objects!');
        return;
    }
    
    // Обновляем все элементы интерфейса
    updateExpression(totalObjects, groupSize);
    updateExplanation(totalObjects, groupSize);
    updateGroupsInfo(totalObjects, groupSize);
    visualizeDivision(totalObjects, groupSize);
}

// ========== ИНТЕРАКТИВНЫЙ РЕЖИМ ==========

// Создание перетаскиваемого объекта
function createDraggableObject(number) {
    const object = document.createElement('div');
    object.className = 'draggable-object';
    object.textContent = number;
    object.draggable = true;
    object.dataset.number = number;
    
    // Обработчики перетаскивания
    object.addEventListener('dragstart', handleDragStart);
    object.addEventListener('dragend', handleDragEnd);
    
    return object;
}

// Создание группы
function createGroup() {
    const group = document.createElement('div');
    group.className = 'group drop-zone';
    group.dataset.groupId = groups.length;
    
    // Обработчики для зоны перетаскивания
    group.addEventListener('dragover', handleDragOver);
    group.addEventListener('drop', handleDrop);
    group.addEventListener('dragenter', handleDragEnter);
    group.addEventListener('dragleave', handleDragLeave);
    
    return group;
}

// Обработчики перетаскивания
function handleDragStart(e) {
    draggedElement = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedElement = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    e.target.closest('.group').classList.add('drag-over');
}

function handleDragLeave(e) {
    e.target.closest('.group').classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const group = e.target.closest('.group');
    group.classList.remove('drag-over');
    
    if (draggedElement && group) {
        // Удаляем объект из свободных
        draggedElement.remove();
        freeObjects = freeObjects.filter(obj => obj.dataset.number !== draggedElement.dataset.number);
        
        // Добавляем объект в группу
        const newObject = createDraggableObject(draggedElement.dataset.number);
        group.appendChild(newObject);
        
        // Обновляем состояние
        updateStatus();
        autoUpdateAnalysis();
    }
}

// Создание объектов для интерактивного режима
function createInteractiveObjects() {
    const totalObjects = parseInt(interactiveTotalObjectsInput.value);
    
    if (totalObjects <= 0 || totalObjects > 30) {
        alert('Please enter a number from 1 to 30!');
        return;
    }
    
    // Очищаем предыдущие объекты
    freeObjectsContainer.innerHTML = '';
    groupsContainer.innerHTML = '';
    freeObjects = [];
    groups = [];
    
    // Создаем свободные объекты
    for (let i = 1; i <= totalObjects; i++) {
        const object = createDraggableObject(i);
        freeObjectsContainer.appendChild(object);
        freeObjects.push(object);
    }
    
    // Создаем группы согласно заданному количеству
    createGroups();
    
    updateStatus();
    autoUpdateAnalysis();
}

// Создание групп
function createGroups() {
    const groupCount = parseInt(interactiveGroupCountInput.value);
    
    if (groupCount <= 0 || groupCount > 15) {
        alert('Please enter a number of groups from 1 to 15!');
        return;
    }
    
    // Очищаем контейнер групп
    groupsContainer.innerHTML = '';
    groups = [];
    
    // Создаем группы
    for (let i = 0; i < groupCount; i++) {
        const group = createGroup();
        group.classList.add('empty');
        group.textContent = 'Drag objects here';
        groupsContainer.appendChild(group);
        groups.push(group);
    }
}

// Обновление групп
function updateGroups() {
    const currentGroupCount = groups.length;
    const newGroupCount = parseInt(interactiveGroupCountInput.value);
    
    if (newGroupCount <= 0 || newGroupCount > 15) {
        alert('Please enter a number of groups from 1 to 15!');
        return;
    }
    
    if (newGroupCount === currentGroupCount) {
        return; // Ничего не меняется
    }
    
    if (newGroupCount > currentGroupCount) {
        // Добавляем новые группы
        for (let i = currentGroupCount; i < newGroupCount; i++) {
            const group = createGroup();
            group.classList.add('empty');
            group.textContent = 'Drag objects here';
            groupsContainer.appendChild(group);
            groups.push(group);
        }
    } else {
        // Удаляем лишние группы (только пустые)
        const groupsToRemove = currentGroupCount - newGroupCount;
        let removedCount = 0;
        
        for (let i = groups.length - 1; i >= 0 && removedCount < groupsToRemove; i--) {
            const group = groups[i];
            if (group.classList.contains('empty')) {
                group.remove();
                groups.splice(i, 1);
                removedCount++;
            }
        }
        
        // Если не удалось удалить достаточно пустых групп, предупреждаем
        if (removedCount < groupsToRemove) {
            alert(`Could not remove ${groupsToRemove} groups because they contain objects. Move objects to other groups first.`);
        }
    }
    
    updateStatus();
}

// Обновление панели состояния
function updateStatus() {
    const totalObjects = parseInt(interactiveTotalObjectsInput.value);
    const groupedObjects = document.querySelectorAll('.group:not(.empty) .draggable-object').length;
    const freeObjectsCount = freeObjects.length;
    const groupCount = document.querySelectorAll('.group:not(.empty)').length;
    const targetGroups = parseInt(interactiveGroupCountInput.value);
    
    totalObjectsCount.textContent = totalObjects;
    groupedObjectsCount.textContent = groupedObjects;
    freeObjectsCount.textContent = freeObjectsCount;
    interactiveGroupCount.textContent = groupCount;
    targetGroupCount.textContent = targetGroups;
}

// Сброс всех объектов
function resetInteractive() {
    createInteractiveObjects();
}

// Обновление подробной статистики
function updateDetailedStats(totalObjects, createdGroups, targetGroups, freeObjects) {
    statTotalObjects.textContent = totalObjects;
    statCreatedGroups.textContent = createdGroups;
    statTargetGroups.textContent = targetGroups;
    statFreeObjects.textContent = freeObjects;
}

// Анализ групп
function analyzeGroups() {
    const groups = document.querySelectorAll('.group:not(.empty)');
    const groupSizes = [];
    const groupDetails = [];
    
    groups.forEach((group, index) => {
        const objectsInGroup = group.querySelectorAll('.draggable-object').length;
        if (objectsInGroup > 0) {
            groupSizes.push(objectsInGroup);
            groupDetails.push({
                number: index + 1,
                size: objectsInGroup,
                objects: Array.from(group.querySelectorAll('.draggable-object')).map(obj => obj.dataset.number)
            });
        }
    });
    
    if (groupSizes.length === 0) {
        return {
            groupSizes: [],
            groupDetails: [],
            maxGroupSize: null,
            minGroupSize: null,
            averageGroupSize: null,
            isEqualGroups: null,
            sizeVariation: null,
            totalGroups: 0
        };
    }
    
    const maxGroupSize = Math.max(...groupSizes);
    const minGroupSize = Math.min(...groupSizes);
    const averageGroupSize = Math.round(groupSizes.reduce((a, b) => a + b, 0) / groupSizes.length);
    const isEqualGroups = maxGroupSize === minGroupSize;
    const sizeVariation = maxGroupSize - minGroupSize;
    
    return {
        groupSizes,
        groupDetails,
        maxGroupSize,
        minGroupSize,
        averageGroupSize,
        isEqualGroups,
        sizeVariation,
        totalGroups: groupSizes.length
    };
}

// Генерация рекомендаций
function generateRecommendations(totalObjects, targetGroups, analysis) {
    const recommendations = [];
    
    if (analysis.totalGroups < targetGroups) {
        recommendations.push('Create additional groups to reach the target.');
    }
    
    if (analysis.totalGroups > targetGroups) {
        recommendations.push('Remove extra groups or merge them.');
    }
    
    if (analysis.isEqualGroups === false) {
        recommendations.push('Move objects between groups to create equal groups.');
        
        if (analysis.sizeVariation > 2) {
            recommendations.push('Try to distribute objects more evenly.');
        }
    }
    
    const expectedSize = Math.floor(totalObjects / targetGroups);
    if (analysis.averageGroupSize !== null && analysis.averageGroupSize !== expectedSize) {
        recommendations.push(`Aim for ${expectedSize} objects in each group.`);
    }
    
    if (analysis.isEqualGroups && analysis.totalGroups === targetGroups) {
        recommendations.push('Great job! The groups are created correctly.');
    }
    
    return recommendations;
}

// Отображение рекомендаций
function displayRecommendations(recommendations) {
    let html = '<div class="recommendations-content">';
    
    if (recommendations.length === 0) {
        html += '<p>Keep up the good work!</p>';
    } else {
        recommendations.forEach(recommendation => {
            html += `<div class="recommendation-item">${recommendation}</div>`;
        });
    }
    
    html += '</div>';
    recommendationsContent.innerHTML = html;
}

// Добавляем функцию autoUpdateAnalysis, которая вызывается при любом изменении
function autoUpdateAnalysis() {
    const totalObjects = parseInt(interactiveTotalObjectsInput.value);
    const targetGroupCount = parseInt(interactiveGroupCountInput.value);
    const actualGroupCount = document.querySelectorAll('.group:not(.empty)').length;
    const freeObjectsCount = freeObjects.length;

    // Обновляем основную статистику
    updateDetailedStats(totalObjects, actualGroupCount, targetGroupCount, freeObjectsCount);

    // Анализируем группы (только для рекомендаций)
    const groupAnalysis = analyzeGroups();
    // Генерируем рекомендации
    const recommendations = generateRecommendations(totalObjects, targetGroupCount, groupAnalysis);
    // Отображаем рекомендации
    displayRecommendations(recommendations);
}

// Вызов анализа при изменениях
interactiveTotalObjectsInput.addEventListener('input', autoUpdateAnalysis);
interactiveGroupCountInput.addEventListener('input', autoUpdateAnalysis);

// Обработчики событий для интерактивного режима
createObjectsBtn.addEventListener('click', createInteractiveObjects);
updateGroupsBtn.addEventListener('click', updateGroups);
resetBtn.addEventListener('click', resetInteractive);

// Обработчики событий для автоматического режима
calculateBtn.addEventListener('click', performDivision);
totalObjectsInput.addEventListener('input', performDivision);
groupSizeInput.addEventListener('input', performDivision);

// Автоматическое обновление статуса при изменении параметров
interactiveTotalObjectsInput.addEventListener('input', updateStatus);
interactiveGroupCountInput.addEventListener('input', updateStatus);

// Обработчики событий для Enter в полях ввода
totalObjectsInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        performDivision();
    }
});

groupSizeInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        performDivision();
    }
});

interactiveTotalObjectsInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        createInteractiveObjects();
    }
});

interactiveGroupCountInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        updateGroups();
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    performDivision();
    createInteractiveObjects();
});

// Добавляем анимацию для объектов при их появлении
function addAnimationDelay() {
    const objects = document.querySelectorAll('.object');
    objects.forEach((object, index) => {
        object.style.animationDelay = `${index * 0.1}s`;
    });
}

// Обновляем функцию визуализации для добавления задержки анимации
const originalVisualizeDivision = visualizeDivision;
visualizeDivision = function(totalObjects, groupSize) {
    originalVisualizeDivision(totalObjects, groupSize);
    setTimeout(addAnimationDelay, 100);
}; 