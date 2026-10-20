const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Настройка сервера
app.use(cors());
app.use(express.json());

// Начальные данные университета
let courses = [
    {
        id: 'course1',
        code: 'IT101',
        title: 'Programming Fundamentals',
        category: 'IT',
        description: 'Основы программирования',
        credits: 4
    },
    {
        id: 'course2',
        code: 'WEB201',
        title: 'Frontend Development',
        category: 'IT',
        description: 'Создание пользовательских интерфейсов',
        credits: 5
    },
    {
        id: 'course3',
        code: 'MATH101',
        title: 'Discrete Mathematics',
        category: 'Mathematics',
        description: 'Основы дискретной математики',
        credits: 3
    }
];

let students = [
    {
        id: 'student1',
        firstName: 'Алина',
        lastName: 'Иванова',
        studentCard: 'UNI101',
        groupId: 'SE-2-23'
    },
    {
        id: 'student2',
        firstName: 'Бек',
        lastName: 'Осмонов',
        studentCard: 'UNI102',
        groupId: 'SE-2-23'
    }
];

// Вспомогательные функции
function generateId(type) {
    return type + Date.now() + Math.floor(Math.random() * 100);
}

function validateFields(data, requiredFields) {
    return requiredFields.every(field => {
        const value = data[field];

        return value !== undefined &&
            value !== null &&
            String(value).trim().length > 0;
    });
}

// ==================== КУРСЫ ====================

// Получение списка курсов с фильтрацией
app.get('/api/v1/courses', (req, res) => {
    let filteredCourses = [...courses];

    const { category, search } = req.query;

    if (category) {
        filteredCourses = filteredCourses.filter(course =>
            course.category.toLowerCase() ===
            String(category).toLowerCase()
        );
    }

    if (search) {
        const query = String(search).toLowerCase();

        filteredCourses = filteredCourses.filter(course =>
            course.title.toLowerCase().includes(query) ||
            course.code.toLowerCase().includes(query) ||
            course.category.toLowerCase().includes(query)
        );
    }

    res.status(200).json({
        success: true,
        total: filteredCourses.length,
        courses: filteredCourses
    });
});

// Получение одного курса
app.get('/api/v1/courses/:id', (req, res) => {
    const foundCourse = courses.find(
        course => course.id === req.params.id
    );

    if (!foundCourse) {
        return res.status(404).json({
            success: false,
            message: 'Такой курс не существует'
        });
    }

    res.status(200).json({
        success: true,
        course: foundCourse
    });
});

// Добавление нового курса
app.post('/api/v1/courses', (req, res) => {
    const { code, title, category, description, credits } = req.body;

    if (!validateFields(req.body, ['code', 'title', 'category'])) {
        return res.status(400).json({
            success: false,
            message: 'Необходимо указать код, название и категорию курса'
        });
    }

    const normalizedCode = String(code).trim();

    const exists = courses.some(course =>
        course.code.toLowerCase() === normalizedCode.toLowerCase()
    );

    if (exists) {
        return res.status(409).json({
            success: false,
            message: 'Курс с таким кодом уже зарегистрирован'
        });
    }

    const newCourse = {
        id: generateId('course'),
        code: normalizedCode,
        title: String(title).trim(),
        category: String(category).trim(),
        description: description || '',
        credits: credits === undefined ? 0 : credits
    };

    courses.push(newCourse);

    res.status(201).json({
        success: true,
        message: 'Курс успешно добавлен',
        course: newCourse
    });
});

// Редактирование курса
app.put('/api/v1/courses/:id', (req, res) => {
    const courseIndex = courses.findIndex(
        course => course.id === req.params.id
    );

    if (courseIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Не удалось найти курс для изменения'
        });
    }

    const { code, title, category, description, credits } = req.body;

    if (!validateFields(req.body, ['code', 'title', 'category'])) {
        return res.status(400).json({
            success: false,
            message: 'Заполните обязательные поля курса'
        });
    }

    const normalizedCode = String(code).trim();

    const duplicate = courses.some((course, index) =>
        index !== courseIndex &&
        course.code.toLowerCase() === normalizedCode.toLowerCase()
    );

    if (duplicate) {
        return res.status(409).json({
            success: false,
            message: 'Этот код уже используется другим курсом'
        });
    }

    courses[courseIndex] = {
        ...courses[courseIndex],
        code: normalizedCode,
        title: String(title).trim(),
        category: String(category).trim(),
        description: description || '',
        credits: credits === undefined ? 0 : credits
    };

    res.status(200).json({
        success: true,
        message: 'Информация о курсе обновлена',
        course: courses[courseIndex]
    });
});

// Удаление курса
app.delete('/api/v1/courses/:id', (req, res) => {
    const courseIndex = courses.findIndex(
        course => course.id === req.params.id
    );

    if (courseIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Курс для удаления не найден'
        });
    }

    courses.splice(courseIndex, 1);

    res.status(204).send();
});

// ==================== СТУДЕНТЫ ====================

// Получение списка студентов
app.get('/api/v1/students', (req, res) => {
    let filteredStudents = [...students];

    const { groupId } = req.query;

    if (groupId) {
        filteredStudents = filteredStudents.filter(student =>
            student.groupId.toLowerCase() ===
            String(groupId).toLowerCase()
        );
    }

    res.status(200).json({
        success: true,
        total: filteredStudents.length,
        students: filteredStudents
    });
});

// Получение студента по ID
app.get('/api/v1/students/:id', (req, res) => {
    const foundStudent = students.find(
        student => student.id === req.params.id
    );

    if (!foundStudent) {
        return res.status(404).json({
            success: false,
            message: 'Студент не найден'
        });
    }

    res.status(200).json({
        success: true,
        student: foundStudent
    });
});

// Регистрация студента
app.post('/api/v1/students', (req, res) => {
    const { firstName, lastName, studentCard, groupId } = req.body;

    const requiredFields = [
        'firstName',
        'lastName',
        'studentCard',
        'groupId'
    ];

    if (!validateFields(req.body, requiredFields)) {
        return res.status(400).json({
            success: false,
            message: 'Для регистрации заполните все поля студента'
        });
    }

    const cardNumber = String(studentCard).trim();

    const exists = students.some(student =>
        student.studentCard.toLowerCase() === cardNumber.toLowerCase()
    );

    if (exists) {
        return res.status(409).json({
            success: false,
            message: 'Студенческий билет с таким номером уже существует'
        });
    }

    const newStudent = {
        id: generateId('student'),
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        studentCard: cardNumber,
        groupId: String(groupId).trim()
    };

    students.push(newStudent);

    res.status(201).json({
        success: true,
        message: 'Студент успешно зарегистрирован',
        student: newStudent
    });
});

// Изменение данных студента
app.put('/api/v1/students/:id', (req, res) => {
    const studentIndex = students.findIndex(
        student => student.id === req.params.id
    );

    if (studentIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Студент для изменения не найден'
        });
    }

    const { firstName, lastName, studentCard, groupId } = req.body;

    const requiredFields = [
        'firstName',
        'lastName',
        'studentCard',
        'groupId'
    ];

    if (!validateFields(req.body, requiredFields)) {
        return res.status(400).json({
            success: false,
            message: 'Все поля студента должны быть заполнены'
        });
    }

    const cardNumber = String(studentCard).trim();

    const duplicate = students.some((student, index) =>
        index !== studentIndex &&
        student.studentCard.toLowerCase() === cardNumber.toLowerCase()
    );

    if (duplicate) {
        return res.status(409).json({
            success: false,
            message: 'Этот номер студенческого билета уже занят'
        });
    }

    students[studentIndex] = {
        ...students[studentIndex],
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        studentCard: cardNumber,
        groupId: String(groupId).trim()
    };

    res.status(200).json({
        success: true,
        message: 'Данные студента обновлены',
        student: students[studentIndex]
    });
});

// Удаление студента
app.delete('/api/v1/students/:id', (req, res) => {
    const studentIndex = students.findIndex(
        student => student.id === req.params.id
    );

    if (studentIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Студент для удаления не найден'
        });
    }

    students.splice(studentIndex, 1);

    res.status(204).send();
});

// ==================== ОБРАБОТКА ОШИБОК ====================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Маршрут ${req.method} ${req.originalUrl} не существует`
    });
});

// Запуск приложения
app.listen(PORT, () => {
    console.log(`UIS API работает на http://localhost:${PORT}`);
});