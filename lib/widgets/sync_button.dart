import 'package:flutter/material.dart';
import '../services/sync_engine.dart';

/**
 * Botão flutuante de sincronização manual
 */
class SyncButton extends StatefulWidget {
  const SyncButton({super.key});

  @override
  State<SyncButton> createState() => _SyncButtonState();
}

class _SyncButtonState extends State<SyncButton> with SingleTickerProviderStateMixin {
  bool _isSyncing = false;
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    );

    // Escutar eventos de sincronização
    SyncEngine.instance.addListener((event) {
      if (mounted) {
        setState(() {
          _isSyncing = event.type == SyncEventType.syncStart;
          
          if (_isSyncing) {
            _controller.repeat();
          } else {
            _controller.stop();
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _handleSync() async {
    final result = await SyncEngine.instance.sync();
    
    if (mounted) {
      final messenger = ScaffoldMessenger.of(context);
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            result.success 
                ? '✅ Sincronizado: ${result.pushed} enviadas, ${result.pulled} recebidas'
                : '❌ ${result.message}',
          ),
          backgroundColor: result.success ? Colors.green : Colors.red,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      onPressed: _isSyncing ? null : _handleSync,
      tooltip: 'Sincronizar',
      child: _isSyncing
          ? RotationTransition(
              turns: _controller,
              child: const Icon(Icons.sync),
            )
          : const Icon(Icons.sync),
    );
  }
}
