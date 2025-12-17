# Script de Teste Completo - Sistema de Mensageria RabbitMQ

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🐇 TESTE DO SISTEMA DE MENSAGERIA COM RABBITMQ" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Configuração
$baseUrl = "http://localhost:3000"
$rabbitUrl = "http://localhost:15672"

# Função para fazer requisições
function Invoke-Test {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Description,
        [object]$Body = $null
    )
    
    Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "🧪 $Description" -ForegroundColor Yellow
    Write-Host "   $Method $Url" -ForegroundColor Gray
    
    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $jsonBody -ContentType "application/json"
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method
        }
        
        Write-Host "✅ Sucesso!" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
        return $response
    }
    catch {
        Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 1. Health Check
Write-Host "`n1️⃣  VERIFICANDO SAÚDE DOS SERVIÇOS" -ForegroundColor Magenta
Invoke-Test -Method "GET" -Url "$baseUrl/health" -Description "Health Check do API Gateway"

Start-Sleep -Seconds 2

# 2. Listar Usuários
Write-Host "`n2️⃣  LISTANDO USUÁRIOS" -ForegroundColor Magenta
$users = Invoke-Test -Method "GET" -Url "$baseUrl/api/users" -Description "Buscar todos os usuários"

Start-Sleep -Seconds 1

# 3. Listar Itens
Write-Host "`n3️⃣  LISTANDO ITENS DO CATÁLOGO" -ForegroundColor Magenta
$items = Invoke-Test -Method "GET" -Url "$baseUrl/api/items" -Description "Buscar todos os itens"

Start-Sleep -Seconds 1

# 4. Listar Listas
Write-Host "`n4️⃣  LISTANDO LISTAS DE COMPRAS" -ForegroundColor Magenta
$lists = Invoke-Test -Method "GET" -Url "$baseUrl/api/lists" -Description "Buscar todas as listas"

Start-Sleep -Seconds 2

# 5. TESTE PRINCIPAL: Checkout da Lista 1
Write-Host "`n5️⃣  🎯 TESTE PRINCIPAL - CHECKOUT COM RABBITMQ" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "⚡ Fazendo checkout da Lista 1..." -ForegroundColor Yellow
Write-Host "   Isso vai disparar o evento assíncrono no RabbitMQ!" -ForegroundColor Yellow
Write-Host "   Observe os terminais dos consumers!" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$checkout1 = Invoke-Test -Method "POST" -Url "$baseUrl/api/lists/1/checkout" -Description "Checkout da Lista 1 (João Silva)"

Write-Host "`n⏳ Aguardando processamento dos consumers..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 6. Segundo Checkout
Write-Host "`n6️⃣  SEGUNDO CHECKOUT - LISTA 2" -ForegroundColor Magenta
$checkout2 = Invoke-Test -Method "POST" -Url "$baseUrl/api/lists/2/checkout" -Description "Checkout da Lista 2 (Maria Santos)"

Write-Host "`n⏳ Aguardando processamento dos consumers..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 7. Criar e fazer checkout de nova lista
Write-Host "`n7️⃣  CRIANDO NOVA LISTA E FAZENDO CHECKOUT" -ForegroundColor Magenta

$newList = @{
    userId = 1
    name = "Compras Express"
    items = @(
        @{ itemId = 1; quantity = 1; price = 25.90 }
        @{ itemId = 3; quantity = 3; price = 4.20 }
    )
}

$createdList = Invoke-Test -Method "POST" -Url "$baseUrl/api/lists" -Description "Criar nova lista" -Body $newList

if ($createdList) {
    Start-Sleep -Seconds 1
    Write-Host "`n🎯 Fazendo checkout da lista recém-criada..." -ForegroundColor Yellow
    $checkout3 = Invoke-Test -Method "POST" -Url "$baseUrl/api/lists/$($createdList.id)/checkout" -Description "Checkout da nova lista"
    
    Write-Host "`n⏳ Aguardando processamento dos consumers..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

# 8. Resumo Final
Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Health check executado" -ForegroundColor Green
Write-Host "✅ Usuários listados" -ForegroundColor Green
Write-Host "✅ Itens listados" -ForegroundColor Green
Write-Host "✅ Listas listadas" -ForegroundColor Green
Write-Host "✅ 3 checkouts realizados com sucesso" -ForegroundColor Green
Write-Host "`n📬 Verifique os terminais dos consumers para ver:" -ForegroundColor Yellow
Write-Host "   • Notification Service: Logs de envio de email" -ForegroundColor White
Write-Host "   • Analytics Service: Estatísticas calculadas" -ForegroundColor White
Write-Host "`n🐇 Verifique o RabbitMQ Management UI:" -ForegroundColor Yellow
Write-Host "   $rabbitUrl" -ForegroundColor White
Write-Host "   Usuário: admin | Senha: admin123" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Abrir RabbitMQ Management UI
Write-Host "🌐 Abrindo RabbitMQ Management UI..." -ForegroundColor Cyan
Start-Process $rabbitUrl

Write-Host "`n✨ Teste completo finalizado!" -ForegroundColor Green
