const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const storage = require('./storage');
const rabbitMQ = require('./rabbitmq');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: Date.now(),
        uptime: process.uptime()
    });
});

// Listar tarefas com sync incremental
app.get('/api/tasks', (req, res) => {
    try {
        const modifiedSince = req.query.modifiedSince ? 
            parseInt(req.query.modifiedSince) : null;

        const tasks = storage.listTasks(modifiedSince);
        const lastSync = storage.getLastSyncTimestamp();

        res.json({
            success: true,
            tasks,
            lastSync,
            serverTime: Date.now()
        });
    } catch (error) {
        console.error('Erro ao listar tarefas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Buscar tarefa
app.get('/api/tasks/:id', (req, res) => {
    try {
        const task = storage.getTask(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }

        res.json({
            success: true,
            task
        });
    } catch (error) {
        console.error('Erro ao buscar tarefa:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Criar tarefa
app.post('/api/tasks', (req, res) => {
    try {
        const taskData = req.body;

        if (!taskData.title?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Título é obrigatório'
            });
        }

        const task = storage.createTask(taskData);

        res.status(201).json({
            success: true,
            message: 'Tarefa criada com sucesso',
            task
        });
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Atualizar tarefa com controle de versão
app.put('/api/tasks/:id', (req, res) => {
    try {
        const { version, ...updates } = req.body;
        
        const result = storage.updateTask(req.params.id, updates, version);

        if (!result.success) {
            if (result.error === 'NOT_FOUND') {
                return res.status(404).json({
                    success: false,
                    message: 'Tarefa não encontrada'
                });
            }
            
            if (result.error === 'CONFLICT') {
                return res.status(409).json({
                    success: false,
                    message: 'Conflito detectado - versão desatualizada',
                    error: 'CONFLICT',
                    serverTask: result.serverTask
                });
            }
        }

        res.json({
            success: true,
            message: 'Tarefa atualizada com sucesso',
            task: result.task
        });
    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Deletar tarefa
app.delete('/api/tasks/:id', (req, res) => {
    try {
        const version = req.query.version ? parseInt(req.query.version) : null;
        const result = storage.deleteTask(req.params.id, version);

        if (!result.success) {
            if (result.error === 'NOT_FOUND') {
                return res.status(404).json({
                    success: false,
                    message: 'Tarefa não encontrada'
                });
            }
            
            if (result.error === 'CONFLICT') {
                return res.status(409).json({
                    success: false,
                    message: 'Conflito detectado - versão desatualizada',
                    error: 'CONFLICT',
                    serverTask: result.serverTask
                });
            }
        }

        res.json({
            success: true,
            message: 'Tarefa deletada com sucesso'
        });
    } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Estatísticas
app.get('/api/stats', (req, res) => {
    try {
        const stats = storage.getStats();
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// ==================== RABBITMQ EVENTS ====================

/**
 * Checkout: Completar todas tarefas pendentes de um usuário
 * Endpoint assíncrono que publica evento no RabbitMQ
 */
app.post('/api/checkout', async (req, res) => {
    try {
        const userId = req.body.userId || 'user1';
        
        // 1. Buscar todas tarefas do usuário
        const allTasks = storage.listTasks();
        const userTasks = allTasks.filter(t => t.userId === userId);
        const pendingTasks = userTasks.filter(t => !t.completed);
        
        // 2. Completar todas pendentes
        const completedTasks = [];
        for (const task of pendingTasks) {
            const updated = storage.updateTask(task.id, {
                ...task,
                completed: true,
                completedAt: new Date().toISOString(),
                completedBy: 'checkout',
                version: task.version + 1
            });
            completedTasks.push(updated);
        }
        
        // 3. Calcular totais
        const checkoutData = {
            userId,
            totalTasks: completedTasks.length,
            taskIds: completedTasks.map(t => t.id),
            timestamp: new Date().toISOString(),
            summary: {
                urgent: completedTasks.filter(t => t.priority === 'urgent').length,
                high: completedTasks.filter(t => t.priority === 'high').length,
                medium: completedTasks.filter(t => t.priority === 'medium').length,
                low: completedTasks.filter(t => t.priority === 'low').length,
            }
        };
        
        // 4. Publicar evento no RabbitMQ (ASSÍNCRONO!)
        await rabbitMQ.publish('task.checkout.completed', checkoutData);
        
        console.log(`✅ Checkout processado: ${completedTasks.length} tarefas completadas`);
        
        // 5. Retornar 202 Accepted (processamento assíncrono)
        res.status(202).json({
            success: true,
            message: 'Checkout iniciado - processamento assíncrono em andamento',
            totalCompleted: completedTasks.length,
            checkoutId: checkoutData.timestamp
        });
        
    } catch (error) {
        console.error('❌ Erro no checkout:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar checkout'
        });
    }
});

/**
 * Endpoint para publicar evento de tarefa completada individualmente
 */
app.post('/api/tasks/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        const task = storage.getTask(id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }
        
        // Atualizar tarefa
        const updated = storage.updateTask(id, {
            ...task,
            completed: true,
            completedAt: new Date().toISOString(),
            version: task.version + 1
        });
        
        // Publicar evento
        await rabbitMQ.publish('task.completed', {
            taskId: updated.id,
            title: updated.title,
            userId: updated.userId,
            priority: updated.priority,
            completedAt: updated.completedAt
        });
        
        res.status(202).json({
            success: true,
            message: 'Tarefa completada - notificação sendo enviada',
            task: updated
        });
        
    } catch (error) {
        console.error('Erro ao completar tarefa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno'
        });
    }
});

// Handler de erros
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
    });
});

// Inicialização
app.listen(PORT, async () => {
    console.log('🚀 =====================================');
    console.log(`🚀 Servidor Offline-First iniciado`);
    console.log(`🚀 Porta: ${PORT}`);
    console.log(`🚀 URL: http://localhost:${PORT}`);
    console.log('🚀 Recursos:');
    console.log('🚀   - Sync incremental');
    console.log('🚀   - Controle de versão');
    console.log('🚀   - Detecção de conflitos');
    console.log('🚀 =====================================');
    
    // Conectar ao RabbitMQ (opcional - não quebra se não tiver)
    await rabbitMQ.connect();
});

module.exports = app;
