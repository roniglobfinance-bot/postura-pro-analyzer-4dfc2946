// ============================================
// SMART PERIODIZER — Regra de 1 Hora
// Gestão de carga temporal e prevenção de estase
// ============================================

export interface SessionHistory {
  session_id: string;
  created_at: string;
  duration_minutes?: number;
  integrity_result: string;
  tns: number;
  pain_delta: { pre: number; events?: number };
}

export interface PeriodizerAlert {
  type: 'ONE_HOUR_RULE' | 'OVERTRAINING' | 'VOLUME_HIGH' | 'REST_NEEDED' | 'DISC_DEHYDRATION';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommendation: string;
}

export interface PeriodizerResult {
  alerts: PeriodizerAlert[];
  recommended_duration_minutes: number;
  micro_pause_interval_minutes: number;
  volume_adjustment_percent: number;
  session_ready: boolean;
}

/**
 * Regra de 1 Hora: Treinos > 60min sem pausa de movimento
 * aumentam risco de estase e desidratação discal
 */
export function analyzeSessionReadiness(
  recentSessions: SessionHistory[],
  currentPainLevel: number
): PeriodizerResult {
  const alerts: PeriodizerAlert[] = [];
  let recommendedDuration = 60;
  let microPauseInterval = 20;
  let volumeAdjustment = 0;
  let sessionReady = true;

  // Sort by most recent
  const sorted = [...recentSessions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Check last session
  const lastSession = sorted[0];
  if (lastSession) {
    const hoursSinceLastSession = (Date.now() - new Date(lastSession.created_at).getTime()) / (1000 * 60 * 60);

    // Less than 24h since last session
    if (hoursSinceLastSession < 24) {
      alerts.push({
        type: 'REST_NEEDED',
        severity: 'warning',
        message: `Última sessão há ${Math.round(hoursSinceLastSession)}h — Descanso insuficiente`,
        recommendation: 'Considere sessão de mobilidade ou recuperação ativa em vez de treino completo.'
      });
      volumeAdjustment = -20;
      recommendedDuration = 45;
    }

    // Last session was a fail
    if (lastSession.integrity_result === 'fail') {
      alerts.push({
        type: 'OVERTRAINING',
        severity: 'warning',
        message: 'Última sessão teve FAIL — Risco de sobrecarga',
        recommendation: 'Reduzir volume em 30%. Priorizar mobilidade e estabilidade.'
      });
      volumeAdjustment = Math.min(volumeAdjustment, -30);
      recommendedDuration = 40;
    }

    // High TNS in last session
    if (lastSession.tns > 70) {
      alerts.push({
        type: 'OVERTRAINING',
        severity: 'warning',
        message: `TNS da última sessão: ${lastSession.tns} — Fadiga neuromuscular elevada`,
        recommendation: 'Reduzir intensidade. Incluir mobilidade articular e respiração.'
      });
      volumeAdjustment = Math.min(volumeAdjustment, -25);
    }
  }

  // Check frequency — more than 5 sessions in last 7 days
  const lastWeek = sorted.filter(s => {
    const days = (Date.now() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 7;
  });

  if (lastWeek.length >= 5) {
    alerts.push({
      type: 'VOLUME_HIGH',
      severity: 'warning',
      message: `${lastWeek.length} sessões nos últimos 7 dias — Volume semanal elevado`,
      recommendation: 'Aplicar dia de recuperação ativa ou descanso completo.'
    });
    volumeAdjustment = Math.min(volumeAdjustment, -20);
  }

  // 1-Hour Rule
  alerts.push({
    type: 'ONE_HOUR_RULE',
    severity: 'info',
    message: `Duração recomendada: ${recommendedDuration}min com micro-pausa a cada ${microPauseInterval}min`,
    recommendation: 'Regra de 1 Hora: treinos > 60min sem pausa aumentam risco de estase e desidratação discal. Incluir micro-pausas de mobilidade.'
  });

  // Disc dehydration risk
  if (recommendedDuration > 50 && currentPainLevel >= 2) {
    alerts.push({
      type: 'DISC_DEHYDRATION',
      severity: 'warning',
      message: 'Risco de desidratação discal — Dor presente + duração longa',
      recommendation: 'Incluir Cat-Cow a cada 20min. Evitar posição sentada prolongada pós-treino.'
    });
    microPauseInterval = 15;
  }

  // Current pain blocks session
  if (currentPainLevel >= 7) {
    sessionReady = false;
    alerts.push({
      type: 'OVERTRAINING',
      severity: 'critical',
      message: '🔴 Dor atual ≥ 7/10 — Sessão BLOQUEADA',
      recommendation: 'Não iniciar sessão. Protocolo de alívio e descompressão apenas.'
    });
  }

  return {
    alerts,
    recommended_duration_minutes: recommendedDuration,
    micro_pause_interval_minutes: microPauseInterval,
    volume_adjustment_percent: volumeAdjustment,
    session_ready: sessionReady
  };
}
