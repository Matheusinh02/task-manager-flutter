const { v4: uuidv4 } = require('uuid');

/**
 * Armazenamento em Memória com Controle de Versão
 * Implementa lógica de sincronização offline-first
 */
class ServerStorage {
    constructor() {
        this.tasks = new Map();
        this.lastModified = new Map();
        
        // Dados de exemplo
        this.seedData();
    }

    seedData() {
        const sampleTasks = [
            {
                title: 'Estudar Flutter Offline-First',
                description: 'Implementar sincronização de dados',
                priority: 'high',
                completed: false
            },
            {
                title: 'Configurar servidor Node.js',
                description: 'Backend REST API para sync',
                priority: 'medium',
                completed: true
            }
        ];

        sampleTasks.forEach(taskData => {
            this.createTask(taskData);
        });

        console.log(`✅ ${this.tasks.size} tarefas de exemplo criadas`);
    }

    createTask(taskData) {
        const task = {
            id: taskData.id || uuidv4(),
            title: taskData.title,
            description: taskData.description || '',
            completed: taskData.completed || false,
            priority: taskData.priority || 'medium',
            createdAt: taskData.createdAt || Date.now(),
            updatedAt: Date.now(),
            version: 1,
            // Campos do Flutter
            photoPaths: taskData.photoPaths || '',
            completedAt: taskData.completedAt || null,
            completedBy: taskData.completedBy || null,
            latitude: taskData.latitude || null,
            longitude: taskData.longitude || null,
            locationName: taskData.locationName || null,
            dueDate: taskData.dueDate || null
        };

        this.tasks.set(task.id, task);
        this.lastModified.set(task.id, task.updatedAt);
        return task;
    }

    getTask(id) {
        return this.tasks.get(id) || null;
    }

    listTasks(modifiedSince = null) {
        let tasks = Array.from(this.tasks.values());

        if (modifiedSince) {
            tasks = tasks.filter(task => task.updatedAt > modifiedSince);
        }

        return tasks.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    updateTask(id, updates, clientVersion) {
        const task = this.tasks.get(id);
        if (!task) return { success: false, error: 'NOT_FOUND' };

        // Verificar versão para detectar conflitos
        if (clientVersion && task.version !== clientVersion) {
            return { 
                success: false, 
                error: 'CONFLICT',
                serverTask: task 
            };
        }

        const updatedTask = {
            ...task,
            ...updates,
            id: task.id,
            createdAt: task.createdAt,
            updatedAt: Date.now(),
            version: task.version + 1
        };

        this.tasks.set(id, updatedTask);
        this.lastModified.set(id, updatedTask.updatedAt);
        
        return { success: true, task: updatedTask };
    }

    deleteTask(id, clientVersion) {
        const task = this.tasks.get(id);
        if (!task) return { success: false, error: 'NOT_FOUND' };

        if (clientVersion && task.version !== clientVersion) {
            return { 
                success: false, 
                error: 'CONFLICT',
                serverTask: task 
            };
        }

        this.tasks.delete(id);
        this.lastModified.delete(id);
        return { success: true };
    }

    getLastSyncTimestamp() {
        const tasks = this.listTasks();
        if (tasks.length === 0) return 0;
        return Math.max(...tasks.map(task => task.updatedAt));
    }

    getStats() {
        const tasks = this.listTasks();
        const completed = tasks.filter(task => task.completed).length;
        
        return {
            total: tasks.length,
            completed,
            pending: tasks.length - completed,
            lastSync: this.getLastSyncTimestamp()
        };
    }
}

module.exports = new ServerStorage();
