# 📱 Task Manager Flutter - Sistema Offline-First

![Flutter](https://img.shields.io/badge/Flutter-3.0+-02569B?logo=flutter)
![Dart](https://img.shields.io/badge/Dart-3.0+-0175C2?logo=dart)
![Node.js](https://img.shields.io/badge/Node.js-16+-339933?logo=node.js)
![License](https://img.shields.io/badge/license-MIT-green)

Sistema completo de gerenciamento de tarefas com suporte **Offline-First**, recursos de hardware (câmera, GPS, sensores) e sincronização bidirecional com servidor backend.

---

## 🎯 **Características Principais**

### ✨ **Funcionalidades Core**
- ✅ **CRUD Completo** - Criar, ler, atualizar e deletar tarefas
- ✅ **Prioridades** - Alta, Média, Baixa
- ✅ **Filtros** - Todas, Pendentes, Concluídas, Próximas (GPS)
- ✅ **Datas** - Data de vencimento com indicador visual
- ✅ **Persistência Local** - SQLite (mobile) / SharedPreferences (web)

### 📸 **Recursos de Hardware**
- 📷 **Câmera** - Múltiplas fotos por tarefa
- 🖼️ **Galeria** - Seleção de fotos existentes
- 📍 **GPS** - Localização com geocoding
- 🤝 **Shake Detection** - Completar tarefa com gesto
- 📳 **Vibração** - Feedback tátil

### 🔄 **Sincronização Offline-First**
- 🌐 **Backend Node.js** - Servidor REST API
- 🔄 **Auto-Sync** - Sincronização automática a cada 30s
- 📤 **Push/Pull** - Sincronização bidirecional
- ⚡ **Detecção de Conectividade** - Indicadores visuais online/offline
- 🏷️ **Controle de Versão** - Detecção de conflitos
- 📊 **Badges de Status** - Visual do estado de sincronização

---

## 🚀 **Instalação e Execução**

### **Pré-requisitos**
- Flutter SDK 3.0+
- Dart 3.0+
- Node.js 16+
- Chrome/Edge (para Web) ou Android/iOS device

### **1. Clonar Repositório**
```bash
git clone https://github.com/Matheusinh02/task-manager-flutter.git
cd task-manager-flutter
```

### **2. Iniciar Servidor Backend**
```bash
cd server
npm install
npm start
```
✅ Servidor rodando em `http://localhost:3000`

### **3. Rodar App Flutter**

**Opção A: Web (Chrome)**
```bash
cd ..
flutter pub get
flutter run -d chrome
```

**Opção B: Android**
```bash
flutter run -d android
```

**Opção C: Windows Desktop**
```bash
flutter run -d windows
```

---

## 📁 **Estrutura do Projeto**

```
task_manager/
├── lib/
│   ├── models/
│   │   └── task.dart                    # Modelo de dados Task
│   ├── services/
│   │   ├── database_service.dart        # SQLite (mobile)
│   │   ├── database_service_web.dart    # SharedPreferences (web)
│   │   ├── db.dart                      # Wrapper unificado
│   │   ├── camera_service.dart          # Gerenciamento de câmera
│   │   ├── location_service.dart        # GPS e geocoding
│   │   ├── sensor_service.dart          # Shake detection
│   │   ├── connectivity_service.dart    # Detecção de conectividade
│   │   ├── api_client.dart              # Cliente HTTP REST
│   │   └── sync_engine.dart             # Motor de sincronização
│   ├── screens/
│   │   ├── task_list_screen.dart        # Lista de tarefas
│   │   └── task_form_screen.dart        # Formulário criar/editar
│   ├── widgets/
│   │   ├── task_card.dart               # Card de tarefa
│   │   ├── location_picker.dart         # Seletor de localização
│   │   ├── connectivity_indicator.dart  # Indicador online/offline
│   │   └── sync_button.dart             # Botão de sincronização
│   └── main.dart                        # Entry point
│
├── server/
│   ├── server.js                        # Servidor Express
│   ├── storage.js                       # Storage com versionamento
│   └── package.json                     # Dependências Node.js
│
├── android/                             # Configurações Android
├── ios/                                 # Configurações iOS
├── web/                                 # Configurações Web
├── windows/                             # Configurações Windows
├── pubspec.yaml                         # Dependências Flutter
└── ROTEIRO_DEMONSTRACAO.md              # Roteiro de testes
```

---

## 🔧 **Tecnologias Utilizadas**

### **Frontend (Flutter)**
| Pacote | Versão | Uso |
|--------|--------|-----|
| `sqflite` | ^2.3.0 | Banco de dados SQLite (mobile) |
| `sqflite_common_ffi_web` | ^0.4.2 | SQLite para Web |
| `shared_preferences` | ^2.2.2 | Storage simples (web) |
| `camera` | ^0.10.5 | Acesso à câmera |
| `image_picker` | ^1.0.7 | Galeria de fotos |
| `geolocator` | ^10.1.0 | GPS |
| `geocoding` | ^2.1.1 | Endereços |
| `sensors_plus` | ^4.0.2 | Acelerômetro (shake) |
| `connectivity_plus` | ^5.0.2 | Conectividade |
| `http` | ^1.1.0 | Cliente HTTP |
| `uuid` | ^4.2.1 | IDs únicos |
| `intl` | ^0.19.0 | Formatação |

### **Backend (Node.js)**
| Pacote | Versão | Uso |
|--------|--------|-----|
| `express` | ^4.18.2 | Framework web |
| `cors` | ^2.8.5 | CORS |
| `body-parser` | ^1.20.2 | Parser de JSON |
| `uuid` | ^9.0.0 | IDs únicos |
| `nodemon` | ^3.0.1 | Auto-reload (dev) |

---

## 🎓 **Conceitos Implementados**

### **1. Paradigma Offline-First**
```
┌──────────────┐      HTTP/REST      ┌──────────────┐
│   Flutter    │ ←─────────────────→ │   Node.js    │
│   (Cliente)  │   Sincronização     │   (Servidor) │
│   + SQLite   │                     │   + Storage  │
└──────────────┘                     └──────────────┘
```

**Princípios:**
- ✅ **Local-First** - Operações salvam localmente primeiro
- ✅ **Sync Eventual** - Sincroniza quando conexão disponível
- ✅ **Last-Write-Wins** - Conflitos resolvidos por timestamp
- ✅ **Sempre Disponível** - App funciona offline

### **2. Arquitetura de Sincronização**

```dart
// 1. Operação local (instantânea)
await DB.create(task);  // Salva com syncStatus='pending'

// 2. Auto-sync detecta tarefa pendente
SyncEngine -> detecta conexão online
           -> envia para servidor
           -> atualiza syncStatus='synced'

// 3. Pull periódico
SyncEngine -> busca atualizações do servidor
           -> atualiza tarefas locais
```

### **3. Controle de Versão**
```javascript
// Servidor mantém version de cada tarefa
{
  id: "abc123",
  title: "Tarefa",
  version: 3,  // Incrementa a cada update
  updatedAt: 1702500000000
}

// Cliente envia version ao atualizar
PUT /api/tasks/abc123 { version: 3, ... }

// Servidor detecta conflito se versões divergem
if (clientVersion !== serverVersion) {
  return 409 CONFLICT
}
```

---

## 📱 **Como Usar**

### **Criar Tarefa**
1. Clicar em **"+ Nova Tarefa"**
2. Preencher título (obrigatório)
3. Adicionar descrição, prioridade, data
4. **Opcional:** Adicionar fotos (câmera/galeria)
5. **Opcional:** Adicionar localização (GPS)
6. Salvar

### **Completar Tarefa**
- ✅ Clicar no checkbox
- 📳 **OU** Fazer gesto de shake (mobile)

### **Editar Tarefa**
- Clicar na tarefa
- Modificar campos
- Salvar

### **Deletar Tarefa**
- Swipe para esquerda
- **OU** Clicar no ícone de lixeira

### **Sincronizar**
- **Automático:** A cada 30 segundos (se online)
- **Manual:** Clicar no botão 🔄 de sincronização

---

## 🧪 **Testando Offline-First**

### **Cenário 1: Criar Tarefa Offline**

1. **Simular offline:**
   - **Web:** DevTools (F12) → Network → Marcar "Offline"
   - **Mobile:** Desabilitar WiFi

2. **Criar tarefa:**
   - Observar badge **"⏱ Pendente"** (laranja)

3. **Voltar online:**
   - Badge desaparece (sincronizado)
   - Console mostra: `✅ Sync concluído: 1 enviadas`

### **Cenário 2: Verificar Persistência**

1. Criar 3 tarefas
2. Fechar app completamente
3. Reabrir app (offline)
4. ✅ Tarefas ainda estão lá!

### **Cenário 3: Sincronização Manual**

1. Criar tarefas offline
2. Voltar online
3. Clicar no botão 🔄
4. SnackBar mostra resultado

Ver mais cenários em: [ROTEIRO_DEMONSTRACAO.md](ROTEIRO_DEMONSTRACAO.md)

---

## 🎨 **Interface**

### **Indicadores Visuais**

#### **1. Status de Conectividade (AppBar)**
- 🟢 **Online** - Bolinha verde
- 🔴 **Offline** - Bolinha vermelha

#### **2. Badges de Sincronização (Tarefas)**
- ⏱ **Pendente** - Aguardando sincronização (laranja)
- ⚠️ **Conflito** - Conflito detectado (vermelho)
- _(Nenhum badge)_ - Sincronizada (implícito)

#### **3. Botão de Sincronização**
- 🔄 Ícone estático (pronto)
- 🔄 Ícone rotacionando (sincronizando)

#### **4. Badges de Recursos**
- 📷 Múltiplas fotos
- 📍 Com localização
- 📅 Data de vencimento
- 📳 Completada por shake

---

## 📊 **API REST (Backend)**

### **Endpoints Disponíveis**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/tasks` | Listar tarefas |
| `GET` | `/api/tasks/:id` | Buscar tarefa |
| `POST` | `/api/tasks` | Criar tarefa |
| `PUT` | `/api/tasks/:id` | Atualizar tarefa |
| `DELETE` | `/api/tasks/:id` | Deletar tarefa |
| `GET` | `/api/stats` | Estatísticas |

### **Exemplos de Uso**

**Listar tarefas (sync incremental):**
```bash
GET /api/tasks?modifiedSince=1702500000000
```

**Criar tarefa:**
```bash
POST /api/tasks
Content-Type: application/json

{
  "title": "Nova tarefa",
  "description": "Descrição",
  "priority": "high"
}
```

**Atualizar (com controle de versão):**
```bash
PUT /api/tasks/abc123
Content-Type: application/json

{
  "title": "Título atualizado",
  "version": 2
}
```

**Resposta de conflito:**
```json
{
  "success": false,
  "error": "CONFLICT",
  "message": "Conflito detectado - versão desatualizada",
  "serverTask": { ... }
}
```

---

## 🔍 **Console Logs**

Durante a execução, você verá logs informativos:

```
✅ SQLite Web inicializado
✅ CameraService: 1 câmera(s) encontrada(s)
📡 ConnectivityService inicializado
🔄 SyncEngine inicializado
📱 Detecção de shake iniciada

🔴 Offline                              # Sem conexão
🟢 Online                               # Conectado
🔄 Conexão restaurada - iniciando sync # Reconectou

🔄 Iniciando sincronização...
📤 Enviando 3 tarefas pendentes...
📥 Recebidas 2 tarefas do servidor
✅ Sync concluído: 3 enviadas, 2 recebidas
```

---

## 🏗️ **Arquitetura do Sistema**

### **Fluxo de Dados**

```
┌─────────────────────────────────────────────────┐
│                  FLUTTER APP                    │
├─────────────────────────────────────────────────┤
│  UI Screens  →  DB Wrapper  →  Sync Engine     │
│                      ↓              ↓           │
│              SQLite/SharedPref  ApiClient       │
└────────────────────────┬────────────┬───────────┘
                         │            │
                    Persistência   HTTP REST
                      Local          ↓
                                ┌─────────┐
                                │ Node.js │
                                │ Backend │
                                └─────────┘
```

### **Componentes Principais**

#### **DB Wrapper** (`services/db.dart`)
```dart
// Abstrai diferença entre SQLite e SharedPreferences
static Future<Task> create(Task task) async {
  if (kIsWeb) {
    return DatabaseServiceWeb.instance.create(task);
  }
  return DatabaseService.instance.create(task);
}
```

#### **Sync Engine** (`services/sync_engine.dart`)
```dart
// Sincronização bidirecional
Future<SyncResult> sync() async {
  // 1. PUSH: Enviar tarefas pendentes
  await _pushPendingTasks();
  
  // 2. PULL: Buscar atualizações
  await _pullFromServer();
}
```

#### **Connectivity Service** (`services/connectivity_service.dart`)
```dart
// Monitora conectividade e notifica mudanças
void addListener(Function(bool) callback) {
  // Callback chamado quando muda online/offline
}
```

---

## 🎮 **Demonstração**

### **Teste 1: Criar Offline**
1. Desconectar internet
2. Criar tarefa "Comprar leite"
3. Ver badge **⏱ Pendente**
4. Reconectar
5. Badge desaparece (sincronizado!)

### **Teste 2: Shake to Complete**
1. Criar tarefa pendente
2. Fazer gesto de shake no celular
3. Selecionar tarefa para completar
4. ✅ Tarefa marcada como completa

### **Teste 3: Múltiplas Fotos**
1. Criar/editar tarefa
2. Clicar em 📷 ou 🖼️ múltiplas vezes
3. Adicionar várias fotos
4. Fotos aparecem em carrossel

### **Teste 4: Filtrar por Localização**
1. Criar tarefas com GPS
2. Menu → **Próximas**
3. Permite localização
4. Ver tarefas próximas (raio 5km)

Ver mais cenários em: [ROTEIRO_DEMONSTRACAO.md](ROTEIRO_DEMONSTRACAO.md)

---

## 🛠️ **Configuração**

### **Alterar URL do Servidor**

**Para dispositivo Android real:**
```dart
// lib/services/api_client.dart
final String baseUrl = 'http://SEU_IP:3000/api';  // Ex: 192.168.1.100
```

**Para iOS Simulator:**
```dart
final String baseUrl = 'http://localhost:3000/api';
```

### **Alterar Intervalo de Auto-Sync**
```dart
// lib/services/sync_engine.dart
startAutoSync(const Duration(seconds: 60));  // 60 segundos
```

---

## 📝 **Permissões**

### **Android (`android/app/src/main/AndroidManifest.xml`)**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.VIBRATE" />
```

### **iOS (`ios/Runner/Info.plist`)**
```xml
<key>NSCameraUsageDescription</key>
<string>Adicionar fotos às tarefas</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Localizar tarefas próximas</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Selecionar fotos da galeria</string>
```

---

## 🐛 **Troubleshooting**

### **Problema: App não conecta ao servidor**
```bash
# Verificar se servidor está rodando
curl http://localhost:3000/api/health

# Deve retornar:
{"status":"healthy","timestamp":...}
```

### **Problema: SQLite não funciona na Web**
✅ **Solução:** O app já usa SharedPreferences automaticamente na Web

### **Problema: Shake não funciona na Web**
⚠️ **Esperado:** Shake detection não funciona em navegadores

### **Problema: Fotos não aparecem na Web**
⚠️ **Limitação:** Web usa webcam (não câmera traseira)

---

## 📚 **Conceitos Acadêmicos**

Este projeto demonstra conceitos de:

- 📖 **Sistemas Distribuídos** - Sincronização de dados
- 📖 **Arquitetura Offline-First** - Local-first, eventual consistency
- 📖 **Resolução de Conflitos** - Last-Write-Wins (LWW)
- 📖 **REST APIs** - Comunicação cliente-servidor
- 📖 **Persistência de Dados** - SQLite, SharedPreferences
- 📖 **Programação Mobile** - Acesso a hardware (câmera, GPS, sensores)
- 📖 **State Management** - Gerenciamento de estado reativo
- 📖 **Clean Architecture** - Separação de responsabilidades

---

## 👨‍💻 **Desenvolvimento**

### **Comandos Úteis**

```bash
# Limpar e recompilar
flutter clean
flutter pub get

# Rodar com logs detalhados
flutter run -v

# Build para produção (Web)
flutter build web

# Build para produção (Android)
flutter build apk

# Analisar código
flutter analyze

# Formatar código
flutter format lib/
```

---

## 📖 **Referências Acadêmicas**

1. **KLEPPMANN, Martin.** *Designing Data-Intensive Applications.* O'Reilly Media, 2017.
2. **TANENBAUM, Andrew S.; VAN STEEN, Maarten.** *Distributed Systems: Principles and Paradigms.* 3rd ed. Pearson, 2017.
3. **VOGELS, Werner.** *Eventually Consistent.* Communications of the ACM, vol. 52, no. 1, 2009.
4. **FLUTTER DOCUMENTATION.** Working with SQLite. https://docs.flutter.dev/cookbook/persistence/sqlite

---

## 🤝 **Contribuindo**

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 **Licença**

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 👥 **Autores**

**Laboratório de Desenvolvimento de Aplicações Móveis e Distribuídas**  
**Curso de Engenharia de Software - PUC Minas**

---

## 🎯 **Status do Projeto**

✅ **Backend:** Servidor REST funcionando  
✅ **Frontend:** App Flutter completo  
✅ **Sincronização:** Offline-First implementado  
✅ **Hardware:** Câmera, GPS, Sensores  
✅ **UI/UX:** Indicadores visuais  
✅ **Documentação:** README + Roteiro  

**PROJETO 100% FUNCIONAL** 🎉

---


Encontrou um bug? Tem uma sugestão?  
Abra uma [issue](https://github.com/Matheusinh02/task-manager-flutter/issues) no GitHub!

---

