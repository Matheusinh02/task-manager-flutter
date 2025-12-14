import 'package:flutter/foundation.dart' show kIsWeb;
import '../models/task.dart';
import 'database_service.dart';
import 'database_service_web.dart';

/**
 * Wrapper para DatabaseService
 * Usa SQLite no mobile e SharedPreferences na Web
 */
class DB {
  static Future<Task> create(Task task) async {
    if (kIsWeb) {
      return DatabaseServiceWeb.instance.create(task);
    }
    return DatabaseService.instance.create(task);
  }

  static Future<Task?> read(String id) async {
    if (kIsWeb) {
      return DatabaseServiceWeb.instance.read(id);
    }
    return DatabaseService.instance.read(id);
  }

  static Future<List<Task>> readAll() async {
    if (kIsWeb) {
      return DatabaseServiceWeb.instance.readAll();
    }
    return DatabaseService.instance.readAll();
  }

  static Future<Task> update(Task task) async {
    if (kIsWeb) {
      return DatabaseServiceWeb.instance.update(task);
    }
    await DatabaseService.instance.update(task);
    return task;
  }

  static Future<void> delete(String id) async {
    if (kIsWeb) {
      return DatabaseServiceWeb.instance.delete(id);
    }
    await DatabaseService.instance.delete(id);
  }

  static Future<List<Task>> getTasksNearLocation({
    required double latitude,
    required double longitude,
    required double radiusInMeters,
  }) async {
    if (kIsWeb) {
      return DatabaseServiceWeb.instance.getTasksNearLocation(
        latitude: latitude,
        longitude: longitude,
        radiusInMeters: radiusInMeters,
      );
    }
    return DatabaseService.instance.getTasksNearLocation(
      latitude: latitude,
      longitude: longitude,
      radiusInMeters: radiusInMeters,
    );
  }
}
