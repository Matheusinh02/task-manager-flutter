import 'dart:async';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/task.dart';

/**
 * DatabaseService para Web usando SharedPreferences
 * Mais simples e confiável que SQLite na Web
 */
class DatabaseServiceWeb {
  static final DatabaseServiceWeb instance = DatabaseServiceWeb._init();
  DatabaseServiceWeb._init();

  static const String _tasksKey = 'tasks_list';

  // CREATE
  Future<Task> create(Task task) async {
    final prefs = await SharedPreferences.getInstance();
    final tasks = await readAll();
    tasks.add(task);
    await _saveTasks(prefs, tasks);
    return task;
  }

  // READ
  Future<Task?> read(String id) async {
    final tasks = await readAll();
    try {
      return tasks.firstWhere((task) => task.id == id);
    } catch (e) {
      return null;
    }
  }

  // READ ALL
  Future<List<Task>> readAll() async {
    final prefs = await SharedPreferences.getInstance();
    final String? tasksJson = prefs.getString(_tasksKey);
    
    if (tasksJson == null) return [];
    
    final List<dynamic> tasksList = json.decode(tasksJson);
    return tasksList.map((json) => Task.fromMap(json)).toList();
  }

  // UPDATE
  Future<Task> update(Task task) async {
    final prefs = await SharedPreferences.getInstance();
    final tasks = await readAll();
    final index = tasks.indexWhere((t) => t.id == task.id);
    
    if (index != -1) {
      tasks[index] = task;
      await _saveTasks(prefs, tasks);
    }
    
    return task;
  }

  // DELETE
  Future<void> delete(String id) async {
    final prefs = await SharedPreferences.getInstance();
    final tasks = await readAll();
    tasks.removeWhere((task) => task.id == id);
    await _saveTasks(prefs, tasks);
  }

  // HELPER: Salvar lista
  Future<void> _saveTasks(SharedPreferences prefs, List<Task> tasks) async {
    final tasksJson = json.encode(tasks.map((t) => t.toMap()).toList());
    await prefs.setString(_tasksKey, tasksJson);
  }

  // Buscar próximas
  Future<List<Task>> getTasksNearLocation({
    required double latitude,
    required double longitude,
    required double radiusInMeters,
  }) async {
    final tasks = await readAll();
    // Simplificado: retornar tarefas com localização
    return tasks.where((t) => t.hasLocation).toList();
  }
}
