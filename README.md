# 📋 Task Manager Pro

Um aplicativo completo de gerenciamento de tarefas desenvolvido em Flutter, com suporte multiplataforma (Android, iOS, Web, Windows, Linux, macOS).

## ✨ Funcionalidades

### 📅 Exercício 1: Due Date
- DatePicker para seleção de data de vencimento
- Alertas visuais para tarefas vencidas
- Ordenação por data de vencimento
- Indicadores coloridos de status

### 🏷️ Exercício 2: Categorias
- 8 categorias pré-definidas (Trabalho, Pessoal, Compras, Saúde, Estudos, Finanças, Casa, Outros)
- Cada categoria com ícone e cor próprios
- Filtro por categoria
- Badges coloridos nos cards

### 🔔 Exercício 3: Notificações Locais
- Lembretes agendáveis com data e hora
- Notificações push locais
- Cancelamento automático ao completar tarefa
- Reagendamento ao desmarcar tarefa

### 📤 Exercício 4: Compartilhamento
- Compartilhamento de tarefas via apps do sistema
- Formatação rica com emojis
- Suporte a WhatsApp, Telegram, Email, etc.
- Texto formatado com todos os detalhes da tarefa

### 💾 Exercício 5: Backup/Restore
- Exportação de todas as tarefas para JSON
- Importação com validação robusta
- Relatório de erros detalhado
- Download automático no navegador (Web)

## 🎨 Recursos Adicionais

- **Material Design 3** com tema personalizado
- **Filtragem avançada** por status (todas/pendentes/concluídas) e categoria
- **Múltiplas ordenações**: data de criação, vencimento ou prioridade
- **Validação de formulários** com mensagens em português
- **Localização completa** em pt_BR
- **Estatísticas** em tempo real (total, pendentes, concluídas)
- **Níveis de prioridade** com cores (Baixa, Média, Alta, Urgente)
- **Interface responsiva** com cards personalizados
- **Armazenamento em memória** otimizado para Web

## 🛠️ Tecnologias Utilizadas

- **Flutter SDK**: ^3.10.3
- **Dart**: Linguagem de programação
- **Material Design 3**: Interface moderna

### 📦 Dependências

```yaml
dependencies:
  uuid: ^4.2.1                              # Geração de IDs únicos
  intl: ^0.20.2                            # Internacionalização e formatação
  flutter_localizations: sdk               # Localização em português
  sqflite: ^2.3.0                          # Banco de dados SQLite
  path_provider: ^2.1.1                    # Acesso a diretórios do sistema
  flutter_local_notifications: ^18.0.1     # Notificações locais
  timezone: ^0.9.2                         # Manipulação de timezones
  share_plus: ^10.1.3                      # Compartilhamento
  file_picker: ^8.1.6                      # Seleção de arquivos
```

## 🚀 Como Executar

### Pré-requisitos
- Flutter SDK instalado (versão 3.10.3 ou superior)
- Android Studio / VS Code com extensões Flutter
- Emulador ou dispositivo físico

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Matheusinh02/task-manager-flutter.git
cd task-manager-flutter
```

2. Instale as dependências:
```bash
flutter pub get
```

3. Execute o aplicativo:
```bash
# Para Web
flutter run -d chrome

# Para Android
flutter run -d android

# Para Windows
flutter run -d windows

# Para listar dispositivos disponíveis
flutter devices
```

## 📁 Estrutura do Projeto

```
lib/
├── main.dart                      # Ponto de entrada da aplicação
├── models/
│   ├── task.dart                  # Modelo de dados da tarefa
│   └── category.dart              # Modelo de categorias
├── screens/
│   ├── task_list_screen.dart     # Tela principal com lista de tarefas
│   └── task_form_screen.dart     # Formulário de criação/edição
├── services/
│   ├── database_service.dart     # Gerenciamento de dados
│   └── notification_service.dart # Serviço de notificações
└── widgets/
    └── task_card.dart            # Card customizado de tarefa
```

## 📸 Capturas de Tela

<!-- Adicione aqui screenshots do seu aplicativo -->
*Em breve: screenshots da aplicação em funcionamento*

## 🎯 Funcionalidades Detalhadas

### Gerenciamento de Tarefas
- ✅ Criar, editar, excluir e visualizar tarefas
- ✅ Marcar/desmarcar como concluída
- ✅ Campos: título, descrição, prioridade, categoria, data de vencimento, lembrete

### Sistema de Filtros
- 🔍 Filtro por status (Todas/Pendentes/Concluídas)
- 🏷️ Filtro por categoria (8 categorias disponíveis)
- 📊 Ordenação (Criação/Vencimento/Prioridade)

### Interface do Usuário
- 🎨 Cards coloridos baseados em categoria ou prioridade
- ⚠️ Indicadores visuais para tarefas vencidas
- 📊 Card de estatísticas com gradiente
- 🌈 Badges de categoria e prioridade

### Validações
- ✓ Título obrigatório (mínimo 3 caracteres)
- ✓ Descrição opcional (máximo 500 caracteres)
- ✓ Confirmação antes de excluir
- ✓ Validação de arquivo JSON na importação

## 🔐 Permissões

### Android
- Notificações locais
- Armazenamento externo (para backup)

### iOS
- Notificações push
- Acesso à biblioteca de fotos (para compartilhamento)

## 🐛 Problemas Conhecidos

- Armazenamento em memória: dados são perdidos ao recarregar a página no Web
- Notificações funcionam melhor em dispositivos móveis nativos

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um Fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Matheusinh02**
- GitHub: [@Matheusinh02](https://github.com/Matheusinh02)
- Email: matheus.pretti28@icloud.com

## 🙏 Agradecimentos

Projeto desenvolvido como parte de exercícios práticos de Flutter, implementando funcionalidades modernas e boas práticas de desenvolvimento mobile.

---

⭐ Se este projeto te ajudou, considere dar uma estrela!
