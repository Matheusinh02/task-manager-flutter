import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/task.dart';

/**
 * Cliente da API REST
 * Comunicação com servidor backend
 */
class ApiClient {
  static final ApiClient instance = ApiClient._init();
  ApiClient._init();

  final String baseUrl = 'http://localhost:3000/api';

  /// Buscar todas as tarefas (com sync incremental)
  Future<Map<String, dynamic>> getTasks({int? modifiedSince}) async {
    try {
      String url = '$baseUrl/tasks';
      if (modifiedSince != null) {
        url += '?modifiedSince=$modifiedSince';
      }

      final response = await http.get(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'tasks': (data['tasks'] as List).map((t) => Task.fromMap(t)).toList(),
          'lastSync': data['lastSync'],
          'serverTime': data['serverTime'],
        };
      }

      return {'success': false, 'message': 'Erro ${response.statusCode}'};
    } catch (e) {
      print('❌ Erro ao buscar tarefas: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  /// Criar tarefa no servidor
  Future<Map<String, dynamic>> createTask(Task task) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/tasks'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(task.toMap()),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'task': Task.fromMap(data['task']),
        };
      }

      return {'success': false, 'message': 'Erro ${response.statusCode}'};
    } catch (e) {
      print('❌ Erro ao criar tarefa: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  /// Atualizar tarefa no servidor
  Future<Map<String, dynamic>> updateTask(Task task) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/tasks/${task.id}'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(task.toMap()),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'task': Task.fromMap(data['task']),
        };
      }

      // Conflito detectado
      if (response.statusCode == 409) {
        final data = json.decode(response.body);
        return {
          'success': false,
          'conflict': true,
          'serverTask': Task.fromMap(data['serverTask']),
          'message': data['message'],
        };
      }

      return {'success': false, 'message': 'Erro ${response.statusCode}'};
    } catch (e) {
      print('❌ Erro ao atualizar tarefa: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  /// Deletar tarefa no servidor
  Future<Map<String, dynamic>> deleteTask(String id, int? version) async {
    try {
      String url = '$baseUrl/tasks/$id';
      if (version != null) {
        url += '?version=$version';
      }

      final response = await http.delete(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return {'success': true};
      }

      // Conflito
      if (response.statusCode == 409) {
        final data = json.decode(response.body);
        return {
          'success': false,
          'conflict': true,
          'serverTask': Task.fromMap(data['serverTask']),
          'message': data['message'],
        };
      }

      return {'success': false, 'message': 'Erro ${response.statusCode}'};
    } catch (e) {
      print('❌ Erro ao deletar tarefa: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  /// Buscar estatísticas
  Future<Map<String, dynamic>> getStats() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/stats'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'stats': data['stats'],
        };
      }

      return {'success': false, 'message': 'Erro ${response.statusCode}'};
    } catch (e) {
      print('❌ Erro ao buscar stats: $e');
      return {'success': false, 'message': e.toString()};
    }
  }
}
