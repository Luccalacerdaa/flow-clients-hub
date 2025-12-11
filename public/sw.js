// Service Worker para FlowTech Systems
// Versão 1.0.0

const CACHE_NAME = 'flowtech-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/asddds.png'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna do cache se disponível, senão busca na rede
        return response || fetch(event.request);
      }
    )
  );
});

// ============================================================================
// SISTEMA DE NOTIFICAÇÕES DE PAGAMENTOS
// ============================================================================

// Escutar mensagens do app principal
self.addEventListener('message', (event) => {
  console.log('Service Worker: Mensagem recebida:', event.data);
  
  if (event.data && event.data.type === 'SCHEDULE_PAYMENT_NOTIFICATION') {
    schedulePaymentNotification(event.data.payload);
  }
  
  if (event.data && event.data.type === 'CHECK_OVERDUE_PAYMENTS') {
    checkOverduePayments();
  }
});

// Agendar notificação de pagamento
function schedulePaymentNotification(paymentData) {
  const { clientName, amount, dueDate, subscriptionId } = paymentData;
  
  // Calcular quando mostrar a notificação (1 dia antes do vencimento)
  const dueDateTime = new Date(dueDate);
  const notificationTime = new Date(dueDateTime.getTime() - 24 * 60 * 60 * 1000); // 1 dia antes
  const now = new Date();
  
  if (notificationTime > now) {
    const delay = notificationTime.getTime() - now.getTime();
    
    setTimeout(() => {
      showPaymentReminderNotification(clientName, amount, dueDate);
    }, delay);
    
    console.log(`Notificação agendada para ${clientName} em ${notificationTime}`);
  }
}

// Mostrar notificação de lembrete de pagamento
function showPaymentReminderNotification(clientName, amount, dueDate) {
  const options = {
    body: `Pagamento de R$ ${amount.toFixed(2)} vence amanhã (${new Date(dueDate).toLocaleDateString('pt-BR')})`,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: `payment-reminder-${clientName}`,
    requireInteraction: true,
    actions: [
      {
        action: 'mark-paid',
        title: 'Marcar como Pago'
      },
      {
        action: 'view-client',
        title: 'Ver Cliente'
      }
    ],
    data: {
      clientName,
      amount,
      dueDate,
      type: 'payment-reminder'
    }
  };

  self.registration.showNotification(
    `💰 Pagamento Próximo - ${clientName}`,
    options
  );
}

// Verificar pagamentos em atraso
function checkOverduePayments() {
  // Esta função será chamada periodicamente pelo app
  // Para verificar pagamentos em atraso e mostrar notificações
  console.log('Service Worker: Verificando pagamentos em atraso...');
  
  // Solicitar dados do app principal
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'REQUEST_OVERDUE_PAYMENTS'
      });
    });
  });
}

// Receber dados de pagamentos em atraso do app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'OVERDUE_PAYMENTS_DATA') {
    const overduePayments = event.data.payments;
    
    if (overduePayments.length > 0) {
      showOverduePaymentsNotification(overduePayments);
    }
  }
});

// Mostrar notificação de pagamentos em atraso
function showOverduePaymentsNotification(overduePayments) {
  const count = overduePayments.length;
  const totalAmount = overduePayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  const options = {
    body: `${count} pagamento(s) em atraso totalizando R$ ${totalAmount.toFixed(2)}`,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'overdue-payments',
    requireInteraction: true,
    actions: [
      {
        action: 'view-overdue',
        title: 'Ver Atrasados'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ],
    data: {
      overduePayments,
      type: 'overdue-payments'
    }
  };

  self.registration.showNotification(
    `⚠️ Pagamentos em Atraso (${count})`,
    options
  );
}

// Lidar com cliques nas notificações
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event.notification.tag, event.action);
  
  event.notification.close();
  
  const data = event.notification.data;
  
  // Abrir ou focar na janela do app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Se já tem uma janela aberta, focar nela
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Senão, abrir nova janela
      if (clients.openWindow) {
        let url = '/';
        
        // Definir URL baseada na ação
        if (event.action === 'view-client' && data.clientName) {
          // Aqui você pode navegar para o cliente específico
          url = '/clients'; // ou `/clients/${clientId}` se tiver o ID
        } else if (event.action === 'view-overdue') {
          url = '/subscriptions?filter=overdue';
        } else if (event.action === 'mark-paid') {
          // Enviar mensagem para o app marcar como pago
          url = '/subscriptions';
        }
        
        return clients.openWindow(url);
      }
    })
  );
  
  // Enviar ação para o app principal
  if (event.action === 'mark-paid') {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'MARK_PAYMENT_AS_PAID',
          data: data
        });
      });
    });
  }
});

// Verificação periódica de pagamentos (a cada hora quando o app está fechado)
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-payments') {
    event.waitUntil(checkOverduePayments());
  }
});

// Background Sync para quando voltar online
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'payment-sync') {
    event.waitUntil(syncPendingPayments());
  }
});

// Sincronizar pagamentos pendentes
async function syncPendingPayments() {
  try {
    // Aqui você pode implementar lógica para sincronizar
    // pagamentos que foram marcados como pagos offline
    console.log('Sincronizando pagamentos pendentes...');
  } catch (error) {
    console.error('Erro ao sincronizar pagamentos:', error);
  }
}

// Push notifications (para futuro uso com servidor)
self.addEventListener('push', (event) => {
  console.log('Push notification recebida:', event);
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'push-notification',
      data: data.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

console.log('Service Worker: FlowTech Systems carregado com sucesso!');
