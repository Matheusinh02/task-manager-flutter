import 'dart:async';
import '../models/task.dart';
import 'db.dart';
import 'api_client.dart';
import 'connectivity_service.dart';

/**
 * Motor de Sincronização Offline-First
 * 
 * Gerencia sincronização bidirecional entre SQLite local e servidor
 */
class SyncEngine {
  static final SyncEngine instance = SyncEngine._init();
  SyncEngine._init();

  bool _isSyncing = false;
  Timer? _autoSyncTimer;
  
  final List<Function(SyncEvent)> _listeners = [];

  bool get isSyncing => _isSyncing;

  /// Inicializar engine
  Future<void> initialize() async {
    // Listener de conectividade
    ConnectivityService.instance.addListener((isOnline) {
      if (isOnline && !_isSyncing) {
        print('🔄 Conexão restaurada - iniciando sync');
        sync();
      }
    });

    // Auto-sync a cada 30 segundos
    startAutoSync(const Duration(seconds: 30));

    print('🔄 SyncEngine inicializado');
  }

  /// Sincronização principal
  Future<SyncResult> sync() async {
    if (_isSyncing) {
      return SyncResult(success: false, message: 'Sync em andamento');
    }

    final isOnline = await ConnectivityService.instance.checkConnectivity();
    if (!isOnline) {
      return SyncResult(success: false, message: 'Sem conectividade');
    }

    _isSyncing = true;
    _notifyListeners(SyncEvent(type: SyncEventType.syncStart));

    try {
      print('🔄 Iniciando sincronização...');

      // 1. PUSH: Enviar tarefas pendentes
      final pushResult = await _pushPendingTasks();
      
      // 2. PULL: Buscar atualizações do servidor
      final pullResult = await _pullFromServer();

      print('✅ Sync concluído: ${pushResult.pushed} enviadas, ${pullResult.pulled} recebidas');

      _notifyListeners(SyncEvent(
        type: SyncEventType.syncComplete,
        pushed: pushResult.pushed,
        pulled: pullResult.pulled,
        conflicts: pushResult.conflicts,
      ));

      return SyncResult(
        success: true,
        message: 'Sincronização concluída',
        pushed: pushResult.pushed,
        pulled: pullResult.pulled,
        conflicts: pushResult.conflicts,
      );

    } catch (e) {
      print('❌ Erro no sync: $e');
      _notifyListeners(SyncEvent(
        type: SyncEventType.syncError,
        message: e.toString(),
      ));

      return SyncResult(success: false, message: e.toString());

    } finally {
      _isSyncing = false;
    }
  }

  /// PUSH: Enviar tarefas pendentes para servidor
  Future<PushResult> _pushPendingTasks() async {
    final tasks = await DB.readAll();
    final pendingTasks = tasks.where((t) => t.syncStatus == 'pending').toList();

    if (pendingTasks.isEmpty) {
      return PushResult(pushed: 0, conflicts: 0);
    }

    print('📤 Enviando ${pendingTasks.length} tarefas pendentes...');

    int pushed = 0;
    int conflicts = 0;

    for (var task in pendingTasks) {
      try {
        final result = await ApiClient.instance.createTask(task);

        if (result['success']) {
          // Atualizar tarefa local como synced
          final syncedTask = task.copyWith(
            version: result['task'].version,
            syncStatus: 'synced',
          );
          await DB.update(syncedTask);
          pushed++;
        }
      } catch (e) {
        print('Erro ao enviar tarefa ${task.id}: $e');
      }
    }

    return PushResult(pushed: pushed, conflicts: conflicts);
  }

  /// PULL: Buscar atualizações do servidor
  Future<PullResult> _pullFromServer() async {
    try {
      final result = await ApiClient.instance.getTasks();

      if (!result['success']) {
        return PullResult(pulled: 0);
      }

      final serverTasks = result['tasks'] as List<Task>;
      print('📥 Recebidas ${serverTasks.length} tarefas do servidor');

      int pulled = 0;

      for (var serverTask in serverTasks) {
        try {
          final localTask = await DB.read(serverTask.id);

          if (localTask == null) {
            // Nova tarefa do servidor
            await DB.create(
              serverTask.copyWith(syncStatus: 'synced'),
            );
            pulled++;
          } else if (localTask.syncStatus == 'synced') {
            // Atualizar se versão do servidor é mais nova
            if (serverTask.version > localTask.version) {
              await DB.update(
                serverTask.copyWith(syncStatus: 'synced'),
              );
              pulled++;
            }
          } else {
            // Tarefa modificada localmente - possível conflito
            if (serverTask.version > localTask.version) {
              _notifyListeners(SyncEvent(
                type: SyncEventType.conflict,
                localTask: localTask,
                serverTask: serverTask,
              ));
            }
          }
        } catch (e) {
          print('Erro ao processar tarefa ${serverTask.id}: $e');
        }
      }

      return PullResult(pulled: pulled);

    } catch (e) {
      print('Erro ao buscar do servidor: $e');
      return PullResult(pulled: 0);
    }
  }

  /// Auto-sync periódico
  void startAutoSync(Duration interval) {
    _autoSyncTimer?.cancel();
    _autoSyncTimer = Timer.periodic(interval, (_) {
      if (ConnectivityService.instance.isOnline && !_isSyncing) {
        sync();
      }
    });
    print('✅ Auto-sync ativo (${interval.inSeconds}s)');
  }

  void stopAutoSync() {
    _autoSyncTimer?.cancel();
    _autoSyncTimer = null;
    print('⏸️ Auto-sync pausado');
  }

  /// Listeners
  void addListener(Function(SyncEvent) callback) {
    _listeners.add(callback);
  }

  void removeListener(Function(SyncEvent) callback) {
    _listeners.remove(callback);
  }

  void _notifyListeners(SyncEvent event) {
    for (var listener in _listeners) {
      try {
        listener(event);
      } catch (e) {
        print('Erro ao notificar listener: $e');
      }
    }
  }

  void dispose() {
    stopAutoSync();
    _listeners.clear();
  }
}

// ==================== CLASSES AUXILIARES ====================

class SyncResult {
  final bool success;
  final String message;
  final int pushed;
  final int pulled;
  final int conflicts;

  SyncResult({
    required this.success,
    required this.message,
    this.pushed = 0,
    this.pulled = 0,
    this.conflicts = 0,
  });
}

class PushResult {
  final int pushed;
  final int conflicts;

  PushResult({required this.pushed, required this.conflicts});
}

class PullResult {
  final int pulled;

  PullResult({required this.pulled});
}

enum SyncEventType {
  syncStart,
  syncComplete,
  syncError,
  conflict,
}

class SyncEvent {
  final SyncEventType type;
  final String? message;
  final int? pushed;
  final int? pulled;
  final int? conflicts;
  final Task? localTask;
  final Task? serverTask;

  SyncEvent({
    required this.type,
    this.message,
    this.pushed,
    this.pulled,
    this.conflicts,
    this.localTask,
    this.serverTask,
  });
}

