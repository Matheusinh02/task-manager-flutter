# Roteiro de Demonstração - Task Manager Offline-First (Flutter)

## 📋 Pré-requisitos

1. ✅ Flutter SDK instalado
2. ✅ Navegador Chrome ou dispositivo/emulador Android
3. ✅ Node.js para servidor backend
4. ✅ DevTools do navegador (para Web)

## 🚀 Setup Inicial

```bash
# 1. Iniciar servidor backend
cd task_manager/server
npm install
npm start
# Servidor rodando em http://localhost:3000

# 2. Em outro terminal, rodar app Flutter
cd task_manager
flutter pub get
flutter run -d chrome  # ou -d windows, -d android, etc.
```

---

## 🎯 Cenário 1: Criação Offline

**Objetivo:** Demonstrar que o app funciona sem conexão

### Passos:

1. ✅ Com app aberto, observar indicador **🟢 Online** no AppBar

2. ✅ **Simular Offline:**
   - **Web:** DevTools (F12) → Network → Marcar "Offline"
   - **Android:** Desabilitar WiFi e dados móveis
   - **Windows:** Desconectar WiFi

3. ✅ Observar indicador mudar para **🔴 Offline**

4. ✅ Criar nova tarefa:
   - Clicar no botão **"+ Nova Tarefa"**
   - Título: "Comprar leite"
   - Descrição: "Leite integral 1L"
   - Prioridade: Média
   - Clicar "Salvar"

5. ✅ **Verificar:**
   - Tarefa aparece na lista imediatamente
   - Badge mostra **"⏱ Pendente"** (laranja)
   - Console mostra: `📴 Sem conectividade - operações enfileiradas`

6. ✅ Criar mais 2 tarefas offline:
   - "Estudar Flutter Offline-First"
   - "Fazer exercícios físicos"

7. ✅ Observar que todas ficam com badge **"⏱ Pendente"**

8. ✅ **Voltar Online:**
   - **Web:** Desmarcar "Offline" no DevTools
   - **Mobile:** Reativar WiFi/dados

9. ✅ Observar:
   - Indicador muda para **🟢 Online**
   - Console: `🔄 Conexão restaurada - iniciando sync`
   - Console: `📤 Enviando 3 tarefas pendentes...`
   - Console: `✅ Sync concluído: 3 enviadas, 0 recebidas`
   - Badges mudam de **⏱** para **✓** (desaparecem quando sincronizado)

**✅ Resultado esperado:** Todas as 3 tarefas sincronizadas automaticamente ao reconectar

---

## 🎯 Cenário 2: Sincronização Manual

**Objetivo:** Testar botão de sincronização manual

### Passos:

1. ✅ Criar 2 tarefas enquanto offline

2. ✅ Voltar online (mas aguardar antes do auto-sync)

3. ✅ Clicar no botão flutuante **🔄 Sincronizar** (acima do botão +)

4. ✅ Observar:
   - Ícone rotaciona durante sincronização
   - SnackBar aparece: `✅ Sincronizado: 2 enviadas, 0 recebidas`

5. ✅ Verificar console:
```
🔄 Iniciando sincronização...
📤 Enviando 2 tarefas pendentes...
✅ Sync concluído: 2 enviadas, 0 recebidas
```

**✅ Resultado esperado:** Sincronização manual funciona corretamente

---

## 🎯 Cenário 3: Auto-Sync Periódico

**Objetivo:** Verificar sincronização automática a cada 30 segundos

### Passos:

1. ✅ Criar tarefa offline: "Teste auto-sync"

2. ✅ Voltar online

3. ✅ **Aguardar e observar console:**
   - Em até 30 segundos, deve aparecer:
   ```
   🔄 Iniciando sincronização...
   📤 Enviando 1 tarefas pendentes...
   ✅ Sync concluído: 1 enviadas, 0 recebidas
   ```

4. ✅ Verificar que badge da tarefa desaparece (foi sincronizada)

**✅ Resultado esperado:** Auto-sync funciona a cada 30 segundos quando online

---

## 🎯 Cenário 4: Persistência Local

**Objetivo:** Garantir dados persistem após fechar app

### Passos:

1. ✅ Criar 3 tarefas (podem ser offline)

2. ✅ Fechar completamente o app:
   - **Web:** Fechar todas as abas
   - **Mobile:** Fechar app completamente (não apenas minimizar)
   - **Windows:** Fechar janela

3. ✅ **Simular sem internet** (antes de reabrir):
   - Colocar dispositivo em modo avião OU
   - Marcar "Offline" no DevTools

4. ✅ Reabrir o app

5. ✅ **Verificar:**
   - ✅ Todas as 3 tarefas ainda estão lá
   - ✅ Status de sincronização preservado (badges corretos)
   - ✅ App funciona normalmente offline

6. ✅ Voltar online e sincronizar

**✅ Resultado esperado:** 
- **Web:** Dados persistidos no SharedPreferences
- **Mobile:** Dados persistidos no SQLite

---

## 🎯 Cenário 5: Operações CRUD Offline

**Objetivo:** Testar Create, Update e Delete offline

### Passos:

1. ✅ **Ficar Offline**

2. ✅ **Criar tarefa "A"**
   - Título: "Tarefa A"
   - Observar badge **⏱ Pendente**

3. ✅ **Editar tarefa "A"**
   - Clicar na tarefa
   - Mudar título para "Tarefa A - Editada"
   - Salvar
   - Ainda mostra **⏱ Pendente**

4. ✅ **Criar tarefa "B"**
   - Título: "Tarefa B"

5. ✅ **Deletar tarefa "B"**
   - Swipe ou clicar em deletar

6. ✅ **Voltar online**

7. ✅ Observar sincronização:
```
📤 Enviando 2 tarefas pendentes...
✅ Sync concluído: 2 enviadas, 0 recebidas
```

8. ✅ Verificar no servidor (Postman/cURL):
```bash
curl http://localhost:3000/api/tasks
```
   - Deve ter "Tarefa A - Editada"
   - Não deve ter "Tarefa B"

**✅ Resultado esperado:** Todas operações offline sincronizadas corretamente

---

## 🎯 Cenário 6: Indicadores Visuais

**Objetivo:** Validar todos os indicadores visuais

### Componentes a verificar:

#### 1. **Indicador de Conectividade (AppBar)**
   - ✅ 🟢 Online (verde)
   - ✅ 🔴 Offline (vermelho)
   - ✅ Transição suave entre estados

#### 2. **Botão de Sincronização**
   - ✅ Ícone estático quando não sincronizando
   - ✅ Ícone rotacionando durante sync
   - ✅ Desabilitado enquanto sincroniza

#### 3. **Badges nas Tarefas**
   - ✅ **Nenhum badge** = Sincronizada (verde implícito)
   - ✅ **⏱ Pendente** (laranja) = Aguardando sincronização
   - ✅ **⚠ Conflito** (vermelho) = Conflito detectado

#### 4. **SnackBars**
   - ✅ Sucesso (verde)
   - ✅ Erro (vermelho)
   - ✅ Info (azul)

#### 5. **Console Logs**
   ```
   ✅ SQLite Web inicializado
   📡 ConnectivityService inicializado
   🔄 SyncEngine inicializado
   🟢 Online / 🔴 Offline
   📤 Enviando X tarefas pendentes...
   ✅ Sync concluído: X enviadas, Y recebidas
   ```

---

## 🎯 Cenário 7: Recursos de Hardware + Offline

**Objetivo:** Testar integração de hardware com sincronização

### A) Foto Offline

1. ✅ Ficar offline
2. ✅ Criar tarefa e adicionar foto (câmera/galeria)
3. ✅ Foto salva localmente
4. ✅ Voltar online
5. ✅ Tarefa sincroniza (mas fotos só ficam locais na Web)

### B) GPS Offline

1. ✅ Ficar offline
2. ✅ Criar tarefa e adicionar localização
3. ✅ GPS funciona offline
4. ✅ Coordenadas salvas localmente
5. ✅ Voltar online
6. ✅ Tarefa com localização sincroniza

### C) Shake para Completar + Sync

1. ✅ Ficar offline
2. ✅ Criar tarefa pendente
3. ✅ Fazer gesto de shake
4. ✅ Tarefa marcada como completa offline
5. ✅ Badge mostra **⏱ Pendente**
6. ✅ Voltar online
7. ✅ Sincroniza status completado

**✅ Resultado esperado:** Hardware funciona offline e sincroniza depois

---

## 🔍 Comandos de Debug

### Verificar Estado do Servidor:
```bash
# Health check
curl http://localhost:3000/api/health

# Ver todas as tarefas
curl http://localhost:3000/api/tasks

# Ver estatísticas
curl http://localhost:3000/api/stats
```

### Limpar Dados Locais:
```bash
# Limpar e recompilar
flutter clean
flutter pub get
flutter run -d chrome
```

### Console do App (DevTools):
```
# Ver logs no terminal onde rodou flutter run
# Filtrar por:
# - 🔄 (sync)
# - 📤 (push)
# - 📥 (pull)
# - ✅ (sucesso)
# - ❌ (erro)
```

---

## 📊 Checklist de Validação

### ✅ Funcionalidades Core:
- [ ] Criar tarefa offline
- [ ] Editar tarefa offline
- [ ] Deletar tarefa offline
- [ ] Sincronização automática (30s)
- [ ] Sincronização manual (botão)
- [ ] Indicador de conectividade
- [ ] Badges de status
- [ ] Persistência local
- [ ] Auto-sync ao reconectar

### ✅ Hardware + Offline:
- [ ] Câmera/Galeria offline
- [ ] GPS offline
- [ ] Shake detection offline
- [ ] Múltiplas fotos offline

### ✅ Indicadores Visuais:
- [ ] Bolinha online/offline
- [ ] Badges de sincronização
- [ ] Animação de sync
- [ ] SnackBars informativos
- [ ] Console logs claros

---

## 🎓 Conceitos Demonstrados

### 1. **Local-First**
   - Todas operações salvam localmente primeiro
   - App responsivo independente da rede

### 2. **Sincronização Eventual**
   - Dados sincronizam quando conexão disponível
   - Consistência eventual (não imediata)

### 3. **Last-Write-Wins (LWW)**
   - Conflitos resolvidos por timestamp
   - Versão mais recente prevalece

### 4. **Fila de Operações**
   - Operações offline enfileiradas
   - Processadas em ordem (FIFO)
   - Retry automático em caso de erro

### 5. **Resiliência**
   - App funciona sempre
   - Não depende de rede estável
   - Melhor experiência do usuário

---

## 🏆 Critérios de Sucesso

### ✅ PASSOU se:
1. App funciona completamente offline
2. Todas operações sincronizam ao reconectar
3. Indicadores visuais corretos
4. Dados persistem após fechar app
5. Auto-sync funciona periodicamente
6. Hardware integra com offline

### ❌ FALHOU se:
1. App trava sem conexão
2. Dados perdidos ao fechar
3. Sincronização não funciona
4. Indicadores incorretos
5. Operações offline não persistem

---

## 📝 Notas Importantes

### Limitações na Web:
- ⚠️ Câmera usa webcam (não câmera traseira)
- ⚠️ GPS pode não ter precisão
- ⚠️ Shake detection não funciona
- ⚠️ Vibração não funciona
- ✅ SharedPreferences ao invés de SQLite

### Recomendações:
- 🎯 Testar em dispositivo real para melhor experiência
- 🎯 Usar Windows Desktop para ter mais recursos
- 🎯 Monitorar console para ver sincronização
- 🎯 Testar com diferentes velocidades de rede

---

## 🎉 Conclusão

Este app demonstra um sistema **Offline-First** completo com:
- ✅ Persistência local (SQLite/SharedPreferences)
- ✅ Sincronização bidirecional
- ✅ Detecção de conectividade
- ✅ Indicadores visuais
- ✅ Hardware integrado
- ✅ Experiência fluida

**Paradigma implementado com sucesso!** 🚀
