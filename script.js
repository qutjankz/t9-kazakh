// Словарь неправильных и правильных слов
let dictionary = {};

// Элементы DOM
const textInput = document.getElementById('textInput');
const suggestionsDiv = document.getElementById('suggestions');
const keys = document.querySelectorAll('.key');

// Загрузка словаря
async function loadDictionary() {
    try {
        const response = await fetch('dictionary.json');
        dictionary = await response.json();
        console.log('Словарь загружен:', Object.keys(dictionary).length, 'слов');
    } catch (error) {
        console.error('Ошибка загрузки словаря:', error);
        // Используем резервный словарь
        dictionary = {
            "сәлем": "сәлем",
            "калай": "қалай",
            "жаксы": "жақсы",
            "рахмет": "рахмет",
            "кош": "қош",
            "мектеп": "мектеп",
            "китап": "кітап"
        };
    }
}

// Обработка нажатий на клавиатуру
keys.forEach(key => {
    key.addEventListener('click', function() {
        const keyValue = this.dataset.key;

        if (this.id === 'backspaceKey') {
            handleBackspace();
        } else if (this.id === 'spaceKey') {
            handleSpace();
        } else {
            insertText(keyValue);
        }

        // Вибрация на мобильных устройствах
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    });
});

// Вставка текста
function insertText(char) {
    const start = textInput.selectionStart;
    const end = textInput.selectionEnd;
    const text = textInput.value;

    textInput.value = text.substring(0, start) + char + text.substring(end);
    textInput.selectionStart = textInput.selectionEnd = start + 1;

    textInput.focus();
    checkCurrentWord();
}

// Обработка backspace
function handleBackspace() {
    const start = textInput.selectionStart;
    const end = textInput.selectionEnd;
    const text = textInput.value;

    if (start !== end) {
        // Есть выделенный текст
        textInput.value = text.substring(0, start) + text.substring(end);
        textInput.selectionStart = textInput.selectionEnd = start;
    } else if (start > 0) {
        // Удаляем один символ
        textInput.value = text.substring(0, start - 1) + text.substring(start);
        textInput.selectionStart = textInput.selectionEnd = start - 1;
    }

    textInput.focus();
    checkCurrentWord();
}

// Обработка пробела
function handleSpace() {
    insertText(' ');
}

// Получение текущего слова
function getCurrentWord() {
    const text = textInput.value;
    const cursorPos = textInput.selectionStart;

    // Найти начало слова
    let start = cursorPos;
    while (start > 0 && text[start - 1] !== ' ' && text[start - 1] !== '\n') {
        start--;
    }

    // Найти конец слова
    let end = cursorPos;
    while (end < text.length && text[end] !== ' ' && text[end] !== '\n') {
        end++;
    }

    const word = text.substring(start, end).toLowerCase().trim();
    return { word, start, end };
}

// Проверка текущего слова
function checkCurrentWord() {
    const { word, start, end } = getCurrentWord();

    if (word.length === 0) {
        clearSuggestions();
        return;
    }

    // Проверяем, есть ли слово в словаре неправильных слов
    const suggestions = [];

    for (let incorrect in dictionary) {
        if (word === incorrect.toLowerCase()) {
            const correct = dictionary[incorrect];
            if (correct !== word) {
                suggestions.push({
                    word: correct,
                    start: start,
                    end: end
                });
            }
        }
    }

    // Также ищем похожие слова (начинающиеся так же)
    for (let incorrect in dictionary) {
        if (incorrect.toLowerCase().startsWith(word) && incorrect.toLowerCase() !== word) {
            const correct = dictionary[incorrect];
            suggestions.push({
                word: correct,
                start: start,
                end: end,
                isPartial: true
            });
        }
    }

    if (suggestions.length > 0) {
        showSuggestions(suggestions.slice(0, 5)); // Показываем максимум 5 подсказок
    } else {
        clearSuggestions();
    }
}

// Показ подсказок
function showSuggestions(suggestions) {
    suggestionsDiv.innerHTML = '';

    suggestions.forEach(suggestion => {
        const btn = document.createElement('button');
        btn.className = 'suggestion-item';
        btn.textContent = suggestion.word;
        btn.onclick = () => replaceWord(suggestion);
        suggestionsDiv.appendChild(btn);
    });
}

// Очистка подсказок
function clearSuggestions() {
    suggestionsDiv.innerHTML = '';
}

// Замена слова
function replaceWord(suggestion) {
    const text = textInput.value;
    const { start, end } = getCurrentWord();

    textInput.value = text.substring(0, start) + suggestion.word + text.substring(end);
    textInput.selectionStart = textInput.selectionEnd = start + suggestion.word.length;

    clearSuggestions();
    textInput.focus();

    // Вибрация
    if (navigator.vibrate) {
        navigator.vibrate(20);
    }
}

// Автоматическая замена при вводе пробела
textInput.addEventListener('input', function(e) {
    // Проверяем только если пользователь вводит с физической клавиатуры
    const { word } = getCurrentWord();

    // Проверка происходит в checkCurrentWord
});

// Обработка ввода с физической клавиатуры
textInput.addEventListener('keyup', function(e) {
    checkCurrentWord();
});

// Загрузка словаря при запуске
loadDictionary();