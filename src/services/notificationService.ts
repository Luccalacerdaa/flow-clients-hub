// Serviço de Notificações PWA
// FlowTech Systems

export interface PaymentNotificationData {
  clientName: string;
  amount: number;
  dueDate: string;
  subscriptionId: string;
  clientId: string;
}

export interface OverduePayment {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = false;
  private isPermissionGranted: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    // Verificar suporte a Service Workers e Notifications
    this.isSupported = 'serviceWorker' in navigator && 'Notification' in window;
    
    if (!this.isSupported) {
      console.warn('Notificações PWA não são suportadas neste navegador');
      return;
    }

    // Registrar Service Worker
    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', this.swRegistration);
      
      // Escutar mensagens do Service Worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
      
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  }

  // Solicitar permissão para notificações
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    if (Notification.permission === 'granted') {
      this.isPermissionGranted = true;
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Permissão para notificações foi negada pelo usuário');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.isPermissionGranted = permission === 'granted';
      
      if (this.isPermissionGranted) {
        console.log('Permissão para notificações concedida');
        // Mostrar notificação de boas-vindas
        this.showWelcomeNotification();
      } else {
        console.warn('Permissão para notificações negada');
      }
      
      return this.isPermissionGranted;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  }

  // Mostrar notificação de boas-vindas
  private showWelcomeNotification() {
    if (!this.swRegistration) return;

    this.swRegistration.showNotification('🎉 Notificações Ativadas!', {
      body: 'Você receberá lembretes de pagamentos e alertas importantes.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'welcome-notification',
      requireInteraction: false,
      silent: false
    });
  }

  // Agendar notificação de pagamento
  schedulePaymentNotification(paymentData: PaymentNotificationData) {
    if (!this.isPermissionGranted || !this.swRegistration) {
      console.warn('Notificações não estão disponíveis');
      return;
    }

    // Enviar dados para o Service Worker
    navigator.serviceWorker.controller?.postMessage({
      type: 'SCHEDULE_PAYMENT_NOTIFICATION',
      payload: paymentData
    });

    console.log('Notificação de pagamento agendada:', paymentData);
  }

  // Agendar múltiplas notificações de pagamento
  scheduleMultiplePaymentNotifications(payments: PaymentNotificationData[]) {
    payments.forEach(payment => {
      this.schedulePaymentNotification(payment);
    });
  }

  // Verificar pagamentos em atraso
  checkOverduePayments(overduePayments: OverduePayment[]) {
    if (!this.isPermissionGranted || !this.swRegistration) {
      return;
    }

    // Enviar dados para o Service Worker
    navigator.serviceWorker.controller?.postMessage({
      type: 'OVERDUE_PAYMENTS_DATA',
      payments: overduePayments
    });
  }

  // Mostrar notificação imediata
  showImmediateNotification(title: string, body: string, tag?: string) {
    if (!this.isPermissionGranted || !this.swRegistration) {
      return;
    }

    this.swRegistration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: tag || 'immediate-notification',
      requireInteraction: false
    });
  }

  // Mostrar notificação de pagamento recebido
  showPaymentReceivedNotification(clientName: string, amount: number) {
    this.showImmediateNotification(
      '💰 Pagamento Recebido!',
      `${clientName} - R$ ${amount.toFixed(2)}`,
      'payment-received'
    );
  }

  // Mostrar notificação de novo cliente
  showNewClientNotification(clientName: string) {
    this.showImmediateNotification(
      '👤 Novo Cliente Cadastrado!',
      `${clientName} foi adicionado ao sistema`,
      'new-client'
    );
  }

  // Lidar com mensagens do Service Worker
  private handleServiceWorkerMessage(event: MessageEvent) {
    const { type, data } = event.data;

    switch (type) {
      case 'REQUEST_OVERDUE_PAYMENTS':
        // O Service Worker está solicitando dados de pagamentos em atraso
        this.requestOverduePaymentsFromApp();
        break;
        
      case 'MARK_PAYMENT_AS_PAID':
        // O usuário clicou para marcar como pago na notificação
        this.handleMarkAsPaidFromNotification(data);
        break;
        
      default:
        console.log('Mensagem do Service Worker não reconhecida:', type);
    }
  }

  // Solicitar pagamentos em atraso do app
  private requestOverduePaymentsFromApp() {
    // Disparar evento customizado para o app buscar pagamentos em atraso
    window.dispatchEvent(new CustomEvent('request-overdue-payments'));
  }

  // Lidar com marcar como pago via notificação
  private handleMarkAsPaidFromNotification(data: any) {
    // Disparar evento customizado para o app marcar como pago
    window.dispatchEvent(new CustomEvent('mark-payment-paid-from-notification', {
      detail: data
    }));
  }

  // Verificar se notificações estão habilitadas
  isNotificationEnabled(): boolean {
    return this.isSupported && this.isPermissionGranted;
  }

  // Obter status das notificações
  getNotificationStatus() {
    return {
      supported: this.isSupported,
      permission: Notification.permission,
      enabled: this.isPermissionGranted,
      serviceWorkerReady: !!this.swRegistration
    };
  }

  // Cancelar todas as notificações
  async clearAllNotifications() {
    if (!this.swRegistration) return;

    try {
      const notifications = await this.swRegistration.getNotifications();
      notifications.forEach(notification => notification.close());
      console.log(`${notifications.length} notificações canceladas`);
    } catch (error) {
      console.error('Erro ao cancelar notificações:', error);
    }
  }

  // Registrar background sync para quando voltar online
  registerBackgroundSync(tag: string) {
    if (!this.swRegistration || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      return;
    }

    this.swRegistration.sync.register(tag).catch(error => {
      console.error('Erro ao registrar background sync:', error);
    });
  }
}

// Instância singleton
export const notificationService = new NotificationService();

// Hook para React
export function useNotifications() {
  const requestPermission = () => notificationService.requestPermission();
  const schedulePaymentNotification = (data: PaymentNotificationData) => 
    notificationService.schedulePaymentNotification(data);
  const checkOverduePayments = (payments: OverduePayment[]) => 
    notificationService.checkOverduePayments(payments);
  const showPaymentReceived = (clientName: string, amount: number) => 
    notificationService.showPaymentReceivedNotification(clientName, amount);
  const showNewClient = (clientName: string) => 
    notificationService.showNewClientNotification(clientName);
  const isEnabled = () => notificationService.isNotificationEnabled();
  const getStatus = () => notificationService.getNotificationStatus();
  const clearAll = () => notificationService.clearAllNotifications();

  return {
    requestPermission,
    schedulePaymentNotification,
    checkOverduePayments,
    showPaymentReceived,
    showNewClient,
    isEnabled,
    getStatus,
    clearAll
  };
}
