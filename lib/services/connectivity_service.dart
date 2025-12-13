import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:http/http.dart' as http;

/**
 * Serviço de Conectividade
 * Detecta estado da rede e mudanças de conectividade
 */
class ConnectivityService {
  static final ConnectivityService instance = ConnectivityService._init();
  ConnectivityService._init();

  final Connectivity _connectivity = Connectivity();
  StreamSubscription<ConnectivityResult>? _subscription;
  
  bool _isOnline = true;
  final String serverUrl = 'http://localhost:3000';
  
  final List<Function(bool)> _listeners = [];

  bool get isOnline => _isOnline;

  /// Inicializar monitoramento
  Future<void> initialize() async {
    // Verificar conectividade inicial
    await checkConnectivity();

    // Monitorar mudanças
    _subscription = _connectivity.onConnectivityChanged.listen((result) {
      _handleConnectivityChange(result);
    });

    print('📡 ConnectivityService inicializado');
  }

  /// Verificar conectividade atual
  Future<bool> checkConnectivity() async {
    try {
      final result = await _connectivity.checkConnectivity();
      
      if (result == ConnectivityResult.none) {
        _updateStatus(false);
        return false;
      }

      // Tentar ping no servidor
      final isServerReachable = await _pingServer();
      _updateStatus(isServerReachable);
      return isServerReachable;
      
    } catch (e) {
      print('⚠️ Erro ao verificar conectividade: $e');
      _updateStatus(false);
      return false;
    }
  }

  /// Ping no servidor para verificar se está acessível
  Future<bool> _pingServer() async {
    try {
      final response = await http.get(
        Uri.parse('$serverUrl/api/health'),
      ).timeout(const Duration(seconds: 5));
      
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  /// Handler de mudanças de conectividade
  void _handleConnectivityChange(ConnectivityResult result) async {
    if (result == ConnectivityResult.none) {
      _updateStatus(false);
    } else {
      // Verificar se servidor está acessível
      final isReachable = await _pingServer();
      _updateStatus(isReachable);
    }
  }

  /// Atualizar status e notificar listeners
  void _updateStatus(bool isOnline) {
    if (_isOnline != isOnline) {
      _isOnline = isOnline;
      print(isOnline ? '🟢 Online' : '🔴 Offline');
      
      // Notificar listeners
      for (var listener in _listeners) {
        try {
          listener(isOnline);
        } catch (e) {
          print('Erro ao notificar listener: $e');
        }
      }
    }
  }

  /// Adicionar listener
  void addListener(Function(bool) callback) {
    _listeners.add(callback);
  }

  /// Remover listener
  void removeListener(Function(bool) callback) {
    _listeners.remove(callback);
  }

  /// Dispose
  void dispose() {
    _subscription?.cancel();
    _listeners.clear();
  }
}
