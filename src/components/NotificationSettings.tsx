import { useState, useEffect } from "react";
import { useNotifications } from "@/services/notificationService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function NotificationSettings() {
  const {
    requestPermission,
    isEnabled,
    getStatus,
    clearAll
  } = useNotifications();

  const [status, setStatus] = useState(getStatus());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Atualizar status periodicamente
    const interval = setInterval(() => {
      setStatus(getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, [getStatus]);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        toast.success("Notificações ativadas com sucesso!");
      } else {
        toast.error("Permissão para notificações negada");
      }
    } catch (error) {
      toast.error("Erro ao ativar notificações");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await clearAll();
      toast.success("Todas as notificações foram canceladas");
    } catch (error) {
      toast.error("Erro ao cancelar notificações");
    }
  };

  const handleTestNotification = () => {
    if (!status.enabled) {
      toast.error("Ative as notificações primeiro");
      return;
    }

    // Notificação imediata
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification('🧪 Teste Imediato - FlowTech', {
          body: 'Esta é uma notificação de teste imediata!',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'test-immediate',
          requireInteraction: false
        });
      });
    }

    // Notificação em 1 minuto
    setTimeout(() => {
      if ('serviceWorker' in navigator && 'Notification' in window) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification('⏰ Teste 1 Minuto - FlowTech', {
            body: 'Esta notificação foi agendada para 1 minuto! O sistema está funcionando.',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: 'test-1-minute',
            requireInteraction: true,
            actions: [
              {
                action: 'success',
                title: '✅ Funcionou!'
              },
              {
                action: 'dismiss',
                title: 'Fechar'
              }
            ],
            data: {
              type: 'test-notification',
              timestamp: new Date().toISOString()
            }
          });
        });
      }
    }, 60000); // 1 minuto = 60000ms

    toast.success("Teste iniciado! Você receberá 2 notificações: uma imediata e outra em 1 minuto.");
  };

  const getStatusBadge = () => {
    if (!status.supported) {
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Não Suportado</Badge>;
    }
    
    if (status.permission === 'denied') {
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Negado</Badge>;
    }
    
    if (status.permission === 'granted' && status.serviceWorkerReady) {
      return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" />Ativo</Badge>;
    }
    
    if (status.permission === 'default') {
      return <Badge variant="secondary" className="gap-1"><AlertTriangle className="h-3 w-3" />Pendente</Badge>;
    }
    
    return <Badge variant="outline" className="gap-1"><AlertTriangle className="h-3 w-3" />Configurando</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações PWA
        </CardTitle>
        <CardDescription>
          Configure notificações para receber lembretes de pagamentos mesmo com o app fechado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Status atual */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="font-medium">Status das Notificações</div>
            <div className="text-sm text-muted-foreground">
              {status.enabled ? "Você receberá notificações de pagamentos" : "Notificações desabilitadas"}
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Informações técnicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Suporte do Navegador</div>
            <div className="flex items-center gap-2">
              {status.supported ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">
                {status.supported ? "Suportado" : "Não suportado"}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Service Worker</div>
            <div className="flex items-center gap-2">
              {status.serviceWorkerReady ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">
                {status.serviceWorkerReady ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        </div>

        {/* Funcionalidades */}
        <div className="space-y-4">
          <div className="text-sm font-medium">Funcionalidades Disponíveis:</div>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Lembretes de pagamentos (1 dia antes do vencimento)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Alertas de pagamentos em atraso</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Confirmações de pagamentos recebidos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Notificações mesmo com app fechado</span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!status.enabled ? (
            <Button 
              onClick={handleEnableNotifications}
              disabled={isLoading || !status.supported}
              className="gap-2"
            >
              <Bell className="h-4 w-4" />
              {isLoading ? "Ativando..." : "Ativar Notificações"}
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleTestNotification} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Bell className="h-4 w-4" />
                Testar Notificações (1min)
              </Button>
              <Button variant="outline" onClick={handleClearNotifications} className="gap-2">
                <BellOff className="h-4 w-4" />
                Limpar Notificações
              </Button>
            </div>
          )}
        </div>

        {/* Instruções */}
        {!status.supported && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="text-sm">
              <strong>Navegador não suportado:</strong> Para receber notificações, use Chrome, Firefox, Safari ou Edge atualizado.
            </div>
          </div>
        )}

        {status.permission === 'denied' && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-sm">
              <strong>Permissão negada:</strong> Para ativar notificações, vá nas configurações do navegador e permita notificações para este site.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
