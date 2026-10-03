import React from 'react';
import type { DashboardSummary } from '../types';
import {
  FlaskConical,
  Activity,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

interface MetricsSummaryProps {
  summary: DashboardSummary | null;
  totalSamples: number;
}

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({ summary, totalSamples }) => {
  const received = summary?.RECEIVED ?? 0;
  const inProgress = summary?.IN_PROGRESS ?? 0;
  const completed = summary?.COMPLETED ?? 0;
  const atRisk = summary?.slaAtRisk ?? 0;
  const breached = summary?.slaBreached ?? 0;
  const openExceptions = summary?.OPEN ?? 0;

  return (
    <div className="metrics-grid">
      {/* Total Specimens */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Total Specimens</span>
          <div className="kpi-icon icon-blue">
            <FlaskConical size={20} />
          </div>
        </div>
        <div className="kpi-body">
          <span className="kpi-value">{totalSamples}</span>
          <div className="kpi-badge pill-blue">
            <span>{received} New Received</span>
          </div>
        </div>
      </div>

      {/* Active Operations */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Active Testing</span>
          <div className="kpi-icon icon-indigo">
            <Activity size={20} />
          </div>
        </div>
        <div className="kpi-body">
          <span className="kpi-value">{inProgress}</span>
          <div className="kpi-subtext">
            <span className="text-emerald"><CheckCircle2 size={13} className="inline-icon" /> {completed} Completed</span>
          </div>
        </div>
      </div>

      {/* SLA Monitor */}
      <div className={`kpi-card ${breached > 0 ? 'kpi-border-red' : atRisk > 0 ? 'kpi-border-amber' : ''}`}>
        <div className="kpi-header">
          <span className="kpi-title">SLA Status Risk</span>
          <div className={`kpi-icon ${breached > 0 ? 'icon-red' : 'icon-amber'}`}>
            <AlertTriangle size={20} />
          </div>
        </div>
        <div className="kpi-body">
          <span className="kpi-value">{atRisk + breached}</span>
          <div className="kpi-pills">
            {atRisk > 0 && <span className="pill-amber">{atRisk} At Risk</span>}
            {breached > 0 && <span className="pill-red">{breached} Breached</span>}
            {atRisk === 0 && breached === 0 && <span className="pill-emerald">All SLAs Safe</span>}
          </div>
        </div>
      </div>

      {/* Exceptions */}
      <div className={`kpi-card ${openExceptions > 0 ? 'kpi-border-rose' : ''}`}>
        <div className="kpi-header">
          <span className="kpi-title">Open Exceptions</span>
          <div className="kpi-icon icon-rose">
            <ShieldAlert size={20} />
          </div>
        </div>
        <div className="kpi-body">
          <span className="kpi-value">{openExceptions}</span>
          <div className="kpi-subtext">
            {openExceptions > 0 ? (
              <span className="text-rose">Action Required</span>
            ) : (
              <span className="text-muted">No Open Bottlenecks</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
